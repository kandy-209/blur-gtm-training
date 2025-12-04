/**
 * Stress Testing Helpers
 * Utilities for load testing, stress testing, and performance benchmarking
 */

import { NextRequest } from 'next/server';
import { testApiEndpoint } from './api-test-utils';

export interface StressTestResult {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  rateLimitCount: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number; // requests per second
  errors: Array<{ status: number; error: string; count: number }>;
  responseTimeDistribution: Array<{ range: string; count: number }>;
}

/**
 * Run stress test with concurrent requests
 */
export async function runStressTest(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    totalRequests: number;
    concurrency: number;
    requestOptions: any;
    rampUp?: boolean; // Gradually increase concurrency
    duration?: number; // Maximum duration in ms
  }
): Promise<StressTestResult> {
  const {
    totalRequests,
    concurrency,
    requestOptions,
    rampUp = false,
    duration,
  } = options;

  const results: Array<{
    success: boolean;
    status: number;
    responseTime: number;
    error?: string;
  }> = [];

  const startTime = Date.now();
  let completedRequests = 0;

  if (rampUp) {
    // Gradually increase concurrency
    const rampSteps = Math.ceil(totalRequests / concurrency);
    for (let step = 0; step < rampSteps; step++) {
      const currentConcurrency = Math.min(concurrency, totalRequests - completedRequests);
      const batch = Array.from({ length: currentConcurrency }, async () => {
        const requestStart = Date.now();
        try {
          const response = await testApiEndpoint(handler, url, requestOptions);
          return {
            success: response.status >= 200 && response.status < 300,
            status: response.status,
            responseTime: Date.now() - requestStart,
          };
        } catch (error: any) {
          return {
            success: false,
            status: 500,
            responseTime: Date.now() - requestStart,
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      completedRequests += batchResults.length;

      // Check duration limit
      if (duration && Date.now() - startTime > duration) {
        break;
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } else {
    // Fixed concurrency
    const batches = Math.ceil(totalRequests / concurrency);
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, totalRequests - completedRequests);
      const batchPromises = Array.from({ length: batchSize }, async () => {
        const requestStart = Date.now();
        try {
          const response = await testApiEndpoint(handler, url, requestOptions);
          return {
            success: response.status >= 200 && response.status < 300,
            status: response.status,
            responseTime: Date.now() - requestStart,
          };
        } catch (error: any) {
          return {
            success: false,
            status: 500,
            responseTime: Date.now() - requestStart,
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      completedRequests += batchResults.length;

      // Check duration limit
      if (duration && Date.now() - startTime > duration) {
        break;
      }
    }
  }

  const totalTime = Date.now() - startTime;
  const responseTimes = results.map(r => r.responseTime).sort((a, b) => a - b);
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  const rateLimitCount = results.filter(r => r.status === 429).length;

  // Calculate percentiles
  const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)] || 0;
  const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
  const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;

  // Group errors by status
  const errorMap = new Map<string, number>();
  results.filter(r => !r.success).forEach(r => {
    const key = `${r.status}:${r.error || 'unknown'}`;
    errorMap.set(key, (errorMap.get(key) || 0) + 1);
  });

  const errors = Array.from(errorMap.entries()).map(([key, count]) => {
    const [status, error] = key.split(':');
    return { status: parseInt(status), error, count };
  });

  // Response time distribution
  const distribution = [
    { range: '0-100ms', count: responseTimes.filter(t => t < 100).length },
    { range: '100-500ms', count: responseTimes.filter(t => t >= 100 && t < 500).length },
    { range: '500ms-1s', count: responseTimes.filter(t => t >= 500 && t < 1000).length },
    { range: '1s-5s', count: responseTimes.filter(t => t >= 1000 && t < 5000).length },
    { range: '5s+', count: responseTimes.filter(t => t >= 5000).length },
  ];

  return {
    totalRequests: results.length,
    successCount,
    errorCount,
    rateLimitCount,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: responseTimes[0] || 0,
    maxResponseTime: responseTimes[responseTimes.length - 1] || 0,
    p50ResponseTime: p50,
    p95ResponseTime: p95,
    p99ResponseTime: p99,
    throughput: (results.length / totalTime) * 1000, // requests per second
    errors,
    responseTimeDistribution: distribution,
  };
}

/**
 * Test memory leaks under sustained load
 */
export async function testMemoryLeaks(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    iterations: number;
    requestOptions: any;
    checkInterval?: number;
  }
): Promise<{
  memoryBefore: number;
  memoryAfter: number;
  memoryIncrease: number;
  potentialLeak: boolean;
}> {
  const { iterations, requestOptions, checkInterval = 100 } = options;

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const memoryBefore = process.memoryUsage().heapUsed;

  for (let i = 0; i < iterations; i++) {
    await testApiEndpoint(handler, url, requestOptions);

    if (i % checkInterval === 0 && global.gc) {
      global.gc();
    }
  }

  // Force final GC
  if (global.gc) {
    global.gc();
  }

  const memoryAfter = process.memoryUsage().heapUsed;
  const memoryIncrease = memoryAfter - memoryBefore;
  const potentialLeak = memoryIncrease > memoryBefore * 0.5; // More than 50% increase

  return {
    memoryBefore,
    memoryAfter,
    memoryIncrease,
    potentialLeak,
  };
}

/**
 * Test database connection pooling under load
 */
export async function testDatabasePooling(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    concurrent: number;
    requestOptions: any;
  }
): Promise<{
  success: boolean;
  averageResponseTime: number;
  errorRate: number;
  connectionErrors: number;
}> {
  const { concurrent, requestOptions } = options;

  const requests = Array.from({ length: concurrent }, async () => {
    const start = Date.now();
    try {
      const response = await testApiEndpoint(handler, url, requestOptions);
      return {
        success: response.status >= 200 && response.status < 300,
        responseTime: Date.now() - start,
        error: response.status >= 500 ? 'Server error' : undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        responseTime: Date.now() - start,
        error: error.message,
      };
    }
  });

  const results = await Promise.all(requests);
  const responseTimes = results.map(r => r.responseTime);
  const successCount = results.filter(r => r.success).length;
  const connectionErrors = results.filter(r => 
    r.error?.includes('connection') || r.error?.includes('timeout')
  ).length;

  return {
    success: successCount / results.length > 0.9, // 90% success rate
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    errorRate: (results.length - successCount) / results.length,
    connectionErrors,
  };
}

/**
 * Test cache effectiveness
 */
export async function testCacheEffectiveness(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    iterations: number;
    requestOptions: any;
  }
): Promise<{
  cacheHitRate: number;
  averageResponseTimeFirst: number;
  averageResponseTimeCached: number;
  speedup: number;
}> {
  const { iterations, requestOptions } = options;

  // First request (cache miss)
  const firstRequestStart = Date.now();
  await testApiEndpoint(handler, url, requestOptions);
  const firstRequestTime = Date.now() - firstRequestStart;

  // Subsequent requests (should hit cache)
  const cachedRequestTimes: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await testApiEndpoint(handler, url, requestOptions);
    cachedRequestTimes.push(Date.now() - start);
  }

  const averageResponseTimeFirst = firstRequestTime;
  const averageResponseTimeCached = cachedRequestTimes.length > 0
    ? cachedRequestTimes.reduce((a, b) => a + b, 0) / cachedRequestTimes.length
    : 0;
  const speedup = averageResponseTimeCached > 0
    ? averageResponseTimeFirst / averageResponseTimeCached
    : 0;

  // Estimate cache hit rate (simplified - would need actual cache metrics)
  const cacheHitRate = speedup > 1.5 ? 0.8 : 0.2; // Rough estimate

  return {
    cacheHitRate,
    averageResponseTimeFirst,
    averageResponseTimeCached,
    speedup,
  };
}

/**
 * Test timeout handling
 */
export async function testTimeoutHandling(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    timeout: number;
    requestOptions: any;
  }
): Promise<{
  timedOut: boolean;
  responseTime: number;
  error?: string;
}> {
  const { timeout, requestOptions } = options;

  const start = Date.now();
  try {
    const response = await Promise.race([
      testApiEndpoint(handler, url, requestOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ]) as any;

    return {
      timedOut: false,
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      timedOut: error.message === 'Timeout',
      responseTime: Date.now() - start,
      error: error.message,
    };
  }
}

/**
 * Test gradual degradation under load
 */
export async function testGradualDegradation(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    startConcurrency: number;
    endConcurrency: number;
    step: number;
    requestsPerStep: number;
    requestOptions: any;
  }
): Promise<Array<{
  concurrency: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
}>> {
  const { startConcurrency, endConcurrency, step, requestsPerStep, requestOptions } = options;
  const results: Array<{
    concurrency: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  }> = [];

  for (let concurrency = startConcurrency; concurrency <= endConcurrency; concurrency += step) {
    const batchResults: Array<{ success: boolean; responseTime: number }> = [];

    for (let i = 0; i < requestsPerStep; i++) {
      const batch = Array.from({ length: concurrency }, async () => {
        const start = Date.now();
        try {
          const response = await testApiEndpoint(handler, url, requestOptions);
          return {
            success: response.status >= 200 && response.status < 300,
            responseTime: Date.now() - start,
          };
        } catch (error) {
          return {
            success: false,
            responseTime: Date.now() - start,
          };
        }
      });

      const batchResult = await Promise.all(batch);
      batchResults.push(...batchResult);
    }

    const successCount = batchResults.filter(r => r.success).length;
    const responseTimes = batchResults.map(r => r.responseTime);

    results.push({
      concurrency,
      successRate: successCount / batchResults.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      errorRate: (batchResults.length - successCount) / batchResults.length,
    });
  }

  return results;
}

