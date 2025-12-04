/**
 * Cache Warmer
 * Pre-populates cache with popular/important data
 */

import { cachedRouteHandler } from '../next-cache-wrapper';
import { log } from '../logger';

export interface WarmupConfig {
  keys: string[];
  fetcher: (key: string) => Promise<any>;
  priority?: 'high' | 'medium' | 'low';
  batchSize?: number;
}

/**
 * Warm cache with multiple keys in parallel batches
 */
export async function warmCache<T>(
  config: WarmupConfig
): Promise<{ success: number; failed: number; errors: Error[] }> {
  const { keys, fetcher, batchSize = 5 } = config;
  const errors: Error[] = [];
  let success = 0;
  let failed = 0;

  log.info('Starting cache warmup', {
    totalKeys: keys.length,
    batchSize,
    priority: config.priority || 'medium',
  });

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(async (key) => {
        try {
          await cachedRouteHandler(
            key,
            () => fetcher(key),
            {
              revalidate: 300,
              useRedis: true,
              enableMetrics: true,
            }
          );
          return { key, success: true };
        } catch (error) {
          return { key, success: false, error };
        }
      })
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          success++;
        } else {
          failed++;
          if (result.value.error) {
            errors.push(result.value.error as Error);
          }
        }
      } else {
        failed++;
        errors.push(result.reason);
      }
    });

    // Small delay between batches
    if (i + batchSize < keys.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  log.info('Cache warmup completed', {
    success,
    failed,
    totalKeys: keys.length,
  });

  return { success, failed, errors };
}

/**
 * Warm cache for popular stock symbols
 */
export async function warmPopularStocks(
  symbols: string[],
  quoteFetcher: (symbol: string) => Promise<any>
): Promise<void> {
  await warmCache({
    keys: symbols.map(s => `quote:${s}`),
    fetcher: quoteFetcher,
    priority: 'high',
    batchSize: 3, // Smaller batches for API rate limits
  });
}

/**
 * Warm cache for company searches
 */
export async function warmCompanySearches(
  keywords: string[],
  searchFetcher: (keyword: string) => Promise<any>
): Promise<void> {
  await warmCache({
    keys: keywords.map(k => `search:${k}`),
    fetcher: searchFetcher,
    priority: 'medium',
    batchSize: 5,
  });
}

