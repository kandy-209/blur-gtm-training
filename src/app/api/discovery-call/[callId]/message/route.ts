/**
 * Send Message in Discovery Call API
 * POST /api/discovery-call/[callId]/message
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiscoveryCallRepository } from '@/infrastructure/repositories/discovery-call.repository';
import { rateLimit } from '@/lib/security';

const SendMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});

export async function POST(
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

    // Validate input
    const body = await request.json();
    const validated = SendMessageSchema.parse(body);

    // Get discovery call
    const repository = new DiscoveryCallRepository();
    const discoveryCall = await repository.findById(params.callId);

    if (!discoveryCall) {
      return NextResponse.json(
        { error: 'Discovery call not found' },
        { status: 404 }
      );
    }

    if (!discoveryCall.isActive) {
      return NextResponse.json(
        { error: 'Discovery call is not active' },
        { status: 400 }
      );
    }

    // Add rep message
    discoveryCall.addMessage('rep', validated.message);

    // Generate prospect response using conversation agent
    const { ConversationAgent } = await import('@/infrastructure/agents/conversation-agent');
    const conversationAgent = new ConversationAgent();
    
    const prospectResponse = await conversationAgent.generateResponse({
      persona: discoveryCall.persona,
      conversationHistory: [...discoveryCall.conversationHistory],
      settings: discoveryCall.settings,
      repMessage: validated.message,
    });

    // Add prospect message
    discoveryCall.addMessage('prospect', prospectResponse.message);

    // Calculate metrics
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

    // Update metrics
    discoveryCall.updateMetrics(metrics);

    // Save call
    await repository.save(discoveryCall);

    // Return response
    return NextResponse.json({
      success: true,
      prospectResponse: prospectResponse.message,
      metrics,
      tone: prospectResponse.tone,
      objections: prospectResponse.objections,
      buyingSignals: prospectResponse.buyingSignals,
    });
  } catch (error) {
    console.error('Send message error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

