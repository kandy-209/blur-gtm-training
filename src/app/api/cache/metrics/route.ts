import { NextRequest, NextResponse } from 'next/server';
import { getCacheMetrics } from '@/lib/next-cache-wrapper';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';

/**
 * GET /api/cache/metrics
 * Returns cache performance metrics
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyPattern = searchParams.get('pattern');

    const metrics = getCacheMetrics(keyPattern || undefined);

    // Calculate aggregate statistics
    const allMetrics = Object.values(metrics);
    const totalHits = allMetrics.reduce((sum, m) => sum + m.hits, 0);
    const totalMisses = allMetrics.reduce((sum, m) => sum + m.misses, 0);
    const totalStale = allMetrics.reduce((sum, m) => sum + m.staleServed, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errors, 0);
    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    
    const overallHitRate = totalRequests > 0 
      ? ((totalHits + totalStale) / totalRequests) * 100 
      : 0;

    log.info('Cache metrics retrieved', { requestId, keyPattern });

    return NextResponse.json({
      metrics,
      summary: {
        totalRequests,
        totalHits,
        totalMisses,
        totalStaleServed: totalStale,
        totalErrors,
        overallHitRate: Math.round(overallHitRate * 100) / 100,
        cacheEfficiency: totalRequests > 0 
          ? Math.round(((totalHits + totalStale) / totalRequests) * 10000) / 100 
          : 0,
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': CachePresets.apiStable(60), // Cache metrics for 1 minute
        'X-Request-ID': requestId,
      },
    });
  } catch (error: any) {
    log.error('Cache metrics error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });
    
    return NextResponse.json(
      { error: 'Failed to retrieve cache metrics' },
      { 
        status: 500,
        headers: {
          'Cache-Control': CachePresets.noCache(),
          'X-Request-ID': requestId,
        },
      }
    );
  }
}

