import { pool } from '../config/db.js';
import { generateReview } from '../services/aiReview.service.js';

export async function createReview(req, res) {
    const portfolioId = Number(req.params.id);
    if (!Number.isInteger(portfolioId)) return res.status(400).json({ message: 'ID tidak valid' });

    const [pf] = await pool.query(
        'SELECT portfolio_id, role_id, extracted_text FROM portfolios WHERE portfolio_id = ? AND user_id = ?',
        [portfolioId, req.user.id]
    );
    if (!pf[0]) return res.status(404).json({ message: 'Portofolio tidak ditemukan' });

    const [criteria] = await pool.query(
        'SELECT criteria_id, criteria_name, description, weight FROM review_criteria'
    );
    const [roleSkills] = await pool.query(
        `SELECT rs.skill_id, s.skill_name, rs.required_level, rs.importance
       FROM role_skills rs JOIN skills s ON s.skill_id = rs.skill_id
      WHERE rs.role_id = ?`,
        [pf[0].role_id]
    );
    if (roleSkills.length === 0) {
        return res.status(400).json({ message: 'Peran ini belum punya data skill. Hubungi admin.' });
    }
    const [role] = await pool.query('SELECT role_name FROM target_roles WHERE role_id = ?', [pf[0].role_id]);

    let result;
    try {
        result = await generateReview({
            roleName: role[0].role_name, criteria, roleSkills, text: pf[0].extracted_text,
        });
    } catch (err) {
        console.error('Reviu AI gagal:', err.message);
        return res.status(502).json({ message: 'Reviu AI gagal diproses. Coba lagi beberapa saat.' });
    }

    const totalBobot = criteria.reduce((a, c) => a + Number(c.weight), 0);
    const overall = criteria.reduce((a, c) => {
        const sc = result.scores.find((s) => s.criteria_id === c.criteria_id);
        return a + sc.score * Number(c.weight);
    }, 0) / totalBobot;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [rv] = await conn.query(
            `INSERT INTO ai_reviews (portfolio_id, model_name, overall_score, summary, status)
       VALUES (?, ?, ?, ?, 'done')`,
            [portfolioId, result.model, Math.round(overall * 100) / 100, result.summary]
        );
        const reviewId = rv.insertId;

        for (const s of result.scores) {
            await conn.query(
                'INSERT INTO review_scores (review_id, criteria_id, score, explanation) VALUES (?, ?, ?, ?)',
                [reviewId, s.criteria_id, s.score, s.explanation]
            );
        }
        for (const s of result.suggestions) {
            await conn.query(
                `INSERT INTO review_suggestions
           (review_id, criteria_id, section_ref, suggestion, example_before, example_after, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [reviewId, s.criteria_id ?? null, s.section_ref ?? null, s.suggestion,
                    s.example_before ?? null, s.example_after ?? null, s.priority]
            );
        }
        for (const rs of roleSkills) {
            const lv = result.skill_levels.find((x) => x.skill_id === rs.skill_id);
            await conn.query(
                'INSERT INTO skill_gaps (review_id, skill_id, current_level, required_level) VALUES (?, ?, ?, ?)',
                [reviewId, rs.skill_id, lv ? lv.current_level : 0, rs.required_level]
            );
        }

        const [rm] = await conn.query(
            `INSERT INTO roadmaps (user_id, review_id, duration_days, start_date, status)
       VALUES (?, ?, 30, CURDATE(), 'aktif')`,
            [req.user.id, reviewId]
        );
        for (const r of result.roadmap) {
            await conn.query(
                'INSERT INTO roadmap_items (roadmap_id, skill_id, week_no, title) VALUES (?, ?, ?, ?)',
                [rm.insertId, r.skill_id, r.week_no, r.title]
            );
        }

        await conn.commit();
        res.status(201).json({ review_id: reviewId, overall_score: Math.round(overall * 100) / 100 });
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function getReview(req, res) {
    const reviewId = Number(req.params.id);
    if (!Number.isInteger(reviewId)) return res.status(400).json({ message: 'ID tidak valid' });

    const [rv] = await pool.query(
        `SELECT r.review_id, r.overall_score, r.summary, r.model_name, r.created_at,
            p.portfolio_id, p.title, tr.role_name
       FROM ai_reviews r
       JOIN portfolios p ON p.portfolio_id = r.portfolio_id
       JOIN target_roles tr ON tr.role_id = p.role_id
      WHERE r.review_id = ? AND p.user_id = ?`,
        [reviewId, req.user.id]
    );
    if (!rv[0]) return res.status(404).json({ message: 'Hasil reviu tidak ditemukan' });

    const [scores] = await pool.query(
        `SELECT c.criteria_id, c.criteria_name, s.score, s.explanation
       FROM review_scores s JOIN review_criteria c ON c.criteria_id = s.criteria_id
      WHERE s.review_id = ? ORDER BY c.criteria_id`,
        [reviewId]
    );
    const [suggestions] = await pool.query(
        `SELECT s.suggestion_id, s.section_ref, s.suggestion, s.example_before, s.example_after,
            s.priority, c.criteria_name
       FROM review_suggestions s LEFT JOIN review_criteria c ON c.criteria_id = s.criteria_id
      WHERE s.review_id = ?
      ORDER BY FIELD(s.priority, 'tinggi', 'sedang', 'rendah'), s.suggestion_id`,
        [reviewId]
    );
    const [gaps] = await pool.query(
        `SELECT g.skill_id, sk.skill_name, g.current_level, g.required_level, g.gap_size
       FROM skill_gaps g JOIN skills sk ON sk.skill_id = g.skill_id
      WHERE g.review_id = ? ORDER BY g.gap_size DESC, sk.skill_name`,
        [reviewId]
    );
    const [roadmap] = await pool.query(
        `SELECT i.item_id, i.week_no, i.title, i.status, sk.skill_name
       FROM roadmaps rm
       JOIN roadmap_items i ON i.roadmap_id = rm.roadmap_id
       JOIN skills sk ON sk.skill_id = i.skill_id
      WHERE rm.review_id = ?
      ORDER BY i.week_no, i.item_id`,
        [reviewId]
    );

    res.json({ review: rv[0], scores, suggestions, gaps, roadmap });
}