import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from './security';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitized?: Record<string, any>;
}

/**
 * Validate request body structure
 */
export function validateRequestBody<T extends Record<string, any>>(
  body: any,
  requiredFields: (keyof T)[],
  fieldValidators?: Partial<Record<keyof T, (value: any) => boolean>>
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check required fields
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push({
        field: String(field),
        message: `${String(field)} is required`,
        code: 'REQUIRED_FIELD_MISSING',
      });
    }
  }

  // Run field validators
  if (fieldValidators) {
    for (const [field, validator] of Object.entries(fieldValidators)) {
      if (body[field] !== undefined && body[field] !== null && validator) {
        if (!validator(body[field])) {
          errors.push({
            field,
            message: `Invalid value for ${field}`,
            code: 'INVALID_FIELD_VALUE',
          });
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize values
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, 10000);
    } else {
      sanitized[key] = value;
    }
  }

  return { valid: true, errors: [], sanitized };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate content type
 */
export function validateContentType(
  request: NextRequest,
  expectedType: string = 'application/json'
): { valid: boolean; error?: NextResponse } {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes(expectedType)) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: `Content-Type must be ${expectedType}` },
        { status: 400 }
      ),
    };
  }
  return { valid: true };
}

/**
 * Parse and validate JSON body
 */
export async function parseJsonBody<T = any>(
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const contentType = validateContentType(request);
    if (!contentType.valid) {
      return { success: false, error: contentType.error! };
    }

    const body = await request.json();
    return { success: true, data: body };
  } catch (error) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page?: number,
  limit?: number,
  maxLimit: number = 100
): { page: number; limit: number; offset: number } {
  const validPage = Math.max(1, Math.floor(page || 1));
  const validLimit = Math.min(maxLimit, Math.max(1, Math.floor(limit || 20)));
  const offset = (validPage - 1) * validLimit;

  return { page: validPage, limit: validLimit, offset };
}

/**
 * Validate and sanitize string input
 */
export function validateString(
  value: any,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  } = {}
): { valid: boolean; error?: string; sanitized?: string } {
  const { minLength = 0, maxLength = 10000, pattern, required = false } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: 'This field is required' };
    }
    return { valid: true, sanitized: '' };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Value must be a string' };
  }

  const sanitized = sanitizeInput(value, maxLength);

  if (sanitized.length < minLength) {
    return {
      valid: false,
      error: `Must be at least ${minLength} characters`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      error: `Must be no more than ${maxLength} characters`,
    };
  }

  if (pattern && !pattern.test(sanitized)) {
    return { valid: false, error: 'Invalid format' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate number input
 */
export function validateNumber(
  value: any,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  } = {}
): { valid: boolean; error?: string; sanitized?: number } {
  const { min, max, integer = false, required = false } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: 'This field is required' };
    }
    return { valid: true };
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: 'Value must be a number' };
  }

  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: 'Value must be an integer' };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `Must be no more than ${max}` };
  }

  return { valid: true, sanitized: num };
}

