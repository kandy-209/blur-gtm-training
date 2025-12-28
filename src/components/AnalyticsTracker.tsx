'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { enhancedAnalytics } from '@/lib/enhanced-analytics';

/**
 * AnalyticsTracker - Automatically tracks page views and engagement
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      enhancedAnalytics.trackPageView({
        path: pathname,
        title: document.title,
        referrer: document.referrer,
        timestamp: new Date(),
      });

      // Reset page start time
      enhancedAnalytics.resetPageStartTime();
    }

    // Track time on page before leaving
    const handleBeforeUnload = () => {
      enhancedAnalytics.trackTimeOnPage(pathname || '/');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track scroll depth
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      );
      if (scrollPercent > maxScroll && scrollPercent >= 25) {
        maxScroll = scrollPercent;
        if (scrollPercent === 25 || scrollPercent === 50 || scrollPercent === 75 || scrollPercent === 100) {
          enhancedAnalytics.trackEngagement({
            type: 'scroll',
            value: scrollPercent,
            path: pathname || '/',
            timestamp: new Date(),
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track clicks on external links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith(window.location.origin)) {
        enhancedAnalytics.trackEngagement({
          type: 'click',
          element: link.href,
          path: pathname || '/',
          timestamp: new Date(),
        });
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  return null;
}

