import { AnthropicProvider } from '../ai-providers';

// Mock fetch globally
global.fetch = jest.fn();

describe('AnthropicProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    (global.fetch as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should initialize with valid sk-ant- key', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test123';
      const provider = new AnthropicProvider();
      expect(provider.name).toBe('anthropic');
    });

    it('should initialize with valid sk-ant-api key', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
      const provider = new AnthropicProvider();
      expect(provider.name).toBe('anthropic');
    });

    it('should trim whitespace from key', () => {
      process.env.ANTHROPIC_API_KEY = '  sk-ant-test123  ';
      const provider = new AnthropicProvider();
      expect(provider.name).toBe('anthropic');
    });

    it('should throw error without API key', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new AnthropicProvider()).toThrow('ANTHROPIC_API_KEY not configured');
    });

    it('should throw error with empty API key', () => {
      process.env.ANTHROPIC_API_KEY = '';
      expect(() => new AnthropicProvider()).toThrow('ANTHROPIC_API_KEY not configured');
    });

    it('should throw error with invalid key format', () => {
      process.env.ANTHROPIC_API_KEY = 'invalid-key';
      expect(() => new AnthropicProvider()).toThrow('ANTHROPIC_API_KEY format invalid');
    });
  });

  describe('generateResponse', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
    });

    it('should generate response successfully', async () => {
      const mockResponse = {
        content: [
          {
            text: JSON.stringify({
              agent_response_text: 'Test response',
              scoring_feedback: 'Good',
              response_evaluation: 'PASS',
              next_step_action: 'FOLLOW_UP',
              confidence_score: 85,
            }),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const provider = new AnthropicProvider();
      const messages = [{ role: 'user', content: 'Test message' }];
      const systemPrompt = 'Test system prompt';

      const result = await provider.generateResponse(messages, systemPrompt);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'sk-ant-api03-test123',
            'anthropic-version': '2023-06-01',
          }),
        })
      );

      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed.agent_response_text).toBe('Test response');
    });

    it('should wrap non-JSON response in JSON format', async () => {
      const mockResponse = {
        content: [{ text: 'Plain text response' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const provider = new AnthropicProvider();
      const result = await provider.generateResponse(
        [{ role: 'user', content: 'Test' }],
        'System prompt'
      );

      const parsed = JSON.parse(result);
      expect(parsed.agent_response_text).toBe('Plain text response');
      expect(parsed.response_evaluation).toBe('PASS');
      expect(parsed.confidence_score).toBe(80);
    });

    it('should extract JSON from text response', async () => {
      const mockResponse = {
        content: [
          {
            text: 'Here is the response: {"agent_response_text": "Extracted", "response_evaluation": "PASS"}',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const provider = new AnthropicProvider();
      const result = await provider.generateResponse(
        [{ role: 'user', content: 'Test' }],
        'System prompt'
      );

      const parsed = JSON.parse(result);
      expect(parsed.agent_response_text).toBe('Extracted');
    });

    it('should handle 401 unauthorized error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const provider = new AnthropicProvider();
      await expect(
        provider.generateResponse([{ role: 'user', content: 'Test' }], 'System')
      ).rejects.toThrow('Anthropic API key is invalid');
    });

    it('should retry on 429 rate limit error', async () => {
      // Mock first attempt (429), then success
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => 'Rate limit exceeded',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: [{ text: JSON.stringify({ agent_response_text: 'Success after retry' }) }],
          }),
        });

      const provider = new AnthropicProvider();
      const result = await provider.generateResponse([{ role: 'user', content: 'Test' }], 'System');
      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(2); // Should retry
    });

    it('should handle API errors after retries', async () => {
      // Mock 3 failed attempts (max retries)
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Internal server error',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Internal server error',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Internal server error',
        });

      const provider = new AnthropicProvider();
      await expect(
        provider.generateResponse([{ role: 'user', content: 'Test' }], 'System')
      ).rejects.toThrow(/Anthropic.*error/);
      expect(global.fetch).toHaveBeenCalledTimes(3); // Should retry 3 times
    });

    it('should filter out system messages from conversation', async () => {
      const mockResponse = {
        content: [{ text: 'Response' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const provider = new AnthropicProvider();
      const messages = [
        { role: 'system', content: 'System message' },
        { role: 'user', content: 'User message' },
        { role: 'assistant', content: 'Assistant message' },
      ];

      await provider.generateResponse(messages, 'System prompt');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('user');
      expect(body.messages[1].role).toBe('assistant');
      expect(body.system).toBe('System prompt');
    });

    it('should use correct model and max_tokens', async () => {
      const mockResponse = {
        content: [{ text: 'Response' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const provider = new AnthropicProvider();
      await provider.generateResponse([{ role: 'user', content: 'Test' }], 'System');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.model).toBe('claude-3-haiku-20240307');
      expect(body.max_tokens).toBe(2000);
    });
  });
});

