'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  level?: 'polite' | 'assertive' | 'off';
  children?: React.ReactNode;
  message?: string;
  id?: string;
}

export function LiveRegion({
  level = 'polite',
  children,
  message,
  id = 'live-region',
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear previous message
      regionRef.current.textContent = '';
      // Small delay to ensure screen readers pick up the change
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      id={id}
      ref={regionRef}
      role="status"
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    >
      {children || message}
    </div>
  );
}

// Hook for programmatic announcements
export function useLiveRegion(level: 'polite' | 'assertive' = 'polite') {
  const announce = (message: string) => {
    const region = document.getElementById('live-region');
    if (region) {
      region.setAttribute('aria-live', level);
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  };

  return { announce };
}

