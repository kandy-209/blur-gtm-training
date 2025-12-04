/**
 * End Phone Call API
 */

import { NextRequest, NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_API_KEY || '';

export async function POST(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const { callId } = params;

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

    // End call via Vapi API
    const response = await fetch(`https://api.vapi.ai/call/${callId}/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to end call');
    }

    return NextResponse.json({
      success: true,
      message: 'Call ended successfully',
    });
  } catch (error: any) {
    console.error('End call error:', error);
    return NextResponse.json(
      { error: 'Failed to end call', message: error.message },
      { status: 500 }
    );
  }
}

