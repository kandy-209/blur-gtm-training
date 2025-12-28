import { NextRequest, NextResponse } from 'next/server';
import { seoValidator } from '@/lib/seo-validator';

export async function GET(request: NextRequest) {
  try {
    const results = await seoValidator.validate();
    const summary = seoValidator.getSummary(results);

    return NextResponse.json({
      summary,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

