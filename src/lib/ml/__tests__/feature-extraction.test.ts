import { FeatureExtractor, ResponseFeatures } from '../feature-extraction';

describe('FeatureExtractor', () => {
  describe('extractFeatures', () => {
    it('should extract text features correctly', () => {
      const text = 'Cursor is a powerful AI coding assistant that understands your entire codebase.';
      const features = FeatureExtractor.extractFeatures(text);

      expect(features.length).toBeGreaterThan(0);
      expect(features.wordCount).toBeGreaterThan(0);
      expect(features.sentenceCount).toBeGreaterThan(0);
      expect(features.avgSentenceLength).toBeGreaterThan(0);
    });

    it('should extract key terms', () => {
      const text = 'Cursor uses codebase understanding and context to help developers.';
      const features = FeatureExtractor.extractFeatures(text);

      expect(features.keyTerms.length).toBeGreaterThan(0);
      expect(features.keyTerms).toContain('codebase');
      expect(features.keyTerms).toContain('context');
    });

    it('should detect structure features', () => {
      const textWithQuestion = 'Have you tried Cursor? It helps with productivity.';
      const features = FeatureExtractor.extractFeatures(textWithQuestion);

      expect(features.hasQuestion).toBe(true);
    });

    it('should calculate sentiment score', () => {
      const positiveText = 'Cursor is great and helps improve productivity significantly.';
      const negativeText = 'This is bad and problematic.';
      
      const positiveFeatures = FeatureExtractor.extractFeatures(positiveText);
      const negativeFeatures = FeatureExtractor.extractFeatures(negativeText);

      expect(positiveFeatures.sentimentScore).toBeGreaterThan(negativeFeatures.sentimentScore);
    });

    it('should extract context features', () => {
      const features = FeatureExtractor.extractFeatures('Test', {
        turnNumber: 3,
        conversationLength: 5,
        previousScore: 85,
      });

      expect(features.turnNumber).toBe(3);
      expect(features.conversationLength).toBe(5);
      expect(features.previousScore).toBe(85);
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate similarity between similar texts', () => {
      const text1 = 'Cursor helps developers with codebase understanding.';
      const text2 = 'Cursor assists developers with codebase context.';

      const similarity = FeatureExtractor.calculateSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should return low similarity for different texts', () => {
      const text1 = 'Cursor helps developers.';
      const text2 = 'The weather is nice today.';

      const similarity = FeatureExtractor.calculateSimilarity(text1, text2);
      expect(similarity).toBeLessThan(0.5);
    });

    it('should return 1 for identical texts', () => {
      const text = 'Cursor is great.';
      const similarity = FeatureExtractor.calculateSimilarity(text, text);
      expect(similarity).toBeGreaterThan(0.9);
    });
  });

  describe('extractPatterns', () => {
    it('should extract patterns from responses', () => {
      const responses = [
        { text: 'Cursor helps with codebase understanding and productivity.', score: 90, successRate: 0.9 },
        { text: 'Cursor provides codebase context and improves efficiency.', score: 85, successRate: 0.85 },
        { text: 'Cursor understands your codebase and boosts productivity.', score: 88, successRate: 0.88 },
      ];

      const patterns = FeatureExtractor.extractPatterns(responses);

      expect(patterns.commonTerms.length).toBeGreaterThan(0);
      expect(patterns.optimalLength).toBeGreaterThan(0);
      expect(patterns.topPerformers.length).toBeGreaterThan(0);
      expect(patterns.structurePattern).toBeDefined();
    });

    it('should identify optimal length', () => {
      const responses = [
        { text: 'Short.', score: 60 },
        { text: 'This is a medium length response that provides good information.', score: 85 },
        { text: 'This is another medium length response with similar characteristics.', score: 87 },
      ];

      const patterns = FeatureExtractor.extractPatterns(responses);
      expect(patterns.optimalLength).toBeGreaterThan(50);
    });
  });
});

