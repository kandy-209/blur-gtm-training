import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailHunter, findEmailHunter, searchEmailsByDomain } from '@/lib/sales-enhancements/email-verification';
import { sanitizeInput, validateText, rateLimit } from '@/lib/security';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const NAME_PATTERN = /^[a-zA-Z\s\-'.,]+$/;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for email operations
    const rateLimitResult = rateLimit(request, { maxRequests: 10, windowMs: 60000 });
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult?.resetTime?.toString() || Date.now().toString(),
          }
        }
      );
    }

    // Validate content type
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['verify', 'find', 'search'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: verify, find, search' },
        { status: 400 }
      );
    }

    if (action === 'verify') {
      const email = body.email ? sanitizeInput(String(body.email), 254) : '';
      
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required for verify action' },
          { status: 400 }
        );
      }

      const emailValidation = validateText(email, {
        minLength: 5,
        maxLength: 254,
        pattern: EMAIL_PATTERN,
      });

      if (!emailValidation.valid) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      const result = await verifyEmailHunter(email);
      return NextResponse.json(result, {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult!.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult!.resetTime.toString(),
        }
      });
    }

    if (action === 'find') {
      const firstName = body.firstName ? sanitizeInput(String(body.firstName), 100) : '';
      const lastName = body.lastName ? sanitizeInput(String(body.lastName), 100) : '';
      const domain = body.domain ? sanitizeInput(String(body.domain), 253) : '';

      if (!firstName || !lastName || !domain) {
        return NextResponse.json(
          { error: 'firstName, lastName, and domain are required for find action' },
          { status: 400 }
        );
      }

      // Validate inputs
      if (!NAME_PATTERN.test(firstName) || !NAME_PATTERN.test(lastName)) {
        return NextResponse.json(
          { error: 'Invalid name format' },
          { status: 400 }
        );
      }

      if (!DOMAIN_PATTERN.test(domain)) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        );
      }

      const result = await findEmailHunter(firstName, lastName, domain);
      return NextResponse.json(result, {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult!.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult!.resetTime.toString(),
        }
      });
    }

    if (action === 'search') {
      const domain = body.domain ? sanitizeInput(String(body.domain), 253) : '';
      const seniority = body.seniority ? sanitizeInput(String(body.seniority), 50) : undefined;
      const department = body.department ? sanitizeInput(String(body.department), 100) : undefined;

      if (!domain) {
        return NextResponse.json(
          { error: 'Domain is required for search action' },
          { status: 400 }
        );
      }

      if (!DOMAIN_PATTERN.test(domain)) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        );
      }

      const results = await searchEmailsByDomain(domain, seniority, department);
      return NextResponse.json({ results }, {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult!.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult!.resetTime.toString(),
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify/find email. Please try again.' },
      { status: 500 }
    );
  }
}

