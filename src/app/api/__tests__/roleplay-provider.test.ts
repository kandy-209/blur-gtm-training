import { POST } from '../roleplay/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    roleplayTurn: {
      create: jest.fn().mockResolvedValue({ id: 'turn_123' }),
    },
  },
}));

jest.mock('@/lib/error-handler', () => ({
  handleError: jest.fn((error) => {
    return {
      json: () => Promise.resolve({ error: error.message }),
      status: 500,
    };
  }),
  withErrorHandler: jest.fn((fn) => {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error: any) {
        return {
          json: () => Promise.resolve({ error: error.message }),
          status: 500,
        };
      }
    };
  }),
  generateRequestId: jest.fn(() => 'req_123'),
}));

jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@/lib/metrics', () => ({
  recordApiCall: jest.fn(),
  roleplayTurnsTotal: {
    inc: jest.fn(),
  },
}));

jest.mock('@/lib/sentry', () => ({
  captureException: jest.fn(),
}));

// Mock AI providers
const mockProvider = {
  name: 'huggingface',
  generateResponse: jest.fn().mockResolvedValue(JSON.stringify({
    agent_response_text: 'Test response',
    scoring_feedback: 'Good',
    response_evaluation: 'PASS',
    next_step_action: 'FOLLOW_UP',
    confidence_score: 80,
  })),
};

jest.mock('@/lib/ai-providers', () => ({
  getAIProvider: jest.fn(() => mockProvider),
  HuggingFaceProvider: jest.fn(() => mockProvider),
}));

describe('Roleplay API - Provider Selection', () => {
  const mockRequest = (body: any) => {
    return new NextRequest('http://localhost/api/roleplay', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HUGGINGFACE_API_KEY = 'hf_test123';
    process.env.AI_PROVIDER = 'huggingface';
    
    // Reset mock to return provider
    const { getAIProvider } = require('@/lib/ai-providers');
    (getAIProvider as jest.Mock).mockReturnValue(mockProvider);
    mockProvider.generateResponse.mockResolvedValue(JSON.stringify({
      agent_response_text: 'Test response',
      scoring_feedback: 'Good',
      response_evaluation: 'PASS',
      next_step_action: 'FOLLOW_UP',
      confidence_score: 80,
    }));
  });

  it('should use Hugging Face when key is available', async () => {
    const { getAIProvider } = require('@/lib/ai-providers');

    const request = mockRequest({
      scenarioInput: {
        turn_number: 1,
        scenario_id: 'TEST_001',
        objection_category: 'Test',
        objection_statement: 'Test objection',
      },
      persona: {
        name: 'Test Persona',
        currentSolution: 'Test solution',
        primaryGoal: 'Test goal',
        skepticism: 'Test skepticism',
        tone: 'Professional',
      },
      conversationHistory: [],
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(getAIProvider).toHaveBeenCalled();
    const data = await response.json();
    expect(data).toHaveProperty('agentResponse');
  });

  it('should handle Hugging Face errors gracefully', async () => {
    const { getAIProvider } = require('@/lib/ai-providers');
    (getAIProvider as jest.Mock).mockImplementation(() => {
      throw new Error('Hugging Face API error');
    });

    const request = mockRequest({
      scenarioInput: {
        turn_number: 1,
        scenario_id: 'TEST_001',
        objection_category: 'Test',
        objection_statement: 'Test objection',
      },
      persona: {
        name: 'Test Persona',
        currentSolution: 'Test solution',
        primaryGoal: 'Test goal',
        skepticism: 'Test skepticism',
        tone: 'Professional',
      },
      conversationHistory: [],
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('Hugging Face');
  });
});

