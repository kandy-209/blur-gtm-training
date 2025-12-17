/**
 * LLM Provider abstraction - supports multiple providers
 * Supports Claude (Anthropic), Gemini (Google), and OpenAI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type CompanyAnalysisProvider = 'claude' | 'gemini' | 'openai';

interface LLMResponse {
  content: string;
  model: string;
}

interface LLMProvider {
  extractMetrics(prompt: string, systemPrompt: string): Promise<LLMResponse | null>;
  analyzeCompany(prompt: string, systemPrompt: string): Promise<LLMResponse | null>;
}

/**
 * Claude (Anthropic) Provider - Best for financial analysis
 */
class ClaudeProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async extractMetrics(prompt: string, systemPrompt: string): Promise<LLMResponse | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022', // Latest and most capable model
          max_tokens: 4096, // Maximum for best results
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1, // Low temperature for accuracy in financial data
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API error:', error);
        return null;
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';

      return {
        content,
        model: 'claude-3-5-sonnet',
      };
    } catch (error) {
      console.error('Claude API request failed:', error);
      return null;
    }
  }

  async analyzeCompany(prompt: string, systemPrompt: string): Promise<LLMResponse | null> {
    return this.extractMetrics(prompt, systemPrompt);
  }
}

/**
 * OpenAI Provider (fallback) - Good alternative
 */
class OpenAIProvider implements LLMProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async extractMetrics(prompt: string, systemPrompt: string): Promise<LLMResponse | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        content,
        model: 'gpt-4-turbo',
      };
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      return null;
    }
  }

  async analyzeCompany(prompt: string, systemPrompt: string): Promise<LLMResponse | null> {
    return this.extractMetrics(prompt, systemPrompt);
  }
}

/**
 * Gemini Provider - Google's LLM
 */
class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.genAI;
  }

  async extractMetrics(prompt: string, systemPrompt: string): Promise<LLMResponse | null> {
    if (!this.genAI) {
      return null;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      return {
        content,
        model: 'gemini-1.5-pro',
      };
    } catch (error) {
      console.error('Gemini API request failed:', error);
      return null;
    }
  }

  async analyzeCompany(prompt: string, systemPrompt: string): Promise<LLMResponse | null> {
    return this.extractMetrics(prompt, systemPrompt);
  }
}

/**
 * Get LLM provider with optional provider selection
 * Priority: Claude > Gemini > OpenAI > null (fallback to rule-based)
 */
export function getLLMProvider(provider?: CompanyAnalysisProvider): LLMProvider | null {
  // If provider is specified, use it
  if (provider) {
    switch (provider) {
      case 'claude': {
        const claude = new ClaudeProvider();
        return claude.isAvailable() ? claude : null;
      }
      case 'gemini': {
        const gemini = new GeminiProvider();
        return gemini.isAvailable() ? gemini : null;
      }
      case 'openai': {
        const openai = new OpenAIProvider();
        return openai.isAvailable() ? openai : null;
      }
      default:
        return null;
    }
  }

  // Auto-select based on availability (priority: Claude > Gemini > OpenAI)
  const claude = new ClaudeProvider();
  if (claude.isAvailable()) {
    return claude;
  }

  const gemini = new GeminiProvider();
  if (gemini.isAvailable()) {
    return gemini;
  }

  const openai = new OpenAIProvider();
  if (openai.isAvailable()) {
    return openai;
  }

  // No LLM available
  return null;
}

/**
 * Get provider name for logging
 */
export function getProviderName(provider?: CompanyAnalysisProvider): string {
  const selectedProvider = getLLMProvider(provider);
  if (selectedProvider instanceof ClaudeProvider) {
    return 'Claude 3.5 Sonnet';
  }
  if (selectedProvider instanceof GeminiProvider) {
    return 'Gemini 1.5 Pro';
  }
  if (selectedProvider instanceof OpenAIProvider) {
    return 'OpenAI GPT-4 Turbo';
  }
  return 'Rule-based (no LLM)';
}

/**
 * Extract JSON from LLM response (handles both Claude and OpenAI formats)
 */
export function parseLLMJSON(content: string): any {
  try {
    // Try direct JSON parse first
    return JSON.parse(content);
  } catch {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try finding JSON object in text
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return JSON.parse(jsonObjectMatch[0]);
    }

    throw new Error('No valid JSON found in response');
  }
}

