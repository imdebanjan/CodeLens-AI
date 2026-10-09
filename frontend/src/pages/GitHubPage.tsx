import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { githubApi } from '../services/api';
import { GitHubItem } from '../types';
import { useToast } from '../context/ToastContext';
import { 
  GitBranch, 
  Folder, 
  FileCode, 
  Search, 
  Loader2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const GitHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [owner, setOwner] = useState<string>('expressjs');
  const [repo, setRepo] = useState<string>('express');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [token, setToken] = useState<string>(() => localStorage.getItem('codelens_github_token') || '');
  
  const [items, setItems] = useState<GitHubItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string; language: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);

  const fetchContents = async (path: string = '') => {
    if (!owner.trim() || !repo.trim()) {
      showToast('Please enter both repository owner and repository name.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await githubApi.getContents(owner, repo, path, token || undefined);
      setItems(data);
      setCurrentPath(path);
      setHasSearched(true);
      if (token) localStorage.setItem('codelens_github_token', token);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch GitHub repository contents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item: GitHubItem) => {
    if (item.type === 'dir') {
      await fetchContents(item.path);
    } else {
      setLoadingFile(true);
      try {
        const fileData = await githubApi.getFile(owner, repo, item.path, token || undefined);
        setSelectedFile(fileData);
      } catch (err: any) {
        showToast(err.message || 'Failed to load file contents.', 'error');
      } finally {
        setLoadingFile(false);
      }
    }
  };

  const handleOpenInWorkspace = () => {
    if (!selectedFile) return;
    // Store in session storage for Workspace to pick up
    sessionStorage.setItem('codelens_imported_code', selectedFile.content);
    sessionStorage.setItem('codelens_imported_language', selectedFile.language);
    sessionStorage.setItem('codelens_imported_title', `${owner}/${repo}: ${selectedFile.name}`);
    navigate('/workspace');
  };

  const pathSegments = currentPath ? currentPath.split('/') : [];

  return (
    <div style={{ maxWidth: '1150px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <GitBranch size={28} />
          <span>GitHub Repository Explorer</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Inspect open-source or private GitHub repositories, browse source trees, and trigger AI reviews with 1 click.
        </p>
      </div>

      {/* Query Bar Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Owner / Organization
            </label>
            <input
              type="text"
              className="input"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. facebook"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Repository Name
            </label>
            <input
              type="text"
              className="input"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="e.g. react"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              GitHub Token (Optional / Private Repos)
            </label>
            <input
              type="password"
              className="input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
            />
          </div>

          <div>
            <button
              className="btn btn-primary"
              onClick={() => fetchContents('')}
              disabled={loading}
              style={{ width: '100%', height: '38px' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span>Inspect Repository</span>
            </button>
          </div>
        </div>

        {/* Quick Picks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-dim)' }}>Try Popular Repos:</span>
          {[
            { o: 'expressjs', r: 'express' },
            { o: 'facebook', r: 'react' },
            { o: 'pallets', r: 'flask' },
          ].map((item) => (
            <button
              key={`${item.o}/${item.r}`}
              className="btn-ghost"
              onClick={() => {
                setOwner(item.o);
                setRepo(item.r);
                setCurrentPath('');
                setItems([]);
              }}
              style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
            >
              {item.o}/{item.r}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb Path Bar */}
      {hasSearched && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}
        >
          <button 
            className="btn-ghost"
            onClick={() => fetchContents('')}
            style={{ padding: '0.2rem 0.4rem', fontWeight: 600, color: 'var(--primary)' }}
          >
            {owner}/{repo}
          </button>
          {pathSegments.map((seg, idx) => {
            const subPath = pathSegments.slice(0, idx + 1).join('/');
            return (
              <React.Fragment key={subPath}>
                <ChevronRight size={14} className="text-dim" />
                <button
                  className="btn-ghost"
                  onClick={() => fetchContents(subPath)}
                  style={{ padding: '0.2rem 0.4rem', color: idx === pathSegments.length - 1 ? 'var(--text-main)' : 'var(--text-muted)' }}
                >
                  {seg}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Main Content Layout: File Tree & File Inspector */}
      {hasSearched && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedFile ? '1fr 1.3fr' : '1fr', gap: '1.25rem' }}>
          {/* File Tree */}
          <div className="card" style={{ padding: '0.5rem', maxHeight: '550px', overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Empty directory.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {items.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => handleItemClick(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {item.type === 'dir' ? (
                        <Folder size={16} className="text-primary" />
                      ) : (
                        <FileCode size={16} className="text-dim" />
                      )}
                      <span>{item.name}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {item.type === 'file' && item.size ? `${Math.round(item.size / 1024)} KB` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '550px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedFile.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Language: {selectedFile.language}
                  </span>
                </div>

                <button className="btn btn-primary" onClick={handleOpenInWorkspace} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  <Sparkles size={14} />
                  <span>Review in Workspace</span>
                </button>
              </div>

              <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#0d1117', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <pre className="font-mono" style={{ fontSize: '0.8rem', color: '#c9d1d9', lineHeight: '1.4' }}>
                  {selectedFile.content.slice(0, 3000)}
                  {selectedFile.content.length > 3000 && '\n\n// ... [Preview truncated. Full file ready for workspace analysis]'}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
