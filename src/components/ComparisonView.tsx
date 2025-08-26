import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { RegenerateButton } from './RegenerateButton';
import type { Paragraph } from '../types';

interface ComparisonViewProps {
  paragraphs: Paragraph[];
  onRegenerateParagraph: (paragraphId: string) => void;
  isProcessing: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  paragraphs,
  onRegenerateParagraph,
  isProcessing
}) => {
  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <div className="column-header">
          <h3>Original Text</h3>
        </div>
        <div className="column-header">
          <h3>Rewritten Text</h3>
        </div>
      </div>

      <div className="comparison-content">
        {paragraphs.map((paragraph, index) => (
          <ParagraphComparison
            key={paragraph.id}
            paragraph={paragraph}
            index={index}
            onRegenerateParagraph={onRegenerateParagraph}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    </div>
  );
};

interface ParagraphComparisonProps {
  paragraph: Paragraph;
  index: number;
  onRegenerateParagraph: (paragraphId: string) => void;
  isProcessing: boolean;
}

const ParagraphComparison: React.FC<ParagraphComparisonProps> = ({
  paragraph,
  index,
  onRegenerateParagraph,
  isProcessing
}) => {
  const getStatusIcon = () => {
    switch (paragraph.status) {
      case 'completed':
        return <CheckCircle className="status-icon completed" />;
      case 'processing':
        return <Loader2 className="status-icon processing" />;
      case 'regenerating':
        return <Loader2 className="status-icon regenerating" />;
      case 'error':
        return <AlertCircle className="status-icon error" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusText = () => {
    switch (paragraph.status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing...';
      case 'regenerating':
        return 'Regenerating...';
      case 'error':
        return `Error${paragraph.retryCount > 0 ? ` (Retry ${paragraph.retryCount})` : ''}`;
      default:
        return 'Pending';
    }
  };

  return (
    <div className={`paragraph-comparison ${paragraph.status}`}>
      <div className="paragraph-number">
        <span>#{index + 1}</span>
        <div className="status-indicator">
          {getStatusIcon()}
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>

      <div className="paragraph-content">
        <div className="original-column">
          <div className="paragraph-text">
            {paragraph.originalText}
          </div>
        </div>

        <div className="rewritten-column">
          <div className="paragraph-text">
            {paragraph.status === 'processing' && (
              <div className="processing-placeholder">
                <Loader2 className="processing-spinner" />
                <span>Rewriting paragraph...</span>
              </div>
            )}

            {paragraph.status === 'regenerating' && (
              <div className="processing-placeholder">
                <Loader2 className="processing-spinner" />
                <span>Regenerating paragraph...</span>
              </div>
            )}

            {paragraph.status === 'error' && (
              <div className="error-placeholder">
                <AlertCircle className="error-icon" />
                <span>{paragraph.error || 'Failed to rewrite paragraph'}</span>
                {paragraph.retryCount < 5 && (
                  <span className="retry-info">Retrying...</span>
                )}
              </div>
            )}

            {paragraph.status === 'completed' && paragraph.rewrittenText && (
              <div className="rewritten-content">
                <div className="rewritten-text">
                  {paragraph.rewrittenText}
                </div>
                <div className="paragraph-actions">
                  <RegenerateButton
                    paragraphId={paragraph.id}
                    isRegenerating={false}
                    onRegenerate={onRegenerateParagraph}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            )}

            {paragraph.status === 'pending' && (
              <div className="pending-placeholder">
                <Clock className="pending-icon" />
                <span>Waiting to process...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
