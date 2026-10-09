import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Settings, 
  ShieldCheck, 
  KeyRound, 
  Sun, 
  Moon, 
  Database, 
  Check, 
  Lock,
  User,
  Sliders
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, updatePreferences } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [storeCode, setStoreCode] = useState<boolean>(user?.storeFullCodePreference ?? false);
  const [githubToken, setGithubToken] = useState<string>(
    () => localStorage.getItem('codelens_github_token') || ''
  );
  const [savingPrivacy, setSavingPrivacy] = useState<boolean>(false);

  const handlePrivacyToggle = async () => {
    const newValue = !storeCode;
    setStoreCode(newValue);
    if (isAuthenticated) {
      setSavingPrivacy(true);
      try {
        await updatePreferences(newValue);
        showToast('Privacy preferences updated!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to update preferences', 'error');
        setStoreCode(!newValue); // revert
      } finally {
        setSavingPrivacy(false);
      }
    } else {
      showToast('Note: Sign in to persist preferences permanently across devices.', 'info');
    }
  };

  const handleSaveGithubToken = () => {
    localStorage.setItem('codelens_github_token', githubToken.trim());
    showToast('GitHub token saved in local secure storage!', 'success');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={26} className="text-primary" />
          <span>User Settings & Privacy Controls</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage your code privacy, themes, API keys, and platform preferences.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Privacy & Code Retention Card */}
        <div className="card">
          <h2 className="card-title">
            <Lock size={18} className="text-emerald" />
            <span>Code Storage & Privacy Controls</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            By default, CodeLens AI stores only a safe 4-line snippet and structured findings in the database. 
            Full source code is never stored without your explicit consent.
          </p>

          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                Retain Full Source Code in History
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {storeCode 
                  ? 'Active: Complete source code will be retained for review comparisons.' 
                  : 'Disabled: Only redacted snippets and review findings are saved.'}
              </div>
            </div>

            <button
              className={`btn ${storeCode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handlePrivacyToggle}
              disabled={savingPrivacy}
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              {storeCode ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* GitHub Token Card */}
        <div className="card">
          <h2 className="card-title">
            <KeyRound size={18} className="text-primary" />
            <span>GitHub Personal Access Token</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
            Optional. Provide a fine-grained token with <code>repo:read</code> scope to inspect private repositories 
            or increase the unauthenticated 60 req/hr rate limit to 5,000 req/hr.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="password"
              className="input"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              style={{ flex: 1 }}
            />
            <button className="btn btn-secondary" onClick={handleSaveGithubToken}>
              Save Token
            </button>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="card">
          <h2 className="card-title">
            <Sliders size={18} className="text-amber" />
            <span>Theme Preference</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Currently using <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
            </span>
            <button className="btn btn-secondary" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>Toggle to {theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* User Account Details */}
        {isAuthenticated && user && (
          <div className="card">
            <h2 className="card-title">
              <User size={18} className="text-sky" />
              <span>Developer Profile</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Name:</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Email:</span>
                <strong>{user.email}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Role:</span>
                <span className="badge badge-info">{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
