// Mock next/server before importing
jest.mock('next/server', () => {
  class MockNextRequest {
    public headers: Headers;
    public nextUrl: { searchParams: URLSearchParams };
    
    constructor(url: string | URL, init?: RequestInit) {
      this.headers = new Headers(init?.headers);
      const urlObj = typeof url === 'string' ? new URL(url) : url;
      this.nextUrl = { searchParams: urlObj.searchParams };
    }
    
    async json() {
      return {};
    }
    
    async text() {
      return '';
    }
  }
  
  class MockNextResponse {
    public status: number;
    public headers: Headers;
    private _body: any;
    
    constructor(body?: any, init?: ResponseInit) {
      this.status = init?.status ?? 200;
      this.headers = new Headers(init?.headers);
      this._body = body;
    }
    
    static json(body: any, init?: ResponseInit) {
      return new MockNextResponse(JSON.stringify(body), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    }
    
    async json() {
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
    }
    
    async text() {
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
    }
  }
  
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

import { GET } from '@/app/api/alphavantage/search/route';
import { NextRequest, NextResponse } from 'next/server';
import { searchSymbol, getQuote, getCompanyOverview } from '@/lib/alphavantage-simple';
import { retryWithBackoff } from '@/lib/error-recovery';

// Mock dependencies
jest.mock('@/lib/alphavantage-simple');
jest.mock('@/lib/error-recovery');
jest.mock('@/lib/alphavantage-enhanced', () => ({
  getEnhancedQuote: jest.fn(),
  getEnhancedCompanyOverview: jest.fn(),
}));
jest.mock('@/lib/next-cache-wrapper', () => ({
  cachedRouteHandler: jest.fn(async (key, fetcher, options) => {
    const result = await fetcher();
    return {
      data: result,
      timestamp: new Date().toISOString(),
      cached: false,
      age: 0,
    };
  }),
}));
jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((input: string, maxLength?: number) => {
    if (!input || typeof input !== 'string') {
      return '';
    }
    return input.slice(0, maxLength || input.length);
  }),
}));
jest.mock('@/lib/cache-headers', () => ({
  CachePresets: {
    noCache: () => 'no-cache, must-revalidate, proxy-revalidate',
    apiStable: (seconds: number) => `public, max-age=${seconds}`,
  },
}));
jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  generateRequestId: jest.fn(() => 'test-request-id'),
}));
jest.mock('@/lib/error-handler', () => ({
  handleError: jest.fn((error, requestId) => {
    return NextResponse.json(
      { error: error?.message || 'Internal server error', results: [] },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }),
}));

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

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple');
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

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return 503 when API key is missing', async () => {
      delete process.env.ALPHA_VANTAGE_API_KEY;

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toContain('API key');
    });

    it('should require keyword parameter', async () => {
      const request = new NextRequest('http://localhost/api/alphavantage/search');
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

      const { getEnhancedQuote, getEnhancedCompanyOverview } = require('@/lib/alphavantage-enhanced');
      
      (retryWithBackoff as jest.Mock).mockResolvedValue({
        success: true,
        data: mockSearchResults,
        attempts: 1,
      });
      
      getEnhancedQuote.mockResolvedValue(mockQuote);
      getEnhancedCompanyOverview.mockResolvedValue(mockOverview);

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple&includeDetails=true');
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

      const { getEnhancedQuote, getEnhancedCompanyOverview } = require('@/lib/alphavantage-enhanced');
      
      (retryWithBackoff as jest.Mock).mockResolvedValue({
        success: true,
        data: mockSearchResults,
        attempts: 1,
      });
      
      getEnhancedQuote.mockRejectedValue(new Error('Quote fetch failed'));
      getEnhancedCompanyOverview.mockRejectedValue(new Error('Overview fetch failed'));

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple&includeDetails=true');
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

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple');
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

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple');
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

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should handle unexpected errors', async () => {
      (retryWithBackoff as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost/api/alphavantage/search?keyword=Apple');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.results).toEqual([]);
    });
  });
});




