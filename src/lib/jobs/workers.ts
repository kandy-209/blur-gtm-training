/**
 * Background Job Workers
 * Process jobs from queues
 */

import { Worker } from 'bullmq';
import {
  JobType,
  AnalyzeCompanyJobData,
  GenerateFeedbackJobData,
  SendEmailJobData,
  ProcessAnalyticsJobData,
  GeneratePersonaJobData,
  queues,
} from './queue';
import { log } from '../logger';
import { recordError, recordApiCall } from '../metrics';
import { CompanyIntelligenceAgent } from '@/infrastructure/agents/company-intelligence-agent';
import { FeedbackAgent } from '@/infrastructure/agents/feedback-agent';
import { PersonaGenerationAgent } from '@/infrastructure/agents/persona-generation-agent';
import { calculateConversationMetrics } from '@/lib/conversation-metrics';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

let redisConnection: any = connection;
if (process.env.REDIS_URL) {
  redisConnection = process.env.REDIS_URL;
}

// Initialize agents (lazy loading)
let companyIntelligenceAgent: CompanyIntelligenceAgent | null = null;
let feedbackAgent: FeedbackAgent | null = null;
let personaGenerationAgent: PersonaGenerationAgent | null = null;

function getCompanyIntelligenceAgent() {
  if (!companyIntelligenceAgent) {
    companyIntelligenceAgent = new CompanyIntelligenceAgent();
  }
  return companyIntelligenceAgent;
}

function getFeedbackAgent() {
  if (!feedbackAgent) {
    feedbackAgent = new FeedbackAgent();
  }
  return feedbackAgent;
}

function getPersonaGenerationAgent() {
  if (!personaGenerationAgent) {
    personaGenerationAgent = new PersonaGenerationAgent();
  }
  return personaGenerationAgent;
}

