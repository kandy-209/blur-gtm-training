/**
 * Next.js Cache Wrapper with Redis Integration
 * Production-ready caching with SWR, metrics, and error handling
 * 
 * Features:
 * - Next.js unstable_cache integration
 * - Redis for cross-instance caching
 * - Stale-While-Revalidate (SWR) pattern
 * - Cache stampede prevention
 * - Request memoization support
 * - Metrics tracking
 * - Edge runtime compatible
 */

import { unstable_cache } from 'next/cache';
import { cacheGet, cacheSet, cacheDelete } from './redis';
import { log } from './logger';
import { generateRequestId } from './logger';

export interface CacheConfig {
  revalidate?: number; // Seconds until revalidation
  tags?: string[]; // Cache tags for invalidation
  useRedis?: boolean; // Whether to use Redis for cross-instance caching
  compress?: boolean; // Whether to compress large values (>10KB)
  staleWhileRevalidate?: number; // SWR period in seconds (default: revalidate * 2)
  enableMetrics?: boolean; // Track cache metrics
}

interface CachedResponse<T> {
  data: T;
  timestamp: string;
  cached: boolean;
  expiresAt?: string;
  age?: number; // Age in seconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version?: number; // For cache versioning
}

// Cache stampede prevention: track pending requests
const pendingRequests = new Map<string, Promise<CacheEntry<any>>>();

// Cache metrics
interface CacheMetrics {
  hits: number;
  misses: number;
  staleServed: number;
  errors: number;
  totalRequests: number;
}

const cacheMetrics = new Map<string, CacheMetrics>();

/**
 * Get cache metrics for a key pattern
 */
export function getCacheMetrics(keyPattern?: string): Record<string, CacheMetrics> {
  if (!keyPattern) {
    const all: Record<string, CacheMetrics> = {};
    cacheMetrics.forEach((metrics, key) => {
      all[key] = metrics;
    });
    return all;
  }
  
  const matching: Record<string, CacheMetrics> = {};
  cacheMetrics.forEach((metrics, key) => {
    if (key.includes(keyPattern)) {
      matching[key] = metrics;
    }
  });
  return matching;
}

/**
 * Record cache metric
 */
function recordMetric(key: string, type: 'hit' | 'miss' | 'stale' | 'error'): void {
  if (!cacheMetrics.has(key)) {
    cacheMetrics.set(key, {
      hits: 0,
      misses: 0,
      staleServed: 0,
      errors: 0,
      totalRequests: 0,
    });
  }
  
  const metrics = cacheMetrics.get(key)!;
  metrics.totalRequests++;
  
  switch (type) {
    case 'hit':
      metrics.hits++;
      break;
    case 'miss':
      metrics.misses++;
      break;
    case 'stale':
      metrics.staleServed++;
      break;
    case 'error':
      metrics.errors++;
      break;
  }
}

/**
 * Generate cache key with versioning support
 * Sanitizes key to prevent injection attacks
 */
function generateCacheKey(baseKey: string, version?: number): string {
  const prefix = process.env.CACHE_KEY_PREFIX || 'app';
  // Sanitize key - remove special characters that could cause issues
  const sanitized = baseKey.replace(/[^a-zA-Z0-9:_-]/g, '_');
  const versioned = version ? `${sanitized}:v${version}` : sanitized;
  return `${prefix}:${versioned}`;
}

/**
 * Cached route handler with SWR (Stale-While-Revalidate) pattern
 * Returns cached data immediately, refreshes in background if stale
 */
