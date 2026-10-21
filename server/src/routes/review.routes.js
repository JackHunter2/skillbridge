import { Router } from 'express';
import { getReview, getReviewStatus } from '../controllers/review.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/:id/status', requireAuth, getReviewStatus);
router.get('/:id', requireAuth, getReview);

export default router;