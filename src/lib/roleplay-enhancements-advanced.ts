/**
 * Advanced Role-Play Engine Enhancements
 * Enhanced features for superior conversation quality
 */

import { Scenario, Persona, RoleplayState } from '@/types/roleplay';
import { ConversationContext } from './roleplay-enhancements';

export interface AdvancedConversationMetrics {
  coherence: number; // 0-100 - How well conversation flows
  relevance: number; // 0-100 - How relevant responses are
  naturalness: number; // 0-100 - How natural the conversation feels
  valueDelivery: number; // 0-100 - How well value props are delivered
  objectionResolution: number; // 0-100 - How well objections are resolved
  closingReadiness: number; // 0-100 - How ready prospect is to close
}

export interface ConversationMemory {
  keyPoints: Map<string, number>; // Key point -> mention count
  objections: string[];
  commitments: string[];
  concerns: string[];
  interests: string[];
  timeline: Array<{
    turn: number;
    event: string;
    importance: 'high' | 'medium' | 'low';
  }>;
}

export interface AdaptiveBehavior {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  responsiveness: 'high' | 'medium' | 'low'; // How quickly prospect responds
  skepticism: 'high' | 'medium' | 'low'; // How skeptical prospect is
  engagement: 'high' | 'medium' | 'low'; // How engaged prospect is
  nextAdjustment: {
    type: 'easier' | 'maintain' | 'harder';
    reason: string;
  };
}

/**
 * Build conversation memory from history
 */
export function buildConversationMemory(
  state: RoleplayState,
  scenario: Scenario
): ConversationMemory {
  const memory: ConversationMemory = {
    keyPoints: new Map(),
    objections: [],
    commitments: [],
    concerns: [],
    interests: [],
    timeline: [],
  };

  state.conversationHistory.forEach((msg, index) => {
    const turn = Math.floor(index / 2) + 1;
    const message = msg.message.toLowerCase();

    // Track key points
    scenario.keyPoints.forEach((kp) => {
      const keywords = kp.toLowerCase().split(' ');
      if (keywords.some((kw) => message.includes(kw))) {
        const count = memory.keyPoints.get(kp) || 0;
        memory.keyPoints.set(kp, count + 1);
      }
    });

    // Track objections
    if (msg.role === 'agent') {
      const objectionKeywords = ['but', 'however', 'concern', 'worried', 'issue', 'problem', 'expensive', 'cost'];
      if (objectionKeywords.some((kw) => message.includes(kw))) {
        memory.objections.push(msg.message);
        memory.timeline.push({
          turn,
          event: 'Objection raised',
          importance: 'high',
        });
      }
    }

    // Track commitments
    if (msg.role === 'agent') {
      const commitmentKeywords = ['yes', 'agree', 'interested', 'sounds good', 'let\'s do', 'schedule'];
      if (commitmentKeywords.some((kw) => message.includes(kw))) {
        memory.commitments.push(msg.message);
        memory.timeline.push({
          turn,
          event: 'Commitment made',
          importance: 'high',
        });
      }
    }

    // Track concerns
    if (msg.role === 'agent') {
      const concernKeywords = ['security', 'compliance', 'integration', 'cost', 'time', 'risk'];
      if (concernKeywords.some((kw) => message.includes(kw))) {
        if (!memory.concerns.includes(msg.message)) {
          memory.concerns.push(msg.message);
        }
      }
    }

    // Track interests
    if (msg.role === 'agent') {
      const interestKeywords = ['tell me more', 'how does', 'what about', 'interesting', 'curious'];
      if (interestKeywords.some((kw) => message.includes(kw))) {
        memory.interests.push(msg.message);
        memory.timeline.push({
          turn,
          event: 'Interest shown',
          importance: 'medium',
        });
      }
    }
  });

  return memory;
}

/**
 * Calculate advanced conversation metrics
 */
