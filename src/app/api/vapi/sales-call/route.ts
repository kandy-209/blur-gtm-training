/**
 * Sales Call API - Vercel + Modal Integration
 * Routes call initiation to Vapi, analysis to Modal
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';
import { scenarios } from '@/data/scenarios';

const MODAL_FUNCTION_URL = process.env.MODAL_FUNCTION_URL || '';
const VAPI_API_KEY = process.env.VAPI_API_KEY || '';

/**
 * POST /api/vapi/sales-call
 * Initiate sales training call
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, userId, scenarioId, trainingMode = 'practice' } = body;

    // Validate input
    if (!phoneNumber || !userId || !scenarioId) {
      return NextResponse.json(
        { error: 'phoneNumber, userId, and scenarioId are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const sanitizedPhone = sanitizeInput(phoneNumber, 20);
    if (!/^\+?[1-9]\d{1,14}$/.test(sanitizedPhone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate scenario exists
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    if (!VAPI_API_KEY) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      );
    }

    // Create Vapi assistant with scenario context
    const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Sales Training - ${scenario.persona.name}`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(scenario),
            },
          ],
        },
        voice: {
          provider: 'elevenlabs',
          voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
        },
        firstMessage: scenario.objection_statement,
        recordingEnabled: true,
        transcriptionEnabled: true,
      }),
    });

    if (!assistantResponse.ok) {
      const error = await assistantResponse.json();
      throw new Error(error.message || 'Failed to create assistant');
    }

    const assistant = await assistantResponse.json();

    // Initiate call
    const callResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId: sanitizedPhone.replace(/\D/g, ''),
        customer: {
          number: sanitizedPhone.replace(/\D/g, ''),
        },
        assistantId: assistant.id,
        metadata: {
          userId,
          scenarioId,
          trainingMode,
          type: 'sales-training',
        },
      }),
    });

    if (!callResponse.ok) {
      const error = await callResponse.json();
      throw new Error(error.message || 'Failed to initiate call');
    }

    const callData = await callResponse.json();

    return NextResponse.json({
      success: true,
      callId: callData.id,
      status: callData.status,
      scenario: {
        id: scenario.id,
        persona: scenario.persona.name,
        objectionCategory: scenario.objection_category,
      },
    });
  } catch (error: any) {
    console.error('Sales call initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vapi/sales-call/[callId]/analysis
 * Get call analysis from Modal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    const scenarioId = searchParams.get('scenarioId');
    const transcript = searchParams.get('transcript'); // Optional

    if (!callId || !scenarioId) {
      return NextResponse.json(
        { error: 'callId and scenarioId are required' },
        { status: 400 }
      );
    }

    if (!MODAL_FUNCTION_URL) {
      return NextResponse.json(
        { error: 'Modal function URL not configured' },
        { status: 500 }
      );
    }

    // Call Modal function for analysis
    const modalResponse = await fetch(MODAL_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_id: callId,
        scenario_id: scenarioId,
        transcript: transcript || undefined,
      }),
    });

    if (!modalResponse.ok) {
      const error = await modalResponse.json();
      throw new Error(error.error || 'Failed to analyze call');
    }

    const analysis = await modalResponse.json();

    return NextResponse.json({
      success: true,
      metrics: analysis.metrics,
      analysis: analysis.analysis,
      processedAt: analysis.processed_at,
    });
  } catch (error: any) {
    console.error('Call analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze call', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Build system prompt for Vapi assistant
 */
function buildSystemPrompt(scenario: any): string {
  return `You are ${scenario.persona.name}, a real prospect evaluating Cursor Enterprise.

PERSONA DETAILS:
- Current Solution: ${scenario.persona.currentSolution}
- Primary Goal: ${scenario.persona.primaryGoal}
- Skepticism: ${scenario.persona.skepticism}
- Tone: ${scenario.persona.tone}

YOUR ROLE:
You are on a phone call with a sales rep selling Cursor Enterprise. This is a training call.

CONVERSATION FLOW:
1. Start with the objection: "${scenario.objection_statement}"
2. Raise concerns naturally as the conversation progresses
3. Ask follow-up questions about Enterprise features, pricing, security
4. Show increasing interest if the rep addresses your concerns well
5. Progress towards either:
   - MEETING_BOOKED: Agree to a specific meeting time/date
   - ENTERPRISE_SALE: Commit to purchasing Cursor Enterprise

KEY POINTS TO DISCUSS:
${scenario.keyPoints.map((p: string) => `- ${p}`).join('\n')}

PHONE CALL BEHAVIOR:
- Speak naturally and conversationally
- Allow pauses for the rep to respond
- Don't interrupt unless the rep is going off-topic
- Show engagement through your tone
- Ask clarifying questions when needed

END CONDITIONS:
- Only agree to a meeting if the rep successfully books it with a specific time
- Only commit to purchase if the rep successfully closes
- Keep the conversation going until one of these outcomes

Remember: This is a training call. Help the sales rep learn by being realistic but fair.`;
}

