'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  progress?: number;
  startTime?: number;
}

export interface UseLoadingStateOptions {
  minLoadingTime?: number; // Minimum time to show loading (prevents flash)
  maxLoadingTime?: number; // Maximum time before showing timeout
  onTimeout?: () => void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    minLoadingTime = 300,
    maxLoadingTime = 30000,
    onTimeout,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const startTimeRef = useRef<number | null>(null);
  const minTimeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    setState({
      isLoading: true,
      error: null,
      progress: 0,
      startTime,
    });

    // Set minimum loading time
    minTimeTimeoutRef.current = setTimeout(() => {
      // Minimum time elapsed, can finish loading
    }, minLoadingTime);

    // Set maximum loading time timeout
    maxTimeTimeoutRef.current = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      }
      setState((prev) => ({
        ...prev,
        error: new Error('Request timed out. Please try again.'),
      }));
    }, maxLoadingTime);
  }, [minLoadingTime, maxLoadingTime, onTimeout]);

  const stopLoading = useCallback((error?: Error) => {
    const startTime = startTimeRef.current;
    const elapsed = startTime ? Date.now() - startTime : 0;
    const remaining = Math.max(0, minLoadingTime - elapsed);

    // Wait for minimum loading time if needed
    setTimeout(() => {
      if (minTimeTimeoutRef.current) {
        clearTimeout(minTimeTimeoutRef.current);
      }
      if (maxTimeTimeoutRef.current) {
        clearTimeout(maxTimeTimeoutRef.current);
      }

      if (error) {
        setState({
          isLoading: false,
          error,
          progress: undefined,
          startTime: undefined,
        });
        if (onError) {
          onError(error);
        }
      } else {
        setState({
          isLoading: false,
          error: null,
          progress: 100,
          startTime: undefined,
        });
        if (onSuccess) {
          onSuccess();
        }
      }
      startTimeRef.current = null;
    }, remaining);
  }, [minLoadingTime, onError, onSuccess]);

  const updateProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const reset = useCallback(() => {
    if (minTimeTimeoutRef.current) {
      clearTimeout(minTimeTimeoutRef.current);
    }
    if (maxTimeTimeoutRef.current) {
      clearTimeout(maxTimeTimeoutRef.current);
    }
    startTimeRef.current = null;
    setState({
      isLoading: false,
      error: null,
      progress: undefined,
      startTime: undefined,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (minTimeTimeoutRef.current) {
        clearTimeout(minTimeTimeoutRef.current);
      }
      if (maxTimeTimeoutRef.current) {
        clearTimeout(maxTimeTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    updateProgress,
    reset,
  };
}

