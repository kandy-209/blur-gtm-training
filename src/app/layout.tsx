import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import BypassProtection from '@/components/BypassProtection';
import NavUser from '@/components/NavUser';
import GlobalVoiceAssistant from '@/components/GlobalVoiceAssistant';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        {/* ElevenLabs widget loaded in component to avoid double-loading */}
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <BypassProtection />
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between relative">
              <Link href="/" className="flex items-center space-x-2 group flex-shrink-0 min-w-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-black flex items-center justify-center group-hover:bg-gray-900 transition-colors p-1.5 sm:p-2 flex-shrink-0">
                  {/* Cursor Logo */}
                  <img
                    src="/logos/cursor-logo.svg"
                    alt="Cursor Logo"
                    className="h-5 w-5 sm:h-6 sm:w-6 object-contain max-w-full max-h-full"
                    width={24}
                    height={24}
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight hidden sm:inline truncate">Cursor Enterprise GTM</span>
                <span className="text-base font-semibold tracking-tight sm:hidden truncate">GTM Training</span>
              </Link>
              <NavUser />
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50/50">
          {children}
        </main>
        <GlobalVoiceAssistant />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
