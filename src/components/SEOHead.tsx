'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Enhanced SEO Head component for professional sales enablement
 * Updates document title, meta tags, Open Graph, and Twitter Cards based on current route
 */
export default function SEOHead() {
  const pathname = usePathname();

  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
    const siteName = 'Browserbase GTM Training Platform';
    
    // Enhanced route-specific metadata for sales enablement
    const routeMetadata: Record<string, {
      title: string;
      description: string;
      keywords?: string[];
      ogImage?: string;
    }> = {
      '/scenarios': {
        title: 'Sales Training Scenarios | Browserbase GTM Training',
        description: 'Practice enterprise sales scenarios with AI-powered role-play training. Master objection handling and improve your GTM skills with realistic buyer simulations.',
        keywords: ['sales scenarios', 'role-play training', 'objection handling', 'enterprise sales'],
      },
      '/roi-calculator': {
        title: 'ROI Calculator | Browserbase GTM Training',
        description: 'Calculate ROI and business impact of Browserbase. Measure the value of browser automation and web scraping solutions for your enterprise.',
        keywords: ['ROI calculator', 'business impact', 'browser automation ROI'],
      },
      '/sales-skills': {
        title: 'Sales Skills Training | Browserbase GTM Training',
        description: 'Learn outbound and inbound sales fundamentals. Develop essential sales skills with AI-powered coaching and real-time feedback.',
        keywords: ['sales skills', 'outbound sales', 'inbound sales', 'sales training'],
      },
      '/analytics': {
        title: 'Analytics Dashboard | Browserbase GTM Training',
        description: 'Track your sales training progress with detailed analytics. Monitor performance metrics, improvement trends, and training effectiveness.',
        keywords: ['sales analytics', 'training metrics', 'performance tracking'],
      },
      '/company-lookup': {
        title: 'Company Lookup | Browserbase GTM Training',
        description: 'Search and analyze company information and financial data. Research prospects with comprehensive company intelligence tools.',
        keywords: ['company lookup', 'prospect research', 'company analysis'],
      },
      '/financial-dashboard': {
        title: 'Financial Dashboard | Browserbase GTM Training',
        description: 'View comprehensive financial data and company analysis. Access real-time financial metrics and business intelligence for sales enablement.',
        keywords: ['financial dashboard', 'company analysis', 'business intelligence'],
      },
      '/sales-training': {
        title: 'Sales Training Programs | Browserbase GTM Training',
        description: 'Comprehensive sales training programs for enterprise teams. AI-powered coaching, role-play scenarios, and performance analytics.',
        keywords: ['sales training', 'enterprise training', 'sales coaching'],
      },
      '/prospect-intelligence': {
        title: 'Prospect Intelligence | Browserbase GTM Training',
        description: 'Automated prospect research and intelligence. Analyze tech stacks, hiring trends, and ICP scoring for better sales targeting.',
        keywords: ['prospect intelligence', 'sales research', 'ICP scoring'],
      },
      '/enterprise': {
        title: 'Enterprise Solutions | Browserbase GTM Training',
        description: 'Enterprise-grade sales training solutions for large organizations. Custom scenarios, team analytics, and dedicated support.',
        keywords: ['enterprise sales', 'enterprise training', 'B2B sales'],
      },
    };

    const metadata = routeMetadata[pathname] || {
      title: siteName,
      description: 'Master Browserbase sales positioning with AI-powered training. Professional sales enablement platform for GTM teams.',
    };

    // Update document title
    document.title = metadata.title;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update meta description
    updateMetaTag('description', metadata.description);

    // Update keywords if provided
    if (metadata.keywords) {
      updateMetaTag('keywords', metadata.keywords.join(', '));
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${siteUrl}${pathname}`);

    // Update Open Graph tags for professional sharing
    const ogImage = metadata.ogImage || `${siteUrl}/og-image.png`;
    updateMetaTag('og:title', metadata.title, 'property');
    updateMetaTag('og:description', metadata.description, 'property');
    updateMetaTag('og:url', `${siteUrl}${pathname}`, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', siteName, 'property');

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', metadata.title);
    updateMetaTag('twitter:description', metadata.description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:site', '@blur');
    updateMetaTag('twitter:creator', '@blur');

    // Update additional professional meta tags
    updateMetaTag('article:author', siteName);
    updateMetaTag('article:published_time', new Date().toISOString());
    updateMetaTag('article:modified_time', new Date().toISOString());

    // Update page-specific structured data
    if (pathname.startsWith('/roleplay/')) {
      const scenarioId = pathname.split('/').pop();
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: metadata.title,
        description: metadata.description,
        provider: {
          '@type': 'Organization',
          name: siteName,
          url: siteUrl,
        },
        courseCode: scenarioId,
        educationalLevel: 'Professional',
      };

      // Remove existing course structured data
      const existingScript = document.querySelector('script[data-dynamic-seo="course"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-seo', 'course');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
}