export function calculateAdvancedMetrics(
  context: ConversationContext,
  memory: ConversationMemory
): AdvancedConversationMetrics {
  // Coherence: How well conversation flows
  const turnCount = context.turnNumber;
  const avgMessageLength = context.conversationHistory.reduce(
    (sum, msg) => sum + msg.message.length,
    0
  ) / context.conversationHistory.length;
  const coherence = Math.min(100, (turnCount * 10) + (avgMessageLength / 20));

  // Relevance: How relevant responses are
  const keyPointsCovered = context.keyPointsMentioned.length;
  const totalKeyPoints = context.scenario.keyPoints.length;
  const relevance = (keyPointsCovered / totalKeyPoints) * 100;

  // Naturalness: How natural conversation feels
  const questionCount = context.conversationHistory.filter((msg) =>
    msg.message.includes('?')
  ).length;
  const naturalness = Math.min(100, (questionCount / turnCount) * 50 + 50);

  // Value Delivery: How well value props are delivered
  const valueDelivery = (keyPointsCovered / totalKeyPoints) * 100;

  // Objection Resolution: How well objections are resolved
  const objectionsResolved = memory.objections.length > 0
    ? Math.min(100, (memory.commitments.length / memory.objections.length) * 100)
    : 50;
  const objectionResolution = objectionsResolved;

  // Closing Readiness: How ready prospect is to close
  const commitmentScore = memory.commitments.length * 20;
  const interestScore = memory.interests.length * 15;
  const closingReadiness = Math.min(100, commitmentScore + interestScore + context.progressToClose * 0.3);

  return {
    coherence,
    relevance,
    naturalness,
    valueDelivery,
    objectionResolution,
    closingReadiness,
  };
}

/**
 * Calculate adaptive behavior based on performance
 */
export function calculateAdaptiveBehavior(
  context: ConversationContext,
  metrics: AdvancedConversationMetrics,
  recentScores: number[]
): AdaptiveBehavior {
  // Determine difficulty
  let difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate';
  if (recentScores.length > 0) {
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    if (avgScore >= 90) difficulty = 'expert';
    else if (avgScore >= 75) difficulty = 'advanced';
    else if (avgScore >= 60) difficulty = 'intermediate';
    else difficulty = 'beginner';
  }

  // Determine responsiveness
  const avgResponseTime = context.conversationHistory.length / context.turnNumber;
  let responsiveness: 'high' | 'medium' | 'low' = 'medium';
  if (avgResponseTime < 2) responsiveness = 'high';
  else if (avgResponseTime > 4) responsiveness = 'low';

  // Determine skepticism
  let skepticism: 'high' | 'medium' | 'low' = 'medium';
  if (context.sentiment === 'negative') skepticism = 'high';
  else if (context.sentiment === 'positive') skepticism = 'low';

  // Determine engagement
  let engagement: 'high' | 'medium' | 'low' = 'medium';
  if (context.engagementLevel >= 70) engagement = 'high';
  else if (context.engagementLevel < 40) engagement = 'low';

  // Determine next adjustment
  let nextAdjustment: { type: 'easier' | 'maintain' | 'harder'; reason: string } = {
    type: 'maintain',
    reason: 'Performance is stable',
  };

  if (metrics.objectionResolution < 40 && context.turnNumber > 5) {
    nextAdjustment = {
      type: 'easier',
      reason: 'Struggling with objections - reducing difficulty',
    };
  } else if (metrics.closingReadiness > 80 && context.turnNumber < 4) {
    nextAdjustment = {
      type: 'harder',
      reason: 'Performing exceptionally - increasing challenge',
    };
  } else if (metrics.valueDelivery < 50 && context.turnNumber > 3) {
    nextAdjustment = {
      type: 'easier',
      reason: 'Not covering value props - providing more guidance',
    };
  }

  return {
    difficulty,
    responsiveness,
    skepticism,
    engagement,
    nextAdjustment,
  };
}

/**
 * Generate enhanced conversation insights
 */
