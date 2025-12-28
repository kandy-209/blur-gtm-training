import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, element, value, path, sessionId, userId } = body;

    if (!type || !path) {
      return NextResponse.json({ error: 'Type and path are required' }, { status: 400 });
    }

    // Store in database if available
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('engagement_events').insert({
          engagement_type: type,
          element: element || null,
          value: value || null,
          path,
          session_id: sessionId || null,
          user_id: userId || null,
          created_at: new Date().toISOString(),
        });
      }
    } catch (dbError) {
      // Log but don't fail - analytics should be non-blocking
      log('error', 'Failed to store engagement event in database', { error: dbError });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log('error', 'Error in engagement tracking', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

