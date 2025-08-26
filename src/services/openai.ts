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

  async rewriteParagraph(text: string, modelId?: string, retryCount = 0, isRegeneration = false): Promise<string> {
    let requestPromise: Promise<string> | null = null;

    try {
      // Rate limiting: wait if too many concurrent requests
      while (this.requestQueue.length >= this.maxConcurrentRequests) {
        await Promise.race(this.requestQueue);
      }

      requestPromise = this.makeRequest(text, modelId, isRegeneration);
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
        return this.rewriteParagraph(text, modelId, retryCount + 1, isRegeneration);
      }

      throw apiError;
    }
  }

  private async makeRequest(text: string, modelId?: string, isRegeneration = false): Promise<string> {
    // Get the model configuration
    const selectedModelId = modelId || CONFIG.defaultModel;
    const modelConfig = getModelById(CONFIG.models, selectedModelId);

    if (!modelConfig) {
      throw new Error(`Model "${selectedModelId}" not found in configuration`);
    }

    // Increase randomness for regeneration to get different results
    const temperature = isRegeneration ? 1.0 : 0.7;
    const topP = isRegeneration ? 0.9 : 1.0;

    // Add a subtle variation to the system message for regeneration
    const systemMessage = isRegeneration
      ? `${modelConfig.systemMessage}\n\nPlease provide a fresh, alternative rewrite that differs from previous versions while maintaining the same quality and style.`
      : modelConfig.systemMessage;

    const response = await this.client.chat.completions.create({
      model: modelConfig.id,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 1000,
      temperature,
      top_p: topP,
      // Add some randomness with presence_penalty for regeneration
      ...(isRegeneration && {
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      })
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
   * Regenerate a paragraph with increased randomness for variation
   */
  async regenerateParagraph(text: string, modelId?: string): Promise<string> {
    return this.rewriteParagraph(text, modelId, 0, true);
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
