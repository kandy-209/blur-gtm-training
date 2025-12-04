import { NextRequest, NextResponse } from 'next/server';
import { getEnhancedQuote } from '@/lib/alphavantage-enhanced';
import { sanitizeInput } from '@/lib/security';
import { cachedRouteHandler } from '@/lib/next-cache-wrapper';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { 
          status: 400,
          headers: {
            'Cache-Control': CachePresets.noCache(),
            'X-Request-ID': requestId,
          },
        }
      );
    }

    // Check API key
    if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY.trim() === '') {
      return NextResponse.json(
        { error: 'Alpha Vantage API key not configured' },
        { 
          status: 503,
          headers: {
            'Cache-Control': CachePresets.noCache(),
            'X-Request-ID': requestId,
          },
        }
      );
    }

    const sanitizedSymbol = sanitizeInput(symbol.toUpperCase(), 10);
    
    // Use enhanced quote with caching
    const quote = await getEnhancedQuote(sanitizedSymbol);

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found or API error' },
        { 
          status: 404,
          headers: {
            'Cache-Control': CachePresets.noCache(),
            'X-Request-ID': requestId,
          },
        }
      );
    }

    const duration = Date.now() - startTime;
    
    log.info('Quote fetched', {
      symbol: sanitizedSymbol,
      duration,
      requestId,
    });

    return NextResponse.json(
      { 
        quote,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': CachePresets.stockQuote(),
          'X-Request-ID': requestId,
          'X-Response-Time': `${duration}ms`,
        },
      }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    log.error('Quote API error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
      duration,
    });
    
    return handleError(error, requestId);
  }
}


