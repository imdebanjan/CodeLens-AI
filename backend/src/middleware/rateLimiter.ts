import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in a few minutes.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // 25 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts, please wait 15 minutes before trying again.'
  }
});

export const reviewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 reviews per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Review request rate limit exceeded. Please wait a moment before submitting again.'
  }
});
