/**
 * Tests for Enhanced Alpha Vantage Quote API
 */

// Mock next/server before importing
jest.mock('next/server', () => {
  // Simple mock implementations
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

import { GET } from '@/app/api/alphavantage/quote/route';
import { NextRequest, NextResponse } from 'next/server';

const mockGetEnhancedQuote = jest.fn();
jest.mock('@/lib/alphavantage-enhanced', () => ({
  getEnhancedQuote: (...args: any[]) => mockGetEnhancedQuote(...args),
}));

jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

jest.mock('@/lib/error-handler', () => ({
  handleError: jest.fn((error, requestId) => {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }),
}));

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((input: string, maxLength?: number) => {
    if (!input || typeof input !== 'string') {
      return '';
    }
    return input.slice(0, maxLength || input.length).toUpperCase();
  }),
}));

jest.mock('@/lib/cache-headers', () => ({
  CachePresets: {
    noCache: () => 'no-cache, must-revalidate, proxy-revalidate',
    stockQuote: () => 'public, max-age=60, stale-while-revalidate=300',
  },
}));

jest.mock('@/lib/next-cache-wrapper', () => ({
  cachedRouteHandler: jest.fn(async (key, fetcher, options) => {
    const result = await fetcher();
    return {
      data: result,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  }),
}));

describe('Enhanced Alpha Vantage Quote API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALPHA_VANTAGE_API_KEY = 'test-key';
    mockGetEnhancedQuote.mockReset();
    // Reset mock to return a default value to prevent errors
    mockGetEnhancedQuote.mockResolvedValue(null);
  });

  it('should require symbol parameter', async () => {
    const request = new NextRequest('http://localhost/api/alphavantage/quote');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should return enhanced quote data', async () => {
    mockGetEnhancedQuote.mockResolvedValue({
      symbol: 'AAPL',
      price: 150.00,
      change: 1.00,
      changePercent: 0.67,
      volume: 1000000,
      marketCap: 2500000000000,
      peRatio: 30.00,
    });

    const request = new NextRequest('http://localhost/api/alphavantage/quote?symbol=AAPL');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.quote).toBeDefined();
    expect(data.quote.symbol).toBe('AAPL');
    expect(data.quote.price).toBe(150.00);
    expect(data.quote.marketCap).toBeDefined();
  });

  it('should return 404 when quote not found', async () => {
    mockGetEnhancedQuote.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/alphavantage/quote?symbol=INVALID');
    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it('should return 503 when API key missing', async () => {
    delete process.env.ALPHA_VANTAGE_API_KEY;

    const request = new NextRequest('http://localhost/api/alphavantage/quote?symbol=AAPL');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('not configured');
  });

  it('should include cache headers', async () => {
    mockGetEnhancedQuote.mockResolvedValue({
      symbol: 'AAPL',
      price: 150.00,
    });

    const request = new NextRequest('http://localhost/api/alphavantage/quote?symbol=AAPL');
    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toBeDefined();
    expect(response.headers.get('X-Request-ID')).toBeDefined();
    expect(response.headers.get('X-Response-Time')).toBeDefined();
  });
});

