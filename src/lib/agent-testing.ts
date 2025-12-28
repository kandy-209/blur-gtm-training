/**
 * Agent Testing Utilities
 * Testing helpers for AI agents
 */

import { coachingAgent } from '@/infrastructure/agents/coaching-agent';
import { analyticsAgent } from '@/infrastructure/agents/analytics-agent';
import { prospectIntelligenceAgent } from '@/infrastructure/agents/prospect-intelligence-agent';

interface TestResult {
  agent: string;
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
  result?: any;
}

export class AgentTesting {
  /**
   * Run comprehensive tests for all agents
   */
  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test CoachingAgent
    results.push(...await this.testCoachingAgent());

    // Test AnalyticsAgent
    results.push(...await this.testAnalyticsAgent());

    // Test ProspectIntelligenceAgent
    results.push(...await this.testProspectIntelligenceAgent());

    return results;
  }

  private async testCoachingAgent(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test basic coaching
    const startTime = Date.now();
    try {
      const result = await coachingAgent.analyzeAndCoach({
        userMessage: 'Test message for coaching',
        conversationHistory: [],
        scenario: {
          id: 'test',
          keyPoints: ['test point'],
          objection_category: 'test',
          persona: {
            name: 'Test Persona',
            currentSolution: 'Test Solution',
            primaryGoal: 'Test Goal',
          },
        },
        turnNumber: 1,
      });

      results.push({
        agent: 'CoachingAgent',
        test: 'Basic coaching analysis',
        passed: !!result && result.suggestions.length >= 0,
        duration: Date.now() - startTime,
        result: result,
      });
    } catch (error: any) {
      results.push({
        agent: 'CoachingAgent',
        test: 'Basic coaching analysis',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      });
    }

    return results;
  }

  private async testAnalyticsAgent(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    const startTime = Date.now();
    try {
      const result = await analyticsAgent.generateInsights({
        scenariosStarted: 5,
        scenariosCompleted: 4,
        averageScore: 75,
        totalTurns: 20,
        events: [],
      });

      results.push({
        agent: 'AnalyticsAgent',
        test: 'Basic analytics generation',
        passed: !!result && !!result.insights,
        duration: Date.now() - startTime,
        result: result,
      });
    } catch (error: any) {
      results.push({
        agent: 'AnalyticsAgent',
        test: 'Basic analytics generation',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      });
    }

    return results;
  }

  private async testProspectIntelligenceAgent(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    const startTime = Date.now();
    try {
      const result = await prospectIntelligenceAgent.analyzeProspect({
        name: 'Test Company',
        techStack: ['React', 'Node.js'],
      });

      results.push({
        agent: 'ProspectIntelligenceAgent',
        test: 'Basic prospect analysis',
        passed: !!result && !!result.buyingSignals,
        duration: Date.now() - startTime,
        result: result,
      });
    } catch (error: any) {
      results.push({
        agent: 'ProspectIntelligenceAgent',
        test: 'Basic prospect analysis',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      });
    }

    return results;
  }

  /**
   * Get test summary
   */
  getTestSummary(results: TestResult[]): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    averageDuration: number;
  } {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      averageDuration: total > 0 ? totalDuration / total : 0,
    };
  }
}

export const agentTesting = new AgentTesting();

