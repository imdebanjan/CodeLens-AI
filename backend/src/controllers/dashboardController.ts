import { Response, NextFunction } from 'express';
import { storage } from '../models/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const stats = await storage.getStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
