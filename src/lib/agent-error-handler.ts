/**
 * Agent Error Handler
 * Centralized error handling and recovery for AI agents
 */

interface ErrorContext {
  agentName: string;
  operation: string;
  error: Error;
  context?: any;
  retryable: boolean;
}

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class AgentErrorHandler {
  private errorHistory: ErrorContext[] = [];
  private maxHistory = 100;

  /**
   * Handle agent error with retry logic
   */
  async handleWithRetry<T>(
    agentName: string,
    operation: string,
    fn: () => Promise<T>,
    config: RetryConfig = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    }
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = config.initialDelay;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Record error
        this.recordError({
          agentName,
          operation,
          error,
          retryable: this.isRetryable(error),
        });

        // Don't retry if not retryable or last attempt
        if (!this.isRetryable(error) || attempt === config.maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }

    throw lastError || new Error('Unknown error');
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: any): boolean {
    // Network errors are retryable
    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      return true;
    }

    // Rate limit errors are retryable
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return true;
    }

    // 5xx errors are retryable
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // 4xx errors (except 429) are not retryable
    if (error.status >= 400 && error.status < 500) {
      return false;
    }

    return false;
  }

  /**
   * Record error for analysis
   */
  private recordError(context: ErrorContext): void {
    this.errorHistory.push(context);

    // Keep only recent history
    if (this.errorHistory.length > this.maxHistory) {
      this.errorHistory.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context.agentName}] Error in ${context.operation}:`, context.error);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(agentName?: string): {
    totalErrors: number;
    retryableErrors: number;
    nonRetryableErrors: number;
    recentErrors: ErrorContext[];
  } {
    const errors = agentName
      ? this.errorHistory.filter(e => e.agentName === agentName)
      : this.errorHistory;

    const recentErrors = errors.slice(-10);

    return {
      totalErrors: errors.length,
      retryableErrors: errors.filter(e => e.retryable).length,
      nonRetryableErrors: errors.filter(e => !e.retryable).length,
      recentErrors,
    };
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
  }
}

export const agentErrorHandler = new AgentErrorHandler();

