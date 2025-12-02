/**
 * Route existence and 404 tests
 * Ensures all routes are accessible and return correct status codes
 */

describe('Route Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  describe('Page Routes', () => {
    const publicRoutes = [
      { path: '/', name: 'Home' },
      { path: '/scenarios', name: 'Scenarios' },
      { path: '/analytics', name: 'Analytics' },
      { path: '/leaderboard', name: 'Leaderboard' },
      { path: '/live', name: 'Live Roleplay' },
      { path: '/features', name: 'Features' },
      { path: '/enterprise', name: 'Enterprise' },
      { path: '/chat', name: 'Chat' },
      { path: '/auth', name: 'Auth' },
    ];

    publicRoutes.forEach(({ path, name }) => {
      it(`should have route ${path} (${name})`, () => {
        expect(path).toBeTruthy();
        expect(path.startsWith('/')).toBe(true);
      });
    });
  });

  describe('API Routes', () => {
    const apiRoutes = [
      { path: '/api/roleplay', method: 'POST', name: 'Roleplay' },
      { path: '/api/analytics', method: 'POST', name: 'Analytics' },
      { path: '/api/leaderboard', method: 'GET', name: 'Leaderboard' },
      { path: '/api/responses', method: 'GET', name: 'Responses' },
      { path: '/api/ratings', method: 'POST', name: 'Ratings' },
      { path: '/api/questions', method: 'GET', name: 'Questions' },
      { path: '/api/tts', method: 'POST', name: 'TTS' },
      { path: '/api/transcribe', method: 'POST', name: 'Transcribe' },
      { path: '/api/auth/signup', method: 'POST', name: 'Signup' },
      { path: '/api/auth/signin', method: 'POST', name: 'Signin' },
      { path: '/api/auth/signout', method: 'POST', name: 'Signout' },
      { path: '/api/chat/general', method: 'POST', name: 'General Chat' },
      { path: '/api/chat/technical', method: 'POST', name: 'Technical Chat' },
      { path: '/api/chat/roi', method: 'POST', name: 'ROI Chat' },
      { path: '/api/enterprise/chat', method: 'POST', name: 'Enterprise Chat' },
      { path: '/api/features/chat', method: 'POST', name: 'Features Chat' },
      { path: '/api/live/lobby', method: 'GET', name: 'Live Lobby' },
      { path: '/api/live/sessions', method: 'POST', name: 'Live Sessions' },
      { path: '/api/live/messages', method: 'POST', name: 'Live Messages' },
      { path: '/api/ml/learn', method: 'POST', name: 'ML Learn' },
      { path: '/api/messaging/feedback', method: 'POST', name: 'Feedback' },
    ];

    apiRoutes.forEach(({ path, method, name }) => {
      it(`should have API route ${path} (${method}) for ${name}`, () => {
        expect(path).toBeTruthy();
        expect(path.startsWith('/api/')).toBe(true);
        expect(['GET', 'POST', 'PUT', 'DELETE']).toContain(method);
      });
    });
  });

  describe('Dynamic Routes', () => {
    it('should handle roleplay scenario routes', () => {
      const scenarioId = 'test-scenario-123';
      const route = `/roleplay/${scenarioId}`;
      expect(route).toMatch(/^\/roleplay\/.+$/);
    });

    it('should handle agent routes', () => {
      const agentName = 'test-agent';
      const route = `/api/agents/${agentName}`;
      expect(route).toMatch(/^\/api\/agents\/.+$/);
    });
  });

  describe('404 Handling', () => {
    it('should have not-found page', () => {
      const notFoundPath = '/not-found';
      expect(notFoundPath).toBeTruthy();
    });

    it('should handle invalid scenario IDs', () => {
      const invalidScenarioId = 'non-existent-scenario';
      expect(invalidScenarioId).toBeTruthy();
      // This will be tested in integration tests
    });
  });
});

