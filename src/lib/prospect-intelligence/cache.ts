/**
 * Caching layer for Prospect Intelligence
 * Uses in-memory cache with TTL to avoid re-researching same companies
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory cache (in production, use Redis or similar)
const cache = new Map<string, CacheEntry<any>>();

// Default TTL: 24 hours (prospect data doesn't change that frequently)
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate cache key from website URL
 */
function getCacheKey(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl);
    // Normalize URL (remove trailing slash, convert to lowercase)
    const normalized = `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, '').toLowerCase();
    return `prospect:${normalized}`;
  } catch {
    // If URL parsing fails, use the URL as-is
    return `prospect:${websiteUrl.toLowerCase()}`;
  }
}

/**
 * Get cached prospect data
 */
export async function getCachedProspect<T>(websiteUrl: string): Promise<T | null> {
  const key = getCacheKey(websiteUrl);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Cache prospect data
 */
export async function cacheProspect<T>(
  websiteUrl: string,
  data: T,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  const key = getCacheKey(websiteUrl);
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidate cache for a website
 */
export async function invalidateCache(websiteUrl: string): Promise<void> {
  const key = getCacheKey(websiteUrl);
  cache.delete(key);
}

/**
 * Clear all prospect cache
 */
export async function clearCache(): Promise<void> {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; expiresAt: number; age: number }>;
} {
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    expiresAt: entry.expiresAt,
    age: Date.now() - (entry.expiresAt - DEFAULT_TTL_MS),
  }));

  return {
    size: cache.size,
    entries,
  };
}
