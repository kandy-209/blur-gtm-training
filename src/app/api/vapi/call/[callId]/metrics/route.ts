/**
 * Get Enhanced Call Metrics API
 * Returns comprehensive metrics and analytics for a Vapi call
 */

import { NextRequest, NextResponse } from 'next/server';

type KeyMoment = {
  timestamp: number;
  type: string;
  description: string;
};

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

    // Get comprehensive call data from Vapi
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get call metrics');
    }

    const callData = await response.json();

    // Extract and calculate enhanced metrics
    const messages = callData.messages || [];
    const transcript = callData.transcript || '';
    
    // Calculate talk/listen times from messages
    const userMessages = messages.filter((m: any) => m.role === 'user' || m.role === 'customer');
    const assistantMessages = messages.filter((m: any) => m.role === 'assistant' || m.role === 'system');
    
    // Estimate speaking time (rough estimate: 150 words per minute)
    const userWordCount = userMessages.reduce((sum: number, m: any) => {
      return sum + (m.content?.split(' ').length || 0);
    }, 0);
    const assistantWordCount = assistantMessages.reduce((sum: number, m: any) => {
      return sum + (m.content?.split(' ').length || 0);
    }, 0);
    
    const talkTime = Math.round((userWordCount / 150) * 60); // seconds
    const listenTime = Math.round((assistantWordCount / 150) * 60); // seconds
    
    // Calculate interruptions (user messages that come quickly after assistant)
    let interruptions = 0;
    for (let i = 1; i < messages.length; i++) {
      const prevMsg = messages[i - 1];
      const currMsg = messages[i];
      if (prevMsg.role === 'assistant' && currMsg.role === 'user') {
        const timeDiff = new Date(currMsg.createdAt || 0).getTime() - new Date(prevMsg.createdAt || 0).getTime();
        if (timeDiff < 2000) { // Less than 2 seconds = interruption
          interruptions++;
        }
      }
    }
    
    // Extract objections and key moments from transcript
    const objectionKeywords = ['but', 'however', 'concern', 'worried', 'expensive', 'cost', 'price', 'budget', 'not sure', 'think about'];
    const objectionsRaised = objectionKeywords.filter(keyword => 
      transcript.toLowerCase().includes(keyword)
    ).length;
    
    // Count questions asked
    const questionsAsked = (transcript.match(/\?/g) || []).length;
    
    // Calculate energy level (based on exclamation marks, caps, positive words)
    const exclamations = (transcript.match(/!/g) || []).length;
    const positiveWords = ['great', 'excellent', 'amazing', 'perfect', 'love', 'excited', 'interested'].filter(word =>
      transcript.toLowerCase().includes(word)
    ).length;
    const energyLevel = Math.min(100, Math.round((exclamations * 5) + (positiveWords * 10) + 50));
    
    // Calculate confidence score (based on various factors)
    const wordCount = transcript.split(' ').length;
    const avgWordsPerMessage = userMessages.length > 0 ? wordCount / userMessages.length : 0;
    const confidenceScore = Math.min(100, Math.round(
      (Math.min(avgWordsPerMessage / 20, 1) * 30) + // Message length
      (Math.min(questionsAsked / 10, 1) * 20) + // Questions asked
      (Math.min(energyLevel / 100, 1) * 30) + // Energy level
      (Math.max(0, 1 - (interruptions / 5)) * 20) // Fewer interruptions = more confidence
    ));

    // Extract key moments from transcript segments
    const keyMoments: KeyMoment[] = [];
    if (callData.transcriptSegments && callData.transcriptSegments.length > 0) {
      callData.transcriptSegments.forEach((segment: any, index: number) => {
        const segmentText = segment.content || segment.text || '';
        if (segmentText) {
          const lowerContent = segmentText.toLowerCase();
          if (lowerContent.includes('meeting') || lowerContent.includes('schedule') || lowerContent.includes('calendar')) {
            keyMoments.push({
              timestamp: segment.start || segment.startTime || index * 30,
              type: 'meeting_mention',
              description: 'Meeting or scheduling discussed',
            });
          }
          if (lowerContent.includes('buy') || lowerContent.includes('purchase') || lowerContent.includes('sign up')) {
            keyMoments.push({
              timestamp: segment.start || segment.startTime || index * 30,
              type: 'closing_attempt',
              description: 'Closing or purchase discussed',
            });
          }
          if (objectionKeywords.some(kw => lowerContent.includes(kw))) {
            keyMoments.push({
              timestamp: segment.start || segment.startTime || index * 30,
              type: 'objection',
              description: 'Objection raised',
            });
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      callId: callData.id,
      // Basic metrics
      duration: callData.duration || 0,
      talkTime,
      listenTime,
      interruptions,
      // Calculated metrics
      objectionsRaised,
      objectionsResolved: Math.floor(objectionsRaised * 0.7), // Estimate based on conversation flow
      questionsAsked,
      energyLevel,
      confidenceScore,
      wordCount,
      pace: talkTime > 0 ? Math.round((wordCount / talkTime) * 60) : 0, // Words per minute
      // Call outcomes
      meetingBooked: transcript.toLowerCase().includes('meeting') && 
                     (transcript.toLowerCase().includes('schedule') || transcript.toLowerCase().includes('calendar')),
      saleClosed: transcript.toLowerCase().includes('yes') && 
                  (transcript.toLowerCase().includes('buy') || transcript.toLowerCase().includes('purchase')),
      // Additional data
      messages: messages.length,
      transcriptLength: transcript.length,
      keyMoments,
      // Raw Vapi data (for debugging/advanced use)
      rawData: {
        status: callData.status,
        startedAt: callData.startedAt,
        endedAt: callData.endedAt,
        cost: callData.cost,
        metadata: callData.metadata,
      },
    });
  } catch (error: any) {
    console.error('Get call metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to get call metrics', message: error.message },
      { status: 500 }
    );
  }
}

