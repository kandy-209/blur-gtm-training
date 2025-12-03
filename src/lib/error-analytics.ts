'use client';

import { ErrorContext, ErrorWithContext } from './error-recovery';

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
}

class ErrorAnalytics {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;
  private reportEndpoint?: string;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for unhandled errors
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          component: 'window',
          action: 'unhandled_error',
          timestamp: Date.now(),
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      // Listen for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
        this.captureError(error, {
          component: 'window',
          action: 'unhandled_promise_rejection',
          timestamp: Date.now(),
        });
      });
    }
  }

  setReportEndpoint(endpoint: string) {
    this.reportEndpoint = endpoint;
  }

  captureError(error: Error, context: ErrorContext, severity: ErrorReport['severity'] = 'medium') {
    const report: ErrorReport = {
      error,
      context,
      severity,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    this.errors.push(report);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', report);
    }

    // Send to error reporting service if configured
    if (this.reportEndpoint) {
      this.sendToService(report).catch((err) => {
        console.error('Failed to send error report:', err);
      });
    }

    return report;
  }

  private async sendToService(report: ErrorReport) {
    if (!this.reportEndpoint) return;

    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          error: {
            message: report.error.message,
            stack: report.error.stack,
            name: report.error.name,
          },
        }),
      });
    } catch (error) {
      // Silently fail - don't break the app
      console.error('Error reporting failed:', error);
    }
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      const session = localStorage.getItem('supabase_session');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.user?.id;
      }
    } catch {
      // Ignore
    }
    return undefined;
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter((e) => e.severity === severity);
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorRate(timeWindowMs: number = 60000): number {
    const now = Date.now();
    const recentErrors = this.errors.filter(
      (e) => now - e.context.timestamp < timeWindowMs
    );
    return recentErrors.length / (timeWindowMs / 1000); // errors per second
  }
}

export const errorAnalytics = new ErrorAnalytics();

