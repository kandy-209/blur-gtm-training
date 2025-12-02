import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSecurityHeaders, getCORSHeaders, rateLimit } from '@/lib/security';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add Vercel protection bypass if configured
  const bypassToken = process.env.VERCEL_PROTECTION_BYPASS;
  if (bypassToken) {
    // Add bypass token to response headers for client-side requests
    response.headers.set('x-vercel-protection-bypass', bypassToken);
  }

  // Add security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCORSHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // Rate limiting for API routes
    const rateLimitResult = rateLimit(request, {
      maxRequests: 20, // More lenient for API routes
      windowMs: 60000, // 1 minute
    });

    if (rateLimitResult && !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            ...response.headers,
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          },
        }
      );
    }

    // Add rate limit headers
    if (rateLimitResult) {
      response.headers.set('X-RateLimit-Limit', '20');
      response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
      response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)',
  ],
};

