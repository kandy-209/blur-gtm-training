/**
 * Advanced Performance Optimizer
 * Deep performance optimizations for AI agents and components
 */

interface PerformanceMetrics {
  agentCallTime: number;
  componentRenderTime: number;
  dataProcessingTime: number;
  totalTime: number;
}

class AdvancedPerformanceOptimizer {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Cache agent results with intelligent TTL
   */
  cacheAgentResult(key: string, data: any, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cached agent result if still valid
   */
  getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Track performance metrics
   */
  trackMetrics(operation: string, metrics: PerformanceMetrics): void {
    const existing = this.metrics.get(operation) || [];
    existing.push(metrics);
    
    // Keep only last 100 metrics
    if (existing.length > 100) {
      existing.shift();
    }
    
    this.metrics.set(operation, existing);
  }

  /**
   * Get average performance for operation
   */
  getAveragePerformance(operation: string): PerformanceMetrics | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return null;

    const avg = metrics.reduce(
      (acc, m) => ({
        agentCallTime: acc.agentCallTime + m.agentCallTime,
        componentRenderTime: acc.componentRenderTime + m.componentRenderTime,
        dataProcessingTime: acc.dataProcessingTime + m.dataProcessingTime,
        totalTime: acc.totalTime + m.totalTime,
      }),
      { agentCallTime: 0, componentRenderTime: 0, dataProcessingTime: 0, totalTime: 0 }
    );

    const count = metrics.length;
    return {
      agentCallTime: avg.agentCallTime / count,
      componentRenderTime: avg.componentRenderTime / count,
      dataProcessingTime: avg.dataProcessingTime / count,
      totalTime: avg.totalTime / count,
    };
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Batch agent calls for efficiency
   */
  async batchAgentCalls<T>(
    calls: Array<() => Promise<T>>,
    maxConcurrent: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < calls.length; i += maxConcurrent) {
      const batch = calls.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(batch.map(call => call()));
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Clear old cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const advancedPerformanceOptimizer = new AdvancedPerformanceOptimizer();

// Cleanup cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    advancedPerformanceOptimizer.cleanupCache();
  }, 5 * 60 * 1000);
}

