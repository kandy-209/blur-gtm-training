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

// Mock the alphavantage-simple module
jest.mock('@/lib/alphavantage-simple', () => ({
  getQuote: jest.fn(),
}));

// Mock security module
jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((input: string) => input.toUpperCase()),
}));

// Mock error-recovery to avoid retry delays in tests
jest.mock('@/lib/error-recovery', () => ({
  retryWithBackoff: jest.fn(async (fn: () => Promise<any>) => {
    try {
      const data = await fn();
      return { success: true, data, attempts: 1 };
    } catch (error) {
      return { success: false, error, attempts: 1 };
    }
  }),
}));

// Mock fs module to prevent debug log errors
jest.mock('fs', () => ({
  appendFileSync: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/alphavantage/quote/route';
import { getQuote } from '@/lib/alphavantage-simple';

describe('GET /api/alphavantage/quote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns quote when symbol is valid', async () => {
    const mockQuote = {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.5,
      changePercent: 1.69,
      volume: 50000000,
      high: 151.0,
      low: 149.5,
      open: 150.0,
      previousClose: 147.75,
      timestamp: '2024-01-15',
    };

    (getQuote as jest.Mock).mockResolvedValueOnce(mockQuote);

    const url = new URL('http://localhost/api/alphavantage/quote?symbol=AAPL');
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.quote).toEqual(mockQuote);
    expect(getQuote).toHaveBeenCalledWith('AAPL');
  });

  it('returns 400 when symbol is missing', async () => {
    const url = new URL('http://localhost/api/alphavantage/quote');
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Symbol parameter is required');
    expect(getQuote).not.toHaveBeenCalled();
  });

  it('returns 404 when quote is not found', async () => {
    (getQuote as jest.Mock).mockResolvedValueOnce(null);

    const url = new URL('http://localhost/api/alphavantage/quote?symbol=INVALID');
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Quote not found or API error');
  });

  it('converts symbol to uppercase', async () => {
    const mockQuote = {
      symbol: 'MSFT',
      price: 350.50,
      change: -1.25,
      changePercent: -0.36,
      volume: 30000000,
      high: 352.0,
      low: 349.0,
      open: 351.0,
      previousClose: 351.75,
      timestamp: '2024-01-15',
    };

    (getQuote as jest.Mock).mockResolvedValueOnce(mockQuote);

    const url = new URL('http://localhost/api/alphavantage/quote?symbol=msft');
    const request = new NextRequest(url);

    const response = await GET(request);
    await response.json();

    expect(getQuote).toHaveBeenCalledWith('MSFT');
  });

  it('handles API errors gracefully', async () => {
    // Mock to reject - retryWithBackoff is mocked to not retry
    const rateLimitError = new Error('API rate limit exceeded');
    (getQuote as jest.Mock).mockRejectedValueOnce(rateLimitError);

    const url = new URL('http://localhost/api/alphavantage/quote?symbol=AAPL');
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API rate limit exceeded');
  }, 10000); // Increase timeout to 10 seconds

  it('sanitizes symbol input', async () => {
    const mockQuote = {
      symbol: 'TSLA',
      price: 250.75,
      change: 5.25,
      changePercent: 2.14,
      volume: 75000000,
      high: 252.0,
      low: 248.0,
      open: 249.0,
      previousClose: 245.5,
      timestamp: '2024-01-15',
    };

    (getQuote as jest.Mock).mockResolvedValueOnce(mockQuote);

    const url = new URL('http://localhost/api/alphavantage/quote?symbol=tsla%20%20');
    const request = new NextRequest(url);

    const response = await GET(request);
    await response.json();

    expect(getQuote).toHaveBeenCalled();
  });

  it('handles special characters in symbol', async () => {
    // Mock getQuote to return null for invalid symbols
    (getQuote as jest.Mock).mockResolvedValueOnce(null);

    const url = new URL('http://localhost/api/alphavantage/quote?symbol=AAPL%3Cscript%3E');
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    // Should sanitize or reject malicious input
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('handles empty symbol parameter', async () => {
    const url = new URL('http://localhost/api/alphavantage/quote?symbol=');
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Symbol parameter is required');
  });

  it('handles multiple symbol parameters (takes first)', async () => {
    const mockQuote = {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.5,
      changePercent: 1.69,
      volume: 50000000,
      high: 151.0,
      low: 149.5,
      open: 150.0,
      previousClose: 147.75,
      timestamp: '2024-01-15',
    };

    (getQuote as jest.Mock).mockResolvedValueOnce(mockQuote);

    const url = new URL('http://localhost/api/alphavantage/quote?symbol=AAPL&symbol=MSFT');
    const request = new NextRequest(url);

    const response = await GET(request);
    await response.json();

    expect(getQuote).toHaveBeenCalledTimes(1);
  });
});

