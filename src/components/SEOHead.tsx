'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * SEO Head component for dynamic meta tag updates
 * Updates document title and meta tags based on current route
 */
export default function SEOHead() {
  const pathname = usePathname();

  useEffect(() => {
    // Update page title based on route
    const routeTitles: Record<string, string> = {
      '/scenarios': 'Sales Training Scenarios | Browserbase GTM Training',
      '/roi-calculator': 'ROI Calculator | Browserbase GTM Training',
      '/sales-skills': 'Sales Skills Training | Browserbase GTM Training',
      '/analytics': 'Analytics Dashboard | Browserbase GTM Training',
      '/company-lookup': 'Company Lookup | Browserbase GTM Training',
      '/financial-dashboard': 'Financial Dashboard | Browserbase GTM Training',
    };

    const title = routeTitles[pathname] || 'Browserbase GTM Training Platform';
    document.title = title;

    // Update meta description
    const routeDescriptions: Record<string, string> = {
      '/scenarios': 'Practice enterprise sales scenarios with AI-powered role-play training.',
      '/roi-calculator': 'Calculate ROI and business impact of Browserbase.',
      '/sales-skills': 'Learn outbound and inbound sales fundamentals.',
      '/analytics': 'Track your sales training progress with detailed analytics.',
      '/company-lookup': 'Search and analyze company information and financial data.',
      '/financial-dashboard': 'View comprehensive financial data and company analysis.',
    };

    const description = routeDescriptions[pathname] || 'Master Browserbase sales positioning with AI-powered training.';
    
    // Update meta description tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update canonical URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cursorsalestrainer.com';
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${siteUrl}${pathname}`);
  }, [pathname]);

  return null;
}

