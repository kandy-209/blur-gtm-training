/**
 * Enhanced Feedback System
 * Granular scoring, actionable insights, and skill-specific recommendations
 */

import { AgentResponse } from '@/types/roleplay';
import { ConversationContext } from './roleplay-enhancements';

export interface SkillScore {
  skill: string;
  score: number; // 0-100
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  feedback: string;
  improvementTips: string[];
}

export interface GranularFeedback {
  overallScore: number;
  skillScores: SkillScore[];
  conversationMetrics: {
    talkToListenRatio: number;
    averageResponseTime: number;
    objectionHandlingRate: number;
    valuePropMentionRate: number;
  };
  strengths: string[];
  weaknesses: string[];
  actionableRecommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    example?: string;
  }>;
  nextSteps: string[];
  benchmarkComparison?: {
    percentile: number;
    vsAverage: 'above' | 'at' | 'below';
    message: string;
  };
}

/**
 * Analyze response for granular skill scoring
 */
export function analyzeResponseSkills(
  response: string,
  context: ConversationContext,
  agentResponse: AgentResponse
): SkillScore[] {
  const skills: SkillScore[] = [];

  // 1. Objection Handling
  const objectionKeywords = ['but', 'however', 'concern', 'worried', 'issue', 'problem'];
  const addressesObjection = objectionKeywords.some((kw) => 
    response.toLowerCase().includes(kw)
  );
  const objectionScore = addressesObjection ? 80 : 50;
  
  skills.push({
    skill: 'Objection Handling',
    score: objectionScore,
    level: objectionScore >= 80 ? 'advanced' : objectionScore >= 60 ? 'intermediate' : 'beginner',
    feedback: addressesObjection
      ? 'You addressed the prospect\'s concerns directly'
      : 'Consider acknowledging and addressing objections more explicitly',
    improvementTips: [
      'Use phrases like "I understand your concern..."',
      'Address objections before moving to solutions',
      'Ask clarifying questions to understand the root concern',
    ],
  });

  // 2. Value Proposition Communication
  const valuePropCount = context.keyPointsMentioned.length;
  const totalKeyPoints = context.scenario.keyPoints.length;
  const valuePropScore = Math.min(100, (valuePropCount / totalKeyPoints) * 100);
  
  skills.push({
    skill: 'Value Proposition Communication',
    score: valuePropScore,
    level: valuePropScore >= 80 ? 'expert' : valuePropScore >= 60 ? 'advanced' : valuePropScore >= 40 ? 'intermediate' : 'beginner',
    feedback: `You mentioned ${valuePropCount} of ${totalKeyPoints} key value propositions`,
    improvementTips: [
      'Focus on value propositions most relevant to the prospect',
      'Connect features to business outcomes',
      'Use specific examples and metrics',
    ],
  });

  // 3. Question Asking
  const questionCount = (response.match(/\?/g) || []).length;
  const questionScore = Math.min(100, questionCount * 25);
  
  skills.push({
    skill: 'Question Asking',
    score: questionScore,
    level: questionScore >= 60 ? 'advanced' : questionScore >= 30 ? 'intermediate' : 'beginner',
    feedback: questionCount > 0
      ? `You asked ${questionCount} question(s) to understand the prospect`
      : 'Consider asking more questions to understand prospect needs',
    improvementTips: [
      'Ask open-ended questions (What, How, Why)',
      'Use questions to uncover pain points',
      'Follow up with clarifying questions',
    ],
  });

  // 4. Active Listening
  const listeningIndicators = ['understand', 'hear', 'see', 'recognize', 'appreciate'];
  const listeningScore = listeningIndicators.some((ind) => 
    response.toLowerCase().includes(ind)
  ) ? 75 : 40;
  
  skills.push({
    skill: 'Active Listening',
    score: listeningScore,
    level: listeningScore >= 70 ? 'advanced' : listeningScore >= 50 ? 'intermediate' : 'beginner',
    feedback: listeningScore >= 70
      ? 'You demonstrated active listening'
      : 'Show that you\'re listening by acknowledging what the prospect said',
    improvementTips: [
      'Paraphrase what the prospect said',
      'Acknowledge their concerns explicitly',
      'Reference previous points in the conversation',
    ],
  });

  // 5. Closing Techniques
  const closingPhrases = ['next step', 'schedule', 'meeting', 'demo', 'move forward', 'commit'];
  const closingScore = closingPhrases.some((phrase) => 
    response.toLowerCase().includes(phrase)
  ) ? 70 : 30;
  
  skills.push({
    skill: 'Closing Techniques',
    score: closingScore,
    level: closingScore >= 60 ? 'advanced' : closingScore >= 40 ? 'intermediate' : 'beginner',
    feedback: closingScore >= 60
      ? 'You moved toward next steps'
      : 'Consider suggesting next steps earlier in the conversation',
    improvementTips: [
      'Propose specific next steps',
      'Offer to schedule a meeting or demo',
      'Create urgency with timelines',
    ],
  });

  return skills;
}

