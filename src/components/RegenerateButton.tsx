import React from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';

interface RegenerateButtonProps {
  paragraphId: string;
  isRegenerating: boolean;
  onRegenerate: (paragraphId: string) => void;
  disabled?: boolean;
}

export const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  paragraphId,
  isRegenerating,
  onRegenerate,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled && !isRegenerating) {
      onRegenerate(paragraphId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isRegenerating}
      className={`regenerate-button ${isRegenerating ? 'regenerating' : ''}`}
      title={isRegenerating ? 'Regenerating with increased creativity...' : 'Regenerate this paragraph with more variation'}
    >
      {isRegenerating ? (
        <>
          <Loader2 className="regenerate-icon spinning" />
          <span>Regenerating...</span>
        </>
      ) : (
        <>
          <RotateCcw className="regenerate-icon" />
          <span>Regenerate</span>
        </>
      )}
    </button>
  );
};
