/**
 * Agent Orchestrator
 * Coordinates multiple AI agents for advanced workflows
 */

import { coachingAgent } from '@/infrastructure/agents/coaching-agent';
import { analyticsAgent } from '@/infrastructure/agents/analytics-agent';
import { prospectIntelligenceAgent } from '@/infrastructure/agents/prospect-intelligence-agent';

interface OrchestrationContext {
  userId: string;
  sessionId: string;
  timestamp: Date;
}

interface OrchestratedInsights {
  coaching: any;
  analytics: any;
  prospect?: any;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

export class AgentOrchestrator {
  /**
   * Orchestrate multiple agents for comprehensive analysis
   */
  async orchestrateAnalysis(
    context: OrchestrationContext,
    data: {
      roleplayData?: any;
      analyticsData?: any;
      prospectData?: any;
    }
  ): Promise<OrchestratedInsights> {
    const results: OrchestratedInsights = {
      coaching: null,
      analytics: null,
      prospect: null,
      recommendations: [],
      priority: 'medium',
    };

    // Run agents in parallel for efficiency
    const promises: Promise<any>[] = [];

    if (data.roleplayData) {
      promises.push(
        coachingAgent.analyzeAndCoach(data.roleplayData).catch(() => null)
      );
    }

    if (data.analyticsData) {
      promises.push(
        analyticsAgent.generateInsights(data.analyticsData).catch(() => null)
      );
    }

    if (data.prospectData) {
      promises.push(
        prospectIntelligenceAgent.analyzeProspect(data.prospectData).catch(() => null)
      );
    }

    const agentResults = await Promise.all(promises);

    // Process results
    let resultIndex = 0;
    if (data.roleplayData) {
      results.coaching = agentResults[resultIndex++];
    }
    if (data.analyticsData) {
      results.analytics = agentResults[resultIndex++];
    }
    if (data.prospectData) {
      results.prospect = agentResults[resultIndex++];
    }

    // Generate cross-agent recommendations
    results.recommendations = this.generateCrossAgentRecommendations(results);
    results.priority = this.calculatePriority(results);

    return results;
  }

  private generateCrossAgentRecommendations(insights: OrchestratedInsights): string[] {
    const recommendations: string[] = [];

    // Cross-reference coaching and analytics
    if (insights.coaching && insights.analytics) {
      const coachingScore = insights.coaching.overallScore || 0;
      const analyticsScore = insights.analytics.predictions?.successProbability || 0;

      if (coachingScore < 70 && analyticsScore < 0.7) {
        recommendations.push('Focus on fundamental skills - both coaching and analytics indicate improvement needed');
      }

      if (coachingScore >= 80 && analyticsScore >= 0.8) {
        recommendations.push('Excellent performance - consider mentoring others or tackling advanced scenarios');
      }
    }

    // Cross-reference analytics and prospect intelligence
    if (insights.analytics && insights.prospect) {
      const skillLevel = insights.analytics.predictions?.skillLevel;
      const prospectPriority = insights.prospect.overallPriority;

      if (skillLevel === 'advanced' && prospectPriority === 'high') {
        recommendations.push('High-value prospect detected - leverage your advanced skills for this opportunity');
      }
    }

    return recommendations;
  }

  private calculatePriority(insights: OrchestratedInsights): 'high' | 'medium' | 'low' {
    let priorityScore = 0;

    if (insights.coaching) {
      const score = insights.coaching.overallScore || 0;
      if (score < 60) priorityScore += 2;
      else if (score >= 80) priorityScore -= 1;
    }

    if (insights.analytics) {
      const prob = insights.analytics.predictions?.successProbability || 0;
      if (prob < 0.6) priorityScore += 2;
      else if (prob >= 0.8) priorityScore -= 1;
    }

    if (insights.prospect) {
      const priority = insights.prospect.overallPriority;
      if (priority === 'high') priorityScore += 2;
      else if (priority === 'low') priorityScore -= 1;
    }

    if (priorityScore >= 3) return 'high';
    if (priorityScore <= 0) return 'low';
    return 'medium';
  }
}

export const agentOrchestrator = new AgentOrchestrator();

