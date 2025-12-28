/**
 * Sentry Error Tracking
 * Production error tracking and monitoring
 */

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized || process.env.NODE_ENV === 'test') {
    return;
  }

  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Sentry DSN not configured. Error tracking disabled in production.');
    }
    return;
  }

  try {
    // Dynamic import to avoid issues if Sentry is not installed
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        debug: process.env.NODE_ENV === 'development',
        // Enhanced error filtering with user context
        beforeSend(event, hint) {
          // Add user context if available
          if (typeof window !== 'undefined') {
            try {
              const userId = localStorage.getItem('training_user_id') || 
                           localStorage.getItem('guest_user');
              if (userId) {
                event.user = {
                  id: userId,
                };
              }
            } catch {
              // Ignore localStorage errors
            }
          }
          
          // Filter out non-critical errors in production
          if (process.env.NODE_ENV === 'production') {
            // Don't send client-side errors for 4xx status codes
            if (event.request?.headers?.['x-status-code']) {
              const statusCode = parseInt(event.request.headers['x-status-code'] as string);
              if (statusCode >= 400 && statusCode < 500) {
                return null; // Don't send client errors
              }
            }
            // Filter out known non-critical errors
            if (event.exception) {
              const errorMessage = event.exception.values?.[0]?.value || '';
              if (
                errorMessage.includes('ResizeObserver') ||
                errorMessage.includes('Non-Error promise rejection') ||
                errorMessage.includes('NetworkError') ||
                errorMessage.includes('ChunkLoadError')
              ) {
                return null;
              }
            }
          }
          return event;
        },
        // Add user context when available
        initialScope: (scope) => {
          scope.setTag('app', 'blur-gtm-training');
          scope.setTag('version', process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0');
          return scope;
        },
        // Performance monitoring
        integrations: [
          // Add browser tracing for performance
          ...(typeof window !== 'undefined' ? [
            new (Sentry as any).BrowserTracing({
              tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/],
            }),
          ] : []),
        ],
      });
      
      sentryInitialized = true;
      // Use logger if available
      if (typeof require !== 'undefined') {
        try {
          const { log } = require('./logger');
          log.info('Sentry initialized');
        } catch {
          console.log('✅ Sentry initialized');
        }
      } else {
        console.log('✅ Sentry initialized');
      }
    }).catch((error) => {
      if (typeof require !== 'undefined') {
        try {
          const { log } = require('./logger');
          log.warn('Failed to initialize Sentry', { error: error.message });
        } catch {
          console.warn('Failed to initialize Sentry:', error);
        }
      } else {
        console.warn('Failed to initialize Sentry:', error);
      }
    });
  } catch (error) {
    if (typeof require !== 'undefined') {
      try {
        const { log } = require('./logger');
        log.warn('Sentry not available', { error: error instanceof Error ? error.message : String(error) });
      } catch {
        console.warn('Sentry not available:', error);
      }
    } else {
      console.warn('Sentry not available:', error);
    }
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    return;
  }

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(error, {
        extra: context,
      });
    }).catch(() => {
      // Sentry not available, ignore
    });
  } catch {
    // Sentry not available, ignore
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  if (!sentryInitialized) {
    return;
  }

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureMessage(message, {
        level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
        extra: context,
      });
    }).catch(() => {
      // Sentry not available, ignore
    });
  } catch {
    // Sentry not available, ignore
  }
}

// Initialize Sentry if DSN is configured
if (typeof window === 'undefined') {
  // Server-side initialization
  initSentry();
}

