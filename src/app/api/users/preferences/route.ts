import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);

    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', sanitizedUserId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          throw error;
        }

        return { data, error };
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error) {
      // Return default preferences if not found
      return NextResponse.json({
        notifications: {
          email: true,
          push: false,
          session_reminders: true,
          achievements: true,
          leaderboard_updates: true,
        },
        display_preferences: {
          theme: 'light',
          font_size: 'medium',
          high_contrast: false,
          reduced_motion: false,
        },
        training_preferences: {
          difficulty: 'adaptive',
          scenario_types: [],
          voice_enabled: false,
          auto_feedback: true,
        },
        privacy_settings: {
          profile_visible: true,
          show_stats: true,
          allow_ratings: true,
        },
      });
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);

    // Validate preferences structure
    const validKeys = ['notifications', 'display_preferences', 'training_preferences', 'privacy_settings'];
    const updates: any = { updated_at: new Date().toISOString() };

    for (const key of validKeys) {
      if (preferences[key]) {
        updates[key] = preferences[key];
      }
    }

    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: sanitizedUserId,
            ...updates,
          }, {
            onConflict: 'user_id',
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
      throw result.error || new Error('Failed to update preferences');
    }

    return NextResponse.json({
      success: true,
      preferences: result.data,
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

