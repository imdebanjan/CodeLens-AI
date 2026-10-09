import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reviewApi } from '../services/api';
import { StoredReview } from '../types';
import { ReviewResults } from '../components/workspace/ReviewResults';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  FileCode, 
  Trash2, 
  Check, 
  Copy,
  Layers
} from 'lucide-react';

export const ReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [review, setReview] = useState<StoredReview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedMd, setCopiedMd] = useState<boolean>(false);

  useEffect(() => {
    async function loadReview() {
      if (!id) return;
      try {
        const data = await reviewApi.getReviewById(id);
        setReview(data);
      } catch (err: any) {
        showToast(err.message || 'Review not found', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadReview();
  }, [id]);

  const handleExportJson = () => {
    if (!review) return;
    const blob = new Blob([JSON.stringify(review, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codelens-review-${review.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON report downloaded!', 'success');
  };

  const handleCopyMarkdown = async () => {
    if (!review) return;
    const md = `# CodeLens AI Review Report: ${review.title}
**Date:** ${new Date(review.createdAt).toLocaleDateString()}
**Language:** ${review.language}
**Focus:** ${review.focus}
**Quality Score:** ${review.result.qualityScore}/100

## Summary
${review.result.summary}

## Rubric Breakdown
- Logic & Bugs: ${review.result.rubric.bugs}%
- Security: ${review.result.rubric.security}%
- Performance: ${review.result.rubric.performance}%
- Maintainability: ${review.result.rubric.maintainability}%

## Actionable Findings (${review.result.findings.length})
${review.result.findings.map(f => `### [${f.severity.toUpperCase()}] ${f.title} (Lines ${f.lineStart}-${f.lineEnd})
${f.description}
*Remediation:* ${f.remediation}
`).join('\n')}
`;

    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      showToast('Markdown summary copied to clipboard!', 'success');
      setTimeout(() => setCopiedMd(false), 2500);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleDelete = async () => {
    if (!review) return;
    if (!window.confirm('Delete this saved review?')) return;
    try {
      await reviewApi.deleteReview(review.id);
      showToast('Review deleted.', 'success');
      navigate('/history');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1150px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
        <div className="card skeleton" style={{ height: '350px' }} />
      </div>
    );
  }

  if (!review) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Review Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          This review record may have been deleted or you do not have permission to access it.
        </p>
        <Link to="/history" className="btn btn-primary">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Top Navigation & Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/history" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}>
          <ArrowLeft size={16} />
          <span>Back to Review History</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleCopyMarkdown} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            {copiedMd ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            <span>Copy Markdown</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExportJson} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            <Download size={14} />
            <span>Export JSON</span>
          </button>
          <button className="btn btn-danger" onClick={handleDelete} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Review Header Banner */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{review.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info">{review.language}</span>
            <span className="badge badge-success">{review.focus} focus</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={13} /> {new Date(review.createdAt).toLocaleString()}
          </span>
          <span>&bull;</span>
          <span>ID: {review.id}</span>
          <span>&bull;</span>
          <span>Storage: {review.hasFullCodeStored ? 'Full Code Retained' : 'Privacy Snippet'}</span>
        </div>
      </div>

      {/* Embedded Review Results Component */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <ReviewResults
          originalCode={review.sourceCodeSnippet}
          result={review.result}
          language={review.language}
        />
      </div>
    </div>
  );
};
