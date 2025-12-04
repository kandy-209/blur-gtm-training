/**
 * Cache Invalidation Manager
 * Provides strategies for invalidating cache entries
 */

import { cacheDelete } from '../redis';
import { unstable_cache } from 'next/cache';
import { log } from '../logger';

export interface InvalidationStrategy {
  pattern?: string; // Key pattern to match
  tags?: string[]; // Cache tags to invalidate
  all?: boolean; // Invalidate all cache
}

/**
 * Invalidate cache by tag (Next.js cache tags)
 */
export async function invalidateByTag(tag: string): Promise<void> {
  try {
    // Next.js revalidateTag function
    const { revalidateTag } = await import('next/cache');
    revalidateTag(tag);
    log.info('Cache invalidated by tag', { tag });
  } catch (error) {
    log.error('Failed to invalidate by tag', error instanceof Error ? error : new Error(String(error)), { tag });
  }
}

/**
 * Invalidate cache by tags
 */
export async function invalidateByTags(tags: string[]): Promise<void> {
  await Promise.all(tags.map(tag => invalidateByTag(tag)));
}

/**
 * Invalidate cache by key pattern
 */
export async function invalidateByPattern(pattern: string): Promise<void> {
  try {
    // This would require Redis SCAN or similar
    // For now, we'll delete from Redis if pattern matches
    log.info('Cache invalidation by pattern', { pattern });
    // TODO: Implement Redis SCAN for pattern matching
  } catch (error) {
    log.error('Failed to invalidate by pattern', error instanceof Error ? error : new Error(String(error)), { pattern });
  }
}

/**
 * Invalidate specific cache key
 */
export async function invalidateKey(key: string): Promise<void> {
  try {
    await cacheDelete(key);
    log.info('Cache key invalidated', { key });
  } catch (error) {
    log.error('Failed to invalidate key', error instanceof Error ? error : new Error(String(error)), { key });
  }
}

/**
 * Invalidate multiple cache keys
 */
export async function invalidateKeys(keys: string[]): Promise<void> {
  await Promise.all(keys.map(key => invalidateKey(key)));
}

/**
 * Invalidate cache for a symbol (stock quote, overview, etc.)
 */
export async function invalidateSymbol(symbol: string): Promise<void> {
  const keys = [
    `quote:${symbol}`,
    `overview:${symbol}`,
    `search:${symbol}`,
    `enrich:${symbol}`,
  ];

  await invalidateKeys(keys);
  await invalidateByTags([`symbol-${symbol}`, `quote-${symbol}`]);
}

/**
 * Invalidate cache for a search keyword
 */
export async function invalidateSearch(keyword: string): Promise<void> {
  const keys = [
    `search:${keyword}`,
    `search:${keyword}:true`,
    `search:${keyword}:false`,
  ];

  await invalidateKeys(keys);
  await invalidateByTag(`search-${keyword}`);
}

/**
 * Smart invalidation based on strategy
 */
export async function invalidateCache(strategy: InvalidationStrategy): Promise<void> {
  if (strategy.all) {
    // Invalidate all - use revalidatePath
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/', 'layout');
    log.info('All cache invalidated');
    return;
  }

  if (strategy.tags && strategy.tags.length > 0) {
    await invalidateByTags(strategy.tags);
  }

  if (strategy.pattern) {
    await invalidateByPattern(strategy.pattern);
  }
}