export async function cachedRouteHandler<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheConfig = {}
): Promise<CachedResponse<T>> {
  const requestId = generateRequestId();
  const {
    revalidate = 300, // 5 minutes default
    tags = [],
    useRedis = true,
    compress = false,
    staleWhileRevalidate,
    enableMetrics = true,
  } = options;

  const swrPeriod = staleWhileRevalidate ?? revalidate * 2;
  const cacheKey = generateCacheKey(key);
  const now = Date.now();

  try {
    // Try Redis first (for cross-instance sharing)
    if (useRedis) {
      try {
        const cached = await cacheGet<CacheEntry<T>>(cacheKey);
        if (cached) {
          const age = (now - cached.timestamp) / 1000; // Age in seconds
          
          // Fresh data - return immediately
          if (age < revalidate) {
            if (enableMetrics) recordMetric(key, 'hit');
            
            log.debug('Cache hit (fresh)', {
              key: cacheKey,
              age,
              requestId,
            });
            
            return {
              data: cached.data,
              timestamp: new Date(cached.timestamp).toISOString(),
              cached: true,
              expiresAt: new Date(cached.timestamp + revalidate * 1000).toISOString(),
              age: Math.round(age),
            };
          }
          
          // Stale but within SWR period - return stale, refresh in background
          if (age < revalidate + swrPeriod) {
            if (enableMetrics) recordMetric(key, 'stale');
            
            log.debug('Cache hit (stale, refreshing)', {
              key: cacheKey,
              age,
              requestId,
            });
            
            // Refresh in background (don't await)
            refreshCacheInBackground(cacheKey, fetcher, options, requestId).catch(() => {
              // Errors are logged in refreshCacheInBackground
            });
            
            return {
              data: cached.data,
              timestamp: new Date(cached.timestamp).toISOString(),
              cached: true,
              expiresAt: new Date(cached.timestamp + revalidate * 1000).toISOString(),
              age: Math.round(age),
            };
          }
        }
      } catch (error) {
        log.warn('Redis cache read error, falling back to Next.js cache', {
          error: error instanceof Error ? error.message : String(error),
          key: cacheKey,
          requestId,
        });
        if (enableMetrics) recordMetric(key, 'error');
      }
    }

    // Check for pending request (cache stampede prevention)
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      log.debug('Waiting for pending cache request', { key: cacheKey, requestId });
      const result = await pending;
      return {
        data: result.data,
        timestamp: new Date(result.timestamp).toISOString(),
        cached: false, // Technically not cached, but deduplicated
        expiresAt: new Date(result.timestamp + revalidate * 1000).toISOString(),
      };
    }

    // Use Next.js cache (server-side) with request memoization
    const getCached = unstable_cache(
      async () => {
        // Create promise for stampede prevention
        const fetchPromise = (async () => {
          try {
            const data = await fetcher();
            const timestamp = Date.now();
            const entry: CacheEntry<T> = { data, timestamp };
            
            // Store in Redis for cross-instance sharing
            if (useRedis) {
              try {
                await cacheSet(
                  cacheKey,
                  entry,
                  { ttl: revalidate }
                );
              } catch (error) {
                log.warn('Redis cache write error', {
                  error: error instanceof Error ? error.message : String(error),
                  key: cacheKey,
                  requestId,
                });
              }
            }
            
            return entry;
          } finally {
            // Remove from pending requests after completion
            pendingRequests.delete(cacheKey);
          }
        })();
        
        // Store promise for stampede prevention
        pendingRequests.set(cacheKey, fetchPromise);
        
        return await fetchPromise;
      },
      [key],
      {
        revalidate,
        tags,
      }
    );

    const result = await getCached();
    
    if (enableMetrics) recordMetric(key, 'miss');
    
    log.debug('Cache miss, fetched fresh data', {
      key: cacheKey,
      requestId,
    });
    
    // Ensure result has proper structure
    const resultData = result?.data ?? result;
    const resultTimestamp = result?.timestamp ?? Date.now();
    
    return {
      data: resultData,
      timestamp: new Date(resultTimestamp).toISOString(),
      cached: false,
      expiresAt: new Date(resultTimestamp + revalidate * 1000).toISOString(),
    };
  } catch (error) {
    if (enableMetrics) recordMetric(key, 'error');
    
    log.error('Cache handler error', error instanceof Error ? error : new Error(String(error)), {
      key: cacheKey,
      requestId,
    });
    
    // On error, try to fetch directly (bypass cache)
    try {
      const data = await fetcher();
      const timestamp = Date.now();
      return {
        data,
        timestamp: new Date(timestamp).toISOString(),
        cached: false,
        expiresAt: new Date(timestamp + revalidate * 1000).toISOString(),
      };
    } catch (fetchError) {
      // Re-throw original error
      throw error;
    }
  }
}

/**
 * Refresh cache in background (non-blocking)
 * Uses setTimeout to avoid blocking the event loop
 */
async function refreshCacheInBackground<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: CacheConfig,
  requestId: string
): Promise<void> {
  // Use setTimeout to ensure non-blocking
  setTimeout(async () => {
    try {
      const data = await fetcher();
      const timestamp = Date.now();
      const entry: CacheEntry<T> = { data, timestamp };
      
      if (options.useRedis) {
        try {
          await cacheSet(
            cacheKey,
            entry,
            { ttl: options.revalidate || 300 }
          );
          
          log.debug('Background cache refresh successful', {
            key: cacheKey,
            requestId,
          });
        } catch (error) {
          log.warn('Background cache refresh failed', {
            error: error instanceof Error ? error.message : String(error),
            key: cacheKey,
            requestId,
          });
        }
      }
    } catch (error) {
      log.warn('Background cache refresh error', {
        error: error instanceof Error ? error.message : String(error),
        key: cacheKey,
        requestId,
      });
    }
  }, 0);
}

/**
 * Invalidate cache by tag (placeholder for Next.js tag invalidation)
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  log.info('Cache invalidation requested', { tag });
  // Note: Next.js doesn't support tag-based invalidation in unstable_cache yet
  // This is a placeholder for future implementation or manual invalidation
}

/**
 * Invalidate cache by key
 */
export async function invalidateCache(key: string): Promise<void> {
  const cacheKey = generateCacheKey(key);
  try {
    await cacheDelete(cacheKey);
    log.debug('Cache invalidated', { key: cacheKey });
  } catch (error) {
    log.warn('Cache invalidation error', {
      error: error instanceof Error ? error.message : String(error),
      key: cacheKey,
    });
  }
}

/**
 * Clear all cache metrics
 */
export function clearCacheMetrics(): void {
  cacheMetrics.clear();
}

