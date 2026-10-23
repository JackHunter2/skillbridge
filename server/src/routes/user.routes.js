import { Router } from 'express';
import { setTargetRole } from '../controllers/role.controller.js';
import {
    updateProfile, changePassword, uploadAvatarFoto, hapusAvatar, hapusAkun, ringkasanProfil,
} from '../controllers/profile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/avatar.middleware.js';

const router = Router();
router.put('/me', requireAuth, updateProfile);
router.get('/me/summary', requireAuth, ringkasanProfil);
router.delete('/me', requireAuth, hapusAkun);
router.put('/me/password', requireAuth, changePassword);
router.put('/me/target-role', requireAuth, setTargetRole);
router.post('/me/avatar', requireAuth, uploadAvatar, uploadAvatarFoto);
router.delete('/me/avatar', requireAuth, hapusAvatar);

export default router;