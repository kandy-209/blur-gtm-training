/**
 * Get Feedback for Discovery Call API
 * GET /api/discovery-call/[callId]/feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryCallRepository } from '@/infrastructure/repositories/discovery-call.repository';
import { FeedbackAgent } from '@/infrastructure/agents/feedback-agent';
import { rateLimit } from '@/lib/security';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ callId: string }> }
) {
  try {
    // Await params (Next.js 15+)
    const params = await context.params;

    // Rate limiting
    const rateLimitResult = rateLimit(request);
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get discovery call
    const repository = new DiscoveryCallRepository();
    const discoveryCall = await repository.findById(params.callId);

    if (!discoveryCall) {
      return NextResponse.json(
        { error: 'Discovery call not found' },
        { status: 404 }
      );
    }

    // Generate feedback
    const feedbackAgent = new FeedbackAgent();
    
    // Calculate basic metrics if not available
    let metrics = discoveryCall.metrics;
    if (!metrics) {
      // Calculate basic metrics manually
      const repMessages = discoveryCall.conversationHistory.filter(m => m.role === 'rep');
      const prospectMessages = discoveryCall.conversationHistory.filter(m => m.role === 'prospect');
      const repTime = repMessages.length * 30;
      const prospectTime = prospectMessages.length * 30;
      const totalTime = repTime + prospectTime;
      const ratio = totalTime > 0 ? repTime / totalTime : 0;

      metrics = {
        talkToListenRatio: {
          repSpeakingTime: repTime,
          prospectSpeakingTime: prospectTime,
          totalTime,
          ratio,
          idealRange: { min: 0.4, max: 0.6 },
          status: ratio < 0.4 ? 'rep_too_quiet' : ratio > 0.7 ? 'rep_dominating' : 'balanced',
        },
        questions: {
          repQuestions: repMessages.filter(m => m.message.includes('?')).length,
          prospectQuestions: prospectMessages.filter(m => m.message.includes('?')).length,
          discoveryQuestions: 0,
          closedQuestions: 0,
          questionRatio: 0,
        },
        interruptions: {
          repInterrupted: 0,
          prospectInterrupted: 0,
          interruptionRate: 0,
        },
        monologues: {
          repMonologues: 0,
          prospectMonologues: 0,
          longestRepMonologue: 0,
        },
      };
    }

    const feedback = await feedbackAgent.analyzeConversation(
      [...discoveryCall.conversationHistory],
      metrics,
      discoveryCall.settings.salesMethodology
    );

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

