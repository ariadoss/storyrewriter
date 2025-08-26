import OpenAI from 'openai';
import type { OpenAIConfig, APIError, ModelConfig } from '../types';
import { parseModelConfig, getModelById } from '../utils/modelConfig';

// Configuration from environment variables
const CONFIG: OpenAIConfig = parseModelConfig();

class OpenAIService {
  private client: OpenAI;
  private requestQueue: Promise<any>[] = [];
  private readonly maxConcurrentRequests = 3;
  private readonly maxRetries = 5;
  private readonly baseDelay = 1000; // 1 second

  constructor() {
    this.client = new OpenAI({
      apiKey: CONFIG.apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
    });
  }

  async rewriteParagraph(text: string, modelId?: string, retryCount = 0): Promise<string> {
    let requestPromise: Promise<string> | null = null;

    try {
      // Rate limiting: wait if too many concurrent requests
      while (this.requestQueue.length >= this.maxConcurrentRequests) {
        await Promise.race(this.requestQueue);
      }

      requestPromise = this.makeRequest(text, modelId);
      this.requestQueue.push(requestPromise);

      const result = await requestPromise;

      // Remove completed request from queue
      this.requestQueue = this.requestQueue.filter(p => p !== requestPromise);

      return result;
    } catch (error) {
      // Remove failed request from queue
      if (requestPromise) {
        this.requestQueue = this.requestQueue.filter(p => p !== requestPromise);
      }

      const apiError = this.handleError(error);

      // Retry logic
      if (apiError.retryable && retryCount < this.maxRetries) {
        const delay = this.calculateDelay(retryCount);
        await this.sleep(delay);
        return this.rewriteParagraph(text, modelId, retryCount + 1);
      }

      throw apiError;
    }
  }

  private async makeRequest(text: string, modelId?: string): Promise<string> {
    // Get the model configuration
    const selectedModelId = modelId || CONFIG.defaultModel;
    const modelConfig = getModelById(CONFIG.models, selectedModelId);

    if (!modelConfig) {
      throw new Error(`Model "${selectedModelId}" not found in configuration`);
    }

    const response = await this.client.chat.completions.create({
      model: modelConfig.id,
      messages: [
        {
          role: 'system',
          content: modelConfig.systemMessage
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const rewrittenText = response.choices[0]?.message?.content;
    if (!rewrittenText) {
      throw new Error('No response from OpenAI API');
    }

    return rewrittenText.trim();
  }

  private handleError(error: any): APIError {
    if (error?.status === 429) {
      return {
        message: 'Rate limit exceeded. Retrying...',
        code: 'RATE_LIMIT',
        retryable: true
      };
    }
    
    if (error?.status >= 500) {
      return {
        message: 'Server error. Retrying...',
        code: 'SERVER_ERROR',
        retryable: true
      };
    }
    
    if (error?.status === 401) {
      return {
        message: 'Invalid API key',
        code: 'AUTH_ERROR',
        retryable: false
      };
    }
    
    return {
      message: error?.message || 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      retryable: false
    };
  }

  private calculateDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000;
    return exponentialDelay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get available models
   */
  getAvailableModels(): ModelConfig[] {
    return CONFIG.models;
  }

  /**
   * Get default model ID
   */
  getDefaultModelId(): string {
    return CONFIG.defaultModel;
  }
}

export const openAIService = new OpenAIService();
export { CONFIG as openAIConfig };
