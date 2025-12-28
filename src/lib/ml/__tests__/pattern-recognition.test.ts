import { PatternRecognitionAgent, ResponsePattern, Cluster } from '../pattern-recognition';
import { FeatureExtractor } from '../feature-extraction';
import { db } from '@/lib/db';

// Mock db
jest.mock('@/lib/db', () => ({
  db: {
    getTopResponses: jest.fn(),
  },
}));

describe('PatternRecognitionAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('identifyPatterns', () => {
    it('should identify patterns from top responses', async () => {
      const mockResponses = [
        { response: 'Cursor helps with codebase understanding.', averageScore: 90, successRate: 0.9, count: 10 },
        { response: 'Cursor provides codebase context.', averageScore: 85, successRate: 0.85, count: 8 },
      ];

      (db.getTopResponses as jest.Mock).mockResolvedValue(mockResponses);

      const patterns = await PatternRecognitionAgent.identifyPatterns('Competitive_SelfHosted', 80, 3);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].pattern.keyTerms.length).toBeGreaterThan(0);
      expect(patterns[0].performance.averageScore).toBeGreaterThan(0);
    });

    it('should return empty array when no responses found', async () => {
      (db.getTopResponses as jest.Mock).mockResolvedValue([]);

      const patterns = await PatternRecognitionAgent.identifyPatterns('Competitive_SelfHosted', 80, 3);

      expect(patterns).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      (db.getTopResponses as jest.Mock).mockRejectedValue(new Error('DB error'));

      const patterns = await PatternRecognitionAgent.identifyPatterns('Competitive_SelfHosted', 80, 3);

      expect(patterns).toEqual([]);
    });
  });

  describe('clusterResponses', () => {
    it('should cluster similar responses', () => {
      const responses = [
        { text: 'Cursor helps with codebase.', score: 85 },
        { text: 'Cursor assists with codebase.', score: 87 },
        { text: 'Cursor provides codebase help.', score: 86 },
        { text: 'The weather is nice.', score: 50 },
      ];

      const clusters = PatternRecognitionAgent.clusterResponses(responses, 2);

      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters.length).toBeLessThanOrEqual(2);
      expect(clusters[0].responses.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty input', () => {
      const clusters = PatternRecognitionAgent.clusterResponses([], 3);
      expect(clusters).toEqual([]);
    });

    it('should calculate performance metrics', () => {
      const responses = [
        { text: 'Test response 1.', score: 90 },
        { text: 'Test response 2.', score: 85 },
        { text: 'Test response 3.', score: 75 },
      ];

      const clusters = PatternRecognitionAgent.clusterResponses(responses, 1);

      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0].performance.averageScore).toBeGreaterThan(0);
      expect(clusters[0].performance.successRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findSimilarResponses', () => {
    it('should find similar responses', () => {
      const query = 'Cursor helps with codebase understanding.';
      const responses = [
        { text: 'Cursor assists with codebase context.', score: 85 },
        { text: 'Cursor provides codebase help.', score: 87 },
        { text: 'The weather is nice today.', score: 50 },
      ];

      const similar = PatternRecognitionAgent.findSimilarResponses(query, responses, 0.5);

      expect(similar.length).toBeGreaterThan(0);
      expect(similar[0].similarity).toBeGreaterThan(0.5);
    });

    it('should return empty array when no similar responses found', () => {
      const query = 'Cursor helps with codebase.';
      const responses = [
        { text: 'The weather is nice.', score: 50 },
        { text: 'Food is delicious.', score: 60 },
      ];

      const similar = PatternRecognitionAgent.findSimilarResponses(query, responses, 0.8);

      expect(similar.length).toBe(0);
    });

    it('should sort by similarity descending', () => {
      const query = 'Cursor helps with codebase.';
      const responses = [
        { text: 'Cursor assists with codebase.', score: 85 },
        { text: 'Cursor helps with codebase understanding.', score: 90 },
        { text: 'Cursor provides codebase help.', score: 87 },
      ];

      const similar = PatternRecognitionAgent.findSimilarResponses(query, responses, 0.3);

      expect(similar.length).toBeGreaterThan(0);
      for (let i = 0; i < similar.length - 1; i++) {
        expect(similar[i].similarity).toBeGreaterThanOrEqual(similar[i + 1].similarity);
      }
    });
  });
});

