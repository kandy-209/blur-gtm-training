/**
 * Agent Auto-Retry
 * Intelligent automatic retry with circuit breaker pattern
 */

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

export class AgentAutoRetry {
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 60000; // 1 minute
  private readonly halfOpenMaxAttempts = 3;

  /**
   * Execute with automatic retry and circuit breaker
   */
  async executeWithRetry<T>(
    agentName: string,
    operation: string,
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    const timeout = options.timeout || 30000;

    // Check circuit breaker
    if (!this.isCircuitClosed(agentName)) {
      throw new Error(`Circuit breaker is open for ${agentName}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute with timeout
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), timeout)
          ),
        ]);

        // Record success
        this.recordSuccess(agentName);
        return result;
      } catch (error: any) {
        lastError = error;

        // Record failure
        this.recordFailure(agentName);

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    throw lastError || new Error('Unknown error');
  }

  /**
   * Check if circuit is closed (allowing requests)
   */
  private isCircuitClosed(agentName: string): boolean {
    const breaker = this.circuitBreakers.get(agentName);
    if (!breaker) return true;

    if (breaker.state === 'closed') {
      return true;
    }

    if (breaker.state === 'open') {
      // Check if enough time has passed to try half-open
      const timeSinceFailure = Date.now() - breaker.lastFailureTime;
      if (timeSinceFailure > this.resetTimeout) {
        breaker.state = 'half-open';
        breaker.successCount = 0;
        return true;
      }
      return false;
    }

    // half-open state
    return true;
  }

  /**
   * Record successful operation
   */
  private recordSuccess(agentName: string): void {
    let breaker = this.circuitBreakers.get(agentName);
    if (!breaker) {
      breaker = {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0,
      };
      this.circuitBreakers.set(agentName, breaker);
    }

    if (breaker.state === 'half-open') {
      breaker.successCount++;
      if (breaker.successCount >= this.halfOpenMaxAttempts) {
        breaker.state = 'closed';
        breaker.failureCount = 0;
      }
    } else {
      breaker.failureCount = 0;
    }
  }

  /**
   * Record failed operation
   */
  private recordFailure(agentName: string): void {
    let breaker = this.circuitBreakers.get(agentName);
    if (!breaker) {
      breaker = {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0,
      };
      this.circuitBreakers.set(agentName, breaker);
    }

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= this.failureThreshold) {
      breaker.state = 'open';
    } else if (breaker.state === 'half-open') {
      breaker.state = 'open';
    }
  }

  /**
   * Get circuit breaker status
   */
  getStatus(agentName: string): CircuitBreakerState | null {
    return this.circuitBreakers.get(agentName) || null;
  }

  /**
   * Reset circuit breaker
   */
  reset(agentName: string): void {
    this.circuitBreakers.delete(agentName);
  }
}

export const agentAutoRetry = new AgentAutoRetry();

