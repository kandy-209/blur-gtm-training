import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import BypassProtection from '@/components/BypassProtection';
import NavUser from '@/components/NavUser';
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
        {/* ElevenLabs widget loaded in component to avoid double-loading */}
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <BypassProtection />
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between relative">
              <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-lg sm:text-xl font-semibold tracking-tight hidden sm:inline">Cursor Enterprise GTM</span>
                <span className="text-lg font-semibold tracking-tight sm:hidden">GTM Training</span>
              </Link>
              <NavUser />
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50/50">
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