export function generateEnhancedInsights(
  context: ConversationContext,
  memory: ConversationMemory,
  metrics: AdvancedConversationMetrics,
  behavior: AdaptiveBehavior
): {
  strengths: string[];
  opportunities: string[];
  criticalActions: string[];
  nextSteps: string[];
} {
  const insights = {
    strengths: [] as string[],
    opportunities: [] as string[],
    criticalActions: [] as string[],
    nextSteps: [] as string[],
  };

  // Strengths
  if (metrics.coherence > 75) {
    insights.strengths.push('Maintaining excellent conversation flow');
  }
  if (metrics.valueDelivery > 70) {
    insights.strengths.push('Effectively communicating value propositions');
  }
  if (metrics.objectionResolution > 70) {
    insights.strengths.push('Successfully resolving objections');
  }
  if (behavior.engagement === 'high') {
    insights.strengths.push('Keeping prospect highly engaged');
  }

  // Opportunities
  if (metrics.valueDelivery < 50) {
    insights.opportunities.push(`Only ${context.keyPointsMentioned.length}/${context.scenario.keyPoints.length} key points covered`);
  }
  if (metrics.objectionResolution < 50 && memory.objections.length > 0) {
    insights.opportunities.push(`${memory.objections.length} objections raised but not fully resolved`);
  }
  if (metrics.closingReadiness < 40 && context.turnNumber > 5) {
    insights.opportunities.push('Low closing readiness - need to move toward next steps');
  }
  if (behavior.engagement === 'low') {
    insights.opportunities.push('Prospect engagement is declining - re-engage');
  }

  // Critical Actions
  if (memory.objections.length > 2 && metrics.objectionResolution < 40) {
    insights.criticalActions.push('Address outstanding objections before proceeding');
  }
  if (metrics.closingReadiness > 70 && context.turnNumber >= 4) {
    insights.criticalActions.push('Prospect is ready - propose next steps now');
  }
  if (context.keyPointsMentioned.length < context.scenario.keyPoints.length * 0.5 && context.turnNumber > 3) {
    insights.criticalActions.push('Cover remaining key value propositions');
  }

  // Next Steps
  if (metrics.closingReadiness > 60) {
    insights.nextSteps.push('Schedule a meeting or demo');
    insights.nextSteps.push('Discuss implementation timeline');
  } else {
    insights.nextSteps.push('Continue addressing concerns');
    insights.nextSteps.push('Build more interest before closing');
  }

  if (behavior.nextAdjustment.type === 'easier') {
    insights.nextSteps.push('Focus on fundamentals - difficulty will be reduced');
  } else if (behavior.nextAdjustment.type === 'harder') {
    insights.nextSteps.push('Challenge increased - maintain high performance');
  }

  return insights;
}

/**
 * Build ultra-enhanced system prompt with all context
 */
export function buildUltraEnhancedPrompt(
  persona: Persona,
  context: ConversationContext,
  memory: ConversationMemory,
  metrics: AdvancedConversationMetrics,
  behavior: AdaptiveBehavior,
  scenarioInput: any
): string {
  return `# Ultra-Enhanced Role-Play System

## Persona: ${persona.name}
* Current Solution: ${persona.currentSolution}
* Primary Goal: ${persona.primaryGoal}
* Skepticism: ${persona.skepticism}
* Tone: ${persona.tone}

## Advanced Conversation Context
* Turn: ${context.turnNumber}
* Sentiment: ${context.sentiment}
* Engagement: ${context.engagementLevel}% (${behavior.engagement})
* Progress to Close: ${context.progressToClose}%
* Difficulty: ${behavior.difficulty}
* Responsiveness: ${behavior.responsiveness}
* Skepticism Level: ${behavior.skepticism}

## Conversation Memory
* Key Points Mentioned: ${context.keyPointsMentioned.length}/${context.scenario.keyPoints.length}
* Objections Raised: ${memory.objections.length}
* Commitments Made: ${memory.commitments.length}
* Concerns Identified: ${memory.concerns.length}
* Interests Shown: ${memory.interests.length}

## Performance Metrics
* Coherence: ${metrics.coherence.toFixed(0)}/100
* Relevance: ${metrics.relevance.toFixed(0)}/100
* Value Delivery: ${metrics.valueDelivery.toFixed(0)}/100
* Objection Resolution: ${metrics.objectionResolution.toFixed(0)}/100
* Closing Readiness: ${metrics.closingReadiness.toFixed(0)}/100

## Adaptive Behavior
* Current Difficulty: ${behavior.difficulty}
* Next Adjustment: ${behavior.nextAdjustment.type} - ${behavior.nextAdjustment.reason}

## Conversation Timeline
${memory.timeline.slice(-5).map((event) => 
  `Turn ${event.turn}: ${event.event} (${event.importance})`
).join('\n')}

## Response Guidelines
1. **Context Awareness**: Reference previous conversation naturally
2. **Adaptive Difficulty**: Adjust based on ${behavior.difficulty} level
3. **Sentiment Management**: Current sentiment is ${context.sentiment} - respond accordingly
4. **Engagement**: ${behavior.engagement} engagement - ${behavior.engagement === 'low' ? 're-engage' : 'maintain'}
5. **Closing**: ${metrics.closingReadiness > 60 ? 'Ready to close - move toward next steps' : 'Continue building interest'}

## Output Format
Return JSON only with enhanced context awareness:
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
    "builds_on_conversation": boolean,
    "natural_progression": boolean
  },
  "adaptive_metrics": {
    "coherence": ${metrics.coherence.toFixed(0)},
    "relevance": ${metrics.relevance.toFixed(0)},
    "closing_readiness": ${metrics.closingReadiness.toFixed(0)}
  }
}`;
}

