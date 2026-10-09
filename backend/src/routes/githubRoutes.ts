import { Router } from 'express';
import { githubController } from '../controllers/githubController.js';

const router = Router();

router.get('/contents', (req, res, next) => githubController.getContents(req, res, next));
router.get('/file', (req, res, next) => githubController.getFile(req, res, next));

export default router;
