import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, title, referrer, sessionId, userId, viewport, userAgent } = body;

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Store in database if available
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('page_views').insert({
          path,
          title: title || null,
          referrer: referrer || null,
          session_id: sessionId || null,
          user_id: userId || null,
          viewport: viewport || null,
          user_agent: userAgent || null,
          created_at: new Date().toISOString(),
        });
      }
    } catch (dbError) {
      // Log but don't fail - analytics should be non-blocking
      log('error', 'Failed to store page view in database', { error: dbError });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log('error', 'Error in pageview tracking', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

