/**
 * Standardized API Response Utilities
 * Provides consistent response formats across all API endpoints
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  options: {
    status?: number;
    message?: string;
    requestId?: string;
    headers?: Record<string, string>;
  } = {}
): NextResponse<ApiResponse<T>> {
  const { status = 200, message, requestId, headers = {} } = options;

  const response = NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
    { status }
  );

  // Add custom headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string | Error,
  options: {
    status?: number;
    message?: string;
    requestId?: string;
    details?: Record<string, any>;
  } = {}
): NextResponse<ApiResponse> {
  const { status = 500, message, requestId, details } = options;
  const errorMessage = error instanceof Error ? error.message : error;

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      ...(message && { message }),
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
    { status }
  );
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  options: {
    total: number;
    page: number;
    limit: number;
    status?: number;
    requestId?: string;
  }
): NextResponse<PaginatedResponse<T>> {
  const { total, page, limit, status = 200, requestId } = options;
  const hasMore = page * limit < total;

  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        hasMore,
      },
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
    { status }
  );
}

/**
 * Add standard cache headers to response
 */
export function withCacheHeaders(
  response: NextResponse,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    public?: boolean;
  } = {}
): NextResponse {
  const {
    maxAge = 30,
    staleWhileRevalidate = 60,
    public: isPublic = false,
  } = options;

  const cacheControl = `${isPublic ? 'public' : 'private'}, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
  response.headers.set('Cache-Control', cacheControl);
  response.headers.set('ETag', `"${Date.now()}"`);

  return response;
}

