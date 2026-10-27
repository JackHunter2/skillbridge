import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/db.js';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer.js';

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

    const user = { user_id: hasil.insertId, full_name, email, user_type, target_role_id: null, avatar_path: null };
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
        avatar_path: u.avatar_path,
        target_role_id: u.target_role_id,
    };
    res.json({ token: buatToken(user), user });
}

export async function me(req, res) {
    const [rows] = await pool.query(
        'SELECT user_id, full_name, email, user_type, target_role_id, avatar_path FROM users WHERE user_id = ?',
        [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    res.json({ user: rows[0] });
}

const forgotSchema = z.object({ email: z.string().email('Format email tidak valid') });
const resetSchema = z.object({
    token: z.string().min(20, 'Tautan tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

export async function forgotPassword(req, res) {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { email } = parsed.data;

    // Respons selalu sama agar email yang terdaftar tidak bisa ditebak
    const balasan = {
        message: 'Jika email terdaftar, tautan untuk membuat password baru sudah dikirim. Periksa kotak masuk atau folder spam.',
    };

    const [rows] = await pool.query('SELECT user_id, full_name FROM users WHERE email = ? AND is_active = 1', [email]);
    const u = rows[0];
    if (!u) return res.json(balasan);

    const [baru] = await pool.query(
        'SELECT id FROM password_resets WHERE user_id = ? AND created_at > (NOW() - INTERVAL 60 SECOND) LIMIT 1',
        [u.user_id]
    );
    if (baru[0]) return res.json(balasan);

    const token = crypto.randomBytes(32).toString('hex');
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [u.user_id]);
    await pool.query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, NOW() + INTERVAL 30 MINUTE)',
        [u.user_id, hashToken(token)]
    );

    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    try {
        await sendMail({
            to: email,
            subject: 'Atur ulang password SkillBridge',
            text:
                `Halo ${u.full_name},\n\nKami menerima permintaan untuk mengatur ulang password akun kamu.\n` +
                `Buka tautan berikut (berlaku 30 menit):\n${link}\n\n` +
                `Jika kamu tidak merasa memintanya, abaikan email ini. Password kamu tidak berubah.`,
            html:
                `<p>Halo ${u.full_name},</p><p>Kami menerima permintaan untuk mengatur ulang password akun kamu.</p>` +
                `<p><a href="${link}" style="background:#1e6fd9;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Buat password baru</a></p>` +
                `<p style="color:#64748b;font-size:13px">Tautan berlaku 30 menit. Jika Anda tidak merasa memintanya, abaikan email ini.</p>`,
        });
    } catch (err) {
        console.error('Gagal mengirim email reset:', err.message);
    }

    res.json(balasan);
}

export async function resetPassword(req, res) {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { token, password } = parsed.data;

    const [rows] = await pool.query(
        'SELECT user_id FROM password_resets WHERE token_hash = ? AND expires_at > NOW()',
        [hashToken(token)]
    );
    if (!rows[0]) {
        return res.status(400).json({ message: 'Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, rows[0].user_id]);
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [rows[0].user_id]);

    res.json({ message: 'Password berhasil diubah. Silakan masuk dengan password baru.' });
}