'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { announceToScreenReader } from '@/lib/accessibility-utils';

/**
 * AccessibilityAnnouncer - Announces route changes to screen readers
 */
export default function AccessibilityAnnouncer() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      // Get page title for announcement
      const pageTitle = document.title || 'Page loaded';
      announceToScreenReader(`Navigated to ${pageTitle}`, 'polite');
    }
  }, [pathname]);

  return null;
}

