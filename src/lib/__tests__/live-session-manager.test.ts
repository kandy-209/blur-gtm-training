import { sessionManager } from '@/lib/live-session-manager';

describe('LiveSessionManager', () => {
  beforeEach(() => {
    // Clear all sessions and lobby
    (sessionManager as any).sessions.clear();
    (sessionManager as any).lobby.clear();
    (sessionManager as any).userToSession.clear();
  });

  describe('createSession', () => {
    it('should create a session successfully', () => {
      const session = sessionManager.createSession(
        'user_1',
        'user_2',
        'scenario_1'
      );

      expect(session).toBeDefined();
      expect(session.repUserId).toBe('user_1');
      expect(session.prospectUserId).toBe('user_2');
      expect(session.scenarioId).toBe('scenario_1');
      expect(session.status).toBe('active');
    });

    it('should remove users from lobby after creating session', () => {
      sessionManager.joinLobby({
        userId: 'user_1',
        username: 'user1',
        preferredRole: 'rep',
      });

      sessionManager.joinLobby({
        userId: 'user_2',
        username: 'user2',
        preferredRole: 'prospect',
      });

      const session = sessionManager.createSession('user_1', 'user_2', 'scenario_1');

      const lobbyUsers = sessionManager.getLobbyUsers();
      expect(lobbyUsers.find(u => u.userId === 'user_1')).toBeUndefined();
      expect(lobbyUsers.find(u => u.userId === 'user_2')).toBeUndefined();
    });
  });

  describe('joinLobby', () => {
    it('should add user to lobby', () => {
      const user = sessionManager.joinLobby({
        userId: 'user_123',
        username: 'testuser',
        preferredRole: 'rep',
        scenarioId: 'scenario_1',
      });

      expect(user).toBeDefined();
      expect(user.userId).toBe('user_123');
      expect(user.status).toBe('waiting');

      const lobbyUsers = sessionManager.getLobbyUsers();
      expect(lobbyUsers.length).toBe(1);
      expect(lobbyUsers[0].userId).toBe('user_123');
    });
  });

  describe('findMatch', () => {
    it('should find compatible match', () => {
      sessionManager.joinLobby({
        userId: 'user_1',
        username: 'user1',
        preferredRole: 'rep',
      });

      sessionManager.joinLobby({
        userId: 'user_2',
        username: 'user2',
        preferredRole: 'prospect',
      });

      const match = sessionManager.findMatch('user_1');
      expect(match).toBeDefined();
      expect(match?.userId).toBe('user_2');
    });

    it('should not match incompatible roles', () => {
      sessionManager.joinLobby({
        userId: 'user_1',
        username: 'user1',
        preferredRole: 'rep',
      });

      sessionManager.joinLobby({
        userId: 'user_2',
        username: 'user2',
        preferredRole: 'rep',
      });

      const match = sessionManager.findMatch('user_1');
      expect(match).toBeNull();
    });

    it('should match when preferredRole is "any"', () => {
      sessionManager.joinLobby({
        userId: 'user_1',
        username: 'user1',
        preferredRole: 'any',
      });

      sessionManager.joinLobby({
        userId: 'user_2',
        username: 'user2',
        preferredRole: 'rep',
      });

      const match = sessionManager.findMatch('user_1');
      expect(match).toBeDefined();
    });
  });

  describe('addMessage', () => {
    it('should add message to session', () => {
      const session = sessionManager.createSession('user_1', 'user_2', 'scenario_1');

      const message = sessionManager.addMessage(session.id, {
        sessionId: session.id,
        userId: 'user_1',
        role: 'rep',
        message: 'Hello!',
        type: 'text',
      });

      expect(message).toBeDefined();
      expect(message.message).toBe('Hello!');

      const updatedSession = sessionManager.getSession(session.id);
      expect(updatedSession?.conversationHistory.length).toBe(1);
    });

    it('should throw error for non-existent session', () => {
      expect(() => {
        sessionManager.addMessage('nonexistent', {
          sessionId: 'nonexistent',
          userId: 'user_1',
          role: 'rep',
          message: 'Hello!',
          type: 'text',
        });
      }).toThrow();
    });
  });

  describe('completeSession', () => {
    it('should mark session as completed', () => {
      const session = sessionManager.createSession('user_1', 'user_2', 'scenario_1');
      sessionManager.completeSession(session.id);

      const completedSession = sessionManager.getSession(session.id);
      expect(completedSession?.status).toBe('completed');
      expect(completedSession?.completedAt).toBeDefined();
    });
  });
});

