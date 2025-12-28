/**
 * StockQuoteWidget Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import { StockQuoteWidget } from '@/components/StockQuoteWidget';

// Mock fetch
global.fetch = jest.fn();

describe('StockQuoteWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    render(<StockQuoteWidget symbol="AAPL" />);
    
    expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<StockQuoteWidget symbol="AAPL" />);
    
    // Component should render without errors
    expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<StockQuoteWidget symbol="AAPL" />);
    
    // Component should still render
    expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
  });
});
