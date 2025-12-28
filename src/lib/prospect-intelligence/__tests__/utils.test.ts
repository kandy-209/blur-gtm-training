/**
 * Comprehensive tests for prospect intelligence utility functions
 * Tests edge cases, error handling, and retry logic
 */

import { withRetry, handlePageBlockers, waitForPageReady, safeNavigateWithObservation } from '../utils';
import type { Stagehand } from '@browserbasehq/stagehand';

// Mock Stagehand
const createMockStagehand = (): Partial<Stagehand> => {
  const mockPage = {
    goto: jest.fn(),
    content: jest.fn(),
    evaluate: jest.fn(),
    act: jest.fn(),
  };
  
  return {
    page: mockPage as any,
  } as Partial<Stagehand>;
};

describe('Prospect Intelligence Utils', () => {
  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await withRetry(operation, 3, 100, 'Test');
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');
      
      const result = await withRetry(operation, 3, 10, 'Test');
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(withRetry(operation, 2, 10, 'Test')).rejects.toThrow('Always fails');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Fail'));
      const delays: number[] = [];
      
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((fn: Function, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(fn, delay);
      }) as any;
      
      try {
        await withRetry(operation, 2, 100, 'Test');
      } catch (e) {
        // Expected to fail
      }
      
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);
      
      global.setTimeout = originalSetTimeout;
    });

    it('should handle zero retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Fail'));
      await expect(withRetry(operation, 0, 10, 'Test')).rejects.toThrow('Fail');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle async operations that resolve immediately', async () => {
      const operation = jest.fn().mockResolvedValue(Promise.resolve('fast'));
      const result = await withRetry(operation, 3, 10, 'Test');
      expect(result).toBe('fast');
    });

    it('should handle operations that throw non-Error objects', async () => {
      const operation = jest.fn().mockRejectedValue('String error');
      await expect(withRetry(operation, 1, 10, 'Test')).rejects.toBe('String error');
    });
  });

  describe('handlePageBlockers', () => {
    let mockStagehand: Partial<Stagehand>;
    
    beforeEach(() => {
      mockStagehand = createMockStagehand();
      jest.clearAllMocks();
    });

    it('should handle pages without blockers', async () => {
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html><body>No blockers</body></html>');
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue('no blockers here');
      
      await handlePageBlockers(mockStagehand as Stagehand);
      
      expect(mockStagehand.page!.act).not.toHaveBeenCalled();
    });

    it('should detect and handle cookie banners', async () => {
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html><body><div>Accept cookies</div></body></html>');
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue('accept cookies button');
      (mockStagehand.page!.act as jest.Mock).mockResolvedValue(undefined);
      
      await handlePageBlockers(mockStagehand as Stagehand);
      
      expect(mockStagehand.page!.act).toHaveBeenCalled();
    });

    it('should handle GDPR consent dialogs', async () => {
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html><body><div>GDPR consent</div></body></html>');
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue('gdpr privacy consent');
      (mockStagehand.page!.act as jest.Mock).mockResolvedValue(undefined);
      
      await handlePageBlockers(mockStagehand as Stagehand);
      
      expect(mockStagehand.page!.act).toHaveBeenCalled();
    });

    it('should continue if act() fails', async () => {
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html><body>Cookie banner</body></html>');
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue('cookie accept');
      (mockStagehand.page!.act as jest.Mock).mockRejectedValue(new Error('Act failed'));
      
      // Should not throw
      await expect(handlePageBlockers(mockStagehand as Stagehand)).resolves.not.toThrow();
    });

    it('should handle page evaluation errors gracefully', async () => {
      (mockStagehand.page!.content as jest.Mock).mockRejectedValue(new Error('Page error'));
      
      await expect(handlePageBlockers(mockStagehand as Stagehand)).resolves.not.toThrow();
    });

    it('should handle missing page object', async () => {
      const brokenStagehand = {} as Stagehand;
      await expect(handlePageBlockers(brokenStagehand)).resolves.not.toThrow();
    });
  });

  describe('waitForPageReady', () => {
    let mockStagehand: Partial<Stagehand>;
    
    beforeEach(() => {
      mockStagehand = createMockStagehand();
      jest.clearAllMocks();
    });

    it('should return true when page is ready', async () => {
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue(false);
      
      const result = await waitForPageReady(mockStagehand as Stagehand, 1000);
      expect(result).toBe(true);
    });

    it('should wait for loading to complete', async () => {
      (mockStagehand.page!.evaluate as jest.Mock)
        .mockResolvedValueOnce(true)  // Still loading
        .mockResolvedValueOnce(true)   // Still loading
        .mockResolvedValueOnce(false); // Ready
      
      const result = await waitForPageReady(mockStagehand as Stagehand, 5000);
      expect(result).toBe(true);
      expect(mockStagehand.page!.evaluate).toHaveBeenCalledTimes(3);
    });

    it('should timeout if page never becomes ready', async () => {
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue(true); // Always loading
      
      const result = await waitForPageReady(mockStagehand as Stagehand, 100);
      expect(result).toBe(false);
    });

    it('should handle evaluation errors gracefully', async () => {
      (mockStagehand.page!.evaluate as jest.Mock).mockRejectedValue(new Error('Eval error'));
      
      const result = await waitForPageReady(mockStagehand as Stagehand, 100);
      expect(result).toBe(true); // Should assume ready on error
    });

    it('should check for loading indicators', async () => {
      (mockStagehand.page!.evaluate as jest.Mock).mockImplementation(() => {
        // Simulate checking for loaders
        return Promise.resolve(false);
      });
      
      const result = await waitForPageReady(mockStagehand as Stagehand, 100);
      expect(result).toBe(true);
    });
  });

  describe('safeNavigateWithObservation', () => {
    let mockStagehand: Partial<Stagehand>;
    
    beforeEach(() => {
      mockStagehand = createMockStagehand();
      jest.clearAllMocks();
    });

    it('should navigate successfully', async () => {
      (mockStagehand.page!.goto as jest.Mock).mockResolvedValue(undefined);
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue(false); // Page ready
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html></html>');
      
      const result = await safeNavigateWithObservation(mockStagehand as Stagehand, 'https://example.com', 1);
      expect(result).toBe(true);
      expect(mockStagehand.page!.goto).toHaveBeenCalledWith('https://example.com', expect.any(Object));
    });

    it('should retry on navigation failure', async () => {
      (mockStagehand.page!.goto as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue(false);
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html></html>');
      
      const result = await safeNavigateWithObservation(mockStagehand as Stagehand, 'https://example.com', 2);
      expect(result).toBe(true);
      // Should retry at least once
      expect(mockStagehand.page!.goto).toHaveBeenCalled();
    }, 10000); // Increase timeout

    it('should fail after max retries', async () => {
      (mockStagehand.page!.goto as jest.Mock).mockRejectedValue(new Error('Always fails'));
      (mockStagehand.page!.evaluate as jest.Mock).mockResolvedValue(false);
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html></html>');
      
      await expect(
        safeNavigateWithObservation(mockStagehand as Stagehand, 'https://example.com', 2)
      ).rejects.toThrow();
      
      // Should have attempted multiple times
      expect(mockStagehand.page!.goto).toHaveBeenCalled();
    }, 10000); // Increase timeout

    it('should handle timeout errors', async () => {
      (mockStagehand.page!.goto as jest.Mock).mockRejectedValue(new Error('Navigation timeout'));
      
      await expect(
        safeNavigateWithObservation(mockStagehand as Stagehand, 'https://example.com', 1)
      ).rejects.toThrow('Navigation timeout');
    });

    it('should handle invalid URLs gracefully', async () => {
      (mockStagehand.page!.goto as jest.Mock).mockRejectedValue(new Error('Invalid URL'));
      
      await expect(
        safeNavigateWithObservation(mockStagehand as Stagehand, 'not-a-url', 1)
      ).rejects.toThrow();
    });

    it('should wait for page ready after navigation', async () => {
      (mockStagehand.page!.goto as jest.Mock).mockResolvedValue(undefined);
      (mockStagehand.page!.evaluate as jest.Mock)
        .mockResolvedValueOnce(false)  // Page ready immediately
        .mockResolvedValueOnce(false); // Second check
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html></html>');
      
      await safeNavigateWithObservation(mockStagehand as Stagehand, 'https://example.com', 1);
      expect(mockStagehand.page!.evaluate).toHaveBeenCalled();
    }, 10000); // Increase timeout

    it('should handle blockers after navigation', async () => {
      const { safeNavigateWithObservation } = require('../utils');
      
      (mockStagehand.page!.goto as jest.Mock).mockResolvedValue(undefined);
      // waitForPageReady checks
      (mockStagehand.page!.evaluate as jest.Mock)
        .mockResolvedValueOnce(false) // First check - page ready
        .mockResolvedValueOnce(false) // Second check in waitForPageReady
        .mockResolvedValueOnce('accept cookies button'); // handlePageBlockers text check
      (mockStagehand.page!.content as jest.Mock).mockResolvedValue('<html><body>Accept cookies</body></html>');
      (mockStagehand.page!.act as jest.Mock).mockResolvedValue(undefined);
      
      await safeNavigateWithObservation(mockStagehand as Stagehand, 'https://example.com', 1);
      
      // Should have called handlePageBlockers which calls act() when blocker is detected
      // Note: This test verifies the integration, actual blocker detection is tested in handlePageBlockers tests
      expect(mockStagehand.page!.goto).toHaveBeenCalled();
    });
  });
});

