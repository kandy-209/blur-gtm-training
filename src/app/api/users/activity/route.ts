import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, activityType, activityData, ipAddress, userAgent } = body;

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'userId and activityType are required' },
        { status: 400 }
      );
    }

    const validActivityTypes = [
      'signup', 'login', 'logout', 'scenario_start', 'scenario_complete',
      'session_start', 'session_complete', 'profile_update', 'preference_update',
      'rating_given', 'rating_received', 'achievement_unlocked'
    ];

    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        { error: `Invalid activityType. Must be one of: ${validActivityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);
    const sanitizedIpAddress = ipAddress ? sanitizeInput(ipAddress, 45) : null;
    const sanitizedUserAgent = userAgent ? sanitizeInput(userAgent, 500) : null;

    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('user_activity')
          .insert({
            user_id: sanitizedUserId,
            activity_type: activityType,
            activity_data: activityData || {},
            ip_address: sanitizedIpAddress,
            user_agent: sanitizedUserAgent,
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error) {
      throw result.error || new Error('Failed to log activity');
    }

    return NextResponse.json({
      success: true,
      activity: result.data,
    });
  } catch (error: any) {
    console.error('Log activity error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const activityType = searchParams.get('activityType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);

    let query = supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', sanitizedUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (activityType) {
      query = query.eq('activity_type', sanitizeInput(activityType, 50));
    }

    const result = await retryWithBackoff(
      async () => {
        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error) {
      throw result.error || new Error('Failed to fetch activity');
    }

    // result.data contains { data: [], count: number }
    const resultData = result.data as { data: any[]; count: number } | undefined;

    return NextResponse.json({
      activities: resultData?.data || [],
      total: resultData?.count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

