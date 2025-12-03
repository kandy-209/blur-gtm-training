import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  rateLimit, 
  getSecurityHeaders, 
  getCORSHeaders,
  validateRequest,
  auditLog,
  SecurityEvent,
} from '@/lib/enterprise-security';

// Enterprise security middleware
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';

  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply enterprise security headers
  const securityHeaders = getSecurityHeaders(request);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CORS headers
  const corsHeaders = getCORSHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 204,
      headers: {
        ...securityHeaders,
        ...corsHeaders,
      },
    });
  }

  // API route security
  if (path.startsWith('/api/')) {
    // Validate request structure
    const validationResult = await validateRequest(request);
    if (!validationResult.valid) {
      auditLog({
        event: 'security_validation_failed',
        path,
        method,
        ip,
        userAgent,
        reason: validationResult.reason,
        severity: 'medium',
      });
      
      return NextResponse.json(
        { error: validationResult.reason || 'Invalid request' },
        { 
          status: 400,
          headers: securityHeaders,
        }
      );
    }

    // Enhanced rate limiting per endpoint
    const rateLimitConfig = getRateLimitConfig(path);
    const rateLimitResult = rateLimit(request, {
      identifier: `${ip}:${path}`,
      ...rateLimitConfig,
    });

    if (!rateLimitResult.allowed) {
      auditLog({
        event: 'rate_limit_exceeded',
        path,
        method,
        ip,
        userAgent,
        severity: 'high',
      });

      response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));
      response.headers.set('Retry-After', String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)));

      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            ...securityHeaders,
            'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));

    // Check for suspicious patterns
    const suspiciousPatterns = detectSuspiciousActivity(request, ip);
    if (suspiciousPatterns.length > 0) {
      auditLog({
        event: 'suspicious_activity_detected',
        path,
        method,
        ip,
        userAgent,
        patterns: suspiciousPatterns,
        severity: 'high',
      });

      // Block if multiple suspicious patterns
      if (suspiciousPatterns.length >= 3) {
        return NextResponse.json(
          { error: 'Request blocked for security reasons' },
          { 
            status: 403,
            headers: securityHeaders,
          }
        );
      }
    }
  }

  // Log successful requests for audit trail
  const duration = Date.now() - startTime;
  if (path.startsWith('/api/')) {
    auditLog({
      event: 'api_request',
      path,
      method,
      ip,
      userAgent,
      duration,
      status: 200,
      severity: 'low',
    });
  }

  return response;
}

// Get rate limit configuration per endpoint
function getRateLimitConfig(path: string): { maxRequests: number; windowMs: number } {
  // Stricter limits for sensitive endpoints
  if (path.includes('/auth/')) {
    return { maxRequests: 5, windowMs: 60000 }; // 5 per minute
  }
  
  if (path.includes('/admin/')) {
    return { maxRequests: 10, windowMs: 60000 }; // 10 per minute
  }
  
  if (path.includes('/roleplay') || path.includes('/chat')) {
    return { maxRequests: 30, windowMs: 60000 }; // 30 per minute
  }
  
  // Default for other API routes
  return { maxRequests: 20, windowMs: 60000 }; // 20 per minute
}

// Detect suspicious activity patterns
function detectSuspiciousActivity(request: NextRequest, ip: string): string[] {
  const patterns: string[] = [];
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /('|(\\')|(;)|(\\;)|(--)|(\\--)|(\/\*)|(\\\/\*)|(\*\/)|(\\\*\/))/,
  ];
  
  // XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
  ];

  // Path traversal
  if (path.includes('..') || path.includes('//')) {
    patterns.push('path_traversal');
  }

  // Check query parameters
  const queryString = request.nextUrl.search;
  if (queryString) {
    for (const pattern of [...sqlPatterns, ...xssPatterns]) {
      if (pattern.test(queryString)) {
        patterns.push('malicious_query');
        break;
      }
    }
  }

  // Suspicious user agents
  if (!userAgent || userAgent.length < 10) {
    patterns.push('suspicious_user_agent');
  }

  // Rapid requests (handled by rate limiting, but log pattern)
  // This would be tracked in a separate store

  return patterns;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};



