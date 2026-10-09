import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Code2, 
  LayoutDashboard, 
  History, 
  GitBranch, 
  Settings, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  Terminal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { healthApi } from '../../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [healthStatus, setHealthStatus] = useState<{ online: boolean; engine: string }>({
    online: false,
    engine: 'checking...',
  });

  useEffect(() => {
    let isMounted = true;
    async function checkBackend() {
      try {
        const data = await healthApi.checkHealth();
        if (isMounted) {
          setHealthStatus({
            online: true,
            engine: data.aiEngine.includes('gemini') ? 'Gemini 1.5' : 'Heuristic Engine',
          });
        }
      } catch {
        if (isMounted) {
          setHealthStatus({ online: false, engine: 'Offline' });
        }
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { label: 'Workspace', path: '/workspace', icon: Terminal },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'History', path: '/history', icon: History },
    { label: 'GitHub', path: '/github', icon: GitBranch },
  ];

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Code2 size={20} />
          </div>
          <span style={{ letterSpacing: '-0.02em' }}>
            Code<span style={{ color: 'var(--primary)' }}>Lens</span> AI
          </span>
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="nav-actions">
        {/* API Health indicator */}
        <div 
          className="health-status"
          title={`Backend status: ${healthStatus.online ? 'Online' : 'Offline'}. Engine: ${healthStatus.engine}`}
        >
          <span className={`status-dot ${healthStatus.online ? '' : 'offline'}`} />
          <span>
            {healthStatus.online ? healthStatus.engine : 'Backend Offline'}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          className="btn-ghost"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings */}
        <Link to="/settings" className="btn-ghost" title="Settings & Privacy">
          <Settings size={18} />
        </Link>

        {/* Auth Section */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div 
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-glow)',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{user?.name.split(' ')[0]}</span>
            </div>
            <button 
              className="btn-outline btn-ghost" 
              onClick={logout} 
              title="Sign out"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            <LogIn size={15} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
