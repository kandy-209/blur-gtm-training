import { POST } from '../roleplay/route';
import { NextRequest } from 'next/server';

// Mock AI providers
const mockAnthropicProvider = {
  name: 'anthropic',
  generateResponse: jest.fn().mockResolvedValue(
    JSON.stringify({
      agent_response_text: 'Test Anthropic response',
      scoring_feedback: 'Good response',
      response_evaluation: 'PASS',
      next_step_action: 'FOLLOW_UP',
      confidence_score: 85,
    })
  ),
};

jest.mock('@/lib/ai-providers', () => ({
  getAIProvider: jest.fn(() => mockAnthropicProvider),
  AnthropicProvider: jest.fn(() => mockAnthropicProvider),
}));

describe('Roleplay API - Anthropic Integration', () => {
  const mockRequest = (body: any) => {
    return {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
  });

  it('should use Anthropic provider when key is available', async () => {
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
    expect(data.agentResponse.agent_response_text).toBe('Test Anthropic response');
    expect(data.agentResponse.response_evaluation).toBe('PASS');
  });

  it('should handle Anthropic API errors gracefully', async () => {
    const { getAIProvider } = require('@/lib/ai-providers');
    mockAnthropicProvider.generateResponse.mockRejectedValueOnce(
      new Error('Anthropic API error: Rate limit exceeded')
    );

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
    expect(data.error).toContain('Anthropic');
  });
});
