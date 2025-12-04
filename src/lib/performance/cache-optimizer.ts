/**
 * Cache Performance Optimizer
 * Analyzes cache patterns and suggests optimizations
 */

import { getCacheMetrics } from '../next-cache-wrapper';
import { log } from '../logger';

export interface CacheOptimization {
  key: string;
  currentHitRate: number;
  recommendedTTL: number;
  currentTTL?: number;
  reason: string;
  potentialSavings: number; // Estimated API calls saved per day
}

export interface CacheAnalysis {
  overallHitRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  optimizations: CacheOptimization[];
  recommendations: string[];
}

/**
 * Analyze cache performance and suggest optimizations
 */
export function analyzeCachePerformance(): CacheAnalysis {
  const metrics = getCacheMetrics();
  const allMetrics = Object.values(metrics);

  const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
  const totalHits = allMetrics.reduce((sum, m) => sum + m.hits, 0);
  const totalMisses = allMetrics.reduce((sum, m) => sum + m.misses, 0);
  const totalStale = allMetrics.reduce((sum, m) => sum + m.staleServed, 0);

  const overallHitRate = totalRequests > 0
    ? ((totalHits + totalStale) / totalRequests) * 100
    : 0;

  const optimizations: CacheOptimization[] = [];
  const recommendations: string[] = [];

  // Analyze each cache key
  Object.entries(metrics).forEach(([key, metric]) => {
    const hitRate = metric.totalRequests > 0
      ? ((metric.hits + metric.staleServed) / metric.totalRequests) * 100
      : 0;

    // Low hit rate - might need longer TTL
    if (hitRate < 50 && metric.totalRequests > 10) {
      optimizations.push({
        key,
        currentHitRate: hitRate,
        recommendedTTL: 600, // 10 minutes
        reason: 'Low hit rate suggests data changes frequently or TTL too short',
        potentialSavings: Math.round(metric.misses * 0.5), // Estimate 50% improvement
      });
    }

    // High error rate - might need better error handling
    if (metric.errors > metric.totalRequests * 0.1) {
      recommendations.push(
        `High error rate for ${key}: ${((metric.errors / metric.totalRequests) * 100).toFixed(1)}%`
      );
    }
  });

  // Overall recommendations
  if (overallHitRate < 60) {
    recommendations.push('Consider increasing cache TTLs for frequently accessed data');
  }

  if (totalStale / totalRequests > 0.3) {
    recommendations.push('High stale data serving - consider shorter revalidate times');
  }

  if (totalMisses / totalRequests > 0.5) {
    recommendations.push('High miss rate - consider cache warming for popular keys');
  }

  return {
    overallHitRate: Math.round(overallHitRate * 100) / 100,
    totalRequests,
    totalHits,
    totalMisses,
    optimizations,
    recommendations,
  };
}

/**
 * Get cache health score (0-100)
 */
export function getCacheHealthScore(): number {
  const analysis = analyzeCachePerformance();
  
  let score = 100;
  
  // Deduct points for low hit rate
  if (analysis.overallHitRate < 50) {
    score -= 30;
  } else if (analysis.overallHitRate < 70) {
    score -= 15;
  }

  // Deduct points for high error rate
  const errorRate = analysis.totalRequests > 0
    ? (analysis.optimizations.filter(o => o.key.includes('error')).length / analysis.totalRequests) * 100
    : 0;
  
  if (errorRate > 10) {
    score -= 20;
  }

  // Deduct points for many optimizations needed
  if (analysis.optimizations.length > 5) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

