'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface FocusManagementOptions {
  trap?: boolean; // Trap focus within element
  restoreOnUnmount?: boolean; // Restore focus to previous element
  initialFocus?: HTMLElement | (() => HTMLElement | null);
  onEscape?: () => void;
}

export function useFocusManagement(options: FocusManagementOptions = {}) {
  const {
    trap = false,
    restoreOnUnmount = true,
    initialFocus,
    onEscape,
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }, []);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!trap || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    if (e.key === 'Escape' && onEscape) {
      onEscape();
    }
  }, [trap, getFocusableElements, onEscape]);

  const setInitialFocus = useCallback(() => {
    if (initialFocus) {
      const element = typeof initialFocus === 'function' ? initialFocus() : initialFocus;
      if (element) {
        element.focus();
        return;
      }
    }

    // Focus first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [initialFocus, getFocusableElements]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set initial focus
    setInitialFocus();

    // Set up focus trap
    if (trap) {
      containerRef.current.addEventListener('keydown', trapFocus);
    }

    return () => {
      if (trap && containerRef.current) {
        containerRef.current.removeEventListener('keydown', trapFocus);
      }

      // Restore previous focus
      if (restoreOnUnmount && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [trap, trapFocus, setInitialFocus, restoreOnUnmount]);

  return {
    containerRef,
    setInitialFocus,
    getFocusableElements,
  };
}

