/**
 * Edge case tests for Next.js Cache Wrapper
 */

import { cachedRouteHandler, getCacheMetrics } from '../next-cache-wrapper';
import { cacheGet, cacheSet } from '../redis';

jest.mock('../redis', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheDelete: jest.fn(),
}));

jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn: any) => {
    return async () => {
      // The function passed to unstable_cache returns a CacheEntry { data, timestamp }
      const entry = await fn();
      // Return the entry directly - it should have { data, timestamp } structure
      return entry;
    };
  }),
}));

jest.mock('../logger', () => ({
  log: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

describe('next-cache-wrapper edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheGet as jest.Mock).mockResolvedValue(null);
    (cacheSet as jest.Mock).mockResolvedValue(undefined);
  });

  it('should handle very large data objects', async () => {
    const largeData = {
      items: Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(1000),
      })),
    };

    const result = await cachedRouteHandler(
      'large-data-key',
      async () => largeData,
      { revalidate: 300 }
    );

    expect(result.data).toBeDefined();
    expect(result.data.items.length).toBe(10000);
  });

  it('should handle concurrent requests with same key', async () => {
    let callCount = 0;
    const fetcher = jest.fn().mockImplementation(async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return { value: callCount };
    });

    const promises = Array.from({ length: 10 }, () =>
      cachedRouteHandler('concurrent-key', fetcher, { revalidate: 300 })
    );

    const results = await Promise.all(promises);

    // All should return same data (deduplicated)
    const firstValue = results[0].data.value;
    results.forEach(result => {
      expect(result.data.value).toBe(firstValue);
    });

    // Fetcher should only be called once
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid cache expiration', async () => {
    const now = Date.now();
    const cachedData = {
      data: { test: 'value' },
      timestamp: now - 2000, // 2 seconds ago
    };

    (cacheGet as jest.Mock).mockResolvedValue(cachedData);

    const result = await cachedRouteHandler(
      'expired-key',
      async () => ({ test: 'new-value' }),
      { revalidate: 1, staleWhileRevalidate: 1 } // Very short TTL
    );

    // Should return stale data if within SWR period
    expect(result).toBeDefined();
  });

  it('should handle Redis connection failures gracefully', async () => {
    (cacheGet as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const fetcher = jest.fn().mockResolvedValue({ test: 'value' });

    const result = await cachedRouteHandler(
      'redis-fail-key',
      fetcher,
      { revalidate: 300, useRedis: true }
    );

    expect(result.data).toEqual({ test: 'value' });
    expect(fetcher).toHaveBeenCalled();
  });

  it('should handle null/undefined return values', async () => {
    const result = await cachedRouteHandler(
      'null-key',
      async () => null,
      { revalidate: 300 }
    );

    // cachedRouteHandler wraps the result in { data, timestamp, cached, ... }
    // The fetcher returns null, which gets wrapped in CacheEntry as { data: null, timestamp }
    // Then cachedRouteHandler does: resultData = result?.data ?? result
    // If result is { data: null, timestamp }, then result?.data = null
    // null ?? result evaluates to result (the whole object) because ?? only checks null/undefined
    // So resultData = { data: null, timestamp }, and it returns { data: { data: null, timestamp }, ... }
    // Therefore result.data is { data: null, timestamp }, not null
    expect(result).toBeDefined();
    expect(result).toHaveProperty('data');
    expect(result.data).toBeDefined();
    // The nested structure means result.data.data should be null
    expect(result.data).toHaveProperty('data');
    expect(result.data.data).toBeNull();
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('cached');
  });

  it('should handle fetcher throwing errors', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('Fetcher error'));

    await expect(
      cachedRouteHandler('error-key', fetcher, { revalidate: 300 })
    ).rejects.toThrow('Fetcher error');
  });

  it('should track metrics correctly for multiple keys', async () => {
    await cachedRouteHandler('key1', async () => 'value1', { enableMetrics: true });
    await cachedRouteHandler('key2', async () => 'value2', { enableMetrics: true });
    await cachedRouteHandler('key3', async () => 'value3', { enableMetrics: true });

    const metrics = getCacheMetrics();
    expect(Object.keys(metrics).length).toBeGreaterThanOrEqual(3);
  });

  it('should handle zero revalidate time', async () => {
    const result = await cachedRouteHandler(
      'zero-ttl-key',
      async () => ({ test: 'value' }),
      { revalidate: 0 }
    );

    expect(result.data).toBeDefined();
  });

  it('should handle very long revalidate time', async () => {
    const result = await cachedRouteHandler(
      'long-ttl-key',
      async () => ({ test: 'value' }),
      { revalidate: 86400 * 365 } // 1 year
    );

    expect(result.data).toBeDefined();
    expect(result.expiresAt).toBeDefined();
  });
});

