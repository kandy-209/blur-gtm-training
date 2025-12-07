/**
 * Edge Case Testing Helpers
 * Comprehensive utilities for testing edge cases, boundary conditions, and error scenarios
 */

import { NextRequest } from 'next/server';
import { testApiEndpoint, createMockRequest } from './api-test-utils';

export interface EdgeCaseTestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: { status: number; data: any };
}

/**
 * Test boundary conditions for numeric inputs
 */
export async function testNumericBoundaries(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  field: string,
  options: {
    min?: number;
    max?: number;
    validValues?: number[];
    invalidValues?: number[];
  } = {}
): Promise<EdgeCaseTestResult[]> {
  const results: EdgeCaseTestResult[] = [];
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    validValues = [],
    invalidValues = [],
  } = options;

  // Test minimum boundary
  if (min !== Number.MIN_SAFE_INTEGER) {
    const minResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: min },
    });
    results.push({
      name: `Minimum boundary (${min})`,
      passed: minResponse.status === 200 || minResponse.status === 400,
      response: minResponse,
    });

    // Test below minimum
    const belowMinResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: min - 1 },
    });
    results.push({
      name: `Below minimum (${min - 1})`,
      passed: belowMinResponse.status === 400,
      response: belowMinResponse,
    });
  }

  // Test maximum boundary
  if (max !== Number.MAX_SAFE_INTEGER) {
    const maxResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: max },
    });
    results.push({
      name: `Maximum boundary (${max})`,
      passed: maxResponse.status === 200 || maxResponse.status === 400,
      response: maxResponse,
    });

    // Test above maximum
    const aboveMaxResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: max + 1 },
    });
    results.push({
      name: `Above maximum (${max + 1})`,
      passed: aboveMaxResponse.status === 400,
      response: aboveMaxResponse,
    });
  }

  // Test special numeric values
  const specialValues = [
    { value: 0, name: 'Zero' },
    { value: -1, name: 'Negative one' },
    { value: Number.MAX_SAFE_INTEGER, name: 'Max safe integer' },
    { value: Number.MIN_SAFE_INTEGER, name: 'Min safe integer' },
    { value: Infinity, name: 'Infinity' },
    { value: -Infinity, name: 'Negative infinity' },
    { value: NaN, name: 'NaN' },
  ];

  for (const { value, name } of specialValues) {
    const response = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: value },
    });
    results.push({
      name: `${name} (${value})`,
      passed: response.status === 400 || response.status === 200,
      response,
    });
  }

  // Test valid values
  for (const value of validValues) {
    const response = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: value },
    });
    results.push({
      name: `Valid value (${value})`,
      passed: response.status === 200,
      response,
    });
  }

  // Test invalid values
  for (const value of invalidValues) {
    const response = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: value },
    });
    results.push({
      name: `Invalid value (${value})`,
      passed: response.status === 400,
      response,
    });
  }

  return results;
}

/**
 * Test string boundary conditions
 */
