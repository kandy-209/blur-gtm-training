import { LiveSession, LiveMessage, LobbyUser, MatchRequest } from '@/types/live-roleplay';

// In-memory session storage (in production, use Redis or database)
class LiveSessionManager {
  private sessions: Map<string, LiveSession> = new Map();
  private lobby: Map<string, LobbyUser> = new Map();
  private userToSession: Map<string, string> = new Map(); // userId -> sessionId

  createSession(repUserId: string, prospectUserId: string, scenarioId: string): LiveSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: LiveSession = {
      id: sessionId,
      scenarioId,
      repUserId,
      prospectUserId,
      status: 'active',
      createdAt: new Date(),
      startedAt: new Date(),
      conversationHistory: [],
      repRole: 'rep',
      prospectRole: 'prospect',
    };

    this.sessions.set(sessionId, session);
    this.userToSession.set(repUserId, sessionId);
    this.userToSession.set(prospectUserId, sessionId);

    // Remove users from lobby
    this.lobby.delete(repUserId);
    this.lobby.delete(prospectUserId);

    return session;
  }

  getSession(sessionId: string): LiveSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByUserId(userId: string): LiveSession | undefined {
    const sessionId = this.userToSession.get(userId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  addMessage(sessionId: string, message: Omit<LiveMessage, 'id' | 'timestamp'>): LiveMessage {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const liveMessage: LiveMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...message,
    };

    session.conversationHistory.push(liveMessage);
    return liveMessage;
  }

  joinLobby(request: MatchRequest): LobbyUser {
    const user: LobbyUser = {
      userId: request.userId,
      username: request.username,
      preferredRole: request.preferredRole,
      scenarioId: request.scenarioId,
      status: 'waiting',
      joinedAt: new Date(),
    };

    this.lobby.set(request.userId, user);
    return user;
  }

  leaveLobby(userId: string): void {
    this.lobby.delete(userId);
  }

  findMatch(userId: string): LobbyUser | null {
    const user = this.lobby.get(userId);
    if (!user) return null;

    // Find compatible match
    const lobbyEntries = Array.from(this.lobby.entries());
    for (const [otherUserId, otherUser] of lobbyEntries) {
      if (otherUserId === userId) continue;
      if (otherUser.status !== 'waiting') continue;

      // Check role compatibility
      const rolesCompatible =
        (user.preferredRole === 'any' || otherUser.preferredRole === 'any') ||
        (user.preferredRole !== otherUser.preferredRole);

      // Check scenario compatibility
      const scenariosCompatible =
        !user.scenarioId || !otherUser.scenarioId || user.scenarioId === otherUser.scenarioId;

      if (rolesCompatible && scenariosCompatible) {
        return otherUser;
      }
    }

    return null;
  }

  completeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.completedAt = new Date();
      
      // Clean up user mappings
      this.userToSession.delete(session.repUserId);
      this.userToSession.delete(session.prospectUserId);
    }
  }

  cancelSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'cancelled';
      
      // Clean up user mappings
      this.userToSession.delete(session.repUserId);
      this.userToSession.delete(session.prospectUserId);
    }
  }

  getLobbyUsers(): LobbyUser[] {
    return Array.from(this.lobby.values());
  }

  cleanup(): void {
    // Remove old completed sessions (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const sessionEntries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of sessionEntries) {
      if (
        (session.status === 'completed' || session.status === 'cancelled') &&
        session.completedAt &&
        session.completedAt.getTime() < oneHourAgo
      ) {
        this.sessions.delete(sessionId);
      }
    }

    // Remove stale lobby entries (older than 30 minutes)
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    const lobbyEntries = Array.from(this.lobby.entries());
    for (const [userId, user] of lobbyEntries) {
      if (user.joinedAt.getTime() < thirtyMinutesAgo) {
        this.lobby.delete(userId);
      }
    }
  }
}

export const sessionManager = new LiveSessionManager();

// Cleanup old sessions periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    sessionManager.cleanup();
  }, 5 * 60 * 1000); // Every 5 minutes
}

