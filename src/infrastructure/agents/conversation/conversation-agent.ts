/**
 * Advanced Conversation Agent
 * Realistic objection handling, difficulty levels, personality settings
 */

import { ProspectPersona } from '@/domain/entities/prospect-persona';
import { ConversationMessage } from '@/domain/entities/discovery-call';

export interface ConversationContext {
  persona: ProspectPersona;
  conversationHistory: ConversationMessage[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  personality: 'friendly' | 'professional' | 'skeptical' | 'abrasive' | 'hostile';
  salesMethodology?: 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT' | null;
}

export interface ObjectionState {
  objectionRaised: boolean;
  timesRaised: number;
  objectionType: string | null;
  pushbackLevel: number; // 0-1, how hard they're pushing back
}

export interface ConversationResponse {
  message: string;
  objectionState: ObjectionState;
  buyingSignals: string[];
  concerns: string[];
  nextQuestion?: string;
}

export class ConversationAgent {
  private objectionHandling: Map<string, number> = new Map();
  private conversationFlow: string[] = [];

  /**
   * Generate realistic prospect response
   * Implements realistic objection handling that doesn't roll over
   */
  async generateResponse(
    repMessage: string,
    context: ConversationContext
  ): Promise<ConversationResponse> {
    // Analyze rep message for potential objections
    const objectionTriggers = this.detectObjectionTriggers(repMessage);
    
    // Get current objection state
    const objectionState = this.getObjectionState(context, objectionTriggers);

    // Generate response based on difficulty and personality
    const response = await this.generateResponseBasedOnPersonality(
      repMessage,
      context,
      objectionState
    );

    // Update objection handling tracking
    this.updateObjectionTracking(objectionTriggers, objectionState);

    return {
      message: response,
      objectionState,
      buyingSignals: this.detectBuyingSignals(context),
      concerns: this.detectConcerns(context),
      nextQuestion: this.generateNextQuestion(context),
    };
  }

  private detectObjectionTriggers(message: string): string[] {
    const triggers: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Price objections
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
      triggers.push('price');
    }

    // Timing objections
    if (lowerMessage.includes('timing') || lowerMessage.includes('now') || lowerMessage.includes('later')) {
      triggers.push('timing');
    }

    // Authority objections
    if (lowerMessage.includes('decision') || lowerMessage.includes('approve') || lowerMessage.includes('budget')) {
      triggers.push('authority');
    }

    // Need objections
    if (lowerMessage.includes('need') || lowerMessage.includes('problem') || lowerMessage.includes('pain')) {
      triggers.push('need');
    }

    return triggers;
  }

  private getObjectionState(
    context: ConversationContext,
    triggers: string[]
  ): ObjectionState {
    const history = context.conversationHistory;
    const lastObjection = this.objectionHandling.get('last') || 0;

    // Count how many times objections have been raised
    let timesRaised = 0;
    for (const msg of history) {
      if (msg.role === 'prospect') {
        const msgTriggers = this.detectObjectionTriggers(msg.message);
        if (msgTriggers.length > 0) {
          timesRaised++;
        }
      }
    }

    // Determine pushback level based on difficulty
    let pushbackLevel = 0.3; // Base level
    if (context.difficulty === 'hard') pushbackLevel = 0.6;
    if (context.difficulty === 'expert') pushbackLevel = 0.9;
    if (context.personality === 'abrasive') pushbackLevel += 0.2;
    if (context.personality === 'hostile') pushbackLevel += 0.3;

    // Increase pushback if objection raised multiple times
    pushbackLevel += Math.min(timesRaised * 0.1, 0.3);

    return {
      objectionRaised: triggers.length > 0,
      timesRaised,
      objectionType: triggers[0] || null,
      pushbackLevel: Math.min(pushbackLevel, 1.0),
    };
  }

  private async generateResponseBasedOnPersonality(
    repMessage: string,
    context: ConversationContext,
    objectionState: ObjectionState
  ): Promise<string> {
    const persona = context.persona;
    const difficulty = context.difficulty;
    const personality = context.personality;

    // Base response template
    let response = '';

    // Handle objections with realistic pushback
    if (objectionState.objectionRaised && objectionState.pushbackLevel > 0.5) {
      // High pushback - don't roll over
      response = this.generatePushbackResponse(
        repMessage,
        objectionState,
        personality
      );
    } else if (objectionState.objectionRaised) {
      // Moderate pushback
      response = this.generateModerateResponse(
        repMessage,
        objectionState,
        personality
      );
    } else {
      // No objection, normal conversation
      response = this.generateNormalResponse(
        repMessage,
        persona,
        personality
      );
    }

    // Adjust based on difficulty
    if (difficulty === 'expert') {
      response = this.makeMoreChallenging(response, persona);
    }

    return response;
  }

