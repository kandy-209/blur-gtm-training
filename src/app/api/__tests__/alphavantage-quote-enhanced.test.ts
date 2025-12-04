/**
 * Tests for Enhanced Alpha Vantage Quote API
 */

import { GET } from '@/app/api/alphavantage/quote/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/alphavantage-enhanced', () => ({
  getEnhancedQuote: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

jest.mock('@/lib/error-handler', () => ({
  handleError: jest.fn((error) => {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
}));

describe('Enhanced Alpha Vantage Quote API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALPHA_VANTAGE_API_KEY = 'test-key';
  });

  it('should require symbol parameter', async () => {
    const request = new NextRequest('http://localhost/api/alphavantage/quote');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should return enhanced quote data', async () => {
    const { getEnhancedQuote } = require('@/lib/alphavantage-enhanced');
    getEnhancedQuote.mockResolvedValue({
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
    const { getEnhancedQuote } = require('@/lib/alphavantage-enhanced');
    getEnhancedQuote.mockResolvedValue(null);

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
    const { getEnhancedQuote } = require('@/lib/alphavantage-enhanced');
    getEnhancedQuote.mockResolvedValue({
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

