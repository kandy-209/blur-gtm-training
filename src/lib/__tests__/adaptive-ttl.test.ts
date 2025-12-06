/**
 * Tests for Adaptive TTL
 */

import { recommendTTL, getAllTTLRecommendations } from '../cache/adaptive-ttl';

jest.mock('../next-cache-wrapper', () => ({
  getCacheMetrics: jest.fn((key?: string) => {
    if (key === 'high-hit-key') {
      return {
        hits: 80,
        misses: 20,
        staleServed: 5,
        errors: 0,
        totalRequests: 100,
      };
    }
    if (key === 'low-hit-key') {
      return {
        hits: 30,
        misses: 70,
        staleServed: 0,
        errors: 0,
        totalRequests: 100,
      };
    }
    return {
      hits: 50,
      misses: 50,
      staleServed: 25,
      errors: 0,
      totalRequests: 100,
    };
  }),
}));

jest.mock('../logger', () => ({
  log: {
    info: jest.fn(),
  },
}));

describe('adaptive-ttl', () => {
  describe('recommendTTL', () => {
    it('should recommend higher TTL for high hit rate', () => {
      const recommendation = recommendTTL('high-hit-key', 300);

      expect(recommendation.recommendedTTL).toBeGreaterThan(300);
      expect(recommendation.confidence).toBeGreaterThan(0.5);
    });

    it('should recommend lower TTL for low hit rate', () => {
      const recommendation = recommendTTL('low-hit-key', 300);

      expect(recommendation.recommendedTTL).toBeLessThan(300);
      expect(recommendation.confidence).toBeGreaterThan(0.5);
    });

    it('should return recommendation with reason', () => {
      const recommendation = recommendTTL('high-hit-key', 300);

      expect(recommendation.reason).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(recommendation.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('getAllTTLRecommendations', () => {
    it('should return recommendations for all keys', () => {
      const recommendations = getAllTTLRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('key');
      expect(recommendations[0]).toHaveProperty('recommendedTTL');
    });

    it('should sort by confidence', () => {
      const recommendations = getAllTTLRecommendations();

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].confidence).toBeGreaterThanOrEqual(
          recommendations[i].confidence
        );
      }
    });
  });
});




