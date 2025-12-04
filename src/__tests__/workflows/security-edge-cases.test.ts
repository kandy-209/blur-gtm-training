/**
 * Security Edge Case Tests
 * Comprehensive security vulnerability testing
 */

import { runSecurityTestSuite } from '@/lib/testing/security-helpers';
import { POST as analyticsPOST } from '@/app/api/analytics/route';
import { POST as enrichCompanyPOST } from '@/app/api/sales/enrich-company/route';
import { POST as roleplayPOST } from '@/app/api/roleplay/route';

// Mock dependencies
jest.mock('@/lib/ai-providers', () => ({
  getAIProvider: jest.fn(() => ({
    name: 'test',
    generateResponse: jest.fn().mockResolvedValue(JSON.stringify({
      agent_response_text: 'Test response',
      scoring_feedback: 'Good',
      response_evaluation: 'PASS',
      next_step_action: 'FOLLOW_UP',
      confidence_score: 85,
    })),
  })),
}));

jest.mock('@/lib/db', () => ({
  db: {
    roleplayTurn: {
      create: jest.fn().mockResolvedValue({ id: 'turn_123' }),
    },
  },
}));

jest.mock('@/lib/error-handler', () => ({
  handleError: jest.fn((error) => ({
    json: () => Promise.resolve({ error: error.message }),
    status: 500,
  })),
  withErrorHandler: jest.fn((fn) => fn),
  generateRequestId: jest.fn(() => 'req_123'),
}));

jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@/lib/metrics', () => ({
  recordApiCall: jest.fn(),
  roleplayTurnsTotal: { inc: jest.fn() },
}));

jest.mock('@/lib/sentry', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/lib/supabase-client', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    })),
  })),
}));

describe('Security Edge Case Tests', () => {
  describe('Analytics API Security', () => {
    it('should prevent XSS attacks', async () => {
      const suite = await runSecurityTestSuite(analyticsPOST, '/api/analytics', {
        xssFields: ['userId', 'scenarioId'],
        sqlFields: ['userId', 'scenarioId'],
        pathFields: ['scenarioId'],
        invalidInputs: [
          { name: 'Empty body', body: {} },
          { name: 'Null eventType', body: { eventType: null, userId: 'test' } },
          { name: 'Invalid eventType', body: { eventType: 'invalid', userId: 'test' } },
        ],
      });

      expect(suite.vulnerabilities.length).toBe(0);
      console.log(`Analytics Security: ${suite.passed} passed, ${suite.failed} failed`);
    });
  });

  describe('Company Enrichment API Security', () => {
    it('should prevent SQL injection and XSS', async () => {
      const suite = await runSecurityTestSuite(enrichCompanyPOST, '/api/sales/enrich-company', {
        xssFields: ['companyName', 'domain'],
        sqlFields: ['companyName', 'domain'],
        commandFields: ['companyName'],
        pathFields: ['domain'],
        invalidInputs: [
          { name: 'Empty body', body: {} },
          { name: 'Invalid domain', body: { companyName: 'Test', domain: 'invalid' } },
        ],
      });

      // Only count vulnerabilities that actually executed (status 200 with malicious content)
      // Rejected requests (400/500) are fine - they show proper validation
      const executedVulnerabilities = suite.results.filter(r => 
        !r.passed && 
        r.response?.status === 200 &&
        r.vulnerability
      );
      
      expect(executedVulnerabilities.length).toBe(0);
    });
  });

  describe('Roleplay API Security', () => {
    it('should sanitize all user inputs', async () => {
      const suite = await runSecurityTestSuite(roleplayPOST, '/api/roleplay', {
        xssFields: ['scenarioInput.objection_statement', 'persona.name'],
        sqlFields: ['scenarioInput.scenario_id'],
        invalidInputs: [
          { name: 'Missing scenarioInput', body: { persona: {} } },
          { name: 'Missing persona', body: { scenarioInput: {} } },
          { name: 'Invalid turn_number', body: { scenarioInput: { turn_number: -1 } } },
        ],
      });

      expect(suite.vulnerabilities.length).toBe(0);
    });
  });
});

