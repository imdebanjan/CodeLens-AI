import { Router } from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Submit code review (supports both logged in and guest mode)
router.post('/', reviewLimiter, optionalAuth, (req, res, next) => reviewController.submitReview(req, res, next));

// List reviews (filters by user if logged in)
router.get('/', optionalAuth, (req, res, next) => reviewController.getReviews(req, res, next));

// Get review by ID
router.get('/:id', optionalAuth, (req, res, next) => reviewController.getReviewById(req, res, next));

// Delete review
router.delete('/:id', optionalAuth, (req, res, next) => reviewController.deleteReview(req, res, next));

export default router;
