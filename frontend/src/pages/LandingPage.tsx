import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  GitPullRequest, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Zap, 
  Lock, 
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', width: '100%' }}>
      {/* Hero Header */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid var(--border-accent)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}
        >
          <Sparkles size={14} />
          <span>Next-Gen Full-Stack Developer Platform</span>
        </div>

        <h1 
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem'
          }}
        >
          Intelligent Code Reviews with <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Deterministic AST Static Rigor
          </span>
        </h1>

        <p 
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}
        >
          CodeLens AI unifies Google Gemini LLM reasoning with deterministic static analysis, 
          identifying security vulnerabilities, concurrency bugs, and architectural flaws with 
          side-by-side Monaco diff inspection.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/workspace" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            <Terminal size={18} />
            <span>Open Code Workspace</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            <span>View Live Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Code Preview Teaser Card */}
      <section style={{ marginBottom: '5rem' }}>
        <div 
          className="card"
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-strong)',
            padding: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div 
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
                review-preview.ts &mdash; Monaco IDE Dual View
              </span>
            </div>
            <span className="badge badge-critical">1 Critical CVE Prevented</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '1.25rem', gap: '1rem' }}>
            <div style={{ backgroundColor: '#0d1117', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--critical)', fontWeight: 600, marginBottom: '0.5rem' }}>
                ORIGINAL (Vulnerable Input)
              </div>
              <pre className="font-mono" style={{ fontSize: '0.8rem', color: '#f87171', lineHeight: '1.5' }}>
{`// Direct concatenated SQL query
const sql = "SELECT * FROM users " +
  "WHERE id = " + req.query.id;
eval(req.query.customHook); // RCE`}
              </pre>
            </div>

            <div style={{ backgroundColor: '#0d1117', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginBottom: '0.5rem' }}>
                CODELENS AI REMEDIATION (Suggested Fix)
              </div>
              <pre className="font-mono" style={{ fontSize: '0.8rem', color: '#4ade80', lineHeight: '1.5' }}>
{`// Parameterized statement + Schema validation
const id = z.string().uuid().parse(req.query.id);
const sql = "SELECT * FROM users WHERE id = $1";
await db.query(sql, [id]);`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Engineering-First Capabilities
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Architected to eliminate hallucinations with separate deterministic AST scanning.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Gemini 1.5 Reasoning</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Deep contextual code review evaluating business logic, edge conditions, concurrency patterns, and architecture.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Static AST Rule Engine</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Strictly verifies credentials, secret leaks, eval usage, memory leaks, and DOM XSS independently of LLM heuristics.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--medium)', marginBottom: '1rem' }}>
              <Code2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Monaco Diff Inspector</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Professional IDE split-screen diff comparison, line-by-line syntax highlighting, and 1-click clipboard actions.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: '1rem' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Privacy Controls</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Full source code is never stored by default unless you explicitly opt in. Review metadata is indexed securely.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner for Interviews / Placement */}
      <section className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Production Full-Stack Architecture
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
          Built with React 18, TypeScript, Vite, Monaco Editor, Express, Mongoose / MongoDB Atlas, 
          Zod schema validation, JWT auth, and automated Jest/Node test suites.
        </p>
        <Link to="/workspace" className="btn btn-primary">
          Start First Code Review
        </Link>
      </section>
    </div>
  );
};
