/**
 * Coaching Agent
 * AI-powered real-time coaching for role-play training
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

interface CoachingContext {
  userMessage: string;
  conversationHistory: Array<{ role: 'rep' | 'agent'; message: string }>;
  scenario: {
    id: string;
    keyPoints: string[];
    objection_category: string;
    persona: {
      name: string;
      currentSolution: string;
      primaryGoal: string;
    };
  };
  turnNumber: number;
}

interface CoachingSuggestion {
  type: 'hint' | 'warning' | 'success' | 'improvement';
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
  keywords?: string[];
  confidence: number;
}

interface CoachingAnalysis {
  suggestions: CoachingSuggestion[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
}

export class CoachingAgent {
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
   * Analyze user's response and provide real-time coaching
   */
  async analyzeAndCoach(context: CoachingContext): Promise<CoachingAnalysis> {
    const provider = process.env.STAGEHAND_LLM_PROVIDER || 'claude';
    
    try {
      if (provider === 'claude' && this.anthropic) {
        return await this.analyzeWithClaude(context);
      } else if (provider === 'openai' && this.openai) {
        return await this.analyzeWithOpenAI(context);
      } else if (provider === 'gemini' && this.gemini) {
        return await this.analyzeWithGemini(context);
      } else {
        // Fallback to rule-based coaching
        return this.fallbackCoaching(context);
      }
    } catch (error) {
      console.error('Coaching agent error:', error);
      return this.fallbackCoaching(context);
    }
  }

  private async analyzeWithClaude(context: CoachingContext): Promise<CoachingAnalysis> {
    const prompt = this.buildCoachingPrompt(context);
    
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
      return this.parseCoachingResponse(content.text);
    }
    
    return this.fallbackCoaching(context);
  }

  private async analyzeWithOpenAI(context: CoachingContext): Promise<CoachingAnalysis> {
    const prompt = this.buildCoachingPrompt(context);
    
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
      return this.parseCoachingResponse(content);
    }
    
    return this.fallbackCoaching(context);
  }

  private async analyzeWithGemini(context: CoachingContext): Promise<CoachingAnalysis> {
    const prompt = this.buildCoachingPrompt(context);
    const model = this.gemini!.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      return this.parseCoachingResponse(text);
    }
    
    return this.fallbackCoaching(context);
  }

  private buildCoachingPrompt(context: CoachingContext): string {
    return `You are an expert sales coach analyzing a sales rep's response during role-play training.

# Context
- Scenario: ${context.scenario.id}
- Objection Category: ${context.scenario.objection_category}
- Turn Number: ${context.turnNumber}
- Prospect Persona: ${context.scenario.persona.name}
- Prospect's Current Solution: ${context.scenario.persona.currentSolution}
- Prospect's Primary Goal: ${context.scenario.persona.primaryGoal}

# Key Points to Address
${context.scenario.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}

# Conversation History
${context.conversationHistory.map((msg, i) => 
  `${msg.role === 'rep' ? 'Rep' : 'Prospect'}: ${msg.message}`
).join('\n\n')}

# Rep's Current Response
${context.userMessage}

# Your Task
Analyze the rep's response and provide real-time coaching. Consider:
1. Are they addressing the key points?
2. Are they using Browserbase value propositions effectively?
3. Are they handling the objection appropriately?
4. What could they improve?
5. What are they doing well?

Respond in JSON format:
{
  "suggestions": [
    {
      "type": "hint|warning|success|improvement",
      "priority": "high|medium|low",
      "message": "Brief coaching message",
      "suggestion": "Specific actionable suggestion",
      "keywords": ["keyword1", "keyword2"],
      "confidence": 0.85
    }
  ],
  "overallScore": 75,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "nextSteps": ["step1", "step2"]
}`;
  }

  private parseCoachingResponse(text: string): CoachingAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          suggestions: parsed.suggestions || [],
          overallScore: parsed.overallScore || 70,
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          nextSteps: parsed.nextSteps || [],
        };
      }
    } catch (error) {
      console.error('Failed to parse coaching response:', error);
    }
    
    // Fallback parsing
    return {
      suggestions: [],
      overallScore: 70,
      strengths: [],
      weaknesses: [],
      nextSteps: [],
    };
  }

  private fallbackCoaching(context: CoachingContext): CoachingAnalysis {
    const suggestions: CoachingSuggestion[] = [];
    const messageLower = context.userMessage.toLowerCase();
    
    // Check for Browserbase keywords
    const browserbaseKeywords = ['browserbase', 'cloud browser', 'headless browser', 'browser automation'];
    const hasKeywords = browserbaseKeywords.some(kw => messageLower.includes(kw));
    
    if (!hasKeywords && context.userMessage.length > 20) {
      suggestions.push({
        type: 'hint',
        priority: 'high',
        message: "Consider mentioning Browserbase's key value propositions",
        suggestion: 'Try mentioning: cloud browser infrastructure, zero infrastructure overhead, or enterprise scalability',
        confidence: 0.8,
      });
    }
    
    // Check message length
    if (context.userMessage.length < 30) {
      suggestions.push({
        type: 'warning',
        priority: 'medium',
        message: 'Your response is quite short. Consider providing more detail.',
        confidence: 0.7,
      });
    }
    
    // Check for key points
    const missingKeyPoints = context.scenario.keyPoints.filter((point) => {
      const pointKeywords = point.toLowerCase().split(' ');
      return !pointKeywords.some((keyword) => messageLower.includes(keyword));
    });
    
    if (missingKeyPoints.length > 0 && context.turnNumber > 2) {
      suggestions.push({
        type: 'improvement',
        priority: 'medium',
        message: `You haven't addressed: ${missingKeyPoints[0]}`,
        suggestion: `Consider discussing: ${missingKeyPoints[0]}`,
        confidence: 0.75,
      });
    }
    
    return {
      suggestions,
      overallScore: hasKeywords ? 75 : 60,
      strengths: hasKeywords ? ['Good use of Browserbase terminology'] : [],
      weaknesses: !hasKeywords ? ['Missing Browserbase value propositions'] : [],
      nextSteps: ['Continue addressing the prospect\'s concerns', 'Build towards booking a meeting'],
    };
  }
}

export const coachingAgent = new CoachingAgent();

