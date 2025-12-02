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

    // Try to find a match for this user
    let match = sessionManager.findMatch(userId);
    
    // If no match found, check if any other waiting users can match with this user
    // This ensures bidirectional matching
    if (!match) {
      const allLobbyUsers = sessionManager.getLobbyUsers();
      for (const otherUser of allLobbyUsers) {
        if (otherUser.userId === userId || otherUser.status !== 'waiting') continue;
        
        // Check if this user matches with the other user
        const rolesCompatible =
          (user.preferredRole === 'any' || otherUser.preferredRole === 'any') ||
          (user.preferredRole !== otherUser.preferredRole);
        
        const scenariosCompatible =
          !user.scenarioId || !otherUser.scenarioId || user.scenarioId === otherUser.scenarioId;
        
        if (rolesCompatible && scenariosCompatible) {
          match = otherUser;
          break;
        }
      }
    }

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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const users = sessionManager.getLobbyUsers();
    
    // If userId is provided, also check if they have an active session
    let activeSessionId = null;
    if (userId) {
      activeSessionId = sessionManager.getUserSessionId(userId);
    }
    
    return NextResponse.json({ 
      users,
      activeSessionId: activeSessionId || null,
    });
  } catch (error: any) {
    console.error('Lobby list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get lobby users' },
      { status: 500 }
    );
  }
}

