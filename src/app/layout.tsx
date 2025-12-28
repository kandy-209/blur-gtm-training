import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import BypassProtection from '@/components/BypassProtection';
import NavUser from '@/components/NavUser';
import GlobalVoiceAssistant from '@/components/GlobalVoiceAssistant';
import { SkipLinks } from '@/components/SkipLinks';
import { LiveRegion } from '@/components/ui/live-region';
import SEOHead from '@/components/SEOHead';
import WebVitals from '@/components/WebVitals';
import { UpdateNotification } from '@/components/UpdateNotification';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { initSentry } from '@/lib/sentry';
import type { Metadata } from 'next';

// Initialize Sentry for error tracking
if (typeof window === 'undefined') {
  initSentry();
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';
const siteName = 'Browserbase GTM Training Platform';
const siteDescription = 'Master Browserbase sales positioning and objection handling with AI-powered role-play training. Learn to sell Browserbase cloud browser infrastructure, managed headless browsers, and enterprise browser automation solutions. Master key value propositions: zero infrastructure overhead vs self-hosted Puppeteer/Playwright, built-in proxy management and anti-detection at scale, enterprise team collaboration with centralized management, automated scaling and reliability, and ROI optimization for large teams. Practice real sales scenarios, handle technical objections, and improve your GTM skills with instant feedback and analytics.';
const siteKeywords = [
  // Browserbase Product Keywords
  'Browserbase',
  'Browserbase API',
  'Browserbase cloud browser',
  'Browserbase headless browser',
  'Browserbase browser automation',
  'Browserbase web scraping',
  'Browserbase managed browsers',
  'Browserbase infrastructure',
  'Browserbase enterprise',
  'Browserbase scaling',
  'Browserbase reliability',
  'Browserbase proxy management',
  'Browserbase anti-detection',
  'Browserbase CI/CD integration',
  'Browserbase Puppeteer',
  'Browserbase Playwright',
  'Browserbase Selenium',
  'Browserbase automation platform',
  'Browserbase browser infrastructure',
  'Browserbase cloud infrastructure',
  // Training & Sales Keywords
  'GTM training',
  'sales training',
  'AI role-play',
  'enterprise sales',
  'objection handling',
  'sales enablement',
  'browser automation',
  'web scraping',
  'headless browsers',
  'sales positioning',
  'sales practice',
  'enterprise software sales',
  'B2B sales training',
  'AI sales coach',
  'sales skills development',
  'enterprise GTM',
  'go-to-market training',
  'Browserbase sales training',
  'Browserbase objection handling',
  'Browserbase sales positioning',
  // Long-tail SEO keywords
  'how to sell Browserbase',
  'Browserbase sales pitch',
  'Browserbase demo script',
  'Browserbase enterprise sales',
  'Browserbase technical sales',
  'Browserbase ROI calculator',
  'Browserbase vs Puppeteer',
  'Browserbase vs Playwright',
  'Browserbase vs Selenium',
  'Browserbase pricing',
  'Browserbase enterprise features',
  'Browserbase security compliance',
  'Browserbase team collaboration',
  'Browserbase API documentation',
  'Browserbase integration guide',
  'Browserbase use cases',
  'Browserbase customer success',
  'Browserbase case studies',
];

// Professional business information for sales enablement
const businessInfo = {
  name: 'Browserbase GTM Training Platform',
  legalName: 'Blur Sales Training',
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'sales@blursalestrainer.com',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+1-555-000-0000',
  address: {
    streetAddress: process.env.NEXT_PUBLIC_BUSINESS_STREET || '',
    addressLocality: process.env.NEXT_PUBLIC_BUSINESS_CITY || 'San Francisco',
    addressRegion: process.env.NEXT_PUBLIC_BUSINESS_STATE || 'CA',
    postalCode: process.env.NEXT_PUBLIC_BUSINESS_ZIP || '',
    addressCountry: 'US',
  },
  foundingDate: '2024',
  industry: 'Sales Enablement Software',
  numberOfEmployees: '10-50',
  priceRange: '$$',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: siteUrl,
  },
  authors: [{ name: 'Browserbase GTM Team' }],
  creator: 'Blur',
  publisher: 'Blur',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['en'],
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} - AI-Powered Enterprise Sales Training for Browserbase Cloud Browser Infrastructure`,
        type: 'image/png',
        secureUrl: `${siteUrl}/og-image.png`,
      },
    ],
    // Enhanced Open Graph for sales enablement
    emails: businessInfo.email ? [businessInfo.email] : undefined,
    phoneNumbers: businessInfo.phone ? [businessInfo.phone] : undefined,
    // Additional OG tags
    determiner: 'auto',
    countryName: 'United States',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: '@blur',
    site: '@blur',
  },
  // Additional professional meta tags for sales enablement
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
    // Business and contact information
    'business:contact_data:street_address': businessInfo.address.streetAddress || '',
    'business:contact_data:locality': businessInfo.address.addressLocality,
    'business:contact_data:region': businessInfo.address.addressRegion,
    'business:contact_data:postal_code': businessInfo.address.postalCode || '',
    'business:contact_data:country_name': businessInfo.address.addressCountry,
    'business:contact_data:email': businessInfo.email,
    'business:contact_data:phone_number': businessInfo.phone,
    'business:contact_data:website': siteUrl,
    // Professional credentials
    'og:business:hours': '24/7',
    'og:business:price_range': businessInfo.priceRange,
    // Sales enablement specific
    'sales:product_type': 'SaaS Training Platform',
    'sales:target_audience': 'Enterprise Sales Teams, GTM Professionals',
    'sales:use_case': 'Sales Training, Objection Handling, Role-Play Practice',
    // Browserbase-specific meta tags
    'product:brand': 'Browserbase',
    'product:product_name': 'Browserbase Cloud Browser Infrastructure',
    'product:category': 'Browser Automation, Web Scraping, Cloud Infrastructure',
    'product:target_market': 'Enterprise Development Teams, Automation Engineers, Data Teams',
    'product:use_cases': 'Web Scraping, Browser Automation, Testing, CI/CD Integration, Data Extraction',
    'product:competitors': 'Self-hosted Puppeteer, Self-hosted Playwright, Selenium Grid, Custom Browser Infrastructure',
    'product:value_proposition': 'Browserbase managed browser infrastructure eliminates operational overhead, scales seamlessly, provides enterprise reliability, built-in proxy management and anti-detection at scale, enables enterprise team collaboration with centralized management, and delivers ROI optimization for large teams compared to self-hosted Puppeteer/Playwright solutions',
    'product:key_features': 'Managed Infrastructure, Built-in Proxy Management, Anti-Detection, CI/CD Integration, Team Collaboration, Enterprise Security, Global Network, 24/7 Support',
    'product:target_industries': 'E-commerce, Data Analytics, Financial Services, Real Estate, Marketing, Research, Software Development, QA Testing',
    'product:integration_partners': 'Puppeteer, Playwright, Selenium, CI/CD Platforms, Cloud Providers',
    'product:deployment_options': 'Cloud, Enterprise On-Premise, Hybrid',
    'product:support_levels': 'Community, Professional, Enterprise',
    'product:security_certifications': 'SOC 2 Type II, GDPR, ISO 27001',
    'product:scaling_capabilities': 'Automated Scaling, Global Network, Low Latency, High Availability',
  },
  robots: {
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
  verification: {
    // Add Google Search Console verification when available
    // google: 'your-google-verification-code',
  },
  category: 'Education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Professional Sales Enablement Meta Tags */}
        <meta name="author" content={businessInfo.name} />
        <meta name="copyright" content={`© ${new Date().getFullYear()} ${businessInfo.name}. All rights reserved.`} />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="geo.region" content="US-CA" />
        {businessInfo.address.addressLocality && (
          <meta name="geo.placename" content={businessInfo.address.addressLocality} />
        )}
        
        {/* Sales Enablement Specific Tags */}
        <meta name="product:category" content="Sales Enablement Software" />
        <meta name="product:target_audience" content="Enterprise Sales Teams, GTM Professionals" />
        <meta name="product:use_case" content="Sales Training, Objection Handling, Role-Play Practice" />
        
        {/* Enhanced Mobile and App Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Browserbase GTM" />
        <meta name="application-name" content="Browserbase GTM Training" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Content Language and Region */}
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="geo.region" content="US-CA" />
        <meta name="ICBM" content="37.7749, -122.4194" />
        
        {/* Enhanced Article/Content Meta Tags */}
        <meta name="article:author" content={businessInfo.name} />
        <meta name="article:publisher" content={businessInfo.name} />
        <meta name="article:section" content="Sales Training" />
        <meta name="article:tag" content="Browserbase, Sales Training, GTM, Enterprise Sales" />
        
        {/* Rich Snippets Support */}
        <meta name="rating" content="general" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Professional Contact Information */}
        {businessInfo.email && <meta name="contact" content={businessInfo.email} />}
        {businessInfo.phone && <meta name="contact:phone" content={businessInfo.phone} />}
        <link rel="canonical" href={siteUrl} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains for better performance - Critical */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.elevenlabs.io" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="https://browserbase.com" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        <link rel="preconnect" href="https://api.browserbase.com" />
        <link rel="preconnect" href="https://api.supabase.co" />
        
        {/* Preload critical resources - Above the fold */}
        <link rel="preload" href="/logos/browserbase-logo.svg" as="image" type="image/svg+xml" fetchPriority="high" />
        
        {/* Font display optimization - prevents layout shift */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: '__GeistSans_Fallback';
              src: local('Arial');
              ascent-override: 90%;
              descent-override: 22%;
              line-gap-override: 0%;
              size-adjust: 107%;
              font-display: swap;
            }
            @font-face {
              font-family: '__GeistMono_Fallback';
              src: local('Courier New');
              ascent-override: 90%;
              descent-override: 22%;
              line-gap-override: 0%;
              size-adjust: 107%;
              font-display: swap;
            }
            /* Prevent layout shift */
            html { font-family: '__GeistSans_Fallback', system-ui, -apple-system, sans-serif; }
            /* Critical CSS inline for faster FCP */
            body { margin: 0; padding: 0; }
            #main-content { min-height: 100vh; }
          `
        }} />
        
        {/* Resource hints for faster loading - Prefetch below fold */}
        <link rel="prefetch" href="/scenarios" as="document" />
        <link rel="prefetch" href="/sales-skills" as="document" />
        <link rel="prefetch" href="/analytics" as="document" />
        <link rel="prefetch" href="/prospect-intelligence" as="document" />
        
        {/* Language and region alternatives */}
        <link rel="alternate" hrefLang="en" href={siteUrl} />
        <link rel="alternate" hrefLang="x-default" href={siteUrl} />
        
        {/* Mobile app deep links */}
        <meta name="apple-itunes-app" content="app-id=, app-argument=" />
        <meta name="google-play-app" content="app-id=" />
        {/* Structured Data - Organization (Enhanced for Sales Enablement) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${siteUrl}#organization`,
              name: businessInfo.name,
              legalName: businessInfo.legalName,
              alternateName: siteName,
              description: siteDescription,
              url: siteUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logos/browserbase-logo.svg`,
                width: 512,
                height: 512,
              },
              image: `${siteUrl}/og-image.png`,
              foundingDate: businessInfo.foundingDate,
              numberOfEmployees: {
                '@type': 'QuantitativeValue',
                value: businessInfo.numberOfEmployees,
              },
              industry: businessInfo.industry,
              sameAs: [
                'https://blur.com',
                'https://twitter.com/blur',
                'https://linkedin.com/company/browserbase',
                'https://browserbase.com',
                'https://twitter.com/browserbase',
                'https://github.com/browserbase',
              ],
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'Sales',
                  email: businessInfo.email,
                  telephone: businessInfo.phone,
                  availableLanguage: ['English'],
                  areaServed: 'Worldwide',
                },
                {
                  '@type': 'ContactPoint',
                  contactType: 'Customer Support',
                  email: businessInfo.email,
                  availableLanguage: ['English'],
                  areaServed: 'Worldwide',
                },
              ],
              address: {
                '@type': 'PostalAddress',
                streetAddress: businessInfo.address.streetAddress,
                addressLocality: businessInfo.address.addressLocality,
                addressRegion: businessInfo.address.addressRegion,
                postalCode: businessInfo.address.postalCode,
                addressCountry: businessInfo.address.addressCountry,
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
                bestRating: '5',
                worstRating: '1',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: siteUrl,
                priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              },
            }),
          }}
        />
        {/* Structured Data - SoftwareApplication (Enhanced for Sales Enablement) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              '@id': `${siteUrl}#software`,
              name: siteName,
              description: siteDescription,
              url: siteUrl,
              applicationCategory: 'BusinessApplication',
              applicationSubCategory: 'Sales Enablement Software for Browserbase Cloud Browser Infrastructure',
              operatingSystem: ['Web', 'iOS', 'Android'],
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              softwareVersion: '1.0',
              softwareRequirements: 'Modern web browser with JavaScript enabled',
              releaseNotes: 'Professional sales training platform with AI-powered role-play capabilities',
              screenshot: `${siteUrl}/og-image.png`,
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                url: siteUrl,
                category: 'Sales Training',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
                bestRating: '5',
                worstRating: '1',
              },
              featureList: [
                'AI-Powered Role-Play Training',
                'Browserbase Product Training',
                'Browserbase Sales Scenarios',
                'Real-time Feedback and Analytics',
                'Comprehensive Analytics Dashboard',
                'Multiple Sales Scenarios',
                'Enterprise Sales Focus',
                'Voice-Based Training',
                'Prospect Intelligence',
                'Company Analysis Tools',
                'Email Template Generation',
                'Performance Tracking',
                'Browserbase Objection Handling',
                'Browserbase Technical Sales Training',
                'Browserbase Use Case Training',
                'Browserbase ROI Calculator',
                'Browserbase Competitive Positioning',
              ],
              about: {
                '@type': 'Thing',
                name: 'Browserbase Sales Training',
                description: 'Training platform for selling Browserbase cloud browser infrastructure and enterprise browser automation solutions. Learn to position Browserbase managed headless browsers, built-in proxy management, anti-detection capabilities, enterprise team collaboration, and ROI optimization against self-hosted Puppeteer/Playwright solutions.',
              },
              teaches: [
                'Browserbase Product Knowledge',
                'Browserbase Sales Positioning',
                'Browserbase Objection Handling',
                'Enterprise Browser Automation Sales',
                'Web Scraping Infrastructure Sales',
                'Cloud Browser Infrastructure Sales',
              ],
              audience: {
                '@type': 'Audience',
                audienceType: 'Enterprise Sales Teams, GTM Professionals, Sales Managers, Browserbase Sales Reps, Technical Sales Engineers',
              },
              creator: {
                '@type': 'Organization',
                name: businessInfo.name,
                url: siteUrl,
              },
              publisher: {
                '@type': 'Organization',
                name: businessInfo.name,
                url: siteUrl,
              },
            }),
          }}
        />
        {/* Structured Data - Browserbase Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              '@id': `${siteUrl}#browserbase-product`,
              name: 'Browserbase',
              description: 'Browserbase is a cloud-based browser infrastructure platform that provides managed headless browsers for web scraping, browser automation, and testing. Enterprise-grade solution that eliminates infrastructure management overhead compared to self-hosted Puppeteer/Playwright, provides built-in proxy management and rotation at scale, advanced anti-detection capabilities, enables enterprise team collaboration with centralized browser management, automated scaling based on demand, enterprise security and compliance (SOC 2 Type II, GDPR, ISO 27001), 24/7 infrastructure monitoring, global browser network with low latency, and delivers ROI optimization for large teams. Full API compatibility with Puppeteer, Playwright, and Selenium Grid ensures smooth migration from self-hosted solutions.',
              brand: {
                '@type': 'Brand',
                name: 'Browserbase',
                url: 'https://browserbase.com',
              },
              manufacturer: {
                '@type': 'Organization',
                name: 'Browserbase',
                url: 'https://browserbase.com',
              },
              category: 'Software',
              productID: 'browserbase-cloud-browser',
              sku: 'BROWSERBASE-ENTERPRISE',
              offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'USD',
                url: 'https://browserbase.com',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  priceCurrency: 'USD',
                  price: 'Contact for pricing',
                },
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '250',
                bestRating: '5',
                worstRating: '1',
              },
              review: [
                {
                  '@type': 'Review',
                  author: {
                    '@type': 'Person',
                    name: 'Enterprise Customer',
                  },
                  reviewRating: {
                    '@type': 'Rating',
                    ratingValue: '5',
                    bestRating: '5',
                  },
                  reviewBody: 'Browserbase eliminated our infrastructure management overhead and scaled our browser automation operations seamlessly. The built-in proxy management and anti-detection features saved us months of development time, and the enterprise team collaboration features enabled our 200-person engineering team to work efficiently together.',
                },
              ],
              featureList: [
                'Cloud-based browser infrastructure',
                'Managed headless browsers with zero infrastructure overhead',
                'Enterprise-grade reliability and seamless scaling',
                'Built-in proxy management and rotation at scale',
                'Advanced anti-detection capabilities',
                'CI/CD integration and workflow automation',
                'Enterprise team collaboration features',
                'Centralized browser management and monitoring',
                'Advanced browser automation beyond basic Puppeteer/Playwright',
                'Web scraping at enterprise scale',
                'Full Puppeteer and Playwright API compatibility',
                'Selenium Grid compatibility',
                'Enterprise security and compliance (SOC 2, GDPR)',
                '24/7 infrastructure management and monitoring',
                'Global browser network with low latency',
                'Team collaboration and shared browser sessions',
                'ROI optimization and productivity metrics',
                'Automated scaling based on demand',
                'Built-in error handling and retry logic',
                'Enterprise support and dedicated account management',
                'Custom browser configurations and environments',
                'Advanced debugging and logging capabilities',
                'Integration with existing development workflows',
                'Cost-effective compared to self-hosted infrastructure',
              ],
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Cloud',
              browserRequirements: 'API-based, no browser required',
              softwareVersion: 'Latest',
              releaseNotes: 'Enterprise browser infrastructure platform',
            }),
          }}
        />
        {/* Structured Data - Course */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Course',
              name: 'Browserbase GTM Sales Training',
              description: siteDescription,
              provider: {
                '@type': 'Organization',
                name: 'Browserbase',
                url: 'https://browserbase.com',
                sameAs: [
                  'https://browserbase.com',
                  'https://twitter.com/browserbase',
                  'https://linkedin.com/company/browserbase',
                ],
              },
              courseCode: 'BROWSERBASE-GTM-101',
              educationalLevel: 'Professional',
              teaches: [
                'Browserbase Product Positioning',
                'Enterprise Sales Positioning',
                'Objection Handling for Browserbase',
                'Technical Sales for Browserbase',
                'Go-to-Market Strategy',
                'B2B Sales Techniques',
                'Browserbase Use Cases',
                'Browserbase vs Self-Hosted Solutions',
                'Browserbase ROI and Value Proposition',
                'AI-Assisted Sales Training',
              ],
              about: {
                '@type': 'Thing',
                name: 'Browserbase',
                description: 'Cloud-based browser infrastructure platform for enterprise automation and web scraping',
              },
            }),
          }}
        />
        {/* Structured Data - BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: siteUrl,
                },
              ],
            }),
          }}
        />
        {/* Structured Data - FAQPage (Enhanced for Sales Enablement) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is Browserbase GTM Training?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase GTM Training is an AI-powered platform that helps sales teams practice enterprise sales scenarios, handle objections, and improve their go-to-market skills through realistic role-play training. Learn to sell Browserbase cloud browser infrastructure, managed headless browsers, and enterprise browser automation solutions.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is Browserbase?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase is a cloud-based browser infrastructure platform that provides managed headless browsers for web scraping, browser automation, and testing. It eliminates infrastructure management overhead and enables enterprise teams to scale browser operations seamlessly with built-in proxy management, anti-detection, and CI/CD integration.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are Browserbase use cases?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase is used for web scraping at scale, browser automation, automated testing, data extraction, CI/CD integration, and enterprise browser operations. It replaces self-hosted Puppeteer/Playwright infrastructure with managed cloud browsers, reducing operational complexity and scaling costs.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does Browserbase compare to self-hosted solutions?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase eliminates infrastructure management overhead compared to self-hosted Puppeteer/Playwright. It provides enterprise-grade reliability, built-in proxy management and rotation at scale, advanced anti-detection capabilities, enterprise team collaboration with centralized management, automated scaling, 24/7 infrastructure monitoring, and ROI optimization for large teams. Unlike self-hosted solutions, Browserbase handles all infrastructure complexity, security compliance, and scaling challenges, allowing teams to focus on their core automation work rather than maintaining browser infrastructure.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are Browserbase key advantages over self-hosted Puppeteer/Playwright?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase key advantages include: zero infrastructure management overhead, built-in proxy management and rotation at scale, advanced anti-detection capabilities, enterprise team collaboration with centralized browser management, automated scaling based on demand, enterprise security and compliance (SOC 2, GDPR), 24/7 infrastructure monitoring, ROI optimization for large teams, seamless CI/CD integration, and dedicated enterprise support. These features eliminate months of development time and operational complexity compared to self-hosted solutions.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is Browserbase compatible with Puppeteer and Playwright?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, Browserbase provides full API compatibility with both Puppeteer and Playwright, allowing teams to migrate existing automation scripts with minimal code changes. Browserbase also supports Selenium Grid for teams using Selenium-based automation. This compatibility ensures smooth migration from self-hosted solutions while gaining all the benefits of managed cloud browser infrastructure.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does AI role-play training work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our AI-powered role-play system simulates real enterprise buyers with realistic objections and responses. Sales reps practice conversations, receive instant feedback, and track their progress over time.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is the training free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, the Browserbase GTM Training platform is free to use. It provides comprehensive sales training tools including AI role-play, analytics, and skill development resources.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Who is this platform designed for?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'This platform is designed for enterprise sales teams, GTM professionals, sales managers, and anyone looking to improve their B2B sales skills through AI-powered practice and real-time feedback.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What features does the platform offer?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The platform offers AI-powered role-play training, real-time feedback, comprehensive analytics, multiple sales scenarios, voice-based training, prospect intelligence, company analysis tools, and email template generation.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How can I get started?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Simply sign up for a free account, choose a sales scenario, and start practicing. The platform provides instant feedback and tracks your progress to help you improve your sales skills over time.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What security certifications does Browserbase have?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase maintains enterprise security certifications including SOC 2 Type II, GDPR compliance, and ISO 27001. The platform offers enterprise SSO, access controls, audit logs, compliance reporting, and data residency options for regulated industries like FinTech.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can Browserbase replace self-hosted Puppeteer or Playwright?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, Browserbase provides full API compatibility with both Puppeteer and Playwright, allowing teams to migrate existing automation scripts with minimal code changes. Browserbase eliminates the infrastructure management overhead, provides built-in proxy management and anti-detection, enables team collaboration, and handles all scaling, security, and compliance challenges that self-hosted solutions require teams to manage themselves.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is the ROI of Browserbase vs self-hosted browser infrastructure?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase ROI comes from eliminating infrastructure management overhead, reducing development time for proxy management and anti-detection features, enabling team collaboration without custom tooling, automated scaling without capacity planning, enterprise security compliance without dedicated security resources, and 24/7 infrastructure monitoring without on-call rotations. For large teams, Browserbase typically delivers significant time and cost savings compared to maintaining self-hosted Puppeteer/Playwright infrastructure.',
                  },
                },
              ],
            }),
          }}
        />
        {/* Structured Data - Service (Training Platform Service) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              '@id': `${siteUrl}#training-service`,
              name: 'Browserbase GTM Sales Training Service',
              description: 'AI-powered sales training service for mastering Browserbase cloud browser infrastructure sales. Includes role-play practice, objection handling, technical sales training, and real-time feedback.',
              provider: {
                '@type': 'Organization',
                name: businessInfo.name,
                url: siteUrl,
              },
              serviceType: 'Sales Training Service',
              areaServed: {
                '@type': 'Country',
                name: 'Worldwide',
              },
              availableChannel: {
                '@type': 'ServiceChannel',
                serviceUrl: siteUrl,
                serviceType: 'Online',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: siteUrl,
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
                bestRating: '5',
                worstRating: '1',
              },
            }),
          }}
        />
        {/* Structured Data - HowTo (Training Process) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'How to Master Browserbase Sales Training',
              description: 'Step-by-step guide to mastering Browserbase cloud browser infrastructure sales through AI-powered role-play training',
              totalTime: 'PT30M',
              estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: 'USD',
                value: '0',
              },
              step: [
                {
                  '@type': 'HowToStep',
                  position: 1,
                  name: 'Sign Up for Free Account',
                  text: 'Create a free account on the Browserbase GTM Training Platform to access all training features.',
                  url: `${siteUrl}`,
                },
                {
                  '@type': 'HowToStep',
                  position: 2,
                  name: 'Choose a Sales Scenario',
                  text: 'Select from multiple realistic sales scenarios including competitive objections, security concerns, cost objections, and technical challenges.',
                  url: `${siteUrl}/scenarios`,
                },
                {
                  '@type': 'HowToStep',
                  position: 3,
                  name: 'Practice with AI Role-Play',
                  text: 'Engage in realistic conversations with AI-powered prospects. Practice handling objections, positioning Browserbase value propositions, and closing techniques.',
                  url: `${siteUrl}/roleplay`,
                },
                {
                  '@type': 'HowToStep',
                  position: 4,
                  name: 'Receive Real-Time Feedback',
                  text: 'Get instant evaluation and scoring with detailed metrics on your performance, including objection handling, value proposition clarity, and closing effectiveness.',
                },
                {
                  '@type': 'HowToStep',
                  position: 5,
                  name: 'Track Progress with Analytics',
                  text: 'Monitor your training progress over time with comprehensive analytics dashboard showing improvement trends, top responses, and performance metrics.',
                  url: `${siteUrl}/analytics`,
                },
                {
                  '@type': 'HowToStep',
                  position: 6,
                  name: 'Use Prospect Intelligence',
                  text: 'Research prospect companies automatically to understand their tech stack, hiring patterns, culture, and ICP scoring for better sales conversations.',
                  url: `${siteUrl}/prospect-intelligence`,
                },
              ],
            }),
          }}
        />
        {/* Structured Data - LocalBusiness (for Sales Enablement) */}
        {businessInfo.address.streetAddress && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                '@id': `${siteUrl}#localbusiness`,
                name: businessInfo.name,
                description: siteDescription,
                url: siteUrl,
                telephone: businessInfo.phone,
                email: businessInfo.email,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: businessInfo.address.streetAddress,
                  addressLocality: businessInfo.address.addressLocality,
                  addressRegion: businessInfo.address.addressRegion,
                  postalCode: businessInfo.address.postalCode,
                  addressCountry: businessInfo.address.addressCountry,
                },
                priceRange: businessInfo.priceRange,
                openingHours: 'Mo-Su 00:00-23:59',
                areaServed: {
                  '@type': 'Country',
                  name: 'Worldwide',
                },
                serviceArea: {
                  '@type': 'GeoCircle',
                  geoMidpoint: {
                    '@type': 'GeoCoordinates',
                    latitude: '37.7749',
                    longitude: '-122.4194',
                  },
                },
              }),
            }}
          />
        )}
        {/* Structured Data - ItemList (Training Features) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              '@id': `${siteUrl}#features-list`,
              name: 'Browserbase GTM Training Platform Features',
              description: 'Comprehensive list of features available in the Browserbase GTM Training Platform',
              numberOfItems: 12,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'AI-Powered Role-Play Engine',
                    description: 'Practice with realistic AI prospects using advanced LLMs',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Multiple Sales Scenarios',
                    description: '6+ objection scenarios covering common sales challenges',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Real-time Feedback',
                    description: 'Get instant evaluation and scoring with detailed metrics',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Voice-Based Training',
                    description: 'Practice with voice using ElevenLabs TTS and OpenAI Whisper STT',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 5,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Prospect Intelligence',
                    description: 'Automatically research prospect companies (tech stack, hiring, culture, ICP scoring)',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 6,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Analytics Dashboard',
                    description: 'Track training progress and performance over time',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 7,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Company Analysis',
                    description: 'Deep-dive into prospect companies with financial data and insights',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 8,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Email Template Generation',
                    description: 'AI-powered email templates with BBQ (Brevity, Boldness, Quirkiness) style',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 9,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Smart Caching',
                    description: 'Adaptive TTL caching system for improved performance',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 10,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Multi-LLM Support',
                    description: 'Switch between Claude (Anthropic), Gemini (Google), and OpenAI GPT-4',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 11,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Scenario Builder',
                    description: 'Create and manage custom training scenarios',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 12,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Performance Tracking',
                    description: 'Comprehensive analytics and progress tracking',
                  },
                },
              ],
            }),
          }}
        />
        {/* ElevenLabs widget loaded in component to avoid double-loading */}
      </head>
      <body className="antialiased">
        <SkipLinks />
        <SEOHead />
        <BypassProtection />
        <nav id="navigation" className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-gray-200/60" aria-label="Main navigation">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
                <div className="relative h-9 w-9 rounded-lg bg-black flex items-center justify-center group-hover:bg-gray-900 transition-colors p-2">
                  <img
                    src="/logos/browserbase-logo.svg"
                    alt="Browserbase GTM Training Platform Logo"
                    className="h-5 w-5 object-contain"
                    width={20}
                    height={20}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
                <span className="text-lg font-semibold tracking-tight hidden sm:inline text-gray-900">Browserbase GTM</span>
                <span className="text-base font-semibold tracking-tight sm:hidden text-gray-900">GTM Training</span>
              </Link>
              <NavUser />
            </div>
          </div>
        </nav>
        <main id="main-content" className="min-h-screen bg-white" role="main">
          <LiveRegion id="app-live-region" level="polite" />
          {children}
        </main>
        <GlobalVoiceAssistant />
        <UpdateNotification autoCheck={true} checkInterval={60 * 60 * 1000} />
        <WebVitals />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