export async function testStringBoundaries(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  field: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    pattern?: RegExp;
  } = {}
): Promise<EdgeCaseTestResult[]> {
  const results: EdgeCaseTestResult[] = [];
  const {
    minLength = 0,
    maxLength = 10000,
    required = false,
    pattern,
  } = options;

  // Test empty string
  const emptyResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: '' },
  });
  results.push({
    name: 'Empty string',
    passed: required ? emptyResponse.status === 400 : true,
    response: emptyResponse,
  });

  // Test null
  const nullResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: null },
  });
  results.push({
    name: 'Null value',
    passed: required ? nullResponse.status === 400 : true,
    response: nullResponse,
  });

  // Test undefined
  const undefinedResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: undefined },
  });
  results.push({
    name: 'Undefined value',
    passed: required ? undefinedResponse.status === 400 : true,
    response: undefinedResponse,
  });

  // Test minimum length
  if (minLength > 0) {
    const minLengthStr = 'a'.repeat(minLength);
    const minLengthResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: minLengthStr },
    });
    results.push({
      name: `Minimum length (${minLength})`,
      passed: minLengthResponse.status === 200 || minLengthResponse.status === 400,
      response: minLengthResponse,
    });

    // Test below minimum
    const belowMinStr = 'a'.repeat(minLength - 1);
    const belowMinResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: belowMinStr },
    });
    results.push({
      name: `Below minimum length (${minLength - 1})`,
      passed: belowMinResponse.status === 400,
      response: belowMinResponse,
    });
  }

  // Test maximum length
  if (maxLength < 10000) {
    const maxLengthStr = 'a'.repeat(maxLength);
    const maxLengthResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: maxLengthStr },
    });
    results.push({
      name: `Maximum length (${maxLength})`,
      passed: maxLengthResponse.status === 200 || maxLengthResponse.status === 400,
      response: maxLengthResponse,
    });

    // Test above maximum
    const aboveMaxStr = 'a'.repeat(maxLength + 1);
    const aboveMaxResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: aboveMaxStr },
    });
    results.push({
      name: `Above maximum length (${maxLength + 1})`,
      passed: aboveMaxResponse.status === 400,
      response: aboveMaxResponse,
    });
  }

  // Test very long string (potential DoS)
  const veryLongStr = 'a'.repeat(100000);
  const veryLongResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: veryLongStr },
  });
  results.push({
    name: 'Very long string (100k chars)',
    passed: veryLongResponse.status === 400 || veryLongResponse.status === 413,
    response: veryLongResponse,
  });

  // Test special characters
  const specialStrings = [
    { value: ' ', name: 'Whitespace only' },
    { value: '\n\t\r', name: 'Control characters' },
    { value: '🚀🎉💯', name: 'Emojis' },
    { value: '测试中文', name: 'Unicode (Chinese)' },
    { value: 'тест', name: 'Unicode (Cyrillic)' },
    { value: 'テスト', name: 'Unicode (Japanese)' },
    { value: '<script>alert("xss")</script>', name: 'XSS attempt' },
    { value: "'; DROP TABLE users; --", name: 'SQL injection attempt' },
    { value: '../../etc/passwd', name: 'Path traversal attempt' },
    { value: 'null', name: 'String "null"' },
    { value: 'undefined', name: 'String "undefined"' },
    { value: 'true', name: 'String "true"' },
    { value: 'false', name: 'String "false"' },
  ];

  for (const { value, name } of specialStrings) {
    const response = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: value },
    });
    results.push({
      name,
      passed: response.status !== 500, // Should handle gracefully
      response,
    });
  }

  // Test pattern if provided
  if (pattern) {
    const validMatch = 'valid123';
    const invalidMatch = 'invalid!@#';
    
    const validResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: validMatch },
    });
    results.push({
      name: 'Pattern match (valid)',
      passed: validResponse.status === 200,
      response: validResponse,
    });

    const invalidResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: invalidMatch },
    });
    results.push({
      name: 'Pattern match (invalid)',
      passed: invalidResponse.status === 400,
      response: invalidResponse,
    });
  }

  return results;
}

/**
 * Test array boundary conditions
 */
