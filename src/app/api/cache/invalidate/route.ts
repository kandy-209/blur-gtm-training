import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache, invalidateSymbol, invalidateSearch, invalidateKeys } from '@/lib/cache/cache-invalidation';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';

/**
 * POST /api/cache/invalidate
 * Invalidate cache entries
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    const { strategy, symbol, keyword, keys, tags, all } = body;

    // Validate request
    if (!strategy && !symbol && !keyword && !keys && !tags && !all) {
      return NextResponse.json(
        { error: 'Invalidation strategy required' },
        { status: 400 }
      );
    }

    // Invalidate based on strategy
    if (strategy) {
      await invalidateCache(strategy);
    } else if (symbol) {
      await invalidateSymbol(symbol);
    } else if (keyword) {
      await invalidateSearch(keyword);
    } else if (keys && Array.isArray(keys)) {
      await invalidateKeys(keys);
    } else if (tags && Array.isArray(tags)) {
      const { invalidateByTags } = await import('@/lib/cache/cache-invalidation');
      await invalidateByTags(tags);
    } else if (all) {
      await invalidateCache({ all: true });
    }

    log.info('Cache invalidation completed', { requestId, strategy, symbol, keyword });

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated',
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': CachePresets.noCache(),
        'X-Request-ID': requestId,
      },
    });
  } catch (error: any) {
    log.error('Cache invalidation error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });
    
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}




