import { pool } from '../config/db.js';

const BATAS = 200;
const like = (s) => `%${String(s).replace(/[\\%_]/g, '\\$&')}%`;

function bacaFilter(req) {
    const q = String(req.query.q || '').trim().slice(0, 100);
    const r = Number(req.query.rating);
    const rating = Number.isInteger(r) && r >= 1 && r <= 5 ? r : 0;
    return { q, rating };
}

async function ambilFeedback({ q, rating }) {
    const [rows] = await pool.query(
        `SELECT f.feedback_id, f.created_at, f.ai_accuracy, f.most_helpful, f.most_difficult, f.would_change,
            u.full_name, u.user_type, tr.role_name, r.overall_score
       FROM user_feedback f
       JOIN users u ON u.user_id = f.user_id
       LEFT JOIN ai_reviews r ON r.review_id = f.review_id
       LEFT JOIN portfolios p ON p.portfolio_id = r.portfolio_id
       LEFT JOIN target_roles tr ON tr.role_id = p.role_id
      WHERE (? = '' OR CONCAT_WS(' ', u.full_name, f.most_helpful, f.most_difficult, f.would_change) LIKE ?)
        AND (? = 0 OR f.ai_accuracy = ?)
      ORDER BY f.created_at DESC
      LIMIT ${BATAS}`,
        [q, like(q), rating, rating]
    );
    return rows;
}

export async function summary(req, res) {
    const [[u]] = await pool.query(
        `SELECT COUNT(*) AS total,
            COALESCE(SUM(user_type = 'fresh_graduate'), 0) AS fresh,
            COALESCE(SUM(user_type = 'anak_magang'), 0) AS magang
       FROM users WHERE user_type IN ('fresh_graduate', 'anak_magang')`
    );
    const [[p]] = await pool.query('SELECT COUNT(*) AS total FROM portfolios');
    const [[r]] = await pool.query(
        `SELECT COALESCE(SUM(status = 'done'), 0) AS selesai,
            COALESCE(SUM(status = 'failed'), 0) AS gagal,
            COALESCE(SUM(status = 'processing'), 0) AS berjalan,
            ROUND(AVG(CASE WHEN status = 'done' THEN overall_score END), 1) AS rata_skor
       FROM ai_reviews`
    );
    const [[f]] = await pool.query(
        'SELECT COUNT(*) AS total, ROUND(AVG(ai_accuracy), 1) AS akurasi FROM user_feedback'
    );
    const [sebaran] = await pool.query(
        `SELECT ai_accuracy AS nilai, COUNT(*) AS jumlah FROM user_feedback
      WHERE ai_accuracy IS NOT NULL GROUP BY ai_accuracy ORDER BY ai_accuracy`
    );
    const [model] = await pool.query(
        `SELECT COALESCE(model_name, '-') AS nama, COUNT(*) AS jumlah FROM ai_reviews
      WHERE status = 'done' GROUP BY model_name ORDER BY jumlah DESC`
    );
    const [peran] = await pool.query(
        `SELECT tr.role_name AS nama, COUNT(*) AS jumlah
       FROM portfolios p JOIN target_roles tr ON tr.role_id = p.role_id
      GROUP BY tr.role_id ORDER BY jumlah DESC LIMIT 5`
    );

    res.json({
        pengguna: { total: Number(u.total), fresh: Number(u.fresh), magang: Number(u.magang) },
        portofolio: Number(p.total),
        reviu: {
            selesai: Number(r.selesai), gagal: Number(r.gagal), berjalan: Number(r.berjalan),
            rata_skor: r.rata_skor != null ? Number(r.rata_skor) : null,
        },
        feedback: { total: Number(f.total), akurasi: f.akurasi != null ? Number(f.akurasi) : null },
        sebaran_akurasi: sebaran.map((x) => ({ nama: `Nilai ${x.nilai}`, jumlah: Number(x.jumlah) })),
        model: model.map((x) => ({ nama: x.nama, jumlah: Number(x.jumlah) })),
        peran_populer: peran.map((x) => ({ nama: x.nama, jumlah: Number(x.jumlah) })),
    });
}

export async function listFeedback(req, res) {
    res.json({ feedback: await ambilFeedback(bacaFilter(req)) });
}

// Sel yang diawali = + - @ diberi tanda kutip agar tidak dieksekusi sebagai rumus di Excel
const sel = (v) => {
    let s = String(v ?? '').replace(/\r?\n/g, ' ').trim();
    if (/^[=+\-@\t]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
};

export async function feedbackCsv(req, res) {
    const rows = await ambilFeedback(bacaFilter(req));
    const kepala = ['Tanggal', 'Status pengguna', 'Posisi dipilih', 'Skor review', 'Akurasi AI (1-5)',
        'Paling membantu', 'Paling sulit', 'Akan diubah'];

    const baris = rows.map((r) => [
        new Date(r.created_at).toISOString().slice(0, 10),
        r.user_type === 'anak_magang' ? 'Anak magang' : r.user_type === 'fresh_graduate' ? 'Fresh graduate' : r.user_type,
        r.role_name || '',
        r.overall_score != null ? Math.round(r.overall_score) : '',
        r.ai_accuracy ?? '',
        r.most_helpful, r.most_difficult, r.would_change,
    ].map(sel).join(','));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="feedback-skillbridge.csv"');
    res.send('\ufeff' + [kepala.map(sel).join(','), ...baris].join('\r\n'));
}

export async function listCustomRoles(req, res) {
    const [rows] = await pool.query(
        `SELECT r.role_id, r.role_name, r.created_at, u.full_name AS pembuat,
            (SELECT COUNT(*) FROM users x WHERE x.target_role_id = r.role_id) AS pemakai,
            (SELECT COUNT(*) FROM portfolios p WHERE p.role_id = r.role_id) AS portofolio
       FROM target_roles r LEFT JOIN users u ON u.user_id = r.created_by
      WHERE r.is_custom = 1
      ORDER BY pemakai DESC, portofolio DESC, r.created_at DESC`
    );
    res.json({ roles: rows });
}

export async function promoteRole(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'ID tidak valid' });

    const [hasil] = await pool.query(
        'UPDATE target_roles SET is_custom = 0 WHERE role_id = ? AND is_custom = 1',
        [id]
    );
    if (hasil.affectedRows === 0) return res.status(404).json({ message: 'Posisi buatan pengguna tidak ditemukan' });
    res.json({ message: 'Posisi dijadikan posisi resmi' });
}

export async function listUsers(req, res) {
    const [rows] = await pool.query(
        `SELECT u.user_id, u.full_name, u.email, u.user_type, u.created_at, tr.role_name,
            (SELECT COUNT(*) FROM portfolios p WHERE p.user_id = u.user_id) AS portofolio,
            (SELECT COUNT(*) FROM ai_reviews r JOIN portfolios p ON p.portfolio_id = r.portfolio_id
              WHERE p.user_id = u.user_id AND r.status = 'done') AS reviu
       FROM users u LEFT JOIN target_roles tr ON tr.role_id = u.target_role_id
      ORDER BY u.created_at DESC
      LIMIT ${BATAS}`
    );
    res.json({ users: rows });
}