import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { DashboardStats } from '../types';
import { 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  Layers, 
  ArrowUpRight, 
  TrendingUp, 
  FileCode,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '110px' }} />
          ))}
        </div>
      </div>
    );
  }

  const criticalAndHigh = (stats?.severityBreakdown.critical || 0) + (stats?.severityBreakdown.high || 0);

  return (
    <div style={{ maxWidth: '1150px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Engineering Analytics & Insights
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time quality scores, vulnerability detections, and review history analytics.
          </p>
        </div>

        <Link to="/workspace" className="btn btn-primary">
          <Terminal size={16} />
          <span>New Code Review</span>
        </Link>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <span>TOTAL REVIEWS</span>
            <Layers size={16} className="text-primary" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalReviews || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Indexed across repository history
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <span>AVERAGE QUALITY SCORE</span>
            <TrendingUp size={16} className="text-emerald" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: (stats?.averageQualityScore || 0) >= 80 ? 'var(--success)' : 'var(--medium)' }}>
            {stats?.averageQualityScore ? `${stats.averageQualityScore}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Weighted rubric evaluation
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <span>CRITICAL & HIGH ISSUES</span>
            <ShieldAlert size={16} className="text-rose" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: criticalAndHigh > 0 ? 'var(--critical)' : 'var(--text-main)' }}>
            {criticalAndHigh}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Flagged for urgent remediation
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <span>ACTIVE LANGUAGES</span>
            <FileCode size={16} className="text-amber" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {Object.keys(stats?.languageBreakdown || {}).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Supported syntax engines
          </div>
        </div>
      </div>

      {/* Grid: Severity Breakdown & Language Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Severity Distribution */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <AlertTriangle size={18} className="text-amber" />
            <span>Finding Severity Distribution</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Critical', count: stats?.severityBreakdown.critical || 0, color: 'var(--critical)' },
              { label: 'High', count: stats?.severityBreakdown.high || 0, color: 'var(--high)' },
              { label: 'Medium', count: stats?.severityBreakdown.medium || 0, color: 'var(--medium)' },
              { label: 'Low', count: stats?.severityBreakdown.low || 0, color: 'var(--low)' },
              { label: 'Info', count: stats?.severityBreakdown.info || 0, color: 'var(--info)' },
            ].map((item) => {
              const maxCount = Math.max(1, ...(Object.values(stats?.severityBreakdown || {}) as number[]));
              const percentage = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{item.count} findings</span>
                  </div>
                  <div style={{ height: '7px', backgroundColor: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.count > 0 ? Math.max(8, percentage) : 0}%`, backgroundColor: item.color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <FileCode size={18} className="text-primary" />
            <span>Reviewed Language Breakdown</span>
          </h3>
          {Object.keys(stats?.languageBreakdown || {}).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No reviews recorded yet. Run your first review in the workspace!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(stats?.languageBreakdown || {}).map(([lang, count]) => (
                <div 
                  key={lang}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.85rem' }}>
                    {lang}
                  </span>
                  <span className="badge badge-info">{count} reviews</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Score Trend */}
      {stats?.recentScoreTrend && stats.recentScoreTrend.length > 0 && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <BarChart3 size={18} className="text-emerald" />
            <span>Recent Review Score Trajectory</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {stats.recentScoreTrend.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                  {item.date}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.score >= 80 ? 'var(--success)' : 'var(--medium)' }}>
                  {item.score}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '0.25rem' }}>
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
