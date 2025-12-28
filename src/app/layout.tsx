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
const siteDescription = 'Master Browserbase sales positioning and objection handling with AI-powered role-play training. Practice real sales scenarios, get instant feedback, track progress with analytics, and improve your enterprise sales skills.';
const siteKeywords = [
  'Browserbase',
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
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} - AI-Powered Enterprise Sales Training`,
        type: 'image/png',
      },
    ],
    // Enhanced Open Graph for sales enablement
    emails: businessInfo.email ? [businessInfo.email] : undefined,
    phoneNumbers: businessInfo.phone ? [businessInfo.phone] : undefined,
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
              applicationSubCategory: 'Sales Enablement Software',
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
                'Real-time Feedback and Analytics',
                'Comprehensive Analytics Dashboard',
                'Multiple Sales Scenarios',
                'Enterprise Sales Focus',
                'Voice-Based Training',
                'Prospect Intelligence',
                'Company Analysis Tools',
                'Email Template Generation',
                'Performance Tracking',
              ],
              audience: {
                '@type': 'Audience',
                audienceType: 'Enterprise Sales Teams, GTM Professionals, Sales Managers',
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
              },
              courseCode: 'BROWSERBASE-GTM-101',
              educationalLevel: 'Professional',
              teaches: [
                'Enterprise Sales Positioning',
                'Objection Handling',
                'Go-to-Market Strategy',
                'B2B Sales Techniques',
                'AI-Assisted Sales Training',
              ],
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
                    text: 'Browserbase GTM Training is an AI-powered platform that helps sales teams practice enterprise sales scenarios, handle objections, and improve their go-to-market skills through realistic role-play training.',
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
