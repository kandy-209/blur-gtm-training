/**
 * Advanced Feedback Enhancements
 * Ultra-granular feedback with AI-powered insights
 */

import { AgentResponse } from '@/types/roleplay';
import { ConversationContext, AdvancedConversationMetrics } from './roleplay-enhancements';
import { ConversationMemory } from './roleplay-enhancements-advanced';
import { GranularFeedback, SkillScore } from './feedback-enhancements';

export interface AdvancedSkillAnalysis {
  skill: string;
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  trend: 'improving' | 'stable' | 'declining';
  benchmark: {
    percentile: number;
    vsAverage: 'above' | 'at' | 'below';
    gap: number;
  };
  detailedFeedback: {
    whatWentWell: string[];
    whatNeedsWork: string[];
    specificExamples: string[];
  };
  improvementPath: {
    current: string;
    next: string;
    target: string;
    estimatedTime: string;
  };
  practiceRecommendations: string[];
}

export interface AIInsight {
  type: 'pattern' | 'opportunity' | 'warning' | 'strength';
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AdvancedFeedback extends GranularFeedback {
  advancedSkills: AdvancedSkillAnalysis[];
  aiInsights: AIInsight[];
  conversationQuality: {
    overall: number;
    breakdown: {
      coherence: number;
      relevance: number;
      naturalness: number;
      valueDelivery: number;
      objectionResolution: number;
    };
  };
  personalizedRecommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    rationale: string;
    expectedImpact: string;
    actionSteps: string[];
  }>;
  comparativeAnalysis: {
    vsLastSession: {
      improvement: number;
      areas: string[];
    };
    vsPeers: {
      percentile: number;
      strengths: string[];
      gaps: string[];
    };
  };
}

/**
 * Analyze skill with advanced metrics
 */
export function analyzeAdvancedSkill(
  skill: SkillScore,
  historicalData: Array<{ date: Date; score: number }>,
  averageScore: number
): AdvancedSkillAnalysis {
  // Calculate trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (historicalData.length >= 2) {
    const recent = historicalData.slice(-3);
    const older = historicalData.slice(0, -3);
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b.score, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b.score, 0) / older.length;
      if (recentAvg > olderAvg + 5) trend = 'improving';
      else if (recentAvg < olderAvg - 5) trend = 'declining';
    }
  }

  // Calculate benchmark
  const gap = skill.score - averageScore;
  const percentile = gap > 0
    ? Math.min(100, 50 + (gap / averageScore) * 50)
    : Math.max(0, 50 + (gap / averageScore) * 50);

  // Determine improvement path
  let current = skill.level;
  let next = 'intermediate';
  let target = 'advanced';
  let estimatedTime = '2-3 weeks';

  if (current === 'beginner') {
    next = 'intermediate';
    target = 'advanced';
    estimatedTime = '2-3 weeks';
  } else if (current === 'intermediate') {
    next = 'advanced';
    target = 'expert';
    estimatedTime = '3-4 weeks';
  } else if (current === 'advanced') {
    next = 'expert';
    target = 'expert';
    estimatedTime = '4-6 weeks';
  } else {
    next = 'expert';
    target = 'expert';
    estimatedTime = 'maintain';
  }

  return {
    skill: skill.skill,
    score: skill.score,
    level: skill.level,
    trend,
    benchmark: {
      percentile: Math.round(percentile),
      vsAverage: gap > 0 ? 'above' : gap < 0 ? 'below' : 'at',
      gap: Math.round(gap),
    },
    detailedFeedback: {
      whatWentWell: skill.score >= 70 ? [
        `Strong performance in ${skill.skill}`,
        skill.feedback,
      ] : [],
      whatNeedsWork: skill.score < 70 ? [
        `Focus on improving ${skill.skill}`,
        skill.feedback,
      ] : [],
      specificExamples: skill.improvementTips.slice(0, 2),
    },
    improvementPath: {
      current,
      next,
      target,
      estimatedTime,
    },
    practiceRecommendations: [
      `Practice ${skill.skill} in next 3 scenarios`,
      `Focus on: ${skill.improvementTips[0]}`,
      `Review feedback after each session`,
    ],
  };
}