// Analyze Company Worker
export const analyzeCompanyWorker = new Worker<AnalyzeCompanyJobData>(
  JobType.ANALYZE_COMPANY,
  async (job) => {
    const startTime = Date.now();
    log.info('Processing analyze company job', { jobId: job.id, data: job.data });

    try {
      const agent = getCompanyIntelligenceAgent();
      const intelligence = await agent.analyze({
        domain: job.data.domain,
        githubRepo: undefined,
      });

      const duration = Date.now() - startTime;
      recordApiCall('job_analyze_company', 'worker', 'success', duration / 1000);

      log.info('Analyze company job completed', {
        jobId: job.id,
        companyId: job.data.companyId,
        duration,
      });

      return { intelligence, companyId: job.data.companyId };
    } catch (error) {
      const duration = Date.now() - startTime;
      recordApiCall('job_analyze_company', 'worker', 'error', duration / 1000);
      recordError('job_processing', 'high');

      log.error('Analyze company job failed', error instanceof Error ? error : new Error(String(error)), {
        jobId: job.id,
        data: job.data,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

// Generate Feedback Worker
export const generateFeedbackWorker = new Worker<GenerateFeedbackJobData>(
  JobType.GENERATE_FEEDBACK,
  async (job) => {
    const startTime = Date.now();
    log.info('Processing generate feedback job', { jobId: job.id, conversationId: job.data.conversationId });

    try {
      const agent = getFeedbackAgent();
      // Convert conversation history to proper format
      const conversationHistory = job.data.conversationHistory.map((msg: any) => ({
        role: msg.role || 'rep',
        message: msg.message || msg.text || '',
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }));
      
      // Calculate metrics first - convert to domain format
      const calculatedMetrics = calculateConversationMetrics(conversationHistory);
      const metrics = {
        talkToListenRatio: {
          repSpeakingTime: calculatedMetrics.talkToListenRatio.repWordCount || 0,
          prospectSpeakingTime: calculatedMetrics.talkToListenRatio.prospectWordCount || 0,
          totalTime: (calculatedMetrics.talkToListenRatio.repWordCount || 0) + (calculatedMetrics.talkToListenRatio.prospectWordCount || 0),
          ratio: calculatedMetrics.talkToListenRatio.ratio,
          idealRange: { min: 0.4, max: 0.6 },
          status: calculatedMetrics.talkToListenRatio.status,
        },
        questions: {
          repQuestions: calculatedMetrics.questions.repQuestions,
          prospectQuestions: calculatedMetrics.questions.prospectQuestions,
          discoveryQuestions: calculatedMetrics.questions.discoveryQuestions,
          closedQuestions: 0, // Not available in calculated metrics
          questionRatio: calculatedMetrics.questions.discoveryQuestions / Math.max(1, calculatedMetrics.questions.repQuestions),
        },
        interruptions: {
          repInterrupted: 0, // Not available in calculated metrics
          prospectInterrupted: 0, // Not available in calculated metrics
          interruptionRate: 0, // Not available in calculated metrics
        },
        monologues: {
          repMonologues: calculatedMetrics.conversationFlow?.repTurns || 0,
          prospectMonologues: calculatedMetrics.conversationFlow?.prospectTurns || 0,
          longestRepMonologue: calculatedMetrics.conversationFlow?.averageResponseLength || 0,
        },
      };
      
      const salesMethodology = (job.data.salesMethodology as 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT') || 'GAP';
      
      const feedback = await agent.analyzeConversation(
        conversationHistory,
        metrics,
        salesMethodology
      );

      const duration = Date.now() - startTime;
      recordApiCall('job_generate_feedback', 'worker', 'success', duration / 1000);

      log.info('Generate feedback job completed', {
        jobId: job.id,
        conversationId: job.data.conversationId,
        duration,
      });

      return { feedback, conversationId: job.data.conversationId };
    } catch (error) {
      const duration = Date.now() - startTime;
      recordApiCall('job_generate_feedback', 'worker', 'error', duration / 1000);
      recordError('job_processing', 'high');

      log.error('Generate feedback job failed', error instanceof Error ? error : new Error(String(error)), {
        jobId: job.id,
        conversationId: job.data.conversationId,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

// Send Email Worker
export const sendEmailWorker = new Worker<SendEmailJobData>(
  JobType.SEND_EMAIL,
  async (job) => {
    const startTime = Date.now();
    log.info('Processing send email job', { jobId: job.id, to: job.data.to });

    try {
      // TODO: Implement actual email sending
      // For now, just log
      log.info('Email would be sent', {
        to: job.data.to,
        subject: job.data.subject,
        templateId: job.data.templateId,
      });

      const duration = Date.now() - startTime;
      recordApiCall('job_send_email', 'worker', 'success', duration / 1000);

      return { success: true, to: job.data.to };
    } catch (error) {
      const duration = Date.now() - startTime;
      recordApiCall('job_send_email', 'worker', 'error', duration / 1000);
      recordError('job_processing', 'medium');

      log.error('Send email job failed', error instanceof Error ? error : new Error(String(error)), {
        jobId: job.id,
        to: job.data.to,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 20,
  }
);

// Process Analytics Worker
export const processAnalyticsWorker = new Worker<ProcessAnalyticsJobData>(
  JobType.PROCESS_ANALYTICS,
  async (job) => {
    const startTime = Date.now();
    log.debug('Processing analytics job', { jobId: job.id, userId: job.data.userId });

    try {
      // TODO: Implement analytics processing
      // For now, just log
      log.debug('Analytics processed', {
        userId: job.data.userId,
        eventType: job.data.eventType,
      });

      const duration = Date.now() - startTime;
      recordApiCall('job_process_analytics', 'worker', 'success', duration / 1000);

      return { success: true };
    } catch (error) {
      const duration = Date.now() - startTime;
      recordApiCall('job_process_analytics', 'worker', 'error', duration / 1000);
      recordError('job_processing', 'low');

      log.error('Process analytics job failed', error instanceof Error ? error : new Error(String(error)), {
        jobId: job.id,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 50,
  }
);

// Generate Persona Worker
export const generatePersonaWorker = new Worker<GeneratePersonaJobData>(
  JobType.GENERATE_PERSONA,
  async (job) => {
    const startTime = Date.now();
    log.info('Processing generate persona job', { jobId: job.id, companyId: job.data.companyId });

    try {
      // First get company intelligence
      const intelligenceAgent = getCompanyIntelligenceAgent();
      const intelligence = await intelligenceAgent.analyze({
        domain: job.data.domain,
        githubRepo: job.data.githubRepo,
      });
      
      // Then generate persona from intelligence
      const agent = getPersonaGenerationAgent();
      const persona = await agent.generate(intelligence, {
        difficulty: 'medium',
        personality: 'professional',
      });

      const duration = Date.now() - startTime;
      recordApiCall('job_generate_persona', 'worker', 'success', duration / 1000);

      log.info('Generate persona job completed', {
        jobId: job.id,
        companyId: job.data.companyId,
        duration,
      });

      return { persona, companyId: job.data.companyId };
    } catch (error) {
      const duration = Date.now() - startTime;
      recordApiCall('job_generate_persona', 'worker', 'error', duration / 1000);
      recordError('job_processing', 'high');

      log.error('Generate persona job failed', error instanceof Error ? error : new Error(String(error)), {
        jobId: job.id,
        companyId: job.data.companyId,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Worker event handlers
const workers = [
  analyzeCompanyWorker,
  generateFeedbackWorker,
  sendEmailWorker,
  processAnalyticsWorker,
  generatePersonaWorker,
];

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    log.info('Job completed', {
      jobId: job.id,
      jobName: job.name,
      duration: job.processedOn && job.finishedOn ? job.finishedOn - job.processedOn : undefined,
    });
  });

  worker.on('failed', (job, error) => {
    log.error('Job failed', error instanceof Error ? error : new Error(String(error)), {
      jobId: job?.id,
      jobName: job?.name,
      attemptsMade: job?.attemptsMade,
    });
    recordError('job_failed', 'high');
  });

  worker.on('error', (error) => {
    log.error('Worker error', error instanceof Error ? error : new Error(String(error)));
    recordError('worker_error', 'critical');
  });
});

// Graceful shutdown
export async function closeWorkers() {
  await Promise.all(workers.map((worker) => worker.close()));
  log.info('All workers closed');
}

