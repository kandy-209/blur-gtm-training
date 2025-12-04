# How to Use Your World-Class Backend Infrastructure

## 🚀 Quick Start

### 1. **Access Health & Status**

Open in your browser or use curl:

```bash
# Health check (comprehensive)
curl http://localhost:3000/api/health

# Readiness check (for Kubernetes/Docker)
curl http://localhost:3000/api/ready

# Prometheus metrics
curl http://localhost:3000/api/metrics
```

**Browser URLs:**
- Health: http://localhost:3000/api/health
- Metrics: http://localhost:3000/api/metrics
- Ready: http://localhost:3000/api/ready

### 2. **View Structured Logs**

Check your terminal/console where `npm run dev` is running. You'll see:
- Request IDs for every request
- Structured JSON logs (in production)
- Readable format (in development)
- Performance metrics
- Security events

### 3. **Use Centralized Error Handling**

All API routes now automatically:
- Generate request IDs
- Track errors
- Return consistent error format
- Log to Sentry (if configured)

**Example error response:**
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_1234567890_abc123"
}
```

## 📊 Monitoring & Metrics

### View Metrics

```bash
# Get all Prometheus metrics
curl http://localhost:3000/api/metrics

# Metrics include:
# - HTTP request duration
# - HTTP request counts
# - API call metrics
# - Business metrics (roleplay scenarios, turns)
# - System metrics (CPU, memory)
```

### Set Up Prometheus (Optional)

1. **Install Prometheus:**
```bash
brew install prometheus  # macOS
# or download from https://prometheus.io/download/
```

2. **Configure Prometheus** (`prometheus.yml`):
```yaml
scrape_configs:
  - job_name: 'cursor-training'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

3. **Start Prometheus:**
```bash
prometheus --config.file=prometheus.yml
```

4. **View in Grafana:**
   - Install Grafana
   - Add Prometheus as data source
   - Create dashboards

## 🔧 Configuration

### Optional: Redis (Distributed Caching)

**Why:** Enables distributed rate limiting and caching across multiple server instances.

**Setup:**

1. **Install Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

2. **Add to `.env.local`:**
```bash
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password  # if needed
```

3. **Restart dev server:**
```bash
npm run dev
```

**Benefits:**
- Rate limiting works across multiple instances
- Shared cache across servers
- Better performance for high-traffic scenarios

### Optional: Sentry (Error Tracking)

**Why:** Track and debug production errors automatically.

**Setup:**

1. **Create Sentry account:**
   - Go to https://sentry.io
   - Create a project
   - Get your DSN

2. **Add to `.env.local`:**
```bash
SENTRY_DSN=https://your-key@sentry.io/project-id
```

3. **Restart dev server:**
```bash
npm run dev
```

**Benefits:**
- Automatic error tracking
- Error grouping and alerts
- Stack traces with context
- Performance monitoring

## 🎯 Using Background Jobs

### Add a Job to Queue

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "jobType": "process_analytics",
    "data": {
      "userId": "user123",
      "eventType": "scenario_start",
      "data": {
        "scenarioId": "scenario_1"
      }
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "jobId": "1",
  "jobType": "process_analytics"
}
```

### Check Job Status

```bash
curl http://localhost:3000/api/jobs/status/process_analytics/1
```

**Response:**
```json
{
  "id": "1",
  "name": "process_analytics",
  "state": "completed",
  "progress": 100,
  "returnValue": { "success": true },
  "timestamp": 1234567890,
  "processedOn": 1234567891,
  "finishedOn": 1234567892
}
```

### Get Queue Statistics

```bash
curl http://localhost:3000/api/jobs/stats/process_analytics
```

**Response:**
```json
{
  "waiting": 0,
  "active": 1,
  "completed": 10,
  "failed": 0,
  "delayed": 0,
  "total": 11
}
```

### Available Job Types

1. **`analyze_company`** - Analyze company intelligence
2. **`generate_feedback`** - Generate conversation feedback
3. **`send_email`** - Send email notifications
4. **`process_analytics`** - Process analytics events
5. **`generate_persona`** - Generate prospect persona

## 🔍 Using Distributed Tracing

### Trace Headers

Every request automatically includes:
- `X-Request-ID` - Unique request identifier
- `X-Trace-ID` - Distributed trace ID
- `X-Span-ID` - Current span ID

### View Traces

Check server logs for trace information:
```
Trace started: operation=POST /api/roleplay, traceId=trace_123, spanId=span_456
Span ended: traceId=trace_123, spanId=span_456, duration=150ms
```

## 📝 Using Structured Logging

### In Your Code

```typescript
import { log } from '@/lib/logger';

