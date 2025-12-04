import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';

const supabase = getSupabaseClient();

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
    const includeStats = searchParams.get('includeStats') === 'true';

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
          .from('user_profiles')
          .select('*')
          .eq('id', sanitizedUserId)
          .single();

        if (error) throw error;
        return data!;
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error || !result.data) {
      throw result.error || new Error('Failed to fetch profile');
    }

    let profile: any = result.data;

    // Include stats if requested
    if (includeStats) {
      try {
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', sanitizedUserId)
          .single();

        if (stats) {
          profile = {
            ...profile,
            stats,
          };
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    return NextResponse.json({ 
      profile,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
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
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map frontend fields to database fields
    if (updates.username !== undefined) updateData.username = sanitizeInput(updates.username, 30);
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName ? sanitizeInput(updates.fullName, 100) : null;
    if (updates.roleAtCursor !== undefined) updateData.role_at_cursor = sanitizeInput(updates.roleAtCursor, 100);
    if (updates.jobTitle !== undefined) updateData.job_title = sanitizeInput(updates.jobTitle, 100);
    if (updates.department !== undefined) updateData.department = updates.department ? sanitizeInput(updates.department, 100) : null;
    if (updates.bio !== undefined) updateData.bio = updates.bio ? sanitizeInput(updates.bio, 1000) : null;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl ? sanitizeInput(updates.avatarUrl, 500) : null;
    if (updates.onboardingCompleted !== undefined) updateData.onboarding_completed = updates.onboardingCompleted;
    if (updates.onboardingData !== undefined) updateData.onboarding_data = updates.onboardingData;
    if (updates.skillLevel !== undefined) updateData.skill_level = updates.skillLevel;
    if (updates.timezone !== undefined) updateData.timezone = sanitizeInput(updates.timezone, 50);
    if (updates.locale !== undefined) updateData.locale = sanitizeInput(updates.locale, 10);
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', sanitizedUserId)
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
      throw result.error || new Error('Failed to update profile');
    }

    // Log profile update activity
    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: sanitizedUserId,
          activity_type: 'profile_update',
          activity_data: {
            updated_fields: Object.keys(updates),
          },
        });
    } catch (activityError) {
      console.warn('Failed to log profile update activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      profile: result.data,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

