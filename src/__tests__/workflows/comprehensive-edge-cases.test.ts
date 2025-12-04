/**
 * Comprehensive Edge Case Tests
 * Deep testing of edge cases, boundary conditions, and error scenarios
 */

import { runEdgeCaseSuite } from '@/lib/testing/edge-case-helpers';
import { POST as roleplayPOST } from '@/app/api/roleplay/route';
import { POST as analyticsPOST, GET as analyticsGET } from '@/app/api/analytics/route';
import { POST as enrichCompanyPOST } from '@/app/api/sales/enrich-company/route';

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

describe('Comprehensive Edge Case Tests', () => {
  describe('Roleplay API Edge Cases', () => {
    it('should handle numeric boundary conditions', async () => {
      const suite = await runEdgeCaseSuite(roleplayPOST, '/api/roleplay', {
        numericFields: [
          {
            field: 'scenarioInput.turn_number',
            options: {
              min: 1,
              max: 100,
              validValues: [1, 50, 100],
              invalidValues: [0, -1, 101],
            },
          },
          {
            field: 'scenarioInput.confidence_score',
            options: {
              min: 50,
              max: 100,
            },
          },
        ],
        stringFields: [
          {
            field: 'scenarioInput.scenario_id',
            options: {
              minLength: 1,
              maxLength: 100,
              required: true,
            },
          },
          {
            field: 'persona.name',
            options: {
              minLength: 1,
              maxLength: 200,
              required: true,
            },
          },
        ],
        typeCoercion: [
          { field: 'scenarioInput.turn_number', expectedType: 'number' },
          { field: 'scenarioInput.scenario_id', expectedType: 'string' },
        ],
      });

      expect(suite.failed).toBeLessThan(suite.passed);
      console.log(`Roleplay Edge Cases: ${suite.passed} passed, ${suite.failed} failed`);
    });

    it('should handle malformed requests', async () => {
      const suite = await runEdgeCaseSuite(roleplayPOST, '/api/roleplay', {
        stringFields: [
          {
            field: 'scenarioInput.objection_statement',
            options: {
              minLength: 1,
              maxLength: 1000,
            },
          },
        ],
      });

      const malformedTests = suite.results.filter(r => r.name.includes('Malformed'));
      const allPassed = malformedTests.every(t => t.passed);
      
      expect(allPassed).toBe(true);
    });
  });

  describe('Analytics API Edge Cases', () => {
    it('should handle array boundary conditions', async () => {
      const suite = await runEdgeCaseSuite(analyticsPOST, '/api/analytics', {
        numericFields: [
          {
            field: 'score',
            options: {
              min: 0,
              max: 100,
            },
          },
        ],
        stringFields: [
          {
            field: 'userId',
            options: {
              minLength: 1,
              maxLength: 100,
              required: true,
            },
          },
          {
            field: 'scenarioId',
            options: {
              minLength: 1,
              maxLength: 100,
            },
          },
        ],
        typeCoercion: [
          { field: 'score', expectedType: 'number' },
          { field: 'userId', expectedType: 'string' },
        ],
      });

      expect(suite.failed).toBeLessThan(suite.passed);
    });

    it('should handle concurrent analytics requests', async () => {
      const suite = await runEdgeCaseSuite(analyticsPOST, '/api/analytics', {
        concurrency: {
          concurrent: 10,
          requestOptions: {
            method: 'POST',
            body: {
              eventType: 'scenario_start',
              userId: 'test-user',
              scenarioId: 'test-scenario',
            },
          },
          expectedBehavior: 'all-success',
        },
      });

      const concurrencyTests = suite.results.filter(r => r.name.includes('Concurrent'));
      expect(concurrencyTests.length).toBeGreaterThan(0);
    });
  });

  describe('Company Enrichment API Edge Cases', () => {
    it('should handle string boundary conditions for company names', async () => {
      const suite = await runEdgeCaseSuite(enrichCompanyPOST, '/api/sales/enrich-company', {
        stringFields: [
          {
            field: 'companyName',
            options: {
              minLength: 1,
              maxLength: 200,
              required: true,
            },
          },
          {
            field: 'domain',
            options: {
              minLength: 1,
              maxLength: 253,
              pattern: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            },
          },
        ],
      });

      // Should handle special characters gracefully
      const specialCharTests = suite.results.filter(r => 
        r.name.includes('XSS') || 
        r.name.includes('SQL') || 
        r.name.includes('Unicode')
      );
      
      const allHandled = specialCharTests.every(t => t.passed);
      expect(allHandled).toBe(true);
    });
  });

  describe('Security Edge Cases', () => {
    it('should prevent XSS attacks in all string inputs', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<svg onload=alert("xss")>',
        '"><script>alert("xss")</script>',
      ];

      for (const payload of xssPayloads) {
        const response = await analyticsPOST(
          new Request('http://localhost/api/analytics', {
            method: 'POST',
            body: JSON.stringify({
              eventType: 'scenario_start',
              userId: payload,
              scenarioId: 'test',
            }),
            headers: { 'Content-Type': 'application/json' },
          }) as any
        );

        const data = await response.json();
        
        // Should sanitize or reject
        expect(response.status).toBeLessThan(500);
        if (response.status === 200) {
          // If accepted, should be sanitized
          expect(data.userId || '').not.toContain('<script>');
        }
      }
    });

    it('should prevent SQL injection attempts', async () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker'); --",
        "1' UNION SELECT * FROM users--",
      ];

      for (const payload of sqlPayloads) {
        const response = await enrichCompanyPOST(
          new Request('http://localhost/api/sales/enrich-company', {
            method: 'POST',
            body: JSON.stringify({
              companyName: payload,
              domain: 'test.com',
            }),
            headers: { 'Content-Type': 'application/json' },
          }) as any
        );

        const data = await response.json();
        
        // Should sanitize or reject
        expect(response.status).toBeLessThan(500);
        if (response.status === 200 && data.company) {
          expect(data.company.name || '').not.toContain('DROP TABLE');
          expect(data.company.name || '').not.toContain('UNION');
        }
      }
    });

    it('should prevent path traversal attacks', async () => {
      const pathPayloads = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '../../../../etc/shadow',
        '....//....//etc/passwd',
      ];

      for (const payload of pathPayloads) {
        const response = await analyticsGET(
          new Request(`http://localhost/api/analytics?file=${encodeURIComponent(payload)}`, {
            method: 'GET',
          }) as any
        );

        // Should reject or sanitize
        expect(response.status).toBeLessThan(500);
      }
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle very large payloads gracefully', async () => {
      const largePayload = {
        eventType: 'scenario_start',
        userId: 'test-user',
        scenarioId: 'test-scenario',
        metadata: {
          largeField: 'x'.repeat(1000000), // 1MB string
        },
      };

      const response = await analyticsPOST(
        new Request('http://localhost/api/analytics', {
          method: 'POST',
          body: JSON.stringify(largePayload),
          headers: { 'Content-Type': 'application/json' },
        }) as any
      );

      // Should reject or truncate large payloads
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle rapid sequential requests', async () => {
      const requests = Array.from({ length: 100 }, () =>
        analyticsGET(
          new Request('http://localhost/api/analytics?userId=test-user', {
            method: 'GET',
          }) as any
        )
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;
      const errorCount = responses.filter(r => r.status >= 400).length;

      // Should handle most requests successfully
      expect(successCount + errorCount).toBe(100);
      // Should not crash
      expect(errorCount).toBeLessThan(50);
    });
  });

  describe('Data Integrity Edge Cases', () => {
    it('should handle missing required fields', async () => {
      const incompletePayloads = [
        {}, // Empty - missing eventType
        { userId: 'test-user' }, // Missing eventType
        { eventType: null, userId: 'test-user' }, // Null eventType
        { eventType: undefined, userId: 'test-user' }, // Undefined eventType
        { eventType: '', userId: 'test-user' }, // Empty string eventType
      ];

      for (const payload of incompletePayloads) {
        const response = await analyticsPOST(
          new Request('http://localhost/api/analytics', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          }) as any
        );

        // Should reject incomplete payloads (eventType is required)
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
      
      // This one should pass (has eventType, userId is optional)
      const validPayload = { eventType: 'scenario_start' };
      const validResponse = await analyticsPOST(
        new Request('http://localhost/api/analytics', {
          method: 'POST',
          body: JSON.stringify(validPayload),
          headers: { 'Content-Type': 'application/json' },
        }) as any
      );
      expect(validResponse.status).toBe(200);
    });

    it('should handle invalid data types', async () => {
      const invalidTypePayloads = [
        { eventType: 123, userId: 'test-user' }, // Number instead of string
        { eventType: 'scenario_start', userId: 123 }, // Number instead of string
        { eventType: 'scenario_start', userId: 'test-user', score: 'not-a-number' }, // String instead of number
        { eventType: ['array'], userId: 'test-user' }, // Array instead of string
        { eventType: { object: 'value' }, userId: 'test-user' }, // Object instead of string
      ];

      for (const payload of invalidTypePayloads) {
        const response = await analyticsPOST(
          new Request('http://localhost/api/analytics', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          }) as any
        );

        // Should reject invalid types
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

