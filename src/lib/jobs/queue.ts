/**
 * Background Job Queue with BullMQ
 * Handles async job processing with Redis backend
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedisClient } from '../redis';
import { log } from '../logger';
import { recordError } from '../metrics';

// Job queue configuration
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Use Redis URL if available
let redisConnection: any = connection;
if (process.env.REDIS_URL) {
  redisConnection = process.env.REDIS_URL;
}

// Job types
export enum JobType {
  ANALYZE_COMPANY = 'analyze_company',
  GENERATE_FEEDBACK = 'generate_feedback',
  SEND_EMAIL = 'send_email',
  PROCESS_ANALYTICS = 'process_analytics',
  CLEANUP_OLD_DATA = 'cleanup_old_data',
  GENERATE_PERSONA = 'generate_persona',
}

// Job data interfaces
export interface AnalyzeCompanyJobData {
  companyId: string;
  domain: string;
  forceRefresh?: boolean;
}

export interface GenerateFeedbackJobData {
  conversationId: string;
  conversationHistory: any[];
  salesMethodology?: string;
}

export interface SendEmailJobData {
  to: string;
  subject: string;
  body: string;
  templateId?: string;
}

export interface ProcessAnalyticsJobData {
  userId: string;
  eventType: string;
  data: any;
}

export interface GeneratePersonaJobData {
  companyId: string;
  githubRepo?: string;
  domain: string;
}

// Create queues
export const analyzeCompanyQueue = new Queue<AnalyzeCompanyJobData>(JobType.ANALYZE_COMPANY, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep last 1000 jobs
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

export const generateFeedbackQueue = new Queue<GenerateFeedbackJobData>(JobType.GENERATE_FEEDBACK, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const sendEmailQueue = new Queue<SendEmailJobData>(JobType.SEND_EMAIL, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const processAnalyticsQueue = new Queue<ProcessAnalyticsJobData>(JobType.PROCESS_ANALYTICS, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: true,
  },
});

export const generatePersonaQueue = new Queue<GeneratePersonaJobData>(JobType.GENERATE_PERSONA, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Queue registry for easy access
export const queues = {
  [JobType.ANALYZE_COMPANY]: analyzeCompanyQueue,
  [JobType.GENERATE_FEEDBACK]: generateFeedbackQueue,
  [JobType.SEND_EMAIL]: sendEmailQueue,
  [JobType.PROCESS_ANALYTICS]: processAnalyticsQueue,
  [JobType.GENERATE_PERSONA]: generatePersonaQueue,
};

// Queue events for monitoring
export const queueEvents = {
  [JobType.ANALYZE_COMPANY]: new QueueEvents(JobType.ANALYZE_COMPANY, { connection: redisConnection }),
  [JobType.GENERATE_FEEDBACK]: new QueueEvents(JobType.GENERATE_FEEDBACK, { connection: redisConnection }),
  [JobType.SEND_EMAIL]: new QueueEvents(JobType.SEND_EMAIL, { connection: redisConnection }),
  [JobType.PROCESS_ANALYTICS]: new QueueEvents(JobType.PROCESS_ANALYTICS, { connection: redisConnection }),
  [JobType.GENERATE_PERSONA]: new QueueEvents(JobType.GENERATE_PERSONA, { connection: redisConnection }),
};

// Helper function to add job to queue
export async function addJob(
  jobType: JobType,
  data: AnalyzeCompanyJobData | GenerateFeedbackJobData | SendEmailJobData | ProcessAnalyticsJobData | GeneratePersonaJobData,
  options?: { priority?: number; delay?: number; jobId?: string }
) {
  const queue = queues[jobType as keyof typeof queues];
  if (!queue) {
    throw new Error(`Queue not found for job type: ${jobType}`);
  }

  try {
    const job = await queue.add(jobType, data as any, {
      priority: options?.priority,
      delay: options?.delay,
      jobId: options?.jobId,
    });

    log.info('Job added to queue', {
      jobType,
      jobId: job.id,
      data: JSON.stringify(data).substring(0, 100),
    });

    return job;
  } catch (error) {
    log.error('Failed to add job to queue', error instanceof Error ? error : new Error(String(error)), {
      jobType,
      data: JSON.stringify(data).substring(0, 100),
    });
    recordError('job_queue', 'high');
    throw error;
  }
}

// Helper function to get job status
export async function getJobStatus(jobType: JobType, jobId: string) {
  const queue = queues[jobType as keyof typeof queues];
  if (!queue) {
    throw new Error(`Queue not found for job type: ${jobType}`);
  }

  const job = await queue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;
  const returnValue = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    state,
    progress,
    returnValue,
    failedReason,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

// Helper function to get queue stats
export async function getQueueStats(jobType: JobType) {
  const queue = queues[jobType as keyof typeof queues];
  if (!queue) {
    throw new Error(`Queue not found for job type: ${jobType}`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

// Graceful shutdown
export async function closeQueues() {
  await Promise.all(Object.values(queues).map((queue) => queue.close()));
  await Promise.all(Object.values(queueEvents).map((events) => events.close()));
  log.info('All queues closed');
}

