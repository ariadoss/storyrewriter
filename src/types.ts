export interface Paragraph {
  id: string;
  originalText: string;
  rewrittenText?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  retryCount: number;
}

export interface StoryRewriteState {
  originalStory: string;
  paragraphs: Paragraph[];
  isProcessing: boolean;
  completedCount: number;
  totalCount: number;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  systemMessage: string;
}

export interface APIError {
  message: string;
  code?: string;
  retryable: boolean;
}
