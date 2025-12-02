import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '../base/Agent';
import { db } from '@/lib/db';

export interface ResourceMatchingInput {
  message: string;
  objectionCategory: string;
  context?: AgentContext;
}

export interface MatchedResource {
  id: string;
  url: string;
  title: string;
  type: string;
  description?: string;
  relevanceScore: number;
  reason: string;
}

export class ResourceMatchingAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ResourceMatchingAgent',
      description: 'Matches relevant resources to sales messages',
      version: '1.0.0',
      timeout: 5000,
    });
  }

  async execute(
    input: ResourceMatchingInput,
    context?: AgentContext
  ): Promise<AgentResult<MatchedResource[]>> {
    const startTime = Date.now();
    
    try {
      this.setContext(context || {});
      
      // Get all resources for this category (with fallback)
      let allResources: any[] = [];
      try {
        allResources = await (db as any).getResourcesByCategory?.(input.objectionCategory) || [];
      } catch {
        // Method may not exist yet, return empty array
      }
      
      // Score relevance for each resource
      const scoredResources = allResources.map(resource => {
        const relevanceScore = this.calculateRelevance(
          input.message,
          resource,
          input.objectionCategory
        );
        
        return {
          id: resource.id || `res_${Date.now()}`,
          url: resource.url,
          title: resource.title,
          type: resource.type || 'blog_post',
          description: resource.description,
          relevanceScore,
          reason: this.generateReason(resource, relevanceScore),
        };
      });
      
      // Sort by relevance (descending) and take top 5
      const topResources = scoredResources
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);
      
      return {
        success: true,
        data: topResources,
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.error('Failed to match resources', error);
      return {
        success: false,
        error: error.message || 'Failed to match resources',
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private calculateRelevance(
    message: string,
    resource: any,
    objectionCategory: string
  ): number {
    let score = 0;
    
    // Title match (40% weight)
    const titleMatch = this.textSimilarity(
      message.toLowerCase(),
      resource.title.toLowerCase()
    );
    score += titleMatch * 0.4;
    
    // Description match (30% weight)
    if (resource.description) {
      const descMatch = this.textSimilarity(
        message.toLowerCase(),
        resource.description.toLowerCase()
      );
      score += descMatch * 0.3;
    }
    
    // Category match (20% weight)
    if (resource.category === objectionCategory) {
      score += 0.2;
    }
    
    // Keyword match (10% weight)
    const keywords = this.extractKeywords(message);
    const keywordMatches = keywords.filter(kw =>
      resource.title.toLowerCase().includes(kw) ||
      resource.description?.toLowerCase().includes(kw)
    ).length;
    score += (keywordMatches / Math.max(keywords.length, 1)) * 0.1;
    
    return Math.min(100, score * 100);
  }

  private textSimilarity(text1: string, text2: string): number {
    // Simple word overlap similarity
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    return intersection.size / Math.max(union.size, 1);
  }

  private extractKeywords(text: string): string[] {
    // Extract important keywords (simple implementation)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 3 && !stopWords.has(w)).slice(0, 10);
  }

  private generateReason(resource: any, score: number): string {
    if (score >= 80) {
      return `Highly relevant - directly addresses the topic`;
    } else if (score >= 60) {
      return `Relevant - covers related concepts`;
    } else {
      return `Somewhat relevant - may provide additional context`;
    }
  }
}

