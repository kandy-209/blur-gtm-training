# Backend Infrastructure Demo

## 🚀 Live Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "duration": 5,
  "checks": {
    "database": "ok",
    "redis": "ok",
    "external_apis": "ok"
  },
  "version": "1.0.0",
  "environment": "development"
}
```

### Readiness Check
```bash
curl http://localhost:3000/api/ready
```

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Prometheus Metrics
```bash
curl http://localhost:3000/api/metrics
```

**Response:**
```
# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/health",status="200",le="0.1"} 1
...

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/health",status="200"} 1
...
```

### Versioned Endpoints
```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/metrics
```

## 📊 Monitoring Dashboard

Visit these URLs in your browser:

1. **Health Status**: http://localhost:3000/api/health
2. **Metrics**: http://localhost:3000/api/metrics
3. **Job Queue Stats**: http://localhost:3000/api/jobs/stats/analyze_company

## 🔍 Testing Features

### Test Structured Logging
Check server console for structured logs:
- JSON format in production
- Readable format in development
- Request IDs for tracing

### Test Error Handling
```bash
# This should return a proper error response
curl http://localhost:3000/api/jobs/status/invalid/job123
```

### Test Job Queue
```bash
# Add a job
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "jobType": "process_analytics",
    "data": {
      "userId": "user123",
      "eventType": "scenario_start",
      "data": {}
    }
  }'
```

## 🎯 Key Features to Verify

1. ✅ Health checks respond correctly
2. ✅ Metrics endpoint exposes Prometheus format
3. ✅ Structured logging works (check console)
4. ✅ Error handling returns consistent format
5. ✅ Request IDs are generated and tracked
6. ✅ Distributed tracing headers are set

## 📝 Next Steps

1. Set up Redis (optional):
   ```bash
   # Add to .env.local
   REDIS_URL=redis://localhost:6379
   ```

2. Set up Sentry (optional):
   ```bash
   # Add to .env.local
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

3. Monitor metrics:
   - Set up Prometheus to scrape `/api/metrics`
   - Create Grafana dashboards
   - Set up alerts

4. View logs:
   - Development: Check console output
   - Production: Check `logs/error.log` and `logs/combined.log`







