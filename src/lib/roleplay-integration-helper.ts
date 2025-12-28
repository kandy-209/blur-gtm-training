/**
 * Role-Play Integration Helper
 * Easy-to-use functions for integrating advanced enhancements
 */

import { RoleplayState, Scenario, Persona, AgentResponse } from '@/types/roleplay';
import { analyzeConversationContext, ConversationContext } from './roleplay-enhancements';
import {
  buildConversationMemory,
  calculateAdvancedMetrics,
  calculateAdaptiveBehavior,
  generateEnhancedInsights,
  buildUltraEnhancedPrompt,
  ConversationMemory,
  AdvancedConversationMetrics,
  AdaptiveBehavior,
} from './roleplay-enhancements-advanced';
import { generateGranularFeedback, GranularFeedback } from './feedback-enhancements';
import {
  generateAdvancedFeedback,
  AdvancedFeedback,
} from './feedback-enhancements-advanced';

/**
 * Complete conversation analysis
 * Returns all enhanced metrics and insights
 */
export function analyzeCompleteConversation(
  state: RoleplayState,
  scenario: Scenario,
  recentScores: number[] = []
): {
  context: ConversationContext;
  memory: ConversationMemory;
  metrics: AdvancedConversationMetrics;
  behavior: AdaptiveBehavior;
  insights: ReturnType<typeof generateEnhancedInsights>;
  enhancedPrompt: string;
} {
  const context = analyzeConversationContext(state, scenario);
  const memory = buildConversationMemory(state, scenario);
  const metrics = calculateAdvancedMetrics(context, memory);
  const behavior = calculateAdaptiveBehavior(context, metrics, recentScores);
  const insights = generateEnhancedInsights(context, memory, metrics, behavior);
  const enhancedPrompt = buildUltraEnhancedPrompt(
    scenario.persona,
    context,
    memory,
    metrics,
    behavior,
    {
      turn_number: state.turnNumber,
      scenario_id: scenario.id,
      objection_category: scenario.objection_category,
      objection_statement: scenario.objection_statement,
    }
  );

  return {
    context,
    memory,
    metrics,
    behavior,
    insights,
    enhancedPrompt,
  };
}

/**
 * Generate complete feedback with all enhancements
 */
export function generateCompleteFeedback(
  agentResponse: AgentResponse,
  state: RoleplayState,
  scenario: Scenario,
  historicalData: Record<string, Array<{ date: Date; score: number }>> = {},
  averageScores: Record<string, number> = {}
): {
  granular: GranularFeedback;
  advanced: AdvancedFeedback;
} {
  const context = analyzeConversationContext(state, scenario);
  const memory = buildConversationMemory(state, scenario);
  const metrics = calculateAdvancedMetrics(context, memory);

  // Generate granular feedback
  const granular = generateGranularFeedback(
    agentResponse,
    context,
    state.conversationHistory.map((h) => ({
      role: h.role,
      message: h.message,
    }))
  );

  // Generate advanced feedback
  const advanced = generateAdvancedFeedback(
    granular,
    context,
    memory,
    metrics,
    granular.skillScores,
    historicalData,
    averageScores
  );

  return {
    granular,
    advanced,
  };
}

/**
 * Get real-time coaching suggestions
 */
export function getRealTimeCoaching(
  state: RoleplayState,
  scenario: Scenario,
  currentMessage: string
): {
  suggestions: string[];
  warnings: string[];
  opportunities: string[];
  nextBestAction: string;
} {
  const context = analyzeConversationContext(state, scenario);
  const memory = buildConversationMemory(state, scenario);
  const metrics = calculateAdvancedMetrics(context, memory);

  const suggestions: string[] = [];
  const warnings: string[] = [];
  const opportunities: string[] = [];

  // Check for missing key points
  const missingKeyPoints = scenario.keyPoints.filter(
    (kp) => !context.keyPointsMentioned.includes(kp)
  );
  if (missingKeyPoints.length > 0 && context.turnNumber > 2) {
    suggestions.push(`Consider mentioning: ${missingKeyPoints[0]}`);
  }

  // Check engagement
  if (context.engagementLevel < 40) {
    warnings.push('Prospect engagement is low - re-engage with a question or compelling value prop');
  }

  // Check closing readiness
  if (metrics.closingReadiness > 70 && context.turnNumber >= 4) {
    opportunities.push('Prospect is ready to close - propose next steps now!');
  }

  // Check objection resolution
  if (metrics.objectionResolution < 40 && memory.objections.length > 0) {
    warnings.push('Outstanding objections need to be addressed');
  }

  // Determine next best action
  let nextBestAction = 'Continue conversation';
  if (metrics.closingReadiness > 70) {
    nextBestAction = 'Propose meeting or demo';
  } else if (metrics.objectionResolution < 50) {
    nextBestAction = 'Address outstanding objections';
  } else if (context.keyPointsMentioned.length < scenario.keyPoints.length * 0.7) {
    nextBestAction = 'Cover more key value propositions';
  } else if (context.engagementLevel < 50) {
    nextBestAction = 'Re-engage with questions or examples';
  }

  return {
    suggestions,
    warnings,
    opportunities,
    nextBestAction,
  };
}

/**
 * Quick integration function for RoleplayEngine
 */
export function enhanceRoleplayTurn(
  state: RoleplayState,
  scenario: Scenario,
  recentScores: number[] = []
): {
  enhancedPrompt: string;
  coaching: ReturnType<typeof getRealTimeCoaching>;
  metrics: AdvancedConversationMetrics;
} {
  const analysis = analyzeCompleteConversation(state, scenario, recentScores);
  const coaching = getRealTimeCoaching(state, scenario, '');

  return {
    enhancedPrompt: analysis.enhancedPrompt,
    coaching,
    metrics: analysis.metrics,
  };
}

