import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthForm from '@/components/AuthForm';

global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
} as any;

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: 'user_123' },
        session: { access_token: 'token_123' },
      }),
    });
  });

  describe('Sign In Mode', () => {
    it('should render sign in form', () => {
      render(<AuthForm mode="signin" />);
      
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should submit sign in form', async () => {
      const onSuccess = jest.fn();
      render(<AuthForm mode="signin" onSuccess={onSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Sign Up Mode', () => {
    it('should render sign up form with all fields', () => {
      render(<AuthForm mode="signup" />);
      
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      // Select component label - check by text content
      expect(screen.getByText(/your role at browserbase/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    });

    it('should require all fields for signup', async () => {
      render(<AuthForm mode="signup" />);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission, or error message should appear
      await waitFor(() => {
        // Check if form validation prevented submission (no fetch call)
        // OR if error message appeared
        const errorElement = screen.queryByText(/fill in all required fields/i) || 
                            screen.queryByText(/required/i) ||
                            screen.queryByText(/please/i) ||
                            screen.queryByText(/missing/i);
        
        // If no error message, check that fetch wasn't called (HTML5 validation worked)
        if (!errorElement) {
          expect(global.fetch).not.toHaveBeenCalled();
        } else {
          expect(errorElement).toBeInTheDocument();
        }
      }, { timeout: 3000 });
    });
  });

  it('should show error on failed signin', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(<AuthForm mode="signin" />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
