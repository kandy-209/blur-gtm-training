/**
 * LLM Provider abstraction - supports multiple providers
 * Prioritizes Claude (Anthropic), falls back to OpenAI
 */

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
 * Get the best available LLM provider
 * Priority: Claude > OpenAI > null (fallback to rule-based)
 */
export function getLLMProvider(): LLMProvider | null {
  // Check for Claude first (best for financial analysis)
  const claude = new ClaudeProvider();
  if (claude.isAvailable()) {
    return claude;
  }

  // Fallback to OpenAI
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
export function getProviderName(): string {
  const provider = getLLMProvider();
  if (provider instanceof ClaudeProvider) {
    return 'Claude 3.5 Sonnet';
  }
  if (provider instanceof OpenAIProvider) {
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

