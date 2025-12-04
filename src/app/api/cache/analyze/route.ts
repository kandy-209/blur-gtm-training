import { NextRequest, NextResponse } from 'next/server';
import { analyzeCachePerformance, getCacheHealthScore } from '@/lib/performance/cache-optimizer';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';

/**
 * GET /api/cache/analyze
 * Returns cache performance analysis and optimization suggestions
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const analysis = analyzeCachePerformance();
    const healthScore = getCacheHealthScore();

    log.info('Cache analysis completed', { requestId, healthScore });

    return NextResponse.json({
      analysis,
      healthScore,
      timestamp: new Date().toISOString(),
      recommendations: {
        priority: analysis.recommendations.slice(0, 3),
        all: analysis.recommendations,
      },
    }, {
      headers: {
        'Cache-Control': CachePresets.apiStable(300),
        'X-Request-ID': requestId,
      },
    });
  } catch (error: any) {
    log.error('Cache analysis error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });
    
    return NextResponse.json(
      { error: 'Failed to analyze cache performance' },
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

