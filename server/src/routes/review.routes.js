import { Router } from 'express';
import { getReview } from '../controllers/review.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/:id', requireAuth, getReview);

export default router;