/**
 * Generate granular feedback
 */
export function generateGranularFeedback(
  agentResponse: AgentResponse,
  context: ConversationContext,
  conversationHistory: Array<{ role: 'rep' | 'agent'; message: string }>
): GranularFeedback {
  const lastRepMessage = conversationHistory
    .filter((h) => h.role === 'rep')
    .slice(-1)[0]?.message || '';

  const skillScores = analyzeResponseSkills(lastRepMessage, context, agentResponse);
  
  // Calculate conversation metrics
  const repMessages = conversationHistory.filter((h) => h.role === 'rep');
  const agentMessages = conversationHistory.filter((h) => h.role === 'agent');
  
  const totalRepLength = repMessages.reduce((sum, m) => sum + m.message.length, 0);
  const totalAgentLength = agentMessages.reduce((sum, m) => sum + m.message.length, 0);
  const talkToListenRatio = totalAgentLength > 0 ? totalRepLength / totalAgentLength : 1;

  // Calculate objection handling rate
  const objectionsRaised = agentMessages.filter((m) => 
    ['but', 'however', 'concern', 'worried'].some((kw) => m.message.toLowerCase().includes(kw))
  ).length;
  const objectionHandlingRate = agentMessages.length > 0 
    ? (objectionsRaised / agentMessages.length) * 100 
    : 0;

  // Identify strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  skillScores.forEach((skill) => {
    if (skill.score >= 75) {
      strengths.push(skill.skill);
    } else if (skill.score < 50) {
      weaknesses.push(skill.skill);
    }
  });

  // Generate actionable recommendations
  const recommendations: GranularFeedback['actionableRecommendations'] = [];
  
  skillScores
    .filter((s) => s.score < 70)
    .sort((a, b) => a.score - b.score)
    .forEach((skill) => {
      recommendations.push({
        priority: skill.score < 40 ? 'high' : skill.score < 60 ? 'medium' : 'low',
        category: skill.skill,
        recommendation: skill.improvementTips[0],
        example: skill.improvementTips[1],
      });
    });

  // Generate next steps
  const nextSteps: string[] = [];
  if (context.progressToClose < 50) {
    nextSteps.push('Focus on moving toward next steps and meeting booking');
  }
  if (context.keyPointsMentioned.length < context.scenario.keyPoints.length * 0.7) {
    nextSteps.push('Cover remaining key value propositions');
  }
  if (talkToListenRatio > 1.5) {
    nextSteps.push('Listen more and ask questions to understand prospect needs');
  }

  return {
    overallScore: agentResponse.confidence_score,
    skillScores,
    conversationMetrics: {
      talkToListenRatio,
      averageResponseTime: 0, // Would need timing data
      objectionHandlingRate,
      valuePropMentionRate: (context.keyPointsMentioned.length / context.scenario.keyPoints.length) * 100,
    },
    strengths,
    weaknesses,
    actionableRecommendations: recommendations,
    nextSteps,
  };
}

