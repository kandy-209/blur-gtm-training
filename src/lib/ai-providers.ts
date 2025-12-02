/**
 * AI Provider System - Anthropic Claude Only
 * Simplified to use only Anthropic Claude (free tier available)
 */

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

// Get Anthropic provider (only provider available)
export function getAIProvider(): AIProvider {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  console.log('[AI Provider] Environment check:', {
    ANTHROPIC_API_KEY: anthropicKey ? 'SET' : 'NOT SET',
  });

  if (!anthropicKey || !anthropicKey.trim()) {
    throw new Error(`ANTHROPIC_API_KEY not configured. Get a free key at https://console.anthropic.com/`);
  }

  try {
    console.log('[AI Provider] Using Anthropic Claude (FREE TIER)');
    return new AnthropicProvider();
  } catch (error: any) {
    console.error('[AI Provider] Anthropic initialization failed:', error.message);
    throw new Error(`Anthropic Claude initialization failed: ${error.message}. Please check ANTHROPIC_API_KEY is valid.`);
  }
}