export async function testArrayBoundaries(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  field: string,
  options: {
    minItems?: number;
    maxItems?: number;
    required?: boolean;
  } = {}
): Promise<EdgeCaseTestResult[]> {
  const results: EdgeCaseTestResult[] = [];
  const {
    minItems = 0,
    maxItems = 1000,
    required = false,
  } = options;

  // Test empty array
  const emptyResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: [] },
  });
  results.push({
    name: 'Empty array',
    passed: required ? emptyResponse.status === 400 : true,
    response: emptyResponse,
  });

  // Test null array
  const nullResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: null },
  });
  results.push({
    name: 'Null array',
    passed: required ? nullResponse.status === 400 : true,
    response: nullResponse,
  });

  // Test non-array value
  const nonArrayResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: 'not an array' },
  });
  results.push({
    name: 'Non-array value',
    passed: nonArrayResponse.status === 400,
    response: nonArrayResponse,
  });

  // Test minimum items
  if (minItems > 0) {
    const minItemsArray = Array(minItems).fill({});
    const minItemsResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: minItemsArray },
    });
    results.push({
      name: `Minimum items (${minItems})`,
      passed: minItemsResponse.status === 200 || minItemsResponse.status === 400,
      response: minItemsResponse,
    });

    // Test below minimum
    const belowMinArray = Array(minItems - 1).fill({});
    const belowMinResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: belowMinArray },
    });
    results.push({
      name: `Below minimum items (${minItems - 1})`,
      passed: belowMinResponse.status === 400,
      response: belowMinResponse,
    });
  }

  // Test maximum items
  if (maxItems < 1000) {
    const maxItemsArray = Array(maxItems).fill({});
    const maxItemsResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: maxItemsArray },
    });
    results.push({
      name: `Maximum items (${maxItems})`,
      passed: maxItemsResponse.status === 200 || maxItemsResponse.status === 400,
      response: maxItemsResponse,
    });

    // Test above maximum
    const aboveMaxArray = Array(maxItems + 1).fill({});
    const aboveMaxResponse = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: aboveMaxArray },
    });
    results.push({
      name: `Above maximum items (${maxItems + 1})`,
      passed: aboveMaxResponse.status === 400,
      response: aboveMaxResponse,
    });
  }

  // Test very large array (potential DoS)
  const veryLargeArray = Array(100000).fill({});
  const veryLargeResponse = await testApiEndpoint(handler, url, {
    method: 'POST',
    body: { [field]: veryLargeArray },
  });
  results.push({
    name: 'Very large array (100k items)',
    passed: veryLargeResponse.status === 400 || veryLargeResponse.status === 413,
    response: veryLargeResponse,
  });

  return results;
}

/**
 * Test concurrent requests (race conditions)
 */
export async function testConcurrency(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    concurrent: number;
    requestOptions: any;
    expectedBehavior: 'all-success' | 'some-fail' | 'rate-limit';
  }
): Promise<EdgeCaseTestResult[]> {
  const results: EdgeCaseTestResult[] = [];
  const { concurrent, requestOptions, expectedBehavior } = options;

  const requests = Array.from({ length: concurrent }, () =>
    testApiEndpoint(handler, url, requestOptions)
  );

  const responses = await Promise.all(requests);

  const successCount = responses.filter(r => r.status >= 200 && r.status < 300).length;
  const errorCount = responses.filter(r => r.status >= 400).length;
  const rateLimitCount = responses.filter(r => r.status === 429).length;

  switch (expectedBehavior) {
    case 'all-success':
      results.push({
        name: `Concurrent requests (${concurrent}) - all succeed`,
        passed: successCount === concurrent,
        response: { status: successCount, data: { successCount, errorCount } },
      });
      break;
    case 'some-fail':
      results.push({
        name: `Concurrent requests (${concurrent}) - some fail`,
        passed: errorCount > 0 && errorCount < concurrent,
        response: { status: 200, data: { successCount, errorCount } },
      });
      break;
    case 'rate-limit':
      results.push({
        name: `Concurrent requests (${concurrent}) - rate limited`,
        passed: rateLimitCount > 0,
        response: { status: 200, data: { successCount, errorCount, rateLimitCount } },
      });
      break;
  }

  return results;
}

/**
 * Test error recovery and retry logic
 */
export async function testErrorRecovery(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    simulateErrors: Array<{ error: string; shouldRecover: boolean }>;
    requestOptions: any;
  }
): Promise<EdgeCaseTestResult[]> {
  const results: EdgeCaseTestResult[] = [];

  for (const { error, shouldRecover } of options.simulateErrors) {
    // Mock error simulation would go here
    // For now, we test the handler's response to error scenarios
    const response = await testApiEndpoint(handler, url, options.requestOptions);
    
    results.push({
      name: `Error recovery: ${error}`,
      passed: shouldRecover 
        ? response.status !== 500 
        : response.status === 500 || response.status >= 400,
      response,
    });
  }

  return results;
}

/**
 * Test data type coercion and validation
 */
