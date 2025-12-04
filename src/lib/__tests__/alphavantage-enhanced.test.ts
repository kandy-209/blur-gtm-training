/**
 * Tests for Enhanced Alpha Vantage Integration
 */

// Set env var before importing (module reads it at load time)
process.env.ALPHA_VANTAGE_API_KEY = 'test-key';

import {
  getEnhancedQuote,
  getEnhancedCompanyOverview,
  getEarningsData,
  getBalanceSheet,
  getComprehensiveCompanyData,
} from '../alphavantage-enhanced';

// Mock the cache wrapper
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

// Mock logger
jest.mock('../logger', () => ({
  log: {
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock error recovery
jest.mock('../error-recovery', () => ({
  retryWithBackoff: jest.fn(async (fn, options) => {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: 1,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        attempts: 1,
      };
    }
  }),
}));

describe('alphavantage-enhanced', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALPHA_VANTAGE_API_KEY = 'test-key';
  });

  describe('getEnhancedQuote', () => {
    it('should return null when API key is missing', async () => {
      delete process.env.ALPHA_VANTAGE_API_KEY;
      const result = await getEnhancedQuote('AAPL');
      expect(result).toBeNull();
    });

    it('should parse quote data correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'Global Quote': {
            '01. symbol': 'AAPL',
            '05. price': '150.00',
            '08. previous close': '149.00',
            '06. volume': '1000000',
            '03. high': '151.00',
            '04. low': '149.50',
            '02. open': '149.50',
            '07. latest trading day': '2024-01-01',
          },
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Symbol: 'AAPL',
          Name: 'Apple Inc.',
          MarketCapitalization: '2500000000000',
          PERatio: '30.00',
        }),
      });

      const result = await getEnhancedQuote('AAPL');

      expect(result).toBeDefined();
      expect(result?.symbol).toBe('AAPL');
      expect(result?.price).toBe(150.00);
      expect(result?.change).toBe(1.00);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          'Error Message': 'Invalid API call',
        }),
      });

      const result = await getEnhancedQuote('INVALID');
      expect(result).toBeNull();
    });
  });

  describe('getEnhancedCompanyOverview', () => {
    it('should parse company overview correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Symbol: 'AAPL',
          Name: 'Apple Inc.',
          Description: 'Technology company',
          Sector: 'Technology',
          Industry: 'Consumer Electronics',
          FullTimeEmployees: '164000',
          MarketCapitalization: '2500000000000',
          PERatio: '30.00',
          RevenueTTM: '394328000000',
        }),
      });

      const result = await getEnhancedCompanyOverview('AAPL');

      expect(result).toBeDefined();
      expect(result?.symbol).toBe('AAPL');
      expect(result?.name).toBe('Apple Inc.');
      expect(result?.fullTimeEmployees).toBe(164000);
    });
  });

  describe('getComprehensiveCompanyData', () => {
    it('should fetch all data sources in parallel', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await getComprehensiveCompanyData('AAPL');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('quote');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('earnings');
      expect(result).toHaveProperty('balanceSheet');
    });
  });
});

