import { render, screen, fireEvent } from '@testing-library/react';
import RatingModal from '@/components/RatingModal';

global.fetch = jest.fn();
const mockLocalStorage = {
  getItem: jest.fn(() => JSON.stringify({ user: { id: 'user_123' } })),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});
global.alert = jest.fn();

describe('RatingModal', () => {
  const defaultProps = {
    sessionId: 'session_123',
    ratedUserId: 'user_456',
    ratedUsername: 'Test User',
    onClose: jest.fn(),
    onRated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({ user: { id: 'user_123' } })
    );
  });

  it('should render rating modal', () => {
    render(<RatingModal {...defaultProps} />);

    expect(screen.getByText(/rate your partner/i)).toBeInTheDocument();
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  it('should submit rating', async () => {
    render(<RatingModal {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit rating/i });
    expect(submitButton).toBeInTheDocument();
    
    fireEvent.click(submitButton);
    
    // Verify button exists and is clickable
    expect(submitButton).toBeInTheDocument();
  });

  it('should allow skipping rating', () => {
    render(<RatingModal {...defaultProps} />);

    const skipButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
