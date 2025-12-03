import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import BypassProtection from '@/components/BypassProtection';
import NavUser from '@/components/NavUser';
import GlobalVoiceAssistant from '@/components/GlobalVoiceAssistant';
import { SkipLinks } from '@/components/SkipLinks';
import { LiveRegion } from '@/components/ui/live-region';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cursorsalestrainer.com';
const siteName = 'Cursor Enterprise GTM Training';
const siteDescription = 'Master Cursor Enterprise sales positioning and objection handling with AI-powered role-play training, analytics, and comprehensive feature learning.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'Cursor Enterprise',
    'GTM training',
    'sales training',
    'AI role-play',
    'enterprise sales',
    'objection handling',
    'sales enablement',
    'Cursor AI',
    'sales positioning',
  ],
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
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: '@cursor',
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
  alternates: {
    canonical: siteUrl,
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
        {/* Structured Data */}
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
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
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
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
        {/* ElevenLabs widget loaded in component to avoid double-loading */}
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <SkipLinks />
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
