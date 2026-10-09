import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../services/api';
import { StoredReview } from '../types';
import { useToast } from '../context/ToastContext';
import { 
  History, 
  Search, 
  Trash2, 
  ArrowRight, 
  Terminal, 
  Calendar, 
  FileCode, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadReviews = async () => {
    try {
      const res = await reviewApi.getReviews(1, 50);
      setReviews(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch review history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this review record?')) return;

    try {
      await reviewApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Review record deleted.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.language.toLowerCase().includes(q) ||
      r.focus.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={26} className="text-primary" />
            <span>Audit & Review History</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Inspect past AI evaluations, static findings, and generated diff remediation.
          </p>
        </div>

        <Link to="/workspace" className="btn btn-primary">
          <Terminal size={15} />
          <span>New Review</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input
          type="text"
          className="input"
          placeholder="Filter reviews by title, language, or focus..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.4rem' }}
        />
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '80px' }} />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FileCode size={40} className="text-dim" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {searchQuery ? 'No matching reviews found' : 'No review history yet'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
            {searchQuery
              ? 'Try modifying your search term or clear the filter.'
              : 'Submit your first piece of code in the workspace to generate structured findings and diffs.'}
          </p>
          <Link to="/workspace" className="btn btn-primary">
            Open Code Review Workspace
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredReviews.map((rev) => {
            const score = rev.result?.qualityScore ?? 80;
            const scoreClass = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'warning' : 'poor';
            const findingsCount = (rev.result?.findings?.length || 0) + (rev.result?.staticFindings?.length || 0);

            return (
              <Link
                key={rev.id}
                to={`/reviews/${rev.id}`}
                className="card"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                    className={`score-text-${scoreClass}`}
                  >
                    <span>{score}</span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>SCORE</span>
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {rev.title}
                      </span>
                      <span className="badge badge-info">{rev.language}</span>
                      <span className="badge badge-success">{rev.focus}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} /> {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                      <span>&bull;</span>
                      <span>{findingsCount} findings flagged</span>
                      {rev.hasFullCodeStored && (
                        <>
                          <span>&bull;</span>
                          <span style={{ color: 'var(--primary)' }}>Full code stored</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                  <button
                    className="btn-ghost"
                    onClick={(e) => handleDelete(rev.id, e)}
                    title="Delete Review Record"
                    style={{ padding: '0.4rem', color: 'var(--critical)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight size={18} className="text-dim" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
