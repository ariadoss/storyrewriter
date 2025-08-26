import React from 'react';
import { ChevronDown, Wand2 } from 'lucide-react';
import type { ModelConfig } from '../types';

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onModelChange,
  disabled = false
}) => {
  const selectedModel = models.find(model => model.id === selectedModelId);

  return (
    <div className="model-selector">
      <div className="selector-header">
        <Wand2 className="selector-icon" />
        <label htmlFor="model-select" className="selector-label">
          Rewrite Style
        </label>
      </div>
      
      <div className="selector-container">
        <select
          id="model-select"
          value={selectedModelId}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled}
          className="model-select"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.displayName}
            </option>
          ))}
        </select>
        <ChevronDown className="select-arrow" />
      </div>
      
      {selectedModel && (
        <div className="model-description">
          <p className="description-text">
            Using <strong>{selectedModel.displayName}</strong> for rewriting
          </p>
        </div>
      )}
    </div>
  );
};
