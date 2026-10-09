import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res, next));
router.patch('/preferences', requireAuth, (req, res, next) => authController.updatePreferences(req, res, next));

export default router;
