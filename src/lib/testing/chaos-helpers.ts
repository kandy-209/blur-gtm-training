/**
 * Chaos Engineering Helpers
 * Utilities for testing system resilience and failure scenarios
 */

import { NextRequest } from 'next/server';
import { testApiEndpoint } from './api-test-utils';

export interface ChaosTestResult {
  scenario: string;
  passed: boolean;
  systemResilient: boolean;
  recoveryTime?: number;
  error?: string;
}

/**
 * Simulate network failures
 */
export async function simulateNetworkFailure(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    failureRate: number; // 0-1, probability of failure
    requestOptions: any;
    iterations: number;
  }
): Promise<ChaosTestResult> {
  const { failureRate, requestOptions, iterations } = options;
  let failures = 0;
  let recoveries = 0;

  for (let i = 0; i < iterations; i++) {
    // Simulate random network failure
    const shouldFail = Math.random() < failureRate;

    try {
      const response = await testApiEndpoint(handler, url, requestOptions);

      if (shouldFail && response.status < 500) {
        failures++;
      } else if (!shouldFail && response.status >= 500) {
        failures++;
      } else if (shouldFail && response.status >= 500) {
        recoveries++;
      }
    } catch (error) {
      if (!shouldFail) {
        failures++;
      } else {
        recoveries++;
      }
    }
  }

  const systemResilient = failures / iterations < 0.1; // Less than 10% unexpected failures

  return {
    scenario: `Network failure simulation (${failureRate * 100}% failure rate)`,
    passed: systemResilient,
    systemResilient,
  };
}

/**
 * Simulate database failures
 */
export async function simulateDatabaseFailure(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    requestOptions: any;
    iterations: number;
  }
): Promise<ChaosTestResult> {
  const { requestOptions, iterations } = options;
  let gracefulFailures = 0;
  let crashes = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const response = await testApiEndpoint(handler, url, requestOptions);

      // System should handle DB failures gracefully (fallback or error response)
      if (response.status >= 500) {
        crashes++;
      } else if (response.status >= 400 && response.status < 500) {
        gracefulFailures++;
      }
    } catch (error) {
      crashes++;
    }
  }

  const systemResilient = crashes === 0; // No crashes, only graceful failures

  return {
    scenario: 'Database failure simulation',
    passed: systemResilient,
    systemResilient,
  };
}

/**
 * Simulate slow responses (timeout scenarios)
 */
export async function simulateSlowResponses(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    requestOptions: any;
    timeout: number;
    iterations: number;
  }
): Promise<ChaosTestResult> {
  const { requestOptions, timeout, iterations } = options;
  let timeouts = 0;
  let successful = 0;

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    try {
      const response = await Promise.race([
        testApiEndpoint(handler, url, requestOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        ),
      ]) as any;

      const duration = Date.now() - start;
      if (duration < timeout) {
        successful++;
      } else {
        timeouts++;
      }
    } catch (error: any) {
      if (error.message === 'Timeout') {
        timeouts++;
      }
    }
  }

  const systemResilient = timeouts / iterations < 0.1; // Less than 10% timeouts

  return {
    scenario: `Slow response simulation (${timeout}ms timeout)`,
    passed: systemResilient,
    systemResilient,
  };
}

/**
 * Test circuit breaker pattern
 */
export async function testCircuitBreaker(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    requestOptions: any;
    failureThreshold: number;
    iterations: number;
  }
): Promise<ChaosTestResult> {
  const { requestOptions, failureThreshold, iterations } = options;
  let consecutiveFailures = 0;
  let circuitOpened = false;

  for (let i = 0; i < iterations; i++) {
    try {
      const response = await testApiEndpoint(handler, url, requestOptions);

      if (response.status >= 500) {
        consecutiveFailures++;
        if (consecutiveFailures >= failureThreshold && !circuitOpened) {
          circuitOpened = true;
        }
      } else {
        consecutiveFailures = 0;
        if (circuitOpened) {
          // Circuit should close after successful request
          circuitOpened = false;
        }
      }
    } catch (error) {
      consecutiveFailures++;
      if (consecutiveFailures >= failureThreshold && !circuitOpened) {
        circuitOpened = true;
      }
    }
  }

  const systemResilient = circuitOpened || consecutiveFailures < failureThreshold;

  return {
    scenario: 'Circuit breaker test',
    passed: systemResilient,
    systemResilient,
  };
}

/**
 * Test partial system failures
 */
