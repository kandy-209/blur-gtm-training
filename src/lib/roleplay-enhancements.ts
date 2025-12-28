/**
 * Role-Play Engine Enhancements
 * Advanced features for improved conversation quality and user experience
 */

import { Scenario, Persona, RoleplayState } from '@/types/roleplay';

export interface ConversationContext {
  scenario: Scenario;
  conversationHistory: Array<{ role: 'rep' | 'agent'; message: string; timestamp: Date }>;
  turnNumber: number;
  keyPointsMentioned: string[];
  objectionsRaised: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementLevel: number; // 0-100
  progressToClose: number; // 0-100
}

export interface EnhancedResponse {
  response: string;
  contextAwareness: {
    referencesPreviousTurns: boolean;
    addressesObjection: boolean;
    buildsOnConversation: boolean;
  };
  adaptiveDifficulty: {
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    suggestedAdjustment: 'easier' | 'maintain' | 'harder';
  };
  conversationQuality: {
    coherence: number; // 0-100
    relevance: number; // 0-100
    naturalness: number; // 0-100
  };
}

/**
 * Analyze conversation context for enhanced responses
 */
export function analyzeConversationContext(
  state: RoleplayState,
  scenario: Scenario
): ConversationContext {
  const history = state.conversationHistory;
  const keyPointsMentioned: string[] = [];
  const objectionsRaised: string[] = [];
  
  // Track key points mentioned
  history.forEach((msg) => {
    if (msg.role === 'rep') {
      scenario.keyPoints.forEach((point) => {
        const keywords = point.toLowerCase().split(' ');
        if (keywords.some((kw) => msg.message.toLowerCase().includes(kw))) {
          if (!keyPointsMentioned.includes(point)) {
            keyPointsMentioned.push(point);
          }
        }
      });
    }
  });

  // Analyze sentiment
  const positiveWords = ['great', 'excellent', 'perfect', 'yes', 'interested', 'sounds good'];
  const negativeWords = ['no', 'not', "don't", "can't", 'concerned', 'worried', 'expensive'];
  
  const lastAgentMessage = history
    .filter((h) => h.role === 'agent')
    .slice(-1)[0]?.message.toLowerCase() || '';
  
  const positiveCount = positiveWords.filter((w) => lastAgentMessage.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => lastAgentMessage.includes(w)).length;
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';

  // Calculate engagement level
  const messageLengths = history.map((h) => h.message.length);
  const avgLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;
  const engagementLevel = Math.min(100, Math.max(0, (avgLength / 200) * 100));

  // Calculate progress to close
  const meetingIndicators = ['meeting', 'schedule', 'demo', 'call', 'time'];
  const saleIndicators = ['purchase', 'buy', 'move forward', 'commit', 'deal'];
  
  const recentMessages = history.slice(-3).map((h) => h.message.toLowerCase()).join(' ');
  const meetingMentions = meetingIndicators.filter((w) => recentMessages.includes(w)).length;
  const saleMentions = saleIndicators.filter((w) => recentMessages.includes(w)).length;
  
  const progressToClose = Math.min(100, (meetingMentions * 20) + (saleMentions * 30) + (state.turnNumber * 5));

  return {
    scenario,
    conversationHistory: history,
    turnNumber: state.turnNumber,
    keyPointsMentioned,
    objectionsRaised,
    sentiment,
    engagementLevel,
    progressToClose,
  };
}

/**
 * Generate enhanced system prompt with context awareness
 */