  private generatePushbackResponse(
    repMessage: string,
    objectionState: ObjectionState,
    personality: string
  ): string {
    const responses: Record<string, string[]> = {
      price: [
        "I appreciate you sharing that, but we've evaluated similar solutions and the ROI just doesn't justify that price point for us right now.",
        "That's significantly higher than what we budgeted. Can you help me understand what we're getting that justifies that premium?",
        "I'm not sure that price point works for us. What flexibility do you have?",
      ],
      timing: [
        "We're not in a position to make changes right now. Our Q1 is already locked in.",
        "I understand the urgency, but we have other priorities that need attention first.",
        "The timing isn't ideal. We're focused on other initiatives.",
      ],
      authority: [
        "I'd need to get buy-in from several stakeholders before we could move forward.",
        "This isn't my decision alone. I'd need to present this to the team.",
        "I can't commit without discussing this with my manager and the finance team.",
      ],
      need: [
        "I'm not sure we have the problem you're describing. Can you help me understand why this is urgent?",
        "We've been managing fine without this. What's changed that makes this necessary now?",
        "I need to see more concrete evidence that this solves a real problem for us.",
      ],
    };

    const typeResponses = responses[objectionState.objectionType || 'price'] || responses.price;
    let response = typeResponses[Math.floor(Math.random() * typeResponses.length)];

    // Make more abrasive if personality demands it
    if (personality === 'abrasive') {
      response = response.replace(/I appreciate/g, "I'm not sure");
      response = response.replace(/Can you help/g, "You need to show");
    }

    if (personality === 'hostile') {
      response = response.replace(/I appreciate/g, "");
      response = response.replace(/Can you help/g, "You'll need to prove");
      response = "Look, " + response.toLowerCase();
    }

    return response;
  }

  private generateModerateResponse(
    repMessage: string,
    objectionState: ObjectionState,
    personality: string
  ): string {
    const responses: Record<string, string[]> = {
      price: [
        "That's interesting. Can you walk me through the pricing structure?",
        "I'd like to understand the value proposition better before we discuss pricing.",
        "Let me think about that. What kind of ROI have other companies seen?",
      ],
      timing: [
        "When would be a better time to revisit this?",
        "I understand. What would need to change for the timing to work?",
        "That makes sense. What's your typical implementation timeline?",
      ],
      authority: [
        "Who else would be involved in this decision?",
        "What's the approval process like at your company?",
        "I'd like to understand the decision-making process.",
      ],
      need: [
        "Can you help me understand your current challenges?",
        "What's working well for you now, and what isn't?",
        "I'd like to learn more about your specific use case.",
      ],
    };

    const typeResponses = responses[objectionState.objectionType || 'price'] || responses.price;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  }

  private generateNormalResponse(
    repMessage: string,
    persona: ProspectPersona,
    personality: string
  ): string {
    // Generate contextually relevant response
    const responses = [
      "That's interesting. Tell me more about how that works.",
      "I see. How does that compare to what we're doing now?",
      "Can you give me an example of how that would work in our environment?",
      "That makes sense. What's the typical implementation process?",
      "I'd like to understand more about that. Can you elaborate?",
    ];

    let response = responses[Math.floor(Math.random() * responses.length)];

    // Adjust based on personality
    if (personality === 'friendly') {
      response = "Thanks for sharing that! " + response;
    } else if (personality === 'skeptical') {
      response = "I'm not sure I follow. " + response;
    } else if (personality === 'professional') {
      response = "Understood. " + response;
    }

    return response;
  }

  private makeMoreChallenging(response: string, persona: ProspectPersona): string {
    // Add technical depth for expert difficulty
    if (persona.communicationStyle.usesTechnicalTerms) {
      response = response + " Specifically, how does this handle edge cases in distributed systems?";
    }
    return response;
  }

  private detectBuyingSignals(context: ConversationContext): string[] {
    const signals: string[] = [];
    const history = context.conversationHistory;

    for (const msg of history) {
      const lower = msg.message.toLowerCase();
      if (lower.includes('how much') || lower.includes('pricing')) {
        signals.push('price_inquiry');
      }
      if (lower.includes('timeline') || lower.includes('when can')) {
        signals.push('timeline_interest');
      }
      if (lower.includes('next steps') || lower.includes('what happens')) {
        signals.push('process_interest');
      }
    }

    return signals;
  }

  private detectConcerns(context: ConversationContext): string[] {
    return context.persona.concerns;
  }

  private generateNextQuestion(context: ConversationContext): string | undefined {
    // Generate next question based on sales methodology
    if (context.salesMethodology === 'GAP') {
      return "What's the gap between where you are and where you want to be?";
    } else if (context.salesMethodology === 'SPIN') {
      return "What's the impact of this problem on your team?";
    }
    return undefined;
  }

  private updateObjectionTracking(triggers: string[], state: ObjectionState): void {
    if (triggers.length > 0) {
      this.objectionHandling.set('last', state.timesRaised);
    }
  }
}

