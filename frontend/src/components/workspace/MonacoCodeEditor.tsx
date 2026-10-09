import React from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import { Code, Sparkles, RotateCcw, FileCode } from 'lucide-react';

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  readOnly?: boolean;
}

export const CODE_PRESETS = [
  {
    id: 'security-flaw',
    label: '🚨 Security Vulnerability (Secret & SQLi)',
    language: 'javascript',
    code: `// Express User Search Endpoint - Vulnerable Implementation
import express from 'express';
const router = express.Router();

const SECRET_API_KEY = "AIzaSyD-unencrypted-master-key-999";

router.get('/users/search', async (req, res) => {
  const searchTerm = req.query.q;
  
  // Unsafe query concatenation (SQL Injection risk)
  const query = "SELECT id, username, email FROM users WHERE username LIKE '%" + searchTerm + "%'";
  
  // Direct evaluation of debug script
  if (req.query.debug) {
    eval(req.query.debug);
  }

  const results = await db.raw(query);
  res.json({ data: results });
});`,
  },
  {
    id: 'async-bug',
    label: '🐛 Async Concurrency & Silent Catch',
    language: 'typescript',
    code: `// Payment Processor - Unhandled Rejections & Silent Failure
interface PaymentRequest {
  orderId: string;
  amount: number;
}

export async function processPayment(req: PaymentRequest) {
  var success = false;
  
  // Missing catch block on external payment gateway
  fetch('https://api.paymentgateway.com/charge', {
    method: 'POST',
    body: JSON.stringify(req)
  });

  try {
    updateLedger(req.orderId, req.amount);
  } catch (err) {
    // Silent catch swallowing error
  }

  if (success == true) {
    console.log("Charged " + req.amount);
  }
  
  return success;
}`,
  },
  {
    id: 'performance-loop',
    label: '⚡ Performance Bottleneck (O(N^2) Loop)',
    language: 'javascript',
    code: `// Deduplicate and aggregate order items
function findDuplicateOrders(orders, historicalList) {
  const duplicates = [];
  
  // O(N*M) nested iteration instead of Set/Map lookup
  for (let i = 0; i < orders.length; i++) {
    for (let j = 0; j < historicalList.length; j++) {
      if (orders[i].referenceId == historicalList[j].referenceId) {
        duplicates.push(orders[i]);
      }
    }
  }

  debugger; // Leftover debugger breakpoint
  return duplicates;
}`,
  },
  {
    id: 'python-eval',
    label: '🐍 Python Dangerous Exec & Bare Except',
    language: 'python',
    code: `# Data extraction script
import os

def parse_user_rule(rule_expr, payload):
    # Dynamic evaluation of user-supplied rule expression
    result = eval(rule_expr)
    
    try:
        data = payload["records"]
        return [r for r in data if r["valid"]]
    except:
        pass  # Bare except blocks keyboard interrupt & critical errors
        return []`,
  },
];

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
}) => {
  const { theme } = useTheme();

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CODE_PRESETS.find((p) => p.id === e.target.value);
    if (selected) {
      onLanguageChange(selected.language);
      onChange(selected.code);
    }
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <div className="editor-pane">
      <div className="editor-toolbar">
        <div className="editor-toolbar-group">
          <FileCode size={16} className="text-primary" />
          <select
            className="select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
            disabled={readOnly}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="sql">SQL</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          {!readOnly && (
            <select
              className="select"
              defaultValue=""
              onChange={handlePresetSelect}
              style={{ width: '220px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
            >
              <option value="" disabled>Load Sample Code...</option>
              {CODE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="editor-toolbar-group">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {lineCount} lines &bull; {charCount} chars
          </span>
          {!readOnly && (
            <button
              className="btn-ghost"
              onClick={() => onChange('')}
              title="Clear Editor"
              style={{ padding: '0.3rem' }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="editor-wrapper">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={(val) => onChange(val || '')}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
