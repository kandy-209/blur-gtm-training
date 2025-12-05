/**
 * Get Call Transcript with Segments API
 * Returns detailed transcript with timestamps and speaker identification
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

    // Get call data from Vapi
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get call transcript');
    }

    const callData = await response.json();

    // Extract transcript and messages
    const transcript = callData.transcript || '';
    const messages = callData.messages || [];
    const transcriptSegments = callData.transcriptSegments || [];

    // Process messages into structured format
    const structuredMessages = messages.map((msg: any, index: number) => ({
      id: msg.id || `msg-${index}`,
      role: msg.role === 'user' ? 'rep' : msg.role === 'assistant' ? 'prospect' : msg.role,
      content: msg.content || '',
      timestamp: msg.createdAt || msg.timestamp || null,
      duration: msg.duration || null,
      confidence: msg.confidence || null,
    }));

    // Process transcript segments if available
    const segments = transcriptSegments.map((segment: any, index: number) => ({
      id: segment.id || `segment-${index}`,
      speaker: segment.speaker || segment.role || 'unknown',
      text: segment.text || segment.content || '',
      start: segment.start || segment.startTime || null,
      end: segment.end || segment.endTime || null,
      confidence: segment.confidence || null,
    }));

    // Calculate conversation statistics
    const repMessages = structuredMessages.filter(m => m.role === 'rep');
    const prospectMessages = structuredMessages.filter(m => m.role === 'prospect');
    
    const repWordCount = repMessages.reduce((sum, m) => sum + (m.content.split(' ').length || 0), 0);
    const prospectWordCount = prospectMessages.reduce((sum, m) => sum + (m.content.split(' ').length || 0), 0);
    
    const repQuestions = repMessages.filter(m => m.content.includes('?')).length;
    const prospectQuestions = prospectMessages.filter(m => m.content.includes('?')).length;

    return NextResponse.json({
      success: true,
      callId: callData.id,
      // Full transcript
      transcript,
      // Structured messages
      messages: structuredMessages,
      messageCount: structuredMessages.length,
      // Transcript segments with timestamps
      segments,
      segmentCount: segments.length,
      // Conversation statistics
      statistics: {
        repMessages: repMessages.length,
        prospectMessages: prospectMessages.length,
        repWordCount,
        prospectWordCount,
        totalWordCount: repWordCount + prospectWordCount,
        repQuestions,
        prospectQuestions,
        totalQuestions: repQuestions + prospectQuestions,
        talkToListenRatio: repWordCount + prospectWordCount > 0 
          ? repWordCount / (repWordCount + prospectWordCount) 
          : 0,
      },
      // Metadata
      duration: callData.duration || 0,
      startedAt: callData.startedAt || null,
      endedAt: callData.endedAt || null,
    });
  } catch (error: any) {
    console.error('Get call transcript error:', error);
    return NextResponse.json(
      { error: 'Failed to get call transcript', message: error.message },
      { status: 500 }
    );
  }
}

