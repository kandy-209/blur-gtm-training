/**
 * Performance Monitor
 * Tracks and reports Core Web Vitals and performance metrics
 */

import { enhancedAnalytics } from './enhanced-analytics';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

/**
 * Get rating for a metric value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  // Core Web Vitals thresholds
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 }, // First Input Delay
    CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track performance metric
 */
export function trackPerformanceMetric(metric: PerformanceMetric): void {
  const rating = getRating(metric.name, metric.value);
  
  // Track to analytics
  enhancedAnalytics.trackPerformance({
    metric: metric.name as 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP',
    value: metric.value,
    path: window.location.pathname,
    timestamp: new Date(),
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${rating})`);
  }
}

/**
 * Monitor Core Web Vitals using web-vitals library
 */
export function monitorWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Check if web-vitals is available
  if (typeof window !== 'undefined' && (window as any).webVitals) {
    const { onCLS, onFID, onLCP, onFCP, onTTFB } = (window as any).webVitals;

    onCLS((metric: any) => {
      trackPerformanceMetric({
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    onFID((metric: any) => {
      trackPerformanceMetric({
        name: 'FID',
        value: metric.value,
        rating: getRating('FID', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    onLCP((metric: any) => {
      trackPerformanceMetric({
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    onFCP((metric: any) => {
      trackPerformanceMetric({
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    onTTFB((metric: any) => {
      trackPerformanceMetric({
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Monitor Web Vitals
  monitorWebVitals();

  // Monitor resource loading
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            // Track slow resources (> 1 second)
            if (resourceEntry.duration > 1000) {
              console.warn(`[Performance] Slow resource: ${resourceEntry.name} (${resourceEntry.duration.toFixed(2)}ms)`);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // PerformanceObserver not supported
    }
  }
}

