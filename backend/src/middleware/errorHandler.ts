import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/index.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle JWT error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.'
    });
  }

  // Handle Payload Too Large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large. Please reduce the size of the submitted code.'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.env === 'development' ? { stack: err.stack } : {})
  });
}
