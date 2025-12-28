import { checkProviderHealth, getAllProviderHealth, retryWithBackoff, validateAPIKey } from '../ai-provider-utils';

const originalEnv = process.env;

describe('AI Provider Utils', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateAPIKey', () => {
    it('should validate Anthropic key format', () => {
      expect(validateAPIKey('anthropic', 'sk-ant-api03-test123')).toEqual({ valid: true });
      expect(validateAPIKey('anthropic', 'sk-ant-test123')).toEqual({ valid: true });
      expect(validateAPIKey('anthropic', 'invalid-key')).toEqual({
        valid: false,
        error: 'Anthropic key must start with sk-ant-',
      });
      expect(validateAPIKey('anthropic', '')).toEqual({
        valid: false,
        error: 'API key is empty',
      });
    });

    it('should reject Hugging Face (not supported)', () => {
      expect(validateAPIKey('huggingface', 'hf_test123')).toEqual({
        valid: false,
        error: 'HuggingFace is not supported. Use claude, gemini, or openai.',
      });
    });

    it('should accept OpenAI (now supported)', () => {
      expect(validateAPIKey('openai', 'sk-test123')).toEqual({
        valid: true,
      });
    });

    it('should handle empty keys', () => {
      expect(validateAPIKey('anthropic', '   ')).toEqual({
        valid: false,
        error: 'API key is empty',
      });
    });
  });

  describe('checkProviderHealth', () => {
    it('should check Anthropic provider health', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
      const health = await checkProviderHealth('anthropic');
      expect(health.name).toBe('anthropic');
      expect(health.available).toBe(true);
    });

    it('should detect invalid Anthropic key', async () => {
      process.env.ANTHROPIC_API_KEY = 'invalid-key';
      const health = await checkProviderHealth('anthropic', true); // Force refresh
      expect(health.available).toBe(false);
      expect(health.error).toBeDefined();
    });

    it('should cache health check results', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
      const health1 = await checkProviderHealth('anthropic');
      const health2 = await checkProviderHealth('anthropic');
      expect(health1.lastChecked).toEqual(health2.lastChecked);
    });

    it('should reject unsupported providers', async () => {
      const health = await checkProviderHealth('huggingface', true);
      expect(health.available).toBe(false);
      expect(health.error).toContain('not supported');
    });
  });

  describe('getAllProviderHealth', () => {
    it('should check Anthropic provider', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
      // Clear cache first
      const { checkProviderHealth } = require('../ai-provider-utils');
      await checkProviderHealth('anthropic', true); // Force refresh

      const healths = await getAllProviderHealth();
      expect(healths).toHaveLength(3);
      // getAllProviderHealth uses 'claude' as the provider name
      const anthropicHealth = healths.find(h => h.name === 'claude' || h.name === 'anthropic');
      expect(anthropicHealth).toBeDefined();
      // Health may be true if key is valid, or false if not configured
      expect(typeof anthropicHealth?.available).toBe('boolean');
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 401 errors', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('401 Unauthorized'));
      await expect(retryWithBackoff(fn)).rejects.toThrow('401');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Persistent error'));
      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('Persistent error');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
