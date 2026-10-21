import 'dotenv/config';
import app from './app.js';
import { pool } from './config/db.js';

await pool.query(
    "UPDATE ai_reviews SET status = 'failed', summary = 'Reviu terhenti, silakan ulangi.' WHERE status = 'processing'"
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));