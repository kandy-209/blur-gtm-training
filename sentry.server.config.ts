/**
 * Sentry Server Configuration
 * Error tracking for server-side errors
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    beforeSend(event, hint) {
      // Filter out non-critical server errors
      if (process.env.NODE_ENV === 'production') {
        // Don't send 4xx errors
        if (event.request?.headers?.['x-status-code']) {
          const statusCode = parseInt(event.request.headers['x-status-code'] as string);
          if (statusCode >= 400 && statusCode < 500) {
            return null;
          }
        }
      }
      return event;
    },
    initialScope: (scope) => {
      scope.setTag('app', 'cursor-gtm-training');
      scope.setTag('component', 'server');
      return scope;
    },
  });
}

