import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/live-session-manager';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repUserId, prospectUserId, scenarioId } = body;

    if (!repUserId || !prospectUserId || !scenarioId) {
      return NextResponse.json(
        { error: 'repUserId, prospectUserId, and scenarioId are required' },
        { status: 400 }
      );
    }

    const session = sessionManager.createSession(
      sanitizeInput(repUserId, 100),
      sanitizeInput(prospectUserId, 100),
      sanitizeInput(scenarioId, 100)
    );

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (sessionId) {
      const session = sessionManager.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    if (userId) {
      const session = sessionManager.getSessionByUserId(userId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    return NextResponse.json(
      { error: 'sessionId or userId is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Session get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get session' },
      { status: 500 }
    );
  }
}

