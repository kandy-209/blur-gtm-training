import { NextRequest, NextResponse } from 'next/server';
import { getCompanyOverview } from '@/lib/alphavantage-simple';
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
    const overview = await getCompanyOverview(sanitizedSymbol);

    if (!overview) {
      return NextResponse.json(
        { error: 'Company overview not found or API error' },
        { status: 404 }
      );
    }

    return NextResponse.json({ overview });
  } catch (error: any) {
    console.error('Overview API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch company overview' },
      { status: 500 }
    );
  }
}















