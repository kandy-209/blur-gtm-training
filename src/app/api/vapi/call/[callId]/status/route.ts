/**
 * Get Call Status API
 * Server-side proxy to Vapi API (keeps API key secure)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const VAPI_API_KEY = process.env.VAPI_API_KEY || '';
    const { callId } = await params;

    if (!callId) {
      return NextResponse.json(
        { error: 'callId is required' },
        { status: 400 }
      );
    }

    if (!VAPI_API_KEY) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      );
    }

    // Get call status from Vapi API
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get call status');
    }

    const callData = await response.json();

    // Extract comprehensive call data
    return NextResponse.json({
      success: true,
      callId: callData.id,
      status: callData.status,
      duration: callData.duration || 0,
      transcript: callData.transcript || '',
      recordingUrl: callData.recordingUrl || null,
      // Additional Vapi data fields
      messages: callData.messages || [],
      startedAt: callData.startedAt || null,
      endedAt: callData.endedAt || null,
      cost: callData.cost || null,
      costBreakdown: callData.costBreakdown || null,
      metadata: callData.metadata || {},
      assistantId: callData.assistantId || null,
      customer: callData.customer || null,
      phoneNumberId: callData.phoneNumberId || null,
      // Analytics and insights
      summary: callData.summary || null,
      topics: callData.topics || [],
      sentiment: callData.sentiment || null,
      // Call quality metrics
      silenceDuration: callData.silenceDuration || 0,
      interruptions: callData.interruptions || 0,
      talkTime: callData.talkTime || 0,
      listenTime: callData.listenTime || 0,
      // Voice metrics (if available)
      voiceMetrics: callData.voiceMetrics || null,
      // Transcript segments with timestamps
      transcriptSegments: callData.transcriptSegments || [],
    });
  } catch (error: any) {
    console.error('Get call status error:', error);
    return NextResponse.json(
      { error: 'Failed to get call status', message: error.message },
      { status: 500 }
    );
  }
}

