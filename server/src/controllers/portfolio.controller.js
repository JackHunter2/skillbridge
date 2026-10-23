import fs from 'fs/promises';
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { pool } from '../config/db.js';
import path from 'path';

const MIN_TEXT = 100;
const MAX_TEXT = 30000;
const bersih = (t) => t.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim().slice(0, MAX_TEXT);

export async function createPortfolio(req, res) {
    const hapusFile = async () => {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
    };

    const title = (req.body.title || '').trim();
    if (title.length < 3) {
        await hapusFile();
        return res.status(400).json({ message: 'Judul minimal 3 karakter' });
    }

    const [u] = await pool.query('SELECT target_role_id FROM users WHERE user_id = ?', [req.user.id]);
    const role_id = u[0]?.target_role_id;
    if (!role_id) {
        await hapusFile();
        return res.status(400).json({ message: 'Pilih peran target terlebih dahulu' });
    }

    let source_type, file_path = null, external_url = null, text = '';

    if (req.file) {
        source_type = 'file';
        file_path = req.file.filename;
        try {
            const data = await pdf(await fs.readFile(req.file.path));
            text = bersih(data.text || '');
        } catch {
            await hapusFile();
            return res.status(422).json({ message: 'File PDF tidak dapat dibaca' });
        }
    } else {
        source_type = 'link';
        external_url = (req.body.url || '').trim();
        if (!/^https?:\/\/\S+\.\S+/.test(external_url)) {
            return res.status(400).json({ message: 'Link harus diawali http:// atau https://' });
        }
        text = bersih(req.body.text || '');
    }

    if (text.length < MIN_TEXT) {
        await hapusFile();
        return res.status(422).json({
            message:
                source_type === 'file'
                    ? 'Teks di PDF terlalu sedikit. Kemungkinan PDF berupa gambar/scan. Gunakan PDF yang teksnya bisa diblok.'
                    : 'Tempel isi portofolio Anda minimal 100 karakter agar bisa dinilai AI.',
        });
    }

    const [hasil] = await pool.query(
        `INSERT INTO portfolios (user_id, role_id, title, source_type, file_path, external_url, extracted_text)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, role_id, title, source_type, file_path, external_url, text]
    );
    // PDF tidak diperlukan lagi setelah teksnya diekstrak, jadi langsung dihapus dari server
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(201).json({
        portfolio: { portfolio_id: hasil.insertId, title, source_type, text_length: text.length },
    });
}

export async function listPortfolios(req, res) {
    const [rows] = await pool.query(
        `SELECT p.portfolio_id, p.title, p.source_type, p.external_url, p.version_no, p.uploaded_at,
                CHAR_LENGTH(p.extracted_text) AS text_length,
                (p.text_purged_at IS NOT NULL) AS purged,
                DATE_ADD(
                        GREATEST(p.uploaded_at, COALESCE(
                                (SELECT MAX(r0.created_at) FROM ai_reviews r0 WHERE r0.portfolio_id = p.portfolio_id),
                                p.uploaded_at)),
                        INTERVAL 180 DAY) AS expires_at,
                (SELECT r.review_id FROM ai_reviews r
                 WHERE r.portfolio_id = p.portfolio_id AND r.status = 'done'
                 ORDER BY r.created_at DESC LIMIT 1) AS latest_review_id,
            (SELECT r.overall_score FROM ai_reviews r
              WHERE r.portfolio_id = p.portfolio_id AND r.status = 'done'
              ORDER BY r.created_at DESC LIMIT 1) AS latest_score
         FROM portfolios p
         WHERE p.user_id = ?
         ORDER BY p.uploaded_at DESC`,
        [req.user.id]
    );
    res.json({ portfolios: rows });
}

export async function reviewHistory(req, res) {
    const [rows] = await pool.query(
        `SELECT r.review_id, r.overall_score, r.created_at, p.title
       FROM ai_reviews r JOIN portfolios p ON p.portfolio_id = r.portfolio_id
      WHERE p.user_id = ? AND r.status = 'done'
      ORDER BY r.created_at DESC
      LIMIT 20`,
        [req.user.id]
    );
    res.json({ history: rows.reverse() });
}

export async function deletePortfolio(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'ID tidak valid' });

    const [pf] = await pool.query(
        'SELECT portfolio_id, file_path FROM portfolios WHERE portfolio_id = ? AND user_id = ?',
        [id, req.user.id]
    );
    if (!pf[0]) return res.status(404).json({ message: 'Portofolio tidak ditemukan' });

    const [jalan] = await pool.query(
        `SELECT review_id FROM ai_reviews
      WHERE portfolio_id = ? AND status = 'processing' AND created_at > (NOW() - INTERVAL 5 MINUTE) LIMIT 1`,
        [id]
    );
    if (jalan[0]) {
        return res.status(409).json({ message: 'Portofolio sedang direviu. Tunggu hingga selesai, lalu coba lagi.' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // roadmap menunjuk ke reviu dengan SET NULL, jadi dihapus manual agar tidak jadi data yatim
        await conn.query(
            `DELETE FROM roadmaps WHERE user_id = ?
         AND review_id IN (SELECT review_id FROM ai_reviews WHERE portfolio_id = ?)`,
            [req.user.id, id]
        );
        await conn.query('DELETE FROM portfolios WHERE portfolio_id = ? AND user_id = ?', [id, req.user.id]);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }

    if (pf[0].file_path) {
        await fs.unlink(path.join(path.resolve('uploads'), path.basename(pf[0].file_path))).catch(() => {});
    }
    res.json({ message: 'Portofolio dihapus' });
}