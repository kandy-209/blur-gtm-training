/**
 * Tests for Cache Metrics API
 */

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

import { GET } from '@/app/api/cache/metrics/route';
import { NextRequest } from 'next/server';
import { getCacheMetrics } from '@/lib/next-cache-wrapper';

jest.mock('@/lib/next-cache-wrapper', () => ({
  getCacheMetrics: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

jest.mock('@/lib/cache-headers', () => ({
  CachePresets: {
    noCache: () => 'no-cache, must-revalidate, proxy-revalidate',
    apiStable: (seconds: number) => `public, max-age=${seconds}`,
  },
}));

describe('Cache Metrics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cache metrics', async () => {
    (getCacheMetrics as jest.Mock).mockReturnValue({
      'quote:AAPL': {
        hits: 10,
        misses: 2,
        staleServed: 1,
        errors: 0,
        totalRequests: 13,
      },
    });

    const request = new NextRequest('http://localhost/api/cache/metrics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.metrics).toBeDefined();
    expect(data.summary).toBeDefined();
    expect(data.summary.totalRequests).toBe(13);
    expect(data.summary.overallHitRate).toBeDefined();
  });

  it('should filter metrics by pattern', async () => {
    (getCacheMetrics as jest.Mock).mockReturnValue({
      'quote:AAPL': { hits: 5, misses: 1, staleServed: 0, errors: 0, totalRequests: 6 },
    });

    const request = new NextRequest('http://localhost/api/cache/metrics?pattern=quote');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(getCacheMetrics).toHaveBeenCalledWith('quote');
  });

  it('should calculate cache efficiency', async () => {
    (getCacheMetrics as jest.Mock).mockReturnValue({
      'test-key': {
        hits: 8,
        misses: 2,
        staleServed: 0,
        errors: 0,
        totalRequests: 10,
      },
    });

    const request = new NextRequest('http://localhost/api/cache/metrics');
    const response = await GET(request);
    const data = await response.json();

    expect(data.summary.cacheEfficiency).toBe(80); // 8/10 * 100
  });
});

