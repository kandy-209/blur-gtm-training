import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/alphavantage-simple';
import { sanitizeInput } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const sanitizedSymbol = sanitizeInput(symbol.toUpperCase(), 10);
    const quote = await getQuote(sanitizedSymbol);

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found or API error' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quote });
  } catch (error: any) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}


