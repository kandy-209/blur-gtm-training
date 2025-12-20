/**
 * SEO utility functions for generating structured data and meta tags
 */

export interface SEOConfig {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(config: SEOConfig) {
  const url = config.url || siteUrl;
  const image = config.image || `${siteUrl}/og-image.png`;
  
  return {
    'og:title': config.title,
    'og:description': config.description,
    'og:url': url,
    'og:type': config.type || 'website',
    'og:image': image,
    'og:site_name': 'Browserbase GTM Training',
    ...(config.publishedTime && { 'article:published_time': config.publishedTime }),
    ...(config.modifiedTime && { 'article:modified_time': config.modifiedTime }),
    ...(config.author && { 'article:author': config.author }),
  };
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(config: SEOConfig) {
  const image = config.image || `${siteUrl}/og-image.png`;
  
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': image,
      'twitter:site': '@blur',
  };
}

/**
 * Generate structured data (JSON-LD) for a page
 */
export function generateStructuredData(config: SEOConfig) {
  const url = config.url || siteUrl;
  const image = config.image || `${siteUrl}/og-image.png`;
  
  const baseData = {
    '@context': 'https://schema.org',
    '@type': config.type === 'article' ? 'Article' : 'WebPage',
    headline: config.title,
    description: config.description,
    url,
    image: image,
    publisher: {
      '@type': 'Organization',
      name: 'Browserbase',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logos/cursor-logo.svg`,
      },
    },
  };

  if (config.type === 'article') {
    return {
      ...baseData,
      '@type': 'Article',
      datePublished: config.publishedTime,
      dateModified: config.modifiedTime || config.publishedTime,
      author: {
        '@type': 'Person',
        name: config.author || 'Browserbase GTM Team',
      },
    };
  }

  return baseData;
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

