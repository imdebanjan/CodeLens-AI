import React, { useState } from 'react';
import { MonacoCodeEditor, CODE_PRESETS } from '../components/workspace/MonacoCodeEditor';
import { ReviewResults } from '../components/workspace/ReviewResults';
import { ReviewFocus, StoredReview } from '../types';
import { reviewApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Play, 
  Loader2, 
  ShieldAlert, 
  Bug, 
  Zap, 
  BookOpen, 
  Sparkles, 
  Terminal,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { showToast } = useToast();
  const [code, setCode] = useState<string>(CODE_PRESETS[0].code);
  const [language, setLanguage] = useState<string>(CODE_PRESETS[0].language);
  const [focus, setFocus] = useState<ReviewFocus>('comprehensive');
  const [title, setTitle] = useState<string>('Express API Security & Optimization');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<StoredReview | null>(null);

  const focusOptions: Array<{ id: ReviewFocus; label: string; icon: any }> = [
    { id: 'comprehensive', label: 'Comprehensive', icon: Sparkles },
    { id: 'security', label: 'Security Focus', icon: ShieldAlert },
    { id: 'bugs', label: 'Bug Detection', icon: Bug },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'readability', label: 'Readability', icon: BookOpen },
  ];

  const handleSubmitReview = async () => {
    if (!code.trim()) {
      showToast('Please enter some code to review.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const stored = await reviewApi.submitReview({
        code,
        language,
        focus,
        title: title.trim() || undefined,
      });
      setReviewData(stored);
      showToast('Code review completed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to complete code review.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 61px)' }}>
      {/* Workspace Sub-Toolbar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.25rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review Title (e.g. Auth Controller Optimization)"
            style={{ maxWidth: '340px', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
          />

          {/* Focus Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
            {focusOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = focus === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFocus(opt.id)}
                  className={`btn-ghost ${isSelected ? 'btn-secondary' : ''}`}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Icon size={13} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmitReview}
          disabled={isLoading || !code.trim()}
          style={{ padding: '0.45rem 1.25rem', fontWeight: 600 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing Code...</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>Run CodeLens Review</span>
            </>
          )}
        </button>
      </div>

      {/* Split Workspace Editor & Results Pane */}
      <div className="workspace-container">
        {/* Left Pane: Monaco Code Input */}
        <MonacoCodeEditor
          code={code}
          onChange={setCode}
          language={language}
          onLanguageChange={setLanguage}
        />

        {/* Right Pane: Review Results or Empty / Loading State */}
        {isLoading ? (
          <div 
            className="results-pane"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-accent)'
              }}
            >
              <Loader2 size={30} className="text-primary animate-spin" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Analyzing Code Architecture & Security
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', lineHeight: '1.5' }}>
              Running deterministic AST static rules and querying AI intelligence for logic flaws, 
              performance improvements, and side-by-side diff remediation.
            </p>
          </div>
        ) : reviewData ? (
          <ReviewResults
            originalCode={code}
            result={reviewData.result}
            language={language}
            onApplyModified={(newCode) => setCode(newCode)}
          />
        ) : (
          <div 
            className="results-pane"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                marginBottom: '1rem'
              }}
            >
              <Terminal size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Ready for Review
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Paste your source code in the editor or choose a preset snippet, select your desired review focus, and click <strong>Run CodeLens Review</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setCode(CODE_PRESETS[1].code);
                  setLanguage(CODE_PRESETS[1].language);
                  setTitle('Async Payment Handler');
                  setFocus('bugs');
                }}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Load Async Bug Sample
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
