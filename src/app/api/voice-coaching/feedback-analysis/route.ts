/**
 * Feedback Analysis API
 * Generate comprehensive feedback analysis using ML-like pattern matching
 */

import { NextRequest, NextResponse } from 'next/server';
import { FeedbackAnalyzer } from '@/lib/voice-coaching/feedback-analyzer';

/**
 * GET /api/voice-coaching/feedback-analysis
 * Get comprehensive feedback analysis for user
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

    const analyzer = new FeedbackAnalyzer(userId);
    const analysis = await analyzer.generateFeedbackAnalysis();

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error generating feedback analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate feedback analysis',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice-coaching/feedback-analysis
 * Generate analysis with custom parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, includePredictions = true } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const analyzer = new FeedbackAnalyzer(userId);
    const analysis = await analyzer.generateFeedbackAnalysis();

    return NextResponse.json({
      success: true,
      analysis,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating feedback analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate feedback analysis',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

