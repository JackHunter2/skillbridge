import { Router } from 'express';
import { listRoles } from '../controllers/role.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/', requireAuth, listRoles);

export default router;