'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export function useMousePosition(elementRef: React.RefObject<HTMLElement | null>) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);
  const pendingUpdateRef = useRef<{ x: number; y: number } | null>(null);
  const rectRef = useRef<DOMRect | null>(null);

  // Throttle using requestAnimationFrame
  const updatePosition = useCallback((x: number, y: number) => {
    pendingUpdateRef.current = { x, y };
    
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingUpdateRef.current) {
          const { x, y } = pendingUpdateRef.current;
          setMousePosition({ x, y });
          
          const element = elementRef.current;
          if (element) {
            element.style.setProperty('--mouse-x', `${x}%`);
            element.style.setProperty('--mouse-y', `${y}%`);
          }
          
          pendingUpdateRef.current = null;
          rafRef.current = undefined;
        }
      });
    }
  }, [elementRef]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Cache rect and update on resize
    const updateRect = () => {
      rectRef.current = element.getBoundingClientRect();
    };
    updateRect();

    const handleMouseMove = (e: MouseEvent) => {
      if (!rectRef.current) updateRect();
      const rect = rectRef.current!;
      
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      updatePosition(x, y);
    };

    const handleResize = () => {
      updateRect();
    };

    // Use passive listeners for better performance
    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [elementRef, updatePosition]);

  return mousePosition;
}

