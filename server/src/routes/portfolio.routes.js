import { Router } from 'express';
import {
    createPortfolio, listPortfolios, reviewHistory, deletePortfolio,
} from '../controllers/portfolio.controller.js';
import { createReview } from '../controllers/review.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', requireAuth, listPortfolios);
router.get('/history', requireAuth, reviewHistory);
router.post('/', requireAuth, uploadFile, createPortfolio);
router.post('/:id/review', requireAuth, createReview);
router.delete('/:id', requireAuth, deletePortfolio);

export default router;