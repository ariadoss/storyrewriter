import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, FileText } from 'lucide-react';
import type { StoryRewriteState } from '../types';

interface ProgressTrackerProps {
  state: StoryRewriteState;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ state }) => {
  const { paragraphs, isProcessing, completedCount, totalCount } = state;
  
  if (totalCount === 0) {
    return null;
  }

  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const errorCount = paragraphs.filter(p => p.status === 'error').length;
  const processingCount = paragraphs.filter(p => p.status === 'processing').length;
  const pendingCount = paragraphs.filter(p => p.status === 'pending').length;

  const isComplete = completedCount === totalCount;
  const hasErrors = errorCount > 0;

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <div className="progress-title">
          <FileText className="progress-icon" />
          <h3>Rewriting Progress</h3>
        </div>
        
        <div className="progress-summary">
          {isComplete ? (
            <span className="status-complete">
              <CheckCircle className="status-icon" />
              Complete!
            </span>
          ) : isProcessing ? (
            <span className="status-processing">
              <Loader2 className="status-icon spinning" />
              Processing...
            </span>
          ) : (
            <span className="status-ready">Ready to start</span>
          )}
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${hasErrors ? 'has-errors' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-text">
          {completedCount} of {totalCount} paragraphs completed ({Math.round(progressPercentage)}%)
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-item">
          <CheckCircle className="stat-icon completed" />
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completedCount}</span>
        </div>

        {processingCount > 0 && (
          <div className="stat-item">
            <Loader2 className="stat-icon processing spinning" />
            <span className="stat-label">Processing</span>
            <span className="stat-value">{processingCount}</span>
          </div>
        )}

        {pendingCount > 0 && (
          <div className="stat-item">
            <Clock className="stat-icon pending" />
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        )}

        {errorCount > 0 && (
          <div className="stat-item">
            <AlertCircle className="stat-icon error" />
            <span className="stat-label">Errors</span>
            <span className="stat-value">{errorCount}</span>
          </div>
        )}
      </div>

      {hasErrors && (
        <div className="error-notice">
          <AlertCircle className="error-icon" />
          <span>
            Some paragraphs failed to process. The system will automatically retry up to 5 times.
          </span>
        </div>
      )}
    </div>
  );
};
