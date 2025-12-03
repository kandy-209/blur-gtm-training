'use client';

import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';
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
    loadingComponent?: ComponentType | (() => React.ReactElement);
    threshold?: number;
    rootMargin?: string;
  }
) {
  return function LazyLoadedComponent(props: T) {
    // Convert ComponentType to a function that returns ReactNode for dynamic()
    const loadingFn = options?.loadingComponent 
      ? (() => {
          // If it's a ComponentType (class component), wrap it
          if (typeof options.loadingComponent === 'function' && 'prototype' in options.loadingComponent && options.loadingComponent.prototype?.render) {
            return () => React.createElement(options.loadingComponent as ComponentType);
          }
          // If it's already a function component, use it directly
          return options.loadingComponent as () => React.ReactElement;
        })()
      : () => <LoadingState />;
    
    const LazyComponent = dynamic(() => Promise.resolve(Component), {
      loading: loadingFn,
      ssr: false,
    });

    return <LazyComponent {...props} />;
  };
}

