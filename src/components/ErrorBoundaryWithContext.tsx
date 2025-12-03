'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { errorAnalytics } from '@/lib/error-analytics';
import { createErrorContext, ErrorWithContext } from '@/lib/error-recovery';

interface ErrorBoundaryWithContextProps {
  children: React.ReactNode;
  component: string;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function ErrorBoundaryWithContext({
  children,
  component,
  fallback,
  onError,
  resetKeys,
  severity = 'high',
}: ErrorBoundaryWithContextProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Create error context
    const context = createErrorContext(component, 'render', {
      componentStack: errorInfo.componentStack,
    });

    // Wrap error with context
    const errorWithContext = new ErrorWithContext(error.message, context);
    errorWithContext.stack = error.stack;

    // Capture error analytics
    errorAnalytics.captureError(errorWithContext, context, severity);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleError}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
}

