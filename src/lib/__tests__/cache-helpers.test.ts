/**
 * Tests for Cache Helpers
 */

import { invalidateCachePattern, warmCache, getCacheStatsSummary } from '../utils/cache-helpers';

jest.mock('../next-cache-wrapper', () => ({
  invalidateCacheByTag: jest.fn(),
  invalidateCache: jest.fn(),
}));

jest.mock('../logger', () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('cache-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('invalidateCachePattern', () => {
    it('should invalidate cache by pattern', async () => {
      const { invalidateCacheByTag } = require('../next-cache-wrapper');
      invalidateCacheByTag.mockResolvedValue(undefined);

      const count = await invalidateCachePattern('quote:*');

      expect(count).toBeGreaterThanOrEqual(0);
      expect(invalidateCacheByTag).toHaveBeenCalledWith('quote:*');
    });
  });

  describe('warmCache', () => {
    it('should warm cache with multiple keys', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'value' });

      await warmCache(['key1', 'key2', 'key3'], fetcher);

      expect(fetcher).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'value1' })
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce({ data: 'value3' });

      await expect(warmCache(['key1', 'key2', 'key3'], fetcher)).resolves.not.toThrow();
      expect(fetcher).toHaveBeenCalledTimes(3);
    });
  });

  describe('getCacheStatsSummary', () => {
    it('should return cache statistics', () => {
      const stats = getCacheStatsSummary();

      expect(stats).toBeDefined();
      expect(stats.totalKeys).toBeDefined();
      expect(stats.estimatedSize).toBeDefined();
      expect(stats.averageTTL).toBeDefined();
    });
  });
});

