import { Router } from 'express';
import { saveFeedback, getMyFeedback } from '../controllers/feedback.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/', requireAuth, saveFeedback);
router.get('/review/:reviewId', requireAuth, getMyFeedback);

export default router;