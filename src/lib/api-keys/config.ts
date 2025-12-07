/**
 * Centralized API Key Configuration
 * All API keys and their validation rules
 */

export interface ApiKeyConfig {
  key: string;
  name: string;
  description: string;
  required: boolean;
  category: 'core' | 'ai' | 'database' | 'voice' | 'analytics' | 'storage' | 'optional';
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    startsWith?: string[];
    url?: boolean;
  };
  getUrl?: string; // Where to get the key
  envVar: string; // Environment variable name
}

export const API_KEY_CONFIGS: ApiKeyConfig[] = [
  // Core Database
  {
    key: 'supabase-url',
    name: 'Supabase URL',
    description: 'Your Supabase project URL',
    required: true,
    category: 'database',
    validation: {
      url: true,
      pattern: /^https:\/\/.*\.supabase\.co$/,
    },
    getUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    envVar: 'NEXT_PUBLIC_SUPABASE_URL',
  },
  {
    key: 'supabase-anon-key',
    name: 'Supabase Anon Key',
    description: 'Supabase anonymous/public key',
    required: true,
    category: 'database',
    validation: {
      minLength: 100,
      startsWith: ['eyJ'],
    },
    getUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    envVar: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  },
  {
    key: 'supabase-service-key',
    name: 'Supabase Service Role Key',
    description: 'Supabase service role key (keep secret!)',
    required: true,
    category: 'database',
    validation: {
      minLength: 100,
      startsWith: ['eyJ'],
    },
    getUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    envVar: 'SUPABASE_SERVICE_ROLE_KEY',
  },

  // AI Providers
  {
    key: 'anthropic',
    name: 'Anthropic API Key',
    description: 'Claude AI API key for advanced analysis',
    required: false,
    category: 'ai',
    validation: {
      minLength: 20,
      startsWith: ['sk-ant-'],
    },
    getUrl: 'https://console.anthropic.com/',
    envVar: 'ANTHROPIC_API_KEY',
  },
  {
    key: 'openai',
    name: 'OpenAI API Key',
    description: 'OpenAI GPT API key',
    required: false,
    category: 'ai',
    validation: {
      minLength: 20,
      startsWith: ['sk-'],
    },
    getUrl: 'https://platform.openai.com/api-keys',
    envVar: 'OPENAI_API_KEY',
  },

  // Voice & Phone
  {
    key: 'elevenlabs',
    name: 'ElevenLabs API Key',
    description: 'ElevenLabs voice synthesis API key',
    required: false,
    category: 'voice',
    validation: {
      minLength: 20,
    },
    getUrl: 'https://elevenlabs.io/app/settings/api-keys',
    envVar: 'ELEVENLABS_API_KEY',
  },
  {
    key: 'elevenlabs-voice-id',
    name: 'ElevenLabs Voice ID',
    description: 'Default ElevenLabs voice ID',
    required: false,
    category: 'voice',
    validation: {
      minLength: 10,
    },
    getUrl: 'https://elevenlabs.io/app/voice-library',
    envVar: 'NEXT_PUBLIC_ELEVENLABS_VOICE_ID',
  },
  {
    key: 'elevenlabs-agent-id',
    name: 'ElevenLabs Agent ID',
    description: 'ElevenLabs conversational AI agent ID',
    required: false,
    category: 'voice',
    validation: {
      minLength: 10,
    },
    getUrl: 'https://elevenlabs.io/app/convai',
    envVar: 'NEXT_PUBLIC_ELEVENLABS_AGENT_ID',
  },
  {
    key: 'vapi',
    name: 'Vapi API Key',
    description: 'Vapi phone call API key',
    required: false,
    category: 'voice',
    validation: {
      minLength: 20,
    },
    getUrl: 'https://vapi.ai/dashboard',
    envVar: 'VAPI_API_KEY',
  },

  // Modal & Serverless
  {
    key: 'modal-function-url',
    name: 'Modal Function URL',
    description: 'Modal serverless function endpoint URL',
    required: false,
    category: 'ai',
    validation: {
      url: true,
      pattern: /^https:\/\/.*\.modal\.run$/,
    },
    getUrl: 'https://modal.com/',
    envVar: 'MODAL_FUNCTION_URL',
  },

  // Analytics & Data
  {
    key: 'alpha-vantage',
    name: 'Alpha Vantage API Key',
    description: 'Alpha Vantage financial data API key',
    required: false,
    category: 'analytics',
    validation: {
      minLength: 10,
    },
    getUrl: 'https://www.alphavantage.co/support/#api-key',
    envVar: 'ALPHA_VANTAGE_API_KEY',
  },
  {
    key: 'clearbit',
    name: 'Clearbit API Key',
    description: 'Clearbit company enrichment API key',
    required: false,
    category: 'analytics',
    validation: {
      minLength: 20,
    },
    getUrl: 'https://clearbit.com/',
    envVar: 'CLEARBIT_API_KEY',
  },
  {
    key: 'news-api',
    name: 'News API Key',
    description: 'News API key for news sentiment analysis',
    required: false,
    category: 'analytics',
    validation: {
      minLength: 20,
    },
    getUrl: 'https://newsapi.org/register',
    envVar: 'NEWS_API_KEY',
  },

  // Storage
  {
    key: 's3-endpoint',
    name: 'S3 Endpoint',
    description: 'S3-compatible storage endpoint',
    required: false,
    category: 'storage',
    validation: {
      url: true,
    },
    envVar: 'S3_ENDPOINT',
  },
  {
    key: 's3-access-key',
    name: 'S3 Access Key',
    description: 'S3 access key ID',
    required: false,
    category: 'storage',
    validation: {
      minLength: 10,
    },
    envVar: 'S3_ACCESS_KEY_ID',
  },
  {
    key: 's3-secret-key',
    name: 'S3 Secret Key',
    description: 'S3 secret access key',
    required: false,
    category: 'storage',
    validation: {
      minLength: 20,
    },
    envVar: 'S3_SECRET_ACCESS_KEY',
  },
  {
    key: 's3-bucket',
    name: 'S3 Bucket',
    description: 'S3 bucket name',
    required: false,
    category: 'storage',
    envVar: 'S3_BUCKET',
  },

  // Monitoring & Infrastructure
  {
    key: 'sentry-dsn',
    name: 'Sentry DSN',
    description: 'Sentry error tracking DSN',
    required: false,
    category: 'optional',
    validation: {
      url: true,
      pattern: /^https:\/\/.*@.*\.ingest\.sentry\.io\/.*$/,
    },
    getUrl: 'https://sentry.io/settings/projects/',
    envVar: 'SENTRY_DSN',
  },
  {
    key: 'redis-url',
    name: 'Redis URL',
    description: 'Redis connection URL',
    required: false,
    category: 'optional',
    validation: {
      url: true,
    },
    envVar: 'REDIS_URL',
  },
];

/**
 * Get API key config by environment variable name
 */
export function getConfigByEnvVar(envVar: string): ApiKeyConfig | undefined {
  return API_KEY_CONFIGS.find(config => config.envVar === envVar);
}

/**
 * Get API key config by key
 */
export function getConfigByKey(key: string): ApiKeyConfig | undefined {
  return API_KEY_CONFIGS.find(config => config.key === key);
}

/**
 * Get all required API keys
 */
export function getRequiredKeys(): ApiKeyConfig[] {
  return API_KEY_CONFIGS.filter(config => config.required);
}

/**
 * Get API keys by category
 */
export function getKeysByCategory(category: ApiKeyConfig['category']): ApiKeyConfig[] {
  return API_KEY_CONFIGS.filter(config => config.category === category);
}

