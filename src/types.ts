export interface Paragraph {
  id: string;
  originalText: string;
  rewrittenText?: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'regenerating';
  error?: string;
  retryCount: number;
  modelId?: string; // Track which model was used for this paragraph
}

export interface StoryRewriteState {
  originalStory: string;
  paragraphs: Paragraph[];
  isProcessing: boolean;
  completedCount: number;
  totalCount: number;
  selectedModelId?: string; // Track the currently selected model
}

export interface ModelConfig {
  id: string;
  displayName: string;
  systemMessage: string;
}

export interface OpenAIConfig {
  apiKey: string;
  models: ModelConfig[];
  defaultModel: string;
}

export interface APIError {
  message: string;
  code?: string;
  retryable: boolean;
}
