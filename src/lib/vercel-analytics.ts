/**
 * Vercel Analytics Integration
 * 
 * This module provides custom event tracking using Vercel Analytics
 * and integrates with the existing analytics system.
 */

import { track as vercelTrack } from '@vercel/analytics';

export interface VercelAnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

/**
 * Track custom events with Vercel Analytics
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;

  try {
    vercelTrack(name, properties);
  } catch (error) {
    console.error('Vercel Analytics tracking error:', error);
  }
}

/**
 * Track page views (automatically handled by Vercel Analytics, but can be customized)
 */
export function trackPageView(path: string, title?: string) {
  trackEvent('page_view', {
    path,
    title: title || document.title,
  });
}

/**
 * Track training-specific events
 */
export function trackTrainingEvent(
  eventType: 'scenario_start' | 'scenario_complete' | 'turn_submit' | 'feedback_view' | 'module_complete',
  data?: {
    scenarioId?: string;
    turnNumber?: number;
    score?: number;
    userId?: string;
  }
) {
  trackEvent(`training_${eventType}`, {
    ...(data?.scenarioId && { scenario_id: data.scenarioId }),
    ...(data?.turnNumber && { turn_number: data.turnNumber }),
    ...(data?.score && { score: data.score }),
    ...(data?.userId && { user_id: data.userId }),
  });
}

/**
 * Track role-play events
 */
export function trackRoleplayEvent(
  eventType: 'roleplay_start' | 'roleplay_complete' | 'roleplay_message' | 'roleplay_voice_enabled',
  data?: {
    scenarioId?: string;
    messageCount?: number;
    duration?: number;
    score?: number;
  }
) {
  trackEvent(`roleplay_${eventType}`, {
    ...(data?.scenarioId && { scenario_id: data.scenarioId }),
    ...(data?.messageCount && { message_count: data.messageCount }),
    ...(data?.duration && { duration: data.duration }),
    ...(data?.score && { score: data.score }),
  });
}

/**
 * Track live session events
 */
export function trackLiveSessionEvent(
  eventType: 'live_match_found' | 'live_message_sent' | 'live_voice_enabled' | 'live_session_ended',
  data?: {
    sessionId?: string;
    participantCount?: number;
    duration?: number;
    rating?: number;
  }
) {
  trackEvent(`live_${eventType}`, {
    ...(data?.sessionId && { session_id: data.sessionId }),
    ...(data?.participantCount && { participant_count: data.participantCount }),
    ...(data?.duration && { duration: data.duration }),
    ...(data?.rating && { rating: data.rating }),
  });
}

/**
 * Track chat events
 */
export function trackChatEvent(
  eventType: 'chat_message' | 'chat_type_switch' | 'chat_permission_denied',
  data?: {
    chatType?: string;
    messageLength?: number;
    permissionRequired?: string;
  }
) {
  trackEvent(`chat_${eventType}`, {
    ...(data?.chatType && { chat_type: data.chatType }),
    ...(data?.messageLength && { message_length: data.messageLength }),
    ...(data?.permissionRequired && { permission_required: data.permissionRequired }),
  });
}

/**
 * Track user authentication events
 */
export function trackAuthEvent(
  eventType: 'sign_in' | 'sign_up' | 'sign_out' | 'guest_mode',
  data?: {
    method?: string;
    userId?: string;
  }
) {
  trackEvent(`auth_${eventType}`, {
    ...(data?.method && { method: data.method }),
    ...(data?.userId && { user_id: data.userId }),
  });
}

/**
 * Track analytics dashboard events
 */
export function trackAnalyticsEvent(
  eventType: 'dashboard_view' | 'response_delete' | 'export_data',
  data?: {
    viewType?: string;
    responseId?: string;
    format?: string;
  }
) {
  trackEvent(`analytics_${eventType}`, {
    ...(data?.viewType && { view_type: data.viewType }),
    ...(data?.responseId && { response_id: data.responseId }),
    ...(data?.format && { format: data.format }),
  });
}

/**
 * Track leaderboard events
 */
export function trackLeaderboardEvent(
  eventType: 'leaderboard_view' | 'leaderboard_filter',
  data?: {
    category?: string;
    filter?: string;
  }
) {
  trackEvent(`leaderboard_${eventType}`, {
    ...(data?.category && { category: data.category }),
    ...(data?.filter && { filter: data.filter }),
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, action: string, metadata?: Record<string, string | number>) {
  trackEvent('feature_usage', {
    feature: featureName,
    action,
    ...metadata,
  });
}

/**
 * Track errors (for monitoring)
 */
export function trackError(errorType: string, errorMessage: string, context?: Record<string, string>) {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100), // Limit length
    ...context,
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(metricName: string, value: number, unit: string = 'ms') {
  trackEvent('performance', {
    metric: metricName,
    value,
    unit,
  });
}

