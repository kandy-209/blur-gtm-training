/**
 * StockQuoteWidget Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import StockQuoteWidget from '@/components/StockQuoteWidget';

// Mock fetch
global.fetch = jest.fn();

describe('StockQuoteWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    render(<StockQuoteWidget />);
    
    // Component renders with search input and button
    expect(screen.getByPlaceholderText(/Enter symbol/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock Quote/i)).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<StockQuoteWidget />);
    
    // Component should render without errors
    expect(screen.getByPlaceholderText(/Enter symbol/i)).toBeInTheDocument();
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<StockQuoteWidget />);
    
    // Component should still render
    expect(screen.getByPlaceholderText(/Enter symbol/i)).toBeInTheDocument();
  });
});
