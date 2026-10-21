import { Router } from 'express';
import { setTargetRole } from '../controllers/role.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.put('/me/target-role', requireAuth, setTargetRole);

export default router;