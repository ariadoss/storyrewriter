import React, { useState, useCallback } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import type { Paragraph } from '../types';
import { combineRewrittenText } from '../utils/textProcessing';

interface CopyButtonProps {
  paragraphs: Paragraph[];
  disabled?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ paragraphs, disabled = false }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  const completedParagraphs = paragraphs.filter(p => p.status === 'completed' && p.rewrittenText);
  const hasCompletedText = completedParagraphs.length > 0;
  const rewrittenText = combineRewrittenText(paragraphs);

  const handleCopy = useCallback(async () => {
    if (!hasCompletedText || disabled) return;

    setCopyStatus('copying');

    try {
      await navigator.clipboard.writeText(rewrittenText);
      setCopyStatus('success');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopyStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 3000);
    }
  }, [rewrittenText, hasCompletedText, disabled]);

  const handleDownload = useCallback(() => {
    if (!hasCompletedText || disabled) return;

    const blob = new Blob([rewrittenText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rewritten-story.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [rewrittenText, hasCompletedText, disabled]);

  const getButtonContent = () => {
    switch (copyStatus) {
      case 'copying':
        return (
          <>
            <Copy className="button-icon spinning" />
            Copying...
          </>
        );
      case 'success':
        return (
          <>
            <Check className="button-icon" />
            Copied!
          </>
        );
      case 'error':
        return (
          <>
            <Copy className="button-icon" />
            Copy Failed
          </>
        );
      default:
        return (
          <>
            <Copy className="button-icon" />
            Copy All Rewritten Text
          </>
        );
    }
  };

  if (!hasCompletedText) {
    return null;
  }

  return (
    <div className="copy-actions">
      <div className="copy-info">
        <p>
          {completedParagraphs.length} of {paragraphs.length} paragraphs completed
          {completedParagraphs.length < paragraphs.length && ' (partial copy available)'}
        </p>
      </div>
      
      <div className="copy-buttons">
        <button
          onClick={handleCopy}
          disabled={disabled || copyStatus === 'copying'}
          className={`copy-button ${copyStatus}`}
          title="Copy rewritten text to clipboard"
        >
          {getButtonContent()}
        </button>

        <button
          onClick={handleDownload}
          disabled={disabled}
          className="download-button"
          title="Download rewritten text as file"
        >
          <Download className="button-icon" />
          Download
        </button>
      </div>

      <div className="copy-stats">
        <span className="word-count">
          {rewrittenText.split(/\s+/).length.toLocaleString()} words ready to copy
        </span>
      </div>
    </div>
  );
};
