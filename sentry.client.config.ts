/**
 * Sentry Client Configuration
 * Error tracking for client-side errors
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    beforeSend(event, hint) {
      // Filter out non-critical client-side errors
      if (process.env.NODE_ENV === 'production') {
        // Don't send 4xx client errors
        if (event.request?.headers?.['x-status-code']) {
          const statusCode = parseInt(event.request.headers['x-status-code'] as string);
          if (statusCode >= 400 && statusCode < 500) {
            return null;
          }
        }
        // Filter known browser quirks
        if (event.exception) {
          const errorMessage = event.exception.values?.[0]?.value || '';
          if (
            errorMessage.includes('ResizeObserver') ||
            errorMessage.includes('Non-Error promise rejection') ||
            errorMessage.includes('NetworkError')
          ) {
            return null;
          }
        }
      }
      return event;
    },
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/],
      }),
    ],
  });
}

