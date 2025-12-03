import { NextRequest, NextResponse } from 'next/server';
import { addJob, JobType } from '@/lib/jobs/queue';
import { handleError, AppError, ErrorType } from '@/lib/error-handler';
import { log } from '@/lib/logger';

/**
 * Add Job to Queue
 * POST /api/jobs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobType, data, options } = body;

    // Validate job type
    if (!jobType || !Object.values(JobType).includes(jobType)) {
      throw new AppError('Invalid job type', ErrorType.VALIDATION, 400);
    }

    // Validate data based on job type
    if (!data) {
      throw new AppError('Job data is required', ErrorType.VALIDATION, 400);
    }

    // Add job to queue
    const job = await addJob(jobType as JobType, data, options);

    log.info('Job added to queue', {
      jobType,
      jobId: job.id,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      jobType,
    });
  } catch (error) {
    log.error('Failed to add job', error instanceof Error ? error : new Error(String(error)));
    return handleError(error);
  }
}

