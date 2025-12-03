import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/alphavantage-simple';
import { sanitizeInput } from '@/lib/security';
import { appendFileSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/quote/route.ts:7',message:'GET request received',data:{symbol,hasApiKey:!!process.env.ALPHA_VANTAGE_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
      } catch {}
    }
    // #endregion

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const sanitizedSymbol = sanitizeInput(symbol.toUpperCase(), 10);
    
    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/quote/route.ts:19',message:'Calling getQuote',data:{sanitizedSymbol},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})+'\n');
      } catch {}
    }
    // #endregion
    
    const quote = await getQuote(sanitizedSymbol);

    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/quote/route.ts:22',message:'getQuote result',data:{hasQuote:!!quote,quoteSymbol:quote?.symbol},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})+'\n');
      } catch {}
    }
    // #endregion

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found or API error' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quote });
  } catch (error: any) {
    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/quote/route.ts:35',message:'Error caught',data:{message:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})+'\n');
      } catch {}
    }
    // #endregion
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}


