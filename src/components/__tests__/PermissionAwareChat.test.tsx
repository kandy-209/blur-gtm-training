import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PermissionAwareChat } from '@/components/PermissionAwareChat';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');
jest.mock('@/lib/permissions', () => ({
  getUserRole: jest.fn(() => 'guest'),
  getPermissions: jest.fn(() => ['chat:general', 'chat:features']),
  canAccessChat: jest.fn(() => true),
}));

// Mock Vercel Analytics
jest.mock('@/lib/vercel-analytics', () => ({
  trackChatEvent: jest.fn(),
}));

global.fetch = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('PermissionAwareChat', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        id: 'guest_123',
        email: 'guest@test.com',
        username: 'Guest',
        roleAtCursor: 'Sales Rep',
        isGuest: true,
      },
      loading: false,
      isGuest: true,
      signInAsGuest: jest.fn(),
      signOut: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'Test response' }),
    });
  });

  it('should render chat interface', () => {
    render(<PermissionAwareChat initialChatType="general" />);
    
    // Check for the title (General Chat)
    expect(screen.getByText(/General Chat/i)).toBeInTheDocument();
    // Check for placeholder text
    expect(screen.getByPlaceholderText(/Ask any question about Cursor/i)).toBeInTheDocument();
  });

  it('should show permission warning for restricted chat types', () => {
    const { canAccessChat } = require('@/lib/permissions');
    canAccessChat.mockReturnValue(false);

    render(<PermissionAwareChat initialChatType="technical" />);
    
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
  });

  it('should send message when user submits', async () => {
    render(<PermissionAwareChat initialChatType="general" />);
    
    const input = screen.getByPlaceholderText(/Ask any question about Cursor/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should disable input when access is restricted', () => {
    const { canAccessChat } = require('@/lib/permissions');
    canAccessChat.mockReturnValue(false);

    render(<PermissionAwareChat initialChatType="technical" />);
    
    // When access is restricted, the input should be disabled or not rendered
    // Check for the restricted message instead
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    // Input might be disabled or not shown
    const input = screen.queryByPlaceholderText(/Ask/i);
    if (input) {
      expect(input).toBeDisabled();
    }
  });

  it('should show loading state while processing', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ answer: 'Response' }),
      }), 100))
    );

    render(<PermissionAwareChat initialChatType="general" />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText(/General Chat/i)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/Ask any question about Cursor/i) || screen.getByPlaceholderText(/Ask any question/i) || screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    // Should show loading indicator (button disabled or loader visible)
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /send/i });
      expect(button).toBeDisabled();
    });
  });
});

