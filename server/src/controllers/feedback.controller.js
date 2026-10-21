import { z } from 'zod';
import { pool } from '../config/db.js';

const teks = z.string().trim().max(1000).optional().default('');

const schema = z.object({
    review_id: z.coerce.number().int(),
    ai_accuracy: z.coerce.number().int().min(1, 'Pilih penilaian 1-5').max(5),
    most_helpful: teks,
    most_difficult: teks,
    would_change: teks,
});

export async function saveFeedback(req, res) {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const f = parsed.data;

    const [rv] = await pool.query(
        `SELECT r.review_id FROM ai_reviews r JOIN portfolios p ON p.portfolio_id = r.portfolio_id
      WHERE r.review_id = ? AND p.user_id = ?`,
        [f.review_id, req.user.id]
    );
    if (!rv[0]) return res.status(404).json({ message: 'Reviu tidak ditemukan' });

    const [ada] = await pool.query(
        "SELECT feedback_id FROM user_feedback WHERE user_id = ? AND review_id = ? AND tested_feature = 'hasil_reviu'",
        [req.user.id, f.review_id]
    );

    if (ada[0]) {
        await pool.query(
            `UPDATE user_feedback SET ai_accuracy = ?, most_helpful = ?, most_difficult = ?, would_change = ?
        WHERE feedback_id = ?`,
            [f.ai_accuracy, f.most_helpful, f.most_difficult, f.would_change, ada[0].feedback_id]
        );
    } else {
        await pool.query(
            `INSERT INTO user_feedback
         (user_id, review_id, tested_feature, most_helpful, most_difficult, would_change, ai_accuracy)
       VALUES (?, ?, 'hasil_reviu', ?, ?, ?, ?)`,
            [req.user.id, f.review_id, f.most_helpful, f.most_difficult, f.would_change, f.ai_accuracy]
        );
    }
    res.status(201).json({ message: 'Terima kasih atas masukan Anda' });
}

export async function getMyFeedback(req, res) {
    const reviewId = Number(req.params.reviewId);
    if (!Number.isInteger(reviewId)) return res.status(400).json({ message: 'ID tidak valid' });

    const [rows] = await pool.query(
        `SELECT ai_accuracy, most_helpful, most_difficult, would_change
       FROM user_feedback
      WHERE user_id = ? AND review_id = ? AND tested_feature = 'hasil_reviu'`,
        [req.user.id, reviewId]
    );
    res.json({ feedback: rows[0] || null });
}