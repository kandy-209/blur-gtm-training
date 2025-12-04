import { safeDate } from './date-utils';

export interface TrainingEvent {
  eventType: 'scenario_start' | 'scenario_complete' | 'turn_submit' | 'feedback_view' | 'module_complete' | 'live_match_found' | 'live_message_sent' | 'live_voice_enabled' | 'live_session_ended';
  userId?: string;
  scenarioId?: string;
  turnNumber?: number;
  score?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class Analytics {
  private events: TrainingEvent[] = [];
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('training_user_id', userId);
    }
  }

  getUserId(): string {
    if (this.userId) return this.userId;
    if (typeof window !== 'undefined') {
      // Check for guest user first
      const guestData = localStorage.getItem('guest_user');
      if (guestData) {
        try {
          const guestUser = JSON.parse(guestData);
          if (guestUser.id) {
            this.userId = guestUser.id;
            return guestUser.id;
          }
        } catch {
          // Ignore parse errors
        }
      }
      // Check for stored user ID
      const stored = localStorage.getItem('training_user_id');
      if (stored) {
        this.userId = stored;
        return stored;
      }
    }
    // Generate new ID
    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.setUserId(newId);
    return newId;
  }

  track(event: Omit<TrainingEvent, 'timestamp' | 'userId'>) {
    const fullEvent: TrainingEvent = {
      ...event,
      userId: this.getUserId(),
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // Track with Vercel Analytics (async, don't block)
    if (typeof window !== 'undefined') {
      // Use dynamic import to avoid issues in tests and server-side rendering
      import('./vercel-analytics').then(({ 
        trackTrainingEvent,
        trackLiveSessionEvent,
      }) => {
        try {
          // Map to Vercel Analytics events
          switch (event.eventType) {
            case 'scenario_start':
            case 'scenario_complete':
            case 'turn_submit':
            case 'feedback_view':
            case 'module_complete':
              trackTrainingEvent(event.eventType, {
                scenarioId: event.scenarioId,
                turnNumber: event.turnNumber,
                score: event.score,
                userId: fullEvent.userId,
              });
              break;
            case 'live_match_found':
            case 'live_message_sent':
            case 'live_voice_enabled':
            case 'live_session_ended':
              trackLiveSessionEvent(event.eventType, {
                sessionId: event.metadata?.sessionId,
                participantCount: event.metadata?.participantCount,
                duration: event.metadata?.duration,
                rating: event.metadata?.rating,
              });
              break;
          }
        } catch (error) {
          // Silently fail in tests or if module not available
          if (process.env.NODE_ENV !== 'test') {
            console.error('Vercel Analytics tracking error:', error);
          }
        }
      }).catch(() => {
        // Ignore import errors (e.g., in tests)
      });
    }

    // Send to API endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEvent),
      }).catch((err) => console.error('Analytics error:', err));
    }

    // Store in localStorage as backup
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('training_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(fullEvent);
      // Keep only last 100 events
      const recentEvents = events.slice(-100);
      localStorage.setItem('training_events', JSON.stringify(recentEvents));
    }
  }

  getEvents(): TrainingEvent[] {
    // In test environment, always return in-memory events to avoid localStorage issues
    if (process.env.NODE_ENV === 'test') {
      return this.events;
    }

    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('training_events');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge with in-memory events
            const allEvents = [...this.events, ...parsed.map((e: any) => ({
              ...e,
              timestamp: safeDate(e.timestamp),
            }))];
            // Remove duplicates
            const uniqueEvents = Array.from(
              new Map(allEvents.map(e => [e.timestamp.getTime(), e])).values()
            );
            return uniqueEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return this.events;
  }

  getStats() {
    const events = this.getEvents();
    const scenarioCompletions = events.filter(e => e.eventType === 'scenario_complete');
    const avgScore = scenarioCompletions.length > 0
      ? scenarioCompletions.reduce((sum, e) => sum + (e.score || 0), 0) / scenarioCompletions.length
      : 0;

    return {
      totalScenarios: scenarioCompletions.length,
      averageScore: Math.round(avgScore),
      totalTurns: events.filter(e => e.eventType === 'turn_submit').length,
    };
  }
}

export const analytics = new Analytics();

