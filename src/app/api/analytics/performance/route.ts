import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, path, sessionId, userId } = body;

    if (!metric || value === undefined || !path) {
      return NextResponse.json(
        { error: 'Metric, value, and path are required' },
        { status: 400 }
      );
    }

    // Validate metric type
    const validMetrics = ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'];
    if (!validMetrics.includes(metric)) {
      return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 });
    }

    // Store in database if available
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('performance_metrics').insert({
          metric,
          value: parseFloat(value),
          path,
          session_id: sessionId || null,
          user_id: userId || null,
          created_at: new Date().toISOString(),
        });
      }
    } catch (dbError) {
      // Log but don't fail - analytics should be non-blocking
      log('error', 'Failed to store performance metric in database', { error: dbError });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log('error', 'Error in performance tracking', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

