import { GET } from '@/app/api/alphavantage/search/route';
import { searchSymbol, getQuote, getCompanyOverview } from '@/lib/alphavantage-simple';
import { retryWithBackoff } from '@/lib/error-recovery';

// Mock dependencies
jest.mock('@/lib/alphavantage-simple');
jest.mock('@/lib/error-recovery');

// Mock NextRequest
class MockNextRequest {
  public nextUrl: URL;
  
  constructor(public url: string) {
    this.nextUrl = new URL(url);
  }
}

describe('/api/alphavantage/search - Enhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALPHA_VANTAGE_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.ALPHA_VANTAGE_API_KEY;
  });

  describe('GET - Basic Search', () => {
    it('should return search results', async () => {
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corporation' },
      ];

      (retryWithBackoff as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResults,
        attempts: 1,
      });

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual(mockResults);
      expect(data.total).toBe(2);
    });

    it('should return empty results when no matches found', async () => {
      (retryWithBackoff as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
        attempts: 1,
      });

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Nonexistent') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.message).toContain('No results found');
    });

    it('should return 503 when API key is missing', async () => {
      delete process.env.ALPHA_VANTAGE_API_KEY;

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toContain('API key');
    });

    it('should require keyword parameter', async () => {
      const request = new MockNextRequest('http://localhost/api/alphavantage/search') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Keyword');
    });
  });

  describe('GET - Enriched Results', () => {
    it('should return enriched results with quote and overview when includeDetails=true', async () => {
      const mockSearchResults = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
      ];

      const mockQuote = {
        symbol: 'AAPL',
        price: 175.50,
        change: 2.30,
        changePercent: 1.33,
        volume: 50000000,
        high: 176.00,
        low: 174.00,
        open: 175.00,
        previousClose: 173.20,
        timestamp: '2024-01-15',
      };

      const mockOverview = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        description: 'Apple Inc. designs...',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        marketCap: '2800000000000',
        peRatio: '30.5',
        dividendYield: '0.5',
        beta: '1.2',
        eps: '6.11',
        revenue: '394328000000',
        profitMargin: '0.25',
      };

      (retryWithBackoff as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: mockSearchResults,
          attempts: 1,
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockQuote,
          attempts: 1,
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockOverview,
          attempts: 1,
        });

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple&includeDetails=true') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toHaveLength(1);
      expect(data.results[0]).toHaveProperty('quote');
      expect(data.results[0]).toHaveProperty('overview');
      expect(data.results[0].quote).toEqual(mockQuote);
      expect(data.results[0].overview).toEqual(mockOverview);
      expect(data.enriched).toBe(true);
    });

    it('should return basic results if enrichment fails', async () => {
      const mockSearchResults = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
      ];

      (retryWithBackoff as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: mockSearchResults,
          attempts: 1,
        })
        .mockRejectedValueOnce(new Error('Quote fetch failed'))
        .mockRejectedValueOnce(new Error('Overview fetch failed'));

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple&includeDetails=true') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toHaveLength(1);
      expect(data.results[0].quote).toBeNull();
      expect(data.results[0].overview).toBeNull();
    });
  });

  describe('Retry Logic', () => {
    it('should retry on timeout errors', async () => {
      (retryWithBackoff as jest.Mock).mockResolvedValue({
        success: true,
        data: [{ symbol: 'AAPL', name: 'Apple Inc.' }],
        attempts: 2, // Retried once
      });

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(retryWithBackoff).toHaveBeenCalled();
    });

    it('should retry on rate limit errors', async () => {
      (retryWithBackoff as jest.Mock).mockResolvedValue({
        success: true,
        data: [{ symbol: 'AAPL', name: 'Apple Inc.' }],
        attempts: 3,
      });

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle search failures gracefully', async () => {
      (retryWithBackoff as jest.Mock).mockResolvedValue({
        success: false,
        error: new Error('Search failed'),
        attempts: 3,
      });

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.message).toContain('No results found');
    });

    it('should handle unexpected errors', async () => {
      (retryWithBackoff as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      const request = new MockNextRequest('http://localhost/api/alphavantage/search?keyword=Apple') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.results).toEqual([]);
    });
  });
});



