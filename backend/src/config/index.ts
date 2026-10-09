import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codelens',
  jwtSecret: process.env.JWT_SECRET || 'codelens-ai-super-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  maxCodeCharacters: parseInt(process.env.MAX_CODE_CHARS || '30000', 10), // ~1000 lines
};

export const isDev = config.env === 'development';
