/**
 * Agent Monitor
 * Real-time monitoring and observability for AI agents
 */

interface AgentCall {
  agentName: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  error?: string;
  inputSize: number;
  outputSize: number;
  cacheHit: boolean;
}

interface AgentMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  cacheHitRate: number;
  totalTokensUsed?: number;
  costEstimate?: number;
}

class AgentMonitor {
  private calls: AgentCall[] = [];
  private maxHistory = 1000;

  /**
   * Record an agent call
   */
  recordCall(call: AgentCall): void {
    this.calls.push(call);
    
    // Keep only recent history
    if (this.calls.length > this.maxHistory) {
      this.calls.shift();
    }
  }

  /**
   * Get metrics for a specific agent
   */
  getAgentMetrics(agentName: string, timeWindow?: number): AgentMetrics {
    let relevantCalls = this.calls.filter(c => c.agentName === agentName);
    
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      relevantCalls = relevantCalls.filter(c => c.timestamp.getTime() > cutoff);
    }

    if (relevantCalls.length === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageDuration: 0,
        cacheHitRate: 0,
      };
    }

    const successfulCalls = relevantCalls.filter(c => c.success).length;
    const failedCalls = relevantCalls.length - successfulCalls;
    const cacheHits = relevantCalls.filter(c => c.cacheHit).length;
    const totalDuration = relevantCalls.reduce((sum, c) => sum + c.duration, 0);

    return {
      totalCalls: relevantCalls.length,
      successfulCalls,
      failedCalls,
      averageDuration: totalDuration / relevantCalls.length,
      cacheHitRate: cacheHits / relevantCalls.length,
    };
  }

  /**
   * Get all agent metrics
   */
  getAllMetrics(): Record<string, AgentMetrics> {
    const agentNames = new Set(this.calls.map(c => c.agentName));
    const metrics: Record<string, AgentMetrics> = {};

    for (const agentName of agentNames) {
      metrics[agentName] = this.getAgentMetrics(agentName);
    }

    return metrics;
  }

  /**
   * Get recent calls
   */
  getRecentCalls(limit: number = 50): AgentCall[] {
    return this.calls.slice(-limit).reverse();
  }

  /**
   * Get error rate
   */
  getErrorRate(agentName?: string, timeWindow?: number): number {
    const calls = agentName
      ? this.calls.filter(c => c.agentName === agentName)
      : this.calls;

    const filteredCalls = timeWindow
      ? calls.filter(c => {
          const cutoff = Date.now() - timeWindow;
          return c.timestamp.getTime() > cutoff;
        })
      : calls;

    if (filteredCalls.length === 0) return 0;

    const errors = filteredCalls.filter(c => !c.success).length;
    return errors / filteredCalls.length;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.calls = [];
  }
}

export const agentMonitor = new AgentMonitor();

