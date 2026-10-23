import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { pool } from '../config/db.js';

const UPLOAD_DIR = path.resolve('uploads');
const AVATAR_DIR = path.resolve('uploads', 'avatars');
const KOLOM_USER = 'user_id, full_name, email, user_type, target_role_id, avatar_path';

const profilSchema = z.object({
    full_name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120),
    user_type: z.enum(['fresh_graduate', 'anak_magang']),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, 'Password saat ini wajib diisi'),
    new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
});

const hapusFile = (p) => fs.unlink(p).catch(() => {});
const ambilUser = async (id) => {
    const [rows] = await pool.query(`SELECT ${KOLOM_USER} FROM users WHERE user_id = ?`, [id]);
    return rows[0];
};

// Deteksi jenis gambar dari isi file (bukan dari nama atau header yang bisa dipalsukan)
function deteksiGambar(b) {
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
    if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
    if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'webp';
    return null;
}

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
    res.json({ user: await ambilUser(req.user.id) });
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

export async function uploadAvatarFoto(req, res) {
    if (!req.file) return res.status(400).json({ message: 'Pilih file gambar terlebih dahulu' });

    const head = Buffer.alloc(12);
    const fh = await fs.open(req.file.path, 'r');
    await fh.read(head, 0, 12, 0);
    await fh.close();

    const ext = deteksiGambar(head);
    if (!ext) {
        await hapusFile(req.file.path);
        return res.status(400).json({ message: 'File bukan gambar yang valid' });
    }

    const nama = req.file.filename.replace(/\.tmp$/, `.${ext}`);
    await fs.rename(req.file.path, path.join(AVATAR_DIR, nama));

    const [lama] = await pool.query('SELECT avatar_path FROM users WHERE user_id = ?', [req.user.id]);
    await pool.query('UPDATE users SET avatar_path = ? WHERE user_id = ?', [nama, req.user.id]);
    if (lama[0]?.avatar_path) await hapusFile(path.join(AVATAR_DIR, path.basename(lama[0].avatar_path)));

    res.json({ user: await ambilUser(req.user.id) });
}

export async function hapusAvatar(req, res) {
    const [rows] = await pool.query('SELECT avatar_path FROM users WHERE user_id = ?', [req.user.id]);
    await pool.query('UPDATE users SET avatar_path = NULL WHERE user_id = ?', [req.user.id]);
    if (rows[0]?.avatar_path) await hapusFile(path.join(AVATAR_DIR, path.basename(rows[0].avatar_path)));
    res.json({ user: await ambilUser(req.user.id) });
}

export async function hapusAkun(req, res) {
    const password = req.body?.password;
    if (!password) return res.status(400).json({ message: 'Password wajib diisi untuk konfirmasi' });

    const [rows] = await pool.query('SELECT password_hash, avatar_path FROM users WHERE user_id = ?', [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) {
        return res.status(400).json({ message: 'Password salah' });
    }

    const [berkas] = await pool.query(
        'SELECT file_path FROM portfolios WHERE user_id = ? AND file_path IS NOT NULL',
        [req.user.id]
    );

    // Semua data terkait (portofolio, reviu, roadmap, feedback) ikut terhapus lewat FK CASCADE
    await pool.query('DELETE FROM users WHERE user_id = ?', [req.user.id]);

    for (const b of berkas) await hapusFile(path.join(UPLOAD_DIR, path.basename(b.file_path)));
    if (rows[0].avatar_path) await hapusFile(path.join(AVATAR_DIR, path.basename(rows[0].avatar_path)));

    res.json({ message: 'Akun berhasil dihapus' });
}