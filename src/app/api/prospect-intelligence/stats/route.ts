import { NextRequest, NextResponse } from 'next/server';
import { getProspectStats } from '@/lib/prospect-intelligence/persistence';
import { log, generateRequestId } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/prospect-intelligence/auth-helper';

/**
 * GET /api/prospect-intelligence/stats
 * Get prospect statistics for the current user
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Require authentication
    const userId = await requireAuth(request);

    const stats = await getProspectStats(userId);

    return NextResponse.json({
      success: true,
      data: stats,
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
