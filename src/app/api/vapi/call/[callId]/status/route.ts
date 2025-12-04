/**
 * Get Call Status API
 * Server-side proxy to Vapi API (keeps API key secure)
 */

import { NextRequest, NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_API_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
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

    return NextResponse.json({
      success: true,
      callId: callData.id,
      status: callData.status,
      duration: callData.duration || 0,
      transcript: callData.transcript || '',
      recordingUrl: callData.recordingUrl || null,
    });
  } catch (error: any) {
    console.error('Get call status error:', error);
    return NextResponse.json(
      { error: 'Failed to get call status', message: error.message },
      { status: 500 }
    );
  }
}

