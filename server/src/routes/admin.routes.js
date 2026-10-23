import { Router } from 'express';
import {
    summary, listFeedback, feedbackCsv, listCustomRoles, promoteRole, listUsers,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/summary', summary);
router.get('/feedback', listFeedback);
router.get('/feedback.csv', feedbackCsv);
router.get('/roles', listCustomRoles);
router.post('/roles/:id/promote', promoteRole);
router.get('/users', listUsers);

export default router;