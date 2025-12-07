'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Ultra-optimized mouse position tracking with:
 * - RAF throttling
 * - Passive event listeners
 * - Cached rect calculations
 * - Debounced updates
 */
export function useOptimizedMousePosition(elementRef: React.RefObject<HTMLElement | null>) {
  const rafRef = useRef<number | undefined>(undefined);
  const pendingUpdateRef = useRef<{ x: number; y: number } | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const updateCountRef = useRef(0);

  // Batch updates using RAF
  const flushUpdate = useCallback(() => {
    if (pendingUpdateRef.current) {
      const { x, y } = pendingUpdateRef.current;
      const element = elementRef.current;
      
      if (element) {
        // Only update CSS custom properties (no state)
        element.style.setProperty('--mouse-x', `${x}%`);
        element.style.setProperty('--mouse-y', `${y}%`);
      }
      
      pendingUpdateRef.current = null;
      rafRef.current = undefined;
    }
  }, [elementRef]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Cache rect and update less frequently
    const updateRect = () => {
      rectRef.current = element.getBoundingClientRect();
    };
    updateRect();

    // Throttled mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      // Update rect every 10th move for performance
      if (updateCountRef.current % 10 === 0) {
        updateRect();
      }
      updateCountRef.current++;

      if (!rectRef.current) return;
      const rect = rectRef.current;
      
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      
      pendingUpdateRef.current = { x, y };
      
      // Batch updates via RAF
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushUpdate);
      }
    };

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateRect();
        updateCountRef.current = 0; // Reset counter
      }, 250);
    };

    // Use passive listeners for better scroll performance
    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      clearTimeout(resizeTimeout);
    };
  }, [elementRef, flushUpdate]);
}

