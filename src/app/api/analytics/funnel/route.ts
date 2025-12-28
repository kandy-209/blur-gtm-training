import { NextRequest, NextResponse } from 'next/server';
import { FunnelStep } from '@/lib/conversion-tracking';
import { getSupabaseClient } from '@/lib/supabase-client';
import { analytics } from '@/lib/analytics';
import { log } from '@/lib/logger';

// Note: retryWithBackoff not needed here as ConversionTracker handles retries

/**
 * API endpoint for tracking funnel progression
 * Tracks user journey through the sales training funnel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate funnel step structure
    if (!body.step || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: step, userId' },
        { status: 400 }
      );
    }

    const funnelStep: FunnelStep = {
      step: body.step,
      userId: body.userId,
      metadata: body.metadata || {},
    };

    // Track in analytics system
    try {
      await analytics.track({
        eventType: 'funnel_step' as any,
        metadata: {
          step: funnelStep.step,
          userId: funnelStep.userId,
          ...funnelStep.metadata,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (analyticsError) {
      log.error('Failed to track funnel step in analytics', { error: analyticsError });
      // Continue - analytics failures shouldn't block funnel tracking
    }

    // Store in database for funnel analysis (optional, non-blocking)
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('funnel_steps')
          .insert({
            step: funnelStep.step,
            user_id: funnelStep.userId,
            metadata: funnelStep.metadata,
            created_at: new Date().toISOString(),
          })
          .catch((dbError) => {
            // Non-blocking - log but don't fail
            log.warn('Failed to store funnel step in database', { error: dbError });
          });
      }
    } catch (dbError) {
      // Non-blocking - database storage is optional
      log.warn('Database storage failed for funnel step', { error: dbError });
    }

    return NextResponse.json({
      success: true,
      message: 'Funnel step tracked successfully',
    });
  } catch (error: any) {
    log.error('Error tracking funnel step', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to track funnel step' },
      { status: 500 }
    );
  }
}
