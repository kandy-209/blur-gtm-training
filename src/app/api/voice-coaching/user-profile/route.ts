/**
 * User Profile API
 * Get and update user voice coaching profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { userDataPersistence } from '@/lib/voice-coaching/user-data-persistence';
import { UserVoiceModel } from '@/lib/voice-coaching/user-model';

/**
 * GET /api/voice-coaching/user-profile
 * Get user's voice coaching profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const profile = await userDataPersistence.getUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: null,
        message: 'No profile found. Complete a session to create your profile.'
      });
    }

    // Get impact analysis
    const impactAnalysis = await userDataPersistence.getUserImpactAnalysis(userId);

    return NextResponse.json({
      success: true,
      profile,
      impactAnalysis,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice-coaching/user-profile
 * Update or create user profile from session data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, conversationId, metrics, feedback, suggestions, duration } = body;

    if (!userId || !conversationId || !metrics) {
      return NextResponse.json(
        { error: 'userId, conversationId, and metrics are required' },
        { status: 400 }
      );
    }

    // Save session data
    await userDataPersistence.saveSession({
      userId,
      conversationId,
      sessionDate: new Date(),
      metrics,
      feedback: feedback || [],
      suggestions: suggestions || [],
      duration: duration || 0,
    });

    // Get all user sessions to build profile
    const sessions = await userDataPersistence.getUserSessions(userId, 100);
    
    if (sessions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Session saved. Complete more sessions to generate profile.'
      });
    }

    // Build user model
    const userModel = new UserVoiceModel(userId);
    sessions.forEach(session => {
      userModel.addSession(session.metrics, session.feedback, session.suggestions);
    });

    // Generate profile and impact analysis
    const profile = userModel.getUserProfile();
    const impactAnalysis = userModel.generateImpactAnalysis();

    // Save profile and impact analysis
    await userDataPersistence.saveUserProfile(profile);
    await userDataPersistence.saveImpactAnalysis(userId, impactAnalysis);

    return NextResponse.json({
      success: true,
      profile,
      impactAnalysis,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

