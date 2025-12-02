export interface AgentConfig {
  name: string;
  description: string;
  version: string;
  timeout?: number;
  retries?: number;
}

export interface AgentContext {
  userId?: string;
  scenarioId?: string;
  objectionCategory?: string;
  conversationHistory?: Array<{ role: string; message: string }>;
  persona?: {
    name: string;
    currentSolution: string;
    primaryGoal: string;
    skepticism: string;
    tone: string;
  };
  metadata?: Record<string, any>;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    agent: string;
    executionTime: number;
    tokensUsed?: number;
    confidence?: number;
  };
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected context: AgentContext;

  constructor(config: AgentConfig) {
    this.config = config;
    this.context = {};
  }

  abstract execute(input: any, context?: AgentContext): Promise<AgentResult>;

  protected setContext(context: AgentContext): void {
    this.context = { ...this.context, ...context };
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.retries || 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  protected log(message: string, data?: any): void {
    console.log(`[${this.config.name}] ${message}`, data || '');
  }

  protected error(message: string, error?: any): void {
    console.error(`[${this.config.name}] ERROR: ${message}`, error || '');
  }
}

