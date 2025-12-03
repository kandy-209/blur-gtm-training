/**
 * Centralized Error Handling
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server';
import { log } from './logger';
import { recordError } from './metrics';
import { DomainError, EntityNotFoundError, InvalidValueError, BusinessRuleViolationError } from '@/domain/shared/domain-error';

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

/**
 * Error types for categorization
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly type: ErrorType,
    public readonly statusCode: number = 500,
    public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public readonly code?: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  // Domain errors
  if (error instanceof DomainError) {
    return handleDomainError(error, requestId);
  }
  
  // Application errors
  if (error instanceof AppError) {
    return handleAppError(error, requestId);
  }
  
  // Validation errors (Zod, etc.)
  if (error && typeof error === 'object' && 'issues' in error) {
    return handleValidationError(error as { issues: Array<{ path: string[]; message: string }> }, requestId);
  }
  
  // HTTP errors
  if (error && typeof error === 'object' && 'status' in error && 'statusText' in error) {
    return handleHttpError(error as { status: number; statusText: string }, requestId);
  }
  
  // Unknown errors
  return handleUnknownError(error, requestId);
}

function handleDomainError(error: DomainError, requestId?: string): NextResponse<ErrorResponse> {
  let statusCode = 500;
  let type = ErrorType.INTERNAL;
  let severity = ErrorSeverity.MEDIUM;
  
  if (error instanceof EntityNotFoundError) {
    statusCode = 404;
    type = ErrorType.NOT_FOUND;
    severity = ErrorSeverity.LOW;
  } else if (error instanceof InvalidValueError) {
    statusCode = 400;
    type = ErrorType.VALIDATION;
    severity = ErrorSeverity.LOW;
  } else if (error instanceof BusinessRuleViolationError) {
    statusCode = 422;
    type = ErrorType.VALIDATION;
    severity = ErrorSeverity.MEDIUM;
  }
  
  log.error(`Domain error: ${error.message}`, error, { code: error.code, requestId });
  recordError(type, severity);
  
  return NextResponse.json(
    {
      error: error.name,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status: statusCode }
  );
}

function handleAppError(error: AppError, requestId?: string): NextResponse<ErrorResponse> {
  log.error(`Application error: ${error.message}`, error, {
    type: error.type,
    code: error.code,
    details: error.details,
    requestId,
  });
  
  recordError(error.type, error.severity);
  
  return NextResponse.json(
    {
      error: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status: error.statusCode }
  );
}

function handleValidationError(
  error: { issues: Array<{ path: string[]; message: string }> },
  requestId?: string
): NextResponse<ErrorResponse> {
  const details = error.issues.reduce((acc, issue) => {
    const path = issue.path.join('.');
    acc[path] = issue.message;
    return acc;
  }, {} as Record<string, string>);
  
  log.warn('Validation error', { details, requestId });
  recordError(ErrorType.VALIDATION, ErrorSeverity.LOW);
  
  return NextResponse.json(
    {
      error: 'Validation Error',
      message: 'Invalid input data',
      code: ErrorType.VALIDATION,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status: 400 }
  );
}

function handleHttpError(error: { status: number; statusText: string }, requestId?: string): NextResponse<ErrorResponse> {
  const statusCode = error.status || 500;
  const type = statusCode >= 500 ? ErrorType.EXTERNAL_API : ErrorType.VALIDATION;
  const severity = statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
  
  log.error(`HTTP error: ${error.statusText}`, new Error(error.statusText), { status: statusCode, requestId });
  recordError(type, severity);
  
  return NextResponse.json(
    {
      error: 'External API Error',
      message: error.statusText || 'External service error',
      code: type,
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status: statusCode }
  );
}

function handleUnknownError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  log.error('Unknown error', error instanceof Error ? error : new Error(String(error)), {
    requestId,
    stack: errorStack,
  });
  
  recordError(ErrorType.INTERNAL, ErrorSeverity.CRITICAL);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal error occurred'
    : errorMessage;
  
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message,
      code: ErrorType.INTERNAL,
      timestamp: new Date().toISOString(),
      requestId,
      ...(process.env.NODE_ENV !== 'production' && { details: { stack: errorStack } }),
    },
    { status: 500 }
  );
}

/**
 * Generate request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Error handler wrapper for API routes
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = generateRequestId();
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error, requestId);
    }
  }) as T;
}

