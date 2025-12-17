import { NextRequest, NextResponse } from 'next/server';
import { getUserProspects, getProspectStats } from '@/lib/prospect-intelligence/persistence';
import { log, generateRequestId } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/prospect-intelligence/auth-helper';
import { z } from 'zod';

/**
 * GET /api/prospect-intelligence/saved
 * Get all saved prospects for the current user
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Require authentication
    const userId = await requireAuth(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const priorityLevel = searchParams.get('priority') as 'high' | 'medium' | 'low' | null;
    const minIcpScore = searchParams.get('minIcpScore') ? parseInt(searchParams.get('minIcpScore')!) : undefined;
    const search = searchParams.get('search') || undefined;

    const prospects = await getUserProspects(userId, {
      limit,
      offset,
      priorityLevel: priorityLevel || undefined,
      minIcpScore,
      search,
    });

    const stats = await getProspectStats(userId);

    return NextResponse.json({
      success: true,
      data: {
        prospects,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.total,
        },
      },
      requestId,
    }, {
      headers: {
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    return handleError(error, requestId);
  }
}
