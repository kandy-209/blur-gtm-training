/**
 * Caching utilities for Next.js 16
 * Implements layered caching with tags, revalidation, and proper cache headers
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag, revalidatePath } from 'next/cache';

// Cache tags for different data types
export const CACHE_TAGS = {
  LEADERBOARD: 'leaderboard',
  ANALYTICS: 'analytics',
  SCENARIOS: 'scenarios',
  FEATURES: 'features',
  ENTERPRISE: 'enterprise',
  USER_PROFILE: 'user-profile',
  LIVE_SESSION: 'live-session',
  RATINGS: 'ratings',
  RESPONSES: 'responses',
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  STATIC: 31536000, // 1 year
} as const;

/**
 * Create a cached function with tags and revalidation
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    tags: string[];
    revalidate?: number;
    key?: string;
  }
): T {
  return unstable_cache(
    fn,
    [options.key || fn.name],
    {
      tags: options.tags,
      revalidate: options.revalidate,
    }
  ) as T;
}

/**
 * Revalidate cache by tag
 */
export async function invalidateCache(tag: string) {
  revalidateTag(tag);
}

/**
 * Revalidate cache by path
 */
export async function invalidatePath(path: string) {
  revalidatePath(path);
}

/**
 * Get cache headers for API responses
 */
export function getCacheHeaders(options: {
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  tags?: string[];
  private?: boolean;
}): HeadersInit {
  const headers: HeadersInit = {};

  if (options.private) {
    headers['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
    return headers;
  }

  const directives: string[] = [];

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }

  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (directives.length > 0) {
    headers['Cache-Control'] = directives.join(', ');
  }

  if (options.tags && options.tags.length > 0) {
    headers['Cache-Tags'] = options.tags.join(',');
  }

  return headers;
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  leaderboard: (category: string, limit: number) => `leaderboard:${category}:${limit}`,
  userProfile: (userId: string) => `user-profile:${userId}`,
  scenario: (scenarioId: string) => `scenario:${scenarioId}`,
  liveSession: (sessionId: string) => `live-session:${sessionId}`,
  analytics: (userId: string, eventType: string) => `analytics:${userId}:${eventType}`,
};

