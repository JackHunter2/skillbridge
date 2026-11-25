import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const dir = process.env.VERCEL
    ? path.join('/tmp', 'uploads', 'avatars')
    : path.resolve('uploads', 'avatars');

fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) =>
        cb(null, `${req.user.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.tmp`),
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Hanya gambar JPG, PNG, atau WEBP yang diperbolehkan')),
}).single('avatar');

export function uploadAvatar(req, res, next) {
    upload(req, res, (err) => {
        if (!err) return next();
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran foto maksimal 2 MB' : err.message;
        res.status(400).json({ message });
    });
}
