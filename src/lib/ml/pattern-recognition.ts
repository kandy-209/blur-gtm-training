/**
 * Pattern recognition and clustering for ML learning
 * Identifies patterns in successful responses and groups similar responses
 */

import { FeatureExtractor, ResponseFeatures } from './feature-extraction';
import { db } from '@/lib/db';
import type { ResponseAnalytics } from '@/lib/db';

export interface ResponsePattern {
  id: string;
  pattern: {
    keyTerms: string[];
    optimalLength: number;
    structurePattern: {
      hasQuestion: number;
      hasExample: number;
      hasComparison: number;
      hasCallToAction: number;
    };
    sentimentRange: [number, number];
    confidenceRange: [number, number];
  };
  performance: {
    averageScore: number;
    successRate: number;
    usageCount: number;
    conversionRate?: number;
  };
  examples: string[];
  objectionCategory: string;
  lastUpdated: Date;
}

export interface Cluster {
  id: string;
  centroid: ResponseFeatures;
  responses: Array<{
    text: string;
    score: number;
    features: ResponseFeatures;
  }>;
  performance: {
    averageScore: number;
    successRate: number;
  };
}

export class PatternRecognitionAgent {
  /**
   * Identify patterns from top-performing responses
   */
  static async identifyPatterns(
    objectionCategory: string,
    minScore: number = 80,
    minUsage: number = 3
  ): Promise<ResponsePattern[]> {
    try {
      const topResponses = await db.getTopResponses({
        objectionCategory,
        minScore,
        limit: 50,
      });

      if (topResponses.length === 0) {
        return [];
      }

      // Extract patterns from top responses
      const patterns = FeatureExtractor.extractPatterns(
        topResponses.map((r: { response: string; averageScore: number; successRate: number }) => ({
          text: r.response,
          score: r.averageScore,
          successRate: r.successRate,
        }))
      );

      // Create pattern object
      const pattern: ResponsePattern = {
        id: `pattern_${objectionCategory}_${Date.now()}`,
        pattern: {
          keyTerms: patterns.commonTerms,
          optimalLength: patterns.optimalLength,
          structurePattern: patterns.structurePattern,
          sentimentRange: this.calculateSentimentRange(topResponses),
          confidenceRange: this.calculateConfidenceRange(topResponses),
        },
        performance: {
          averageScore: this.calculateAverage(topResponses.map((r: { averageScore: number }) => r.averageScore)),
          successRate: this.calculateAverage(topResponses.map((r: { successRate: number }) => r.successRate)),
          usageCount: topResponses.reduce((sum: number, r: { count: number }) => sum + r.count, 0),
        },
        examples: patterns.topPerformers,
        objectionCategory,
        lastUpdated: new Date(),
      };

      return [pattern];
    } catch (error) {
      console.error('Error identifying patterns:', error);
      return [];
    }
  }

  /**
   * Cluster similar responses using K-means-like approach
   */
  static clusterResponses(
    responses: Array<{
      text: string;
      score: number;
      features?: ResponseFeatures;
    }>,
    k: number = 3
  ): Cluster[] {
    if (responses.length === 0) return [];

    // Extract features for all responses
    const responsesWithFeatures = responses.map(r => ({
      ...r,
      features: r.features || FeatureExtractor.extractFeatures(r.text),
    }));

    // Simple clustering based on key terms and structure
    const clusters: Cluster[] = [];
    
    // Group by key terms similarity
    const termGroups = new Map<string, typeof responsesWithFeatures>();
    
    responsesWithFeatures.forEach(response => {
      const keyTerms = response.features.keyTerms.join(',');
      if (!termGroups.has(keyTerms)) {
        termGroups.set(keyTerms, []);
      }
      termGroups.get(keyTerms)!.push(response);
    });

    // Create clusters from groups
    let clusterId = 0;
    for (const [terms, group] of Array.from(termGroups.entries())) {
      if (group.length === 0) continue;

      const avgScore = group.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / group.length;
      const successRate = group.filter((r: { score: number }) => r.score >= 80).length / group.length;

      // Calculate centroid (average features)
      const centroid = this.calculateCentroid(group.map(r => r.features));

      clusters.push({
        id: `cluster_${clusterId++}`,
        centroid,
        responses: group.map(r => ({
          text: r.text,
          score: r.score,
          features: r.features,
        })),
        performance: {
          averageScore: avgScore,
          successRate,
        },
      });
    }

    // Sort by performance and limit to k clusters
    return clusters
      .sort((a, b) => b.performance.averageScore - a.performance.averageScore)
      .slice(0, k);
  }

