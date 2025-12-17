'use client';

import { useState, useEffect } from 'react';
// Use type-only import to prevent runtime evaluation
import type { User } from '@supabase/supabase-js';
// Use dynamic import to prevent HMR issues - don't import auth module at top level
import { trackAuthEvent } from '@/lib/vercel-analytics';

export interface GuestUser {
  id: string;
  email: string;
  username: string;
  roleAtCursor: string;
  isGuest: true;
}

export type AuthUser = User | GuestUser;

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // #region agent log
    // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
    // #endregion
    // Check for guest user first
    const checkGuestUser = () => {
      if (typeof window === 'undefined') return null;
      const guestData = localStorage.getItem('guest_user');
      if (guestData) {
        try {
          return JSON.parse(guestData) as GuestUser;
        } catch {
          return null;
        }
      }
      return null;
    };

    // Check initial session
    const checkSession = async () => {
      // #region agent log
      // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
      // #endregion
      // Check guest user first
      const guestUser = checkGuestUser();
      if (guestUser) {
        setUser(guestUser);
        setLoading(false);
        return;
      }

      // Dynamically import auth module to prevent HMR issues
      try {
        // #region agent log
        // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
        // #endregion
        const authModule = await import('@/lib/auth');
        const getSupabaseAsync = authModule?.getSupabaseAsync;
        
        if (!getSupabaseAsync || typeof getSupabaseAsync !== 'function') {
          console.error('getSupabaseAsync is not available from auth module');
          setLoading(false);
          return;
        }
        
        // #region agent log
        // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
        // #endregion
        const supabase = await getSupabaseAsync();
        
        if (!supabase) {
          setLoading(false);
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
        } catch (error) {
          console.error('Error checking session:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        // #region agent log
        // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
        // #endregion
        console.error('Error loading auth module:', error);
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes (async initialization on client)
    let subscription: { unsubscribe: () => void } | null = null;
    
    const setupAuthListener = async () => {
      // #region agent log
      // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
      // #endregion
      try {
        // Dynamically import auth module to prevent HMR issues
        const authModule = await import('@/lib/auth');
        const getSupabaseAsync = authModule?.getSupabaseAsync;
        
        if (!getSupabaseAsync || typeof getSupabaseAsync !== 'function') {
          console.error('getSupabaseAsync is not available from auth module');
          return;
        }
        
        const supabaseClient = await getSupabaseAsync();
        
        if (supabaseClient) {
          const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
            // If user signs in, clear guest user
            if (session?.user) {
              localStorage.removeItem('guest_user');
              setUser(session.user);
              if (event === 'SIGNED_IN') {
                trackAuthEvent('sign_in', { userId: session.user.id });
              }
            } else {
              // Check if guest user exists
              const guestUser = checkGuestUser();
              setUser(guestUser);
              if (event === 'SIGNED_OUT') {
                trackAuthEvent('sign_out');
              }
            }
            setLoading(false);
          });

          subscription = data.subscription;
        }
      } catch (error) {
        console.error('Error setting up auth listener:', error);
      }
    };

    setupAuthListener();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signInAsGuest = (username: string, roleAtCursor: string = 'Sales Rep') => {
    const guestUser: GuestUser = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      email: `guest_${Date.now()}@guest.local`,
      username,
      roleAtCursor,
      isGuest: true,
    };
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    setUser(guestUser);
    trackAuthEvent('guest_mode', { userId: guestUser.id });
  };

  const signOut = async () => {
    // Clear guest user
    localStorage.removeItem('guest_user');
    
    // Sign out from Supabase if authenticated
    try {
      const authModule = await import('@/lib/auth');
      const getSupabaseAsync = authModule?.getSupabaseAsync;
      
      if (getSupabaseAsync && typeof getSupabaseAsync === 'function') {
        const supabase = await getSupabaseAsync();
        if (supabase && user && !('isGuest' in user)) {
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    setUser(null);
  };

  return { 
    user, 
    loading,
    isGuest: user ? 'isGuest' in user : false,
    signInAsGuest,
    signOut,
  };
}

