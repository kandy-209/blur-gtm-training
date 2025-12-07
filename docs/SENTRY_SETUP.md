# 🔍 Sentry Error Tracking Setup

## Overview

Sentry is configured for comprehensive error tracking across client, server, and edge runtimes.

## Configuration Files

- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking  
- `sentry.edge.config.ts` - Edge runtime error tracking
- `src/lib/sentry.ts` - Shared Sentry utilities

## Setup

### 1. Get Sentry DSN

1. Go to [sentry.io](https://sentry.io)
2. Create a project (or use existing)
3. Copy your DSN

### 2. Add Environment Variables

Add to `.env.local` (development) or Vercel (production):

```env
# Sentry DSN (required for error tracking)
SENTRY_DSN=https://your-key@sentry.io/project-id

# OR use NEXT_PUBLIC_SENTRY_DSN for client-side
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id
```

### 3. Verify Setup

Sentry will automatically initialize when:
- `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN` is set
- App is running (not in test mode)

Check console for: `✅ Sentry initialized`

## Features

### Error Filtering

- **4xx errors**: Filtered out (client errors)
- **Known browser quirks**: ResizeObserver, NetworkError filtered
- **Production only**: Only critical errors sent in production

### Performance Monitoring

- **Traces**: 10% sample rate in production, 100% in development
- **Profiles**: Performance profiling enabled
- **Browser Tracing**: Automatic performance tracking

### Error Context

- App tag: `cursor-gtm-training`
- Environment: `development` / `production`
- Runtime tags: `server`, `edge`, `client`

## Usage

### Capture Exceptions

```typescript
import { captureException } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, { context: 'additional info' });
}
```

### Capture Messages

```typescript
import { captureMessage } from '@/lib/sentry';

captureMessage('User action completed', 'info', { userId: '123' });
```

## Monitoring

View errors and performance in:
- [Sentry Dashboard](https://sentry.io/organizations/your-org/issues/)

## Troubleshooting

**Sentry not initializing?**
- Check `SENTRY_DSN` is set
- Check console for warnings
- Verify `@sentry/nextjs` is installed: `npm list @sentry/nextjs`

**Too many errors?**
- Adjust `tracesSampleRate` in config files
- Review `beforeSend` filters
- Check error grouping in Sentry dashboard


