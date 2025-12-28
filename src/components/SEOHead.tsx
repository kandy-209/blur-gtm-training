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
    
    // Helper to generate dynamic OG image URL
    const getOgImageUrl = (title: string, description: string, scenario?: string) => {
      const params = new URLSearchParams({
        title: title.substring(0, 100),
        description: description.substring(0, 200),
      })
      if (scenario) {
        params.set('scenario', scenario)
      }
      return `${siteUrl}/api/og?${params.toString()}`
    }

    // Enhanced route-specific metadata for sales enablement
    const routeMetadata: Record<string, {
      title: string;
      description: string;
      keywords?: string[];
      ogImage?: string;
    }> = {
      '/scenarios': {
        title: 'Browserbase Sales Training Scenarios | GTM Training',
        description: 'Practice Browserbase sales scenarios with AI-powered role-play training. Master Browserbase objection handling, technical sales, and improve your GTM skills with realistic buyer simulations for cloud browser infrastructure.',
        keywords: ['Browserbase scenarios', 'Browserbase sales training', 'Browserbase role-play', 'Browserbase objection handling', 'Browserbase technical sales', 'enterprise sales', 'browser automation sales'],
        ogImage: getOgImageUrl('Browserbase Sales Training Scenarios', 'Practice Browserbase sales scenarios with AI-powered role-play training'),
      },
      '/roi-calculator': {
        title: 'Browserbase ROI Calculator | GTM Training',
        description: 'Calculate ROI and business impact of Browserbase cloud browser infrastructure. Measure the value of Browserbase managed browsers, browser automation, and web scraping solutions for your enterprise.',
        keywords: ['Browserbase ROI', 'Browserbase calculator', 'Browserbase business impact', 'browser automation ROI', 'cloud browser ROI', 'managed browser ROI'],
        ogImage: getOgImageUrl('Browserbase ROI Calculator', 'Calculate ROI and business impact of Browserbase cloud browser infrastructure'),
      },
      '/sales-skills': {
        title: 'Browserbase Sales Skills Training | GTM Training',
        description: 'Learn Browserbase sales fundamentals including technical sales, objection handling, and product positioning. Develop essential skills for selling Browserbase cloud browser infrastructure with AI-powered coaching.',
        keywords: ['Browserbase sales skills', 'Browserbase technical sales', 'Browserbase product training', 'outbound sales', 'inbound sales', 'browser automation sales'],
        ogImage: getOgImageUrl('Browserbase Sales Skills Training', 'Learn Browserbase sales fundamentals with AI-powered coaching'),
      },
      '/analytics': {
        title: 'Browserbase Sales Analytics Dashboard | GTM Training',
        description: 'Track your Browserbase sales training progress with detailed analytics. Monitor performance metrics, improvement trends, and training effectiveness for Browserbase product knowledge and sales skills.',
        keywords: ['Browserbase analytics', 'sales analytics', 'Browserbase training metrics', 'performance tracking', 'Browserbase sales metrics'],
        ogImage: getOgImageUrl('Browserbase Sales Analytics Dashboard', 'Track your Browserbase sales training progress with detailed analytics'),
      },
      '/company-lookup': {
        title: 'Company Lookup | Browserbase GTM Training',
        description: 'Search and analyze company information and financial data. Research prospects with comprehensive company intelligence tools.',
        keywords: ['company lookup', 'prospect research', 'company analysis'],
        ogImage: getOgImageUrl('Company Lookup', 'Search and analyze company information and financial data'),
      },
      '/financial-dashboard': {
        title: 'Financial Dashboard | Browserbase GTM Training',
        description: 'View comprehensive financial data and company analysis. Access real-time financial metrics and business intelligence for sales enablement.',
        keywords: ['financial dashboard', 'company analysis', 'business intelligence'],
        ogImage: getOgImageUrl('Financial Dashboard', 'View comprehensive financial data and company analysis'),
      },
      '/sales-training': {
        title: 'Browserbase Sales Training Programs | GTM Training',
        description: 'Comprehensive Browserbase sales training programs for enterprise teams. AI-powered coaching, Browserbase role-play scenarios, and performance analytics for selling cloud browser infrastructure.',
        keywords: ['Browserbase sales training', 'Browserbase training programs', 'enterprise training', 'Browserbase coaching', 'browser automation training'],
        ogImage: getOgImageUrl('Browserbase Sales Training Programs', 'Comprehensive Browserbase sales training programs for enterprise teams'),
      },
      '/prospect-intelligence': {
        title: 'Browserbase Prospect Intelligence | GTM Training',
        description: 'Automated prospect research and intelligence for Browserbase sales. Analyze tech stacks, hiring trends, and ICP scoring to identify ideal Browserbase customers.',
        keywords: ['Browserbase prospects', 'prospect intelligence', 'Browserbase ICP', 'sales research', 'Browserbase targeting', 'ICP scoring'],
        ogImage: getOgImageUrl('Browserbase Prospect Intelligence', 'Automated prospect research and intelligence for Browserbase sales'),
      },
      '/enterprise': {
        title: 'Browserbase Enterprise Solutions | GTM Training',
        description: 'Enterprise-grade Browserbase sales training solutions for large organizations. Custom Browserbase scenarios, team analytics, and dedicated support for enterprise browser automation sales.',
        keywords: ['Browserbase enterprise', 'enterprise sales', 'Browserbase enterprise training', 'B2B sales', 'enterprise browser automation'],
        ogImage: getOgImageUrl('Browserbase Enterprise Solutions', 'Enterprise-grade Browserbase sales training solutions for large organizations'),
      },
    };

    const metadata = routeMetadata[pathname] || {
      title: siteName,
      description: 'Master Browserbase sales positioning with AI-powered training. Professional sales enablement platform for GTM teams.',
    };

    // Update document title
    document.title = metadata.title;

    // Helper function to update or create meta tag with performance optimization
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      const updateTag = () => {
        let tag = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attribute, name);
          document.head.appendChild(tag);
        }
        // Only update if content changed to avoid unnecessary DOM manipulation
        const currentContent = tag.getAttribute('content');
        if (currentContent !== content) {
          tag.setAttribute('content', content);
        }
      };

      // Critical tags update immediately
      const criticalTags = ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'];
      if (criticalTags.includes(name)) {
        updateTag();
      } else {
        // Use requestIdleCallback for non-critical updates if available
        if ('requestIdleCallback' in window) {
          requestIdleCallback(updateTag, { timeout: 1000 });
        } else {
          // Fallback to setTimeout for browsers without requestIdleCallback
          setTimeout(updateTag, 0);
        }
      }
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
    updateMetaTag('twitter:site', '@browserbase');
    updateMetaTag('twitter:creator', '@browserbase');

    // Update additional professional meta tags
    updateMetaTag('article:author', siteName);
    updateMetaTag('article:published_time', new Date().toISOString());
    updateMetaTag('article:modified_time', new Date().toISOString());

    // Update page-specific structured data and OG image for roleplay pages
    if (pathname.startsWith('/roleplay/')) {
      const scenarioId = pathname.split('/').pop();
      
      // Use dynamic OG image for scenario pages
      const scenarioOgImage = getOgImageUrl(
        metadata.title,
        metadata.description,
        scenarioId || undefined
      )
      updateMetaTag('og:image', scenarioOgImage, 'property')
      updateMetaTag('twitter:image', scenarioOgImage)
      
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

