/**
 * Distributed Tracing with OpenTelemetry
 * Provides request tracing across services
 */

import { log } from '../logger';

// Trace context interface
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
  baggage?: Record<string, string>;
}

// Simple trace implementation (can be replaced with OpenTelemetry SDK)
let traceContext: TraceContext | null = null;

/**
 * Generate trace ID
 */
function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate span ID
 */
function generateSpanId(): string {
  return `span_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Start a new trace
 */
export function startTrace(operation: string, parentContext?: TraceContext): TraceContext {
  const context: TraceContext = {
    traceId: parentContext?.traceId || generateTraceId(),
    spanId: generateSpanId(),
    parentSpanId: parentContext?.spanId,
    sampled: true, // In production, use sampling strategy
  };

  traceContext = context;

  log.debug('Trace started', {
    operation,
    traceId: context.traceId,
    spanId: context.spanId,
    parentSpanId: context.parentSpanId,
  });

  return context;
}

/**
 * Get current trace context
 */
export function getTraceContext(): TraceContext | null {
  return traceContext;
}

/**
 * Set trace context (for async operations)
 */
export function setTraceContext(context: TraceContext | null): void {
  traceContext = context;
}

/**
 * Create a child span
 */
export function createSpan(operation: string, parentContext?: TraceContext): TraceContext {
  const parent = parentContext || traceContext;
  
  if (!parent) {
    return startTrace(operation);
  }

  return {
    traceId: parent.traceId,
    spanId: generateSpanId(),
    parentSpanId: parent.spanId,
    sampled: parent.sampled,
    baggage: parent.baggage,
  };
}

/**
 * End a span
 */
export function endSpan(context: TraceContext, duration?: number): void {
  log.debug('Span ended', {
    traceId: context.traceId,
    spanId: context.spanId,
    duration,
  });
}

/**
 * Add baggage to trace context
 */
export function addBaggage(key: string, value: string): void {
  if (traceContext) {
    traceContext.baggage = {
      ...traceContext.baggage,
      [key]: value,
    };
  }
}

/**
 * Get baggage from trace context
 */
export function getBaggage(key: string): string | undefined {
  return traceContext?.baggage?.[key];
}

/**
 * Trace decorator for async functions
 */
export function trace(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const span = startTrace(`${target.constructor.name}.${propertyKey}`);
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        endSpan(span, duration);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        endSpan(span, duration);
        
        log.error('Trace error', error instanceof Error ? error : new Error(String(error)), {
          traceId: span.traceId,
          spanId: span.spanId,
          operation,
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Extract trace context from headers
 */
export function extractTraceContext(headers: Headers): TraceContext | null {
  const traceId = headers.get('x-trace-id');
  const spanId = headers.get('x-span-id');
  const sampled = headers.get('x-trace-sampled') === 'true';

  if (traceId && spanId) {
    return {
      traceId,
      spanId,
      sampled,
    };
  }

  return null;
}

/**
 * Inject trace context into headers
 */
export function injectTraceContext(context: TraceContext, headers: Headers): void {
  headers.set('x-trace-id', context.traceId);
  headers.set('x-span-id', context.spanId);
  headers.set('x-trace-sampled', context.sampled ? 'true' : 'false');
  
  if (context.parentSpanId) {
    headers.set('x-parent-span-id', context.parentSpanId);
  }
}







