import { NextRequest, NextResponse } from 'next/server';
import { generateEmailTemplate } from '@/lib/sales-enhancements/email-templates';
import { sanitizeInput, validateText, rateLimit } from '@/lib/security';

const VALID_EMAIL_TYPES = ['cold-outreach', 'follow-up', 'demo-invite', 'objection-response'] as const;
const VALID_TONES = ['professional', 'friendly', 'urgent', 'consultative'] as const;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, { maxRequests: 30, windowMs: 60000 });
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
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

    // Validate required fields
    if (!body.companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const companyName = sanitizeInput(String(body.companyName), 200);
    const prospectName = body.prospectName ? sanitizeInput(String(body.prospectName), 100) : undefined;
    const companyDomain = body.companyDomain ? sanitizeInput(String(body.companyDomain), 253) : undefined;
    const role = body.role ? sanitizeInput(String(body.role), 200) : undefined;
    const industry = body.industry ? sanitizeInput(String(body.industry), 100) : undefined;
    const context = body.context ? sanitizeInput(String(body.context), 1000) : undefined;

    // Validate company name
    const nameValidation = validateText(companyName, {
      minLength: 1,
      maxLength: 200,
    });

    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid company name' },
        { status: 400 }
      );
    }

    // Validate email type
    const emailType = body.emailType || 'cold-outreach';
    if (!VALID_EMAIL_TYPES.includes(emailType as any)) {
      return NextResponse.json(
        { error: `Invalid email type. Must be one of: ${VALID_EMAIL_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate tone
    const tone = body.tone || 'professional';
    if (!VALID_TONES.includes(tone as any)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}` },
        { status: 400 }
      );
    }

    const template = await generateEmailTemplate({
      prospectName,
      companyName,
      companyDomain,
      role,
      industry,
      emailType: emailType as any,
      tone: tone as any,
      context,
    });

    return NextResponse.json(template, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimitResult!.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult!.resetTime.toString(),
      }
    });
  } catch (error: any) {
    console.error('Email template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate email template. Please try again.' },
      { status: 500 }
    );
  }
}

