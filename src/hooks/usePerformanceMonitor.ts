'use client';

import { useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  componentMountTime: number;
  memoryUsage?: number;
  paintTime?: number;
}

export interface UsePerformanceMonitorOptions {
  componentName: string;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  logToConsole?: boolean;
  threshold?: number; // Warn if render time exceeds threshold (ms)
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions) {
  const {
    componentName,
    onMetrics,
    logToConsole = process.env.NODE_ENV === 'development',
    threshold = 100,
  } = options;

  const mountTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    return () => {
      const mountDuration = Date.now() - mountTimeRef.current;
      if (logToConsole) {
        console.log(`[Performance] ${componentName} mounted for ${mountDuration}ms`);
      }
    };
  }, [componentName, logToConsole]);

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartRef.current;
      const componentMountTime = Date.now() - mountTimeRef.current;

      const metrics: PerformanceMetrics = {
        renderTime,
        componentMountTime,
      };

      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memoryUsage = memory.usedJSHeapSize / 1048576; // Convert to MB
      }

      // Get paint timing if available
      if (typeof window !== 'undefined' && window.performance) {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
        if (fcp) {
          metrics.paintTime = fcp.startTime;
        }
      }

      if (renderTime > threshold && logToConsole) {
        console.warn(
          `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }

      if (onMetrics) {
        onMetrics(metrics);
      }
    };
  });

  return {
    renderCount: renderCountRef.current,
    getMetrics: (): PerformanceMetrics => ({
      renderTime: performance.now() - renderStartRef.current,
      componentMountTime: Date.now() - mountTimeRef.current,
    }),
  };
}

