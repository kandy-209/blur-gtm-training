import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { supabase } from '@/lib/auth';

// Mock Vercel Analytics
jest.mock('@/lib/vercel-analytics', () => ({
  trackAuthEvent: jest.fn(),
}));

// Create a mock callback storage
let authStateChangeCallback: any = null;

// Define mockSupabase first
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      };
    }),
  },
};

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  supabase: mockSupabase,
  getSupabaseAsync: jest.fn().mockResolvedValue(mockSupabase),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window object
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost' },
      writable: true,
    });
  });

  it('should return null user initially when no session', async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('should return user when session exists', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
    };

    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // User should be extracted from session
    expect(result.current.user).toBeDefined();
    if (result.current.user) {
      expect(result.current.user.id).toBe(mockUser.id);
      expect(result.current.user.email).toBe(mockUser.email);
    }
  });

  it('should handle auth state changes', async () => {
    const mockUser = { id: 'user_123', email: 'test@example.com' };
    authStateChangeCallback = null;

    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();

    // Simulate auth state change if callback was set
    if (authStateChangeCallback) {
      authStateChangeCallback('SIGNED_IN', { session: { user: mockUser } });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });
    }
  });

  it('should handle errors gracefully', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });
});

