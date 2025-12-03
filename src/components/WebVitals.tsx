'use client';

import { useEffect } from 'react';
import { measureWebVitals, optimizeImageLoading, preloadCriticalResources } from '@/lib/performance';

/**
 * WebVitals component - Measures and reports Core Web Vitals
 * This component should be included in the root layout
 */
export default function WebVitals() {
  useEffect(() => {
    // Measure Core Web Vitals
    measureWebVitals();
    
    // Optimize image loading
    optimizeImageLoading();
    
    // Preload critical resources
    preloadCriticalResources();
  }, []);

  return null;
}

