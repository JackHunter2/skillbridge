import { Router } from 'express';
import { createPortfolio, listPortfolios, reviewHistory } from '../controllers/portfolio.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../middlewares/upload.middleware.js';
import { createReview } from '../controllers/review.controller.js';

const router = Router();

router.get('/', requireAuth, listPortfolios);
router.post('/', requireAuth, uploadFile, createPortfolio);
router.post('/:id/review', requireAuth, createReview);
router.get('/history', requireAuth, reviewHistory);

export default router;