/**
 * Utility functions for AI provider management
 */

export interface ProviderHealth {
  name: string;
  available: boolean;
  lastChecked: Date;
  error?: string;
}

const providerHealthCache = new Map<string, ProviderHealth>();

/**
 * Check if a provider is healthy and available
 */
export async function checkProviderHealth(providerName: string, forceRefresh: boolean = false): Promise<ProviderHealth> {
  const cached = providerHealthCache.get(providerName);
  if (!forceRefresh && cached && Date.now() - cached.lastChecked.getTime() < 60000) {
    return cached; // Return cached result if less than 1 minute old
  }

  const health: ProviderHealth = {
    name: providerName,
    available: false,
    lastChecked: new Date(),
  };

  try {
    // Simple health check - validate key format
    if (providerName === 'anthropic' || providerName === 'claude') {
      const key = process.env.ANTHROPIC_API_KEY;
      const validation = validateAPIKey('anthropic', key || '');
      if (validation.valid) {
        health.available = true;
      } else {
        health.error = validation.error || 'ANTHROPIC_API_KEY not configured or invalid';
      }
    } else if (providerName === 'gemini') {
      const key = process.env.GOOGLE_GEMINI_API_KEY;
      const validation = validateAPIKey('gemini', key || '');
      if (validation.valid) {
        health.available = true;
      } else {
        health.error = validation.error || 'GOOGLE_GEMINI_API_KEY not configured or invalid';
      }
    } else if (providerName === 'openai') {
      const key = process.env.OPENAI_API_KEY;
      const validation = validateAPIKey('openai', key || '');
      if (validation.valid) {
        health.available = true;
      } else {
        health.error = validation.error || 'OPENAI_API_KEY not configured or invalid';
      }
    } else {
      // Other providers not supported
      health.available = false;
      health.error = `${providerName} provider not supported. Supported providers: claude, gemini, openai.`;
    }
  } catch (error: any) {
    health.error = error.message;
  }

  providerHealthCache.set(providerName, health);
  return health;
}

/**
 * Get health status for all providers
 */
export async function getAllProviderHealth(): Promise<ProviderHealth[]> {
  const providers = ['claude', 'gemini', 'openai'];
  return Promise.all(providers.map(p => checkProviderHealth(p)));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain errors
      if (error.message?.includes('401') || error.message?.includes('invalid')) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Validate API key format
 */
export function validateAPIKey(provider: string, key: string): { valid: boolean; error?: string } {
  if (!key || !key.trim()) {
    return { valid: false, error: 'API key is empty' };
  }

  const trimmed = key.trim();

  switch (provider) {
    case 'anthropic':
    case 'claude':
      if (!trimmed.startsWith('sk-ant-')) {
        return { valid: false, error: 'Anthropic key must start with sk-ant-' };
      }
      break;
    case 'gemini':
      // Google API keys typically start with AIza
      if (!trimmed.startsWith('AIza')) {
        return { valid: false, error: 'Gemini key format invalid. Should start with AIza' };
      }
      break;
    case 'openai':
      if (!trimmed.startsWith('sk-')) {
        return { valid: false, error: 'OpenAI key must start with sk-' };
      }
      break;
    case 'huggingface':
      // Not supported
      return { valid: false, error: 'HuggingFace is not supported. Use claude, gemini, or openai.' };
    default:
      return { valid: false, error: `Unknown provider: ${provider}. Supported: claude, gemini, openai` };
  }

  return { valid: true };
}

