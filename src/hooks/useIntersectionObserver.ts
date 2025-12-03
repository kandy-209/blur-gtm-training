'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    triggerOnce = false,
    onIntersect,
  } = options;

  const elementRef = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (triggerOnce && hasTriggeredRef.current) {
          return;
        }

        setIsIntersecting(isIntersecting);

        if (isIntersecting) {
          hasTriggeredRef.current = true;
          if (onIntersect) {
            onIntersect(entry);
          }
        }

        if (triggerOnce && isIntersecting) {
          observer.disconnect();
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce, onIntersect]);

  return [elementRef, isIntersecting];
}

