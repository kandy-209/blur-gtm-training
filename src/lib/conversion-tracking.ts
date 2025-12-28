/**
 * Conversion Tracking System
 * Tracks conversion events for sales enablement analytics
 */

export interface ConversionEvent {
  eventType: 'scenario_complete' | 'meeting_booked' | 'demo_requested' | 'content_download' | 'email_sent' | 'scenario_started'
  scenarioId?: string
  userId: string
  metadata?: {
    score?: number
    scenarioType?: string
    timeToComplete?: number
    objectionsHandled?: number
    turnCount?: number
    finalScore?: number
  }
}

export interface FunnelStep {
  step: string
  userId: string
  metadata?: Record<string, any>
}

// Extend Window interface for analytics
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void
    }
    gtag?: (...args: any[]) => void
  }
}

export class ConversionTracker {
  /**
   * Track conversion events
   */
  static trackConversion(event: ConversionEvent) {
    if (typeof window === 'undefined') return

    try {
      // Vercel Analytics
      if (window.analytics?.track) {
        window.analytics.track(event.eventType, {
          ...event.metadata,
          scenarioId: event.scenarioId,
          userId: event.userId,
        })
      }

      // Google Analytics 4 (if configured)
      if (window.gtag) {
        window.gtag('event', event.eventType, {
          event_category: 'conversion',
          event_label: event.scenarioId || 'unknown',
          value: event.metadata?.score || event.metadata?.finalScore || 0,
          scenario_id: event.scenarioId,
          user_id: event.userId,
        })
      }

      // Custom endpoint for server-side tracking
      fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.error('Failed to track conversion:', error)
      })
    } catch (error) {
      console.error('Conversion tracking error:', error)
    }
  }

  /**
   * Track funnel progression
   */
  static trackFunnelStep(step: string, userId: string, metadata?: Record<string, any>) {
    if (typeof window === 'undefined') return

    try {
      const funnelData: FunnelStep = {
        step,
        userId,
        metadata,
      }

      // Vercel Analytics
      if (window.analytics?.track) {
        window.analytics.track('funnel_step', {
          step,
          userId,
          ...metadata,
        })
      }

      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', 'funnel_step', {
          event_category: 'funnel',
          event_label: step,
          user_id: userId,
          ...metadata,
        })
      }

      // Custom endpoint
      fetch('/api/analytics/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(funnelData),
      }).catch((error) => {
        console.error('Failed to track funnel step:', error)
      })
    } catch (error) {
      console.error('Funnel tracking error:', error)
    }
  }

  /**
   * Track scenario start
   */
  static trackScenarioStart(scenarioId: string, userId: string) {
    this.trackConversion({
      eventType: 'scenario_started',
      scenarioId,
      userId,
    })
    this.trackFunnelStep('scenario_started', userId, { scenarioId })
  }

  /**
   * Track scenario completion
   */
  static trackScenarioComplete(
    scenarioId: string,
    userId: string,
    metadata: {
      score?: number
      timeToComplete?: number
      objectionsHandled?: number
      turnCount?: number
      meetingBooked?: boolean
    }
  ) {
    this.trackConversion({
      eventType: 'scenario_complete',
      scenarioId,
      userId,
      metadata: {
        finalScore: metadata.score,
        timeToComplete: metadata.timeToComplete,
        objectionsHandled: metadata.objectionsHandled,
        turnCount: metadata.turnCount,
      },
    })

    if (metadata.meetingBooked) {
      this.trackConversion({
        eventType: 'meeting_booked',
        scenarioId,
        userId,
        metadata: {
          finalScore: metadata.score,
          timeToComplete: metadata.timeToComplete,
        },
      })
    }

    this.trackFunnelStep('scenario_completed', userId, {
      scenarioId,
      score: metadata.score,
      meetingBooked: metadata.meetingBooked,
    })
  }
}

