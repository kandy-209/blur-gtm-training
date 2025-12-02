'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/auth';
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
      // Check guest user first
      const guestUser = checkGuestUser();
      if (guestUser) {
        setUser(guestUser);
        setLoading(false);
        return;
      }

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
    };

    checkSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

      return () => {
        subscription.unsubscribe();
      };
    }
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
    if (supabase && user && !('isGuest' in user)) {
      await supabase.auth.signOut();
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

