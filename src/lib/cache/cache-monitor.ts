/**
 * Cache Monitor
 * Real-time monitoring and alerting for cache performance
 */

import { getCacheMetrics } from '../next-cache-wrapper';
import { log } from '../logger';

export interface CacheHealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  hitRate: number;
  errorRate: number;
  staleRate: number;
  recommendations: string[];
}

export interface AlertThresholds {
  minHitRate?: number; // Default: 70%
  maxErrorRate?: number; // Default: 5%
  maxStaleRate?: number; // Default: 20%
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  minHitRate: 70,
  maxErrorRate: 5,
  maxStaleRate: 20,
};

/**
 * Get cache health status
 */
export function getCacheHealth(thresholds: AlertThresholds = {}): CacheHealthStatus {
  const config = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const metrics = getCacheMetrics();
  
  // Aggregate metrics across all keys
  let totalHits = 0;
  let totalMisses = 0;
  let totalErrors = 0;
  let totalStale = 0;
  let totalRequests = 0;

  Object.values(metrics).forEach((metric) => {
    totalHits += metric.hits;
    totalMisses += metric.misses;
    totalErrors += metric.errors;
    totalStale += metric.staleServed;
    totalRequests += metric.totalRequests;
  });

  const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  const staleRate = totalRequests > 0 ? (totalStale / totalRequests) * 100 : 0;

  const recommendations: string[] = [];
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

  // Check hit rate
  if (hitRate < (config.minHitRate || 70)) {
    status = hitRate < 50 ? 'critical' : 'degraded';
    recommendations.push(`Hit rate is low (${hitRate.toFixed(1)}%). Consider increasing TTL or warming cache.`);
  }

  // Check error rate
  if (errorRate > (config.maxErrorRate || 5)) {
    status = errorRate > 10 ? 'critical' : 'degraded';
    recommendations.push(`Error rate is high (${errorRate.toFixed(1)}%). Check API availability and error handling.`);
  }

  // Check stale rate
  if (staleRate > (config.maxStaleRate || 20)) {
    status = staleRate > 40 ? 'critical' : 'degraded';
    recommendations.push(`Stale rate is high (${staleRate.toFixed(1)}%). Consider reducing TTL or improving revalidation.`);
  }

  return {
    status,
    hitRate,
    errorRate,
    staleRate,
    recommendations,
  };
}

/**
 * Check if cache needs attention
 */
export function shouldAlert(thresholds?: AlertThresholds): boolean {
  const health = getCacheHealth(thresholds);
  return health.status !== 'healthy';
}

/**
 * Get detailed cache statistics
 */
export function getCacheStats(): {
  totalKeys: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  totalErrors: number;
  totalStale: number;
  averageHitRate: number;
  topKeys: Array<{ key: string; requests: number; hitRate: number }>;
} {
  const metrics = getCacheMetrics();
  const keys = Object.keys(metrics);
  
  let totalRequests = 0;
  let totalHits = 0;
  let totalMisses = 0;
  let totalErrors = 0;
  let totalStale = 0;

  const keyStats = keys.map(key => {
    const metric = metrics[key];
    totalRequests += metric.totalRequests;
    totalHits += metric.hits;
    totalMisses += metric.misses;
    totalErrors += metric.errors;
    totalStale += metric.staleServed;

    const hitRate = metric.totalRequests > 0
      ? (metric.hits / metric.totalRequests) * 100
      : 0;

    return {
      key,
      requests: metric.totalRequests,
      hitRate,
    };
  });

  const topKeys = keyStats
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);

  const averageHitRate = totalRequests > 0
    ? (totalHits / totalRequests) * 100
    : 0;

  return {
    totalKeys: keys.length,
    totalRequests,
    totalHits,
    totalMisses,
    totalErrors,
    totalStale,
    averageHitRate,
    topKeys,
  };
}




