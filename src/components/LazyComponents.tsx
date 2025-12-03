'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { LoadingState } from './ui/loading-state';

// Lazy load heavy components with loading states
export const LazyAnalyticsDashboard = dynamic(
  () => import('./AnalyticsDashboard'),
  {
    loading: () => <LoadingState message="Loading analytics..." />,
    ssr: false,
  }
);

export const LazyLeaderboard = dynamic(
  () => import('./Leaderboard'),
  {
    loading: () => <LoadingState message="Loading leaderboard..." />,
    ssr: false,
  }
);

export const LazyTopResponses = dynamic(
  () => import('./TopResponses'),
  {
    loading: () => <LoadingState message="Loading top responses..." />,
    ssr: false,
  }
);

export const LazyTechnicalQuestions = dynamic(
  () => import('./TechnicalQuestions'),
  {
    loading: () => <LoadingState message="Loading questions..." />,
    ssr: false,
  }
);

export const LazyRoleplayEngine = dynamic(
  () => import('./RoleplayEngine'),
  {
    loading: () => <LoadingState message="Loading roleplay engine..." />,
    ssr: false,
  }
);

// Higher-order component for lazy loading with intersection observer
export function withLazyLoad<T extends object>(
  Component: ComponentType<T>,
  options?: {
    loadingComponent?: ComponentType;
    threshold?: number;
    rootMargin?: string;
  }
) {
  return function LazyLoadedComponent(props: T) {
    const LazyComponent = dynamic(() => Promise.resolve(Component), {
      loading: options?.loadingComponent || (() => <LoadingState />),
      ssr: false,
    });

    return <LazyComponent {...props} />;
  };
}

