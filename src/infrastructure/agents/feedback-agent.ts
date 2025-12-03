/**
 * Advanced Feedback Analysis Agent
 * NLP + Explainable AI for actionable coaching feedback
 */

import { ConversationMessage, ConversationMetrics } from '@/domain/entities/discovery-call';
import { getLLMProvider } from '@/lib/company-analysis/llm-provider';

export interface FeedbackAnalysis {
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  actionableFeedback: ActionableFeedback[];
  talkToListenAnalysis: {
    ratio: number;
    status: 'balanced' | 'rep_dominating' | 'rep_too_quiet';
    recommendation: string;
  };
  objectionHandling: {
    handled: number;
    missed: number;
    quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    examples: string[];
  };
  discoveryQuestions: {
    asked: number;
    quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    examples: string[];
    recommendations: string[];
  };
  closingAttempts: {
    attempted: boolean;
    quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    recommendation: string;
  };
  managerCoachingPoints: string[];
}

export interface ActionableFeedback {
  timestamp: string; // Message timestamp
  type: 'strength' | 'weakness' | 'opportunity';
  message: string;
  specificMoment: string; // What was said
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  methodology?: 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT';
}

export class FeedbackAgent {
  /**
   * Analyze conversation and generate comprehensive feedback
   */
  async analyzeConversation(
    conversationHistory: ConversationMessage[],
    metrics: ConversationMetrics,
    salesMethodology?: 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT' | null
  ): Promise<FeedbackAnalysis> {
    const llm = getLLMProvider();

    // Calculate quantitative metrics
    const quantitativeAnalysis = this.calculateQuantitativeMetrics(conversationHistory, metrics);

    // Generate qualitative feedback
    const qualitativeFeedback = llm 
      ? await this.generateLLMFeedback(conversationHistory, metrics, salesMethodology)
      : this.generateRuleBasedFeedback(conversationHistory, metrics, salesMethodology);

    // Combine quantitative and qualitative with defaults
    const combined = {
      strengths: qualitativeFeedback.strengths || quantitativeAnalysis.strengths || [],
      weaknesses: qualitativeFeedback.weaknesses || quantitativeAnalysis.weaknesses || [],
      actionableFeedback: qualitativeFeedback.actionableFeedback || quantitativeAnalysis.actionableFeedback || [],
      managerCoachingPoints: qualitativeFeedback.managerCoachingPoints || [],
      talkToListenAnalysis: quantitativeAnalysis.talkToListenAnalysis || {
        ratio: 0.5,
        status: 'balanced' as const,
        recommendation: 'Continue balanced conversation',
      },
      objectionHandling: quantitativeAnalysis.objectionHandling || {
        handled: 0,
        missed: 0,
        quality: 'needs_improvement' as const,
        examples: [],
      },
      discoveryQuestions: quantitativeAnalysis.discoveryQuestions || {
        asked: 0,
        quality: 'needs_improvement' as const,
        examples: [],
        recommendations: [],
      },
      closingAttempts: quantitativeAnalysis.closingAttempts || {
        attempted: false,
        quality: 'needs_improvement' as const,
        recommendation: 'Try asking for next steps',
      },
      overallScore: this.calculateOverallScore(quantitativeAnalysis, qualitativeFeedback),
    };

    return combined;
  }