  /**
   * Find similar responses to a given text
   */
  static findSimilarResponses(
    text: string,
    responses: Array<{
      text: string;
      score: number;
    }>,
    threshold: number = 0.6
  ): Array<{
    text: string;
    score: number;
    similarity: number;
  }> {
    const features = FeatureExtractor.extractFeatures(text);
    
    return responses
      .map(r => ({
        text: r.text,
        score: r.score,
        similarity: FeatureExtractor.calculateSimilarity(text, r.text),
      }))
      .filter(r => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate centroid from features
   */
  private static calculateCentroid(features: ResponseFeatures[]): ResponseFeatures {
    if (features.length === 0) {
      return FeatureExtractor.extractFeatures('');
    }

    return {
      length: Math.round(features.reduce((sum, f) => sum + f.length, 0) / features.length),
      wordCount: Math.round(features.reduce((sum, f) => sum + f.wordCount, 0) / features.length),
      sentenceCount: Math.round(features.reduce((sum, f) => sum + f.sentenceCount, 0) / features.length),
      avgSentenceLength: features.reduce((sum, f) => sum + f.avgSentenceLength, 0) / features.length,
      keyTerms: this.getCommonTerms(features.map(f => f.keyTerms)),
      technicalTerms: this.getCommonTerms(features.map(f => f.technicalTerms)),
      valuePropositions: this.getCommonTerms(features.map(f => f.valuePropositions)),
      objectionHandling: features.filter(f => f.objectionHandling).length / features.length > 0.5,
      hasQuestion: features.filter(f => f.hasQuestion).length / features.length > 0.5,
      hasExample: features.filter(f => f.hasExample).length / features.length > 0.5,
      hasComparison: features.filter(f => f.hasComparison).length / features.length > 0.5,
      hasCallToAction: features.filter(f => f.hasCallToAction).length / features.length > 0.5,
      sentimentScore: features.reduce((sum, f) => sum + f.sentimentScore, 0) / features.length,
      confidenceIndicators: Math.round(features.reduce((sum, f) => sum + f.confidenceIndicators, 0) / features.length),
      turnNumber: Math.round(features.reduce((sum, f) => sum + f.turnNumber, 0) / features.length),
      conversationLength: Math.round(features.reduce((sum, f) => sum + f.conversationLength, 0) / features.length),
    };
  }

  /**
   * Get common terms from multiple arrays
   */
  private static getCommonTerms(termArrays: string[][]): string[] {
    const termCounts = new Map<string, number>();
    
    termArrays.forEach(terms => {
      terms.forEach(term => {
        termCounts.set(term, (termCounts.get(term) || 0) + 1);
      });
    });

    return Array.from(termCounts.entries())
      .filter(([, count]) => count >= termArrays.length * 0.3) // At least 30% of responses
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term]) => term);
  }

  /**
   * Calculate sentiment range
   */
  private static calculateSentimentRange(responses: Array<{ response: string }>): [number, number] {
    const sentiments = responses.map(r => 
      FeatureExtractor.extractFeatures(r.response).sentimentScore
    );
    
    if (sentiments.length === 0) return [0, 0];
    
    return [
      Math.min(...sentiments),
      Math.max(...sentiments),
    ];
  }

  /**
   * Calculate confidence range
   */
  private static calculateConfidenceRange(responses: Array<{ response: string }>): [number, number] {
    const confidences = responses.map((r: { response: string }) => 
      FeatureExtractor.extractFeatures(r.response).confidenceIndicators
    );
    
    if (confidences.length === 0) return [0, 0];
    
    return [
      Math.min(...confidences),
      Math.max(...confidences),
    ];
  }

  /**
   * Calculate average
   */
  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}

