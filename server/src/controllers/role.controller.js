import { z } from 'zod';
import { pool } from '../config/db.js';

const KOLOM_USER = 'user_id, full_name, email, user_type, target_role_id, avatar_path';
const ambilUser = async (id) => {
    const [rows] = await pool.query(`SELECT ${KOLOM_USER} FROM users WHERE user_id = ?`, [id]);
    return rows[0];
};

const customSchema = z.object({
    role_name: z
        .string()
        .trim()
        .min(3, 'Nama peran minimal 3 karakter')
        .max(60, 'Nama peran maksimal 60 karakter')
        .regex(/^[\p{L}\p{N} &\/().,+-]+$/u, 'Gunakan huruf, angka, dan tanda baca umum saja'),
});

export async function listRoles(req, res) {
    const [rows] = await pool.query(
        `SELECT r.role_id, r.role_name, r.field, r.description, r.is_custom,
            COUNT(rs.skill_id) AS total_skills
       FROM target_roles r
       LEFT JOIN role_skills rs ON rs.role_id = r.role_id
      WHERE r.is_active = 1 AND (r.is_custom = 0 OR r.created_by = ?)
      GROUP BY r.role_id
      ORDER BY (r.role_name = 'Umum / Lintas Bidang') DESC, r.is_custom, r.role_name`,
        [req.user.id]
    );
    res.json({ roles: rows });
}

export async function setTargetRole(req, res) {
    const role_id = Number(req.body.role_id);
    if (!Number.isInteger(role_id)) return res.status(400).json({ message: 'role_id tidak valid' });

    const [ada] = await pool.query(
        'SELECT role_id FROM target_roles WHERE role_id = ? AND is_active = 1 AND (is_custom = 0 OR created_by = ?)',
        [role_id, req.user.id]
    );
    if (ada.length === 0) return res.status(404).json({ message: 'Peran tidak ditemukan' });

    await pool.query('UPDATE users SET target_role_id = ? WHERE user_id = ?', [role_id, req.user.id]);
    res.json({ user: await ambilUser(req.user.id) });
}

export async function createCustomRole(req, res) {
    const parsed = customSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const nama = parsed.data.role_name.replace(/\s+/g, ' ');

    let roleId;
    const [ada] = await pool.query(
        'SELECT role_id, is_custom, created_by FROM target_roles WHERE role_name = ?',
        [nama]
    );

    if (ada[0]) {
        const milikSendiri = Number(ada[0].created_by) === Number(req.user.id);
        if (ada[0].is_custom && !milikSendiri) {
            return res.status(409).json({
                message: 'Nama peran itu sudah dipakai. Tambahkan detail agar lebih spesifik, misalnya "Data Scientist Kesehatan".',
            });
        }
        roleId = ada[0].role_id; // peran bawaan atau milik sendiri: dipakai langsung
    } else {
        const [jml] = await pool.query(
            'SELECT COUNT(*) AS n FROM target_roles WHERE is_custom = 1 AND created_by = ?',
            [req.user.id]
        );
        if (jml[0].n >= 5) {
            return res.status(400).json({ message: 'Batas 5 peran buatan sendiri tercapai. Pilih dari daftar yang ada.' });
        }
        const [hasil] = await pool.query(
            `INSERT INTO target_roles (role_name, field, description, is_custom, created_by)
       VALUES (?, 'lainnya', 'Peran buatan sendiri', 1, ?)`,
            [nama, req.user.id]
        );
        roleId = hasil.insertId;
    }

    await pool.query('UPDATE users SET target_role_id = ? WHERE user_id = ?', [roleId, req.user.id]);
    res.status(201).json({ user: await ambilUser(req.user.id) });
}