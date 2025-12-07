/**
 * Anthropic Feedback API
 * Generate AI-powered feedback and ratings using Claude
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnthropicFeedbackGenerator } from '@/lib/anthropic/feedback-generator';
import { ComprehensiveDataCollector } from '@/lib/voice-coaching/data-collector';
import { userDataPersistence } from '@/lib/voice-coaching/user-data-persistence';

/**
 * POST /api/voice-coaching/anthropic-feedback
 * Generate comprehensive feedback using Anthropic API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type = 'comprehensive', currentMetrics, previousMetrics } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const generator = new AnthropicFeedbackGenerator();

    if (type === 'comprehensive') {
      // Generate comprehensive feedback
      const collector = new ComprehensiveDataCollector(userId);
      const userData = await collector.collectAllData();
      
      const feedback = await generator.generateComprehensiveFeedback(
        userData,
        currentMetrics
      );

      return NextResponse.json({
        success: true,
        feedback,
        generatedAt: new Date().toISOString(),
      });
    } else if (type === 'session') {
      // Generate session-specific feedback
      if (!currentMetrics) {
        return NextResponse.json(
          { error: 'currentMetrics is required for session feedback' },
          { status: 400 }
        );
      }

      // Get recent session history
      const sessions = await userDataPersistence.getUserSessions(userId, 10);
      const sessionHistory = sessions.map(s => ({
        sessionId: s.conversationId,
        date: s.sessionDate.toISOString(),
        sessionScore: 0, // Would calculate from metrics
        metrics: s.metrics,
      }));

      const feedback = await generator.generateSessionFeedback(
        currentMetrics,
        previousMetrics,
        sessionHistory
      );

      return NextResponse.json({
        success: true,
        feedback,
        generatedAt: new Date().toISOString(),
      });
    } else if (type === 'rating') {
      // Generate rating only
      if (!currentMetrics) {
        return NextResponse.json(
          { error: 'currentMetrics is required for rating' },
          { status: 400 }
        );
      }

      const profile = await userDataPersistence.getUserProfile(userId);
      const impactAnalysis = await userDataPersistence.getUserImpactAnalysis(userId);

      const rating = await generator.generateRating(currentMetrics, {
        profile: profile || undefined,
        impactAnalysis: impactAnalysis || undefined,
      });

      return NextResponse.json({
        success: true,
        rating,
        generatedAt: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use: comprehensive, session, or rating' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error generating Anthropic feedback:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate feedback',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/voice-coaching/anthropic-feedback
 * Get feedback with query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'comprehensive';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const generator = new AnthropicFeedbackGenerator();

    if (type === 'comprehensive') {
      const collector = new ComprehensiveDataCollector(userId);
      const userData = await collector.collectAllData();
      
      const feedback = await generator.generateComprehensiveFeedback(userData);

      return NextResponse.json({
        success: true,
        feedback,
        generatedAt: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: 'GET only supports comprehensive type. Use POST for session/rating.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error generating Anthropic feedback:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate feedback',
        message: error.message
      },
      { status: 500 }
    );
  }
}

