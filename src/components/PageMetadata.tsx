'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { generateMetaTags, generateCanonicalUrl } from '@/lib/seo-utils';

interface PageMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

/**
 * PageMetadata - Dynamically updates page metadata based on route
 */
export default function PageMetadata({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
}: PageMetadataProps) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';

  useEffect(() => {
    if (!pathname) return;

    const canonicalUrl = generateCanonicalUrl(pathname);
    const metaTags = generateMetaTags({
      title: title || document.title,
      description: description || '',
      keywords,
      image,
      url: canonicalUrl,
      type,
    });

    // Update title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update all meta tags
    Object.entries(metaTags).forEach(([name, content]) => {
      if (content) {
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          updateMetaTag(name, content, 'property');
        } else {
          updateMetaTag(name, content);
        }
      }
    });

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Update robots meta tag
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }
  }, [pathname, title, description, keywords, image, type, noindex]);

  return null;
}