export function buildEnhancedSystemPrompt(
  persona: Persona,
  context: ConversationContext,
  scenarioInput: any
): string {
  const basePrompt = `# Enhanced Role-Play System with Context Awareness

## Persona: ${persona.name}
* Current Solution: ${persona.currentSolution}
* Primary Goal: ${persona.primaryGoal}
* Skepticism: ${persona.skepticism}
* Tone: ${persona.tone}

## Conversation Context
* Turn Number: ${context.turnNumber}
* Sentiment: ${context.sentiment}
* Engagement Level: ${context.engagementLevel}%
* Progress to Close: ${context.progressToClose}%
* Key Points Mentioned: ${context.keyPointsMentioned.length}/${context.scenario.keyPoints.length}

## Key Points Status
${context.scenario.keyPoints.map((kp, idx) => {
  const mentioned = context.keyPointsMentioned.includes(kp);
  return `${idx + 1}. ${kp} ${mentioned ? '✓' : '✗'}`;
}).join('\n')}

## Adaptive Behavior
${context.turnNumber <= 3 
  ? 'Early Stage: Focus on objections and concerns. Be skeptical but open to learning.'
  : context.turnNumber <= 6
  ? 'Middle Stage: Show increasing interest. Ask about Enterprise features, pricing, implementation.'
  : 'Late Stage: Show strong interest. Discuss next steps, timelines, and be ready to commit.'
}

## Response Guidelines
1. Reference previous conversation naturally
2. Build on what the rep has said
3. Show progression in interest based on turn number
4. Address concerns that haven't been fully resolved
5. Gradually warm up as the rep addresses your concerns well

## Output Format
Return JSON only:
{
  "agent_response_text": "[Your response as the prospect]",
  "scoring_feedback": "[Brief assessment]",
  "response_evaluation": "[PASS | FAIL | REJECT]",
  "next_step_action": "[FOLLOW_UP | REJECT_AND_RESTATE | MEETING_BOOKED | ENTERPRISE_SALE | END_SCENARIO]",
  "confidence_score": [50-100],
  "sale_indicators": {
    "meeting_agreed": boolean,
    "enterprise_interest": boolean,
    "next_steps_discussed": boolean
  },
  "context_awareness": {
    "references_previous": boolean,
    "addresses_objection": boolean,
    "builds_on_conversation": boolean
  }
}`;

  return basePrompt;
}

/**
 * Calculate adaptive difficulty based on performance
 */
export function calculateAdaptiveDifficulty(
  context: ConversationContext,
  recentScores: number[]
): 'beginner' | 'intermediate' | 'advanced' {
  if (recentScores.length === 0) return 'intermediate';
  
  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const consistency = recentScores.every((s) => Math.abs(s - avgScore) < 10);
  
  if (avgScore >= 85 && consistency) return 'advanced';
  if (avgScore >= 70) return 'intermediate';
  return 'beginner';
}

/**
 * Generate conversation insights
 */
export function generateConversationInsights(context: ConversationContext): {
  strengths: string[];
  opportunities: string[];
  recommendations: string[];
} {
  const insights = {
    strengths: [] as string[],
    opportunities: [] as string[],
    recommendations: [] as string[],
  };

  // Analyze strengths
  if (context.keyPointsMentioned.length >= context.scenario.keyPoints.length * 0.7) {
    insights.strengths.push('Covering most key value propositions');
  }
  
  if (context.engagementLevel > 70) {
    insights.strengths.push('Maintaining high engagement');
  }
  
  if (context.progressToClose > 60) {
    insights.strengths.push('Making good progress toward close');
  }

  // Identify opportunities
  const missingKeyPoints = context.scenario.keyPoints.filter(
    (kp) => !context.keyPointsMentioned.includes(kp)
  );
  
  if (missingKeyPoints.length > 0) {
    insights.opportunities.push(`Haven't mentioned: ${missingKeyPoints[0]}`);
  }
  
  if (context.sentiment === 'negative' && context.turnNumber > 3) {
    insights.opportunities.push('Prospect sentiment is negative - address concerns more directly');
  }
  
  if (context.progressToClose < 30 && context.turnNumber > 5) {
    insights.opportunities.push('Progress to close is slow - try more direct approach');
  }

  // Generate recommendations
  if (context.turnNumber <= 3) {
    insights.recommendations.push('Focus on understanding prospect needs and addressing initial objections');
  } else if (context.turnNumber <= 6) {
    insights.recommendations.push('Start discussing Enterprise features and ROI');
  } else {
    insights.recommendations.push('Move toward next steps and meeting booking');
  }
  
  if (context.keyPointsMentioned.length < context.scenario.keyPoints.length * 0.5) {
    insights.recommendations.push('Cover more key value propositions');
  }

  return insights;
}

