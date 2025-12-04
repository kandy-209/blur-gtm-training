/**
 * Sentry Edge Configuration
 * Error tracking for Edge runtime errors
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    initialScope: (scope) => {
      scope.setTag('app', 'cursor-gtm-training');
      scope.setTag('runtime', 'edge');
      return scope;
    },
  });
}

