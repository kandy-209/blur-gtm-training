'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires real auth (not guest)
}

export default function ProtectedRoute({ children, requireAuth = false }: ProtectedRouteProps) {
  const { user, loading, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
    } else if (!loading && requireAuth && isGuest) {
      // If this route requires real auth but user is a guest, redirect to signup
      router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname) + '&requireAuth=true');
    }
  }, [user, loading, router, requireAuth, isGuest]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requireAuth && isGuest) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

