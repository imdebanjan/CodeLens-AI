export type ReviewFocus = 'comprehensive' | 'bugs' | 'security' | 'performance' | 'readability';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingCategory = 'bug' | 'security' | 'performance' | 'maintainability' | 'style';

export interface ReviewFinding {
  id: string;
  category: FindingCategory;
  severity: Severity;
  title: string;
  lineStart: number;
  lineEnd: number;
  description: string;
  impact: string;
  remediation: string;
  suggestedCode?: string;
}

export interface StaticFinding {
  ruleId: string;
  severity: Severity;
  line: number;
  column: number;
  message: string;
  recommendation: string;
}

export interface ReviewRubric {
  bugs: number;
  security: number;
  performance: number;
  maintainability: number;
}

export interface ReviewResult {
  summary: string;
  qualityScore: number;
  rubric: ReviewRubric;
  strengths: string[];
  weaknesses: string[];
  findings: ReviewFinding[];
  staticFindings: StaticFinding[];
  suggestedFullCode: string;
  suggestedTestCases: string[];
  executionTimeMs: number;
  language: string;
  focus: ReviewFocus;
  modelUsed: string;
}

export interface StoredReview {
  id: string;
  userId?: string;
  title: string;
  language: string;
  focus: ReviewFocus;
  sourceCodeSnippet: string;
  hasFullCodeStored: boolean;
  result: ReviewResult;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'admin';
  storeFullCodePreference: boolean;
  createdAt?: string;
}

export interface DashboardStats {
  totalReviews: number;
  averageQualityScore: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  languageBreakdown: Record<string, number>;
  recentScoreTrend: Array<{
    date: string;
    score: number;
    title: string;
  }>;
}

export interface GitHubItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string | null;
}
