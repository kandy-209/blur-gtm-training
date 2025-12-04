/**
 * Analytics caching layer with multi-tier cache strategy
 * Provides fast loading with stale-while-revalidate pattern
 */

import { TrainingEvent } from './analytics';
import { safeDate, safeToISOString, isValidDate } from './date-utils';

export interface AnalyticsCache {
  stats: {
    totalScenarios: number;
    averageScore: number;
    totalTurns: number;
  };
  events: TrainingEvent[];
  timestamp: number;
  userId?: string;
}

const CACHE_KEY = 'analytics_cache';
const CACHE_VERSION = '1.0';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STALE_THRESHOLD = 30 * 1000; // 30 seconds - data is considered stale after this

/**
 * Get cached analytics data
 */
export function getCachedAnalytics(userId?: string): AnalyticsCache | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${userId || 'default'}`);
    if (!cached) return null;

    const data: AnalyticsCache = JSON.parse(cached);
    
    // Check if cache is expired
    const age = Date.now() - data.timestamp;
    if (age > CACHE_TTL) {
      // Remove expired cache
      localStorage.removeItem(`${CACHE_KEY}_${userId || 'default'}`);
      return null;
    }

    // Convert timestamp strings back to Date objects with validation
    data.events = data.events.map(event => ({
      ...event,
      timestamp: safeDate(event.timestamp),
    }));

    return data;
  } catch (error) {
    console.error('Error reading analytics cache:', error);
    return null;
  }
}

/**
 * Check if cached data is stale (but still valid)
 */
export function isCacheStale(cache: AnalyticsCache | null): boolean {
  if (!cache) return true;
  const age = Date.now() - cache.timestamp;
  return age > STALE_THRESHOLD;
}

/**
 * Save analytics data to cache
 */
export function setCachedAnalytics(
  stats: AnalyticsCache['stats'],
  events: TrainingEvent[],
  userId?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const cache: AnalyticsCache = {
      stats,
      events: events.map(event => ({
        ...event,
        timestamp: safeToISOString(event.timestamp),
      })) as any,
      timestamp: Date.now(),
      userId,
    };

    localStorage.setItem(
      `${CACHE_KEY}_${userId || 'default'}`,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error('Error saving analytics cache:', error);
    // If quota exceeded, try to clean up old caches
    try {
      clearOldCaches();
      const retryCache: AnalyticsCache = {
        stats,
        events: events.map(event => ({
          ...event,
          timestamp: safeToISOString(event.timestamp),
        })) as any,
        timestamp: Date.now(),
        userId,
      };
      localStorage.setItem(
        `${CACHE_KEY}_${userId || 'default'}`,
        JSON.stringify(retryCache)
      );
    } catch (e) {
      console.error('Failed to save cache after cleanup:', e);
    }
  }
}

/**
 * Clear old cache entries to free up space
 */
function clearOldCaches(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY));
  
  // Remove caches older than 1 hour
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  cacheKeys.forEach(key => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const data: AnalyticsCache = JSON.parse(cached);
        if (data.timestamp < oneHourAgo) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Remove invalid cache entries
      localStorage.removeItem(key);
    }
  });
}

/**
 * Invalidate cache for a user
 */
export function invalidateCache(userId?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${CACHE_KEY}_${userId || 'default'}`);
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(cache: AnalyticsCache | null): number {
  if (!cache) return Infinity;
  return Date.now() - cache.timestamp;
}

/**
 * Check if cache should be refreshed (stale and old enough)
 */
export function shouldRefreshCache(cache: AnalyticsCache | null): boolean {
  if (!cache) return true;
  const age = getCacheAge(cache);
  return age > STALE_THRESHOLD;
}


