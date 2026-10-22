import { Router } from 'express';
import { updateItemStatus } from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.patch('/items/:id', requireAuth, updateItemStatus);

export default router;