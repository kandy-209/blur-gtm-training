'use client';

import { errorPredictor, selfHealingSystem } from './error-prediction';
import { mlPerformanceOptimizer } from './ml-performance';
import { observabilitySystem } from './observability';

export interface SystemHealth {
  score: number; // 0-100
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    errorRate: number;
    performanceScore: number;
    memoryUsage: number;
    responseTime: number;
  };
  recommendations: string[];
}

export class AutonomousSystem {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private optimizationInterval: NodeJS.Timeout | null = null;
  private healthHistory: SystemHealth[] = [];

  start(): void {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Optimization every 5 minutes
    this.optimizationInterval = setInterval(() => {
      this.performOptimization();
    }, 300000);

    // Initial health check
    this.performHealthCheck();
  }

  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
  }

  private performHealthCheck(): SystemHealth {
    const errorRate = observabilitySystem.getAverageMetric('error_rate', 60000);
    const performanceScore = this.calculatePerformanceScore();
    const memoryUsage = this.getMemoryUsage();
    const responseTime = observabilitySystem.getAverageMetric('response_time', 60000);

    // Calculate overall health score
    const errorScore = Math.max(0, 100 - errorRate * 1000);
    const performanceScoreNormalized = performanceScore;
    const memoryScore = Math.max(0, 100 - (memoryUsage / 100) * 100);
    const responseScore = Math.max(0, 100 - (responseTime / 1000) * 100);

    const overallScore =
      (errorScore * 0.3 +
        performanceScoreNormalized * 0.3 +
        memoryScore * 0.2 +
        responseScore * 0.2);

    const status: SystemHealth['status'] =
      overallScore >= 80
        ? 'healthy'
        : overallScore >= 50
        ? 'degraded'
        : 'critical';

    const recommendations = this.generateRecommendations({
      errorRate,
      performanceScore,
      memoryUsage,
      responseTime,
    });

    const health: SystemHealth = {
      score: overallScore,
      status,
      metrics: {
        errorRate,
        performanceScore,
        memoryUsage,
        responseTime,
      },
      recommendations,
    };

    this.healthHistory.push(health);
    if (this.healthHistory.length > 100) {
      this.healthHistory.shift();
    }

    // Trigger actions based on health
    this.actOnHealth(health);

    return health;
  }

  private calculatePerformanceScore(): number {
    const slowestSpans = observabilitySystem.getSlowestSpans(5);
    if (slowestSpans.length === 0) return 100;

    const avgDuration = slowestSpans.reduce((sum, s) => sum + (s.duration || 0), 0) / slowestSpans.length;
    return Math.max(0, 100 - (avgDuration / 10));
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1048576; // MB
    }
    return 0;
  }

  private generateRecommendations(metrics: SystemHealth['metrics']): string[] {
    const recommendations: string[] = [];

    if (metrics.errorRate > 0.1) {
      recommendations.push('High error rate detected. Consider enabling error prediction.');
    }

    if (metrics.performanceScore < 70) {
      recommendations.push('Performance degraded. Consider enabling aggressive caching.');
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('High memory usage. Consider cleanup or optimization.');
    }

    if (metrics.responseTime > 500) {
      recommendations.push('Slow response times. Consider enabling prefetching.');
    }

    return recommendations;
  }

  private actOnHealth(health: SystemHealth): void {
    if (health.status === 'critical') {
      // Emergency actions
      this.emergencyOptimization();
    } else if (health.status === 'degraded') {
      // Preventive actions
      this.preventiveOptimization();
    }
  }

  private emergencyOptimization(): void {
    console.warn('[Autonomous System] Emergency optimization triggered');

    // Clear caches
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }

    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    // Reduce active connections
    // Could implement connection pooling here
  }

  private preventiveOptimization(): void {
    console.log('[Autonomous System] Preventive optimization triggered');

    // Analyze error patterns
    const likelyErrors = errorPredictor.getLikelyErrors();
    for (const error of likelyErrors) {
      // Attempt proactive healing
      const mockError = new Error(error.errorType);
      selfHealingSystem.attemptHealing(mockError, {
        component: error.component,
        action: error.action,
      });
    }

    // Optimize performance
    const strategies = mlPerformanceOptimizer.getAdaptiveStrategies();
    // Apply strategies based on current system state
    for (const [key, strategy] of strategies.entries()) {
      console.log(`[Autonomous System] Applying ${key} strategy: ${strategy}`);
      // Strategy application logic would go here
      // For example: enable aggressive caching, prefetching, etc.
    }
  }

  private performOptimization(): void {
    console.log('[Autonomous System] Performing scheduled optimization');

    // Analyze metrics
    const metrics = observabilitySystem.getMetrics();
    const errorRate = observabilitySystem.getAverageMetric('error_rate', 300000);

    // Predict and prevent errors
    errorPredictor.analyzeErrors();
    const predictions = errorPredictor.getLikelyErrors();

    // Self-optimize based on patterns
    const behaviorPatterns = mlPerformanceOptimizer.getBehaviorPatterns();
    for (const pattern of behaviorPatterns) {
      if (pattern.userSatisfaction < 0.5) {
        // Low satisfaction - optimize
        const strategy = mlPerformanceOptimizer.getOptimalStrategy(pattern.component);
        // Apply strategy
        console.log(`Optimizing ${pattern.component} with strategy:`, strategy);
      }
    }
  }

  getHealth(): SystemHealth | null {
    return this.healthHistory[this.healthHistory.length - 1] || null;
  }

  getHealthHistory(): SystemHealth[] {
    return [...this.healthHistory];
  }

  getHealthTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.healthHistory.length < 3) return 'stable';

    const recent = this.healthHistory.slice(-3);
    const trend = recent[2].score - recent[0].score;

    if (trend > 5) return 'improving';
    if (trend < -5) return 'degrading';
    return 'stable';
  }
}

export const autonomousSystem = new AutonomousSystem();

