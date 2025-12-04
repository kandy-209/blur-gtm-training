/**
 * Page component rendering tests
 * Ensures all pages can render without errors
 */

import React from 'react';
import { render } from '@testing-library/react';
import HomePage from '../page';
import ScenariosPage from '../scenarios/page';
import AnalyticsPage from '../analytics/page';
import LeaderboardPage from '../leaderboard/page';
import LivePage from '../live/page';
import FeaturesPage from '../features/page';
import EnterprisePage from '../enterprise/page';
import ChatPage from '../chat/page';
import AuthPage from '../auth/page';
import NotFoundPage from '../not-found';

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

// Mock ProtectedRoute to allow testing
jest.mock('@/components/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Mock OptimizedFluidBackground to avoid canvas/window issues in tests
jest.mock('@/components/OptimizedFluidBackground', () => {
  return function MockOptimizedFluidBackground() {
    return null;
  };
});

// Mock useOptimizedMousePosition
jest.mock('@/hooks/useOptimizedMousePosition', () => ({
  useOptimizedMousePosition: jest.fn(),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: jest.fn(),
  }),
}));

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    getStats: () => ({
      totalScenarios: 0,
      totalTurns: 0,
      averageScore: 0,
      completionRate: 0,
    }),
    getEvents: () => [],
    track: jest.fn(),
  },
  trackAnalyticsEvent: jest.fn(),
}));

// Mock Vercel Analytics - handle ESM modules
jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => null,
}), { virtual: true });

jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => null,
}), { virtual: true });

// Mock @vercel/analytics dist module and main module
jest.mock('@vercel/analytics/dist/index.mjs', () => ({}), { virtual: true });
jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
}), { virtual: true });

// Mock useParams
jest.mock('next/navigation', () => ({
  useParams: () => ({ scenarioId: 'test-scenario' }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  notFound: jest.fn(),
}));

describe('Page Rendering Tests', () => {
  describe('Home Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<HomePage />);
      expect(container).toBeTruthy();
    });

    it('should render main heading', () => {
      const { getByText, container } = render(<HomePage />);
      expect(getByText(/Transform Into a/i)).toBeTruthy();
      // Text is split across multiple elements, so check container text content
      expect(container.textContent).toMatch(/World-Class GTM Operator/i);
    });
  });

  describe('Scenarios Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<ScenariosPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Analytics Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<AnalyticsPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Leaderboard Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<LeaderboardPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Live Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<LivePage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Features Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<FeaturesPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Enterprise Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<EnterprisePage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Chat Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<ChatPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Auth Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<AuthPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('404 Not Found Page', () => {
    it('should render without crashing', () => {
      const { container } = render(<NotFoundPage />);
      expect(container).toBeTruthy();
    });

    it('should display 404 message', () => {
      const { getByText } = render(<NotFoundPage />);
      expect(getByText(/404/i)).toBeTruthy();
    });
  });
});

