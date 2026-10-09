import axios from 'axios';
import { 
  ReviewResult, 
  StoredReview, 
  UserProfile, 
  DashboardStats, 
  GitHubItem,
  ReviewFocus 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach Authorization token interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codelens_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await apiClient.post<{ success: boolean; token: string; user: UserProfile }>('/auth/register', data);
    return res.data;
  },
  async login(data: { email: string; password: string }) {
    const res = await apiClient.post<{ success: boolean; token: string; user: UserProfile }>('/auth/login', data);
    return res.data;
  },
  async getMe() {
    const res = await apiClient.get<{ success: boolean; user: UserProfile }>('/auth/me');
    return res.data.user;
  },
  async updatePreferences(storeFullCodePreference: boolean) {
    const res = await apiClient.patch<{ success: boolean; user: UserProfile }>('/auth/preferences', {
      storeFullCodePreference,
    });
    return res.data.user;
  },
};

export const reviewApi = {
  async submitReview(data: {
    code: string;
    language: string;
    focus: ReviewFocus;
    title?: string;
    storeCode?: boolean;
  }) {
    const res = await apiClient.post<{ success: boolean; data: StoredReview }>('/reviews', data);
    return res.data.data;
  },
  async getReviews(page: number = 1, limit: number = 20) {
    const res = await apiClient.get<{
      success: boolean;
      data: StoredReview[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/reviews?page=${page}&limit=${limit}`);
    return res.data;
  },
  async getReviewById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: StoredReview }>(`/reviews/${id}`);
    return res.data.data;
  },
  async deleteReview(id: string) {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/reviews/${id}`);
    return res.data;
  },
};

export const dashboardApi = {
  async getStats() {
    const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return res.data.data;
  },
};

export const githubApi = {
  async getContents(owner: string, repo: string, path: string = '', token?: string) {
    const res = await apiClient.get<{ success: boolean; data: GitHubItem[] }>('/github/contents', {
      params: { owner, repo, path },
      headers: token ? { 'x-github-token': token } : undefined,
    });
    return res.data.data;
  },
  async getFile(owner: string, repo: string, path: string, token?: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: { content: string; language: string; name: string };
    }>('/github/file', {
      params: { owner, repo, path },
      headers: token ? { 'x-github-token': token } : undefined,
    });
    return res.data.data;
  },
};

export const healthApi = {
  async checkHealth() {
    const res = await apiClient.get<{
      status: string;
      service: string;
      database: string;
      aiEngine: string;
    }>('/health');
    return res.data;
  },
};
