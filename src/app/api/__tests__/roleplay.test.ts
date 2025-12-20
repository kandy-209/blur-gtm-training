import { POST } from '@/app/api/roleplay/route'
import { NextRequest } from 'next/server'

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
jest.mock('@/lib/ai-providers', () => {
  const mockProvider = {
    name: 'huggingface',
    generateResponse: jest.fn().mockResolvedValue(JSON.stringify({
      agent_response_text: 'Test response',
      scoring_feedback: 'Good response',
      response_evaluation: 'PASS',
      next_step_action: 'FOLLOW_UP',
      confidence_score: 85,
    })),
  };

  return {
    getAIProvider: jest.fn().mockReturnValue(mockProvider),
    HuggingFaceProvider: jest.fn().mockImplementation(() => mockProvider),
  };
})

describe('/api/roleplay', () => {
  beforeEach(() => {
    process.env.HUGGINGFACE_API_KEY = 'hf_test123'
    process.env.AI_PROVIDER = 'huggingface'
    delete process.env.OPENAI_API_KEY
    jest.clearAllMocks()
  })

  it('should return agent response for valid request', async () => {
    const requestBody = {
      scenarioInput: {
        turn_number: 1,
        scenario_id: 'test-scenario',
        objection_category: 'Competitive_SelfHosted',
        objection_statement: 'Test objection',
      },
      persona: {
        name: 'Test Persona',
        currentSolution: 'Test Solution',
        primaryGoal: 'Test Goal',
        skepticism: 'Test Skepticism',
        tone: 'Test Tone',
      },
      conversationHistory: [],
    }

    const request = new NextRequest('http://localhost/api/roleplay', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('agentResponse')
    expect(data.agentResponse).toHaveProperty('agent_response_text')
    expect(data.agentResponse).toHaveProperty('response_evaluation')
    expect(data.agentResponse).toHaveProperty('confidence_score')
  })

  it('should return error when no AI provider is configured', async () => {
    delete process.env.HUGGINGFACE_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.AI_PROVIDER

    const { getAIProvider } = require('@/lib/ai-providers');
    getAIProvider.mockReturnValueOnce(null); // Return null when no provider available

    const requestBody = {
      scenarioInput: {
        turn_number: 1,
        scenario_id: 'test-scenario',
        objection_category: 'Competitive_SelfHosted',
        objection_statement: 'Test objection',
      },
      persona: {
        name: 'Test Persona',
        currentSolution: 'Test Solution',
        primaryGoal: 'Test Goal',
        skepticism: 'Test Skepticism',
        tone: 'Test Tone',
      },
      conversationHistory: [],
    }

    const request = new NextRequest('http://localhost/api/roleplay', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response).toBeDefined();
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('AI provider')
  })

  it('should handle invalid request body', async () => {
    const request = new NextRequest('http://localhost/api/roleplay', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    // Should return 400 for validation errors (improved security)
    expect(response.status).toBe(400)
  })
})

