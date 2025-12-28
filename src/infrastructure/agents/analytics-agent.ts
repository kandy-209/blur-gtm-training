/**
 * Analytics Agent
 * AI-powered predictive analytics and insights for training performance
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

interface TrainingMetrics {
  scenariosStarted: number;
  scenariosCompleted: number;
  averageScore: number;
  totalTurns: number;
  events: Array<{
    eventType: string;
    score?: number;
    scenarioId?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
}

interface PredictiveInsight {
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  recommendation?: string;
  timeframe?: string;
  impact?: 'high' | 'medium' | 'low';
}

interface AnalyticsAnalysis {
  insights: PredictiveInsight[];
  predictions: {
    successProbability: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    nextMilestone: string;
    estimatedTimeToMilestone: string;
  };
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

export class AnalyticsAgent {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ 
        apiKey: process.env.ANTHROPIC_API_KEY,
        dangerouslyAllowBrowser: process.env.NODE_ENV === 'test' || false,
      });
    }
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: process.env.NODE_ENV === 'test' || false,
      });
    }
    if (process.env.GOOGLE_GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    }
  }

  /**
   * Generate predictive insights from training metrics
   */
  async generateInsights(metrics: TrainingMetrics): Promise<AnalyticsAnalysis> {
    const provider = process.env.STAGEHAND_LLM_PROVIDER || 'claude';
    
    try {
      if (provider === 'claude' && this.anthropic) {
        return await this.analyzeWithClaude(metrics);
      } else if (provider === 'openai' && this.openai) {
        return await this.analyzeWithOpenAI(metrics);
      } else if (provider === 'gemini' && this.gemini) {
        return await this.analyzeWithGemini(metrics);
      } else {
        return this.fallbackAnalysis(metrics);
      }
    } catch (error) {
      console.error('Analytics agent error:', error);
      return this.fallbackAnalysis(metrics);
    }
  }

  private async analyzeWithClaude(metrics: TrainingMetrics): Promise<AnalyticsAnalysis> {
    const prompt = this.buildAnalyticsPrompt(metrics);
    
    const response = await this.anthropic!.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseAnalyticsResponse(content.text, metrics);
    }
    
    return this.fallbackAnalysis(metrics);
  }

  private async analyzeWithOpenAI(metrics: TrainingMetrics): Promise<AnalyticsAnalysis> {
    const prompt = this.buildAnalyticsPrompt(metrics);
    
    const response = await this.openai!.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: prompt,
      }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return this.parseAnalyticsResponse(content, metrics);
    }
    
    return this.fallbackAnalysis(metrics);
  }

  private async analyzeWithGemini(metrics: TrainingMetrics): Promise<AnalyticsAnalysis> {
    const prompt = this.buildAnalyticsPrompt(metrics);
    const model = this.gemini!.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      return this.parseAnalyticsResponse(text, metrics);
    }
    
    return this.fallbackAnalysis(metrics);
  }

  private buildAnalyticsPrompt(metrics: TrainingMetrics): string {
    const completionRate = metrics.scenariosCompleted / Math.max(metrics.scenariosStarted, 1);
    const recentScores = metrics.events
      .filter(e => e.score !== undefined)
      .slice(0, 10)
      .map(e => e.score!);
    
    return `You are an expert sales training analyst analyzing training performance data.

# Training Metrics
- Scenarios Started: ${metrics.scenariosStarted}
- Scenarios Completed: ${metrics.scenariosCompleted}
- Completion Rate: ${(completionRate * 100).toFixed(1)}%
- Average Score: ${metrics.averageScore.toFixed(1)}/100
- Total Turns: ${metrics.totalTurns}
- Recent Scores: ${recentScores.join(', ')}

# Recent Activity
${metrics.events.slice(0, 20).map((e, i) => 
  `${i + 1}. ${e.eventType}${e.score ? ` (Score: ${e.score})` : ''}${e.scenarioId ? ` - ${e.scenarioId}` : ''}`
).join('\n')}

# Your Task
Analyze this training data and provide:
1. Predictive insights about future performance
2. Success probability assessment
3. Skill level classification
4. Risk factors and opportunities
5. Actionable recommendations

Consider:
- Completion rates indicate commitment
- Score trends show improvement/decline
- Activity patterns reveal engagement
- Scenario diversity shows breadth of practice

Respond in JSON format:
{
  "insights": [
    {
      "type": "success|warning|info|opportunity",
      "title": "Insight title",
      "description": "Detailed description",
      "confidence": 0.85,
      "recommendation": "Actionable recommendation",
      "timeframe": "1-2 weeks",
      "impact": "high|medium|low"
    }
  ],
  "predictions": {
    "successProbability": 0.75,
    "skillLevel": "intermediate",
    "nextMilestone": "Achieve 80+ average score",
    "estimatedTimeToMilestone": "2-3 weeks"
  },
  "recommendations": ["rec1", "rec2"],
  "riskFactors": ["risk1", "risk2"],
  "opportunities": ["opp1", "opp2"]
}`;
  }

  private parseAnalyticsResponse(text: string, metrics: TrainingMetrics): AnalyticsAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          insights: parsed.insights || [],
          predictions: parsed.predictions || {
            successProbability: 0.7,
            skillLevel: 'intermediate',
            nextMilestone: 'Improve average score',
            estimatedTimeToMilestone: '2-3 weeks',
          },
          recommendations: parsed.recommendations || [],
          riskFactors: parsed.riskFactors || [],
          opportunities: parsed.opportunities || [],
        };
      }
    } catch (error) {
      console.error('Failed to parse analytics response:', error);
    }
    
    return this.fallbackAnalysis(metrics);
  }

  private fallbackAnalysis(metrics: TrainingMetrics): AnalyticsAnalysis {
    const completionRate = metrics.scenariosCompleted / Math.max(metrics.scenariosStarted, 1);
    const insights: PredictiveInsight[] = [];
    
    // Completion rate analysis
    if (completionRate >= 0.8) {
      insights.push({
        type: 'success',
        title: 'High Completion Rate',
        description: `Your ${(completionRate * 100).toFixed(0)}% completion rate indicates strong commitment to training.`,
        confidence: 0.9,
        recommendation: 'Continue practicing advanced scenarios to maintain your edge.',
        impact: 'high',
      });
    } else if (completionRate < 0.5) {
      insights.push({
        type: 'warning',
        title: 'Low Completion Rate',
        description: `Your ${(completionRate * 100).toFixed(0)}% completion rate suggests you may need more practice.`,
        confidence: 0.8,
        recommendation: 'Focus on completing more scenarios and reviewing feedback carefully.',
        impact: 'high',
      });
    }
    
    // Score analysis
    if (metrics.averageScore >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance',
        description: `Your average score of ${metrics.averageScore.toFixed(0)} indicates strong sales skills.`,
        confidence: 0.85,
        recommendation: 'Consider mentoring others or tackling more challenging scenarios.',
        impact: 'high',
      });
    } else if (metrics.averageScore < 60) {
      insights.push({
        type: 'warning',
        title: 'Skill Development Opportunity',
        description: `Your average score of ${metrics.averageScore.toFixed(0)} suggests areas for improvement.`,
        confidence: 0.75,
        recommendation: 'Review feedback from completed scenarios and focus on objection handling.',
        impact: 'high',
      });
    }
    
    // Trend analysis
    const recentScores = metrics.events
      .filter(e => e.score !== undefined)
      .slice(0, 5)
      .map(e => e.score!);
    
    if (recentScores.length >= 3) {
      const trend = recentScores[0] - recentScores[recentScores.length - 1];
      if (trend > 10) {
        insights.push({
          type: 'success',
          title: 'Improving Trend',
          description: 'Your recent scores show a positive upward trend. Keep it up!',
          confidence: 0.8,
          impact: 'medium',
        });
      } else if (trend < -10) {
        insights.push({
          type: 'warning',
          title: 'Declining Performance',
          description: 'Your recent scores show a downward trend. Consider reviewing fundamentals.',
          confidence: 0.75,
          recommendation: 'Take a break and review your best-performing scenarios.',
          impact: 'high',
        });
      }
    }
    
    const successProbability = Math.min(0.95, Math.max(0.3, 
      (completionRate * 0.4) + (metrics.averageScore / 100 * 0.6)
    ));
    
    let skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    if (metrics.averageScore >= 85 && completionRate >= 0.8) {
      skillLevel = 'expert';
    } else if (metrics.averageScore >= 70 && completionRate >= 0.6) {
      skillLevel = 'advanced';
    } else if (metrics.averageScore >= 60 || completionRate >= 0.4) {
      skillLevel = 'intermediate';
    } else {
      skillLevel = 'beginner';
    }
    
    return {
      insights,
      predictions: {
        successProbability,
        skillLevel,
        nextMilestone: skillLevel === 'expert' 
          ? 'Maintain expert level performance'
          : skillLevel === 'advanced'
          ? 'Achieve expert level (85+ average)'
          : skillLevel === 'intermediate'
          ? 'Achieve advanced level (70+ average)'
          : 'Achieve intermediate level (60+ average)',
        estimatedTimeToMilestone: skillLevel === 'beginner' ? '2-3 weeks' : '3-4 weeks',
      },
      recommendations: [
        'Complete more scenarios to build experience',
        'Review feedback from completed scenarios',
        'Practice different objection categories',
      ],
      riskFactors: completionRate < 0.5 ? ['Low completion rate'] : [],
      opportunities: [
        'Focus on high-scoring scenarios',
        'Practice challenging objections',
        'Build consistency across all scenarios',
      ],
    };
  }
}

export const analyticsAgent = new AnalyticsAgent();

