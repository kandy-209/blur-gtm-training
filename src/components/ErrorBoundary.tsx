'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasResetKeyChanged) {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4" role="alert">
          <Card className="max-w-2xl w-full border-red-200 bg-red-50/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-red-900">Something went wrong</CardTitle>
                  <p className="text-sm text-red-700 mt-1">
                    We encountered an unexpected error. Don't worry, your data is safe.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDevelopment && this.state.error && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <p className="text-xs font-mono text-red-900 break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-700 cursor-pointer">
                        Stack trace
                      </summary>
                      <pre className="text-xs text-red-900 mt-2 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                  aria-label="Try again"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Try Again
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full"
                    aria-label="Go to home page"
                  >
                    <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                    Go Home
                  </Button>
                </Link>
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  aria-label="Reload page"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-xs text-red-700 text-center">
                If this problem persists, please contact support with the error details above.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

