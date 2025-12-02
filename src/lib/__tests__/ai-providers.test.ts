import { getAIProvider, AnthropicProvider } from '../ai-providers';

// Mock environment variables
const originalEnv = process.env;

describe('AI Providers', () => {
  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getAIProvider', () => {
    it('should use Anthropic when key is available', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
      
      const provider = getAIProvider();
      expect(provider.name).toBe('anthropic');
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should use Anthropic with sk-ant- format', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test123';
      
      const provider = getAIProvider();
      expect(provider.name).toBe('anthropic');
    });

    it('should trim whitespace from Anthropic key', () => {
      process.env.ANTHROPIC_API_KEY = '  sk-ant-api03-test123  ';
      
      const provider = getAIProvider();
      expect(provider.name).toBe('anthropic');
    });

    it('should throw error when no API key configured', () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      expect(() => getAIProvider()).toThrow('ANTHROPIC_API_KEY not configured');
    });

    it('should throw error when Anthropic key format is invalid', () => {
      process.env.ANTHROPIC_API_KEY = 'invalid-key';
      
      expect(() => getAIProvider()).toThrow(/ANTHROPIC_API_KEY.*invalid|format invalid/);
    });

    it('should throw error with empty API key', () => {
      process.env.ANTHROPIC_API_KEY = '';
      
      expect(() => getAIProvider()).toThrow('ANTHROPIC_API_KEY not configured');
    });

    it('should throw error with whitespace-only API key', () => {
      process.env.ANTHROPIC_API_KEY = '   ';
      
      expect(() => getAIProvider()).toThrow('ANTHROPIC_API_KEY not configured');
    });
  });

  describe('AnthropicProvider', () => {
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

    it('should throw error without API key', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new AnthropicProvider()).toThrow('ANTHROPIC_API_KEY not configured');
    });

    it('should throw error with invalid key format', () => {
      process.env.ANTHROPIC_API_KEY = 'invalid-key';
      expect(() => new AnthropicProvider()).toThrow('ANTHROPIC_API_KEY format invalid');
    });
  });
});

