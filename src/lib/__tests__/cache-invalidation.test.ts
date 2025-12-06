/**
 * Tests for Cache Invalidation
 */

import { invalidateKey, invalidateKeys, invalidateSymbol, invalidateSearch } from '../cache/cache-invalidation';

jest.mock('../redis', () => ({
  cacheDelete: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

jest.mock('../logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('cache-invalidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('invalidateKey', () => {
    it('should invalidate a single key', async () => {
      const { cacheDelete } = await import('../redis');
      
      await invalidateKey('test-key');

      expect(cacheDelete).toHaveBeenCalledWith('test-key');
    });
  });

  describe('invalidateKeys', () => {
    it('should invalidate multiple keys', async () => {
      const { cacheDelete } = await import('../redis');
      
      await invalidateKeys(['key1', 'key2', 'key3']);

      expect(cacheDelete).toHaveBeenCalledTimes(3);
      expect(cacheDelete).toHaveBeenCalledWith('key1');
      expect(cacheDelete).toHaveBeenCalledWith('key2');
      expect(cacheDelete).toHaveBeenCalledWith('key3');
    });
  });

  describe('invalidateSymbol', () => {
    it('should invalidate all symbol-related cache', async () => {
      const { cacheDelete } = await import('../redis');
      
      await invalidateSymbol('AAPL');

      expect(cacheDelete).toHaveBeenCalledTimes(4);
      expect(cacheDelete).toHaveBeenCalledWith('quote:AAPL');
      expect(cacheDelete).toHaveBeenCalledWith('overview:AAPL');
    });
  });

  describe('invalidateSearch', () => {
    it('should invalidate search-related cache', async () => {
      const { cacheDelete } = await import('../redis');
      
      await invalidateSearch('Apple');

      expect(cacheDelete).toHaveBeenCalledTimes(3);
      expect(cacheDelete).toHaveBeenCalledWith('search:Apple');
    });
  });
});




