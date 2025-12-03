/**
 * Testing Utilities
 * Shared test helpers and utilities
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextRouter } from 'next/router';

// Mock router for tests
export const mockRouter: Partial<NextRouter> = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
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
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockCompany = (overrides = {}) => ({
  id: 'comp_123',
  name: 'Test Company',
  domain: 'test.com',
  industry: 'Technology',
  sector: 'Software',
  size: 'mid-size' as const,
  founded: 2020,
  headquarters: 'San Francisco, CA',
  ...overrides,
});

export const createMockPersona = (overrides = {}) => ({
  id: 'persona_123',
  name: 'Test Persona',
  title: 'VP Engineering',
  company: 'Test Company',
  role: 'VP Engineering' as const,
  seniority: 'senior' as const,
  technicalProfile: {
    expertise: ['TypeScript', 'React'],
    architectureExperience: 'microservices',
    teamSize: 10,
    codebaseFamiliarity: 'deep' as const,
  },
  concerns: ['Scalability', 'Security'],
  priorities: ['Performance', 'Quality'],
  painPoints: ['Slow deployments'],
  communicationStyle: {
    usesTechnicalTerms: true,
    asksArchitectureQuestions: true,
    referencesCode: true,
    prefersData: true,
    directness: 'direct' as const,
  },
  decisionFactors: {
    technical: 0.6,
    business: 0.3,
    team: 0.1,
  },
  ...overrides,
});

export const createMockDiscoveryCall = (overrides = {}) => ({
  id: 'call_123',
  companyId: 'comp_123',
  personaId: 'persona_123',
  conversationHistory: [],
  isActive: true,
  startedAt: new Date(),
  ...overrides,
});

// Async test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Condition timeout');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};

