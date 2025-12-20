import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { cleanText } from '@/lib/email-style/bbqCleaner';
import type { EmailStyle } from '@/lib/email-style/types';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body || typeof body.original !== 'string' || !body.original.trim()) {
      return NextResponse.json(
        { error: 'Field "original" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const style: EmailStyle =
      body.style === 'exec_concise' ? 'exec_concise' : 'bbq_plain';

    const cleaned = cleanText(body.original, style);

    return NextResponse.json({
      original: body.original,
      rewritten: cleaned.revised,
      style,
      changes: cleaned.changes,
      lintBefore: cleaned.lintBefore,
      lintAfter: cleaned.lintAfter,
      bbqScore: cleaned.bbqScore,
    });
  } catch (error: any) {
    log.error('BBQ rewrite error', error);
    return NextResponse.json(
      { error: 'Failed to rewrite email. Please try again.' },
      { status: 500 }
    );
  }
}

