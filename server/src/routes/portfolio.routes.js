import { Router } from 'express';
import { createPortfolio, listPortfolios } from '../controllers/portfolio.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', requireAuth, listPortfolios);
router.post('/', requireAuth, uploadFile, createPortfolio);

export default router;