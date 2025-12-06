import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 } // 10 requests per minute
): { allowed: boolean; remaining: number; resetTime: number } | null {
  // Next.js 15: ip is no longer on request, get from headers
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime };
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [ip, record] of entries) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000); // Clean up every minute

// Input sanitization
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove potentially dangerous characters for JSON injection
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized.trim();
}

// Validate JSON structure
export function validateJSONStructure<T>(
  data: unknown,
  schema: Record<string, (value: unknown) => boolean>
): data is T {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  for (const [key, validator] of Object.entries(schema)) {
    if (!(key in data)) {
      return false;
    }
    if (!validator((data as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

// Validate file type and size
export function validateFile(file: File, options: {
  maxSize: number; // in bytes
  allowedTypes: string[];
}): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (file.size > options.maxSize) {
    return { valid: false, error: `File size exceeds ${options.maxSize / 1024 / 1024}MB limit` };
  }

  if (!options.allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  return { valid: true };
}

// Validate text input
export function validateText(text: string, options: {
  minLength?: number;
  maxLength: number;
  pattern?: RegExp;
}): { valid: boolean; error?: string } {
  if (typeof text !== 'string') {
    return { valid: false, error: 'Text must be a string' };
  }

  if (options.minLength && text.length < options.minLength) {
    return { valid: false, error: `Text must be at least ${options.minLength} characters` };
  }

  if (text.length > options.maxLength) {
    return { valid: false, error: `Text must not exceed ${options.maxLength} characters` };
  }

  if (options.pattern && !options.pattern.test(text)) {
    return { valid: false, error: 'Text does not match required pattern' };
  }

  return { valid: true };
}

// Security headers middleware
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(self), camera=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://va.vercel-scripts.com https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://api.elevenlabs.io https://*.elevenlabs.io https://va.vercel-scripts.com https://api.vapi.ai https://vercel.live",
      "media-src 'self' data: blob: https:",
      "frame-src 'self' https://*.elevenlabs.io",
    ].join('; '),
  };
}

// CORS configuration
export function getCORSHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const isAllowed = allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin));

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Validate API key format (basic check)
export function validateAPIKeyFormat(key: string, type: 'openai' | 'elevenlabs'): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (type === 'openai') {
    // OpenAI keys typically start with sk-
    return key.startsWith('sk-') && key.length > 20;
  }

  if (type === 'elevenlabs') {
    // ElevenLabs keys are typically alphanumeric
    return key.length > 20;
  }

  return false;
}

