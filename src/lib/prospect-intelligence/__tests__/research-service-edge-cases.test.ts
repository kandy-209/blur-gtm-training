/**
 * Edge case tests for ResearchService
 * Tests error handling, missing data, timeouts, and API failures
 */

import { ResearchService } from '../research-service';
import type { Stagehand } from '@browserbasehq/stagehand';

// Mock dependencies
jest.mock('@browserbasehq/stagehand');
jest.mock('../utils', () => ({
  withRetry: jest.fn((fn) => fn()),
  safeNavigateWithObservation: jest.fn().mockResolvedValue(true),
  handlePageBlockers: jest.fn(),
  waitForPageReady: jest.fn().mockResolvedValue(true),
}));

describe('ResearchService Edge Cases', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Initialization Edge Cases', () => {
    it('should throw if BROWSERBASE_API_KEY is missing', async () => {
      delete process.env.BROWSERBASE_API_KEY;
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.ANTHROPIC_API_KEY = 'test-key';
      
      const service = new ResearchService();
      await expect(service.initialize()).rejects.toThrow('BROWSERBASE_API_KEY');
    });

    it('should throw if BROWSERBASE_PROJECT_ID is missing', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      delete process.env.BROWSERBASE_PROJECT_ID;
      process.env.ANTHROPIC_API_KEY = 'test-key';
      
      const service = new ResearchService();
      await expect(service.initialize()).rejects.toThrow('BROWSERBASE_PROJECT_ID');
    });

    it('should throw if no LLM API key is provided', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      const service = new ResearchService();
      await expect(service.initialize()).rejects.toThrow('LLM API key');
    });

    it('should prioritize Claude when multiple keys are available', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      process.env.OPENAI_API_KEY = 'sk-test';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      const mockInit = jest.fn().mockResolvedValue(undefined);
      Stagehand.mockImplementation(() => ({
        init: mockInit,
        page: { goto: jest.fn() },
      }));
      
      const service = new ResearchService();
      await service.initialize();
      
      expect(Stagehand).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
        })
      );
    });

    it('should use OpenAI as fallback when Claude is not available', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      delete process.env.ANTHROPIC_API_KEY;
      process.env.OPENAI_API_KEY = 'sk-test';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      const mockInit = jest.fn().mockResolvedValue(undefined);
      Stagehand.mockImplementation(() => ({
        init: mockInit,
        page: { goto: jest.fn() },
      }));
      
      const service = new ResearchService();
      await service.initialize();
      
      expect(Stagehand).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
        })
      );
    });

    it('should respect STAGEHAND_LLM_PROVIDER environment variable', async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.STAGEHAND_LLM_PROVIDER = 'openai';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      process.env.OPENAI_API_KEY = 'sk-test';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      const mockInit = jest.fn().mockResolvedValue(undefined);
      Stagehand.mockImplementation(() => ({
        init: mockInit,
        page: { goto: jest.fn() },
      }));
      
      const service = new ResearchService();
      await service.initialize();
      
      expect(Stagehand).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
        })
      );
    });
  });

  describe('Research Edge Cases', () => {
    let service: ResearchService;
    let mockStagehand: any;

    beforeEach(async () => {
      process.env.BROWSERBASE_API_KEY = 'test-key';
      process.env.BROWSERBASE_PROJECT_ID = 'test-project';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      
      const Stagehand = require('@browserbasehq/stagehand').Stagehand;
      mockStagehand = {
        init: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        page: {
          goto: jest.fn().mockResolvedValue(undefined),
          content: jest.fn().mockResolvedValue('<html></html>'),
          evaluate: jest.fn().mockResolvedValue([]),
          act: jest.fn().mockResolvedValue(undefined),
        },
        extract: jest.fn(),
      };
      
      Stagehand.mockImplementation(() => mockStagehand);
      
      service = new ResearchService();
      await service.initialize();
    });

    it('should handle invalid URLs', async () => {
      await expect(service.researchProspect('not-a-url')).rejects.toThrow();
    });

    it('should handle empty website URL', async () => {
      await expect(service.researchProspect('')).rejects.toThrow();
    });

    it('should handle navigation failures', async () => {
      const { safeNavigateWithObservation } = require('../utils');
      safeNavigateWithObservation.mockRejectedValue(new Error('Navigation failed'));
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow();
    });

    it('should handle extraction failures gracefully', async () => {
      mockStagehand.extract.mockRejectedValue(new Error('Extraction failed'));
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockStagehand.extract.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow();
    });

    it('should handle missing company information', async () => {
      mockStagehand.extract.mockResolvedValue({
        companyName: '',
        description: '',
        industry: '',
        isB2BSaaS: false,
        sizeIndicators: [],
        growthIndicators: [],
      });
      
      // Should still complete but with minimal data
      await expect(service.researchProspect('https://example.com')).resolves.toBeDefined();
    });

    it('should handle API quota errors', async () => {
      mockStagehand.extract.mockRejectedValue(new Error('429 You exceeded your current quota'));
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow('quota');
    });

    it('should handle authentication errors', async () => {
      mockStagehand.extract.mockRejectedValue(new Error('401 Incorrect API key provided'));
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow('API key');
    });

    it('should handle network errors', async () => {
      mockStagehand.extract.mockRejectedValue(new Error('Network request failed'));
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow();
    });

    it('should handle malformed extraction responses', async () => {
      mockStagehand.extract.mockResolvedValue(null);
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow();
    });

    it('should handle websites that block automated access', async () => {
      const { safeNavigateWithObservation } = require('../utils');
      safeNavigateWithObservation.mockResolvedValue(false);
      
      await expect(service.researchProspect('https://example.com')).rejects.toThrow();
    });

    it('should handle slow-loading websites', async () => {
      const { waitForPageReady } = require('../utils');
      waitForPageReady.mockResolvedValue(false); // Page never becomes ready
      
      // Should still attempt extraction
      mockStagehand.extract.mockResolvedValue({
        companyName: 'Test Company',
        description: 'Test',
        industry: 'Tech',
        isB2BSaaS: true,
        sizeIndicators: [],
        growthIndicators: [],
      });
      
      await expect(service.researchProspect('https://example.com')).resolves.toBeDefined();
    });

    it('should handle missing careers page', async () => {
      const { safeNavigateWithObservation } = require('../utils');
      safeNavigateWithObservation
        .mockResolvedValueOnce(true)  // Main page
        .mockResolvedValueOnce(false) // Careers page not found
        .mockResolvedValueOnce(false) // Blog not found
        .mockResolvedValueOnce(true); // About page
      
      mockStagehand.extract
        .mockResolvedValueOnce({
          companyName: 'Test',
          description: 'Test',
          industry: 'Tech',
          isB2BSaaS: true,
          sizeIndicators: [],
          growthIndicators: [],
        })
        .mockResolvedValueOnce({
          developmentPractices: [],
          techCultureHighlights: [],
        });
      
      const result = await service.researchProspect('https://example.com');
      expect(result.hiring.hasOpenEngineeringRoles).toBe(false);
    });

    it('should handle cleanup errors gracefully', async () => {
      mockStagehand.close.mockRejectedValue(new Error('Cleanup failed'));
      
      // Should not throw during research
      await expect(service.researchProspect('https://example.com')).resolves.toBeDefined();
    });

    it('should handle concurrent research requests', async () => {
      mockStagehand.extract.mockResolvedValue({
        companyName: 'Test',
        description: 'Test',
        industry: 'Tech',
        isB2BSaaS: true,
        sizeIndicators: [],
        growthIndicators: [],
      });
      
      const promises = [
        service.researchProspect('https://example1.com'),
        service.researchProspect('https://example2.com'),
      ];
      
      await expect(Promise.all(promises)).resolves.toHaveLength(2);
    });
  });

  describe('ICP Score Calculation Edge Cases', () => {
    it('should handle missing tech stack data', async () => {
      // This would be tested through the full research flow
      // with minimal data to ensure ICP scoring doesn't crash
    });

    it('should handle negative ICP scores', async () => {
      // Ensure scores are clamped to 1-10 range
    });

    it('should handle companies with no hiring data', async () => {
      // Should still calculate ICP score
    });
  });
});








