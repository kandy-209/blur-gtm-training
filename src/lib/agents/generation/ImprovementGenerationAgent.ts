import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '../base/Agent';
import { getAIProvider } from '@/lib/ai-providers';
import { db } from '@/lib/db';

export interface ImprovementGenerationInput {
  originalMessage: string;
  feedback?: string;
  objectionCategory: string;
  context?: AgentContext;
}

export interface ImprovementSuggestion {
  improvedMessage: string;
  improvementSummary: string;
  keyChanges: string[];
  expectedImpact: string;
  resourceLinks: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  confidenceScore: number;
}

export class ImprovementGenerationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ImprovementGenerationAgent',
      description: 'Generates improvement suggestions for sales messages',
      version: '1.0.0',
      timeout: 30000,
      retries: 2,
    });
  }

  async execute(
    input: ImprovementGenerationInput,
    context?: AgentContext
  ): Promise<AgentResult<ImprovementSuggestion[]>> {
    const startTime = Date.now();
    
    try {
      this.setContext(context || {});
      
      // Get top-performing responses for context
      const topResponses = await db.getTopResponses({
        objectionCategory: input.objectionCategory,
        minScore: 85,
        limit: 5,
      });
      
      // Get relevant resources (with fallback if method doesn't exist)
      let resources: any[] = [];
      try {
        resources = await (db as any).getResourcesByCategory?.(input.objectionCategory) || [];
      } catch {
        // Method may not exist yet, continue without resources
      }
      
      const suggestions = await this.generateImprovements(
        input.originalMessage,
        input.feedback,
        topResponses,
        resources
      );
      
      return {
        success: true,
        data: suggestions,
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
          confidence: suggestions[0]?.confidenceScore || 0,
        },
      };
    } catch (error: any) {
      this.error('Failed to generate improvements', error);
      return {
        success: false,
        error: error.message || 'Failed to generate improvements',
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private async generateImprovements(
    originalMessage: string,
    feedback: string | undefined,
    topResponses: any[],
    resources: any[]
  ): Promise<ImprovementSuggestion[]> {
    const aiProvider = getAIProvider();
    
    const prompt = `Analyze this sales message and suggest improvements.

ORIGINAL MESSAGE:
${originalMessage}

${feedback ? `USER FEEDBACK:\n${feedback}\n` : ''}

TOP-PERFORMING RESPONSES (for reference):
${topResponses.map((r, i) => `${i + 1}. ${r.response || r.userMessage || ''}`).join('\n')}

${resources.length > 0 ? `RELEVANT RESOURCES:\n${resources.map((r, i) => `${i + 1}. ${r.title}: ${r.url}`).join('\n')}` : ''}

Generate 2-3 improvement suggestions. For each, provide:
1. Improved message text
2. Brief explanation of changes
3. List of key changes
4. Expected impact on conversion
5. Relevant resource links (if any)

Return JSON array:
[
  {
    "improvedMessage": "...",
    "improvementSummary": "...",
    "keyChanges": ["change1", "change2"],
    "expectedImpact": "...",
    "resourceLinks": [{"title": "...", "url": "...", "type": "blog_post"}],
    "confidenceScore": 85
  }
]`;

    const response = await this.withRetry(() =>
      aiProvider.generateResponse(
        [{ role: 'user', content: prompt }],
        'You are a sales messaging expert. Provide structured JSON responses.'
      )
    );
    
    return this.parseSuggestions(response);
  }

  private parseSuggestions(response: string): ImprovementSuggestion[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON array found');
    } catch (error) {
      // Fallback: wrap response
      return [{
        improvedMessage: response,
        improvementSummary: 'AI-generated improvement',
        keyChanges: [],
        expectedImpact: 'Improved clarity and effectiveness',
        resourceLinks: [],
        confidenceScore: 75,
      }];
    }
  }
}

