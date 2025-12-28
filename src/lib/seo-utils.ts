/**
 * SEO Utilities - Helper functions for SEO optimization
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(data: SEOData): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
  const defaultImage = `${siteUrl}/og-image.png`;
  
  return {
    'title': data.title,
    'description': data.description,
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.image || defaultImage,
    'og:url': data.url || siteUrl,
    'og:type': data.type || 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.image || defaultImage,
    'keywords': data.keywords?.join(', ') || '',
  };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
  return `${siteUrl}${path}`;
}

/**
 * Generate structured data for breadcrumbs
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Browserbase GTM Training Platform',
    url: siteUrl,
    logo: `${siteUrl}/logos/browserbase-logo.svg`,
    sameAs: [
      'https://browserbase.com',
      'https://twitter.com/browserbase',
      'https://linkedin.com/company/browserbase',
    ],
  };
}

