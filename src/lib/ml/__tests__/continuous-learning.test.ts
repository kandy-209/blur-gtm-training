import { ContinuousLearningAgent, LearningInsight, ModelImprovement } from '../continuous-learning';
import { db } from '@/lib/db';
import { PatternRecognitionAgent } from '../pattern-recognition';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    getTopResponses: jest.fn(),
  },
}));

jest.mock('../pattern-recognition', () => ({
  PatternRecognitionAgent: {
    identifyPatterns: jest.fn(),
  },
}));

jest.mock('@/lib/ai-providers', () => ({
  getAIProvider: jest.fn(() => ({
    generateResponse: jest.fn().mockResolvedValue('Test response'),
  })),
}));

describe('ContinuousLearningAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('learnFromData', () => {
    it('should generate insights from data', async () => {
      const mockResponses = [
        { response: 'Test response 1 with codebase understanding and productivity improvements.', averageScore: 90, successRate: 0.9, count: 10 },
        { response: 'Test response 2 with codebase context and efficiency gains.', averageScore: 85, successRate: 0.85, count: 8 },
        { response: 'Test response 3 with codebase help and productivity boost.', averageScore: 88, successRate: 0.88, count: 9 },
        { response: 'Test response 4 with codebase assistance.', averageScore: 87, successRate: 0.87, count: 7 },
        { response: 'Test response 5 with codebase support.', averageScore: 86, successRate: 0.86, count: 6 },
        { response: 'Test response 6 with codebase features.', averageScore: 89, successRate: 0.89, count: 11 },
        { response: 'Test response 7 with codebase tools.', averageScore: 84, successRate: 0.84, count: 5 },
        { response: 'Test response 8 with codebase integration.', averageScore: 91, successRate: 0.91, count: 12 },
        { response: 'Test response 9 with codebase capabilities.', averageScore: 88, successRate: 0.88, count: 8 },
        { response: 'Test response 10 with codebase functionality.', averageScore: 87, successRate: 0.87, count: 7 },
      ];

      (db.getTopResponses as jest.Mock).mockResolvedValue(mockResponses);
      (PatternRecognitionAgent.identifyPatterns as jest.Mock).mockResolvedValue([
        {
          pattern: { keyTerms: ['cursor', 'codebase'], optimalLength: 150 },
          performance: { averageScore: 87, successRate: 0.87, usageCount: 18 },
          examples: ['Test response 1'],
        },
      ]);

      const insights = await ContinuousLearningAgent.learnFromData('Competitive_SelfHosted', 5);

      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0].type).toBeDefined();
      expect(insights[0].category).toBe('Competitive_Copilot');
    });

    it('should return empty array when insufficient data', async () => {
      (db.getTopResponses as jest.Mock).mockResolvedValue([
        { response: 'Test', averageScore: 80, successRate: 0.8, count: 1 },
      ]);

      const insights = await ContinuousLearningAgent.learnFromData('Competitive_Copilot', 10);

      expect(insights.length).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      (db.getTopResponses as jest.Mock).mockRejectedValue(new Error('DB error'));

      const insights = await ContinuousLearningAgent.learnFromData('Competitive_SelfHosted', 5);

      expect(insights).toEqual([]);
    });
  });

  describe('generateImprovedResponse', () => {
    it('should generate improved response using patterns', async () => {
      const mockPatterns = [
        {
          pattern: {
            keyTerms: ['cursor', 'codebase'],
            optimalLength: 150,
            structurePattern: { hasQuestion: 0.5, hasExample: 0.5, hasComparison: 0, hasCallToAction: 0.5 },
          },
        },
      ];

      const mockTopResponses = [
        { response: 'Cursor helps with codebase understanding.', averageScore: 90, successRate: 0.9, count: 10 },
      ];

      (PatternRecognitionAgent.identifyPatterns as jest.Mock).mockResolvedValue(mockPatterns);
      (db.getTopResponses as jest.Mock).mockResolvedValue(mockTopResponses);

      const result = await ContinuousLearningAgent.generateImprovedResponse(
        'Test objection',
        'Competitive_SelfHosted',
        [{ role: 'rep', message: 'Previous message' }],
        { name: 'Test Persona', currentSolution: 'GitHub Copilot', primaryGoal: 'Productivity', skepticism: 'Low', tone: 'Professional' }
      );

      expect(result.response).toBeDefined();
      expect(result.response.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(Array.isArray(result.improvements)).toBe(true);
    });

    it('should handle missing patterns gracefully', async () => {
      (PatternRecognitionAgent.identifyPatterns as jest.Mock).mockResolvedValue([]);
      (db.getTopResponses as jest.Mock).mockResolvedValue([]);

      const result = await ContinuousLearningAgent.generateImprovedResponse(
        'Test objection',
        'Competitive_SelfHosted',
        [],
        { name: 'Test', currentSolution: 'Test', primaryGoal: 'Test', skepticism: 'Test', tone: 'Test' }
      );

      expect(result.response).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('evaluateModelImprovement', () => {
    it('should evaluate model improvement', async () => {
      const mockResponses = Array.from({ length: 30 }, (_, i) => ({
        response: `Response ${i}`,
        averageScore: 70 + i,
        successRate: 0.7 + (i / 100),
        count: 5,
      }));

      (db.getTopResponses as jest.Mock).mockResolvedValue(mockResponses);

      const improvement = await ContinuousLearningAgent.evaluateModelImprovement('Competitive_SelfHosted');

      expect(improvement).toBeDefined();
      if (improvement) {
        expect(improvement.before).toBeDefined();
        expect(improvement.after).toBeDefined();
        expect(improvement.improvement).toBeDefined();
        expect(Array.isArray(improvement.changes)).toBe(true);
      }
    });

    it('should return null when insufficient data', async () => {
      (db.getTopResponses as jest.Mock).mockResolvedValue([
        { response: 'Test', averageScore: 80, successRate: 0.8, count: 1 },
      ]);

      const improvement = await ContinuousLearningAgent.evaluateModelImprovement('Competitive_SelfHosted');

      expect(improvement).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (db.getTopResponses as jest.Mock).mockRejectedValue(new Error('DB error'));

      const improvement = await ContinuousLearningAgent.evaluateModelImprovement('Competitive_SelfHosted');

      expect(improvement).toBeNull();
    });
  });
});

