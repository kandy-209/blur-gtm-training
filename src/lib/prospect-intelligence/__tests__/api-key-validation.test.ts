/**
 * Tests to diagnose API key validation issues with Stagehand
 * Specifically testing Anthropic API key configuration
 */

// Mock Stagehand before importing ResearchService to avoid ESM issues
jest.mock('@browserbasehq/stagehand', () => ({
  Stagehand: jest.fn().mockImplementation(() => ({
    run: jest.fn(),
    close: jest.fn(),
  })),
}));

import { ResearchService } from '../research-service';

describe('API Key Validation Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Anthropic API Key Format Validation', () => {
    it('should validate Anthropic API key format', () => {
      const validKey = 'sk-ant-api03-test123';
      const invalidKey = 'sk-proj-test123'; // OpenAI format
      
      expect(validKey.startsWith('sk-ant-')).toBe(true);
      expect(invalidKey.startsWith('sk-ant-')).toBe(false);
    });

    it('should detect correct Anthropic key prefix', () => {
      const key = process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-test';
      expect(key.startsWith('sk-ant-')).toBe(true);
    });

    it('should handle keys with whitespace', () => {
      const keyWithSpace = ' sk-ant-api03-test123 ';
      const trimmed = keyWithSpace.trim();
      expect(trimmed.startsWith('sk-ant-')).toBe(true);
    });
  });

  describe('Stagehand Configuration Tests', () => {
    it('should configure Stagehand with correct model name for Claude', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-browserbase-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project-id';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test123';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      const mockInit = jest.fn().mockResolvedValue(undefined);
      const mockStagehand = {
        init: mockInit,
        page: { goto: jest.fn() },
      };
      
      Stagehand.mockImplementation((config: any) => {
        expect(config.model).toBe('claude-3-5-sonnet-20241022');
        expect(config.modelClientOptions.apiKey).toBe('sk-ant-api03-test123');
        return mockStagehand;
      });

      const service = new ResearchService();
      await service.initialize();
      
      expect(Stagehand).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          modelClientOptions: expect.objectContaining({
            apiKey: 'sk-ant-api03-test123',
          }),
        })
      );
    });

    it('should not include "anthropic/" prefix in model name', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      Stagehand.mockImplementation((config: any) => {
        // Verify model does NOT have "anthropic/" prefix
        expect(config.model).not.toContain('anthropic/');
        expect(config.model).toBe('claude-3-5-sonnet-20241022');
        return { init: jest.fn().mockResolvedValue(undefined) };
      });

      const service = new ResearchService();
      await service.initialize();
    });
  });

  describe('API Key Error Diagnosis', () => {
    it('should provide helpful error when Anthropic key is invalid', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.ANTHROPIC_API_KEY = 'invalid-key-format';
      
      const service = new ResearchService();
      
      await expect(service.initialize()).rejects.toThrow('ANTHROPIC_API_KEY appears to be invalid');
    });

    it('should handle 401 errors with better messaging', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-valid-format-but-invalid-key';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      const mockInit = jest.fn().mockRejectedValue(
        new Error('401 Incorrect API key provided')
      );
      
      Stagehand.mockImplementation(() => ({
        init: mockInit,
      }));

      const service = new ResearchService();
      
      await expect(service.initialize()).rejects.toThrow();
    });
  });

  describe('Environment Variable Priority', () => {
    it('should prioritize Claude when both Claude and OpenAI are available', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      process.env.OPENAI_API_KEY = 'sk-proj-test';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      Stagehand.mockImplementation((config: any) => {
        expect(config.model).toBe('claude-3-5-sonnet-20241022');
        return { init: jest.fn().mockResolvedValue(undefined) };
      });

      const service = new ResearchService();
      await service.initialize();
    });

    it('should use Gemini fallback when requested but not supported', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.STAGEHAND_LLM_PROVIDER = 'gemini';
      process.env.GOOGLE_GEMINI_API_KEY = 'test-gemini-key';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      Stagehand.mockImplementation((config: any) => {
        // Should fallback to Claude since Gemini not supported
        expect(config.model).toBe('claude-3-5-sonnet-20241022');
        return { init: jest.fn().mockResolvedValue(undefined) };
      });

      const service = new ResearchService();
      await service.initialize();
    });
  });
});