/**
 * Generate AI-powered insights
 */
export function generateAIInsights(
  context: ConversationContext,
  memory: ConversationMemory,
  metrics: AdvancedConversationMetrics,
  skillScores: SkillScore[]
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Pattern detection
  if (memory.objections.length > 0 && memory.objections.length === memory.concerns.length) {
    insights.push({
      type: 'pattern',
      title: 'Objection Pattern Detected',
      description: 'You\'re consistently raising the same types of objections',
      confidence: 85,
      evidence: memory.objections.slice(0, 3),
      recommendation: 'Address root concerns more directly to prevent repeated objections',
      impact: 'high',
    });
  }

  // Opportunity detection
  if (metrics.closingReadiness > 70 && context.turnNumber >= 4) {
    insights.push({
      type: 'opportunity',
      title: 'Closing Window Open',
      description: 'Prospect is highly ready to close - optimal time to propose next steps',
      confidence: 90,
      evidence: [
        `Closing readiness: ${metrics.closingReadiness.toFixed(0)}%`,
        `Commitments made: ${memory.commitments.length}`,
      ],
      recommendation: 'Propose meeting or demo immediately',
      impact: 'high',
    });
  }

  // Warning detection
  if (context.engagementLevel < 40 && context.turnNumber > 3) {
    insights.push({
      type: 'warning',
      title: 'Engagement Declining',
      description: 'Prospect engagement is dropping - risk of losing interest',
      confidence: 80,
      evidence: [
        `Engagement level: ${context.engagementLevel.toFixed(0)}%`,
        `Sentiment: ${context.sentiment}`,
      ],
      recommendation: 'Re-engage with compelling value proposition or question',
      impact: 'high',
    });
  }

  // Strength detection
  const topSkills = skillScores
    .filter((s) => s.score >= 80)
    .sort((a, b) => b.score - a.score);
  
  if (topSkills.length > 0) {
    insights.push({
      type: 'strength',
      title: 'Exceptional Performance',
      description: `You're excelling in ${topSkills[0].skill}`,
      confidence: 95,
      evidence: [
        `${topSkills[0].skill}: ${topSkills[0].score}/100`,
        `Level: ${topSkills[0].level}`,
      ],
      recommendation: `Leverage ${topSkills[0].skill} strength in other scenarios`,
      impact: 'medium',
    });
  }

  // Value delivery opportunity
  if (metrics.valueDelivery < 50 && context.turnNumber > 3) {
    insights.push({
      type: 'opportunity',
      title: 'Value Delivery Gap',
      description: `Only ${context.keyPointsMentioned.length}/${context.scenario.keyPoints.length} key points covered`,
      confidence: 85,
      evidence: [
        `Value delivery: ${metrics.valueDelivery.toFixed(0)}%`,
        `Missing: ${context.scenario.keyPoints.filter((kp) => !context.keyPointsMentioned.includes(kp)).slice(0, 2).join(', ')}`,
      ],
      recommendation: 'Cover remaining key value propositions in next response',
      impact: 'high',
    });
  }

  return insights;
}

/**
 * Generate personalized recommendations
 */
