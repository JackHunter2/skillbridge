import { pool } from '../config/db.js';

// Dicek ke database setiap permintaan, jadi pencabutan hak admin langsung berlaku
export async function requireAdmin(req, res, next) {
    const [rows] = await pool.query(
        'SELECT user_type FROM users WHERE user_id = ? AND is_active = 1',
        [req.user.id]
    );
    if (rows[0]?.user_type !== 'admin') {
        return res.status(403).json({ message: 'Akses khusus admin' });
    }
    next();
}