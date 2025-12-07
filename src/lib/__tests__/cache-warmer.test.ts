/**
 * Tests for Cache Warmer
 */

import { warmCache, warmPopularStocks } from '../cache/cache-warmer';

jest.mock('../next-cache-wrapper', () => ({
  cachedRouteHandler: jest.fn((key, fetcher) => {
    return Promise.resolve({
      data: fetcher(),
      timestamp: new Date().toISOString(),
      cached: false,
    });
  }),
}));

jest.mock('../logger', () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('cache-warmer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('warmCache', () => {
    it('should warm cache with multiple keys', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'value' });

      const result = await warmCache({
        keys: ['key1', 'key2', 'key3'],
        fetcher,
        batchSize: 2,
      });

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(fetcher).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'value1' })
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce({ data: 'value3' });

      const result = await warmCache({
        keys: ['key1', 'key2', 'key3'],
        fetcher,
      });

      expect(result.success).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should process in batches', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'value' });

      await warmCache({
        keys: Array.from({ length: 10 }, (_, i) => `key${i}`),
        fetcher,
        batchSize: 3,
      });

      expect(fetcher).toHaveBeenCalledTimes(10);
    });
  });

  describe('warmPopularStocks', () => {
    it('should warm cache for stock symbols', async () => {
      const quoteFetcher = jest.fn().mockResolvedValue({ symbol: 'AAPL', price: 150 });

      await warmPopularStocks(['AAPL', 'MSFT', 'GOOGL'], quoteFetcher);

      expect(quoteFetcher).toHaveBeenCalledTimes(3);
    });
  });
});




