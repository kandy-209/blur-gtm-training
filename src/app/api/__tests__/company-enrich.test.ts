/**
 * Tests for Company Enrichment API
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

import { GET } from '@/app/api/company/enrich/route';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/alphavantage-enhanced', () => ({
  getComprehensiveCompanyData: jest.fn(),
}));

jest.mock('@/lib/company-enrichment-apis', () => ({
  enrichCompanyMultiSource: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/news-sentiment-api', () => ({
  getCompanyNewsFromNewsAPI: jest.fn().mockResolvedValue(null),
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
    return input.slice(0, maxLength || input.length);
  }),
}));

jest.mock('@/lib/cache-headers', () => ({
  CachePresets: {
    noCache: () => 'no-cache, must-revalidate, proxy-revalidate',
    companyAnalysis: () => 'public, max-age=300, stale-while-revalidate=600',
  },
}));

describe('Company Enrich API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require symbol or companyName', async () => {
    const request = new NextRequest('http://localhost/api/company/enrich');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should fetch data from all sources', async () => {
    const { getComprehensiveCompanyData } = require('@/lib/alphavantage-enhanced');
    const { enrichCompanyMultiSource } = require('@/lib/company-enrichment-apis');
    const { getCompanyNewsFromNewsAPI } = require('@/lib/news-sentiment-api');

    getComprehensiveCompanyData.mockResolvedValue({
      quote: { symbol: 'AAPL', price: 150 },
      overview: { name: 'Apple Inc.' },
    });

    enrichCompanyMultiSource.mockResolvedValue({
      name: 'Apple Inc.',
      employeeCount: 164000,
      dataSources: ['clearbit'],
    });

    getCompanyNewsFromNewsAPI.mockResolvedValue({
      companyName: 'Apple',
      articles: [],
      sentimentSummary: { positive: 0, negative: 0, neutral: 0, averageScore: 0 },
    });

    const request = new NextRequest(
      'http://localhost/api/company/enrich?symbol=AAPL&companyName=Apple'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.financial).toBeDefined();
    expect(data.enrichment).toBeDefined();
    expect(data.news).toBeDefined();
    expect(data.metadata.dataSources.length).toBeGreaterThan(0);
  });

  it('should handle errors gracefully', async () => {
    const { getComprehensiveCompanyData } = require('@/lib/alphavantage-enhanced');
    const { enrichCompanyMultiSource } = require('@/lib/company-enrichment-apis');
    const { getCompanyNewsFromNewsAPI } = require('@/lib/news-sentiment-api');
    
    // Mock all to reject to test error handling
    getComprehensiveCompanyData.mockRejectedValue(new Error('API Error'));
    enrichCompanyMultiSource.mockRejectedValue(new Error('Enrichment Error'));
    getCompanyNewsFromNewsAPI.mockRejectedValue(new Error('News Error'));

    const request = new NextRequest(
      'http://localhost/api/company/enrich?symbol=AAPL'
    );
    const response = await GET(request);
    const data = await response.json();

    // Route uses Promise.allSettled, so it returns 200 even if all sources fail
    expect(response.status).toBe(200);
    expect(data.financial).toBeNull();
    expect(data.enrichment).toBeNull();
    expect(data.news).toBeNull();
  });
});

