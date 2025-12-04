import { retryWithBackoff, isRetryableError } from '../error-recovery';

describe('error-recovery', () => {
  describe('retryWithBackoff', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return success on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn);

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn, {
        maxRetries: 3,
        retryDelay: 100,
      });

      // Fast-forward timers
      jest.advanceTimersByTime(100);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn, {
        maxRetries: 3,
        retryDelay: 100,
        backoffMultiplier: 2,
      });

      // First retry after 100ms
      jest.advanceTimersByTime(100);
      // Second retry after 200ms (100 * 2)
      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
    });

    it('should stop retrying if shouldRetry returns false', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('400 Bad Request'));

      const promise = retryWithBackoff(fn, {
        maxRetries: 3,
        retryDelay: 100,
        shouldRetry: (error) => !error.message.includes('400'),
      });

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('400');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback on each retry', async () => {
      const onRetry = jest.fn();
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn, {
        maxRetries: 3,
        retryDelay: 100,
        onRetry,
      });

      jest.advanceTimersByTime(200);

      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(1);
      expect(onRetry).toHaveBeenCalledWith(2);
    });

    it('should fail after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Persistent error'));

      const promise = retryWithBackoff(fn, {
        maxRetries: 2,
        retryDelay: 100,
      });

      jest.advanceTimersByTime(300);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Persistent error');
      expect(result.attempts).toBe(3); // Initial + 2 retries
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should respect maxRetries limit', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Error'));

      const promise = retryWithBackoff(fn, {
        maxRetries: 1,
        retryDelay: 100,
      });

      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2); // Initial + 1 retry
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const error = new Error('Network error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = new Error('Request timeout');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for 5xx server errors', () => {
      expect(isRetryableError(new Error('500 Internal Server Error'))).toBe(true);
      expect(isRetryableError(new Error('502 Bad Gateway'))).toBe(true);
      expect(isRetryableError(new Error('503 Service Unavailable'))).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      expect(isRetryableError(new Error('429 Too Many Requests'))).toBe(true);
      expect(isRetryableError(new Error('Rate limit exceeded'))).toBe(true);
    });

    it('should return false for 4xx client errors', () => {
      expect(isRetryableError(new Error('400 Bad Request'))).toBe(false);
      expect(isRetryableError(new Error('401 Unauthorized'))).toBe(false);
      expect(isRetryableError(new Error('403 Forbidden'))).toBe(false);
      expect(isRetryableError(new Error('404 Not Found'))).toBe(false);
    });

    it('should return false for unknown errors', () => {
      const error = new Error('Unknown error');
      expect(isRetryableError(error)).toBe(false);
    });
  });
});




