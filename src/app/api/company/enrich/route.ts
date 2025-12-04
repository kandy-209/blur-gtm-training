import { NextRequest, NextResponse } from 'next/server';
import { getComprehensiveCompanyData } from '@/lib/alphavantage-enhanced';
import { enrichCompanyMultiSource } from '@/lib/company-enrichment-apis';
import { getCompanyNewsFromNewsAPI } from '@/lib/news-sentiment-api';
import { sanitizeInput } from '@/lib/security';
import { log, generateRequestId } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';
import { CachePresets } from '@/lib/cache-headers';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const companyName = searchParams.get('companyName');
    const domain = searchParams.get('domain');

    if (!symbol && !companyName) {
      return NextResponse.json(
        { error: 'Either symbol or companyName is required' },
        { 
          status: 400,
          headers: {
            'Cache-Control': CachePresets.noCache(),
            'X-Request-ID': requestId,
          },
        }
      );
    }

    const sanitizedSymbol = symbol ? sanitizeInput(symbol.toUpperCase(), 10) : undefined;
    const sanitizedName = companyName ? sanitizeInput(companyName, 200) : undefined;
    const sanitizedDomain = domain ? sanitizeInput(domain, 200) : undefined;

    // Fetch all data sources in parallel
    const [financialData, enrichmentData, newsData] = await Promise.allSettled([
      sanitizedSymbol ? getComprehensiveCompanyData(sanitizedSymbol) : Promise.resolve(null),
      enrichCompanyMultiSource(sanitizedName || '', sanitizedDomain, sanitizedSymbol),
      getCompanyNewsFromNewsAPI(sanitizedName || '', sanitizedSymbol),
    ]);

    const duration = Date.now() - startTime;

    const response = {
      company: {
        name: sanitizedName,
        symbol: sanitizedSymbol,
        domain: sanitizedDomain,
      },
      financial: financialData.status === 'fulfilled' ? financialData.value : null,
      enrichment: enrichmentData.status === 'fulfilled' ? enrichmentData.value : null,
      news: newsData.status === 'fulfilled' ? newsData.value : null,
      metadata: {
        requestId,
        duration,
        timestamp: new Date().toISOString(),
        dataSources: [
          ...(financialData.status === 'fulfilled' ? ['alphavantage'] : []),
          ...(enrichmentData.status === 'fulfilled' ? enrichmentData.value.dataSources : []),
          ...(newsData.status === 'fulfilled' ? ['newsapi'] : []),
        ],
      },
    };

    log.info('Company enrichment completed', {
      symbol: sanitizedSymbol,
      companyName: sanitizedName,
      duration,
      requestId,
      dataSources: response.metadata.dataSources,
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': CachePresets.companyAnalysis(),
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    log.error('Company enrichment error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
      duration,
    });
    
    return handleError(error, requestId);
  }
}

