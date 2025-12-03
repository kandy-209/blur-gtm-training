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
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cursorsalestrainer.com';
const siteName = 'Cursor Enterprise GTM Training Platform';
const siteDescription = 'Master Cursor Enterprise sales positioning and objection handling with AI-powered role-play training. Practice real sales scenarios, get instant feedback, track progress with analytics, and improve your enterprise sales skills.';
const siteKeywords = [
  'Cursor Enterprise',
  'GTM training',
  'sales training',
  'AI role-play',
  'enterprise sales',
  'objection handling',
  'sales enablement',
  'Cursor AI',
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
  authors: [{ name: 'Cursor GTM Team' }],
  creator: 'Cursor',
  publisher: 'Cursor',
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
    creator: '@cursor',
    site: '@cursor',
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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <link rel="canonical" href={siteUrl} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.elevenlabs.io" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logos/cursor-logo.svg" as="image" type="image/svg+xml" />
        
        {/* Resource hints for faster loading */}
        <link rel="prefetch" href="/scenarios" />
        <link rel="prefetch" href="/sales-skills" />
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
                'https://cursor.com',
                'https://twitter.com/cursor',
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
                  name: 'What is Cursor Enterprise GTM Training?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Cursor Enterprise GTM Training is an AI-powered platform that helps sales teams practice enterprise sales scenarios, handle objections, and improve their go-to-market skills through realistic role-play training.',
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
                    text: 'Yes, the Cursor Enterprise GTM Training platform is free to use. It provides comprehensive sales training tools including AI role-play, analytics, and skill development resources.',
                  },
                },
              ],
            }),
          }}
        />
        {/* ElevenLabs widget loaded in component to avoid double-loading */}
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <SkipLinks />
        <SEOHead />
        <BypassProtection />
        <nav id="navigation" className="sticky top-0 z-50 w-full glass-strong border-b border-gray-200/40" aria-label="Main navigation">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between relative">
              <Link href="/" className="flex items-center space-x-2 group flex-shrink-0 min-w-0">
                <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-black flex items-center justify-center group-hover:bg-gray-900 transition-all duration-300 p-1.5 sm:p-2 flex-shrink-0 shadow-glow hover:shadow-glow-lg hover:scale-105 gloss-overlay">
                  {/* Cursor Logo */}
                  <img
                    src="/logos/cursor-logo.svg"
                    alt="Cursor Logo"
                    className="h-5 w-5 sm:h-6 sm:w-6 object-contain max-w-full max-h-full relative z-10"
                    width={24}
                    height={24}
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight hidden sm:inline truncate text-gradient">Cursor Enterprise GTM</span>
                <span className="text-base font-semibold tracking-tight sm:hidden truncate text-gradient">GTM Training</span>
              </Link>
              <NavUser />
            </div>
          </div>
        </nav>
        <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50" role="main">
          <LiveRegion id="app-live-region" level="polite" />
          {children}
        </main>
        <GlobalVoiceAssistant />
        <WebVitals />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
