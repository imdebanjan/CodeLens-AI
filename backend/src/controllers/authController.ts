import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../models/db.js';
import { config } from '../config/index.js';
import { registerSchema, loginSchema, updatePreferencesSchema } from '../validators/authValidator.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.parse(req.body);

      const existing = await storage.findUserByEmail(parsed.email);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(parsed.password, salt);

      const user = await storage.createUser({
        name: parsed.name,
        email: parsed.email,
        passwordHash
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeFullCodePreference: user.storeFullCodePreference
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.parse(req.body);

      const user = await storage.findUserByEmail(parsed.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      const match = await bcrypt.compare(parsed.password, user.passwordHash);
      if (!match) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
      );

      res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeFullCodePreference: user.storeFullCodePreference
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const user = await storage.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User profile not found.' });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeFullCodePreference: user.storeFullCodePreference,
          createdAt: user.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const parsed = updatePreferencesSchema.parse(req.body);
      const updated = await storage.updateUserPreferences(req.user.userId, parsed.storeFullCodePreference);

      if (!updated) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully.',
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          storeFullCodePreference: updated.storeFullCodePreference
        }
      });
    } catch (err) {
      next(err);
    }
  }

  logout(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
}

export const authController = new AuthController();
