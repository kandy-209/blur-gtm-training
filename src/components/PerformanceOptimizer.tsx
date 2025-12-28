'use client';

import { useEffect } from 'react';
import { initPerformanceOptimizations } from '@/lib/performance-optimization';

export default function PerformanceOptimizer() {
  useEffect(() => {
    initPerformanceOptimizations();
  }, []);

  return null;
}

