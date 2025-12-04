/**
 * Tests for Next.js Cache Wrapper
 */

import { cachedRouteHandler, getCacheMetrics, invalidateCache, clearCacheMetrics } from '../next-cache-wrapper';
import { cacheGet, cacheSet, cacheDelete } from '../redis';

// Mock Redis
jest.mock('../redis', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheDelete: jest.fn(),
}));

// Mock Next.js unstable_cache
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn: any, keys: string[], options: any) => {
    return async () => {
      const result = await fn();
      return { data: result, timestamp: Date.now() };
    };
  }),
}));

// Mock logger
jest.mock('../logger', () => ({
  log: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

describe('next-cache-wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCacheMetrics();
    (cacheGet as jest.Mock).mockResolvedValue(null);
  });

  describe('cachedRouteHandler', () => {
    it('should return fresh cached data from Redis', async () => {
      const now = Date.now();
      const cachedData = {
        data: { test: 'value' },
        timestamp: now - 1000, // 1 second ago (fresh)
      };

      (cacheGet as jest.Mock).mockResolvedValue(cachedData);

      const result = await cachedRouteHandler(
        'test-key',
        async () => ({ test: 'new-value' }),
        { revalidate: 300, useRedis: true }
      );

      expect(result.cached).toBe(true);
      expect(result.data).toEqual({ test: 'value' });
      expect(result.age).toBeDefined();
    });

    it('should return stale data and refresh in background', async () => {
      const now = Date.now();
      const cachedData = {
        data: { test: 'value' },
        timestamp: now - 400000, // Stale but within SWR period
      };

      (cacheGet as jest.Mock).mockResolvedValue(cachedData);

      const result = await cachedRouteHandler(
        'test-key',
        async () => ({ test: 'new-value' }),
        { revalidate: 300, staleWhileRevalidate: 600, useRedis: true }
      );

      expect(result.cached).toBe(true);
      expect(result.data).toEqual({ test: 'value' });
    });

    it('should fetch fresh data on cache miss', async () => {
      (cacheGet as jest.Mock).mockResolvedValue(null);
      (cacheSet as jest.Mock).mockResolvedValue(undefined);

      const fetcher = jest.fn().mockResolvedValue({ test: 'new-value' });

      const result = await cachedRouteHandler(
        'test-key',
        fetcher,
        { revalidate: 300, useRedis: true }
      );

      expect(result.cached).toBe(false);
      expect(result.data).toBeDefined();
      expect(fetcher).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (cacheGet as jest.Mock).mockRejectedValue(new Error('Redis error'));

      const fetcher = jest.fn().mockResolvedValue({ test: 'value' });

      const result = await cachedRouteHandler(
        'test-key',
        fetcher,
        { revalidate: 300, useRedis: true }
      );

      expect(result.data).toEqual({ test: 'value' });
    });

    it('should prevent cache stampede', async () => {
      (cacheGet as jest.Mock).mockResolvedValue(null);

      let callCount = 0;
      const fetcher = jest.fn().mockImplementation(async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return { test: 'value', call: callCount };
      });

      // Simulate concurrent requests
      const promises = [
        cachedRouteHandler('test-key', fetcher, { revalidate: 300 }),
        cachedRouteHandler('test-key', fetcher, { revalidate: 300 }),
        cachedRouteHandler('test-key', fetcher, { revalidate: 300 }),
      ];

      const results = await Promise.all(promises);

      // All should return same data (deduplicated)
      expect(results[0].data).toEqual(results[1].data);
      expect(results[1].data).toEqual(results[2].data);
    });
  });

  describe('getCacheMetrics', () => {
    it('should return metrics for all keys', async () => {
      await cachedRouteHandler('key1', async () => 'value1', { enableMetrics: true });
      await cachedRouteHandler('key2', async () => 'value2', { enableMetrics: true });

      const metrics = getCacheMetrics();
      expect(Object.keys(metrics).length).toBeGreaterThan(0);
    });

    it('should filter metrics by pattern', async () => {
      await cachedRouteHandler('quote:AAPL', async () => 'value', { enableMetrics: true });
      await cachedRouteHandler('search:Apple', async () => 'value', { enableMetrics: true });

      const metrics = getCacheMetrics('quote');
      expect(Object.keys(metrics).some(k => k.includes('quote'))).toBe(true);
    });
  });

  describe('invalidateCache', () => {
    it('should delete cache entry', async () => {
      await invalidateCache('test-key');
      expect(cacheDelete).toHaveBeenCalled();
    });
  });
});