export function generatePersonalizedRecommendations(
  context: ConversationContext,
  metrics: AdvancedConversationMetrics,
  skillScores: SkillScore[],
  memory: ConversationMemory
): AdvancedFeedback['personalizedRecommendations'] {
  const recommendations: AdvancedFeedback['personalizedRecommendations'] = [];

  // Critical recommendations
  if (metrics.objectionResolution < 40 && memory.objections.length > 2) {
    recommendations.push({
      priority: 'critical',
      category: 'Objection Handling',
      recommendation: 'Address outstanding objections before proceeding',
      rationale: `${memory.objections.length} objections raised but only ${metrics.objectionResolution.toFixed(0)}% resolved`,
      expectedImpact: 'High - Will improve closing readiness significantly',
      actionSteps: [
        'Acknowledge each objection explicitly',
        'Provide specific solutions for each concern',
        'Ask if concerns are fully addressed',
      ],
    });
  }

  if (metrics.closingReadiness > 70 && context.turnNumber >= 4) {
    recommendations.push({
      priority: 'critical',
      category: 'Closing',
      recommendation: 'Propose next steps immediately',
      rationale: `Closing readiness at ${metrics.closingReadiness.toFixed(0)}% - optimal window`,
      expectedImpact: 'High - High probability of meeting booking',
      actionSteps: [
        'Suggest specific meeting time',
        'Offer demo or trial',
        'Discuss implementation timeline',
      ],
    });
  }

  // High priority recommendations
  const lowestSkill = skillScores.sort((a, b) => a.score - b.score)[0];
  if (lowestSkill && lowestSkill.score < 60) {
    recommendations.push({
      priority: 'high',
      category: lowestSkill.skill,
      recommendation: `Focus on improving ${lowestSkill.skill}`,
      rationale: `Score of ${lowestSkill.score}/100 is below threshold`,
      expectedImpact: 'Medium - Will improve overall performance',
      actionSteps: lowestSkill.improvementTips.slice(0, 3),
    });
  }

  if (metrics.valueDelivery < 50) {
    recommendations.push({
      priority: 'high',
      category: 'Value Communication',
      recommendation: 'Cover more key value propositions',
      rationale: `Only ${context.keyPointsMentioned.length}/${context.scenario.keyPoints.length} covered`,
      expectedImpact: 'Medium - Will improve prospect understanding',
      actionSteps: [
        'Review remaining key points',
        'Integrate into next response naturally',
        'Connect to prospect needs',
      ],
    });
  }

  // Medium priority recommendations
  if (context.engagementLevel < 50) {
    recommendations.push({
      priority: 'medium',
      category: 'Engagement',
      recommendation: 'Increase prospect engagement',
      rationale: `Engagement at ${context.engagementLevel.toFixed(0)}% - below optimal`,
      expectedImpact: 'Medium - Will improve conversation quality',
      actionSteps: [
        'Ask more questions',
        'Use compelling examples',
        'Show enthusiasm',
      ],
    });
  }

  return recommendations;
}

/**
 * Generate advanced feedback with all enhancements
 */
export function generateAdvancedFeedback(
  granularFeedback: GranularFeedback,
  context: ConversationContext,
  memory: ConversationMemory,
  metrics: AdvancedConversationMetrics,
  skillScores: SkillScore[],
  historicalData: Record<string, Array<{ date: Date; score: number }>>,
  averageScores: Record<string, number>
): AdvancedFeedback {
  // Analyze advanced skills
  const advancedSkills = skillScores.map((skill) =>
    analyzeAdvancedSkill(
      skill,
      historicalData[skill.skill] || [],
      averageScores[skill.skill] || 50
    )
  );

  // Generate AI insights
  const aiInsights = generateAIInsights(context, memory, metrics, skillScores);

  // Generate personalized recommendations
  const personalizedRecommendations = generatePersonalizedRecommendations(
    context,
    metrics,
    skillScores,
    memory
  );

  return {
    ...granularFeedback,
    advancedSkills,
    aiInsights,
    conversationQuality: {
      overall: (metrics.coherence + metrics.relevance + metrics.naturalness) / 3,
      breakdown: {
        coherence: metrics.coherence,
        relevance: metrics.relevance,
        naturalness: metrics.naturalness,
        valueDelivery: metrics.valueDelivery,
        objectionResolution: metrics.objectionResolution,
      },
    },
    personalizedRecommendations,
    comparativeAnalysis: {
      vsLastSession: {
        improvement: 0, // Would calculate from historical data
        areas: [], // Would identify from comparison
      },
      vsPeers: {
        percentile: 75, // Would calculate from peer data
        strengths: skillScores.filter((s) => s.score >= 80).map((s) => s.skill),
        gaps: skillScores.filter((s) => s.score < 60).map((s) => s.skill),
      },
    },
  };
}

