import fs from 'fs/promises';
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { pool } from '../config/db.js';

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

    res.status(201).json({
        portfolio: { portfolio_id: hasil.insertId, title, source_type, text_length: text.length },
    });
}

export async function listPortfolios(req, res) {
    const [rows] = await pool.query(
        `SELECT portfolio_id, title, source_type, external_url, version_no, uploaded_at,
            CHAR_LENGTH(extracted_text) AS text_length
       FROM portfolios
      WHERE user_id = ?
      ORDER BY uploaded_at DESC`,
        [req.user.id]
    );
    res.json({ portfolios: rows });
}