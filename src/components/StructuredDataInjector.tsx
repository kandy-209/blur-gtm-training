'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * StructuredDataInjector - Dynamically injects page-specific structured data
 * based on the current route
 */
export default function StructuredDataInjector() {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';

  useEffect(() => {
    // Remove any existing dynamic structured data
    const existing = document.querySelectorAll('[data-dynamic-structured-data]');
    existing.forEach((el) => el.remove());

    // Inject page-specific structured data based on route
    if (pathname?.startsWith('/roleplay/')) {
      const scenarioId = pathname.split('/').pop();
      if (scenarioId) {
        const structuredData = {
          '@context': 'https://schema.org',
          '@type': 'LearningResource',
          name: `Browserbase Sales Training - ${scenarioId}`,
          description: 'AI-powered sales role-play training scenario',
          url: `${siteUrl}${pathname}`,
          learningResourceType: 'Interactive Tutorial',
          educationalLevel: 'Professional',
          teaches: 'Sales Skills, Objection Handling, Browserbase Positioning',
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic-structured-data', 'true');
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    } else if (pathname === '/scenarios') {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Browserbase Sales Training Scenarios',
        description: 'Browse all available sales training scenarios',
        url: `${siteUrl}${pathname}`,
        mainEntity: {
          '@type': 'ItemList',
          name: 'Training Scenarios',
        },
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    } else if (pathname === '/analytics') {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Dashboard',
        name: 'Analytics Dashboard',
        description: 'Training performance analytics and metrics',
        url: `${siteUrl}${pathname}`,
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [pathname, siteUrl]);

  return null;
}

