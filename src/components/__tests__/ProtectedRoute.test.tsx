import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
    isGuest: false,
    signInAsGuest: jest.fn(),
    signOut: jest.fn(),
  })),
}));

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    Object.defineProperty(window, 'location', {
      value: { pathname: '/test', search: '' },
      writable: true,
    });
  });

  it('should show loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should auto-sign in as guest when user is not authenticated', async () => {
    const mockSignInAsGuest = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      isGuest: false,
      signInAsGuest: mockSignInAsGuest,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockSignInAsGuest).toHaveBeenCalled();
    });

    // Should not redirect, should auto-sign in as guest
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should render children when user is authenticated', () => {
    const mockUser = { id: 'user_123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should auto-sign in as guest for different paths', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/scenarios', search: '' },
      writable: true,
    });

    const mockSignInAsGuest = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      isGuest: false,
      signInAsGuest: mockSignInAsGuest,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockSignInAsGuest).toHaveBeenCalled();
    });

    // Should not redirect, should auto-sign in as guest
    expect(mockPush).not.toHaveBeenCalled();
  });
});

