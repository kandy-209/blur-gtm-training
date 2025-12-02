import { POST } from '@/app/api/roleplay/route'

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

// Mock NextRequest
class MockNextRequest {
  public headers: Headers
  constructor(public url: string, public init?: RequestInit) {
    this.headers = new Headers(init?.headers)
  }
  async json() {
    return JSON.parse(this.init?.body as string || '{}')
  }
  async text() {
    return this.init?.body as string || ''
  }
  get ip() {
    return '127.0.0.1'
  }
}

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
        objection_category: 'Competitive_Copilot',
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

    const request = new MockNextRequest('http://localhost/api/roleplay', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    }) as any

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
    delete process.env.AI_PROVIDER

    const { getAIProvider } = require('@/lib/ai-providers');
    getAIProvider.mockImplementation(() => {
      throw new Error('No AI provider available');
    });

    const requestBody = {
      scenarioInput: {
        turn_number: 1,
        scenario_id: 'test-scenario',
        objection_category: 'Competitive_Copilot',
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

    const request = new MockNextRequest('http://localhost/api/roleplay', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('AI provider')
  })

  it('should handle invalid request body', async () => {
    const request = new MockNextRequest('http://localhost/api/roleplay', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(request)
    // Should return 400 for validation errors (improved security)
    expect(response.status).toBe(400)
  })
})

