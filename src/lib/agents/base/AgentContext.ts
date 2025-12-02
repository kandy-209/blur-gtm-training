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

export interface ResponseGenerationInput {
  objection: string;
  context: AgentContext;
  conversationHistory: Array<{ role: string; message: string }>;
}

export interface ResponseRankingInput {
  responses: Array<{
    text: string;
    metadata?: Record<string, any>;
  }>;
  context: AgentContext;
}

export interface ImprovementGenerationInput {
  originalMessage: string;
  feedback?: string;
  context: AgentContext;
}

export interface FeedbackAnalysisInput {
  feedback: {
    text: string;
    improvedMessage?: string;
    rating: number;
  };
  originalMessage: string;
  context: AgentContext;
}

export interface ResourceMatchingInput {
  message: string;
  objectionCategory: string;
  context?: AgentContext;
}

