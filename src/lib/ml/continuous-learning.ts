/**
 * Continuous learning agent
 * Learns from user interactions and improves over time
 */

import { db } from '@/lib/db';
import { FeatureExtractor, ResponseFeatures } from './feature-extraction';
import { PatternRecognitionAgent, ResponsePattern } from './pattern-recognition';
import { getAIProvider } from '@/lib/ai-providers';

export interface LearningInsight {
  id: string;
  type: 'pattern' | 'improvement' | 'trend' | 'anomaly';
  category: string;
  insight: string;
  confidence: number;
  evidence: string[];
  recommendation: string;
  timestamp: Date;
}

export interface ModelImprovement {
  before: {
    averageScore: number;
    successRate: number;
  };
  after: {
    averageScore: number;
    successRate: number;
  };
  improvement: number;
  changes: string[];
}

export class ContinuousLearningAgent {
  /**
   * Learn from new data and update patterns
   */
  static async learnFromData(
    objectionCategory: string,
    minDataPoints: number = 10
  ): Promise<LearningInsight[]> {
    try {
      const insights: LearningInsight[] = [];

      // Get recent responses
      const topResponses = await db.getTopResponses({
        objectionCategory,
        minScore: 70,
        limit: 100,
      });

      if (topResponses.length < minDataPoints) {
        return insights;
      }

      // Identify patterns
      const patterns = await PatternRecognitionAgent.identifyPatterns(
        objectionCategory,
        80,
        3
      );

      if (patterns.length > 0) {
        const pattern = patterns[0];
        insights.push({
          id: `insight_pattern_${Date.now()}`,
          type: 'pattern',
          category: objectionCategory,
          insight: `Identified pattern with ${pattern.pattern.keyTerms.length} key terms, optimal length ${pattern.pattern.optimalLength} chars`,
          confidence: Math.min(95, 70 + (pattern.performance.usageCount / 10)),
          evidence: pattern.examples.slice(0, 3),
          recommendation: `Use key terms: ${pattern.pattern.keyTerms.slice(0, 5).join(', ')}`,
          timestamp: new Date(),
        });
      }

      // Detect trends
      const trendInsight = this.detectTrends(topResponses, objectionCategory);
      if (trendInsight) {
        insights.push(trendInsight);
      }

      // Detect improvements
      const improvementInsight = await this.detectImprovements(
        topResponses,
        objectionCategory
      );
      if (improvementInsight) {
        insights.push(improvementInsight);
      }

      return insights;
    } catch (error) {
      console.error('Error in continuous learning:', error);
      return [];
    }
  }

