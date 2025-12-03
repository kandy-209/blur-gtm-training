// Set environment variable before importing module
process.env.ALPHA_VANTAGE_API_KEY = 'test-api-key';

import { getQuote, getCompanyOverview, searchSymbol, getDailyTimeSeries } from '../alphavantage-simple';

// Mock environment variable
const originalEnv = process.env.ALPHA_VANTAGE_API_KEY;

describe('alphavantage-simple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock) = jest.fn();
    process.env.ALPHA_VANTAGE_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.ALPHA_VANTAGE_API_KEY = originalEnv;
  });

  describe('getQuote', () => {
    it('returns quote data when API call succeeds', async () => {
      const mockResponse = {
        'Global Quote': {
          '01. symbol': 'AAPL',
          '02. open': '150.00',
          '03. high': '151.00',
          '04. low': '149.50',
          '05. price': '150.25',
          '06. volume': '50000000',
          '07. latest trading day': '2024-01-15',
          '08. previous close': '147.75',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getQuote('AAPL');

      expect(result).toEqual({
        symbol: 'AAPL',
        price: 150.25,
        change: 2.5,
        changePercent: expect.closeTo(1.69, 2),
        volume: 50000000,
        high: 151.0,
        low: 149.5,
        open: 150.0,
        previousClose: 147.75,
        timestamp: '2024-01-15',
      });
    });

    it('returns null when API key is missing', async () => {
      // Clear fetch calls
      jest.clearAllMocks();
      // Temporarily delete the API key
      const originalKey = process.env.ALPHA_VANTAGE_API_KEY;
      delete process.env.ALPHA_VANTAGE_API_KEY;
      
      // Re-import the module to pick up the new env var
      jest.resetModules();
      const { getQuote: getQuoteWithoutKey } = await import('../alphavantage-simple');
      
      const result = await getQuoteWithoutKey('AAPL');
      
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Restore
      process.env.ALPHA_VANTAGE_API_KEY = originalKey;
      jest.resetModules();
    });

    it('returns null when API returns error message', async () => {
      const mockResponse = {
        'Error Message': 'Invalid API call. Please retry or visit the documentation.',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getQuote('INVALID');

      expect(result).toBeNull();
    });

    it('returns null when API returns rate limit note', async () => {
      const mockResponse = {
        Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute...',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getQuote('AAPL');

      expect(result).toBeNull();
    });

    it('returns null when Global Quote is missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await getQuote('AAPL');

      expect(result).toBeNull();
    });

    it('returns null when price is missing', async () => {
      const mockResponse = {
        'Global Quote': {
          '01. symbol': 'AAPL',
          '02. open': '150.00',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getQuote('AAPL');

      expect(result).toBeNull();
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getQuote('AAPL');

      expect(result).toBeNull();
    });

    it('handles non-ok HTTP responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getQuote('AAPL');

      expect(result).toBeNull();
    });

    it('calculates change and changePercent correctly', async () => {
      const mockResponse = {
        'Global Quote': {
          '01. symbol': 'MSFT',
          '02. open': '350.00',
          '03. high': '352.00',
          '04. low': '349.00',
          '05. price': '350.50',
          '06. volume': '30000000',
          '07. latest trading day': '2024-01-15',
          '08. previous close': '351.75',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getQuote('MSFT');

      expect(result?.change).toBeCloseTo(-1.25);
      expect(result?.changePercent).toBeCloseTo(-0.36, 2);
    });

    it('handles zero previous close', async () => {
      const mockResponse = {
        'Global Quote': {
          '01. symbol': 'TSLA',
          '02. open': '250.00',
          '03. high': '252.00',
          '04. low': '248.00',
          '05. price': '250.75',
          '06. volume': '75000000',
          '07. latest trading day': '2024-01-15',
          '08. previous close': '0',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getQuote('TSLA');

      expect(result?.changePercent).toBe(0);
    });
  });

  describe('getCompanyOverview', () => {
    it('returns company overview when API call succeeds', async () => {
      const mockResponse = {
        Symbol: 'AAPL',
        Name: 'Apple Inc.',
        Description: 'Apple Inc. designs, manufactures...',
        Sector: 'Technology',
        Industry: 'Consumer Electronics',
        MarketCapitalization: '3000000000000',
        PERatio: '30.5',
        DividendYield: '0.5',
        Beta: '1.2',
        EPS: '6.11',
        RevenueTTM: '394328000000',
        ProfitMargin: '0.25',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCompanyOverview('AAPL');

      expect(result).toEqual({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        description: 'Apple Inc. designs, manufactures...',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        marketCap: '3000000000000',
        peRatio: '30.5',
        dividendYield: '0.5',
        beta: '1.2',
        eps: '6.11',
        revenue: '394328000000',
        profitMargin: '0.25',
      });
    });

    it('returns null when API key is missing', async () => {
      process.env.ALPHA_VANTAGE_API_KEY = '';
      
      const result = await getCompanyOverview('AAPL');
      
      expect(result).toBeNull();
    });

    it('returns null when API returns error', async () => {
      const mockResponse = {
        'Error Message': 'Invalid API call.',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCompanyOverview('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('searchSymbol', () => {
    it('returns symbol matches when API call succeeds', async () => {
      const mockResponse = {
        bestMatches: [
          {
            '1. symbol': 'AAPL',
            '2. name': 'Apple Inc.',
          },
          {
            '1. symbol': 'AAPL.MX',
            '2. name': 'Apple Inc.',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchSymbol('Apple');

      expect(result).toEqual([
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'AAPL.MX', name: 'Apple Inc.' },
      ]);
    });

    it('returns null when API key is missing', async () => {
      process.env.ALPHA_VANTAGE_API_KEY = '';
      
      const result = await searchSymbol('Apple');
      
      expect(result).toBeNull();
    });

    it('returns null when API returns error', async () => {
      const mockResponse = {
        'Error Message': 'Invalid API call.',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchSymbol('Invalid');

      expect(result).toBeNull();
    });

    it('handles empty bestMatches array', async () => {
      const mockResponse = {
        bestMatches: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchSymbol('Nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getDailyTimeSeries', () => {
    it('returns time series data when API call succeeds', async () => {
      const mockResponse = {
        'Time Series (Daily)': {
          '2024-01-15': {
            '1. open': '150.00',
            '2. high': '151.00',
            '3. low': '149.50',
            '4. close': '150.25',
            '5. volume': '50000000',
          },
          '2024-01-14': {
            '1. open': '149.00',
            '2. high': '150.00',
            '3. low': '148.50',
            '4. close': '149.75',
            '5. volume': '45000000',
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getDailyTimeSeries('AAPL');

      expect(result).toHaveLength(2);
      expect(result?.[0]).toEqual({
        date: '2024-01-14',
        open: 149.00,
        high: 150.00,
        low: 148.50,
        close: 149.75,
        volume: 45000000,
      });
      expect(result?.[1]).toEqual({
        date: '2024-01-15',
        open: 150.00,
        high: 151.00,
        low: 149.50,
        close: 150.25,
        volume: 50000000,
      });
    });

    it('returns null when API key is missing', async () => {
      process.env.ALPHA_VANTAGE_API_KEY = '';
      
      const result = await getDailyTimeSeries('AAPL');
      
      expect(result).toBeNull();
    });

    it('returns null when Time Series is missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await getDailyTimeSeries('AAPL');

      expect(result).toBeNull();
    });
  });
});

