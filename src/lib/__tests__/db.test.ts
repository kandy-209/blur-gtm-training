import { db } from '@/lib/db';

describe('Database', () => {
  beforeEach(() => {
    // Clear database before each test
    jest.clearAllMocks();
  });

  describe('User Responses', () => {
    it('should save and retrieve user responses', async () => {
      const response = await db.saveUserResponse({
        userId: 'test-user',
        scenarioId: 'test-scenario',
        turnNumber: 1,
        objectionCategory: 'Competitive_SelfHosted',
        userMessage: 'Test response',
        aiResponse: 'AI response',
        evaluation: 'PASS',
        confidenceScore: 85,
        keyPointsMentioned: ['point1'],
      });

      expect(response.id).toBeTruthy();
      expect(response.userMessage).toBe('Test response');
      expect(response.timestamp).toBeInstanceOf(Date);

      const retrieved = await db.getUserResponses({ userId: 'test-user' });
      expect(retrieved.length).toBeGreaterThan(0);
      expect(retrieved[0].userMessage).toBe('Test response');
    });

    it('should filter responses by scenario', async () => {
      await db.saveUserResponse({
        userId: 'user1',
        scenarioId: 'scenario1',
        turnNumber: 1,
        objectionCategory: 'Competitive_SelfHosted',
        userMessage: 'Response 1',
        aiResponse: 'AI 1',
        evaluation: 'PASS',
        confidenceScore: 80,
        keyPointsMentioned: [],
      });

      await db.saveUserResponse({
        userId: 'user2',
        scenarioId: 'scenario2',
        turnNumber: 1,
        objectionCategory: 'Competitive_SelfHosted',
        userMessage: 'Response 2',
        aiResponse: 'AI 2',
        evaluation: 'PASS',
        confidenceScore: 90,
        keyPointsMentioned: [],
      });

      const responses = await db.getUserResponses({ scenarioId: 'scenario1' });
      expect(responses.every(r => r.scenarioId === 'scenario1')).toBe(true);
    });
  });

  describe('Top Responses', () => {
    it('should calculate top responses correctly', async () => {
      // Add multiple responses with same text
      for (let i = 0; i < 3; i++) {
        await db.saveUserResponse({
          userId: `user${i}`,
          scenarioId: 'test-scenario',
          turnNumber: 1,
          objectionCategory: 'Competitive_SelfHosted',
          userMessage: 'Same response',
          aiResponse: 'AI response',
          evaluation: 'PASS',
          confidenceScore: 85,
          keyPointsMentioned: [],
        });
      }

      const topResponses = await db.getTopResponses({
        scenarioId: 'test-scenario',
        limit: 10,
      });

      expect(topResponses.length).toBeGreaterThan(0);
      const sameResponse = topResponses.find(r => r.response === 'Same response');
      expect(sameResponse).toBeTruthy();
      expect(sameResponse?.count).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Technical Questions', () => {
    it('should save and retrieve technical questions', async () => {
      const question = await db.saveTechnicalQuestion({
        userId: 'test-user',
        scenarioId: 'test-scenario',
        question: 'How does this work?',
        category: 'Competitive_Copilot',
      });

      expect(question.id).toBeTruthy();
      expect(question.question).toBe('How does this work?');
      expect(question.upvotes).toBe(0);

      const questions = await db.getTechnicalQuestions({ scenarioId: 'test-scenario' });
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should upvote questions', async () => {
      const question = await db.saveTechnicalQuestion({
        userId: 'test-user',
        scenarioId: 'test-scenario',
        question: 'Test question?',
        category: 'Competitive_Copilot',
      });

      const upvoted = await db.upvoteQuestion(question.id);
      expect(upvoted?.upvotes).toBe(1);

      const upvotedAgain = await db.upvoteQuestion(question.id);
      expect(upvotedAgain?.upvotes).toBe(2);
    });
  });

  describe('AI Insights', () => {
    it('should generate AI insights', async () => {
      await db.saveUserResponse({
        userId: 'user1',
        scenarioId: 'test-scenario',
        turnNumber: 1,
        objectionCategory: 'Competitive_SelfHosted',
        userMessage: 'Test response',
        aiResponse: 'AI response',
        evaluation: 'PASS',
        confidenceScore: 85,
        keyPointsMentioned: [],
      });

      const insights = await db.getAIInsights('test-scenario', 'Competitive_SelfHosted');
      
      expect(insights).toHaveProperty('topResponses');
      expect(insights).toHaveProperty('commonQuestions');
      expect(insights).toHaveProperty('averageScore');
      expect(insights).toHaveProperty('successRate');
      expect(insights.averageScore).toBeGreaterThanOrEqual(0);
    });
  });
});

