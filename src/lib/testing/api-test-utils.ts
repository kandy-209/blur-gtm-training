/**
 * API Testing Utilities
 * Comprehensive helpers for testing API routes
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export interface ApiTestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  userId?: string;
  ip?: string;
}

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options: ApiTestOptions = {}
): NextRequest {
  const {
    method = 'GET',
    headers = {},
    body,
    query = {},
  } = options;

  const urlWithQuery = new URL(url, 'http://localhost:3000');
  Object.entries(query).forEach(([key, value]) => {
    urlWithQuery.searchParams.set(key, value);
  });

  const requestInit: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(urlWithQuery.toString(), requestInit);
}

/**
 * Test API endpoint with automatic error handling
 */
export async function testApiEndpoint(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: ApiTestOptions = {}
): Promise<{
  status: number;
  data: any;
  headers: Headers;
  error?: string;
}> {
  try {
    const request = createMockRequest(url, options);
    const response = await handler(request);
    const data = await response.json().catch(() => ({}));

    return {
      status: response.status,
      data,
      headers: response.headers,
    };
  } catch (error: any) {
    return {
      status: 500,
      data: {},
      headers: new Headers(),
      error: error.message,
    };
  }
}

/**
 * Assert API response structure
 */
export function assertApiResponse(
  response: { status: number; data: any },
  expectedStatus: number,
  schema?: (data: any) => boolean
): void {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.data)}`
    );
  }

  if (schema && !schema(response.data)) {
    throw new Error(
      `Response data does not match schema. Data: ${JSON.stringify(response.data)}`
    );
  }
}

/**
 * Test rate limiting
 */
export async function testRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  maxRequests: number,
  options: ApiTestOptions = {}
): Promise<boolean> {
  const requests = Array.from({ length: maxRequests + 1 }, () =>
    testApiEndpoint(handler, url, options)
  );

  const responses = await Promise.all(requests);
  const lastResponse = responses[responses.length - 1];

  return lastResponse.status === 429;
}

/**
 * Test authentication/authorization
 */
export async function testAuth(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: ApiTestOptions = {}
): Promise<{ requiresAuth: boolean; status: number }> {
  // Test without auth
  const noAuthResponse = await testApiEndpoint(handler, url, options);
  
  // Test with auth
  const authResponse = await testApiEndpoint(handler, url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: 'Bearer test-token',
    },
  });

  return {
    requiresAuth: noAuthResponse.status === 401 || noAuthResponse.status === 403,
    status: authResponse.status,
  };
}

/**
 * Test validation errors
 */
export async function testValidation(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  invalidBodies: any[],
  options: ApiTestOptions = {}
): Promise<{ allValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const body of invalidBodies) {
    const response = await testApiEndpoint(handler, url, {
      ...options,
      method: 'POST',
      body,
    });

    if (response.status !== 400) {
      errors.push(
        `Expected 400 for invalid body, got ${response.status}: ${JSON.stringify(body)}`
      );
    }
  }

  return {
    allValid: errors.length === 0,
    errors,
  };
}

/**
 * Performance test helper
 */
export async function testPerformance(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: ApiTestOptions = {},
  iterations: number = 10
): Promise<{
  averageTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
}> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await testApiEndpoint(handler, url, options);
    times.push(Date.now() - start);
  }

  times.sort((a, b) => a - b);

  return {
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: times[0],
    maxTime: times[times.length - 1],
    p95Time: times[Math.floor(times.length * 0.95)],
  };
}

/**
 * Database test helper - clean up test data
 */
export async function cleanupTestData(table: string, testId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase
      .from(table)
      .delete()
      .like('id', `%${testId}%`);
  } catch (error) {
    console.warn(`Failed to cleanup test data from ${table}:`, error);
  }
}

/**
 * Create test user in database
 */
export async function createTestUser(
  overrides: Record<string, any> = {}
): Promise<{ id: string; email: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const testId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const testUser = {
    id: testId,
    email: `test_${testId}@example.com`,
    ...overrides,
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .insert(testUser)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  return data;
}

