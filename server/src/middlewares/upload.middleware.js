import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const dir = path.resolve('uploads');
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) =>
        cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.pdf`),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) =>
        file.mimetype === 'application/pdf'
            ? cb(null, true)
            : cb(new Error('Hanya file PDF yang diperbolehkan')),
}).single('file');

export function uploadFile(req, res, next) {
    upload(req, res, (err) => {
        if (!err) return next();
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file maksimal 5 MB' : err.message;
        res.status(400).json({ message });
    });
}