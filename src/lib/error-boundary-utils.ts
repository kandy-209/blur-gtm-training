/**
 * Error Boundary Utilities
 * Advanced error handling and reporting
 */

export interface ErrorInfo {
  error: Error;
  errorInfo: {
    componentStack: string;
    errorBoundary?: string;
  };
  context?: Record<string, any>;
}

/**
 * Log error to analytics and error tracking
 */
export function logError(errorInfo: ErrorInfo): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary:', errorInfo);
  }
  
  // Send to error tracking service (e.g., Sentry)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(errorInfo.error, {
      contexts: {
        react: {
          componentStack: errorInfo.errorInfo.componentStack,
        },
        ...errorInfo.context,
      },
      tags: {
        errorBoundary: errorInfo.errorInfo.errorBoundary || 'unknown',
      },
    });
  }
  
  // Track in analytics
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: errorInfo.error.message,
        stack: errorInfo.error.stack,
        componentStack: errorInfo.errorInfo.componentStack,
        errorBoundary: errorInfo.errorInfo.errorBoundary,
        context: errorInfo.context,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Silently fail if analytics endpoint is not available
    });
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: Error): string {
  const errorMessages: Record<string, string> = {
    'NetworkError': 'Network connection failed. Please check your internet connection.',
    'TimeoutError': 'Request timed out. Please try again.',
    'ChunkLoadError': 'Failed to load page resources. Please refresh the page.',
    'TypeError': 'An unexpected error occurred. Please try again.',
  };
  
  for (const [errorType, message] of Object.entries(errorMessages)) {
    if (error.name.includes(errorType) || error.message.includes(errorType)) {
      return message;
    }
  }
  
  return 'An unexpected error occurred. Please refresh the page or contact support.';
}

