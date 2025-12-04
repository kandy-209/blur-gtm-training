/**
 * Integration Test Helpers
 * Utilities for end-to-end and integration testing
 */

import { testApiEndpoint, createMockRequest } from './api-test-utils';
import { createTestDatabase, setupTestDatabase } from './db-test-utils';
import { generateMockArray, generateMockScenario, generateMockEmailData } from './mock-data';

export interface IntegrationTestContext {
  db: Awaited<ReturnType<typeof createTestDatabase>>;
  userId: string;
  scenarioId: string;
  cleanup: () => Promise<void>;
}

/**
 * Setup integration test context
 */
export async function setupIntegrationTest(): Promise<IntegrationTestContext> {
  const db = await createTestDatabase();
  const user = await db.createUser();
  const scenario = generateMockScenario();

  return {
    db,
    userId: user.id,
    scenarioId: scenario.id,
    async cleanup() {
      await db.cleanup();
    },
  };
}

/**
 * Test complete user flow
 */
export async function testUserFlow(
  handlers: {
    createUser: (request: any) => Promise<Response>;
    startScenario: (request: any) => Promise<Response>;
    submitTurn: (request: any) => Promise<Response>;
    getAnalytics: (request: any) => Promise<Response>;
  }
): Promise<{
  success: boolean;
  steps: Array<{ step: string; status: number; error?: string }>;
}> {
  const steps: Array<{ step: string; status: number; error?: string }> = [];
  const context = await setupIntegrationTest();

  try {
    // Step 1: Create user
    const userResponse = await testApiEndpoint(
      handlers.createUser,
      '/api/users/profile',
      {
        method: 'POST',
        body: { email: `test_${Date.now()}@example.com` },
      }
    );
    steps.push({ step: 'createUser', status: userResponse.status });

    // Step 2: Start scenario
    const scenarioResponse = await testApiEndpoint(
      handlers.startScenario,
      '/api/scenarios/start',
      {
        method: 'POST',
        body: { scenarioId: context.scenarioId },
      }
    );
    steps.push({ step: 'startScenario', status: scenarioResponse.status });

    // Step 3: Submit turn
    const turnResponse = await testApiEndpoint(
      handlers.submitTurn,
      '/api/roleplay',
      {
        method: 'POST',
        body: {
          scenarioInput: {
            turn_number: 1,
            scenario_id: context.scenarioId,
            objection_category: 'price_objection',
            objection_statement: 'This is too expensive',
          },
          persona: {},
          conversationHistory: [],
        },
      }
    );
    steps.push({ step: 'submitTurn', status: turnResponse.status });

    // Step 4: Get analytics
    const analyticsResponse = await testApiEndpoint(
      handlers.getAnalytics,
      '/api/analytics',
      {
        method: 'GET',
        query: { userId: context.userId },
      }
    );
    steps.push({ step: 'getAnalytics', status: analyticsResponse.status });

    const success = steps.every(s => s.status >= 200 && s.status < 300);

    return { success, steps };
  } catch (error: any) {
    steps.push({
      step: 'error',
      status: 500,
      error: error.message,
    });
    return { success: false, steps };
  } finally {
    await context.cleanup();
  }
}

/**
 * Test API endpoint with database
 */
export async function testApiWithDatabase(
  handler: (request: any) => Promise<Response>,
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    setup?: (db: Awaited<ReturnType<typeof createTestDatabase>>) => Promise<void>;
    assert?: (response: any, db: Awaited<ReturnType<typeof createTestDatabase>>) => Promise<void>;
  } = {}
): Promise<{
  response: { status: number; data: any };
  db: Awaited<ReturnType<typeof createTestDatabase>>;
}> {
  const db = await createTestDatabase();

  try {
    if (options.setup) {
      await options.setup(db);
    }

    const response = await testApiEndpoint(handler, url, {
      method: options.method || 'GET',
      body: options.body,
    });

    if (options.assert) {
      await options.assert(response, db);
    }

    return { response, db };
  } finally {
    await db.cleanup();
  }
}

/**
 * Test email generation flow
 */
export async function testEmailGenerationFlow(
  handler: (request: any) => Promise<Response>
): Promise<{
  success: boolean;
  email?: { subject: string; body: string; cta: string };
  error?: string;
}> {
  const emailData = generateMockEmailData();

  try {
    const response = await testApiEndpoint(
      handler,
      '/api/llm/generate-email',
      {
        method: 'POST',
        body: emailData,
      }
    );

    if (response.status === 200 && response.data.body) {
      return {
        success: true,
        email: {
          subject: response.data.subject,
          body: response.data.body,
          cta: response.data.cta,
        },
      };
    }

    return {
      success: false,
      error: response.data.error || 'Unknown error',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Test company enrichment flow
 */
export async function testCompanyEnrichmentFlow(
  handler: (request: any) => Promise<Response>,
  companyName: string = 'Microsoft',
  domain: string = 'microsoft.com'
): Promise<{
  success: boolean;
  company?: any;
  error?: string;
}> {
  try {
    const response = await testApiEndpoint(
      handler,
      '/api/sales/enrich-company',
      {
        method: 'POST',
        body: { companyName, domain },
      }
    );

    if (response.status === 200 && response.data.company) {
      return {
        success: true,
        company: response.data.company,
      };
    }

    return {
      success: false,
      error: response.data.error || 'Unknown error',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Load test helper
 */
export async function loadTest(
  handler: (request: any) => Promise<Response>,
  url: string,
  options: {
    concurrent: number;
    iterations: number;
    delay?: number;
  }
): Promise<{
  totalRequests: number;
  successCount: number;
  errorCount: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  errors: string[];
}> {
  const { concurrent, iterations, delay = 0 } = options;
  const results: Array<{ success: boolean; time: number; error?: string }> = [];

  for (let i = 0; i < iterations; i++) {
    const batch = Array.from({ length: concurrent }, async () => {
      const start = Date.now();
      try {
        const response = await testApiEndpoint(handler, url);
        return {
          success: response.status >= 200 && response.status < 300,
          time: Date.now() - start,
        };
      } catch (error: any) {
        return {
          success: false,
          time: Date.now() - start,
          error: error.message,
        };
      }
    });

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    if (delay > 0 && i < iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;
  const times = results.map(r => r.time);
  const errors = results.filter(r => r.error).map(r => r.error!);

  return {
    totalRequests: results.length,
    successCount,
    errorCount,
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    errors,
  };
}

