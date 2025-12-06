import { NextRequest, NextResponse } from 'next/server';
import { getCacheHealth, getCacheStats } from '@/lib/cache/cache-monitor';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';

/**
 * GET /api/cache/health
 * Get cache health status
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const detailed = searchParams.get('detailed') === 'true';

    const health = getCacheHealth();
    
    const response: any = {
      health,
      timestamp: new Date().toISOString(),
    };

    if (detailed) {
      response.stats = getCacheStats();
    }

    log.info('Cache health check', { requestId, status: health.status });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': CachePresets.noCache(),
        'X-Request-ID': requestId,
      },
    });
  } catch (error: any) {
    log.error('Cache health check error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });
    
    return NextResponse.json(
      { error: 'Failed to get cache health' },
      { status: 500 }
    );
  }
}




