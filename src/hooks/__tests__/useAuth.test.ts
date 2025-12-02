import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { supabase } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
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

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle auth state changes', async () => {
    const mockUser = { id: 'user_123', email: 'test@example.com' };
    let authStateChangeCallback: any;

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();

    // Simulate auth state change
    authStateChangeCallback('SIGNED_IN', { user: mockUser });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('should handle errors gracefully', async () => {
    (supabase.auth.getSession as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });
});

