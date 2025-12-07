import { NextRequest, NextResponse } from 'next/server';
import { enrichCompanyMultiSource, findContactsClearbit } from '@/lib/sales-enhancements/company-enrichment';
import { sanitizeInput, validateText, rateLimit } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, { maxRequests: 20, windowMs: 60000 });
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
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
    
    // Validate and sanitize inputs
    const companyName = body.companyName ? sanitizeInput(String(body.companyName), 200) : '';
    const domain = body.domain ? sanitizeInput(String(body.domain), 253) : undefined;

    // Validate company name
    const nameValidation = validateText(companyName, {
      minLength: 1,
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s\-&.,'()]+$/i, // Allow common company name characters
    });

    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error || 'Invalid company name format' },
        { status: 400 }
      );
    }

    // Validate domain format if provided
    if (domain) {
      const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
      if (!domainPattern.test(domain)) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        );
      }
    }

    const enrichment = await enrichCompanyMultiSource(companyName, domain);
    
    // Optionally find contacts if domain is available
    let contacts: Array<{ firstName?: string; lastName?: string; email?: string; title?: string; seniority?: string; department?: string; linkedin?: string; verified?: boolean }> = [];
    if (domain) {
      const contactsResult = await findContactsClearbit(domain);
      if (contactsResult.contacts && contactsResult.contacts.length > 0) {
        contacts = contactsResult.contacts;
      }
    }

    // Ensure we return proper structure even if enrichment failed
    const response = {
      company: enrichment.company || {
        name: companyName,
        domain: domain,
      },
      contacts,
      ...(enrichment.error && !enrichment.company ? { error: enrichment.error } : {}),
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimitResult!.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult!.resetTime.toString(),
      }
    });
  } catch (error: any) {
    // Don't expose internal error details
    console.error('Company enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich company. Please try again.' },
      { status: 500 }
    );
  }
}

