import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';
import { log } from '@/lib/logger';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response';

const supabase = getSupabaseClient();

export async function POST(request: NextRequest) {
  let sanitizedUserId: string | undefined;
  
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

    sanitizedUserId = sanitizeInput(userId, 100);
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
        return data!; // Return data directly, not wrapped in object
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error || !result.data) {
      throw result.error || new Error('Failed to log activity');
    }

    return NextResponse.json({
      success: true,
      activity: result.data,
    });
  } catch (error: any) {
    log.error('Log activity error', error instanceof Error ? error : new Error(String(error)), {
      userId: sanitizedUserId,
    });
    return errorResponse(error, {
      status: 500,
      message: 'Failed to log user activity',
    });
  }
}

export async function GET(request: NextRequest) {
  let sanitizedUserId: string | undefined;
  
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

    sanitizedUserId = sanitizeInput(userId, 100);

    let query = supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', sanitizedUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (activityType) {
      query = query.eq('activity_type', sanitizeInput(activityType, 50));
    }

    // Get count separately
    const { count: countResult } = await supabase
      .from('user_activity')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', sanitizedUserId);
    const total = countResult || 0;

    const result = await retryWithBackoff(
      async () => {
        const queryResult = await query;
        if (queryResult.error) throw queryResult.error;
        return queryResult.data || [];
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error || !result.data) {
      throw result.error || new Error('Failed to fetch activity');
    }

    const activities = result.data || [];
    const page = Math.floor(offset / limit) + 1;

    return paginatedResponse(activities, {
      total,
      page,
      limit,
    });
  } catch (error: any) {
    log.error('Get activity error', error instanceof Error ? error : new Error(String(error)), {
      userId: sanitizedUserId,
    });
    return errorResponse(error, {
      status: 500,
      message: 'Failed to fetch user activity',
    });
  }
}

