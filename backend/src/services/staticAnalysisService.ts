import { StaticFinding } from '../types/index.js';

interface StaticRule {
  id: string;
  languages: string[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  regex: RegExp;
  message: string;
  recommendation: string;
}

const STATIC_RULES: StaticRule[] = [
  // 1. Hardcoded API Keys & Secrets
  {
    id: 'security/no-hardcoded-secrets',
    languages: ['all'],
    severity: 'critical',
    regex: /(?:api[_-]?key|secret|password|token|bearer|auth[_-]?token)\s*[:=]\s*['"`][A-Za-z0-9_\-.~+]{12,}['"`]/i,
    message: 'Potential hardcoded secret or API credential detected in source code.',
    recommendation: 'Move sensitive credentials to environment variables or secret vaults (e.g. process.env or AWS Secrets Manager).'
  },
  {
    id: 'security/no-jwt-literal',
    languages: ['all'],
    severity: 'critical',
    regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    message: 'Hardcoded JSON Web Token (JWT) literal detected.',
    recommendation: 'Revoke and rotate this token immediately. Never commit signed JWT tokens to source control.'
  },
  // 2. Dangerous Execution (eval, Function)
  {
    id: 'security/no-eval',
    languages: ['javascript', 'typescript'],
    severity: 'critical',
    regex: /\beval\s*\(/,
    message: 'Use of eval() represents a severe Remote Code Execution (RCE) and XSS vulnerability.',
    recommendation: 'Replace eval() with safe parsers like JSON.parse() or dedicated domain-specific logic.'
  },
  {
    id: 'security/no-implied-eval',
    languages: ['javascript', 'typescript'],
    severity: 'high',
    regex: /\bnew\s+Function\s*\(/,
    message: 'The Function() constructor allows dynamic code execution similar to eval().',
    recommendation: 'Avoid dynamic string-to-code compilation. Use structured functions and callbacks.'
  },
  // 3. DOM XSS
  {
    id: 'security/no-inner-html',
    languages: ['javascript', 'typescript'],
    severity: 'high',
    regex: /\.(innerHTML|outerHTML)\s*=/,
    message: 'Direct assignment to innerHTML can lead to Cross-Site Scripting (DOM XSS).',
    recommendation: 'Use textContent, or sanitize the HTML string using DOMPurify before assigning.'
  },
  {
    id: 'security/no-document-write',
    languages: ['javascript', 'typescript'],
    severity: 'high',
    regex: /document\.write(?:ln)?\s*\(/,
    message: 'document.write() is unsafe, degrades performance, and is vulnerable to XSS.',
    recommendation: 'Manipulate DOM elements using createElement and appendChild or standard reactive frameworks.'
  },
  // 4. Loose Equality
  {
    id: 'best-practice/no-loose-equality',
    languages: ['javascript', 'typescript'],
    severity: 'medium',
    regex: /(?:[^!><=]|^)\s*(==|!=)\s*[^=]/,
    message: 'Loose equality (== or !=) performs unpredictable type coercion.',
    recommendation: 'Use strict equality (=== or !==) to prevent unexpected type coercion bugs.'
  },
  // 5. Var declarations
  {
    id: 'best-practice/no-var',
    languages: ['javascript', 'typescript'],
    severity: 'low',
    regex: /\bvar\s+[a-zA-Z_$]/,
    message: 'Use of var creates function-scoped, hoisted variables that cause subtle scoping bugs.',
    recommendation: 'Use const for immutable bindings and let for re-assignable block-scoped variables.'
  },
  // 6. Debugger statements
  {
    id: 'clean-code/no-debugger',
    languages: ['javascript', 'typescript'],
    severity: 'medium',
    regex: /\bdebugger\b\s*;?/,
    message: 'A debugger statement halts JavaScript execution and must not be left in production code.',
    recommendation: 'Remove debugger statements prior to committing or deploying.'
  },
  // 7. Silent Catch Block
  {
    id: 'reliability/no-empty-catch',
    languages: ['javascript', 'typescript', 'java', 'csharp'],
    severity: 'high',
    regex: /catch\s*\([^)]*\)\s*\{\s*\}/,
    message: 'Empty catch block swallows errors silently without logging or handling.',
    recommendation: 'Log the error with context or re-throw after graceful fallback to avoid masked faults.'
  },
  // 8. SQL Injection risk
  {
    id: 'security/sql-injection-risk',
    languages: ['all'],
    severity: 'critical',
    regex: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*(?:FROM|INTO)\s+.*['"`]\s*\+\s*[a-zA-Z0-9_$]+/i,
    message: 'Direct string concatenation in SQL query introduces SQL Injection vulnerability.',
    recommendation: 'Always use parameterized queries, prepared statements, or an ORM/query builder.'
  },
  // 9. Python specific: exec() / eval()
  {
    id: 'security/py-no-exec-eval',
    languages: ['python'],
    severity: 'critical',
    regex: /\b(exec|eval)\s*\(/,
    message: 'Python eval() or exec() execution executes arbitrary user input as system code.',
    recommendation: 'Use ast.literal_eval for parsing literals, or avoid dynamic code execution entirely.'
  },
  // 10. Python specific: bare except
  {
    id: 'reliability/py-no-bare-except',
    languages: ['python'],
    severity: 'medium',
    regex: /except\s*:/,
    message: 'Bare "except:" catches SystemExit and KeyboardInterrupt, making process control difficult.',
    recommendation: 'Catch specific exceptions (e.g., except Exception as e or except ValueError).'
  }
];

export class StaticAnalysisService {
  /**
   * Deterministically analyze source code for security, style, and reliability issues
   */
  public analyze(code: string, language: string = 'javascript'): StaticFinding[] {
    const findings: StaticFinding[] = [];
    const normalizedLang = language.toLowerCase();
    const lines = code.split('\n');

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineText = lines[lineIdx];
      const lineNum = lineIdx + 1;

      // Skip comment-only lines
      const trimmed = lineText.trim();
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*')
      ) {
        continue;
      }

      for (const rule of STATIC_RULES) {
        const matchesLang =
          rule.languages.includes('all') ||
          rule.languages.includes(normalizedLang) ||
          (normalizedLang.includes('script') && rule.languages.includes('javascript'));

        if (!matchesLang) continue;

        const match = lineText.match(rule.regex);
        if (match) {
          const col = (match.index ?? 0) + 1;
          findings.push({
            ruleId: rule.id,
            severity: rule.severity,
            line: lineNum,
            column: col,
            message: rule.message,
            recommendation: rule.recommendation
          });
        }
      }
    }

    return findings;
  }
}

export const staticAnalysisService = new StaticAnalysisService();
