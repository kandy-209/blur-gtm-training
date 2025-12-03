import { NextRequest, NextResponse } from 'next/server';
import { FeedbackAgent } from '@/infrastructure/agents/feedback-agent';
import { ConversationMessage, ConversationMetrics } from '@/domain/entities/discovery-call';
import { calculateConversationMetrics, ConversationMessage as MetricsMessage } from '@/lib/conversation-metrics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationHistory, salesMethodology } = body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'conversationHistory is required and must be an array' },
        { status: 400 }
      );
    }

    // Convert conversation history to the format expected by FeedbackAgent
    const messages: ConversationMessage[] = conversationHistory.map((msg: any) => ({
      role: msg.role === 'rep' ? 'rep' : 'prospect',
      message: msg.message,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));

    // Convert to metrics format for calculation
    const metricsMessages: MetricsMessage[] = conversationHistory.map((msg: any) => ({
      role: msg.role === 'rep' ? 'rep' : 'agent',
      message: msg.message,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));

    // Calculate metrics
    const calculatedMetrics = calculateConversationMetrics(metricsMessages);
    const metrics: ConversationMetrics = {
      talkToListenRatio: {
        repSpeakingTime: calculatedMetrics.talkToListenRatio.repWordCount * 0.5, // Estimate speaking time
        prospectSpeakingTime: calculatedMetrics.talkToListenRatio.prospectWordCount * 0.5,
        totalTime: (calculatedMetrics.talkToListenRatio.repWordCount + calculatedMetrics.talkToListenRatio.prospectWordCount) * 0.5,
        ratio: calculatedMetrics.talkToListenRatio.ratio,
        idealRange: { min: 0.4, max: 0.6 },
        status: calculatedMetrics.talkToListenRatio.status,
      },
      questions: {
        repQuestions: calculatedMetrics.questions.repQuestions,
        prospectQuestions: calculatedMetrics.questions.prospectQuestions,
        discoveryQuestions: calculatedMetrics.questions.discoveryQuestions,
        closedQuestions: calculatedMetrics.questions.repQuestions - calculatedMetrics.questions.discoveryQuestions,
        questionRatio: calculatedMetrics.questions.repQuestions / Math.max(calculatedMetrics.conversationFlow.repTurns, 1),
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

    // Generate feedback
    const feedbackAgent = new FeedbackAgent();
    const feedback = await feedbackAgent.analyzeConversation(
      messages,
      metrics,
      salesMethodology || null
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Feedback analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze feedback' },
      { status: 500 }
    );
  }
}

