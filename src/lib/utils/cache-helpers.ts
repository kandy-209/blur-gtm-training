/**
 * Cache Helper Utilities
 * Common functions for cache operations
 */

import { invalidateCache, invalidateCacheByTag } from '../next-cache-wrapper';
import { log } from '../logger';

/**
 * Invalidate all cache entries matching a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  let count = 0;
  try {
    // This would need Redis SCAN in production
    // For now, we'll use the tag-based invalidation
    await invalidateCacheByTag(pattern);
    count = 1;
    log.info('Cache pattern invalidated', { pattern, count });
  } catch (error) {
    log.warn('Cache pattern invalidation failed', {
      error: error instanceof Error ? error.message : String(error),
      pattern,
    });
  }
  return count;
}

/**
 * Warm cache with common data
 */
export async function warmCache<T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>,
  options?: { ttl?: number }
): Promise<void> {
  const promises = keys.map(async (key) => {
    try {
      await fetcher(key);
      log.debug('Cache warmed', { key });
    } catch (error) {
      log.warn('Cache warming failed', {
        error: error instanceof Error ? error.message : String(error),
        key,
      });
    }
  });

  await Promise.allSettled(promises);
  log.info('Cache warming completed', { keysWarmed: keys.length });
}

/**
 * Get cache statistics summary
 */
export function getCacheStatsSummary(): {
  totalKeys: number;
  estimatedSize: number;
  averageTTL: number;
} {
  // Placeholder - would need Redis INFO command in production
  return {
    totalKeys: 0,
    estimatedSize: 0,
    averageTTL: 300,
  };
}

