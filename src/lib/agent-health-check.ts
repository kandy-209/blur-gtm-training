/**
 * Agent Health Check
 * Validates agent functionality and API connectivity
 */

import { coachingAgent } from '@/infrastructure/agents/coaching-agent';
import { analyticsAgent } from '@/infrastructure/agents/analytics-agent';
import { prospectIntelligenceAgent } from '@/infrastructure/agents/prospect-intelligence-agent';

interface HealthCheckResult {
  agent: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  error?: string;
  details: {
    llmProvider?: string;
    apiKeyConfigured: boolean;
    fallbackAvailable: boolean;
  };
}

export class AgentHealthCheck {
  /**
   * Check health of all agents
   */
  async checkAllAgents(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    // Check Coaching Agent
    results.push(await this.checkCoachingAgent());

    // Check Analytics Agent
    results.push(await this.checkAnalyticsAgent());

    // Check Prospect Intelligence Agent
    results.push(await this.checkProspectIntelligenceAgent());

    return results;
  }

  private async checkCoachingAgent(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;
    const hasAnyLLM = hasAnthropic || hasOpenAI || hasGemini;

    try {
      // Try a simple analysis
      await coachingAgent.analyzeAndCoach({
        userMessage: 'Test message',
        conversationHistory: [],
        scenario: {
          id: 'test',
          keyPoints: ['test'],
          objection_category: 'test',
          persona: {
            name: 'Test',
            currentSolution: 'Test',
            primaryGoal: 'Test',
          },
        },
        turnNumber: 1,
      });

      return {
        agent: 'CoachingAgent',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: {
          llmProvider: process.env.STAGEHAND_LLM_PROVIDER || 'claude',
          apiKeyConfigured: hasAnyLLM,
          fallbackAvailable: true,
        },
      };
    } catch (error: any) {
      return {
        agent: 'CoachingAgent',
        status: hasAnyLLM ? 'degraded' : 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        details: {
          llmProvider: process.env.STAGEHAND_LLM_PROVIDER || 'claude',
          apiKeyConfigured: hasAnyLLM,
          fallbackAvailable: true,
        },
      };
    }
  }

  private async checkAnalyticsAgent(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;
    const hasAnyLLM = hasAnthropic || hasOpenAI || hasGemini;

    try {
      await analyticsAgent.generateInsights({
        scenariosStarted: 1,
        scenariosCompleted: 1,
        averageScore: 75,
        totalTurns: 5,
        events: [],
      });

      return {
        agent: 'AnalyticsAgent',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: {
          llmProvider: process.env.STAGEHAND_LLM_PROVIDER || 'claude',
          apiKeyConfigured: hasAnyLLM,
          fallbackAvailable: true,
        },
      };
    } catch (error: any) {
      return {
        agent: 'AnalyticsAgent',
        status: hasAnyLLM ? 'degraded' : 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        details: {
          llmProvider: process.env.STAGEHAND_LLM_PROVIDER || 'claude',
          apiKeyConfigured: hasAnyLLM,
          fallbackAvailable: true,
        },
      };
    }
  }

  private async checkProspectIntelligenceAgent(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;
    const hasAnyLLM = hasAnthropic || hasOpenAI || hasGemini;

    try {
      await prospectIntelligenceAgent.analyzeProspect({
        name: 'Test Company',
      });

      return {
        agent: 'ProspectIntelligenceAgent',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: {
          llmProvider: process.env.STAGEHAND_LLM_PROVIDER || 'claude',
          apiKeyConfigured: hasAnyLLM,
          fallbackAvailable: true,
        },
      };
    } catch (error: any) {
      return {
        agent: 'ProspectIntelligenceAgent',
        status: hasAnyLLM ? 'degraded' : 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        details: {
          llmProvider: process.env.STAGEHAND_LLM_PROVIDER || 'claude',
          apiKeyConfigured: hasAnyLLM,
          fallbackAvailable: true,
        },
      };
    }
  }
}

export const agentHealthCheck = new AgentHealthCheck();