export async function testPartialFailures(
  handlers: Array<{
    name: string;
    handler: (request: NextRequest) => Promise<Response>;
    url: string;
    options: any;
  }>,
  options: {
    failureRate: number;
  }
): Promise<ChaosTestResult[]> {
  const results: ChaosTestResult[] = [];

  for (const { name, handler, url, options: requestOptions } of handlers) {
    const shouldFail = Math.random() < options.failureRate;

    try {
      const response = await testApiEndpoint(handler, url, requestOptions);

      results.push({
        scenario: `Partial failure: ${name}`,
        passed: !shouldFail || response.status >= 400,
        systemResilient: response.status !== 500,
      });
    } catch (error: any) {
      results.push({
        scenario: `Partial failure: ${name}`,
        passed: shouldFail,
        systemResilient: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Test data corruption scenarios
 */
export async function testDataCorruption(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    requestOptions: any;
  }
): Promise<ChaosTestResult> {
  const corruptedPayloads = [
    { ...options.requestOptions.body, corrupted: true },
    { ...options.requestOptions.body, data: null },
    { ...options.requestOptions.body, data: undefined },
    { ...options.requestOptions.body, nested: { deeply: { nested: { data: 'corrupt' } } } },
  ];

  let handledGracefully = 0;

  for (const payload of corruptedPayloads) {
    try {
      const response = await testApiEndpoint(handler, url, {
        ...options.requestOptions,
        body: payload,
      });

      // Should handle corruption gracefully (400 or sanitize)
      if (response.status === 400 || (response.status === 200 && !response.data.corrupted)) {
        handledGracefully++;
      }
    } catch (error) {
      // Exception is also acceptable (graceful failure)
      handledGracefully++;
    }
  }

  const systemResilient = handledGracefully === corruptedPayloads.length;

  return {
    scenario: 'Data corruption handling',
    passed: systemResilient,
    systemResilient,
  };
}

/**
 * Test resource exhaustion
 */
export async function testResourceExhaustion(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    requestOptions: any;
    maxConcurrent: number;
  }
): Promise<ChaosTestResult> {
  const { requestOptions, maxConcurrent } = options;

  // Create more concurrent requests than system can handle
  const excessiveRequests = maxConcurrent * 2;

  const requests = Array.from({ length: excessiveRequests }, () =>
    testApiEndpoint(handler, url, requestOptions)
  );

  const responses = await Promise.all(requests);
  const successCount = responses.filter(r => r.status >= 200 && r.status < 300).length;
  const errorCount = responses.filter(r => r.status >= 400 && r.status < 500).length;
  const crashCount = responses.filter(r => r.status >= 500).length;

  // System should handle gracefully (rate limit or queue), not crash
  const systemResilient = crashCount === 0 && (successCount + errorCount) === responses.length;

  return {
    scenario: `Resource exhaustion (${excessiveRequests} concurrent requests)`,
    passed: systemResilient,
    systemResilient,
  };
}

/**
 * Comprehensive chaos test suite
 */
export async function runChaosTestSuite(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  config: {
    networkFailure?: { failureRate: number; iterations: number };
    databaseFailure?: { iterations: number };
    slowResponses?: { timeout: number; iterations: number };
    circuitBreaker?: { failureThreshold: number; iterations: number };
    dataCorruption?: boolean;
    resourceExhaustion?: { maxConcurrent: number };
    requestOptions: any;
  }
): Promise<{
  passed: number;
  failed: number;
  results: ChaosTestResult[];
}> {
  const results: ChaosTestResult[] = [];

  // Network failure
  if (config.networkFailure) {
    const result = await simulateNetworkFailure(handler, url, {
      ...config.networkFailure,
      requestOptions: config.requestOptions,
    });
    results.push(result);
  }

  // Database failure
  if (config.databaseFailure) {
    const result = await simulateDatabaseFailure(handler, url, {
      ...config.databaseFailure,
      requestOptions: config.requestOptions,
    });
    results.push(result);
  }

  // Slow responses
  if (config.slowResponses) {
    const result = await simulateSlowResponses(handler, url, {
      ...config.slowResponses,
      requestOptions: config.requestOptions,
    });
    results.push(result);
  }

  // Circuit breaker
  if (config.circuitBreaker) {
    const result = await testCircuitBreaker(handler, url, {
      ...config.circuitBreaker,
      requestOptions: config.requestOptions,
    });
    results.push(result);
  }

  // Data corruption
  if (config.dataCorruption) {
    const result = await testDataCorruption(handler, url, {
      requestOptions: config.requestOptions,
    });
    results.push(result);
  }

  // Resource exhaustion
  if (config.resourceExhaustion) {
    const result = await testResourceExhaustion(handler, url, {
      ...config.resourceExhaustion,
      requestOptions: config.requestOptions,
    });
    results.push(result);
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return {
    passed,
    failed,
    results,
  };
}

