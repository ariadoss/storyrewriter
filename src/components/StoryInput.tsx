import React, { useState, useCallback } from 'react';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { validateText, countWords, estimateReadingTime } from '../utils/textProcessing';

interface StoryInputProps {
  onStorySubmit: (story: string) => void;
  isProcessing: boolean;
}

export const StoryInput: React.FC<StoryInputProps> = ({ onStorySubmit, isProcessing }) => {
  const [story, setStory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStoryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStory = e.target.value;
    setStory(newStory);
    setError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateText(story);
    if (!validation.isValid) {
      setError(validation.message || 'Invalid text');
      return;
    }
    
    setError(null);
    onStorySubmit(story);
  }, [story, onStorySubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const wordCount = story.trim() ? countWords(story) : 0;
  const readingTime = story.trim() ? estimateReadingTime(story) : 0;

  return (
    <div className="story-input">
      <div className="input-header">
        <div className="header-content">
          <FileText className="header-icon" />
          <h2>Original Story</h2>
        </div>
        <div className="story-stats">
          {wordCount > 0 && (
            <>
              <span className="stat">{wordCount.toLocaleString()} words</span>
              <span className="stat">{readingTime} min read</span>
            </>
          )}
        </div>
      </div>

      <div className="input-container">
        <textarea
          value={story}
          onChange={handleStoryChange}
          onKeyDown={handleKeyDown}
          placeholder="Paste your story here... (Ctrl+Enter to process)"
          className={`story-textarea ${error ? 'error' : ''}`}
          disabled={isProcessing}
          rows={20}
        />
        
        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="input-actions">
        <button
          onClick={handleSubmit}
          disabled={!story.trim() || isProcessing}
          className="submit-button"
        >
          <Upload className="button-icon" />
          {isProcessing ? 'Processing...' : 'Rewrite Story'}
        </button>
        
        <div className="help-text">
          <p>Tip: Use Ctrl+Enter to quickly submit your story for rewriting.</p>
        </div>
      </div>
    </div>
  );
};