// Info log
log.info('User logged in', { userId: '123' });

// Error log
log.error('API error', error, { requestId: 'req_123' });

// Performance log
log.performance('database_query', 150, { query: 'SELECT *' });

// Security log
log.security('rate_limit_exceeded', { ip: '192.168.1.1', endpoint: '/api/roleplay' });
```

### Log Levels

- `debug` - Detailed debugging information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages

Set log level in `.env.local`:
```bash
LOG_LEVEL=info  # debug, info, warn, error
```

## 🛡️ Using Error Handling

### Automatic Error Handling

All routes wrapped with `withErrorHandler` automatically:
- Catch errors
- Generate request IDs
- Return consistent error format
- Log to Sentry
- Record error metrics

### Manual Error Handling

```typescript
import { handleError, AppError, ErrorType } from '@/lib/error-handler';

try {
  // Your code
} catch (error) {
  return handleError(error, requestId);
}

// Or throw custom errors
throw new AppError('Not found', ErrorType.NOT_FOUND, 404);
```

## 🎨 Using Caching

### Cache Operations

```typescript
import { cacheGet, cacheSet, cacheDelete } from '@/lib/redis';

// Set cache
await cacheSet('user:123', userData, { ttl: 3600 }); // 1 hour

// Get cache
const user = await cacheGet<User>('user:123');

// Delete cache
await cacheDelete('user:123');
```

## 📈 Monitoring Checklist

### Daily Checks

1. **Health Status:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Error Rate:**
   - Check Sentry dashboard
   - Review error logs

3. **Performance:**
   - Check `/api/metrics` for response times
   - Monitor queue stats

### Production Setup

1. **Set up Prometheus scraping:**
   - Configure Prometheus to scrape `/api/metrics`
   - Set scrape interval (e.g., 15s)

2. **Create Grafana dashboards:**
   - HTTP request rate
   - Error rate
   - Response time (p50, p95, p99)
   - Queue depth

3. **Set up alerts:**
   - High error rate
   - Slow response times
   - Queue backup
   - Health check failures

## 🚨 Troubleshooting

### Health Check Shows "Unhealthy"

**Database unavailable:**
- Expected in development if Supabase not configured
- Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

**Redis unavailable:**
- Falls back to in-memory (still works)
- To use Redis: install and configure `REDIS_URL`

### Metrics Not Showing

- Check `/api/metrics` endpoint is accessible
- Verify Prometheus can reach the endpoint
- Check CORS settings if accessing from different domain

### Jobs Not Processing

- Ensure workers are running (they start automatically)
- Check Redis connection if using distributed queues
- Review job status via `/api/jobs/status/:jobType/:jobId`

## 🎓 Next Steps

1. **Set up monitoring:**
   - Configure Prometheus
   - Create Grafana dashboards
   - Set up alerts

2. **Configure production:**
   - Set Redis URL
   - Set Sentry DSN
   - Configure database

3. **Migrate routes:**
   - Gradually migrate existing routes to use new logging
   - Add metrics to important endpoints
   - Use job queue for long-running tasks

4. **Monitor performance:**
   - Track response times
   - Monitor error rates
   - Watch queue depths

Your backend is now world-class and ready for production! 🚀


