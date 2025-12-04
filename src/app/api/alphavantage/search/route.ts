import { NextRequest, NextResponse } from 'next/server';
import { searchSymbol } from '@/lib/alphavantage-simple';
import { getEnhancedQuote, getEnhancedCompanyOverview } from '@/lib/alphavantage-enhanced';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';
import { cachedRouteHandler } from '@/lib/next-cache-wrapper';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword parameter is required' },
        { 
          status: 400,
          headers: {
            'Cache-Control': CachePresets.noCache(),
            'X-Request-ID': requestId,
          },
        }
      );
    }

    // Check API key before proceeding
    if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY.trim() === '') {
      log.warn('Alpha Vantage API key not configured', { requestId });
      return NextResponse.json(
        { 
          error: 'Company search is currently unavailable. This feature requires an Alpha Vantage API key to be configured.',
          results: [],
          message: 'To enable company search, add ALPHA_VANTAGE_API_KEY to your environment variables.'
        },
        { 
          status: 503,
          headers: {
            'Cache-Control': CachePresets.noCache(),
            'X-Request-ID': requestId,
          },
        }
      );
    }

    const sanitizedKeyword = sanitizeInput(keyword, 100);
    
    // Use cached route handler for search results
    const cached = await cachedRouteHandler(
      `search:${sanitizedKeyword}:${includeDetails}`,
      async () => {
        // Retry search with backoff for robustness
        const searchResult = await retryWithBackoff(
          async () => {
            const searchResults = await searchSymbol(sanitizedKeyword);
            if (!searchResults || searchResults.length === 0) {
              return [];
            }
            return searchResults;
          },
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

        if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
          return [];
        }

        const results = searchResult.data;

        // If includeDetails is true, fetch additional data for first result
        if (includeDetails && results.length > 0) {
          const firstResult = results[0];
          try {
            // Fetch quote and overview in parallel using enhanced APIs
            const [quote, overview] = await Promise.allSettled([
              getEnhancedQuote(firstResult.symbol),
              getEnhancedCompanyOverview(firstResult.symbol),
            ]);

            return results.map((result, index) => {
              if (index === 0) {
                const quoteData = quote.status === 'fulfilled' ? quote.value : null;
                const overviewData = overview.status === 'fulfilled' ? overview.value : null;
                
                return {
                  ...result,
                  quote: quoteData,
                  overview: overviewData,
                };
              }
              return result;
            });
          } catch (error) {
            log.warn('Error enriching results', {
              error: error instanceof Error ? error.message : String(error),
              requestId,
            });
            return results;
          }
        }

        return results;
      },
      {
        revalidate: 300, // 5 minutes (search results are relatively stable)
        tags: [`search-${sanitizedKeyword}`, 'alphavantage'],
        useRedis: true,
        enableMetrics: true,
      }
    );

    const duration = Date.now() - startTime;
    
    log.info('Search completed', {
      keyword: sanitizedKeyword,
      resultsCount: cached.data.length,
      cached: cached.cached,
      duration,
      requestId,
    });

    return NextResponse.json(
      { 
        results: cached.data,
        total: cached.data.length,
        enriched: includeDetails && cached.data.length > 0,
        timestamp: cached.timestamp,
        cached: cached.cached,
        age: cached.age,
      },
      {
        headers: {
          'Cache-Control': CachePresets.apiStable(300),
          'X-Cache-Status': cached.cached ? 'HIT' : 'MISS',
          'X-Cache-Age': cached.age?.toString() || '0',
          'X-Request-ID': requestId,
          'X-Response-Time': `${duration}ms`,
        },
      }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    log.error('Search API error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
      duration,
    });
    
    return handleError(error, requestId);
  }
}


