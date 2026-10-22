import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../config/db.js';

const profilSchema = z.object({
    full_name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120),
    user_type: z.enum(['fresh_graduate', 'anak_magang']),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, 'Password saat ini wajib diisi'),
    new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
});

export async function updateProfile(req, res) {
    const parsed = profilSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { full_name, user_type } = parsed.data;

    await pool.query(
        `UPDATE users
        SET full_name = ?,
            user_type = IF(user_type IN ('fresh_graduate', 'anak_magang'), ?, user_type)
      WHERE user_id = ?`,
        [full_name, user_type, req.user.id]
    );

    const [rows] = await pool.query(
        'SELECT user_id, full_name, email, user_type, target_role_id FROM users WHERE user_id = ?',
        [req.user.id]
    );
    res.json({ user: rows[0] });
}

export async function changePassword(req, res) {
    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { current_password, new_password } = parsed.data;

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE user_id = ?', [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(current_password, rows[0].password_hash))) {
        return res.status(400).json({ message: 'Password saat ini salah' });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hash, req.user.id]);
    res.json({ message: 'Password berhasil diubah' });
}