import { NextRequest, NextResponse } from 'next/server';
import { searchSymbol, getQuote, getCompanyOverview } from '@/lib/alphavantage-simple';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const includeDetails = searchParams.get('includeDetails') === 'true';

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
          // Retry on network errors or rate limits
          return error.message?.includes('timeout') || 
                 error.message?.includes('rate limit') ||
                 error.message?.includes('503') ||
                 error.message?.includes('429');
        }
      }
    );

    if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
      return NextResponse.json({ 
        results: [],
        message: 'No results found. Try searching with a stock symbol (e.g., COIN for Coinbase) or company name.'
      });
    }

    const results = searchResult.data;

    // If includeDetails is true, fetch additional data for first result
    let enrichedResults = results;
    if (includeDetails && results.length > 0) {
      const firstResult = results[0];
      try {
        // Fetch quote and overview in parallel
        const [quoteResult, overviewResult] = await Promise.allSettled([
          retryWithBackoff(() => getQuote(firstResult.symbol), {
            maxRetries: 2,
            retryDelay: 500,
          }),
          retryWithBackoff(() => getCompanyOverview(firstResult.symbol), {
            maxRetries: 2,
            retryDelay: 500,
          })
        ]);

        enrichedResults = results.map((result, index) => {
          if (index === 0) {
            const quote = quoteResult.status === 'fulfilled' && quoteResult.value.success 
              ? quoteResult.value.data 
              : null;
            const overview = overviewResult.status === 'fulfilled' && overviewResult.value.success
              ? overviewResult.value.data
              : null;
            
            return {
              ...result,
              quote,
              overview,
            };
          }
          return result;
        });
      } catch (error) {
        console.error('Error enriching results:', error);
        // Return basic results even if enrichment fails
      }
    }

    return NextResponse.json({ 
      results: enrichedResults,
      total: enrichedResults.length,
      enriched: includeDetails && enrichedResults.length > 0
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to search symbols',
        results: []
      },
      { status: 500 }
    );
  }
}


