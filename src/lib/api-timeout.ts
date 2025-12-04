/**
 * API Timeout Utilities
 * Provides timeout wrappers for external API calls
 */

export interface TimeoutOptions {
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Create a timeout signal for fetch requests
 */
export function createTimeoutSignal(timeoutMs: number = 10000): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

/**
 * Fetch with timeout wrapper
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 10000, signal, ...fetchOptions } = options;

  // Create timeout signal
  const timeoutSignal = createTimeoutSignal(timeout);

  // Combine signals if both provided
  const combinedSignal = signal
    ? (() => {
        const combined = new AbortController();
        const abort = () => combined.abort();
        signal.addEventListener('abort', abort);
        timeoutSignal.addEventListener('abort', abort);
        return combined.signal;
      })()
    : timeoutSignal;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: combinedSignal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Promise with timeout wrapper
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(errorMessage || `Operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

