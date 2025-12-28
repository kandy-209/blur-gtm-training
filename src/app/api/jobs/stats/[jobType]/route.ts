import { NextRequest, NextResponse } from 'next/server';
import { getQueueStats, JobType } from '@/lib/jobs/queue';
import { handleError } from '@/lib/error-handler';
import { log } from '@/lib/logger';

/**
 * Get Queue Statistics
 * GET /api/jobs/stats/:jobType
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobType: string }> }
) {
  try {
    const { jobType } = await params;

    // Validate job type
    if (!Object.values(JobType).includes(jobType as JobType)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      );
    }

    const stats = await getQueueStats(jobType as JobType);

    log.debug('Queue stats retrieved', { jobType, stats });

    return NextResponse.json(stats);
  } catch (error) {
    log.error('Failed to get queue stats', error instanceof Error ? error : new Error(String(error)), {
      params: await params,
    });
    return handleError(error);
  }
}















