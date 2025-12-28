/**
 * Phone Call Training Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneCallTraining } from '@/components/SalesTraining/PhoneCallTraining';

// Mock scenarios
jest.mock('@/data/scenarios', () => ({
  scenarios: [
    {
      id: 'TEST_SCENARIO',
      persona: {
        name: 'Test Persona',
        currentSolution: 'Test Solution',
        primaryGoal: 'Test Goal',
        skepticism: 'Test Skepticism',
        tone: 'Professional',
      },
      objection_category: 'Test Category',
      objection_statement: 'Test objection',
      keyPoints: ['Point 1', 'Point 2', 'Point 3'],
    },
  ],
}));

// Mock fetch
global.fetch = jest.fn();

describe('PhoneCallTraining', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    render(<PhoneCallTraining userId="test_user" />);
    
    expect(screen.getByText('Select Training Scenario')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('should allow scenario selection', async () => {
    const user = userEvent.setup();
    render(<PhoneCallTraining userId="test_user" />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    await waitFor(() => {
      expect(screen.getByText('Test Persona')).toBeInTheDocument();
    });
  });

  it('should format phone number input', async () => {
    const user = userEvent.setup();
    render(<PhoneCallTraining userId="test_user" />);
    
    const input = screen.getByPlaceholderText('+1 (555) 123-4567');
    await user.type(input, '15551234567');
    
    expect(input).toHaveValue('(555) 123-4567');
  });

  it('should disable start button when scenario not selected', () => {
    render(<PhoneCallTraining userId="test_user" />);
    
    const button = screen.getByRole('button', { name: /start training call/i });
    expect(button).toBeDisabled();
  });

  it('should enable start button when scenario and phone selected', async () => {
    const user = userEvent.setup();
    render(<PhoneCallTraining userId="test_user" />);
    
    // Select scenario
    const select = screen.getByRole('combobox');
    await user.click(select);
    await waitFor(async () => {
      const option = screen.getByText('Test Persona');
      await user.click(option);
    });
    
    // Enter phone number
    const input = screen.getByPlaceholderText('+1 (555) 123-4567');
    await user.type(input, '15551234567');
    
    // Button should be enabled
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /start training call/i });
      expect(button).not.toBeDisabled();
    });
  });

  it('should initiate call on button click', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        callId: 'call_123',
        status: 'ringing',
      }),
    });

    render(<PhoneCallTraining userId="test_user" />);
    
    // Select scenario
    const select = screen.getByRole('combobox');
    await user.click(select);
    await waitFor(async () => {
      const option = screen.getByText('Test Persona');
      await user.click(option);
    });
    
    // Enter phone
    const input = screen.getByPlaceholderText('+1 (555) 123-4567');
    await user.type(input, '15551234567');
    
    // Click start
    const button = screen.getByRole('button', { name: /start training call/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should display error message on failure', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to initiate call')
    );

    render(<PhoneCallTraining userId="test_user" />);
    
    // Select scenario and enter phone
    const select = screen.getByRole('combobox');
    await user.click(select);
    await waitFor(async () => {
      const option = screen.getByText('Test Persona');
      await user.click(option);
    });
    
    const input = screen.getByPlaceholderText('+1 (555) 123-4567');
    await user.type(input, '15551234567');
    
    const button = screen.getByRole('button', { name: /start training call/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});

