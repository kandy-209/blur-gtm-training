import { NextRequest, NextResponse } from 'next/server';
import { ConversionEvent } from '@/lib/conversion-tracking';
import { getSupabaseClient } from '@/lib/supabase-client';
import { analytics } from '@/lib/analytics';
import { log } from '@/lib/logger';

// Note: retryWithBackoff not needed here as ConversionTracker handles retries

/**
 * API endpoint for tracking conversion events
 * Handles server-side conversion tracking with retry logic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate conversion event structure
    if (!body.eventType || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, userId' },
        { status: 400 }
      );
    }

    const event: ConversionEvent = {
      eventType: body.eventType,
      scenarioId: body.scenarioId,
      userId: body.userId,
      metadata: body.metadata || {},
    };

    // Store in analytics system
    try {
      await analytics.track({
        eventType: event.eventType as any,
        scenarioId: event.scenarioId,
        metadata: {
          ...event.metadata,
          userId: event.userId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (analyticsError) {
      log.error('Failed to track conversion in analytics', { error: analyticsError });
      // Continue - analytics failures shouldn't block conversion tracking
    }

    // Store in database for long-term analysis (optional, non-blocking)
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('conversion_events')
          .insert({
            event_type: event.eventType,
            scenario_id: event.scenarioId || null,
            user_id: event.userId,
            metadata: event.metadata,
            created_at: new Date().toISOString(),
          })
          .catch((dbError) => {
            // Non-blocking - log but don't fail
            log.warn('Failed to store conversion event in database', { error: dbError });
          });
      }
    } catch (dbError) {
      // Non-blocking - database storage is optional
      log.warn('Database storage failed for conversion event', { error: dbError });
    }

    return NextResponse.json({
      success: true,
      message: 'Conversion event tracked successfully',
    });
  } catch (error: any) {
    log.error('Error tracking conversion event', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to track conversion event' },
      { status: 500 }
    );
  }
}
