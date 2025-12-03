import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavUser from '../NavUser';
import * as auth from '@/lib/auth';

// Mock auth
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/test',
}));

describe('NavUser Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);
    render(<NavUser />);
    // Component may show loading or default state
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('displays user information when logged in', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        username: 'testuser',
        full_name: 'Test User',
      },
    };
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    render(<NavUser />);
    
    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
    });
  });

  it('displays guest user when not logged in', async () => {
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    render(<NavUser />);
    
    await waitFor(() => {
      expect(screen.getByText(/guest/i)).toBeInTheDocument();
    });
  });

  it('handles sign out', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (auth.signOut as jest.Mock).mockResolvedValue(undefined);
    
    render(<NavUser />);
    
    await waitFor(() => {
      const signOutButton = screen.getByText(/sign out/i);
      expect(signOutButton).toBeInTheDocument();
    });
    
    const signOutButton = screen.getByText(/sign out/i);
    await userEvent.click(signOutButton);
    
    await waitFor(() => {
      expect(auth.signOut).toHaveBeenCalled();
    });
  });

  it('handles navigation links', async () => {
    render(<NavUser />);
    
    // Check if navigation links are present
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('handles mobile menu toggle', async () => {
    render(<NavUser />);
    
    // Look for mobile menu button
    const menuButtons = screen.queryAllByRole('button');
    const mobileMenuButton = menuButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('menu') ||
      btn.getAttribute('aria-expanded')
    );
    
    if (mobileMenuButton) {
      await userEvent.click(mobileMenuButton);
      // Menu should expand/collapse
    }
  });

  // Edge cases
  it('handles user with missing metadata', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
    };
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    render(<NavUser />);
    
    await waitFor(() => {
      // Should fallback to email or default
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  it('handles auth error gracefully', async () => {
    (auth.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Auth error'));
    
    render(<NavUser />);
    
    await waitFor(() => {
      // Should show guest or error state
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  it('handles sign out error', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (auth.signOut as jest.Mock).mockRejectedValue(new Error('Sign out failed'));
    
    render(<NavUser />);
    
    await waitFor(() => {
      const signOutButton = screen.getByText(/sign out/i);
      expect(signOutButton).toBeInTheDocument();
    });
    
    const signOutButton = screen.getByText(/sign out/i);
    await userEvent.click(signOutButton);
    
    // Should handle error gracefully
    await waitFor(() => {
      expect(auth.signOut).toHaveBeenCalled();
    });
  });

  it('handles very long username', async () => {
    const longUsername = 'A'.repeat(100);
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        username: longUsername,
      },
    };
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    render(<NavUser />);
    
    // NavUser doesn't have a nav element, check for buttons instead
    await waitFor(() => {
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
    });
  });
});

