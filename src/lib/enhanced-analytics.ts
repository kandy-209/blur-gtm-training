/**
 * Enhanced Analytics Tracking
 * Provides additional tracking capabilities beyond basic analytics
 */

import { analytics } from './analytics';

export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface EngagementEvent {
  type: 'scroll' | 'click' | 'time_on_page' | 'form_interaction' | 'video_play' | 'download';
  element?: string;
  value?: number;
  path: string;
  timestamp: Date;
}

export interface PerformanceEvent {
  metric: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP';
  value: number;
  path: string;
  timestamp: Date;
}

class EnhancedAnalytics {
  private sessionId: string;
  private pageStartTime: number = Date.now();

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('analytics_session_id');
      if (stored) return stored;
      const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('analytics_session_id', newId);
      return newId;
    }
    return `session_${Date.now()}`;
  }

  /**
   * Track page view with enhanced metadata
   */
  trackPageView(event: PageViewEvent): void {
    analytics.track({
      eventType: 'page_view',
      userId: event.userId || analytics.getUserId(),
      metadata: {
        path: event.path,
        title: event.title,
        referrer: event.referrer || document.referrer,
        sessionId: this.sessionId,
        timestamp: event.timestamp.toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        viewport: typeof window !== 'undefined' 
          ? `${window.innerWidth}x${window.innerHeight}` 
          : undefined,
      },
    });

    // Send to API
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        sessionId: this.sessionId,
      }),
    }).catch(console.error);
  }

  /**
   * Track user engagement events
   */
  trackEngagement(event: EngagementEvent): void {
    analytics.track({
      eventType: 'engagement',
      userId: analytics.getUserId(),
      metadata: {
        engagementType: event.type,
        element: event.element,
        value: event.value,
        path: event.path,
        sessionId: this.sessionId,
        timestamp: event.timestamp.toISOString(),
      },
    });

    // Send to API
    fetch('/api/analytics/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        sessionId: this.sessionId,
      }),
    }).catch(console.error);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(event: PerformanceEvent): void {
    analytics.track({
      eventType: 'performance',
      userId: analytics.getUserId(),
      metadata: {
        metric: event.metric,
        value: event.value,
        path: event.path,
        sessionId: this.sessionId,
        timestamp: event.timestamp.toISOString(),
      },
    });

    // Send to API
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        sessionId: this.sessionId,
      }),
    }).catch(console.error);
  }

  /**
   * Track time on page
   */
  trackTimeOnPage(path: string): void {
    const timeSpent = Date.now() - this.pageStartTime;
    this.trackEngagement({
      type: 'time_on_page',
      value: timeSpent,
      path,
      timestamp: new Date(),
    });
  }

  /**
   * Reset page start time (call on navigation)
   */
  resetPageStartTime(): void {
    this.pageStartTime = Date.now();
  }
}

export const enhancedAnalytics = new EnhancedAnalytics();

