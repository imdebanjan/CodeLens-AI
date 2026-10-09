import { Request, Response, NextFunction } from 'express';
import { reviewSchema } from '../validators/reviewValidator.js';
import { staticAnalysisService } from '../services/staticAnalysisService.js';
import { geminiService } from '../services/geminiService.js';
import { storage } from '../models/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ReviewController {
  async submitReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = reviewSchema.parse(req.body);
      const userId = req.user?.userId;

      // 1. Perform deterministic Static Code Analysis
      const staticFindings = staticAnalysisService.analyze(validated.code, validated.language);

      // 2. Perform AI Review (Gemini or Heuristic Engine fallback)
      const reviewResult = await geminiService.reviewCode(
        validated.code,
        validated.language,
        validated.focus,
        staticFindings
      );

      // 3. Determine snippet vs full code storage privacy rules
      let shouldStoreFullCode = validated.storeCode;
      if (userId) {
        const user = await storage.findUserById(userId);
        if (user && user.storeFullCodePreference) {
          shouldStoreFullCode = true;
        }
      }

      // Safe privacy snippet (first 5 lines only)
      const snippetLines = validated.code.split('\n').slice(0, 5).join('\n');
      const snippet = shouldStoreFullCode
        ? validated.code
        : snippetLines + (validated.code.split('\n').length > 5 ? '\n// ... [truncated for privacy]' : '');

      const title = validated.title || `${validated.language.toUpperCase()} ${validated.focus} review`;

      // 4. Persist review record in database
      const saved = await storage.saveReview({
        userId,
        title,
        language: validated.language,
        focus: validated.focus,
        sourceCodeSnippet: snippet,
        hasFullCodeStored: !!shouldStoreFullCode,
        result: reviewResult
      });

      res.status(201).json({
        success: true,
        data: saved
      });
    } catch (err) {
      next(err);
    }
  }

  async getReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));

      const { reviews, total } = await storage.getReviews(userId, limit, page);

      res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getReviewById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const review = await storage.getReviewById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Review not found.'
        });
      }

      // Ownership check: If review is assigned to a user, only that user or an admin can access it
      if (review.userId && req.user && review.userId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this review.'
        });
      }

      res.status(200).json({
        success: true,
        data: review
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const userId = req.user?.userId;

      const deleted = await storage.deleteReview(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Review not found or you do not have permission to delete it.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Review successfully deleted.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
