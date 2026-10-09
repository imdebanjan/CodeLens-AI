import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Code2, LogIn, UserPlus, Sparkles, Loader2, ShieldCheck } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Successfully signed in!', 'success');
      } else {
        await register(name, email, password);
        showToast('Account registered successfully!', 'success');
      }
      navigate('/workspace');
    } catch (err: any) {
      showToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setName('Alex Developer');
    setEmail('alex.dev@codelens.ai');
    setPassword('Developer123!');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1.5rem', width: '100%' }}>
      <div className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 0.75rem auto',
              boxShadow: '0 0 16px var(--primary-glow)'
            }}
          >
            <Code2 size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Sign in to CodeLens AI' : 'Create Developer Account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {mode === 'login' 
              ? 'Access your saved review history and custom settings' 
              : 'Join the next-generation automated code review platform'}
          </p>
        </div>

        {/* Tab switcher */}
        <div 
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-app)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            type="button"
            className={`btn-ghost ${mode === 'login' ? 'btn-secondary' : ''}`}
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              fontSize: '0.85rem',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: mode === 'login' ? 600 : 400
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn-ghost ${mode === 'register' ? 'btn-secondary' : ''}`}
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              fontSize: '0.85rem',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: mode === 'register' ? 600 : 400
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Alex Developer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              className="input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.65rem' }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleFillDemo}
            style={{ fontSize: '0.78rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Sparkles size={13} />
            <span>Fill Demo Credentials (1-Click Test)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
