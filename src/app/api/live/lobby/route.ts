import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/live-session-manager';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, preferredRole, scenarioId } = body;

    if (!userId || !username) {
      return NextResponse.json(
        { error: 'userId and username are required' },
        { status: 400 }
      );
    }

    const user = sessionManager.joinLobby({
      userId: sanitizeInput(userId, 100),
      username: sanitizeInput(username, 100),
      preferredRole: preferredRole || 'any',
      scenarioId: scenarioId ? sanitizeInput(scenarioId, 100) : undefined,
    });

    // Try to find a match
    const match = sessionManager.findMatch(userId);

    return NextResponse.json({
      user,
      match: match || null,
    });
  } catch (error: any) {
    console.error('Lobby join error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join lobby' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    sessionManager.leaveLobby(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lobby leave error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to leave lobby' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const users = sessionManager.getLobbyUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Lobby list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get lobby users' },
      { status: 500 }
    );
  }
}

