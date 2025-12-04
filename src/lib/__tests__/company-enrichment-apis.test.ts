/**
 * Tests for Company Enrichment APIs
 */

import { enrichFromClearbit, enrichCompanyMultiSource } from '../company-enrichment-apis';

jest.mock('../next-cache-wrapper', () => ({
  cachedRouteHandler: jest.fn(async (key, fetcher, options) => {
    const result = await fetcher();
    return {
      data: result,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  }),
}));

jest.mock('../error-recovery', () => ({
  retryWithBackoff: jest.fn(async (fn) => {
    const result = await fn();
    return {
      success: true,
      data: result,
    };
  }),
}));

jest.mock('../logger', () => ({
  log: {
    warn: jest.fn(),
  },
}));

describe('company-enrichment-apis', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enrichFromClearbit', () => {
    it('should return null for empty domain', async () => {
      const result = await enrichFromClearbit('');
      expect(result).toBeNull();
    });

    it('should parse Clearbit data correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          name: 'Apple Inc.',
          domain: 'apple.com',
          description: 'Technology company',
          metrics: {
            employees: 164000,
            employeesRange: '100K+',
            annualRevenue: 394328000000,
          },
          geo: {
            city: 'Cupertino',
            state: 'CA',
            country: 'US',
          },
          category: {
            industry: 'Technology',
            sector: 'Consumer Electronics',
          },
          foundedYear: 1976,
          linkedin: { handle: 'apple' },
          twitter: { handle: 'apple' },
        }),
      });

      const result = await enrichFromClearbit('apple.com');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Apple Inc.');
      expect(result?.employeeCount).toBe(164000);
      expect(result?.city).toBe('Cupertino');
    });

    it('should handle 404 gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 404,
        ok: false,
        json: async () => ({}),
      });

      const result = await enrichFromClearbit('nonexistent.com');
      expect(result).toBeNull();
    });
  });

  describe('enrichCompanyMultiSource', () => {
    it('should aggregate data from multiple sources', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          name: 'Apple Inc.',
          domain: 'apple.com',
        }),
      });

      const result = await enrichCompanyMultiSource('Apple Inc.', 'apple.com', 'AAPL');

      expect(result).toBeDefined();
      expect(result.name).toBe('Apple Inc.');
      expect(result.domain).toBe('apple.com');
      expect(result.dataSources).toBeDefined();
    });

    it('should handle missing domain gracefully', async () => {
      const result = await enrichCompanyMultiSource('Apple Inc.', undefined, 'AAPL');

      expect(result).toBeDefined();
      expect(result.name).toBe('Apple Inc.');
    });
  });
});

