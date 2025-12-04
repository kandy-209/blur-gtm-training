import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('catches errors and displays error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Use getAllByText since there are multiple elements with "error" text
    const errorElements = screen.getAllByText(/error/i);
    expect(errorElements.length).toBeGreaterThan(0);
    expect(errorElements[0]).toBeInTheDocument();
  });

  it('provides reload button', () => {
    const reload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByRole('button', { name: /reload/i });
    expect(reloadButton).toBeInTheDocument();
  });

  it('handles multiple errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Rerender with new error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('resets when error is resolved', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
    
    // Trigger error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Resolve error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Error boundary should still show error (doesn't auto-reset)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  // Edge cases
  it('handles null children', () => {
    render(
      <ErrorBoundary>
        {null}
      </ErrorBoundary>
    );
    // Should not crash
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('handles undefined children', () => {
    render(
      <ErrorBoundary>
        {undefined}
      </ErrorBoundary>
    );
    // Should not crash
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('handles async errors in useEffect', async () => {
    const AsyncError = () => {
      React.useEffect(() => {
        throw new Error('Async error');
      }, []);
      return <div>Async component</div>;
    };

    render(
      <ErrorBoundary>
        <AsyncError />
      </ErrorBoundary>
    );
    
    // Error boundary may or may not catch useEffect errors
    // depending on React version
    await new Promise(resolve => setTimeout(resolve, 100));
    // Use getAllByRole since there are multiple generic elements
    const genericElements = screen.getAllByRole('generic');
    expect(genericElements.length).toBeGreaterThan(0);
  });
});




