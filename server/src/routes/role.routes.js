import { Router } from 'express';
import { listRoles, createCustomRole } from '../controllers/role.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/', requireAuth, listRoles);
router.post('/custom', requireAuth, createCustomRole);

export default router;