/**
 * Advanced SEO Utilities
 * Deep-level SEO optimizations and helpers
 */

export interface AdvancedSEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
}

/**
 * Generate comprehensive meta tags
 */
export function generateAdvancedMetaTags(data: AdvancedSEOData): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
  const defaultImage = `${siteUrl}/og-image.png`;
  
  const metaTags: Record<string, string> = {
    // Basic meta tags
    'title': data.title,
    'description': data.description,
    'keywords': data.keywords?.join(', ') || '',
    
    // Open Graph
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.image || defaultImage,
    'og:url': data.url || siteUrl,
    'og:type': data.type || 'website',
    'og:site_name': 'Browserbase GTM Training Platform',
    'og:locale': data.locale || 'en_US',
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.image || defaultImage,
    'twitter:site': '@browserbase',
    'twitter:creator': '@browserbase',
    
    // Article specific
    ...(data.type === 'article' && {
      'article:author': data.author || 'Browserbase',
      'article:published_time': data.publishedTime || '',
      'article:modified_time': data.modifiedTime || '',
      'article:section': data.section || 'Sales Training',
      'article:tag': data.tags?.join(', ') || '',
    }),
  };
  
  return metaTags;
}

/**
 * Generate hreflang tags for internationalization
 */
export function generateHreflangTags(
  currentUrl: string,
  locales: Array<{ lang: string; url: string }>
): Array<{ rel: string; hreflang: string; href: string }> {
  const tags = locales.map((locale) => ({
    rel: 'alternate',
    hreflang: locale.lang,
    href: locale.url,
  }));
  
  // Add x-default
  tags.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: currentUrl,
  });
  
  return tags;
}

/**
 * Generate JSON-LD structured data for different types
 */
export function generateStructuredData(type: string, data: any): object {
  const baseContext = { '@context': 'https://schema.org' };
  
  switch (type) {
    case 'Article':
      return {
        ...baseContext,
        '@type': 'Article',
        headline: data.headline,
        description: data.description,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        author: {
          '@type': 'Organization',
          name: data.author || 'Browserbase',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Browserbase',
          logo: {
            '@type': 'ImageObject',
            url: data.logo || `${process.env.NEXT_PUBLIC_SITE_URL}/logos/browserbase-logo.svg`,
          },
        },
      };
      
    case 'BreadcrumbList':
      return {
        ...baseContext,
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
      
    case 'FAQPage':
      return {
        ...baseContext,
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      
    default:
      return baseContext;
  }
}

/**
 * Generate schema.org Organization with enhanced details
 */
export function generateOrganizationSchema(): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Browserbase GTM Training Platform',
    url: siteUrl,
    logo: `${siteUrl}/logos/browserbase-logo.svg`,
    description: 'Professional sales enablement platform for mastering Browserbase positioning',
    foundingDate: '2024',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '50-100',
    },
    industry: 'Software',
    sameAs: [
      'https://browserbase.com',
      'https://twitter.com/browserbase',
      'https://linkedin.com/company/browserbase',
      'https://github.com/browserbase',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      email: 'sales@browserbase.com',
      availableLanguage: ['English'],
    },
  };
}

/**
 * Generate schema.org WebSite with search action
 */
export function generateWebSiteSchema(): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Browserbase GTM Training Platform',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/api/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

