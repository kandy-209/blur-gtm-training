/**
 * Enhanced Testing Utilities
 * Extended test helpers with mocks, factories, and utilities
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextRouter } from 'next/router';
import { generateMockScenario, generateMockUserProfile, generateMockCompany, generateMockEmailData } from '@/lib/testing/mock-data';

// Re-export existing utilities
export * from './test-utils';

// Enhanced mock router with more functionality
export const createMockRouter = (overrides: Partial<NextRouter> = {}): Partial<NextRouter> => ({
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  defaultLocale: 'en',
  domainLocales: [],
  isPreview: false,
  ...overrides,
});

// Mock fetch responses
export const createMockFetch = (response: any, ok: boolean = true) => {
  return jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
    headers: new Headers(),
  } as Response);
};

// Mock API responses
export const mockApiResponses = {
  analytics: {
    success: {
      stats: {
        totalScenarios: 10,
        averageScore: 85,
        totalTurns: 50,
      },
      events: [],
    },
  },
  companyEnrichment: {
    success: {
      company: generateMockCompany(),
      contacts: [],
    },
  },
  emailGeneration: {
    success: {
      subject: 'Quick question about your engineering productivity',
      body: 'Hi there,\n\nI noticed your company has a large engineering team...',
      cta: 'Schedule a call',
    },
  },
  databaseHealth: {
    success: {
      connected: true,
      tables: ['user_profiles', 'user_activity'],
    },
  },
};

// Wait utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const waitForElement = async (
  queryFn: () => HTMLElement | null,
  timeout: number = 5000
) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const element = queryFn();
    if (element) return element;
    await waitFor(100);
  }
  throw new Error('Element not found within timeout');
};

// Test data factories using mock-data generators
export const createTestScenario = (overrides = {}) => generateMockScenario(overrides);
export const createTestUser = (overrides = {}) => generateMockUserProfile(overrides);
export const createTestCompany = (overrides = {}) => generateMockCompany(overrides);
export const createTestEmailData = (overrides = {}) => generateMockEmailData(overrides);

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Mock sessionStorage
export const mockSessionStorage = () => {
  return mockLocalStorage();
};

// Setup test environment
export const setupTestEnvironment = () => {
  // Mock window objects
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage(),
    writable: true,
  });

  // Mock fetch
  global.fetch = jest.fn();

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  } as any;

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  } as any;
};

// Cleanup test environment
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

// Assertion helpers
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveTextContent = (
  element: HTMLElement | null,
  text: string
) => {
  expect(element).toHaveTextContent(text);
};

export const expectToHaveClass = (
  element: HTMLElement | null,
  className: string
) => {
  expect(element).toHaveClass(className);
};

// Performance testing helpers
export const measurePerformance = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
};

// Snapshot testing helpers
export const expectSnapshot = (component: ReactElement) => {
  const { container } = render(component);
  expect(container).toMatchSnapshot();
};

