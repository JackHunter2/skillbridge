import { pool } from '../config/db.js';

export async function updateItemStatus(req, res) {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id)) return res.status(400).json({ message: 'ID tidak valid' });
    if (!['belum', 'berjalan', 'selesai'].includes(status)) {
        return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [rows] = await pool.query(
        `SELECT i.item_id
       FROM roadmap_items i JOIN roadmaps r ON r.roadmap_id = i.roadmap_id
      WHERE i.item_id = ? AND r.user_id = ?`,
        [id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Langkah roadmap tidak ditemukan' });

    await pool.query(
        "UPDATE roadmap_items SET status = ?, completed_at = IF(? = 'selesai', NOW(), NULL) WHERE item_id = ?",
        [status, status, id]
    );
    res.json({ item_id: id, status });
}