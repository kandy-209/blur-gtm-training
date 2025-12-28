/**
 * Agent Rate Limiter
 * Prevents API rate limit issues with intelligent throttling
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstAllowance?: number;
}

class AgentRateLimiter {
  private limits: Map<string, { config: RateLimitConfig; requests: number[] }> = new Map();

  /**
   * Configure rate limit for agent
   */
  configure(agentName: string, config: RateLimitConfig): void {
    this.limits.set(agentName, {
      config,
      requests: [],
    });
  }

  /**
   * Check if request is allowed
   */
  isAllowed(agentName: string): boolean {
    const limit = this.limits.get(agentName);
    if (!limit) return true; // No limit configured

    const now = Date.now();
    const windowStart = now - limit.config.windowMs;

    // Remove old requests outside window
    limit.requests = limit.requests.filter(timestamp => timestamp > windowStart);

    // Check if under limit
    if (limit.requests.length < limit.config.maxRequests) {
      limit.requests.push(now);
      return true;
    }

    // Check burst allowance
    if (limit.config.burstAllowance) {
      const recentRequests = limit.requests.filter(t => t > now - 1000); // Last second
      if (recentRequests.length < limit.config.burstAllowance) {
        limit.requests.push(now);
        return true;
      }
    }

    return false;
  }

  /**
   * Get time until next request allowed
   */
  getTimeUntilAllowed(agentName: string): number {
    const limit = this.limits.get(agentName);
    if (!limit) return 0;

    const now = Date.now();
    const windowStart = now - limit.config.windowMs;
    limit.requests = limit.requests.filter(timestamp => timestamp > windowStart);

    if (limit.requests.length < limit.config.maxRequests) {
      return 0;
    }

    // Return time until oldest request expires
    const oldestRequest = Math.min(...limit.requests);
    return oldestRequest + limit.config.windowMs - now;
  }

  /**
   * Wait until request is allowed (with timeout)
   */
  async waitUntilAllowed(agentName: string, timeoutMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (this.isAllowed(agentName)) {
        return true;
      }

      const waitTime = this.getTimeUntilAllowed(agentName);
      if (waitTime > 0 && waitTime < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return false;
  }

  /**
   * Get current rate limit status
   */
  getStatus(agentName: string): {
    allowed: boolean;
    requestsInWindow: number;
    maxRequests: number;
    timeUntilAllowed: number;
  } {
    const limit = this.limits.get(agentName);
    if (!limit) {
      return {
        allowed: true,
        requestsInWindow: 0,
        maxRequests: Infinity,
        timeUntilAllowed: 0,
      };
    }

    const now = Date.now();
    const windowStart = now - limit.config.windowMs;
    limit.requests = limit.requests.filter(timestamp => timestamp > windowStart);

    return {
      allowed: limit.requests.length < limit.config.maxRequests,
      requestsInWindow: limit.requests.length,
      maxRequests: limit.config.maxRequests,
      timeUntilAllowed: this.getTimeUntilAllowed(agentName),
    };
  }
}

export const agentRateLimiter = new AgentRateLimiter();

// Configure default rate limits
agentRateLimiter.configure('CoachingAgent', {
  maxRequests: 30,
  windowMs: 60000, // 1 minute
  burstAllowance: 5,
});

agentRateLimiter.configure('AnalyticsAgent', {
  maxRequests: 20,
  windowMs: 60000,
  burstAllowance: 3,
});

agentRateLimiter.configure('ProspectIntelligenceAgent', {
  maxRequests: 15,
  windowMs: 60000,
  burstAllowance: 2,
});

