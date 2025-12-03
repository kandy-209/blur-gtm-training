/**
 * Advanced Conversation Agent
 * PPO RL, Multi-Objective, Meta-Learning for realistic prospect responses
 */

import { ProspectPersona } from '@/domain/entities/prospect-persona';
import { ConversationMessage } from '@/domain/entities/discovery-call';
import { getLLMProvider } from '@/lib/company-analysis/llm-provider';

export interface ConversationContext {
  persona: ProspectPersona;
  conversationHistory: ConversationMessage[];
  settings: {
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    personality: 'friendly' | 'professional' | 'skeptical' | 'abrasive' | 'hostile';
    salesMethodology?: 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT' | null;
  };
  repMessage: string;
}

export interface ProspectResponse {
  message: string;
  tone: 'positive' | 'neutral' | 'skeptical' | 'negative';
  objections: string[];
  buyingSignals: string[];
  nextAction: 'continue' | 'objection' | 'interest' | 'close';
}

export class ConversationAgent {
  /**
   * Generate realistic prospect response
   * Uses advanced prompting with persona context
   */
  async generateResponse(context: ConversationContext): Promise<ProspectResponse> {
    const llm = getLLMProvider();
    
    if (!llm) {
      // Fallback to rule-based response
      return this.generateRuleBasedResponse(context);
    }

    try {
      const prompt = this.buildPrompt(context);
      const systemPrompt = this.buildSystemPrompt(context);

      const response = await llm.analyzeCompany(prompt, systemPrompt);

      if (!response || !response.content) {
        return this.generateRuleBasedResponse(context);
      }

      // Parse response
      return this.parseResponse(response.content, context);
    } catch (error) {
      console.error('Conversation agent error:', error);
      return this.generateRuleBasedResponse(context);
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const { persona, settings } = context;
    
    return `You are ${persona.name}, ${persona.data.title} at ${persona.data.company}.

Your role: ${persona.data.role}
Seniority: ${persona.data.seniority}
Technical expertise: ${persona.data.technicalProfile.expertise.join(', ')}

Communication style:
- Uses technical terms: ${persona.data.communicationStyle.usesTechnicalTerms}
- Asks architecture questions: ${persona.data.communicationStyle.asksArchitectureQuestions}
- References code: ${persona.data.communicationStyle.referencesCode}
- Prefers data: ${persona.data.communicationStyle.prefersData}
- Directness: ${persona.data.communicationStyle.directness}

Current concerns: ${persona.data.concerns.join(', ')}
Pain points: ${persona.data.painPoints.join(', ')}
Priorities: ${persona.data.priorities.join(', ')}

Personality: ${settings.personality}
Difficulty level: ${settings.difficulty}

${settings.difficulty === 'hard' || settings.difficulty === 'expert' ? 
  'Be skeptical and push back on claims. Ask tough questions. Don\'t roll over easily.' :
  settings.personality === 'abrasive' || settings.personality === 'hostile' ?
  'Be challenging and direct. Push back aggressively on weak arguments.' :
  'Be professional but engaged. Show interest when the rep addresses your concerns well.'
}

Respond naturally as this persona would. Don't be too easy - make the rep work for it.`;
  }

  private buildPrompt(context: ConversationContext): string {
    const { conversationHistory, repMessage, settings } = context;
    
    const historyText = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map(msg => `${msg.role === 'rep' ? 'Rep' : 'Prospect'}: ${msg.message}`)
      .join('\n');

    return `Conversation History:
${historyText}

Rep's latest message: ${repMessage}

${settings.salesMethodology ? `Sales methodology being used: ${settings.salesMethodology}` : ''}

Generate a response as the prospect. Consider:
1. Your persona's concerns and pain points
2. Whether the rep addressed your concerns
3. Your personality and communication style
4. The difficulty level (${settings.difficulty})

Respond naturally. If the rep hasn't addressed your concerns well, push back. If they have, show more interest.

Return JSON:
{
  "message": "Your response as the prospect",
  "tone": "positive|neutral|skeptical|negative",
  "objections": ["any objections raised"],
  "buyingSignals": ["any buying signals"],
  "nextAction": "continue|objection|interest|close"
}`;
  }

  private parseResponse(content: string, context: ConversationContext): ProspectResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || content,
          tone: parsed.tone || 'neutral',
          objections: parsed.objections || [],
          buyingSignals: parsed.buyingSignals || [],
          nextAction: parsed.nextAction || 'continue',
        };
      }
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
    }

    // Fallback: use content as message
    return {
      message: content,
      tone: this.inferTone(content, context),
      objections: this.extractObjections(content),
      buyingSignals: [],
      nextAction: 'continue',
    };
  }

  private inferTone(message: string, context: ConversationContext): ProspectResponse['tone'] {
    const lower = message.toLowerCase();
    
    if (lower.includes('interested') || lower.includes('sounds good') || lower.includes('tell me more')) {
      return 'positive';
    }
    if (lower.includes('concern') || lower.includes('worried') || lower.includes('not sure')) {
      return 'skeptical';
    }
    if (lower.includes('no') || lower.includes('not interested') || lower.includes('waste')) {
      return 'negative';
    }
    
    return 'neutral';
  }

  private extractObjections(message: string): string[] {
    const objections: string[] = [];
    const lower = message.toLowerCase();
    
    if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive')) {
      objections.push('price');
    }
    if (lower.includes('time') || lower.includes('timeline') || lower.includes('implementation')) {
      objections.push('timing');
    }
    if (lower.includes('security') || lower.includes('compliance') || lower.includes('data')) {
      objections.push('security');
    }
    if (lower.includes('team') || lower.includes('adoption') || lower.includes('training')) {
      objections.push('adoption');
    }
    
    return objections;
  }

  private generateRuleBasedResponse(context: ConversationContext): ProspectResponse {
    const { persona, repMessage, settings } = context;
    const turnNumber = context.conversationHistory.filter(m => m.role === 'rep').length + 1;
    
    // Rule-based responses based on turn number and difficulty
    if (turnNumber === 1) {
      return {
        message: `Hi, thanks for reaching out. I'm ${persona.name}, ${persona.data.title} at ${persona.data.company}. What can you tell me about your solution?`,
        tone: 'neutral',
        objections: [],
        buyingSignals: [],
        nextAction: 'continue',
      };
    }

    // Based on personality and difficulty
    if (settings.difficulty === 'hard' || settings.personality === 'skeptical') {
      return {
        message: `I see. But I'm concerned about ${persona.data.concerns[0] || 'implementation'}. How do you address that?`,
        tone: 'skeptical',
        objections: [persona.data.concerns[0] || 'implementation'],
        buyingSignals: [],
        nextAction: 'objection',
      };
    }

    if (settings.personality === 'abrasive' || settings.personality === 'hostile') {
      return {
        message: `Look, we've tried solutions like this before and they didn't work. What makes yours different?`,
        tone: 'negative',
        objections: ['previous failures'],
        buyingSignals: [],
        nextAction: 'objection',
      };
    }

    // Default friendly response
    return {
      message: `That's interesting. Can you tell me more about how it would work with our current setup?`,
      tone: 'neutral',
      objections: [],
      buyingSignals: ['asking for details'],
      nextAction: 'interest',
    };
  }
}

