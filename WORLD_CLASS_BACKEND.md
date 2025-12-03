# World-Class Backend Infrastructure

## ✅ Implemented Features

### 1. **Structured Logging** (`src/lib/logger.ts`)
- ✅ Winston-based logging with JSON output in production
- ✅ Readable format in development
- ✅ Log levels: error, warn, info, debug
- ✅ Request ID tracking for tracing
- ✅ Performance logging helpers
- ✅ Security event logging

**Usage:**
```typescript
import { log } from '@/lib/logger';

log.info('User logged in', { userId: '123' });
log.error('API error', error, { requestId });
log.performance('database_query', 150, { query: 'SELECT *' });
log.security('rate_limit_exceeded', { ip, endpoint });
```

### 2. **Prometheus Metrics** (`src/lib/metrics.ts`)
- ✅ HTTP request metrics (duration, count, errors)
- ✅ API call metrics
- ✅ Business metrics (roleplay scenarios, turns, feedback)
- ✅ System metrics (active connections, cache hits/misses)
- ✅ Rate limiting metrics
- ✅ Error metrics

**Endpoints:**
- `/api/metrics` - Prometheus metrics endpoint
- `/api/v1/metrics` - Versioned metrics endpoint

**Usage:**
```typescript
import { recordHttpRequest, recordApiCall, roleplayTurnsTotal } from '@/lib/metrics';

recordHttpRequest('POST', '/api/roleplay', 200, 0.5);
recordApiCall('openai', 'chat', 'success', 1.2);
roleplayTurnsTotal.inc({ scenario_id: 'scenario_1', evaluation: 'PASS' });
```

### 3. **Health Checks**
- ✅ `/api/health` - Comprehensive health check
- ✅ `/api/ready` - Kubernetes readiness probe
- ✅ Database connectivity check
- ✅ Redis connectivity check
- ✅ External API dependency checks

**Response Format:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": "ok",
    "redis": "ok",
    "external_apis": "ok"
  }
}
```

### 4. **Redis Distributed Caching** (`src/lib/redis.ts`)
- ✅ Redis client with automatic fallback to in-memory store
- ✅ Distributed caching with TTL support
- ✅ Distributed rate limiting
- ✅ Connection pooling and retry logic
- ✅ Graceful degradation if Redis unavailable

**Environment Variables:**
```bash
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

**Usage:**
```typescript
import { cacheGet, cacheSet, distributedRateLimit } from '@/lib/redis';

// Caching
await cacheSet('user:123', userData, { ttl: 3600 });
const user = await cacheGet<User>('user:123');

// Rate limiting
const result = await distributedRateLimit('ip:192.168.1.1', 10, 60000);
```

### 5. **Centralized Error Handling** (`src/lib/error-handler.ts`)
- ✅ Consistent error responses
- ✅ Domain error handling (EntityNotFound, InvalidValue, etc.)
- ✅ Validation error handling (Zod)
- ✅ HTTP error handling
- ✅ Request ID tracking
- ✅ Error metrics recording
- ✅ Error handler wrapper for routes

**Usage:**
```typescript
import { handleError, withErrorHandler, AppError, ErrorType } from '@/lib/error-handler';

// Wrap route handler
export const POST = withErrorHandler(async function POST(request: NextRequest) {
  // Your code here
  throw new AppError('Not found', ErrorType.NOT_FOUND, 404);
});

// Manual error handling
try {
  // ...
} catch (error) {
  return handleError(error, requestId);
}
```

### 6. **Sentry Error Tracking** (`src/lib/sentry.ts`)
- ✅ Production error tracking
- ✅ Error filtering (don't send 4xx errors)
- ✅ Environment-aware configuration
- ✅ Automatic exception capture

**Environment Variables:**
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Usage:**
```typescript
import { captureException, captureMessage } from '@/lib/sentry';

captureException(error, { userId: '123' });
captureMessage('Something happened', 'warning', { context });
```

### 7. **API Versioning**
- ✅ `/api/v1/health` - Versioned health endpoint
- ✅ `/api/v1/metrics` - Versioned metrics endpoint
- ✅ Foundation for future API versioning

### 8. **Enhanced Middleware** (`src/middleware.ts`)
- ✅ Request ID generation and tracking
- ✅ Distributed rate limiting (Redis fallback)
- ✅ HTTP request logging
- ✅ Metrics recording
- ✅ Security audit logging

## 📋 Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Redis (optional - falls back to in-memory)
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Sentry (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Database (for health checks)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚀 Migration Guide

### Replacing `console.log` with Structured Logging

**Before:**
```typescript
console.log('User logged in', userId);
console.error('API error:', error);
```

**After:**
```typescript
import { log } from '@/lib/logger';

log.info('User logged in', { userId });
log.error('API error', error, { requestId });
```

### Adding Error Handling to Routes

**Before:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // ...
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
import { withErrorHandler } from '@/lib/error-handler';

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  // Your code - errors automatically handled
});
```

### Adding Metrics to Routes

**Before:**
```typescript
export async function POST(request: NextRequest) {
  // No metrics
}
```

**After:**
```typescript
import { recordApiCall } from '@/lib/metrics';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Your code
    const duration = Date.now() - startTime;
    recordApiCall('my_api', 'endpoint', 'success', duration / 1000);
  } catch (error) {
    const duration = Date.now() - startTime;
    recordApiCall('my_api', 'endpoint', 'error', duration / 1000);
    throw error;
  }
}
```

## 📊 Monitoring

### Health Checks
```bash
# Health check
curl http://localhost:3000/api/health

# Readiness check (for Kubernetes)
curl http://localhost:3000/api/ready
```

### Metrics
```bash
# Prometheus metrics
curl http://localhost:3000/api/metrics
```

### Logs
Logs are written to:
- **Development**: Console (readable format)
- **Production**: `logs/error.log` and `logs/combined.log` (JSON format)

## 🔄 Next Steps

### Remaining Tasks:
1. [ ] Migrate all routes to use structured logging
2. [ ] Add metrics to all API routes
3. [ ] Set up Redis in production
4. [ ] Configure Sentry DSN
5. [ ] Set up Prometheus scraping
6. [ ] Add distributed tracing (OpenTelemetry)
7. [ ] Implement background job queue (BullMQ)
8. [ ] Migrate in-memory data to database

## 📚 Documentation

- [Winston Logging](https://github.com/winstonjs/winston)
- [Prometheus Client](https://github.com/siimon/prom-client)
- [Redis (ioredis)](https://github.com/redis/ioredis)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [BullMQ](https://docs.bullmq.io/)