  private calculateQuantitativeMetrics(
    conversationHistory: ConversationMessage[],
    metrics: ConversationMetrics
  ): Partial<FeedbackAnalysis> {
    const repMessages = conversationHistory.filter(m => m.role === 'rep');
    const prospectMessages = conversationHistory.filter(m => m.role === 'prospect');

    // Count questions
    const repQuestions = repMessages.filter(m => m.message.includes('?')).length;
    const discoveryQuestions = repMessages.filter(m => 
      m.message.toLowerCase().includes('what') ||
      m.message.toLowerCase().includes('how') ||
      m.message.toLowerCase().includes('why') ||
      m.message.toLowerCase().includes('tell me about')
    ).length;

    // Detect objections
    const objections = prospectMessages.filter(m => 
      m.message.toLowerCase().includes('concern') ||
      m.message.toLowerCase().includes('worried') ||
      m.message.toLowerCase().includes('not sure') ||
      m.message.toLowerCase().includes('but')
    ).length;

    // Detect closing attempts
    const closingAttempts = repMessages.filter(m =>
      m.message.toLowerCase().includes('next step') ||
      m.message.toLowerCase().includes('schedule') ||
      m.message.toLowerCase().includes('meeting') ||
      m.message.toLowerCase().includes('demo')
    ).length;

    return {
      talkToListenAnalysis: {
        ratio: metrics.talkToListenRatio.ratio,
        status: metrics.talkToListenRatio.status,
        recommendation: this.getTalkToListenRecommendation(metrics.talkToListenRatio),
      },
      objectionHandling: {
        handled: Math.max(0, objections - 2), // Assume some were handled
        missed: Math.min(2, objections),
        quality: this.assessObjectionHandlingQuality(objections, repMessages.length),
        examples: [],
      },
      discoveryQuestions: {
        asked: discoveryQuestions,
        quality: this.assessQuestionQuality(discoveryQuestions, repMessages.length),
        examples: repMessages
          .filter(m => m.message.includes('?'))
          .slice(0, 3)
          .map(m => m.message.substring(0, 100)),
        recommendations: this.getQuestionRecommendations(discoveryQuestions, repMessages.length),
      },
      closingAttempts: {
        attempted: closingAttempts > 0,
        quality: this.assessClosingQuality(closingAttempts),
        recommendation: closingAttempts === 0 
          ? 'No closing attempts detected. Try asking for next steps or scheduling a meeting.'
          : 'Good closing attempts. Consider being more direct about scheduling.',
      },
    };
  }

