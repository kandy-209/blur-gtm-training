import { NextRequest, NextResponse } from 'next/server';
import { searchSymbol } from '@/lib/alphavantage-simple';
import { sanitizeInput } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword parameter is required' },
        { status: 400 }
      );
    }

    const sanitizedKeyword = sanitizeInput(keyword, 100);
    const results = await searchSymbol(sanitizedKeyword);

    if (!results || results.length === 0) {
      return NextResponse.json({ results: [] });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search symbols' },
      { status: 500 }
    );
  }
}


