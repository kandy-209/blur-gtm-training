/**
 * Prometheus Metrics
 * Production-ready metrics collection for monitoring
 */

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a Registry to register metrics
export const register = new Registry();

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// HTTP Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [register],
});

// API Metrics
export const apiCallDuration = new Histogram({
  name: 'api_call_duration_seconds',
  help: 'Duration of API calls in seconds',
  labelNames: ['api_name', 'endpoint', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const apiCallTotal = new Counter({
  name: 'api_calls_total',
  help: 'Total number of API calls',
  labelNames: ['api_name', 'endpoint', 'status'],
  registers: [register],
});

// Business Metrics
export const roleplayScenariosTotal = new Counter({
  name: 'roleplay_scenarios_total',
  help: 'Total number of roleplay scenarios started',
  labelNames: ['scenario_id', 'status'],
  registers: [register],
});

export const roleplayTurnsTotal = new Counter({
  name: 'roleplay_turns_total',
  help: 'Total number of roleplay turns',
  labelNames: ['scenario_id', 'evaluation'],
  registers: [register],
});

export const feedbackGeneratedTotal = new Counter({
  name: 'feedback_generated_total',
  help: 'Total number of feedback analyses generated',
  labelNames: ['type'],
  registers: [register],
});

export const companyAnalysesTotal = new Counter({
  name: 'company_analyses_total',
  help: 'Total number of company analyses performed',
  labelNames: ['source'],
  registers: [register],
});

// System Metrics
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name'],
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_name'],
  registers: [register],
});

// Rate Limiting Metrics
export const rateLimitHits = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint', 'identifier'],
  registers: [register],
});

// Error Metrics
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'],
  registers: [register],
});

// Helper function to record HTTP request metrics
export function recordHttpRequest(
  method: string,
  route: string,
  status: number,
  duration: number
) {
  httpRequestDuration.observe({ method, route, status }, duration);
  httpRequestTotal.inc({ method, route, status });
  
  if (status >= 400) {
    httpRequestErrors.inc({ method, route, error_type: status >= 500 ? 'server_error' : 'client_error' });
  }
}

// Helper function to record API call metrics
export function recordApiCall(
  apiName: string,
  endpoint: string,
  status: 'success' | 'error',
  duration: number
) {
  apiCallDuration.observe({ api_name: apiName, endpoint, status }, duration);
  apiCallTotal.inc({ api_name: apiName, endpoint, status });
}

// Helper function to record error
export function recordError(type: string, severity: 'low' | 'medium' | 'high' | 'critical') {
  errorsTotal.inc({ type, severity });
}

