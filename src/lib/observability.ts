'use client';

export interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  logs: Array<{ timestamp: number; message: string; level: string }>;
  children: TraceSpan[];
}

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram';
}

export interface DistributedTrace {
  traceId: string;
  spans: TraceSpan[];
  startTime: number;
  endTime?: number;
  duration?: number;
}

export class ObservabilitySystem {
  private traces: Map<string, DistributedTrace> = new Map();
  private metrics: Metric[] = [];
  private activeSpans: Map<string, TraceSpan> = new Map();
  private maxTraces = 1000;
  private maxMetrics = 10000;

  startTrace(traceId: string, name: string): void {
    const trace: DistributedTrace = {
      traceId,
      spans: [],
      startTime: Date.now(),
    };

    this.traces.set(traceId, trace);
  }

  startSpan(
    traceId: string,
    spanId: string,
    name: string,
    tags: Record<string, string> = {}
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) {
      this.startTrace(traceId, 'root');
    }

    const span: TraceSpan = {
      id: spanId,
      name,
      startTime: performance.now(),
      tags,
      logs: [],
      children: [],
    };

    this.activeSpans.set(spanId, span);

    const currentTrace = this.traces.get(traceId);
    if (currentTrace) {
      currentTrace.spans.push(span);
    }
  }

  endSpan(spanId: string): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    this.activeSpans.delete(spanId);
  }

  addSpanLog(spanId: string, message: string, level: string = 'info'): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        message,
        level,
      });
    }
  }

  endTrace(traceId: string): DistributedTrace | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;

    // Keep only recent traces
    if (this.traces.size > this.maxTraces) {
      const oldestTrace = Array.from(this.traces.entries())[0];
      this.traces.delete(oldestTrace[0]);
    }

    return trace;
  }

  recordMetric(
    name: string,
    value: number,
    type: 'counter' | 'gauge' | 'histogram' = 'gauge',
    tags: Record<string, string> = {}
  ): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
      type,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  incrementCounter(name: string, tags: Record<string, string> = {}): void {
    const existing = this.metrics
      .filter((m) => m.name === name && JSON.stringify(m.tags) === JSON.stringify(tags))
      .slice(-1)[0];

    const value = existing && existing.type === 'counter' ? existing.value + 1 : 1;
    this.recordMetric(name, value, 'counter', tags);
  }

  getTrace(traceId: string): DistributedTrace | null {
    return this.traces.get(traceId) || null;
  }

  getMetrics(
    name?: string,
    startTime?: number,
    endTime?: number
  ): Metric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter((m) => m.name === name);
    }

    if (startTime) {
      filtered = filtered.filter((m) => m.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter((m) => m.timestamp <= endTime);
    }

    return filtered;
  }

  getAverageMetric(name: string, timeWindowMs: number = 60000): number {
    const now = Date.now();
    const metrics = this.getMetrics(
      name,
      now - timeWindowMs,
      now
    );

    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  getSlowestSpans(limit: number = 10): TraceSpan[] {
    const allSpans: TraceSpan[] = [];
    
    for (const trace of this.traces.values()) {
      allSpans.push(...trace.spans);
    }

    return allSpans
      .filter((s) => s.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  exportTraces(): DistributedTrace[] {
    return Array.from(this.traces.values());
  }

  exportMetrics(): Metric[] {
    return [...this.metrics];
  }
}

export const observabilitySystem = new ObservabilitySystem();

// Auto-instrumentation helper
export function trace<T>(
  name: string,
  fn: () => T | Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  observabilitySystem.startTrace(traceId, name);
  observabilitySystem.startSpan(traceId, spanId, name, tags);

  return Promise.resolve(fn())
    .then((result) => {
      observabilitySystem.endSpan(spanId);
      observabilitySystem.endTrace(traceId);
      return result;
    })
    .catch((error) => {
      observabilitySystem.addSpanLog(spanId, error.message, 'error');
      observabilitySystem.endSpan(spanId);
      observabilitySystem.endTrace(traceId);
      throw error;
    });
}

