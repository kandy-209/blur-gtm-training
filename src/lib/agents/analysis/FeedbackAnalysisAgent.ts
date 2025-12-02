import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '../base/Agent';
import { getAIProvider } from '@/lib/ai-providers';

export interface FeedbackAnalysisInput {
  feedback: {
    text: string;
    improvedMessage?: string;
    rating: number;
  };
  originalMessage: string;
  context: AgentContext;
}

export interface FeedbackAnalysisOutput {
  mlScore: number;
  impactScore: number;
  qualityScore: number;
  recommendations: string[];
  shouldImplement: boolean;
  reasoning: string;
}

export class FeedbackAnalysisAgent extends BaseAgent {
  constructor() {
    super({
      name: 'FeedbackAnalysisAgent',
      description: 'Analyzes user feedback quality and impact',
      version: '1.0.0',
      timeout: 15000,
    });
  }

  async execute(
    input: FeedbackAnalysisInput,
    context?: AgentContext
  ): Promise<AgentResult<FeedbackAnalysisOutput>> {
    const startTime = Date.now();
    
    try {
      this.setContext(context || {});
      
      // Score feedback quality
      const qualityScore = this.scoreFeedbackQuality(input.feedback);
      
      // Predict impact if improvement provided
      let impactScore = 50; // Default
      if (input.feedback.improvedMessage) {
        impactScore = await this.predictImpact(
          input.originalMessage,
          input.feedback.improvedMessage
        );
      }
      
      // ML score (combination of quality and impact)
      const mlScore = (qualityScore * 0.6 + impactScore * 0.4);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        input.feedback,
        qualityScore,
        impactScore
      );
      
      const shouldImplement = mlScore >= 70 && input.feedback.rating >= 4;
      
      return {
        success: true,
        data: {
          mlScore,
          impactScore,
          qualityScore,
          recommendations,
          shouldImplement,
          reasoning: this.generateReasoning(qualityScore, impactScore, shouldImplement),
        },
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
          confidence: mlScore,
        },
      };
    } catch (error: any) {
      this.error('Failed to analyze feedback', error);
      return {
        success: false,
        error: error.message || 'Failed to analyze feedback',
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private scoreFeedbackQuality(feedback: {
    text: string;
    improvedMessage?: string;
    rating: number;
  }): number {
    let score = 0;
    
    // Feedback text length (optimal 20-200 chars)
    const textLength = feedback.text.length;
    if (textLength >= 20 && textLength <= 200) {
      score += 30;
    } else if (textLength > 200) {
      score += 25; // Still good, just verbose
    } else {
      score += (textLength / 20) * 30; // Proportional
    }
    
    // Has improvement suggestion
    if (feedback.improvedMessage) {
      score += 40;
    }
    
    // Rating (higher is better)
    score += feedback.rating * 6; // Max 30 points
    
    return Math.min(100, score);
  }

  private async predictImpact(
    original: string,
    improved: string
  ): Promise<number> {
    // Use AI to predict impact
    const aiProvider = getAIProvider();
    
    const prompt = `Compare these two sales messages and predict the impact of the improvement on conversion rate.

ORIGINAL:
${original}

IMPROVED:
${improved}

Rate the improvement impact from 0-100, considering:
- Clarity and persuasiveness
- Technical accuracy
- Addresses objections better
- More compelling value proposition

Return only a number (0-100).`;

    try {
      const response = await aiProvider.generateResponse(
        [{ role: 'user', content: prompt }],
        'You are a sales effectiveness expert. Return only a number.'
      );
      
      const score = parseInt(response.trim());
      return isNaN(score) ? 70 : Math.max(0, Math.min(100, score));
    } catch (error) {
      // Fallback: simple heuristic
      const lengthDiff = Math.abs(improved.length - original.length);
      const optimalLength = 150; // Optimal message length
      const originalDistance = Math.abs(original.length - optimalLength);
      const improvedDistance = Math.abs(improved.length - optimalLength);
      
      return improvedDistance < originalDistance ? 75 : 60;
    }
  }

  private generateRecommendations(
    feedback: any,
    qualityScore: number,
    impactScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (qualityScore < 50) {
      recommendations.push('Feedback is too brief. Request more details.');
    }
    
    if (!feedback.improvedMessage && impactScore > 60) {
      recommendations.push('Consider asking for a rewritten version.');
    }
    
    if (impactScore >= 80) {
      recommendations.push('High-impact improvement. Consider A/B testing.');
    }
    
    if (qualityScore >= 80 && impactScore >= 75) {
      recommendations.push('Excellent feedback. Fast-track for implementation.');
    }
    
    return recommendations;
  }

  private generateReasoning(
    qualityScore: number,
    impactScore: number,
    shouldImplement: boolean
  ): string {
    if (shouldImplement) {
      return `High-quality feedback (${qualityScore}/100) with strong predicted impact (${impactScore}/100). Recommended for implementation.`;
    } else {
      return `Feedback quality: ${qualityScore}/100, Impact: ${impactScore}/100. May need more validation before implementation.`;
    }
  }
}