  private async generateLLMFeedback(
    conversationHistory: ConversationMessage[],
    metrics: ConversationMetrics,
    salesMethodology?: string | null
  ): Promise<Partial<FeedbackAnalysis>> {
    const llm = getLLMProvider();
    if (!llm) {
      return {};
    }

    const conversationText = conversationHistory
      .map(msg => `${msg.role === 'rep' ? 'Rep' : 'Prospect'}: ${msg.message}`)
      .join('\n\n');

    const prompt = `Analyze this sales discovery call conversation and provide actionable feedback.

Conversation:
${conversationText}

Metrics:
- Talk-to-listen ratio: ${(metrics.talkToListenRatio.ratio * 100).toFixed(0)}%
- Status: ${metrics.talkToListenRatio.status}
- Rep questions: ${metrics.questions.repQuestions}
- Prospect questions: ${metrics.questions.prospectQuestions}

${salesMethodology ? `Sales methodology: ${salesMethodology}` : ''}

Provide specific, actionable feedback that a manager can use for coaching. Focus on:
1. Specific moments where the rep did well or could improve
2. Objection handling quality
3. Discovery question quality
4. Talk-to-listen balance
5. Closing attempts

Return JSON:
{
  "strengths": ["specific strengths"],
  "weaknesses": ["specific weaknesses"],
  "actionableFeedback": [
    {
      "timestamp": "message timestamp",
      "type": "strength|weakness|opportunity",
      "message": "what happened",
      "specificMoment": "exact quote or moment",
      "impact": "high|medium|low",
      "recommendation": "what to do differently",
      "methodology": "${salesMethodology || ''}"
    }
  ],
  "managerCoachingPoints": ["specific coaching points"]
}`;

    try {
      const response = await llm.analyzeCompany(
        prompt,
        'You are an expert sales coach providing actionable feedback for discovery calls. Be specific and focus on moments that can be coached.'
      );

      if (response && response.content) {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('LLM feedback generation error:', error);
    }

    return {};
  }

  private generateRuleBasedFeedback(
    conversationHistory: ConversationMessage[],
    metrics: ConversationMetrics,
    salesMethodology?: string | null
  ): Partial<FeedbackAnalysis> {
    const repMessages = conversationHistory.filter(m => m.role === 'rep');
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const actionableFeedback: ActionableFeedback[] = [];

    // Analyze talk-to-listen ratio
    if (metrics.talkToListenRatio.status === 'balanced') {
      strengths.push('Good talk-to-listen ratio - allowing prospect to speak');
    } else if (metrics.talkToListenRatio.status === 'rep_dominating') {
      weaknesses.push('Talking too much - need to listen more');
      actionableFeedback.push({
        timestamp: conversationHistory[Math.floor(conversationHistory.length / 2)]?.timestamp.toISOString() || '',
        type: 'weakness',
        message: 'Rep is dominating the conversation',
        specificMoment: 'Multiple consecutive rep messages without prospect response',
        impact: 'high',
        recommendation: 'Ask a question and wait for the prospect to respond fully before speaking again',
      });
    }

    // Analyze questions
    const questions = repMessages.filter(m => m.message.includes('?'));
    if (questions.length < 3) {
      weaknesses.push('Not asking enough discovery questions');
      actionableFeedback.push({
        timestamp: conversationHistory[conversationHistory.length - 1]?.timestamp.toISOString() || '',
        type: 'weakness',
        message: 'Need more discovery questions',
        specificMoment: 'Conversation lacks probing questions',
        impact: 'high',
        recommendation: 'Ask open-ended questions about pain points, goals, and current situation',
        methodology: salesMethodology as any,
      });
    } else {
      strengths.push('Good use of discovery questions');
    }

    return {
      strengths,
      weaknesses,
      actionableFeedback,
      managerCoachingPoints: [
        ...weaknesses.map(w => `Work on: ${w}`),
        ...strengths.map(s => `Continue: ${s}`),
      ],
    };
  }

  private calculateOverallScore(
    quantitative: Partial<FeedbackAnalysis>,
    qualitative: Partial<FeedbackAnalysis>
  ): number {
    let score = 70; // Base score

    // Talk-to-listen ratio
    if (quantitative.talkToListenAnalysis?.status === 'balanced') {
      score += 10;
    } else {
      score -= 10;
    }

    // Objection handling
    if (quantitative.objectionHandling?.quality === 'excellent') {
      score += 10;
    } else if (quantitative.objectionHandling?.quality === 'good') {
      score += 5;
    } else if (quantitative.objectionHandling?.quality === 'needs_improvement') {
      score -= 5;
    }

    // Discovery questions
    if (quantitative.discoveryQuestions?.quality === 'excellent') {
      score += 10;
    } else if (quantitative.discoveryQuestions?.quality === 'good') {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getTalkToListenRecommendation(ratio: ConversationMetrics['talkToListenRatio']): string {
    if (ratio.status === 'balanced') {
      return 'Great balance! Continue listening actively.';
    } else if (ratio.status === 'rep_dominating') {
      return `You're talking ${(ratio.ratio * 100).toFixed(0)}% of the time. Aim for 40-60%. Ask questions and pause longer for responses.`;
    } else {
      return 'You might be too quiet. Share more value and ask follow-up questions.';
    }
  }

  private assessObjectionHandlingQuality(objections: number, repMessages: number): 'excellent' | 'good' | 'needs_improvement' | 'poor' {
    if (objections === 0) return 'excellent';
    if (objections <= 2 && repMessages > 5) return 'good';
    if (objections <= 4) return 'needs_improvement';
    return 'poor';
  }

  private assessQuestionQuality(questions: number, totalMessages: number): 'excellent' | 'good' | 'needs_improvement' | 'poor' {
    const ratio = questions / totalMessages;
    if (ratio > 0.4) return 'excellent';
    if (ratio > 0.25) return 'good';
    if (ratio > 0.1) return 'needs_improvement';
    return 'poor';
  }

  private getQuestionRecommendations(questions: number, totalMessages: number): string[] {
    const recommendations: string[] = [];
    const ratio = questions / totalMessages;

    if (ratio < 0.2) {
      recommendations.push('Ask more open-ended discovery questions');
      recommendations.push('Use questions like "What challenges are you facing?" or "How does that impact your team?"');
    }

    if (questions < 3) {
      recommendations.push('Aim for at least 3-5 discovery questions per call');
    }

    return recommendations;
  }

  private assessClosingQuality(attempts: number): 'excellent' | 'good' | 'needs_improvement' | 'poor' {
    if (attempts >= 2) return 'excellent';
    if (attempts === 1) return 'good';
    return 'needs_improvement';
  }
}

