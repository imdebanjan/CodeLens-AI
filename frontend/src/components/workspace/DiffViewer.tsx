import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Copy, Check, Split, AlignJustify } from 'lucide-react';

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language: string;
  onApplyModified?: (code: string) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language,
  onApplyModified,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [inlineView, setInlineView] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(modifiedCode);
      setCopied(true);
      showToast('Refactored code copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 600 }}>Diff Inspection</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            Original (Left) vs. AI Suggested Fix (Right)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn-ghost"
            onClick={() => setInlineView(!inlineView)}
            title={inlineView ? 'Switch to Side-by-Side Diff' : 'Switch to Inline Diff'}
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {inlineView ? <Split size={14} /> : <AlignJustify size={14} />}
            <span>{inlineView ? 'Side-by-Side' : 'Inline'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Refactored'}</span>
          </button>

          {onApplyModified && (
            <button
              className="btn btn-primary"
              onClick={() => {
                onApplyModified(modifiedCode);
                showToast('Applied refactored code to main editor!', 'success');
              }}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Apply to Editor
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '400px' }}>
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={modifiedCode}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            renderSideBySide: !inlineView,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};
