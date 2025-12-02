'use client';

import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BypassProtection from '@/components/BypassProtection';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-semibold tracking-tight">Cursor Enterprise GTM</span>
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

function NavUser() {
  const { user, isGuest, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div className="flex items-center space-x-1">
      <Link href="/scenarios">
        <Button variant="ghost" className="text-sm font-medium">Scenarios</Button>
      </Link>
      <Link href="/features">
        <Button variant="ghost" className="text-sm font-medium">Features</Button>
      </Link>
      <Link href="/chat">
        <Button variant="ghost" className="text-sm font-medium">Chat</Button>
      </Link>
      <Link href="/analytics">
        <Button variant="ghost" className="text-sm font-medium">Analytics</Button>
      </Link>
      <Link href="/live">
        <Button variant="ghost" className="text-sm font-medium">Live Role-Play</Button>
      </Link>
      <Link href="/leaderboard">
        <Button variant="ghost" className="text-sm font-medium">Leaderboard</Button>
      </Link>
      {user ? (
        <>
          <div className="px-3 py-1 text-sm text-muted-foreground">
            {isGuest ? (
              <span className="text-xs">Guest: {(user as any).username}</span>
            ) : (
              <span className="text-xs">{(user as any).email}</span>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="text-sm font-medium"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </>
      ) : (
        <Link href="/auth">
          <Button variant="ghost" className="text-sm font-medium">Sign In</Button>
        </Link>
      )}
      <Link href="/admin/scenarios">
        <Button variant="ghost" className="text-sm font-medium">Admin</Button>
      </Link>
    </div>
  );
}
