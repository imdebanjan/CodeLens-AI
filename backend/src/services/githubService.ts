import axios from 'axios';

export interface GitHubRepoItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string | null;
}

export class GitHubService {
  /**
   * Fetch files & directories from a GitHub repository path
   * @param owner GitHub username or org
   * @param repo Repository name
   * @param path Directory path (default empty for root)
   * @param token Optional GitHub Personal Access Token
   */
  async getRepoContents(
    owner: string,
    repo: string,
    path: string = '',
    token?: string
  ): Promise<GitHubRepoItem[]> {
    const cleanOwner = encodeURIComponent(owner.trim());
    const cleanRepo = encodeURIComponent(repo.trim());
    const cleanPath = path ? `/${path.replace(/^\/+/, '')}` : '';

    const url = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents${cleanPath}`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CodeLens-AI-Reviewer'
    };

    if (token) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    try {
      const response = await axios.get(url, { headers, timeout: 10000 });
      if (!Array.isArray(response.data)) {
        // Single file requested
        return [
          {
            name: response.data.name,
            path: response.data.path,
            type: 'file',
            size: response.data.size,
            download_url: response.data.download_url
          }
        ];
      }

      return response.data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type === 'dir' ? 'dir' : 'file',
        size: item.size,
        download_url: item.download_url
      }));
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" or path "${path}" not found.`);
      }
      if (error.response?.status === 403) {
        throw new Error('GitHub API rate limit exceeded or access forbidden. Provide a GitHub token in settings.');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch GitHub repository contents.');
    }
  }

  /**
   * Fetch raw file content from GitHub
   */
  async getFileContent(
    owner: string,
    repo: string,
    filePath: string,
    token?: string
  ): Promise<{ content: string; language: string; name: string }> {
    const cleanOwner = encodeURIComponent(owner.trim());
    const cleanRepo = encodeURIComponent(repo.trim());
    const cleanPath = filePath.replace(/^\/+/, '');

    const url = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CodeLens-AI-Reviewer'
    };

    if (token) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    try {
      const response = await axios.get(url, { headers, timeout: 10000 });

      if (response.data.size > 200000) {
        throw new Error('File exceeds the 200KB limit for code review.');
      }

      let content = '';
      if (response.data.encoding === 'base64') {
        content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      } else if (response.data.download_url) {
        const rawRes = await axios.get(response.data.download_url);
        content = typeof rawRes.data === 'string' ? rawRes.data : JSON.stringify(rawRes.data, null, 2);
      } else {
        throw new Error('Unable to extract file contents.');
      }

      const ext = filePath.split('.').pop()?.toLowerCase() || '';
      const languageMap: Record<string, string> = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        py: 'python',
        java: 'java',
        go: 'go',
        rs: 'rust',
        cpp: 'cpp',
        c: 'c',
        cs: 'csharp',
        rb: 'ruby',
        php: 'php',
        html: 'html',
        css: 'css',
        json: 'json',
        sql: 'sql'
      };

      return {
        content,
        language: languageMap[ext] || 'javascript',
        name: response.data.name
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to download file from GitHub.');
    }
  }
}

export const githubService = new GitHubService();
