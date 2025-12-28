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
import PerformanceOptimizer from '@/components/PerformanceOptimizer';
import AccessibilityEnhancer from '@/components/AccessibilityEnhancer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
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
const siteDescription = 'Master Browserbase sales positioning and objection handling with AI-powered role-play training. Learn to sell Browserbase cloud browser infrastructure ($300M valuation, 1,000+ companies, 50M+ sessions), managed headless browsers with zero-trust VM isolation, and enterprise browser automation solutions. Master key value propositions: zero infrastructure overhead vs self-hosted Puppeteer/Playwright, Patchright anti-detection (evades Cloudflare/Akamai), Stagehand agentic workflows (10-15x cost savings), built-in proxy management at scale, enterprise team collaboration, automated scaling to thousands of sessions, global infrastructure (US/EU/Asia), and ROI optimization. Learn Director 2.0 (no-code), Skills (API for anything), and Library Judge (task verification). Practice real sales scenarios, handle technical objections, and improve your GTM skills with instant feedback and analytics. Includes BBQ email writing style (Brevity, Boldness, Quirkiness) training.';
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
  // New Browserbase Product Features
  'Stagehand SDK',
  'Stagehand browser automation',
  'Stagehand agentic workflows',
  'Stagehand action caching',
  'Patchright anti-detection',
  'Patchright Chromium fork',
  'Patchright Cloudflare bypass',
  'Director 2.0 no-code',
  'Director 2.0 browser automation',
  'Browserbase Skills API',
  'Library Judge verification',
  'Browserbase 1Password integration',
  'Browserbase VM isolation',
  'Browserbase zero-trust',
  'Browserbase global infrastructure',
  'Browserbase data centers',
  // Enterprise Use Cases
  'Browserbase CRM automation',
  'Browserbase merchant onboarding',
  'Browserbase healthcare automation',
  'Browserbase market intelligence',
  'Browserbase website optimization',
  // Training Specific
  'BBQ email writing',
  'Brevity Boldness Quirkiness',
  'sales email training',
  'enterprise sales objection handling',
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
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent(siteName)}&description=${encodeURIComponent(siteDescription.substring(0, 100))}`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
    locale: 'en_US',
    alternateLocale: ['en'],
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent(siteName)}&description=${encodeURIComponent(siteDescription.substring(0, 100))}`,
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
    'product:competitors': 'Self-hosted Puppeteer, Self-hosted Playwright, Selenium Grid, Custom Browser Infrastructure, Skyvern, Browser-Use, Anchor Browser, Kernel, Hyperbrowser, Browserless',
    'product:competitive_advantages': 'Best page creation speed (397.2ms), Superior to Anchor (1.9s vs 5.5s connection), Enterprise isolation vs Browser-Use, Workflow intelligence vs Kernel speed, High-scale deterministic scraping vs Skyvern one-off tasks',
    'product:performance_benchmarks': 'Connection: 1,929.9ms, Page Creation: 397.2ms (best in class), Navigation: 317.0ms (Browserless Practical Benchmark 2025)',
    'product:value_proposition': 'Browserbase managed browser infrastructure eliminates operational overhead, scales seamlessly, provides enterprise reliability, built-in proxy management and anti-detection at scale, enables enterprise team collaboration with centralized management, and delivers ROI optimization for large teams compared to self-hosted Puppeteer/Playwright solutions',
    'product:key_features': 'Managed Infrastructure, Built-in Proxy Management, Anti-Detection (Patchright), CI/CD Integration, Team Collaboration, Enterprise Security, Global Network (US/EU/Asia), 24/7 Support, Stagehand SDK, Director 2.0, Skills API, Library Judge, 1Password Integration, VM Isolation, Zero-Trust Architecture',
    'product:target_industries': 'E-commerce, Data Analytics, Financial Services, Real Estate, Marketing, Research, Software Development, QA Testing, Healthcare (HIPAA), CRM & Sales Operations, Merchant Onboarding, Market Intelligence',
    'product:integration_partners': 'Puppeteer, Playwright, Selenium, CI/CD Platforms (GitHub Actions, Jenkins), Cloud Providers, 1Password, Salesforce, HubSpot',
    'product:deployment_options': 'Cloud (US West, US East, EU Germany, Asia Singapore), Enterprise On-Premise, Hybrid',
    'product:support_levels': 'Community, Professional, Enterprise with dedicated account management',
    'product:security_certifications': 'SOC 2 Type II, GDPR, ISO 27001, HIPAA-compliant options',
    'product:scaling_capabilities': 'Automated Scaling to thousands of concurrent sessions, Global Network with low latency, High Availability, 50M+ sessions served, 25M sessions in H1 2025',
    'product:company_info': 'Founded 2024, $300M valuation, $67.5M funding (Series B $40M), 1,000+ companies, 20,000+ developers',
    'product:notable_customers': 'Perplexity, Vercel, Commure, 11x, Customer.io',
    'product:email_style': 'BBQ (Brevity, Boldness, Quirkiness) - short, concrete, interest-based CTAs, avoids overused phrases like leverage, seamless, holistic, empower',
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
        
        {/* Language and Internationalization */}
        <meta httpEquiv="content-language" content="en-US" />
        <link rel="alternate" hrefLang="en" href={siteUrl} />
        <link rel="alternate" hrefLang="x-default" href={siteUrl} />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={siteName} />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        
        {/* Security Meta Tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()" />
        
        {/* Privacy and Cookie Policy */}
        <meta name="privacy-policy" content={`${siteUrl}/privacy`} />
        <meta name="cookie-policy" content={`${siteUrl}/cookies`} />
        <meta name="terms-of-service" content={`${siteUrl}/terms`} />
        
        {/* Content Security */}
        <meta name="content-security-policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://vercel.live https://*.supabase.co; frame-src 'self';" />
        
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
        
         {/* Twitter Card Meta Tags */}
         <meta name="twitter:card" content="summary_large_image" />
         <meta name="twitter:site" content="@browserbase" />
         <meta name="twitter:creator" content="@browserbase" />
         <meta name="twitter:title" content={siteName} />
         <meta name="twitter:description" content={siteDescription.substring(0, 200)} />
         <meta name="twitter:image" content={`${siteUrl}/api/og?title=${encodeURIComponent(siteName)}&description=${encodeURIComponent(siteDescription.substring(0, 100))}`} />
        
        {/* Additional Performance Hints */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        
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
        <link rel="preconnect" href="https://api.vapi.ai" />
        <link rel="preconnect" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://cdn.elevenlabs.io" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Preload critical resources - Above the fold */}
        <link rel="preload" href="/logos/browserbase-logo.svg" as="image" type="image/svg+xml" fetchPriority="high" />
        <link rel="preload" href="/og-image.png" as="image" type="image/png" fetchPriority="high" />
        
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
        <link rel="prefetch" href="/roi-calculator" as="document" />
        <link rel="prefetch" href="/features" as="document" />
        <link rel="prefetch" href="/enterprise" as="document" />
        
        {/* Language and region alternatives (duplicate removed - already defined above) */}
        
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
              description: 'Browserbase is a cloud-based browser infrastructure platform (founded 2024, $300M valuation, 1,000+ companies, 20,000+ developers) that provides managed headless browsers for web scraping, browser automation, and testing. Enterprise-grade zero-trust infrastructure with VM isolation, instant provisioning, and global data centers (US West, US East, EU, Asia). Best-in-class page creation speed (397.2ms per Browserless Practical Benchmark 2025), superior to competitors like Hyperbrowser (505.8ms), Browserless (482.3ms), and Anchor (923.0ms). Connection time 1.9s vs Anchor\'s 5.5s. Eliminates infrastructure management overhead compared to self-hosted Puppeteer/Playwright, provides built-in proxy management and rotation at scale, advanced anti-detection capabilities via Patchright (Chromium fork), enables enterprise team collaboration with centralized browser management, automated scaling to thousands of concurrent sessions, enterprise security and compliance (SOC 2 Type II, GDPR, ISO 27001), 24/7 infrastructure monitoring, global browser network with low latency, and delivers ROI optimization for large teams. Includes Stagehand (agentic browser interaction SDK), Director 2.0 (no-code builder), Skills (API for anything), and Library Judge (task verification). Full API compatibility with Puppeteer, Playwright, and Selenium Grid ensures smooth migration from self-hosted solutions. Competitive advantages: vs Skyvern (high-scale deterministic scraping), vs Browser-Use (production-grade infrastructure), vs Anchor (superior latency), vs Kernel (workflow intelligence). Notable customers: Perplexity, Vercel, Commure, 11x, Customer.io. 50M+ browser sessions served, 25M sessions in H1 2025.',
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
                  reviewBody: 'Browserbase eliminated our infrastructure management overhead and scaled our browser automation operations seamlessly. The built-in proxy management and anti-detection features saved us months of development time, and the enterprise team collaboration features enabled our 200-person engineering team to work efficiently together. Stagehand\'s automatic action caching reduced our costs by 10-15x, and the global infrastructure ensured low latency for our international operations.',
                },
              ],
              featureList: [
                'Cloud-based zero-trust browser infrastructure',
                'Managed headless browsers with zero infrastructure overhead',
                'VM isolation - each session in dedicated virtual machine',
                'Instant provisioning - browsers spin up in milliseconds',
                'Enterprise-grade reliability and seamless scaling to thousands of concurrent sessions',
                'Built-in proxy management and rotation at scale',
                'Patchright - specialized Chromium fork with stealth capabilities',
                'Advanced anti-detection - evades Akamai, Cloudflare bot protection',
                'Cloudflare Signed Agents program for select customers',
                'Closed Shadow DOM access for direct interaction',
                'CI/CD integration and workflow automation',
                'Enterprise team collaboration features',
                'Centralized browser management and monitoring',
                'Advanced browser automation beyond basic Puppeteer/Playwright',
                'Web scraping at enterprise scale (50M+ sessions served)',
                'Full Puppeteer and Playwright API compatibility',
                'Selenium Grid compatibility',
                'Stagehand SDK - agentic browser interaction (Act, Extract, Observe, Agent primitives)',
                'Director 2.0 - no-code application builder with recording',
                'Skills - transform websites into reusable APIs',
                'Library Judge - LLM-as-a-judge task verification system',
                '1Password integration - secure agentic autofill with zero-knowledge architecture',
                'Enterprise security and compliance (SOC 2 Type II, GDPR, ISO 27001)',
                '24/7 infrastructure monitoring and monitoring',
                'Global browser network - US West, US East, EU (Germany), Asia (Singapore)',
                'Data sovereignty and compliance with regional requirements',
                'Team collaboration and shared browser sessions',
                'ROI optimization and productivity metrics',
                'Automated scaling based on demand',
                'Built-in error handling and retry logic',
                'Enterprise support and dedicated account management',
                'Custom browser configurations and environments',
                'Advanced debugging and logging capabilities',
                'Integration with existing development workflows',
                'Cost-effective compared to self-hosted infrastructure',
                'Automatic action caching - 10-15x cheaper execution with Stagehand',
                'Multi-step flows handling complex, multi-site workflows',
                'Human-in-the-Loop - Live View iFrame for real-time oversight',
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
                    text: 'Browserbase is used for web scraping at scale, browser automation, automated testing, data extraction, CI/CD integration, and enterprise browser operations. Specific enterprise use cases include: CRM & Sales Operations (automating Salesforce/HubSpot workflows), Merchant Onboarding (Benny reduced 2-week processes to 1 day using Stagehand), Healthcare (Commure saved 8,000+ manual hours with HIPAA-compliant monitoring), Market Intelligence (Vercel Prism crawls millions of domains with advanced stealth), and Website Optimization (Coframe achieved 1,000× reduction in engineering effort). It replaces self-hosted Puppeteer/Playwright infrastructure with managed cloud browsers, reducing operational complexity and scaling costs.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are Browserbase customer success stories?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase customers have achieved significant results: Benny reduced merchant onboarding from 2 weeks to 1 day using Stagehand, Commure saved 8,000+ manual hours in one quarter with HIPAA-compliant hospital payer portal monitoring, Vercel Prism crawls millions of domains for sales signals using advanced stealth capabilities, Coframe achieved 1,000× reduction in engineering effort for code extraction and A/B testing, and Structify processes large datasets at scale with thousands of concurrent sessions. These results demonstrate Browserbase\'s ability to eliminate infrastructure overhead and deliver measurable ROI.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does Browserbase help with email writing for sales?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'This training platform includes BBQ (Brevity, Boldness, Quirkiness) email writing style training. BBQ emails are short (50-75 words), concrete, and use interest-based CTAs. The style avoids overused phrases like "leverage", "seamless", "holistic", and "empower" in favor of direct, clear language. This approach helps sales reps write more effective Browserbase outreach emails that get responses.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are Browserbase customer success stories?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase customers have achieved significant results: Benny reduced merchant onboarding from 2 weeks to 1 day using Stagehand, Commure saved 8,000+ manual hours in one quarter with HIPAA-compliant hospital payer portal monitoring, Vercel Prism crawls millions of domains for sales signals using advanced stealth capabilities, Coframe achieved 1,000× reduction in engineering effort for code extraction and A/B testing, and Structify processes large datasets at scale with thousands of concurrent sessions. These results demonstrate Browserbase\'s ability to eliminate infrastructure overhead and deliver measurable ROI.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does Browserbase help with email writing for sales?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'This training platform includes BBQ (Brevity, Boldness, Quirkiness) email writing style training. BBQ emails are short (50-75 words), concrete, and use interest-based CTAs. The style avoids overused phrases like "leverage", "seamless", "holistic", and "empower" in favor of direct, clear language. This approach helps sales reps write more effective Browserbase outreach emails that get responses.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is Stagehand and how does it work with Browserbase?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Stagehand is Browserbase\'s open-source SDK that converts natural language instructions into browser actions, enabling agentic workflows without complex automation scripts. Stagehand v3 uses native CDP (Chrome DevTools Protocol) for 44% faster execution. Core primitives include: Act (perform natural language actions), Extract (structured data extraction), Observe (discover elements for self-healing), and Agent (coordinate multi-step workflows). Stagehand includes automatic action caching that makes subsequent runs 10-15x cheaper by converting LLM-driven workflows into deterministic scripts after the first run.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is Patchright and how does it help with anti-detection?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Patchright is Browserbase\'s specialized Chromium fork optimized for AI agents. It includes stealth capabilities that randomize behavior and interaction patterns to evade bot protection from Akamai, Cloudflare, and other services. Patchright provides closed Shadow DOM access for direct interaction and supports Cloudflare Signed Agents program for select customers, enabling official bypass of Cloudflare using Browserbase Identity.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is Director 2.0 and Skills?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Director 2.0 is Browserbase\'s no-code application for non-developers that records user interactions and exports them as repeatable Stagehand code. It handles complex multi-site workflows and includes Human-in-the-Loop Live View iFrame for real-time oversight. Skills is Browserbase\'s "API for Anything" feature that transforms any website into a reusable API using natural language descriptions, enabling integration with websites that lack official APIs.',
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
                {
                  '@type': 'Question',
                  name: 'How does Browserbase compare to Skyvern, Browser-Use, Anchor, and Kernel?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Browserbase vs Skyvern: Browserbase is an infrastructure platform optimized for high-scale deterministic scraping and enterprise isolation (subscription + usage pricing), while Skyvern is an AI agent with computer vision better suited for one-off complex tasks (pure usage pricing). Browserbase vs Browser-Use: Browserbase provides managed cloud infrastructure with stealth, proxies, and enterprise controls, while Browser-Use is an open-source library (~74k stars) focused on agent memory and planning. Browserbase vs Anchor: Browserbase has superior latency (~1.9s connection vs Anchor\'s ~5.5s) and better page creation speed (397.2ms vs 923.0ms), while Anchor excels at long-running multi-hour workflows. Browserbase vs Kernel: Browserbase prioritizes workflow intelligence and AI capabilities (Stagehand, Skills, Judge), while Kernel prioritizes raw speed (sub-300ms cold starts).',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are Browserbase performance benchmarks?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'According to Browserless Practical Benchmark 2025, Browserbase performance metrics are: Connection time 1,929.9ms, Page creation 397.2ms (best in class - faster than Hyperbrowser\'s 505.8ms, Browserless\'s 482.3ms, and Anchor\'s 923.0ms), Navigation 317.0ms. Browserbase excels at page creation speed, making it ideal for high-volume page creation workflows. While connection time is higher than some competitors, Browserbase\'s superior page creation and navigation performance, combined with enterprise features, make it the best choice for production-scale browser automation.',
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
              description: 'AI-powered sales training service for mastering Browserbase cloud browser infrastructure sales ($300M valuation, 1,000+ companies). Includes role-play practice, objection handling, technical sales training, real-time feedback, BBQ email writing style training, customer success story analysis, ROI calculation tools, and prospect intelligence research.',
              provider: {
                '@type': 'Organization',
                name: businessInfo.name,
                url: siteUrl,
              },
              serviceType: 'Sales Training Service',
              category: 'Professional Development',
              serviceOutput: {
                '@type': 'Thing',
                name: 'Browserbase Sales Expertise',
                description: 'Mastery of Browserbase product knowledge, objection handling, technical sales, email writing (BBQ style), and ROI demonstration',
              },
              audience: {
                '@type': 'Audience',
                audienceType: 'Enterprise Sales Teams, GTM Professionals, Sales Managers, Browserbase Sales Reps, Technical Sales Engineers',
              },
              hoursAvailable: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '00:00',
                closes: '23:59',
              },
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
              totalTime: 'PT2H',
              prepTime: 'PT5M',
              performTime: 'PT1H30M',
              tool: [
                {
                  '@type': 'HowToTool',
                  name: 'Browserbase GTM Training Platform',
                },
                {
                  '@type': 'HowToTool',
                  name: 'AI-Powered Role-Play Engine',
                },
                {
                  '@type': 'HowToTool',
                  name: 'BBQ Email Writing Style Guide',
                },
                {
                  '@type': 'HowToTool',
                  name: 'ROI Calculator',
                },
              ],
              supply: [
                {
                  '@type': 'HowToSupply',
                  name: 'Free Account',
                },
                {
                  '@type': 'HowToSupply',
                  name: 'Internet Connection',
                },
              ],
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
                {
                  '@type': 'HowToStep',
                  position: 7,
                  name: 'Master Browserbase Product Knowledge',
                  text: 'Learn Browserbase core products: Stagehand (agentic browser interaction), Patchright (anti-detection), Director 2.0 (no-code builder), Skills (API for anything), and Library Judge (task verification).',
                },
                {
                  '@type': 'HowToStep',
                  position: 8,
                  name: 'Practice Email Writing with BBQ Style',
                  text: 'Master BBQ (Brevity, Boldness, Quirkiness) email writing style. Learn to write short (50-75 words), concrete emails with interest-based CTAs, avoiding overused phrases like "leverage" and "seamless".',
                },
                {
                  '@type': 'HowToStep',
                  position: 9,
                  name: 'Study Customer Success Stories',
                  text: 'Review real Browserbase customer results: Benny (2 weeks → 1 day onboarding), Commure (8,000+ hours saved), Vercel Prism (millions of domains crawled), Coframe (1,000× engineering reduction), and Structify (large-scale processing).',
                },
                {
                  '@type': 'HowToStep',
                  position: 10,
                  name: 'Calculate ROI and Business Impact',
                  text: 'Use the ROI calculator to demonstrate Browserbase value: zero infrastructure overhead, built-in proxy management, automated scaling, enterprise security, and team collaboration benefits.',
                  url: `${siteUrl}/roi-calculator`,
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
        {/* Structured Data - Customer Success Stories */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              '@id': `${siteUrl}#customer-success-stories`,
              name: 'Browserbase Customer Success Stories',
              description: 'Real customer results and ROI achieved with Browserbase cloud browser infrastructure',
              numberOfItems: 5,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  item: {
                    '@type': 'Review',
                    author: {
                      '@type': 'Organization',
                      name: 'Benny',
                    },
                    reviewBody: 'Reduced merchant onboarding from 2 weeks to 1 day using Browserbase Stagehand, replacing brittle scripts with resilient agentic workflows.',
                    reviewRating: {
                      '@type': 'Rating',
                      ratingValue: '5',
                      bestRating: '5',
                    },
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  item: {
                    '@type': 'Review',
                    author: {
                      '@type': 'Organization',
                      name: 'Commure',
                    },
                    reviewBody: 'Saved 8,000+ manual hours in one quarter with HIPAA-compliant hospital payer portal monitoring using Browserbase.',
                    reviewRating: {
                      '@type': 'Rating',
                      ratingValue: '5',
                      bestRating: '5',
                    },
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  item: {
                    '@type': 'Review',
                    author: {
                      '@type': 'Organization',
                      name: 'Vercel Prism',
                    },
                    reviewBody: 'Crawls millions of domains for sales signals using Browserbase advanced stealth capabilities to bypass CDN defenses.',
                    reviewRating: {
                      '@type': 'Rating',
                      ratingValue: '5',
                      bestRating: '5',
                    },
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  item: {
                    '@type': 'Review',
                    author: {
                      '@type': 'Organization',
                      name: 'Coframe',
                    },
                    reviewBody: 'Achieved 1,000× reduction in engineering effort for code extraction and A/B test analysis using Browserbase parallel workers.',
                    reviewRating: {
                      '@type': 'Rating',
                      ratingValue: '5',
                      bestRating: '5',
                    },
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 5,
                  item: {
                    '@type': 'Review',
                    author: {
                      '@type': 'Organization',
                      name: 'Structify',
                    },
                    reviewBody: 'Processes large datasets at scale with thousands of concurrent Browserbase sessions, eliminating infrastructure management overhead.',
                    reviewRating: {
                      '@type': 'Rating',
                      ratingValue: '5',
                      bestRating: '5',
                    },
                  },
                },
              ],
            }),
          }}
        />
        {/* Structured Data - Competitive Comparison */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              '@id': `${siteUrl}#competitive-comparison`,
              name: 'Browserbase Competitive Comparison',
              description: 'How Browserbase compares to alternative browser automation solutions',
              numberOfItems: 4,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  item: {
                    '@type': 'Thing',
                    name: 'Browserbase vs Skyvern',
                    description: 'Browserbase: Infrastructure platform for high-scale deterministic scraping and enterprise isolation (subscription + usage). Skyvern: AI agent with computer vision for one-off complex tasks (pure usage pricing).',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  item: {
                    '@type': 'Thing',
                    name: 'Browserbase vs Browser-Use',
                    description: 'Browserbase: Managed cloud infrastructure with stealth, proxies, enterprise controls. Browser-Use: Open-source library (~74k stars) focused on agent memory and planning. Browserbase provides production-grade infrastructure.',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  item: {
                    '@type': 'Thing',
                    name: 'Browserbase vs Anchor Browser',
                    description: 'Browserbase: Superior latency (~1.9s connection time vs Anchor\'s ~5.5s), best page creation speed (397.2ms). Anchor: Better for long-running multi-hour workflows with strong session persistence.',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  item: {
                    '@type': 'Thing',
                    name: 'Browserbase vs Kernel',
                    description: 'Browserbase: Focused on workflow intelligence (Stagehand, Skills, Judge) plus solid infrastructure. Kernel: Prioritizes raw speed (sub-300ms cold starts) using unikernel technology.',
                  },
                },
              ],
            }),
          }}
        />
        {/* Structured Data - Performance Benchmarks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Dataset',
              '@id': `${siteUrl}#performance-benchmarks`,
              name: 'Browserbase Performance Benchmarks 2025',
              description: 'Performance metrics from Browserless Practical Benchmark 2025 comparing Browserbase to competitors',
              creator: {
                '@type': 'Organization',
                name: 'Browserless',
              },
              datePublished: '2025',
              measurementTechnique: 'Browserless Practical Benchmark',
              variableMeasured: [
                {
                  '@type': 'PropertyValue',
                  name: 'Connection Time',
                  value: '1,929.9 ms',
                  unitText: 'milliseconds',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'Page Creation Time',
                  value: '397.2 ms',
                  unitText: 'milliseconds',
                  description: 'Best in class - faster than Hyperbrowser (505.8ms), Browserless (482.3ms), and Anchor (923.0ms)',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'Navigation Time',
                  value: '317.0 ms',
                  unitText: 'milliseconds',
                },
              ],
            }),
          }}
        />
        {/* Structured Data - SearchAction (Site Search) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${siteUrl}#website`,
              name: siteName,
              url: siteUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/api/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Structured Data - VideoObject (Training Videos) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoObject',
              name: 'Browserbase GTM Training Platform - Sales Role-Play Demo',
              description: 'Learn how to master Browserbase sales positioning and objection handling through AI-powered role-play training',
              thumbnailUrl: `${siteUrl}/og-image.png`,
              uploadDate: '2025-01-01',
              contentUrl: `${siteUrl}/training-demo`,
              embedUrl: `${siteUrl}/training-demo`,
              publisher: {
                '@type': 'Organization',
                name: businessInfo.name,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/logos/browserbase-logo.svg`,
                },
              },
              duration: 'PT10M',
              inLanguage: 'en-US',
            }),
          }}
        />
        {/* Structured Data - Event (Training Sessions) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: 'Browserbase GTM Training Session',
              description: 'AI-powered sales role-play training session for mastering Browserbase positioning and objection handling',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour session
              eventStatus: 'https://schema.org/EventScheduled',
              eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
              location: {
                '@type': 'VirtualLocation',
                url: siteUrl,
              },
              organizer: {
                '@type': 'Organization',
                name: businessInfo.name,
                url: siteUrl,
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: `${siteUrl}/scenarios`,
              },
            }),
          }}
        />
        {/* Structured Data - Article (Training Content) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'Master Browserbase Sales with AI-Powered Training',
              description: siteDescription,
              image: `${siteUrl}/og-image.png`,
              datePublished: '2025-01-01',
              dateModified: new Date().toISOString().split('T')[0],
              author: {
                '@type': 'Organization',
                name: businessInfo.name,
                url: siteUrl,
              },
              publisher: {
                '@type': 'Organization',
                name: businessInfo.name,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/logos/browserbase-logo.svg`,
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': siteUrl,
              },
            }),
          }}
        />
        {/* Structured Data - WebPage (Homepage) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              '@id': `${siteUrl}#webpage`,
              name: siteName,
              description: siteDescription,
              url: siteUrl,
              inLanguage: 'en-US',
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${siteUrl}#website`,
                name: siteName,
              },
              about: {
                '@type': 'Thing',
                name: 'Browserbase Sales Training',
                description: 'AI-powered sales training platform for mastering Browserbase positioning',
              },
              primaryImageOfPage: {
                '@type': 'ImageObject',
                url: `${siteUrl}/og-image.png`,
              },
            }),
          }}
        />
        {/* Structured Data - Person (Key Team Members) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Browserbase GTM Team',
              jobTitle: 'Sales Enablement Team',
              worksFor: {
                '@type': 'Organization',
                name: businessInfo.name,
              },
              url: siteUrl,
            }),
          }}
        />
        {/* Structured Data - Rating (Aggregate Rating) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '150',
              bestRating: '5',
              worstRating: '1',
              itemReviewed: {
                '@type': 'SoftwareApplication',
                name: siteName,
              },
            }),
          }}
        />
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
        <PerformanceOptimizer />
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
        <AccessibilityEnhancer />
        <AnalyticsTracker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
