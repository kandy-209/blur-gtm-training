'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance-monitor';

/**
 * PerformanceMonitor - Initializes performance monitoring
 */
export default function PerformanceMonitor() {
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return null;
}

