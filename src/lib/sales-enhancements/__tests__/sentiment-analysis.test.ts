import { analyzeSentimentGoogle, analyzeResponseQualityBasic } from '../sentiment-analysis';

global.fetch = jest.fn();

describe('Sentiment Analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLOUD_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLOUD_API_KEY;
  });

  describe('analyzeSentimentGoogle', () => {
    it('should successfully analyze positive sentiment', async () => {
      const mockData = {
        documentSentiment: {
          score: 0.8,
          magnitude: 0.9,
        },
        entities: [],
        categories: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await analyzeSentimentGoogle('This is a great product!');

      expect(result).toBeDefined();
      expect(result?.score).toBe(0.8);
      expect(result?.label).toBe('positive');
      expect(result?.confidence).toBeGreaterThan(0);
    });

    it('should analyze negative sentiment', async () => {
      const mockData = {
        documentSentiment: {
          score: -0.7,
          magnitude: 0.8,
        },
        entities: [],
        categories: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await analyzeSentimentGoogle('This is terrible!');

      expect(result?.label).toBe('negative');
      expect(result?.score).toBeLessThan(0);
    });

    it('should analyze neutral sentiment', async () => {
      const mockData = {
        documentSentiment: {
          score: 0.05,
          magnitude: 0.1,
        },
        entities: [],
        categories: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await analyzeSentimentGoogle('This is a fact.');

      expect(result?.label).toBe('neutral');
    });

    it('should handle missing API key', async () => {
      delete process.env.GOOGLE_CLOUD_API_KEY;

      const result = await analyzeSentimentGoogle('Test text');

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await analyzeSentimentGoogle('Test text');

      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await analyzeSentimentGoogle('Test text');

      expect(result).toBeNull();
    });

    it('should handle empty text', async () => {
      const mockData = {
        documentSentiment: { score: 0, magnitude: 0 },
        entities: [],
        categories: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await analyzeSentimentGoogle('');

      expect(result).toBeDefined();
    });

    it('should handle very long text', async () => {
      const longText = 'Test '.repeat(1000);
      const mockData = {
        documentSentiment: { score: 0.5, magnitude: 0.6 },
        entities: [],
        categories: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await analyzeSentimentGoogle(longText);

      expect(result).toBeDefined();
    });

    it('should handle special characters', async () => {
      const mockData = {
        documentSentiment: { score: 0.5, magnitude: 0.6 },
        entities: [],
        categories: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await analyzeSentimentGoogle('Test with émojis 🎉 and spéciál chars!');

      expect(result).toBeDefined();
    });
  });

  describe('analyzeResponseQualityBasic', () => {
    it('should score professional responses highly', () => {
      const response = 'I understand your concerns. Our solution can help address these issues effectively.';

      const result = analyzeResponseQualityBasic(response);

      expect(result.overallScore).toBeGreaterThan(50);
      expect(result.professionalism).toBeGreaterThan(50);
    });

    it('should penalize unprofessional language', () => {
      const response = 'Um, like, you know, basically this is, um, good.';

      const result = analyzeResponseQualityBasic(response);

      expect(result.professionalism).toBeLessThan(100);
      expect(result.feedback.some((f) => f.includes('filler'))).toBe(true);
    });

    it('should score clarity appropriately', () => {
      const clearResponse = 'Our solution helps teams work faster. It integrates with your existing tools.';
      const unclearResponse = 'The thing is that, you know, when you think about it, the solution, which is really good, helps with things, and stuff like that, you know what I mean?';

      const clearResult = analyzeResponseQualityBasic(clearResponse);
      const unclearResult = analyzeResponseQualityBasic(unclearResponse);

      expect(clearResult.clarity).toBeGreaterThan(unclearResult.clarity);
    });

    it('should handle empty response', () => {
      const result = analyzeResponseQualityBasic('');

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should handle very short responses', () => {
      const result = analyzeResponseQualityBasic('Yes.');

      expect(result.feedback.some((f) => f.includes('brief'))).toBe(true);
    });

    it('should handle very long responses', () => {
      const longResponse = 'Test '.repeat(500);
      const result = analyzeResponseQualityBasic(longResponse);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should provide suggestions', () => {
      const response = 'Um, like, this is good.';
      const result = analyzeResponseQualityBasic(response);

      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should calculate sentiment correctly', () => {
      const positiveResponse = 'This is excellent! Great solution!';
      const negativeResponse = 'This is a problem. We have concerns.';

      const positiveResult = analyzeResponseQualityBasic(positiveResponse);
      const negativeResult = analyzeResponseQualityBasic(negativeResponse);

      expect(positiveResult.sentiment.score).toBeGreaterThan(negativeResult.sentiment.score);
    });
  });
});

