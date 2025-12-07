/**
 * Tests for News and Sentiment API
 */

// Set env var before importing
process.env.NEWS_API_KEY = 'test-key';

// Import after setting env var
const { getCompanyNewsFromNewsAPI, analyzeSentiment } = require('../news-sentiment-api');

jest.mock('../next-cache-wrapper', () => ({
  cachedRouteHandler: jest.fn(async (key, fetcher, options) => {
    const result = await fetcher();
    return {
      data: result,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  }),
}));

jest.mock('../error-recovery', () => ({
  retryWithBackoff: jest.fn(async (fn, options) => {
    try {
      // Execute the async function passed to retryWithBackoff
      const result = await fn();
      // Return the result wrapped in the expected structure
      return {
        success: true,
        data: result,
        attempts: 1,
      };
    } catch (error) {
      // If the function throws, return error structure
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        attempts: 1,
      };
    }
  }),
}));

jest.mock('../logger', () => ({
  log: {
    warn: jest.fn(),
  },
}));

describe('news-sentiment-api', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure env var is set (already set before import)
    process.env.NEWS_API_KEY = 'test-key';
  });

  describe('getCompanyNewsFromNewsAPI', () => {
    it('should return null when API key is missing', async () => {
      delete process.env.NEWS_API_KEY;
      const result = await getCompanyNewsFromNewsAPI('Apple');
      expect(result).toBeNull();
    });

    it('should parse news data correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          status: 'ok',
          articles: [
            {
              title: 'Apple reports strong growth',
              description: 'Apple Inc. reports record profits',
              url: 'https://example.com/news1',
              publishedAt: '2024-01-01T00:00:00Z',
              source: { name: 'Tech News' },
            },
          ],
        }),
      });

      const result = await getCompanyNewsFromNewsAPI('Apple', 'AAPL');

      // The function should return the CompanyNews object from cachedResult.data
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('sentimentSummary');
      expect(Array.isArray(result?.articles)).toBe(true);
      expect(result?.articles?.length).toBe(1);
      expect(result?.articles[0].title).toBe('Apple reports strong growth');
      expect(result?.sentimentSummary).toBeDefined();
    });

    it('should handle rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 429,
        ok: false,
      });

      const result = await getCompanyNewsFromNewsAPI('Apple');
      expect(result).toBeNull();
    });
  });

  describe('analyzeSentiment', () => {
    it('should identify positive sentiment', () => {
      const articles = [
        {
          title: 'Company reports strong growth and profit',
          description: 'Record breaking success',
          url: 'https://example.com',
          publishedAt: '2024-01-01',
          source: 'News',
        },
      ];

      const summary = analyzeSentiment(articles);

      expect(summary.positive).toBeGreaterThan(0);
      expect(articles[0].sentiment).toBe('positive');
    });

    it('should identify negative sentiment', () => {
      const articles = [
        {
          title: 'Company reports loss and decline',
          description: 'Weak performance',
          url: 'https://example.com',
          publishedAt: '2024-01-01',
          source: 'News',
        },
      ];

      const summary = analyzeSentiment(articles);

      expect(summary.negative).toBeGreaterThan(0);
      expect(articles[0].sentiment).toBe('negative');
    });

    it('should calculate average sentiment score', () => {
      const articles = [
        {
          title: 'Company reports growth',
          description: 'Strong performance',
          url: 'https://example.com',
          publishedAt: '2024-01-01',
          source: 'News',
        },
        {
          title: 'Company faces challenges',
          description: 'Weak results',
          url: 'https://example.com',
          publishedAt: '2024-01-01',
          source: 'News',
        },
      ];

      const summary = analyzeSentiment(articles);

      expect(summary.averageScore).toBeDefined();
      expect(typeof summary.averageScore).toBe('number');
    });
  });
});

