import { NextRequest, NextResponse } from 'next/server';
import { analyzeResponseQuality } from '@/lib/sales-enhancements/sentiment-analysis';
import { sanitizeInput, validateText, rateLimit } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, { maxRequests: 50, windowMs: 60000 });
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '50',
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

    if (!body.repResponse) {
      return NextResponse.json(
        { error: 'repResponse is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate response text
    const repResponse = sanitizeInput(String(body.repResponse), 5000);
    
    const responseValidation = validateText(repResponse, {
      minLength: 1,
      maxLength: 5000,
    });

    if (!responseValidation.valid) {
      return NextResponse.json(
        { error: responseValidation.error || 'Invalid response text' },
        { status: 400 }
      );
    }

    // Sanitize context
    const context = body.context || {};
    const sanitizedContext: any = {};
    
    if (context.personaName) {
      sanitizedContext.personaName = sanitizeInput(String(context.personaName), 100);
    }
    if (context.objectionCategory) {
      sanitizedContext.objectionCategory = sanitizeInput(String(context.objectionCategory), 100);
    }
    if (context.conversationHistory && Array.isArray(context.conversationHistory)) {
      sanitizedContext.conversationHistory = context.conversationHistory
        .slice(0, 50) // Limit history length
        .map((item: any) => ({
          role: sanitizeInput(String(item.role || ''), 20),
          message: sanitizeInput(String(item.message || ''), 1000),
        }));
    }

    const quality = await analyzeResponseQuality(repResponse, sanitizedContext);
    
    return NextResponse.json(quality, {
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': rateLimitResult!.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult!.resetTime.toString(),
      }
    });
  } catch (error: any) {
    console.error('Response analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze response. Please try again.' },
      { status: 500 }
    );
  }
}

