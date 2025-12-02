import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/live-session-manager';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, role, message, type } = body;

    if (!sessionId || !userId || !role || !message) {
      return NextResponse.json(
        { error: 'sessionId, userId, role, and message are required' },
        { status: 400 }
      );
    }

    const liveMessage = sessionManager.addMessage(sessionId, {
      sessionId: sanitizeInput(sessionId, 100),
      userId: sanitizeInput(userId, 100),
      role: role === 'rep' ? 'rep' : 'prospect',
      message: sanitizeInput(message, 5000),
      type: type || 'text',
    });

    return NextResponse.json({ message: liveMessage });
  } catch (error: any) {
    console.error('Message send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ messages: session.conversationHistory });
  } catch (error: any) {
    console.error('Messages get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get messages' },
      { status: 500 }
    );
  }
}

