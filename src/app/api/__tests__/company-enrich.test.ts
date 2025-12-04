/**
 * Tests for Company Enrichment API
 */

import { GET } from '@/app/api/company/enrich/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/alphavantage-enhanced', () => ({
  getComprehensiveCompanyData: jest.fn(),
}));

jest.mock('@/lib/company-enrichment-apis', () => ({
  enrichCompanyMultiSource: jest.fn(),
}));

jest.mock('@/lib/news-sentiment-api', () => ({
  getCompanyNewsFromNewsAPI: jest.fn(),
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
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
    getComprehensiveCompanyData.mockRejectedValue(new Error('API Error'));

    const request = new NextRequest(
      'http://localhost/api/company/enrich?symbol=AAPL'
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

