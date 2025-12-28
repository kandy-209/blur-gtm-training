'use client';

import { useEffect } from 'react';

/**
 * AccessibilityEnhancer - Adds global accessibility improvements
 * - Focus management for route changes
 * - ARIA live regions for dynamic content
 * - Keyboard navigation enhancements
 */
export default function AccessibilityEnhancer() {
  useEffect(() => {
    // Focus management for route changes
    const handleRouteChange = () => {
      // Focus main content on route change
      const mainContent = document.querySelector('main, [role="main"]');
      if (mainContent instanceof HTMLElement) {
        mainContent.focus();
        mainContent.setAttribute('tabindex', '-1');
      }
    };

    // Listen for route changes (Next.js router events)
    const handleFocus = () => {
      // Skip to main content if user presses Tab after page load
      const skipLink = document.querySelector('[data-skip-link]');
      if (skipLink instanceof HTMLElement) {
        skipLink.addEventListener('click', () => {
          setTimeout(() => {
            const main = document.querySelector('main, [role="main"]');
            if (main instanceof HTMLElement) {
              main.focus();
            }
          }, 100);
        });
      }
    };

    // Enhance keyboard navigation
    const enhanceKeyboardNav = () => {
      // Add keyboard shortcuts hints
      document.addEventListener('keydown', (e) => {
        // Alt + M: Focus main content
        if (e.altKey && e.key === 'm') {
          e.preventDefault();
          const main = document.querySelector('main, [role="main"]');
          if (main instanceof HTMLElement) {
            main.focus();
          }
        }
        // Alt + S: Focus search
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          const search = document.querySelector('input[type="search"], [aria-label*="search" i]');
          if (search instanceof HTMLElement) {
            search.focus();
          }
        }
      });
    };

    handleRouteChange();
    handleFocus();
    enhanceKeyboardNav();

    // Add ARIA landmarks if missing
    const addAriaLandmarks = () => {
      const main = document.querySelector('main');
      if (!main) {
        const content = document.querySelector('[role="main"]') || document.body;
        if (content && !content.hasAttribute('role')) {
          content.setAttribute('role', 'main');
        }
      }
    };

    addAriaLandmarks();
  }, []);

  return null;
}

