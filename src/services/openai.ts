import OpenAI from 'openai';
import type { OpenAIConfig, APIError } from '../types';

// Configuration from environment variables
const CONFIG: OpenAIConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: import.meta.env.VITE_OPENAI_MODEL || '',
  systemMessage: import.meta.env.VITE_SYSTEM_MESSAGE || ''
};

// Validate configuration
if (!CONFIG.apiKey) {
  throw new Error('VITE_OPENAI_API_KEY environment variable is required');
}
if (!CONFIG.model) {
  throw new Error('VITE_OPENAI_MODEL environment variable is required');
}
if (!CONFIG.systemMessage) {
  throw new Error('VITE_SYSTEM_MESSAGE environment variable is required');
}

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

  async rewriteParagraph(text: string, retryCount = 0): Promise<string> {
    let requestPromise: Promise<string> | null = null;

    try {
      // Rate limiting: wait if too many concurrent requests
      while (this.requestQueue.length >= this.maxConcurrentRequests) {
        await Promise.race(this.requestQueue);
      }

      requestPromise = this.makeRequest(text);
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
        return this.rewriteParagraph(text, retryCount + 1);
      }

      throw apiError;
    }
  }

  private async makeRequest(text: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: CONFIG.model,
      messages: [
        {
          role: 'system',
          content: CONFIG.systemMessage
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
}

export const openAIService = new OpenAIService();
