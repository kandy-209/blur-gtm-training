import { getAIProvider, AnthropicProvider } from '../ai-providers';

describe('AI Provider Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('End-to-End Provider Selection', () => {
    it('should select Anthropic when key is available', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';

      const provider = getAIProvider();
      expect(provider.name).toBe('anthropic');
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should handle empty Anthropic key gracefully', () => {
      process.env.ANTHROPIC_API_KEY = '';
      delete process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(() => getAIProvider()).toThrow(/No AI provider available|ANTHROPIC_API_KEY not configured/);
    });

    it('should handle whitespace-only Anthropic key', () => {
      process.env.ANTHROPIC_API_KEY = '   ';
      delete process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(() => getAIProvider()).toThrow(/No AI provider available|ANTHROPIC_API_KEY not configured/);
    });
  });

  describe('Error Recovery', () => {
    it('should provide helpful error when Anthropic key format is wrong', () => {
      process.env.ANTHROPIC_API_KEY = 'wrong-format';
      delete process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(() => getAIProvider()).toThrow(/No AI provider available|ANTHROPIC_API_KEY.*invalid|format invalid/);
    });

    it('should provide helpful error when no API key configured', () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(() => getAIProvider()).toThrow(/No AI provider available|ANTHROPIC_API_KEY not configured/);
    });
  });
});
