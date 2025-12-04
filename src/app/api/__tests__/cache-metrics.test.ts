/**
 * Tests for Cache Metrics API
 */

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

