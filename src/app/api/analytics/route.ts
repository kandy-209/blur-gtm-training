import { NextRequest, NextResponse } from 'next/server';
import { TrainingEvent } from '@/lib/analytics';
import { sanitizeInput, validateJSONStructure } from '@/lib/security';
import { persistAnalyticsEvent } from '@/lib/database/persistence';
import { addJob, JobType } from '@/lib/jobs/queue';
import { log } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';
import { getSupabaseClient } from '@/lib/supabase-client';
import { retryWithBackoff } from '@/lib/error-recovery';

// In-memory fallback (will be migrated to database)
const events: TrainingEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    // Validate content type
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Check content-length for large payloads
    const contentLength = request.headers?.get('content-length');
    const MAX_PAYLOAD_SIZE = 500000; // 500KB limit
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: `Payload too large: ${contentLength} bytes (max ${MAX_PAYLOAD_SIZE})` },
        { status: 413 } // Payload Too Large
      );
    }

    let event: TrainingEvent;
    try {
      event = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Check payload size after parsing (in case content-length wasn't set)
    const payloadSize = JSON.stringify(event).length;
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: `Payload too large: ${payloadSize} bytes (max ${MAX_PAYLOAD_SIZE})` },
        { status: 413 } // Payload Too Large
      );
    }

    // Validate event structure
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      return NextResponse.json(
        { error: 'Invalid event data: must be an object' },
        { status: 400 }
      );
    }

    // Validate required fields - eventType is required
    // Check for null, undefined, or missing property
    if (!('eventType' in event) || event.eventType === null || event.eventType === undefined || !event.eventType) {
      return NextResponse.json(
        { error: 'Missing required field: eventType' },
        { status: 400 }
      );
    }

    const validEventTypes = ['scenario_start', 'scenario_complete', 'turn_submit', 'feedback_view', 'module_complete'];
    if (typeof event.eventType !== 'string' || !validEventTypes.includes(event.eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Validate data types
    if (event.userId !== undefined && typeof event.userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid userId: must be a string' },
        { status: 400 }
      );
    }

    if (event.scenarioId !== undefined && typeof event.scenarioId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid scenarioId: must be a string' },
        { status: 400 }
      );
    }

    if (event.score !== undefined && (typeof event.score !== 'number' || event.score < 0 || event.score > 100)) {
      return NextResponse.json(
        { error: 'Invalid score: must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    if (event.turnNumber !== undefined && (typeof event.turnNumber !== 'number' || event.turnNumber < 0)) {
      return NextResponse.json(
        { error: 'Invalid turnNumber: must be a non-negative number' },
        { status: 400 }
      );
    }

    // Sanitize event data
    const sanitizedEvent: TrainingEvent = {
      ...event,
      scenarioId: event.scenarioId ? sanitizeInput(event.scenarioId, 100) : undefined,
      userId: event.userId ? sanitizeInput(event.userId, 100) : undefined,
    };

    // Try to save to Supabase if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await retryWithBackoff(async () => {
          const { error } = await supabase
            .from('analytics_events')
            .insert({
              event_type: sanitizedEvent.eventType,
              user_id: sanitizedEvent.userId || null,
              scenario_id: sanitizedEvent.scenarioId || null,
              score: sanitizedEvent.score || null,
              turn_number: sanitizedEvent.turnNumber || null,
              metadata: sanitizedEvent.metadata || {},
              timestamp: sanitizedEvent.timestamp || new Date().toISOString(),
            });

          if (error) throw error;
        }, {
          maxRetries: 2,
          retryDelay: 500,
        });
      } catch (error) {
        console.error('Failed to save to Supabase, using in-memory fallback:', error);
        // Fall through to in-memory storage
      }
    }

    // Limit events array size (prevent memory issues)
    if (events.length > 10000) {
      events.splice(0, 1000); // Remove oldest 1000 events
    }

    events.push(sanitizedEvent);
    
    // Log without sensitive data
    console.log('Analytics event:', {
      eventType: sanitizedEvent.eventType,
      scenarioId: sanitizedEvent.scenarioId,
      timestamp: sanitizedEvent.timestamp,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Analytics API error', error instanceof Error ? error : new Error(String(error)));
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeStats = searchParams.get('includeStats') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Sanitize userId if provided
    const sanitizedUserId = userId ? sanitizeInput(userId, 100) : null;
    
    let userEvents: TrainingEvent[] = [];
    let totalEvents = 0;
    
    // Try to fetch from Supabase if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from('analytics_events')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(Math.min(limit, 1000));

        if (sanitizedUserId) {
          query = query.eq('user_id', sanitizedUserId);
        }

        const retryResult = await retryWithBackoff(async () => {
          const result = await query;
          if (result.error) throw result.error;
          return result;
        }, {
          maxRetries: 2,
          retryDelay: 500,
        });

        if (retryResult.success && retryResult.data) {
          const queryResult = retryResult.data as { data: any[] | null; error: any; count: number | null };
          if (queryResult.data && !queryResult.error) {
            userEvents = queryResult.data.map((row: any) => ({
              eventType: row.event_type,
              userId: row.user_id,
              scenarioId: row.scenario_id,
              score: row.score,
              turnNumber: row.turn_number,
              timestamp: row.timestamp,
              metadata: row.metadata || {},
            })) as TrainingEvent[];
            
            // Use count from query result if available, otherwise fetch separately
            if (queryResult.count !== null && queryResult.count !== undefined) {
              totalEvents = queryResult.count;
            } else {
              // Get total count
              const { count: totalCount } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true });
              totalEvents = totalCount || 0;
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch from Supabase, using in-memory fallback:', error);
        // Fall through to in-memory storage
      }
    }

    // Fallback to in-memory if Supabase failed or not available
    if (userEvents.length === 0) {
      const allEvents = sanitizedUserId 
        ? events.filter(e => e.userId === sanitizedUserId)
        : events;
      
      userEvents = allEvents.slice(-limit);
      totalEvents = allEvents.length;
    }

    // Calculate comprehensive stats if requested
    let stats = null;
    if (includeStats) {
      const completedScenarios = userEvents.filter(e => e.eventType === 'scenario_complete').length;
      const startedScenarios = userEvents.filter(e => e.eventType === 'scenario_start').length;
      const totalTurns = userEvents.filter(e => e.eventType === 'turn_submit').length;
      const scores = userEvents.filter(e => e.score !== undefined).map(e => e.score!);
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
        : 0;
      
      // Group by scenario
      const scenarioStats = new Map<string, {
        scenarioId: string;
        starts: number;
        completions: number;
        averageScore: number;
        totalTurns: number;
      }>();

      userEvents.forEach(event => {
        if (event.scenarioId) {
          if (!scenarioStats.has(event.scenarioId)) {
            scenarioStats.set(event.scenarioId, {
              scenarioId: event.scenarioId,
              starts: 0,
              completions: 0,
              averageScore: 0,
              totalTurns: 0,
            });
          }
          const stats = scenarioStats.get(event.scenarioId)!;
          if (event.eventType === 'scenario_start') stats.starts++;
          if (event.eventType === 'scenario_complete') stats.completions++;
          if (event.eventType === 'turn_submit') stats.totalTurns++;
          if (event.score !== undefined) {
            stats.averageScore = (stats.averageScore * (stats.completions - 1) + event.score) / stats.completions;
          }
        }
      });

      stats = {
        totalScenarios: completedScenarios,
        totalStarts: startedScenarios,
        totalTurns,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: startedScenarios > 0 ? (completedScenarios / startedScenarios) * 100 : 0,
        scenarioBreakdown: Array.from(scenarioStats.values()),
        eventTypeBreakdown: {
          scenario_start: userEvents.filter(e => e.eventType === 'scenario_start').length,
          scenario_complete: userEvents.filter(e => e.eventType === 'scenario_complete').length,
          turn_submit: userEvents.filter(e => e.eventType === 'turn_submit').length,
          feedback_view: userEvents.filter(e => e.eventType === 'feedback_view').length,
          module_complete: userEvents.filter(e => e.eventType === 'module_complete').length,
        },
      };
    }
    
    const response = NextResponse.json({ 
      events: userEvents,
      total: totalEvents,
      returned: userEvents.length,
      stats,
      source: supabase ? 'supabase' : 'memory',
    });

    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    response.headers.set('ETag', `"${Date.now()}-${userEvents.length}"`);
    
    return response;
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventIndex, userId, timestamp } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find and remove the event
    const sanitizedUserId = sanitizeInput(userId, 100);
    const eventTimestamp = timestamp ? new Date(timestamp) : null;

    // Remove from in-memory array
    const initialLength = events.length;
    const filteredEvents = events.filter((event, index) => {
      // Match by userId and timestamp if provided, or by index
      if (event.userId !== sanitizedUserId) return true;
      if (eventTimestamp && new Date(event.timestamp).getTime() !== eventTimestamp.getTime()) return true;
      if (typeof eventIndex === 'number' && index !== eventIndex) return true;
      return false;
    });

    // Only remove one event if timestamp matches, otherwise remove all matching
    if (eventTimestamp) {
      const indexToRemove = events.findIndex(e => 
        e.userId === sanitizedUserId && 
        new Date(e.timestamp).getTime() === eventTimestamp.getTime()
      );
      if (indexToRemove > -1) {
        events.splice(indexToRemove, 1);
      }
    } else {
      // Remove all events for this user (or just update the array)
      events.length = 0;
      events.push(...filteredEvents);
    }

    return NextResponse.json({ 
      success: true,
      deleted: initialLength - events.length,
    });
  } catch (error) {
    console.error('Delete analytics event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

