import { Router } from 'express';
import { setTargetRole } from '../controllers/role.controller.js';
import { updateProfile, changePassword } from '../controllers/profile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.put('/me', requireAuth, updateProfile);
router.put('/me/password', requireAuth, changePassword);
router.put('/me/target-role', requireAuth, setTargetRole);

export default router;