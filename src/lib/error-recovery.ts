'use client';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    onRetry,
    shouldRetry = () => true,
  } = options;

  let lastError: Error | undefined;
  let delay = retryDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
        };
      }

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1);
        }

        // Wait before retrying with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffMultiplier;
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxRetries + 1,
  };
}

export function isRetryableError(error: Error): boolean {
  const lowerMessage = error.message.toLowerCase();
  
  // Network errors are retryable
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return true;
  }

  // Timeout errors are retryable
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return true;
  }

  // 5xx server errors are retryable
  if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
    return true;
  }

  // Rate limit errors are retryable (with backoff)
  if (error.message.includes('429') || lowerMessage.includes('rate limit')) {
    return true;
  }

  // 4xx client errors are generally not retryable
  if (error.message.includes('400') || error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
    return false;
  }

  return false;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  [key: string]: unknown;
}

export class ErrorWithContext extends Error {
  context: ErrorContext;

  constructor(message: string, context: ErrorContext) {
    super(message);
    this.name = 'ErrorWithContext';
    this.context = context;
  }
}

export function createErrorContext(
  component: string,
  action: string,
  additionalContext?: Record<string, unknown>
): ErrorContext {
  return {
    component,
    action,
    timestamp: Date.now(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ...additionalContext,
  };
}

