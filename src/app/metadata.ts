import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
const siteName = 'Browserbase GTM Training Platform';

/**
 * Generate page-specific metadata with SEO optimizations
 */
export function generatePageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  const url = `${siteUrl}${path}`;
  const ogImage = image || `${siteUrl}/og-image.png`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

/**
 * Generate structured data for pages
 */
export function generateStructuredData(type: 'WebPage' | 'Article' | 'Course', data: Record<string, any>) {
  const base = {
    '@context': 'https://schema.org',
    '@type': type,
    url: `${siteUrl}${data.path || ''}`,
    name: data.name || data.title,
    description: data.description,
  };

  if (type === 'Article') {
    return {
      ...base,
      headline: data.title,
      datePublished: data.datePublished || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Browserbase',
      },
    };
  }

  if (type === 'Course') {
    return {
      ...base,
      courseCode: data.courseCode,
      educationalLevel: data.level || 'Professional',
      provider: {
        '@type': 'Organization',
        name: 'Browserbase',
      },
    };
  }

  return base;
}

