import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StockQuoteWidget from '../StockQuoteWidget';

// Mock fetch globally
global.fetch = jest.fn();

describe('StockQuoteWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders input field and search button', () => {
    render(<StockQuoteWidget />);
    expect(screen.getByPlaceholderText(/enter symbol/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays error when symbol is empty', async () => {
    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a symbol/i)).toBeInTheDocument();
    });
  });

  it('converts input to uppercase', async () => {
    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i) as HTMLInputElement;
    await user.type(input, 'aapl');
    
    expect(input.value).toBe('AAPL');
  });

  it('fetches quote successfully', async () => {
    const mockQuote = {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.5,
      changePercent: 1.69,
      volume: 50000000,
      high: 151.0,
      low: 149.5,
      open: 150.0,
      previousClose: 147.75,
      timestamp: '2024-01-15',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ quote: mockQuote }),
    });

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('$150.25')).toBeInTheDocument();
    });
  });

  it('displays error when API returns error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'Quote not found' }),
    });

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'INVALID');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/quote not found/i)).toBeInTheDocument();
    });
  });

  it('displays error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('displays error when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Internal Server Error',
    });

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch quote/i)).toBeInTheDocument();
    });
  });

  it('triggers fetch on Enter key press', async () => {
    const mockQuote = {
      symbol: 'MSFT',
      price: 350.50,
      change: -1.25,
      changePercent: -0.36,
      volume: 30000000,
      high: 352.0,
      low: 349.0,
      open: 351.0,
      previousClose: 351.75,
      timestamp: '2024-01-15',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ quote: mockQuote }),
    });

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'MSFT{Enter}');
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('symbol=MSFT')
      );
    });
  });

  it('shows loading state while fetching', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ quote: { symbol: 'AAPL', price: 150 } }),
      }), 100))
    );

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'AAPL');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays quote details correctly', async () => {
    const mockQuote = {
      symbol: 'TSLA',
      price: 250.75,
      change: 5.25,
      changePercent: 2.14,
      volume: 75000000,
      high: 252.0,
      low: 248.0,
      open: 249.0,
      previousClose: 245.5,
      timestamp: '2024-01-15',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ quote: mockQuote }),
    });

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'TSLA');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('TSLA')).toBeInTheDocument();
      expect(screen.getByText('$250.75')).toBeInTheDocument();
      expect(screen.getByText(/\+5.25/)).toBeInTheDocument();
      expect(screen.getByText(/\+2.14%/)).toBeInTheDocument();
      expect(screen.getByText(/open/i)).toBeInTheDocument();
      expect(screen.getByText(/previous close/i)).toBeInTheDocument();
      expect(screen.getByText(/high/i)).toBeInTheDocument();
      expect(screen.getByText(/low/i)).toBeInTheDocument();
      expect(screen.getByText(/volume/i)).toBeInTheDocument();
    });
  });

  it('displays negative change correctly', async () => {
    const mockQuote = {
      symbol: 'GOOGL',
      price: 140.50,
      change: -3.25,
      changePercent: -2.26,
      volume: 40000000,
      high: 143.0,
      low: 139.0,
      open: 142.0,
      previousClose: 143.75,
      timestamp: '2024-01-15',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ quote: mockQuote }),
    });

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, 'GOOGL');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/-3.25/)).toBeInTheDocument();
      expect(screen.getByText(/-2.26%/)).toBeInTheDocument();
    });
  });

  it('clears previous quote when new error occurs', async () => {
    const mockQuote = {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.5,
      changePercent: 1.69,
      volume: 50000000,
      high: 151.0,
      low: 149.5,
      open: 150.0,
      previousClose: 147.75,
      timestamp: '2024-01-15',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ quote: mockQuote }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Invalid symbol' }),
      });

    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    const button = screen.getByRole('button');
    
    // First fetch - success
    await user.type(input, 'AAPL');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
    
    // Second fetch - error
    await user.clear(input);
    await user.type(input, 'INVALID');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
      expect(screen.getByText(/invalid symbol/i)).toBeInTheDocument();
    });
  });

  it('handles empty string input', async () => {
    const user = userEvent.setup();
    render(<StockQuoteWidget />);
    
    const input = screen.getByPlaceholderText(/enter symbol/i);
    await user.type(input, '   ');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a symbol/i)).toBeInTheDocument();
    });
  });
});

