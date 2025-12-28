/**
 * Prospect Intelligence Agent
 * AI-powered deep analysis and buying signals detection for prospects
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

interface CompanyData {
  name: string;
  website?: string;
  techStack?: string[];
  hiring?: {
    engineeringRoleCount?: number;
    hasOpenEngineeringRoles?: boolean;
    recentHires?: any[];
  };
  financials?: {
    revenue?: number;
    funding?: number;
    employees?: number;
  };
  news?: Array<{
    title?: string;
    date?: string;
    source?: string;
  }>;
  industry?: string;
  description?: string;
}

interface BuyingSignal {
  type: 'strong' | 'moderate' | 'weak';
  indicator: string;
  description: string;
  confidence: number;
  evidence?: string[];
  urgency?: 'high' | 'medium' | 'low';
}

interface ProspectAnalysis {
  buyingSignals: BuyingSignal[];
  recommendedActions: string[];
  painPoints: string[];
  decisionMakers: string[];
  bestContactTime: string;
  fitScore: number;
  timingScore: number;
  engagementScore: number;
  overallPriority: 'high' | 'medium' | 'low';
  nextSteps: string[];
}

export class ProspectIntelligenceAgent {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.GOOGLE_GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    }
  }

  /**
   * Analyze prospect company and generate intelligence insights
   */
  async analyzeProspect(companyData: CompanyData): Promise<ProspectAnalysis> {
    const provider = process.env.STAGEHAND_LLM_PROVIDER || 'claude';
    
    try {
      if (provider === 'claude' && this.anthropic) {
        return await this.analyzeWithClaude(companyData);
      } else if (provider === 'openai' && this.openai) {
        return await this.analyzeWithOpenAI(companyData);
      } else if (provider === 'gemini' && this.gemini) {
        return await this.analyzeWithGemini(companyData);
      } else {
        return this.fallbackAnalysis(companyData);
      }
    } catch (error) {
      console.error('Prospect intelligence agent error:', error);
      return this.fallbackAnalysis(companyData);
    }
  }

  private async analyzeWithClaude(companyData: CompanyData): Promise<ProspectAnalysis> {
    const prompt = this.buildAnalysisPrompt(companyData);
    
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
      return this.parseAnalysisResponse(content.text, companyData);
    }
    
    return this.fallbackAnalysis(companyData);
  }

  private async analyzeWithOpenAI(companyData: CompanyData): Promise<ProspectAnalysis> {
    const prompt = this.buildAnalysisPrompt(companyData);
    
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
      return this.parseAnalysisResponse(content, companyData);
    }
    
    return this.fallbackAnalysis(companyData);
  }

  private async analyzeWithGemini(companyData: CompanyData): Promise<ProspectAnalysis> {
    const prompt = this.buildAnalysisPrompt(companyData);
    const model = this.gemini!.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      return this.parseAnalysisResponse(text, companyData);
    }
    
    return this.fallbackAnalysis(companyData);
  }

  private buildAnalysisPrompt(companyData: CompanyData): string {
    return `You are an expert sales intelligence analyst specializing in B2B SaaS sales for browser automation and cloud infrastructure.

# Company Information
- Name: ${companyData.name}
- Website: ${companyData.website || 'Unknown'}
- Industry: ${companyData.industry || 'Unknown'}
- Description: ${companyData.description || 'No description available'}

# Tech Stack
${companyData.techStack ? companyData.techStack.map(t => `- ${t}`).join('\n') : 'Unknown'}

# Hiring Activity
- Engineering Roles Open: ${companyData.hiring?.engineeringRoleCount || 0}
- Has Open Roles: ${companyData.hiring?.hasOpenEngineeringRoles ? 'Yes' : 'No'}

# Financials
- Revenue: ${companyData.financials?.revenue ? `$${companyData.financials.revenue.toLocaleString()}` : 'Unknown'}
- Funding: ${companyData.financials?.funding ? `$${companyData.financials.funding.toLocaleString()}` : 'Unknown'}
- Employees: ${companyData.financials?.employees || 'Unknown'}

# Recent News
${companyData.news && companyData.news.length > 0
  ? companyData.news.slice(0, 5).map(n => `- ${n.title || 'News item'} (${n.date || 'Recent'})`).join('\n')
  : 'No recent news'}

# Your Task
Analyze this company as a prospect for Browserbase (cloud browser infrastructure, headless browser automation, web scraping platform). 

Identify:
1. Buying signals (strong/moderate/weak) with evidence
2. Recommended sales actions
3. Likely pain points
4. Target decision makers
5. Best contact time
6. Fit score (0-100) - how well Browserbase fits their needs
7. Timing score (0-100) - likelihood of buying now
8. Engagement score (0-100) - how engaged they might be
9. Overall priority (high/medium/low)

Consider:
- Tech stack indicates automation needs
- Hiring activity suggests growth/scaling
- Financials indicate budget availability
- News indicates company activity/priorities
- Industry and size indicate fit

Respond in JSON format:
{
  "buyingSignals": [
    {
      "type": "strong|moderate|weak",
      "indicator": "Signal name",
      "description": "Why this is a signal",
      "confidence": 0.85,
      "evidence": ["evidence1", "evidence2"],
      "urgency": "high|medium|low"
    }
  ],
  "recommendedActions": ["action1", "action2"],
  "painPoints": ["pain1", "pain2"],
  "decisionMakers": ["role1", "role2"],
  "bestContactTime": "Tuesday-Thursday, 10am-2pm",
  "fitScore": 75,
  "timingScore": 65,
  "engagementScore": 70,
  "overallPriority": "high|medium|low",
  "nextSteps": ["step1", "step2"]
}`;
  }

  private parseAnalysisResponse(text: string, companyData: CompanyData): ProspectAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          buyingSignals: parsed.buyingSignals || [],
          recommendedActions: parsed.recommendedActions || [],
          painPoints: parsed.painPoints || [],
          decisionMakers: parsed.decisionMakers || [],
          bestContactTime: parsed.bestContactTime || 'Tuesday-Thursday, 10am-2pm',
          fitScore: parsed.fitScore || 50,
          timingScore: parsed.timingScore || 50,
          engagementScore: parsed.engagementScore || 50,
          overallPriority: parsed.overallPriority || 'medium',
          nextSteps: parsed.nextSteps || [],
        };
      }
    } catch (error) {
      console.error('Failed to parse prospect analysis response:', error);
    }
    
    return this.fallbackAnalysis(companyData);
  }

  private fallbackAnalysis(companyData: CompanyData): ProspectAnalysis {
    const buyingSignals: BuyingSignal[] = [];
    const recommendedActions: string[] = [];
    const painPoints: string[] = [];
    
    // Analyze tech stack
    if (companyData.techStack) {
      const hasAutomation = companyData.techStack.some((tech) =>
        tech.toLowerCase().includes('automation') ||
        tech.toLowerCase().includes('scraping') ||
        tech.toLowerCase().includes('puppeteer') ||
        tech.toLowerCase().includes('playwright')
      );

      if (hasAutomation) {
        buyingSignals.push({
          type: 'strong',
          indicator: 'Active Automation User',
          description: 'Company is already using browser automation tools',
          confidence: 0.85,
          evidence: ['Tech stack includes automation tools'],
          urgency: 'high',
        });
        recommendedActions.push('Highlight Browserbase advantages over their current solution');
        painPoints.push('Likely experiencing infrastructure management overhead');
      }
    }
    
    // Analyze hiring
    if (companyData.hiring) {
      const engineeringHires = companyData.hiring.engineeringRoleCount || 0;
      if (engineeringHires > 10) {
        buyingSignals.push({
          type: 'moderate',
          indicator: 'Rapid Engineering Growth',
          description: 'Company is scaling engineering team significantly',
          confidence: 0.70,
          evidence: [`${engineeringHires} open engineering roles`],
          urgency: 'medium',
        });
        recommendedActions.push('Emphasize team collaboration and scaling features');
        painPoints.push('Likely need better tooling for growing team');
      }
    }
    
    // Analyze financials
    if (companyData.financials) {
      const revenue = companyData.financials.revenue;
      if (revenue && revenue > 10000000) {
        buyingSignals.push({
          type: 'strong',
          indicator: 'Strong Financial Position',
          description: 'Company has budget for enterprise solutions',
          confidence: 0.80,
          evidence: [`Revenue: $${revenue.toLocaleString()}`],
          urgency: 'medium',
        });
        recommendedActions.push('Focus on enterprise features and ROI');
      }
    }
    
    // Analyze news
    if (companyData.news && companyData.news.length > 0) {
      const recentNews = companyData.news.slice(0, 5);
      const hasProductLaunch = recentNews.some((news) =>
        news.title?.toLowerCase().includes('launch') ||
        news.title?.toLowerCase().includes('product')
      );

      if (hasProductLaunch) {
        buyingSignals.push({
          type: 'moderate',
          indicator: 'Product Launch Activity',
          description: 'Company is actively launching products',
          confidence: 0.65,
          evidence: ['Recent product launch activity'],
          urgency: 'medium',
        });
        recommendedActions.push('Position Browserbase for product testing and QA automation');
      }
    }
    
    // Default signals if none found
    if (buyingSignals.length === 0) {
      buyingSignals.push({
        type: 'weak',
        indicator: 'Limited Signals',
        description: 'Not enough data to identify strong buying signals',
        confidence: 0.40,
        urgency: 'low',
      });
    }
    
    // Generate default recommendations
    if (recommendedActions.length === 0) {
      recommendedActions.push('Research company more deeply to identify specific needs');
      recommendedActions.push('Reach out with general Browserbase value proposition');
    }
    
    // Generate default pain points
    if (painPoints.length === 0) {
      painPoints.push('Likely managing browser automation infrastructure');
      painPoints.push('May need better scaling and reliability');
    }
    
    // Calculate scores
    const fitScore = companyData.techStack && companyData.techStack.length > 0 ? 70 : 50;
    const timingScore = (companyData.hiring?.engineeringRoleCount || 0) > 5 ? 65 : 50;
    const engagementScore = companyData.news && companyData.news.length > 0 ? 60 : 50;
    
    const overallPriority = fitScore >= 70 && timingScore >= 60 ? 'high' :
                           fitScore >= 60 || timingScore >= 50 ? 'medium' : 'low';
    
    return {
      buyingSignals,
      recommendedActions,
      painPoints,
      decisionMakers: ['VP of Engineering', 'CTO', 'Head of Infrastructure'],
      bestContactTime: 'Tuesday-Thursday, 10am-2pm',
      fitScore,
      timingScore,
      engagementScore,
      overallPriority,
      nextSteps: [
        'Research company more deeply',
        'Identify key decision makers',
        'Prepare personalized outreach',
      ],
    };
  }
}

export const prospectIntelligenceAgent = new ProspectIntelligenceAgent();

