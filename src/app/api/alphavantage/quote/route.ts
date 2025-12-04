import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/alphavantage-simple';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';

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

    // Check API key
    if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY.trim() === '') {
      return NextResponse.json(
        { error: 'Alpha Vantage API key not configured' },
        { status: 503 }
      );
    }

    const sanitizedSymbol = sanitizeInput(symbol.toUpperCase(), 10);
    
    // Retry with backoff for robustness
    const quoteResult = await retryWithBackoff(
      () => getQuote(sanitizedSymbol),
      {
        maxRetries: 3,
        retryDelay: 1000,
        shouldRetry: (error) => {
          return error.message?.includes('timeout') || 
                 error.message?.includes('rate limit') ||
                 error.message?.includes('503') ||
                 error.message?.includes('429');
        }
      }
    );

    // Handle null data (quote not found)
    if (quoteResult.data === null) {
      return NextResponse.json(
        { error: 'Quote not found or API error' },
        { status: 404 }
      );
    }

    if (!quoteResult.success || !quoteResult.data) {
      // Preserve the original error message
      const errorMessage = quoteResult.error?.message || 
                          (quoteResult.error instanceof Error ? quoteResult.error.message : String(quoteResult.error)) ||
                          'API error';
      // Return 500 for API errors (rate limits, timeouts, etc.), 404 only for not found
      const lowerMessage = errorMessage.toLowerCase();
      const isNotFound = lowerMessage.includes('not found') || 
                        lowerMessage.includes('invalid symbol') ||
                        errorMessage.includes('404');
      const status = isNotFound ? 404 : 500;
      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }

    return NextResponse.json({ 
      quote: quoteResult.data,
      timestamp: new Date().toISOString(),
      cached: false
    });
  } catch (error: any) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}


