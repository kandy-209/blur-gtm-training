import { NextRequest, NextResponse } from 'next/server';
import { searchSymbol } from '@/lib/alphavantage-simple';
import { sanitizeInput } from '@/lib/security';
import { appendFileSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/search/route.ts:8',message:'GET search request',data:{keyword,hasApiKey:!!process.env.ALPHA_VANTAGE_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})+'\n');
      } catch {}
    }
    // #endregion

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword parameter is required' },
        { status: 400 }
      );
    }

    // Check API key before proceeding
    if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY.trim() === '') {
      console.warn('Alpha Vantage API key not configured. Company search feature unavailable.');
      return NextResponse.json(
        { 
          error: 'Company search is currently unavailable. This feature requires an Alpha Vantage API key to be configured.',
          results: [],
          message: 'To enable company search, add ALPHA_VANTAGE_API_KEY to your environment variables.'
        },
        { status: 503 }
      );
    }

    const sanitizedKeyword = sanitizeInput(keyword, 100);
    
    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/search/route.ts:20',message:'Calling searchSymbol',data:{sanitizedKeyword},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})+'\n');
      } catch {}
    }
    // #endregion
    
    const results = await searchSymbol(sanitizedKeyword);

    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/search/route.ts:24',message:'searchSymbol result',data:{hasResults:!!results,resultsCount:results?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})+'\n');
      } catch {}
    }
    // #endregion

    if (!results || results.length === 0) {
      return NextResponse.json({ 
        results: [],
        message: 'No results found. Try searching with a stock symbol (e.g., COIN for Coinbase) or company name.'
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    // #region debug log
    if (process.env.NODE_ENV !== 'test') {
      try {
        const logPath = '/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';
        appendFileSync(logPath, JSON.stringify({location:'alphavantage/search/route.ts:33',message:'Search error',data:{message:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})+'\n');
      } catch {}
    }
    // #endregion
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search symbols' },
      { status: 500 }
    );
  }
}


