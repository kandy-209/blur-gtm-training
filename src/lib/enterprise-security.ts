/**
 * Enterprise-Level Security Utilities
 * 
 * Comprehensive security functions for production applications
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';

// ============================================================================
// Rate Limiting (Enhanced with Redis-ready structure)
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstRequest: number;
  blocked: boolean;
  blockUntil?: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string; // For per-user or per-endpoint limiting
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  
  // Use identifier if provided, otherwise use IP
  const identifier = config.identifier || ip;
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Check if blocked
  if (record?.blocked && record.blockUntil && now < record.blockUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockUntil,
      retryAfter: Math.ceil((record.blockUntil - now) / 1000),
    };
  }

  // Reset if window expired or new record
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
      firstRequest: now,
      blocked: false,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    // Block for extended period if repeatedly hitting limits
    const blockDuration = record.count >= config.maxRequests * 2 
      ? config.windowMs * 10 // 10x window if 2x over limit
      : config.windowMs * 2; // 2x window if just over limit

    record.blocked = true;
    record.blockUntil = now + blockDuration;

    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil(blockDuration / 1000),
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// Cleanup old records
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, record] of entries) {
    if (now > record.resetTime && (!record.blockUntil || now > record.blockUntil)) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Every minute

// ============================================================================
// Request Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  sanitized?: any;
}

export async function validateRequest(request: NextRequest): Promise<ValidationResult> {
  // Check content type for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        valid: false,
        reason: 'Content-Type must be application/json',
      };
    }
  }

  // Check content length
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > 10 * 1024 * 1024) { // 10MB max
      return {
        valid: false,
        reason: 'Request body too large',
      };
    }
  }

  // Validate request body if present
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.clone().json().catch(() => null);
      if (body) {
        const sanitized = sanitizeObject(body);
        return {
          valid: true,
          sanitized,
        };
      }
    } catch (error) {
      return {
        valid: false,
        reason: 'Invalid JSON in request body',
      };
    }
  }

  return { valid: true };
}

// ============================================================================
// Input Sanitization (Enhanced)
// ============================================================================

export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove potential script tags (basic XSS prevention)
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitized.trim();
}

export function sanitizeObject(obj: any, maxDepth: number = 10, currentDepth: number = 0): any {
  if (currentDepth > maxDepth) {
    return null; // Prevent deep nesting attacks
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize keys too
      const sanitizedKey = sanitizeInput(key, 100);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeObject(value, maxDepth, currentDepth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}

// ============================================================================
// Security Headers (Enterprise-Grade)
// ============================================================================

export function getSecurityHeaders(request: NextRequest): Record<string, string> {
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Store nonce in request for CSP
  (request as any).nonce = nonce;

  // Strict Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "' 'strict-dynamic' https://unpkg.com https://cdn.elevenlabs.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.openai.com https://api.elevenlabs.io https://*.elevenlabs.io https://*.supabase.co",
    "media-src 'self' data: blob: https:",
    "frame-src 'self' https://*.elevenlabs.io https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(self), camera=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=()',
    'Content-Security-Policy': csp,
    'X-DNS-Prefetch-Control': 'on',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Origin-Agent-Cluster': '?1',
  };
}

// ============================================================================
// CORS Configuration
// ============================================================================

export function getCORSHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  const isAllowed = allowedOrigins.length === 0 
    || allowedOrigins.includes('*') 
    || (origin && allowedOrigins.includes(origin));

  if (!isAllowed && origin) {
    return {}; // No CORS headers if origin not allowed
  }

  return {
    'Access-Control-Allow-Origin': origin && isAllowed ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

// ============================================================================
// CSRF Protection
// ============================================================================

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(request: NextRequest, token: string): boolean {
  const headerToken = request.headers.get('X-CSRF-Token');
  const cookieToken = request.cookies.get('csrf-token')?.value;

  // Compare tokens using constant-time comparison
  return constantTimeCompare(token, headerToken || '') 
    || constantTimeCompare(token, cookieToken || '');
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ============================================================================
// Audit Logging
// ============================================================================

export interface SecurityEvent {
  event: string;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  timestamp?: Date;
  duration?: number;
  status?: number;
  reason?: string;
  patterns?: string[];
}

export function auditLog(event: SecurityEvent): void {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Use structured logger if available
  try {
    const { log } = require('./logger');
    log.security(event.event, {
      path: event.path,
      method: event.method,
      ip: event.ip,
      userAgent: event.userAgent,
      severity: event.severity,
      ...(event.duration && { duration: event.duration }),
      ...(event.reason && { reason: event.reason }),
      ...(event.patterns && { patterns: event.patterns }),
    });
  } catch {
    // Fallback to console if logger not available
    if (process.env.NODE_ENV === 'production') {
      console.log('[SECURITY_AUDIT]', JSON.stringify(logEntry));
    } else {
      console.log('[SECURITY_AUDIT]', logEntry);
    }
  }

  // Store in database for compliance (if needed)
  // await storeAuditLog(logEntry);
}

// ============================================================================
// Password Security
// ============================================================================

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words');
  }

  // Calculate strength
  if (errors.length === 0 && password.length >= 16) {
    strength = 'strong';
  } else if (errors.length <= 1) {
    strength = 'medium';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

// ============================================================================
// API Key Validation
// ============================================================================

export function validateAPIKeyFormat(key: string, type: 'openai' | 'elevenlabs' | 'supabase'): boolean {
  if (!key || typeof key !== 'string' || key.length < 20) {
    return false;
  }

  if (type === 'openai') {
    return key.startsWith('sk-') && key.length >= 20;
  }

  if (type === 'elevenlabs') {
    return /^[a-zA-Z0-9]{20,}$/.test(key);
  }

  if (type === 'supabase') {
    return key.length >= 20;
  }

  return false;
}

// ============================================================================
// Session Security
// ============================================================================

export function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

// ============================================================================
// Data Encryption Helpers
// ============================================================================

export function encryptSensitiveData(data: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptSensitiveData(encryptedData: string, key: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}



