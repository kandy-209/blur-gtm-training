import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '../base/Agent';
import { db } from '@/lib/db';

export interface ResponseRankingInput {
  responses: Array<{
    text: string;
    source?: string;
    metadata?: Record<string, any>;
  }>;
  context: AgentContext;
}

export interface RankedResponse {
  text: string;
  rank: number;
  score: number;
  factors: {
    quality: number;
    relevance: number;
    historicalPerformance?: number;
    personalization: number;
  };
  metadata?: Record<string, any>;
}

export class ResponseRankingAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ResponseRankingAgent',
      description: 'Ranks and scores multiple response options',
      version: '1.0.0',
      timeout: 10000,
    });
  }

  async execute(
    input: ResponseRankingInput,
    context?: AgentContext
  ): Promise<AgentResult<RankedResponse[]>> {
    const startTime = Date.now();
    
    try {
      this.setContext(context || {});
      
      // Score each response
      const scoredResponses = await Promise.all(
        input.responses.map(async (response) => {
          const score = await this.scoreResponse(response, input.context);
          return {
            ...response,
            rank: 0, // Will be set after sorting
            score: score.total,
            factors: score.factors,
          };
        })
      );
      
      // Sort by score (descending)
      scoredResponses.sort((a, b) => b.score - a.score);
      
      // Assign ranks
      scoredResponses.forEach((response, index) => {
        response.rank = index + 1;
      });
      
      return {
        success: true,
        data: scoredResponses,
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.error('Failed to rank responses', error);
      return {
        success: false,
        error: error.message || 'Failed to rank responses',
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private async scoreResponse(
    response: { text: string; source?: string; metadata?: Record<string, any> },
    context: AgentContext
  ): Promise<{ total: number; factors: RankedResponse['factors'] }> {
    // Quality scoring (0-100)
    const quality = this.scoreQuality(response.text);
    
    // Relevance scoring (0-100)
    const relevance = this.scoreRelevance(response.text, context);
    
    // Historical performance (0-100)
    let historicalPerformance: number | undefined;
    if (response.source) {
      try {
        const historical = await (db as any).getResponsePerformance?.(response.source);
        historicalPerformance = historical?.averageScore || 70;
      } catch {
        historicalPerformance = 70;
      }
    }
    
    // Personalization (0-100)
    const personalization = this.scorePersonalization(response.text, context);
    
    // Weighted total
    const total = (
      quality * 0.3 +
      relevance * 0.3 +
      (historicalPerformance || 70) * 0.2 +
      personalization * 0.2
    );
    
    return {
      total,
      factors: {
        quality,
        relevance,
        historicalPerformance,
        personalization,
      },
    };
  }

  private scoreQuality(text: string): number {
    // Length check (optimal 100-300 chars)
    const length = text.length;
    const lengthScore = length >= 100 && length <= 300 ? 100 : 
                        length < 100 ? (length / 100) * 100 : 
                        Math.max(0, 100 - ((length - 300) / 10));
    
    // Key phrases check
    const keyPhrases = ['codebase', 'cursor', 'context', 'understanding', 'productivity'];
    const phraseScore = keyPhrases.filter(phrase => 
      text.toLowerCase().includes(phrase)
    ).length / keyPhrases.length * 100;
    
    return (lengthScore * 0.5 + phraseScore * 0.5);
  }

  private scoreRelevance(text: string, context: AgentContext): number {
    // Check if response addresses objection category
    if (context.objectionCategory) {
      const categoryKeywords: Record<string, string[]> = {
        'Competitive_Copilot': ['copilot', 'github', 'alternative', 'difference'],
        'Security_Concerns': ['security', 'data', 'privacy', 'compliance'],
        'Cost_Objection': ['cost', 'price', 'roi', 'value'],
      };
      
      const keywords = categoryKeywords[context.objectionCategory] || [];
      const matches = keywords.filter(kw => 
        text.toLowerCase().includes(kw.toLowerCase())
      ).length;
      
      return (matches / Math.max(keywords.length, 1)) * 100;
    }
    
    return 70; // Default relevance
  }

  private scorePersonalization(text: string, context: AgentContext): number {
    // Check if response mentions persona-specific elements
    if (context.persona) {
      const personaMentions = [
        context.persona.currentSolution,
        context.persona.primaryGoal,
      ].filter(term => term && text.toLowerCase().includes(term.toLowerCase())).length;
      
      return Math.min(100, personaMentions * 50);
    }
    
    return 50; // Default personalization
  }
}

