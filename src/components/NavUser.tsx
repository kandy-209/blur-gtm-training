'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function NavUser() {
  const { user, isGuest, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const navLinks = [
    { href: '/scenarios', label: 'Scenarios' },
    { href: '/features', label: 'Features' },
    { href: '/chat', label: 'Chat' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/live', label: 'Live Role-Play' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button variant="ghost" className="text-sm font-medium">{link.label}</Button>
          </Link>
        ))}
        {user ? (
          <>
            <div className="px-3 py-1 text-sm text-muted-foreground hidden lg:block">
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

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-40">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-xs text-muted-foreground">
                    {isGuest ? (
                      <span>Guest: {(user as any).username}</span>
                    ) : (
                      <span>{(user as any).email}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/admin/scenarios"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

