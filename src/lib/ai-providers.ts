/**
 * AI Provider System - Multi-LLM Support
 * Supports Claude (Anthropic), Gemini (Google), and OpenAI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type LLMProvider = 'claude' | 'gemini' | 'openai';

export interface AIProvider {
  name: string;
  generateResponse(messages: any[], systemPrompt: string): Promise<string>;
}

// Anthropic Claude Provider (Free tier available)
export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('ANTHROPIC_API_KEY not configured. Get a free key at https://console.anthropic.com/');
    }
    this.apiKey = this.apiKey.trim();
    // Validate key format - Anthropic keys can start with 'sk-ant-' or 'sk-ant-api'
    if (!this.apiKey.startsWith('sk-ant-')) {
      throw new Error(`ANTHROPIC_API_KEY format invalid. Should start with 'sk-ant-' or 'sk-ant-api'. Got: ${this.apiKey.substring(0, 15)}...`);
    }
  }

  async generateResponse(messages: any[], systemPrompt: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Format messages for Claude
        const formattedMessages = messages
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));

        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307', // Free tier model
              max_tokens: 2000,
              system: systemPrompt,
              messages: formattedMessages,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Anthropic API error (${response.status}): ${errorText}`;
            
            if (response.status === 401) {
              errorMessage = 'Anthropic API key is invalid. Please check ANTHROPIC_API_KEY is correct.';
              throw new Error(errorMessage); // Don't retry auth errors
            } else if (response.status === 429) {
              errorMessage = 'Anthropic rate limit exceeded. Please try again in a moment.';
              if (attempt < maxRetries - 1) {
                // Retry rate limit errors with backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                continue;
              }
            }
            
            throw new Error(errorMessage);
          }

          const data = await response.json();
          let text = data.content[0]?.text || '';
          
          // Try to extract JSON from response
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              JSON.parse(jsonMatch[0]); // Validate JSON
              return jsonMatch[0];
            }
          } catch {
            // Not JSON, wrap it
          }
          
          // Wrap in required JSON format if not already JSON
          return JSON.stringify({
            agent_response_text: text.trim(),
            scoring_feedback: "Response generated successfully",
            response_evaluation: "PASS",
            next_step_action: "FOLLOW_UP",
            confidence_score: 80
          });
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timeout after 30 seconds');
          }
          throw fetchError;
        }
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.message?.includes('401') || error.message?.includes('invalid')) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw new Error(`Anthropic error after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }
}

// Google Gemini Provider
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured. Get a key at https://makersuite.google.com/app/apikey');
    }
    this.apiKey = this.apiKey.trim();
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async generateResponse(messages: any[], systemPrompt: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        
        // Combine system prompt and messages for Gemini
        const fullPrompt = `${systemPrompt}\n\n${messages.map(msg => {
          if (msg.role === 'user') {
            return `User: ${msg.content}`;
          } else if (msg.role === 'assistant') {
            return `Assistant: ${msg.content}`;
          }
          return '';
        }).filter(Boolean).join('\n\n')}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();

        // Try to extract JSON from response
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            JSON.parse(jsonMatch[0]); // Validate JSON
            return jsonMatch[0];
          }
        } catch {
          // Not JSON, wrap it
        }

        // Wrap in required JSON format if not already JSON
        return JSON.stringify({
          agent_response_text: text.trim(),
          scoring_feedback: "Response generated successfully",
          response_evaluation: "PASS",
          next_step_action: "FOLLOW_UP",
          confidence_score: 80
        });
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (error.message?.includes('401') || error.message?.includes('invalid') || error.message?.includes('API key')) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw new Error(`Gemini error after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('OPENAI_API_KEY not configured. Get a key at https://platform.openai.com/api-keys');
    }
    this.apiKey = this.apiKey.trim();
    if (!this.apiKey.startsWith('sk-')) {
      throw new Error(`OPENAI_API_KEY format invalid. Should start with 'sk-'. Got: ${this.apiKey.substring(0, 10)}...`);
    }
  }

  async generateResponse(messages: any[], systemPrompt: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Format messages for OpenAI (include system message)
        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.filter(msg => msg.role !== 'system').map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }))
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: formattedMessages,
              max_tokens: 2000,
              temperature: 0.7,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `OpenAI API error (${response.status}): ${errorText}`;
            
            if (response.status === 401) {
              errorMessage = 'OpenAI API key is invalid. Please check OPENAI_API_KEY is correct.';
              throw new Error(errorMessage);
            } else if (response.status === 429) {
              errorMessage = 'OpenAI rate limit exceeded. Please try again in a moment.';
              if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                continue;
              }
            }
            
            throw new Error(errorMessage);
          }

          const data = await response.json();
          let text = data.choices[0]?.message?.content || '';

          // Try to extract JSON from response
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              JSON.parse(jsonMatch[0]);
              return jsonMatch[0];
            }
          } catch {
            // Not JSON, wrap it
          }

          // Wrap in required JSON format if not already JSON
          return JSON.stringify({
            agent_response_text: text.trim(),
            scoring_feedback: "Response generated successfully",
            response_evaluation: "PASS",
            next_step_action: "FOLLOW_UP",
            confidence_score: 80
          });
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timeout after 30 seconds');
          }
          throw fetchError;
        }
      } catch (error: any) {
        lastError = error;

        if (error.message?.includes('401') || error.message?.includes('invalid')) {
          throw error;
        }

        if (attempt < maxRetries - 1) {
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw new Error(`OpenAI error after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }
}

// Get AI provider with optional provider selection
export function getAIProvider(provider?: LLMProvider): AIProvider {
  // If provider is specified, use it
  if (provider) {
    try {
      switch (provider) {
        case 'claude':
          return new AnthropicProvider();
        case 'gemini':
          return new GeminiProvider();
        case 'openai':
          return new OpenAIProvider();
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to initialize ${provider}: ${error.message}`);
    }
  }

  // Auto-detect based on available API keys (priority: Claude > Gemini > OpenAI)
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  console.log('[AI Provider] Environment check:', {
    ANTHROPIC_API_KEY: anthropicKey ? 'SET' : 'NOT SET',
    GOOGLE_GEMINI_API_KEY: geminiKey ? 'SET' : 'NOT SET',
    OPENAI_API_KEY: openaiKey ? 'SET' : 'NOT SET',
  });

  // Try Claude first
  if (anthropicKey && anthropicKey.trim()) {
    try {
      console.log('[AI Provider] Using Anthropic Claude');
      return new AnthropicProvider();
    } catch (error: any) {
      console.warn('[AI Provider] Claude initialization failed:', error.message);
    }
  }

  // Try Gemini second
  if (geminiKey && geminiKey.trim()) {
    try {
      console.log('[AI Provider] Using Google Gemini');
      return new GeminiProvider();
    } catch (error: any) {
      console.warn('[AI Provider] Gemini initialization failed:', error.message);
    }
  }

  // Try OpenAI third
  if (openaiKey && openaiKey.trim()) {
    try {
      console.log('[AI Provider] Using OpenAI');
      return new OpenAIProvider();
    } catch (error: any) {
      console.warn('[AI Provider] OpenAI initialization failed:', error.message);
    }
  }

  // No provider available
  throw new Error('No AI provider available. Please configure at least one of: ANTHROPIC_API_KEY, GOOGLE_GEMINI_API_KEY, or OPENAI_API_KEY');
}
