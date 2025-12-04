/**
 * Complete Cache System Integration Test
 * Tests the entire caching flow end-to-end
 */

import { cachedRouteHandler, getCacheMetrics, invalidateCache } from '../next-cache-wrapper';
import { generateCacheControl, CachePresets } from '../cache-headers';
import { cacheGet, cacheSet } from '../redis';

jest.mock('../redis', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheDelete: jest.fn(),
}));

jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn: any) => {
    return async () => {
      const result = await fn();
      return { data: result, timestamp: Date.now() };
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

describe('Complete Cache System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheGet as jest.Mock).mockResolvedValue(null);
    (cacheSet as jest.Mock).mockResolvedValue(undefined);
  });

  it('should handle complete cache lifecycle with SWR', async () => {
    // Step 1: Initial cache miss
    const fetcher1 = jest.fn().mockResolvedValue({ symbol: 'AAPL', price: 150 });
    const result1 = await cachedRouteHandler('quote:AAPL', fetcher1, {
      revalidate: 60,
      staleWhileRevalidate: 300,
      useRedis: true,
      enableMetrics: true,
    });

    expect(result1.cached).toBe(false);
    expect(fetcher1).toHaveBeenCalledTimes(1);

    // Step 2: Simulate cache hit (fresh)
    const now = Date.now();
    (cacheGet as jest.Mock).mockResolvedValue({
      data: { symbol: 'AAPL', price: 150 },
      timestamp: now - 30 * 1000, // 30 seconds ago (fresh)
    });

    const fetcher2 = jest.fn().mockResolvedValue({ symbol: 'AAPL', price: 151 });
    const result2 = await cachedRouteHandler('quote:AAPL', fetcher2, {
      revalidate: 60,
      staleWhileRevalidate: 300,
      useRedis: true,
    });

    expect(result2.cached).toBe(true);
    expect(result2.age).toBeLessThan(60);
    expect(fetcher2).not.toHaveBeenCalled();

    // Step 3: Simulate stale data (within SWR period)
    (cacheGet as jest.Mock).mockResolvedValue({
      data: { symbol: 'AAPL', price: 150 },
      timestamp: now - 200 * 1000, // 200 seconds ago (stale but within SWR)
    });

    const fetcher3 = jest.fn().mockResolvedValue({ symbol: 'AAPL', price: 152 });
    const result3 = await cachedRouteHandler('quote:AAPL', fetcher3, {
      revalidate: 60,
      staleWhileRevalidate: 300,
      useRedis: true,
    });

    expect(result3.cached).toBe(true);
    expect(result3.data.price).toBe(150); // Returns stale data

    // Wait for background refresh
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(cacheSet).toHaveBeenCalled(); // Background refresh attempted
  });

  it('should work with cache headers presets', () => {
    const stockHeader = CachePresets.stockQuote();
    expect(stockHeader).toContain('max-age=60');
    expect(stockHeader).toContain('stale-while-revalidate=300');

    const analysisHeader = CachePresets.companyAnalysis();
    expect(analysisHeader).toContain('max-age=3600');
  });

  it('should track metrics correctly', async () => {
    await cachedRouteHandler('test-key-1', async () => 'value1', { enableMetrics: true });
    await cachedRouteHandler('test-key-2', async () => 'value2', { enableMetrics: true });

    const metrics = getCacheMetrics();
    expect(Object.keys(metrics).length).toBeGreaterThanOrEqual(2);
  });

  it('should handle cache invalidation', async () => {
    await invalidateCache('test-key');
    expect(require('../redis').cacheDelete).toHaveBeenCalled();
  });

  it('should handle Redis unavailable gracefully', async () => {
    (cacheGet as jest.Mock).mockRejectedValue(new Error('Redis connection failed'));

    const fetcher = jest.fn().mockResolvedValue({ data: 'value' });
    const result = await cachedRouteHandler('redis-fail', fetcher, {
      revalidate: 300,
      useRedis: true,
    });

    expect(result.data).toBeDefined();
    expect(fetcher).toHaveBeenCalled();
  });

  it('should prevent cache stampede with concurrent requests', async () => {
    let callCount = 0;
    const fetcher = jest.fn().mockImplementation(async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return { call: callCount };
    });

    const promises = Array.from({ length: 10 }, () =>
      cachedRouteHandler('stampede-key', fetcher, { revalidate: 300 })
    );

    const results = await Promise.all(promises);

    // All should return same data
    const firstCall = results[0].data.call;
    results.forEach(result => {
      expect(result.data.call).toBe(firstCall);
    });

    // Fetcher should only be called once
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

