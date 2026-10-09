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
  bugs: number;          // 0-100
  security: number;      // 0-100
  performance: number;   // 0-100
  maintainability: number; // 0-100
}

export interface ReviewResult {
  summary: string;
  qualityScore: number;  // 0-100
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
  tokenCountEstimate?: number;
}

export interface StoredReview {
  id: string;
  userId?: string;
  title: string;
  language: string;
  focus: ReviewFocus;
  sourceCodeSnippet: string; // Truncated preview or full if opted-in
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
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}
