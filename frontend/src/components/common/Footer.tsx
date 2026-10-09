import React from 'react';
import { ShieldCheck, Cpu, Database, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <span>&copy; {new Date().getFullYear()} CodeLens AI. Built for Software Engineering excellence.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Cpu size={14} className="text-primary" /> Google Gemini 1.5
          </span>
          <span>&bull;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={14} className="text-emerald" /> AST Static Engine
          </span>
          <span>&bull;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Database size={14} className="text-amber" /> MongoDB / Mongoose
          </span>
        </div>
      </div>
      <div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer" 
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          GitHub Repository
        </a>
      </div>
    </footer>
  );
};
