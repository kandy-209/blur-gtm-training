/**
 * Advanced Agent Analytics
 * Deep analytics and insights for AI agent performance
 */

interface AgentAnalytics {
  agentName: string;
  totalCalls: number;
  successRate: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  cacheHitRate: number;
  costPerCall: number;
  totalCost: number;
  trends: {
    calls: number[];
    latency: number[];
    errors: number[];
  };
}

export class AdvancedAgentAnalytics {
  private metrics: Map<string, any[]> = new Map();

  /**
   * Calculate advanced analytics for agent
   */
  calculateAnalytics(agentName: string, timeWindow?: number): AgentAnalytics {
    const calls = this.getCalls(agentName, timeWindow);
    
    if (calls.length === 0) {
      return this.getEmptyAnalytics(agentName);
    }

    const successfulCalls = calls.filter(c => c.success);
    const failedCalls = calls.filter(c => !c.success);
    const cachedCalls = calls.filter(c => c.cacheHit);
    
    const latencies = calls.map(c => c.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      agentName,
      totalCalls: calls.length,
      successRate: (successfulCalls.length / calls.length) * 100,
      averageLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: latencies[p95Index] || 0,
      p99Latency: latencies[p99Index] || 0,
      errorRate: (failedCalls.length / calls.length) * 100,
      cacheHitRate: (cachedCalls.length / calls.length) * 100,
      costPerCall: calls.reduce((sum, c) => sum + (c.cost || 0), 0) / calls.length,
      totalCost: calls.reduce((sum, c) => sum + (c.cost || 0), 0),
      trends: this.calculateTrends(calls),
    };
  }

  private getCalls(agentName: string, timeWindow?: number): any[] {
    // This would integrate with agentMonitor
    // For now, return empty array
    return [];
  }

  private calculateTrends(calls: any[]): {
    calls: number[];
    latency: number[];
    errors: number[];
  } {
    // Group by time windows (e.g., hourly)
    const hourlyData: Record<string, { calls: number; latency: number; errors: number }> = {};
    
    calls.forEach(call => {
      const hour = new Date(call.timestamp).toISOString().slice(0, 13);
      if (!hourlyData[hour]) {
        hourlyData[hour] = { calls: 0, latency: 0, errors: 0 };
      }
      hourlyData[hour].calls++;
      hourlyData[hour].latency += call.duration;
      if (!call.success) {
        hourlyData[hour].errors++;
      }
    });

    const hours = Object.keys(hourlyData).sort();
    return {
      calls: hours.map(h => hourlyData[h].calls),
      latency: hours.map(h => hourlyData[h].latency / hourlyData[h].calls),
      errors: hours.map(h => hourlyData[h].errors),
    };
  }

  private getEmptyAnalytics(agentName: string): AgentAnalytics {
    return {
      agentName,
      totalCalls: 0,
      successRate: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      errorRate: 0,
      cacheHitRate: 0,
      costPerCall: 0,
      totalCost: 0,
      trends: {
        calls: [],
        latency: [],
        errors: [],
      },
    };
  }

  /**
   * Compare agents
   */
  compareAgents(agentNames: string[]): {
    best: string;
    worst: string;
    comparison: Record<string, AgentAnalytics>;
  } {
    const analytics: Record<string, AgentAnalytics> = {};
    
    agentNames.forEach(name => {
      analytics[name] = this.calculateAnalytics(name);
    });

    const sorted = agentNames.sort((a, b) => 
      analytics[b].successRate - analytics[a].successRate
    );

    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      comparison: analytics,
    };
  }
}

export const advancedAgentAnalytics = new AdvancedAgentAnalytics();

