/**
 * Adaptive TTL Manager
 * Dynamically adjusts cache TTL based on usage patterns
 */

import { getCacheMetrics } from '../next-cache-wrapper';
import { log } from '../logger';

export interface TTLRecommendation {
  key: string;
  currentTTL: number;
  recommendedTTL: number;
  reason: string;
  confidence: number; // 0-1
}

/**
 * Analyze cache patterns and recommend optimal TTLs
 */
export function recommendTTL(key: string, currentTTL: number): TTLRecommendation {
  const allMetrics = getCacheMetrics(key);
  const metrics = allMetrics && typeof allMetrics === 'object' && key in allMetrics 
    ? allMetrics[key] 
    : null;
  
  if (!metrics || typeof metrics !== 'object' || !('totalRequests' in metrics)) {
    return {
      key,
      currentTTL,
      recommendedTTL: currentTTL,
      reason: 'No metrics available',
      confidence: 0,
    };
  }

  const totalRequests = typeof metrics.totalRequests === 'number' ? metrics.totalRequests : 0;
  const hits = typeof metrics.hits === 'number' ? metrics.hits : 0;
  const staleServed = typeof metrics.staleServed === 'number' ? metrics.staleServed : 0;
  const hitRate = totalRequests > 0
    ? (hits / totalRequests) * 100
    : 0;

  const staleRate = totalRequests > 0
    ? (staleServed / totalRequests) * 100
    : 0;

  let recommendedTTL = currentTTL;
  let reason = 'Current TTL is optimal';
  let confidence = 0.5;

  // High hit rate + low stale rate = can increase TTL
  if (hitRate > 80 && staleRate < 10) {
    recommendedTTL = Math.min(currentTTL * 1.5, currentTTL * 2);
    reason = 'High hit rate, low stale rate - can increase TTL';
    confidence = 0.8;
  }
  // Low hit rate = data changes frequently, decrease TTL
  else if (hitRate < 50) {
    recommendedTTL = Math.max(currentTTL * 0.7, currentTTL * 0.5);
    reason = 'Low hit rate suggests data changes frequently';
    confidence = 0.7;
  }
  // High stale rate = TTL too long, decrease it
  else if (staleRate > 30) {
    recommendedTTL = Math.max(currentTTL * 0.8, currentTTL * 0.6);
    reason = 'High stale rate - TTL may be too long';
    confidence = 0.75;
  }

  return {
    key,
    currentTTL,
    recommendedTTL: Math.round(recommendedTTL),
    reason,
    confidence,
  };
}

/**
 * Get TTL recommendations for all cached keys
 */
export function getAllTTLRecommendations(): TTLRecommendation[] {
  const metrics = getCacheMetrics();
  const recommendations: TTLRecommendation[] = [];

  Object.entries(metrics).forEach(([key, metric]) => {
    // Estimate current TTL from metrics (if available)
    const currentTTL = 300; // Default assumption
    const recommendation = recommendTTL(key, currentTTL);
    recommendations.push(recommendation);
  });

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}


