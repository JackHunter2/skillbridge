import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import userRoutes from './routes/user.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import reviewRoutes from './routes/review.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) AS total FROM target_roles');
        res.json({ status: 'ok', database: 'terhubung', target_roles: rows[0].total });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/reviews', reviewRoutes);


app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

export default app;