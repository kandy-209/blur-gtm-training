import { NextRequest, NextResponse } from 'next/server';
import { warmCache, warmPopularStocks } from '@/lib/cache/cache-warmer';
import { getEnhancedQuote } from '@/lib/alphavantage-enhanced';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';

/**
 * POST /api/cache/warm
 * Warm cache with specified keys
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    const { symbols, keywords } = body;

    if (!symbols && !keywords) {
      return NextResponse.json(
        { error: 'symbols or keywords required' },
        { status: 400 }
      );
    }

    const results: any = {};

    // Warm stock quotes
    if (symbols && Array.isArray(symbols)) {
      const stockResults = await warmPopularStocks(
        symbols,
        async (symbol) => {
          const quote = await getEnhancedQuote(symbol);
          return quote;
        }
      );
      results.stocks = stockResults;
    }

    // Warm company searches
    if (keywords && Array.isArray(keywords)) {
      const { warmCompanySearches } = await import('@/lib/cache/cache-warmer');
      const { searchSymbol } = await import('@/lib/alphavantage-simple');
      
      const searchResults = await warmCompanySearches(
        keywords,
        async (keyword) => {
          const results = await searchSymbol(keyword);
          return results;
        }
      );
      results.searches = searchResults;
    }

    log.info('Cache warming completed', { requestId, results });

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': CachePresets.noCache(),
        'X-Request-ID': requestId,
      },
    });
  } catch (error: any) {
    log.error('Cache warming error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });
    
    return NextResponse.json(
      { error: 'Failed to warm cache' },
      { status: 500 }
    );
  }
}

