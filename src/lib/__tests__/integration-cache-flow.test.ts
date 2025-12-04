/**
 * Integration tests for complete cache flow
 */

import { cachedRouteHandler } from '../next-cache-wrapper';
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

describe('Integration: Complete Cache Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheGet as jest.Mock).mockResolvedValue(null);
    (cacheSet as jest.Mock).mockResolvedValue(undefined);
  });

  it('should handle complete cache lifecycle', async () => {
    // First request - cache miss
    const fetcher1 = jest.fn().mockResolvedValue({ data: 'value1' });
    const result1 = await cachedRouteHandler('lifecycle-key', fetcher1, {
      revalidate: 300,
      useRedis: true,
    });

    expect(result1.cached).toBe(false);
    expect(fetcher1).toHaveBeenCalled();
    expect(cacheSet).toHaveBeenCalled();

    // Simulate cache hit
    const now = Date.now();
    (cacheGet as jest.Mock).mockResolvedValue({
      data: { data: 'value1' },
      timestamp: now - 1000,
    });

    const fetcher2 = jest.fn().mockResolvedValue({ data: 'value2' });
    const result2 = await cachedRouteHandler('lifecycle-key', fetcher2, {
      revalidate: 300,
      useRedis: true,
    });

    expect(result2.cached).toBe(true);
    expect(result2.data).toEqual({ data: 'value1' });
    expect(fetcher2).not.toHaveBeenCalled();
  });

  it('should handle SWR pattern correctly', async () => {
    const now = Date.now();
    // Stale data (within SWR period)
    (cacheGet as jest.Mock).mockResolvedValue({
      data: { data: 'stale-value' },
      timestamp: now - 400000, // Stale but within SWR
    });

    const fetcher = jest.fn().mockResolvedValue({ data: 'fresh-value' });
    const result = await cachedRouteHandler('swr-key', fetcher, {
      revalidate: 300,
      staleWhileRevalidate: 600,
      useRedis: true,
    });

    expect(result.cached).toBe(true);
    expect(result.data).toEqual({ data: 'stale-value' });

    // Wait a bit for background refresh
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Background refresh should have been attempted
    expect(cacheSet).toHaveBeenCalled();
  });

  it('should handle multiple concurrent requests', async () => {
    let callCount = 0;
    const fetcher = jest.fn().mockImplementation(async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 100));
      return { call: callCount, data: 'value' };
    });

    const promises = Array.from({ length: 5 }, () =>
      cachedRouteHandler('concurrent-key', fetcher, { revalidate: 300 })
    );

    const results = await Promise.all(promises);

    // All should return same data
    const firstCall = results[0].data.call;
    results.forEach(result => {
      expect(result.data.call).toBe(firstCall);
    });

    // Fetcher should only be called once (deduplication)
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should handle Redis unavailable gracefully', async () => {
    (cacheGet as jest.Mock).mockRejectedValue(new Error('Redis unavailable'));

    const fetcher = jest.fn().mockResolvedValue({ data: 'value' });
    const result = await cachedRouteHandler('redis-unavailable', fetcher, {
      revalidate: 300,
      useRedis: true,
    });

    expect(result.data).toEqual({ data: 'value' });
    expect(fetcher).toHaveBeenCalled();
  });

  it('should handle metrics tracking', async () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'value' });

    await cachedRouteHandler('metrics-key', fetcher, {
      revalidate: 300,
      enableMetrics: true,
    });

    // Metrics should be tracked
    const { getCacheMetrics } = require('../next-cache-wrapper');
    const metrics = getCacheMetrics('metrics-key');
    expect(Object.keys(metrics).length).toBeGreaterThan(0);
  });
});

