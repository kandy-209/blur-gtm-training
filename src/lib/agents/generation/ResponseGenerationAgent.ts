import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '../base/Agent';
import { getAIProvider } from '@/lib/ai-providers';
import { ContinuousLearningAgent } from '@/lib/ml/continuous-learning';
import { db } from '@/lib/db';

export interface ResponseGenerationInput {
  objection: string;
  conversationHistory: Array<{ role: string; message: string }>;
  persona: {
    name: string;
    currentSolution: string;
    primaryGoal: string;
    skepticism: string;
    tone: string;
  };
  turnNumber: number;
}

export interface ResponseGenerationOutput {
  response: string;
  confidence: number;
  keyPoints: string[];
  reasoning: string;
}

export class ResponseGenerationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ResponseGenerationAgent',
      description: 'Generates contextual sales responses using AI',
      version: '1.0.0',
      timeout: 30000,
      retries: 3,
    });
  }

  async execute(
    input: ResponseGenerationInput,
    context?: AgentContext
  ): Promise<AgentResult<ResponseGenerationOutput>> {
    const startTime = Date.now();
    
    try {
      this.setContext(context || {});
      
      // Try to use learned patterns for better responses
      let enhancedResponse: ResponseGenerationOutput | null = null;
      
      if (context?.objectionCategory) {
        try {
          const improved = await ContinuousLearningAgent.generateImprovedResponse(
            input.objection,
            context.objectionCategory,
            input.conversationHistory,
            input.persona
          );
          
          enhancedResponse = {
            response: improved.response,
            confidence: improved.confidence,
            keyPoints: improved.improvements,
            reasoning: `Generated using learned patterns. ${improved.improvements.join('; ')}`,
          };
        } catch (error) {
          // Fall back to standard generation
          this.log('Failed to use learned patterns, using standard generation', error);
        }
      }
      
      // If enhanced response failed, use standard generation
      if (!enhancedResponse) {
        const systemPrompt = this.buildSystemPrompt(input.persona, input);
        const messages = this.formatMessages(input.conversationHistory, input.objection);
        
        const aiProvider = getAIProvider();
        const rawResponse = await this.withRetry(() =>
          aiProvider.generateResponse(messages, systemPrompt)
        );
        
        enhancedResponse = this.parseResponse(rawResponse);
      }
      
      return {
        success: true,
        data: enhancedResponse,
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
          confidence: enhancedResponse.confidence,
        },
      };
    } catch (error: any) {
      this.error('Failed to generate response', error);
      return {
        success: false,
        error: error.message || 'Failed to generate response',
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private buildSystemPrompt(persona: any, input: ResponseGenerationInput): string {
    return `You are a sales rep responding to a prospect objection.

PROSPECT PERSONA:
- Name: ${persona.name}
- Current Solution: ${persona.currentSolution}
- Primary Goal: ${persona.primaryGoal}
- Skepticism: ${persona.skepticism}
- Tone: ${persona.tone}

OBJECTION: ${input.objection}

CONVERSATION CONTEXT:
Turn ${input.turnNumber} of the conversation.

Generate a response that:
1. Addresses the objection directly
2. Uses Cursor's key value propositions
3. Matches the prospect's technical level
4. Moves the conversation forward

Return JSON:
{
  "response": "Your response text",
  "confidence": 85,
  "keyPoints": ["point1", "point2"],
  "reasoning": "Why this response works"
}`;
  }

  private formatMessages(
    history: Array<{ role: string; message: string }>,
    objection: string
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages = history.map(msg => ({
      role: (msg.role === 'rep' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.message,
    }));
    
    messages.push({
      role: 'user',
      content: objection,
    });
    
    return messages;
  }

  private parseResponse(rawResponse: string): ResponseGenerationOutput {
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      return {
        response: rawResponse,
        confidence: 70,
        keyPoints: [],
        reasoning: 'Generated response',
      };
    }
  }
}