  /**
   * Detect trends in response performance
   */
  private static detectTrends(
    responses: Array<{ response: string; averageScore: number; successRate: number }>,
    category: string
  ): LearningInsight | null {
    if (responses.length < 5) return null;

    // Analyze length trends
    const lengths = responses.map((r: { response: string }) => r.response.length);
    const avgLength = lengths.reduce((a: number, b: number) => a + b, 0) / lengths.length;
    const highPerformers = responses.filter(r => r.averageScore >= 85);
    
    if (highPerformers.length === 0) return null;

    const highPerformerLengths = highPerformers.map(r => r.response.length);
    const avgHighPerformerLength = highPerformerLengths.reduce((a, b) => a + b, 0) / highPerformerLengths.length;

    if (Math.abs(avgLength - avgHighPerformerLength) > 50) {
      return {
        id: `insight_trend_${Date.now()}`,
        type: 'trend',
        category,
        insight: `High-performing responses average ${Math.round(avgHighPerformerLength)} characters vs ${Math.round(avgLength)} for all responses`,
        confidence: 75,
        evidence: highPerformers.slice(0, 3).map((r: { response: string }) => r.response.substring(0, 100)),
        recommendation: `Aim for responses around ${Math.round(avgHighPerformerLength)} characters`,
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Detect improvements in response quality
   */
  private static async detectImprovements(
    responses: Array<{ response: string; averageScore: number; successRate: number }>,
    category: string
  ): Promise<LearningInsight | null> {
    if (responses.length < 10) return null;

    // Compare recent vs older responses (if we had timestamps)
    // For now, compare top vs bottom performers
    const sorted = [...responses].sort((a, b) => b.averageScore - a.averageScore);
    const top = sorted.slice(0, Math.floor(sorted.length * 0.2));
    const bottom = sorted.slice(-Math.floor(sorted.length * 0.2));

    if (top.length === 0 || bottom.length === 0) return null;

    const topFeatures = FeatureExtractor.extractPatterns(
      top.map((r: { response: string; averageScore: number }) => ({ text: r.response, score: r.averageScore }))
    );
    const bottomFeatures = FeatureExtractor.extractPatterns(
      bottom.map((r: { response: string; averageScore: number }) => ({ text: r.response, score: r.averageScore }))
    );

    // Find differences
    const topTerms = new Set(topFeatures.commonTerms);
    const bottomTerms = new Set(bottomFeatures.commonTerms);
    const uniqueTopTerms = Array.from(topTerms).filter((t: string) => !bottomTerms.has(t));

    // Always return an improvement insight if we have top performers
    if (top.length > 0) {
      const termsToUse = uniqueTopTerms.length > 0 
        ? uniqueTopTerms.slice(0, 5).join(', ')
        : topFeatures.commonTerms.slice(0, 5).join(', ') || 'key terms from top performers';
      
      return {
        id: `insight_improvement_${Date.now()}`,
        type: 'improvement',
        category,
        insight: `Top performers use terms: ${termsToUse}`,
        confidence: 80,
        evidence: top.slice(0, 2).map((r: { response: string }) => r.response.substring(0, 100)),
        recommendation: `Incorporate these terms: ${termsToUse}`,
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Generate improved response using learned patterns
   */
  static async generateImprovedResponse(
    objection: string,
    objectionCategory: string,
    conversationHistory: Array<{ role: string; message: string }>,
    persona: any
  ): Promise<{
    response: string;
    improvements: string[];
    confidence: number;
  }> {
    try {
      // Get learned patterns
      const patterns = await PatternRecognitionAgent.identifyPatterns(
        objectionCategory,
        80,
        3
      );

      // Get top responses for reference
      const topResponses = await db.getTopResponses({
        objectionCategory,
        minScore: 85,
        limit: 5,
      });

      // Build enhanced prompt with learned patterns
      const aiProvider = getAIProvider();
      const patternContext = patterns.length > 0
        ? `\n\nLEARNED PATTERNS FROM TOP PERFORMERS:
- Key terms to include: ${patterns[0].pattern.keyTerms.slice(0, 8).join(', ')}
- Optimal length: ${patterns[0].pattern.optimalLength} characters
- Structure: ${patterns[0].pattern.structurePattern.hasQuestion > 0.5 ? 'Include questions' : ''} ${patterns[0].pattern.structurePattern.hasExample > 0.5 ? 'Include examples' : ''}
- Top performing examples:
${topResponses.slice(0, 2).map((r: { response: string }, i: number) => `${i + 1}. ${r.response.substring(0, 150)}`).join('\n')}`
        : '';

      const prompt = `Generate a sales response to address this objection.

OBJECTION: ${objection}

PROSPECT PERSONA:
- Name: ${persona.name}
- Current Solution: ${persona.currentSolution}
- Primary Goal: ${persona.primaryGoal}
- Skepticism: ${persona.skepticism}
- Tone: ${persona.tone}
${patternContext}

CONVERSATION HISTORY:
${conversationHistory.slice(-3).map(m => `${m.role}: ${m.message}`).join('\n')}

Generate a response that:
1. Addresses the objection directly
2. Uses Cursor's key value propositions
3. Incorporates learned best practices from top performers
4. Matches the prospect's technical level
5. Moves the conversation forward

Return only the response text, no JSON or markdown.`;

      const response = await aiProvider.generateResponse(
        [{ role: 'user', content: prompt }],
        'You are an expert sales rep. Generate concise, persuasive responses.'
      );

      // Extract improvements
      const improvements: string[] = [];
      if (patterns.length > 0) {
        const features = FeatureExtractor.extractFeatures(response);
        const pattern = patterns[0].pattern;

        if (features.keyTerms.length < pattern.keyTerms.length * 0.5) {
          improvements.push(`Add more key terms: ${pattern.keyTerms.slice(0, 3).join(', ')}`);
        }

        if (Math.abs(features.length - pattern.optimalLength) > 50) {
          improvements.push(`Adjust length towards ${pattern.optimalLength} characters`);
        }

        if (pattern.structurePattern.hasExample > 0.5 && !features.hasExample) {
          improvements.push('Consider adding an example');
        }
      }

      return {
        response: response.trim(),
        improvements,
        confidence: patterns.length > 0 ? 85 : 70,
      };
    } catch (error) {
      console.error('Error generating improved response:', error);
      throw error;
    }
  }

  /**
   * Evaluate model improvement over time
   */
  static async evaluateModelImprovement(
    objectionCategory: string
  ): Promise<ModelImprovement | null> {
    try {
      const allResponses = await db.getTopResponses({
        objectionCategory,
        minScore: 0,
        limit: 100,
      });

      if (allResponses.length < 20) return null;

      // Split into two halves (simulating before/after)
      const midpoint = Math.floor(allResponses.length / 2);
      const before = allResponses.slice(0, midpoint);
      const after = allResponses.slice(midpoint);

      const beforeAvg = before.reduce((sum: number, r: { averageScore: number }) => sum + r.averageScore, 0) / before.length;
      const beforeSuccess = before.filter((r: { successRate: number }) => r.successRate >= 0.8).length / before.length;

      const afterAvg = after.reduce((sum: number, r: { averageScore: number }) => sum + r.averageScore, 0) / after.length;
      const afterSuccess = after.filter((r: { successRate: number }) => r.successRate >= 0.8).length / after.length;

      const improvement = ((afterAvg - beforeAvg) / beforeAvg) * 100;

      if (improvement > 5) {
        return {
          before: {
            averageScore: beforeAvg,
            successRate: beforeSuccess,
          },
          after: {
            averageScore: afterAvg,
            successRate: afterSuccess,
          },
          improvement,
          changes: [
            `Average score improved by ${improvement.toFixed(1)}%`,
            `Success rate changed from ${(beforeSuccess * 100).toFixed(1)}% to ${(afterSuccess * 100).toFixed(1)}%`,
          ],
        };
      }

      return null;
    } catch (error) {
      console.error('Error evaluating model improvement:', error);
      return null;
    }
  }
}

