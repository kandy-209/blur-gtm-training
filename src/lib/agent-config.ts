/**
 * Agent Configuration
 * Centralized configuration for all AI agents
 */

export interface AgentConfig {
  provider: 'claude' | 'openai' | 'gemini';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
  };
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  cacheConfig?: {
    enabled: boolean;
    ttl: number;
  };
}

const defaultConfig: AgentConfig = {
  provider: (process.env.STAGEHAND_LLM_PROVIDER as any) || 'claude',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000,
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  },
  rateLimit: {
    maxRequests: 30,
    windowMs: 60000,
  },
  cacheConfig: {
    enabled: true,
    ttl: 60000,
  },
};

export class AgentConfigManager {
  private configs: Map<string, AgentConfig> = new Map();

  /**
   * Get config for agent (with defaults)
   */
  getConfig(agentName: string): AgentConfig {
    return this.configs.get(agentName) || { ...defaultConfig };
  }

  /**
   * Set config for agent
   */
  setConfig(agentName: string, config: Partial<AgentConfig>): void {
    const existing = this.getConfig(agentName);
    this.configs.set(agentName, { ...existing, ...config });
  }

  /**
   * Get model name for provider
   */
  getModelName(provider: string): string {
    switch (provider) {
      case 'claude':
        return process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      case 'openai':
        return process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
      case 'gemini':
        return process.env.GEMINI_MODEL || 'gemini-pro';
      default:
        return 'claude-3-5-sonnet-20241022';
    }
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(provider: string): boolean {
    switch (provider) {
      case 'claude':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'gemini':
        return !!process.env.GOOGLE_GEMINI_API_KEY;
      default:
        return false;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (this.isProviderAvailable('claude')) providers.push('claude');
    if (this.isProviderAvailable('openai')) providers.push('openai');
    if (this.isProviderAvailable('gemini')) providers.push('gemini');
    return providers;
  }
}

export const agentConfigManager = new AgentConfigManager();

// Configure default settings for each agent
agentConfigManager.setConfig('CoachingAgent', {
  provider: defaultConfig.provider,
  temperature: 0.7,
  maxTokens: 2000,
  cacheConfig: {
    enabled: true,
    ttl: 30000, // 30 seconds for coaching
  },
});

agentConfigManager.setConfig('AnalyticsAgent', {
  provider: defaultConfig.provider,
  temperature: 0.5, // Lower temperature for analytics
  maxTokens: 2000,
  cacheConfig: {
    enabled: true,
    ttl: 120000, // 2 minutes for analytics
  },
});

agentConfigManager.setConfig('ProspectIntelligenceAgent', {
  provider: defaultConfig.provider,
  temperature: 0.6,
  maxTokens: 2000,
  cacheConfig: {
    enabled: true,
    ttl: 300000, // 5 minutes for prospect intelligence
  },
});

