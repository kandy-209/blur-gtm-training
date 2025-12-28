'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Generate structured data for breadcrumbs
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com'}${item.href}`,
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
      >
        <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
          {breadcrumbs.map((item, index) => (
            <li
              key={item.href}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center hover:text-foreground transition-colors"
                  aria-label="Home"
                  itemProp="item"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" aria-hidden="true" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium" aria-current="page" itemProp="name">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                      itemProp="item"
                    >
                      <span itemProp="name">{item.label}</span>
                    </Link>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

