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
const siteName = 'Blur Enterprise GTM Training Platform';
const siteDescription = 'Master Blur Enterprise sales positioning and objection handling with AI-powered role-play training. Practice real sales scenarios, get instant feedback, track progress with analytics, and improve your enterprise sales skills.';
const siteKeywords = [
  'Blur Enterprise',
  'GTM training',
  'sales training',
  'AI role-play',
  'enterprise sales',
  'objection handling',
  'sales enablement',
  'Blur AI',
  'sales positioning',
  'sales practice',
  'enterprise software sales',
  'B2B sales training',
  'AI sales coach',
  'sales skills development',
  'enterprise GTM',
  'go-to-market training',
];

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
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
  },
  authors: [{ name: 'Blur GTM Team' }],
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
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: '@blur',
    site: '@blur',
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
        <link rel="preload" href="/logos/cursor-logo.svg" as="image" type="image/svg+xml" fetchPriority="high" />
        
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
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: siteName,
              description: siteDescription,
              url: siteUrl,
              logo: `${siteUrl}/logos/cursor-logo.svg`,
              sameAs: [
                'https://blur.com',
                'https://twitter.com/blur',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: 'English',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: siteName,
              description: siteDescription,
              url: siteUrl,
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web',
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              softwareVersion: '1.0',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
              },
              featureList: [
                'AI-Powered Role-Play Training',
                'Real-time Feedback',
                'Analytics Dashboard',
                'Multiple Scenarios',
                'Enterprise Sales Focus',
              ],
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
              name: 'Blur Enterprise GTM Sales Training',
              description: siteDescription,
              provider: {
                '@type': 'Organization',
                name: 'Blur',
                url: 'https://blur.com',
              },
              courseCode: 'BLUR-GTM-101',
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
        {/* Structured Data - FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is Blur Enterprise GTM Training?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Blur Enterprise GTM Training is an AI-powered platform that helps sales teams practice enterprise sales scenarios, handle objections, and improve their go-to-market skills through realistic role-play training.',
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
                    text: 'Yes, the Blur Enterprise GTM Training platform is free to use. It provides comprehensive sales training tools including AI role-play, analytics, and skill development resources.',
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
                    src="/logos/cursor-logo.svg"
                    alt="Blur Enterprise GTM Training Platform Logo"
                    className="h-5 w-5 object-contain"
                    width={20}
                    height={20}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
                <span className="text-lg font-semibold tracking-tight hidden sm:inline text-gray-900">Blur Enterprise GTM</span>
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
