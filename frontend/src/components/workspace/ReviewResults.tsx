import React, { useState } from 'react';
import { ReviewResult, ReviewFinding, Severity } from '../../types';
import { DiffViewer } from './DiffViewer';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldAlert, 
  Bug, 
  Zap, 
  FileCheck2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Code2, 
  ListChecks, 
  Cpu, 
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ReviewResultsProps {
  originalCode: string;
  result: ReviewResult;
  language: string;
  onApplyModified?: (code: string) => void;
}

export const ReviewResults: React.FC<ReviewResultsProps> = ({
  originalCode,
  result,
  language,
  onApplyModified,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'findings' | 'static' | 'diff' | 'tests' | 'overview'>('findings');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyCode = async (id: string, codeText: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedSnippetId(id);
      showToast('Code snippet copied!', 'success');
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const getScoreClass = (score: number) => {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'poor';
  };

  const filteredFindings = result.findings.filter((f) => {
    if (severityFilter === 'all') return true;
    return f.severity === severityFilter;
  });

  return (
    <div className="results-pane">
      {/* Top Header & Tab Navigation */}
      <div className="results-toolbar">
        <div className="results-tabs">
          <button
            className={`tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            <Layers size={14} />
            <span>AI Findings ({result.findings.length})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'static' ? 'active' : ''}`}
            onClick={() => setActiveTab('static')}
          >
            <ShieldCheck size={14} />
            <span>Static Analysis ({result.staticFindings.length})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
          >
            <Code2 size={14} />
            <span>Diff & Fix</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            <ListChecks size={14} />
            <span>Tests ({result.suggestedTestCases.length})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Sparkles size={14} />
            <span>Summary</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Clock size={13} /> {result.executionTimeMs}ms
          </span>
          <span>&bull;</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Cpu size={13} /> {result.modelUsed}
          </span>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="score-hero-card">
        <div className={`score-circle ${getScoreClass(result.qualityScore)}`}>
          <span>{result.qualityScore}</span>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ 100</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Overall Quality Rating</span>
            <span className={`badge badge-${getScoreClass(result.qualityScore)}`}>
              {result.qualityScore >= 85 ? 'Production Ready' : result.qualityScore >= 70 ? 'Acceptable' : 'Refactor Needed'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {result.summary}
          </p>
        </div>
      </div>

      {/* Rubric Breakdown Grid */}
      <div className="rubric-grid">
        <div className="rubric-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Bug size={13} /> Logic & Bugs
          </div>
          <div className="rubric-value text-emerald">{result.rubric.bugs}%</div>
        </div>

        <div className="rubric-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <ShieldAlert size={13} /> Security
          </div>
          <div className="rubric-value text-rose">{result.rubric.security}%</div>
        </div>

        <div className="rubric-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Zap size={13} /> Performance
          </div>
          <div className="rubric-value text-amber">{result.rubric.performance}%</div>
        </div>

        <div className="rubric-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <FileCheck2 size={13} /> Maintainability
          </div>
          <div className="rubric-value text-sky">{result.rubric.maintainability}%</div>
        </div>
      </div>

      {/* Tab 1: AI Findings */}
      {activeTab === 'findings' && (
        <div>
          {/* Severity filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 1rem 0.75rem 1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '0.25rem' }}>Filter:</span>
            {['all', 'critical', 'high', 'medium', 'low', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`btn btn-ghost ${severityFilter === sev ? 'btn-secondary' : ''}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'capitalize',
                  border: severityFilter === sev ? '1px solid var(--border-strong)' : 'none',
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="findings-container">
            {filteredFindings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                No findings matching the selected filter.
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const isExpanded = expandedFindings[finding.id] !== false; // expanded by default
                return (
                  <div key={finding.id} className="finding-card">
                    <div className="finding-card-header" onClick={() => toggleFinding(finding.id)}>
                      <div className="finding-title-row">
                        <span className={`badge badge-${finding.severity}`}>{finding.severity}</span>
                        <span className="finding-title">{finding.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          L{finding.lineStart}:{finding.lineEnd}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="finding-body">
                        <div>
                          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
                            Root Cause & Analysis:
                          </strong>
                          <p style={{ color: 'var(--text-muted)' }}>{finding.description}</p>
                        </div>

                        {finding.impact && (
                          <div>
                            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
                              Potential Impact:
                            </strong>
                            <p style={{ color: 'var(--text-muted)' }}>{finding.impact}</p>
                          </div>
                        )}

                        <div>
                          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
                            Remediation:
                          </strong>
                          <p style={{ color: 'var(--text-muted)' }}>{finding.remediation}</p>
                        </div>

                        {finding.suggestedCode && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                                Suggested Fix:
                              </span>
                              <button
                                className="btn-ghost"
                                onClick={() => copyCode(finding.id, finding.suggestedCode!)}
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                              >
                                {copiedSnippetId === finding.id ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                                <span>Copy</span>
                              </button>
                            </div>
                            <pre className="code-fix-block">
                              <code>{finding.suggestedCode}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Deterministic Static Analysis */}
      {activeTab === 'static' && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Deterministic rule-based static scan results verified independently of AI heuristic generation:
          </div>
          {result.staticFindings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <ShieldCheck size={36} className="text-emerald" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Zero Static Violations Detected</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                No hardcoded credentials, eval vulnerabilities, or critical AST anti-patterns found in submitted code.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.staticFindings.map((sf, idx) => (
                <div key={idx} className="card" style={{ borderLeft: `4px solid var(--${sf.severity})` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-${sf.severity}`}>{sf.severity}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {sf.ruleId}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Line {sf.line}:{sf.column}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    {sf.message}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Action:</strong> {sf.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Diff & Suggested Code */}
      {activeTab === 'diff' && (
        <DiffViewer
          originalCode={originalCode}
          modifiedCode={result.suggestedFullCode}
          language={language}
          onApplyModified={onApplyModified}
        />
      )}

      {/* Tab 4: Recommended Unit Tests */}
      {activeTab === 'tests' && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <ListChecks size={18} className="text-primary" />
              <span>Recommended Unit Test Cases</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {result.suggestedTestCases.map((testCase, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    padding: '0.6rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span 
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ color: 'var(--text-main)' }}>{testCase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Executive Summary & Highlights */}
      {activeTab === 'overview' && (
        <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} /> Identified Strengths
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {result.strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--critical)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} /> Architectural Weaknesses
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {result.weaknesses.map((weak, idx) => (
                <li key={idx}>{weak}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