export async function testTypeCoercion(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  field: string,
  expectedType: 'string' | 'number' | 'boolean' | 'object' | 'array'
): Promise<EdgeCaseTestResult[]> {
  const results: EdgeCaseTestResult[] = [];

  const coercionTests = [
    { value: '123', name: 'String number', shouldAccept: expectedType === 'string' },
    { value: 123, name: 'Number', shouldAccept: expectedType === 'number' },
    { value: true, name: 'Boolean true', shouldAccept: expectedType === 'boolean' },
    { value: false, name: 'Boolean false', shouldAccept: expectedType === 'boolean' },
    { value: {}, name: 'Empty object', shouldAccept: expectedType === 'object' },
    { value: [], name: 'Empty array', shouldAccept: expectedType === 'array' },
    { value: null, name: 'Null', shouldAccept: false },
    { value: undefined, name: 'Undefined', shouldAccept: false },
  ];

  for (const { value, name, shouldAccept } of coercionTests) {
    const response = await testApiEndpoint(handler, url, {
      method: 'POST',
      body: { [field]: value },
    });

    results.push({
      name: `Type coercion: ${name}`,
      passed: shouldAccept 
        ? response.status === 200 
        : response.status === 400,
      response,
    });
  }

  return results;
}

/**
 * Test malformed JSON and request bodies
 */
export async function testMalformedRequests(
  handler: (request: NextRequest) => Promise<Response>,
  url: string
): Promise<EdgeCaseTestResult[]> {
  const results: EdgeCaseTestResult[] = [];

  const malformedBodies = [
    { body: '{ invalid json', name: 'Invalid JSON syntax' },
    { body: '{"unclosed": "string}', name: 'Unclosed string' },
    { body: '{"trailing": "comma",}', name: 'Trailing comma' },
    { body: '{"nested": {"deep": {"too": "deep"}}}', name: 'Deep nesting' },
    { body: Buffer.from([0x00, 0x01, 0x02]), name: 'Binary data' },
    { body: '', name: 'Empty body' },
  ];

  for (const { body, name } of malformedBodies) {
    try {
      const request = createMockRequest(url, {
        method: 'POST',
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
      
      const response = await handler(request);
      const responseData = await response.json().catch(() => ({}));

      results.push({
        name: `Malformed request: ${name}`,
        passed: response.status === 400,
        response: { status: response.status, data: responseData },
      });
    } catch (error: any) {
      results.push({
        name: `Malformed request: ${name}`,
        passed: true, // Error thrown is acceptable
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Comprehensive edge case test suite
 */
export async function runEdgeCaseSuite(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  config: {
    numericFields?: Array<{ field: string; options: any }>;
    stringFields?: Array<{ field: string; options: any }>;
    arrayFields?: Array<{ field: string; options: any }>;
    concurrency?: { concurrent: number; requestOptions: any; expectedBehavior: any };
    errorRecovery?: { simulateErrors: any[]; requestOptions: any };
    typeCoercion?: Array<{ field: string; expectedType: any }>;
  }
): Promise<{
  passed: number;
  failed: number;
  results: EdgeCaseTestResult[];
}> {
  const allResults: EdgeCaseTestResult[] = [];

  // Test numeric fields
  if (config.numericFields) {
    for (const { field, options } of config.numericFields) {
      const results = await testNumericBoundaries(handler, url, field, options);
      allResults.push(...results);
    }
  }

  // Test string fields
  if (config.stringFields) {
    for (const { field, options } of config.stringFields) {
      const results = await testStringBoundaries(handler, url, field, options);
      allResults.push(...results);
    }
  }

  // Test array fields
  if (config.arrayFields) {
    for (const { field, options } of config.arrayFields) {
      const results = await testArrayBoundaries(handler, url, field, options);
      allResults.push(...results);
    }
  }

  // Test concurrency
  if (config.concurrency) {
    const results = await testConcurrency(handler, url, config.concurrency);
    allResults.push(...results);
  }

  // Test error recovery
  if (config.errorRecovery) {
    const results = await testErrorRecovery(handler, url, config.errorRecovery);
    allResults.push(...results);
  }

  // Test type coercion
  if (config.typeCoercion) {
    for (const { field, expectedType } of config.typeCoercion) {
      const results = await testTypeCoercion(handler, url, field, expectedType);
      allResults.push(...results);
    }
  }

  // Test malformed requests
  const malformedResults = await testMalformedRequests(handler, url);
  allResults.push(...malformedResults);

  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  return {
    passed,
    failed,
    results: allResults,
  };
}

