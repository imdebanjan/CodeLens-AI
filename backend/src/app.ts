import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import githubRoutes from './routes/githubRoutes.js';

export function createApp(): Application {
  const app = express();

  // Security Headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  // CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching frontend
      if (!origin || origin === config.frontendUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or set specific origin
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-github-token']
  }));

  // Body Parsing with size limits
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Global API rate limiter
  app.use('/api/', apiLimiter);

  // Mount API Endpoints (v1)
  app.use('/api/v1', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/github', githubRoutes);

  // 404 handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API Route ${req.method} ${req.originalUrl} not found.`
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
