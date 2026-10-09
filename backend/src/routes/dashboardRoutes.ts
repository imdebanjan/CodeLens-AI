import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/stats', optionalAuth, (req, res, next) => dashboardController.getStats(req, res, next));

export default router;
