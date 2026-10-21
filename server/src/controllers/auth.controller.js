import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/db.js';

const registerSchema = z.object({
    full_name: z.string().min(2, 'Nama yang di isi minimal 2 karakter'),
    email: z.string().email('Format email tidak sesuai'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    user_type: z.enum(['fresh_graduate', 'anak_magang']),
});

const loginSchema = z.object({
    email: z.string().email('Format email tidak sesuai'),
    password: z.string().min(1, 'Password wajib diisi'),
});

const buatToken = (user) =>
    jwt.sign({ id: user.user_id, user_type: user.user_type }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

export async function register(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { full_name, email, password, user_type } = parsed.data;

    const [ada] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (ada.length > 0) {
        return res.status(409).json({ message: 'Email yang anda masukkan sudah terdaftar' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [hasil] = await pool.query(
        'INSERT INTO users (full_name, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
        [full_name, email, password_hash, user_type]
    );

    const user = { user_id: hasil.insertId, full_name, email, user_type, target_role_id: null };
    res.status(201).json({ token: buatToken(user), user });
}

export async function login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { email, password } = parsed.data;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash))) {
        return res.status(401).json({ message: 'Email atau password yang anda masukkan salah' });
    }

    const user = {
        user_id: u.user_id,
        full_name: u.full_name,
        email: u.email,
        user_type: u.user_type,
        target_role_id: u.target_role_id,
    };
    res.json({ token: buatToken(user), user });
}

export async function me(req, res) {
    const [rows] = await pool.query(
        'SELECT user_id, full_name, email, user_type, target_role_id FROM users WHERE user_id = ?',
        [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    res.json({ user: rows[0] });
}