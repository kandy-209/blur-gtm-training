import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus, JobType } from '@/lib/jobs/queue';
import { handleError } from '@/lib/error-handler';
import { log } from '@/lib/logger';

/**
 * Get Job Status
 * GET /api/jobs/status/:jobType/:jobId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobType: string; jobId: string }> }
) {
  try {
    const { jobType, jobId } = await params;

    // Validate job type
    if (!Object.values(JobType).includes(jobType as JobType)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      );
    }

    const status = await getJobStatus(jobType as JobType, jobId);

    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    log.debug('Job status retrieved', { jobType, jobId, state: status.state });

    return NextResponse.json(status);
  } catch (error) {
    log.error('Failed to get job status', error instanceof Error ? error : new Error(String(error)), {
      params: await params,
    });
    return handleError(error);
  }
}







