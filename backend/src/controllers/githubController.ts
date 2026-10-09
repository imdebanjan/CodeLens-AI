import { Request, Response, NextFunction } from 'express';
import { githubService } from '../services/githubService.js';

export class GitHubController {
  async getContents(req: Request, res: Response, next: NextFunction) {
    try {
      const owner = req.query.owner as string;
      const repo = req.query.repo as string;
      const path = (req.query.path as string) || '';
      const token = req.headers['x-github-token'] as string | undefined;

      if (!owner || !repo) {
        return res.status(400).json({
          success: false,
          error: 'Both "owner" and "repo" query parameters are required.'
        });
      }

      const items = await githubService.getRepoContents(owner, repo, path, token);

      res.status(200).json({
        success: true,
        data: items
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to fetch GitHub repository contents.'
      });
    }
  }

  async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const owner = req.query.owner as string;
      const repo = req.query.repo as string;
      const path = req.query.path as string;
      const token = req.headers['x-github-token'] as string | undefined;

      if (!owner || !repo || !path) {
        return res.status(400).json({
          success: false,
          error: '"owner", "repo", and "path" query parameters are required.'
        });
      }

      const fileData = await githubService.getFileContent(owner, repo, path, token);

      res.status(200).json({
        success: true,
        data: fileData
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to download file from GitHub.'
      });
    }
  }
}

export const githubController = new GitHubController();
