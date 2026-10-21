import { pool } from '../config/db.js';

export async function listRoles(req, res) {
    const [rows] = await pool.query(
        `SELECT r.role_id, r.role_name, r.field, r.description,
            COUNT(rs.skill_id) AS total_skills
       FROM target_roles r
       LEFT JOIN role_skills rs ON rs.role_id = r.role_id
      WHERE r.is_active = 1
      GROUP BY r.role_id
      ORDER BY r.role_name`
    );
    res.json({ roles: rows });
}

export async function setTargetRole(req, res) {
    const role_id = Number(req.body.role_id);
    if (!Number.isInteger(role_id)) {
        return res.status(400).json({ message: 'role_id tidak valid' });
    }

    const [ada] = await pool.query(
        'SELECT role_id FROM target_roles WHERE role_id = ? AND is_active = 1',
        [role_id]
    );
    if (ada.length === 0) {
        return res.status(404).json({ message: 'Peran tidak ditemukan' });
    }

    await pool.query('UPDATE users SET target_role_id = ? WHERE user_id = ?', [role_id, req.user.id]);

    const [rows] = await pool.query(
        'SELECT user_id, full_name, email, user_type, target_role_id FROM users WHERE user_id = ?',
        [req.user.id]
    );
    res.json({ user: rows[0] });
}