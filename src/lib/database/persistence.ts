/**
 * Database Persistence Layer
 * Migrates from in-memory storage to persistent database
 */

import { db } from '../db';
import { cacheGet, cacheSet } from '../redis';
import { log } from '../logger';

// Cache keys
const CACHE_KEYS = {
  USER_RESPONSES: 'db:user_responses',
  TECHNICAL_QUESTIONS: 'db:technical_questions',
  ANALYTICS_EVENTS: 'db:analytics_events',
};

/**
 * Persist user response to database
 * Uses cache for read optimization
 */
export async function persistUserResponse(response: {
  userId: string;
  scenarioId: string;
  turnNumber: number;
  objectionCategory: string;
  userMessage: string;
  aiResponse: string;
  evaluation: 'PASS' | 'FAIL' | 'REJECT';
  confidenceScore: number;
  keyPointsMentioned: string[];
}) {
  try {
    // Save to database
    const saved = await db.saveUserResponse(response);

    // Invalidate cache
    await cacheDelete(`user_responses:${response.userId}`);
    await cacheDelete(`user_responses:${response.scenarioId}`);

    log.debug('User response persisted', {
      responseId: saved.id,
      userId: response.userId,
      scenarioId: response.scenarioId,
    });

    return saved;
  } catch (error) {
    log.error('Failed to persist user response', error instanceof Error ? error : new Error(String(error)), {
      userId: response.userId,
      scenarioId: response.scenarioId,
    });
    throw error;
  }
}

/**
 * Get user responses with caching
 */
export async function getUserResponses(filters?: {
  userId?: string;
  scenarioId?: string;
  objectionCategory?: string;
  limit?: number;
}) {
  try {
    // Try cache first
    const cacheKey = `user_responses:${filters?.userId || 'all'}:${filters?.scenarioId || 'all'}:${filters?.objectionCategory || 'all'}`;
    const cached = await cacheGet<any[]>(cacheKey);
    
    if (cached) {
      log.debug('User responses retrieved from cache', { cacheKey, count: cached.length });
      return cached;
    }

    // Fetch from database
    const responses = await db.getUserResponses(filters);

    // Cache for 5 minutes
    await cacheSet(cacheKey, responses, { ttl: 300 });

    log.debug('User responses retrieved from database', {
      count: responses.length,
      filters,
    });

    return responses;
  } catch (error) {
    log.error('Failed to get user responses', error instanceof Error ? error : new Error(String(error)), {
      filters,
    });
    throw error;
  }
}

/**
 * Persist analytics event
 */
export async function persistAnalyticsEvent(event: {
  eventType: string;
  userId: string;
  scenarioId?: string;
  data?: any;
}) {
  try {
    // For now, use the existing analytics API
    // In production, this would save to a database
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: new Date(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to persist analytics event: ${response.statusText}`);
    }

    log.debug('Analytics event persisted', {
      eventType: event.eventType,
      userId: event.userId,
    });

    return await response.json();
  } catch (error) {
    log.error('Failed to persist analytics event', error instanceof Error ? error : new Error(String(error)), {
      eventType: event.eventType,
      userId: event.userId,
    });
    // Don't throw - analytics failures shouldn't break the app
    return null;
  }
}

/**
 * Batch persist analytics events
 */
export async function batchPersistAnalyticsEvents(events: Array<{
  eventType: string;
  userId: string;
  scenarioId?: string;
  data?: any;
}>) {
  try {
    // Process in batches of 10
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < events.length; i += batchSize) {
      batches.push(events.slice(i, i + batchSize));
    }

    const results = await Promise.allSettled(
      batches.map((batch) =>
        Promise.all(batch.map((event) => persistAnalyticsEvent(event)))
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    log.info('Batch analytics events persisted', {
      total: events.length,
      successful,
      failed,
    });

    return { successful, failed, total: events.length };
  } catch (error) {
    log.error('Failed to batch persist analytics events', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Helper function for cache deletion
async function cacheDelete(key: string): Promise<void> {
  try {
    const { cacheDelete: deleteCache } = await import('../redis');
    await deleteCache(key);
  } catch {
    // Ignore cache errors
  }
}















