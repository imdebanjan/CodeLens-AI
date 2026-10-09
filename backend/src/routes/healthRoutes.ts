import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../models/db.js';
import { config } from '../config/index.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'CodeLens AI Backend',
    database: isDatabaseConnected() ? 'connected (mongodb)' : 'active (in-memory mode)',
    aiEngine: config.geminiApiKey ? 'gemini-1.5-flash (configured)' : 'codelens-heuristic-engine (active)',
    environment: config.env
  });
});

export default router;
