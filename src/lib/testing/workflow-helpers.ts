/**
 * Enhanced Workflow Testing Helpers
 * Comprehensive utilities for testing complex user workflows and business logic
 */

import { NextRequest } from 'next/server';
import { testApiEndpoint, createMockRequest } from './api-test-utils';

// Generate mock user inline to avoid import issues
function generateMockUser() {
  return {
    id: `user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    username: `testuser_${Date.now()}`,
    role: 'user',
  };
}

// Generate mock scenario inline to avoid import issues
function generateMockScenario() {
  return {
    id: `scenario_${Date.now()}`,
    title: 'Test Scenario',
    description: 'Test scenario description',
    objection_category: 'price',
    objection_statement: 'Test objection',
    difficulty: 'medium' as const,
  };
}

export interface WorkflowStep {
  name: string;
  handler: (request: NextRequest) => Promise<Response>;
  url: string;
  options: any;
  assertions?: (response: any) => Promise<void>;
  extractData?: (response: any) => any;
}

export interface WorkflowResult {
  success: boolean;
  steps: Array<{
    name: string;
    status: number;
    passed: boolean;
    error?: string;
    data?: any;
    duration: number;
  }>;
  totalDuration: number;
  data: Record<string, any>;
}

/**
 * Execute a multi-step workflow test
 */
export async function executeWorkflow(
  steps: WorkflowStep[],
  context: Record<string, any> = {}
): Promise<WorkflowResult> {
  const workflowSteps: WorkflowResult['steps'] = [];
  const workflowData: Record<string, any> = { ...context };
  const startTime = Date.now();

  try {
    for (const step of steps) {
      const stepStartTime = Date.now();
      
      try {
        // Replace placeholders in options with context data
        const processedOptions = processWorkflowOptions(step.options, workflowData);
        
        const response = await testApiEndpoint(
          step.handler,
          step.url,
          processedOptions
        );

        // Extract data if extractor provided
        if (step.extractData) {
          const extracted = step.extractData(response);
          Object.assign(workflowData, extracted);
        }

        const duration = Date.now() - stepStartTime;
        let passed = response.status >= 200 && response.status < 300;

        // Run assertions if provided - they can override the passed status
        if (step.assertions) {
          try {
            await step.assertions(response);
            // If assertions pass, mark step as passed even if status is 4xx/5xx
            // (e.g., for error recovery workflows where we expect failures)
            passed = true;
          } catch (error: any) {
            // Assertion failed
            passed = false;
            workflowSteps.push({
              name: step.name,
              status: response.status,
              passed: false,
              error: error.message,
              data: response.data,
              duration,
            });
            break;
          }
        }

        workflowSteps.push({
          name: step.name,
          status: response.status,
          passed,
          data: response.data,
          duration,
        });

        // Stop workflow if step failed (unless assertions passed)
        if (!passed) {
          break;
        }
      } catch (error: any) {
        const duration = Date.now() - stepStartTime;
        workflowSteps.push({
          name: step.name,
          status: 500,
          passed: false,
          error: error.message,
          duration,
        });
        break;
      }
    }
  } catch (error: any) {
    // Handle workflow-level errors
  }

  const totalDuration = Date.now() - startTime;
  const success = workflowSteps.every(s => s.passed);

  return {
    success,
    steps: workflowSteps,
    totalDuration,
    data: workflowData,
  };
}

/**
 * Process workflow options, replacing placeholders with context data
 */
function processWorkflowOptions(
  options: any,
  context: Record<string, any>
): any {
  if (typeof options !== 'object' || options === null) {
    return options;
  }

  if (Array.isArray(options)) {
    return options.map(item => processWorkflowOptions(item, context));
  }

  const processed: any = {};

  for (const [key, value] of Object.entries(options)) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const placeholder = value.slice(2, -2).trim();
      processed[key] = getNestedValue(context, placeholder) ?? value;
    } else if (typeof value === 'object' && value !== null) {
      processed[key] = processWorkflowOptions(value, context);
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Complete user onboarding workflow
 */
export async function testUserOnboardingWorkflow(
  handlers: {
    signup: (request: NextRequest) => Promise<Response>;
    createProfile: (request: NextRequest) => Promise<Response>;
    startFirstScenario: (request: NextRequest) => Promise<Response>;
    completeScenario: (request: NextRequest) => Promise<Response>;
    viewAnalytics: (request: NextRequest) => Promise<Response>;
  }
): Promise<WorkflowResult> {
  const mockUser = generateMockUser();
  const mockScenario = generateMockScenario();

  const steps: WorkflowStep[] = [
    {
      name: 'User Signup',
      handler: handlers.signup,
      url: '/api/auth/signup',
      options: {
        method: 'POST',
        body: {
          email: mockUser.email,
          password: 'TestPassword123!',
        },
      },
      extractData: (response) => ({
        userId: response.data.user?.id || response.data.id,
        token: response.data.token,
      }),
    },
    {
      name: 'Create User Profile',
      handler: handlers.createProfile,
      url: '/api/users/profile',
      options: {
        method: 'POST',
        headers: {
          Authorization: 'Bearer {{token}}',
        },
        body: {
          userId: '{{userId}}',
          username: mockUser.username,
          role: 'user',
        },
      },
    },
    {
      name: 'Start First Scenario',
      handler: handlers.startFirstScenario,
      url: '/api/scenarios/start',
      options: {
        method: 'POST',
        headers: {
          Authorization: 'Bearer {{token}}',
        },
        body: {
          scenarioId: mockScenario.id,
          userId: '{{userId}}',
        },
      },
      extractData: (response) => ({
        sessionId: response.data.sessionId,
      }),
    },
    {
      name: 'Complete Scenario',
      handler: handlers.completeScenario,
      url: '/api/scenarios/complete',
      options: {
        method: 'POST',
        headers: {
          Authorization: 'Bearer {{token}}',
        },
        body: {
          sessionId: '{{sessionId}}',
          score: 85,
        },
      },
    },
    {
      name: 'View Analytics',
      handler: handlers.viewAnalytics,
      url: '/api/analytics',
      options: {
        method: 'GET',
        headers: {
          Authorization: 'Bearer {{token}}',
        },
        query: {
          userId: '{{userId}}',
        },
      },
      assertions: async (response) => {
        if (!response.data.stats) {
          throw new Error('Analytics stats not found');
        }
        if (response.data.stats.totalScenarios !== 1) {
          throw new Error('Expected 1 completed scenario');
        }
      },
    },
  ];

  return executeWorkflow(steps);
}

/**
 * Role-play conversation workflow
 */
export async function testRoleplayConversationWorkflow(
  handlers: {
    startRoleplay: (request: NextRequest) => Promise<Response>;
    submitTurn: (request: NextRequest) => Promise<Response>;
    getFeedback: (request: NextRequest) => Promise<Response>;
    endSession: (request: NextRequest) => Promise<Response>;
  },
  scenarioId: string,
  userId: string
): Promise<WorkflowResult> {
  const conversationTurns = [
    { message: 'Hello, I\'m interested in learning more about your product.' },
    { message: 'What are the key features?' },
    { message: 'How does pricing work?' },
    { message: 'Can we schedule a demo?' },
  ];

  const steps: WorkflowStep[] = [
    {
      name: 'Start Roleplay Session',
      handler: handlers.startRoleplay,
      url: '/api/roleplay',
      options: {
        method: 'POST',
        body: {
          scenarioInput: {
            turn_number: 0,
            scenario_id: scenarioId,
            objection_category: 'price_objection',
            objection_statement: 'This seems expensive',
          },
          persona: {
            name: 'Test Persona',
            currentSolution: 'Current Solution',
            primaryGoal: 'Test Goal',
            skepticism: 'Moderate',
            tone: 'Professional',
          },
          conversationHistory: [],
        },
      },
      extractData: (response) => ({
        sessionId: response.data.sessionId,
        conversationHistory: response.data.conversationHistory || [],
      }),
    },
  ];

  // Add conversation turns
  for (let i = 0; i < conversationTurns.length; i++) {
    const turn = conversationTurns[i];
    steps.push({
      name: `Submit Turn ${i + 1}`,
      handler: handlers.submitTurn,
      url: '/api/roleplay',
      options: {
        method: 'POST',
        body: {
          scenarioInput: {
            turn_number: i + 1,
            scenario_id: scenarioId,
            objection_category: 'price_objection',
            objection_statement: turn.message,
          },
          persona: {
            name: 'Test Persona',
            currentSolution: 'Current Solution',
            primaryGoal: 'Test Goal',
            skepticism: 'Moderate',
            tone: 'Professional',
          },
          conversationHistory: '{{conversationHistory}}',
        },
      },
      extractData: (response) => ({
        conversationHistory: response.data.conversationHistory || [],
        lastScore: response.data.score,
      }),
      assertions: async (response) => {
        if (!response.data.agentResponse) {
          throw new Error('Agent response not found');
        }
        if (response.data.score === undefined) {
          throw new Error('Score not found');
        }
      },
    });
  }

  // End session
  steps.push({
    name: 'End Session',
    handler: handlers.endSession,
    url: '/api/scenarios/complete',
    options: {
      method: 'POST',
      body: {
        sessionId: '{{sessionId}}',
        userId,
        finalScore: '{{lastScore}}',
      },
    },
  });

  return executeWorkflow(steps, { scenarioId, userId });
}

/**
 * Analytics tracking workflow
 */
export async function testAnalyticsTrackingWorkflow(
  handlers: {
    trackEvent: (request: NextRequest) => Promise<Response>;
    getStats: (request: NextRequest) => Promise<Response>;
    getEvents: (request: NextRequest) => Promise<Response>;
  },
  userId: string
): Promise<WorkflowResult> {
  const events = [
    { eventType: 'scenario_start', scenarioId: 'scenario-1' },
    { eventType: 'turn_submit', scenarioId: 'scenario-1', turnNumber: 1 },
    { eventType: 'turn_submit', scenarioId: 'scenario-1', turnNumber: 2 },
    { eventType: 'scenario_complete', scenarioId: 'scenario-1', score: 85 },
  ];

  const steps: WorkflowStep[] = [];

  // Track all events
  for (const event of events) {
    steps.push({
      name: `Track Event: ${event.eventType}`,
      handler: handlers.trackEvent,
      url: '/api/analytics',
      options: {
        method: 'POST',
        body: {
          ...event,
          userId,
          timestamp: new Date().toISOString(),
        },
      },
      assertions: async (response) => {
        if (response.status !== 200) {
          throw new Error(`Failed to track event: ${response.data.error}`);
        }
      },
    });
  }

  // Get stats
  steps.push({
    name: 'Get Analytics Stats',
    handler: handlers.getStats,
    url: '/api/analytics',
    options: {
      method: 'GET',
      query: {
        userId,
        includeStats: 'true',
      },
    },
    assertions: async (response) => {
      if (!response.data.stats) {
        throw new Error('Stats not found');
      }
      if (response.data.stats.totalScenarios !== 1) {
        throw new Error('Expected 1 scenario');
      }
    },
  });

  // Get events
  steps.push({
    name: 'Get Analytics Events',
    handler: handlers.getEvents,
    url: '/api/analytics',
    options: {
      method: 'GET',
      query: {
        userId,
      },
    },
    assertions: async (response) => {
      if (!Array.isArray(response.data.events)) {
        throw new Error('Events should be an array');
      }
      if (response.data.events.length !== events.length) {
        throw new Error(`Expected ${events.length} events, got ${response.data.events.length}`);
      }
    },
  });

  return executeWorkflow(steps, { userId });
}

/**
 * Error recovery workflow
 */
export async function testErrorRecoveryWorkflow(
  handlers: {
    failingOperation: (request: NextRequest) => Promise<Response>;
    retryOperation: (request: NextRequest) => Promise<Response>;
    fallbackOperation: (request: NextRequest) => Promise<Response>;
  }
): Promise<WorkflowResult> {
  const steps: WorkflowStep[] = [
    {
      name: 'Attempt Primary Operation',
      handler: handlers.failingOperation,
      url: '/api/test/failing',
      options: {
        method: 'POST',
        body: { test: 'data' },
      },
      assertions: async (response) => {
        // Expect failure
        if (response.status < 400) {
          throw new Error('Expected operation to fail');
        }
      },
    },
    {
      name: 'Retry Operation',
      handler: handlers.retryOperation,
      url: '/api/test/retry',
      options: {
        method: 'POST',
        body: { test: 'data', retry: true },
      },
      assertions: async (response) => {
        // Should succeed on retry
        if (response.status >= 400) {
          throw new Error('Retry should succeed');
        }
      },
    },
    {
      name: 'Fallback Operation',
      handler: handlers.fallbackOperation,
      url: '/api/test/fallback',
      options: {
        method: 'POST',
        body: { test: 'data', fallback: true },
      },
      assertions: async (response) => {
        // Fallback should always work
        if (response.status >= 400) {
          throw new Error('Fallback should succeed');
        }
      },
    },
  ];

  return executeWorkflow(steps);
}

/**
 * Performance workflow test
 */
export async function testPerformanceWorkflow(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    iterations: number;
    concurrency: number;
    maxDuration: number;
  }
): Promise<{
  success: boolean;
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  errorRate: number;
  results: Array<{ duration: number; status: number }>;
}> {
  const { iterations, concurrency, maxDuration } = options;
  const results: Array<{ duration: number; status: number }> = [];

  for (let i = 0; i < iterations; i++) {
    const batch = Array.from({ length: concurrency }, async () => {
      const start = Date.now();
      const response = await testApiEndpoint(handler, url);
      const duration = Date.now() - start;
      return { duration, status: response.status };
    });

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }

  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const errors = results.filter(r => r.status >= 400).length;

  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p95Duration = durations[Math.floor(durations.length * 0.95)];
  const p99Duration = durations[Math.floor(durations.length * 0.99)];
  const errorRate = errors / results.length;

  const success = averageDuration < maxDuration && errorRate < 0.01;

  return {
    success,
    averageDuration,
    p95Duration,
    p99Duration,
    errorRate,
    results,
  };
}

/**
 * Data consistency workflow test
 */
export async function testDataConsistencyWorkflow(
  handlers: {
    create: (request: NextRequest) => Promise<Response>;
    read: (request: NextRequest) => Promise<Response>;
    update: (request: NextRequest) => Promise<Response>;
    delete: (request: NextRequest) => Promise<Response>;
  },
  testData: any
): Promise<WorkflowResult> {
  const steps: WorkflowStep[] = [
    {
      name: 'Create Resource',
      handler: handlers.create,
      url: '/api/test/create',
      options: {
        method: 'POST',
        body: testData,
      },
      extractData: (response) => ({
        resourceId: response.data.id,
      }),
    },
    {
      name: 'Read Resource',
      handler: handlers.read,
      url: '/api/test/read',
      options: {
        method: 'GET',
        query: {
          id: '{{resourceId}}',
        },
      },
      assertions: async (response) => {
        if (!response.data) {
          throw new Error('Resource not found');
        }
        // Verify data consistency
        for (const [key, value] of Object.entries(testData)) {
          if (response.data[key] !== value) {
            throw new Error(`Data inconsistency: ${key} expected ${value}, got ${response.data[key]}`);
          }
        }
      },
    },
    {
      name: 'Update Resource',
      handler: handlers.update,
      url: '/api/test/update',
      options: {
        method: 'PUT',
        body: {
          id: '{{resourceId}}',
          ...testData,
          updated: true,
        },
      },
    },
    {
      name: 'Verify Update',
      handler: handlers.read,
      url: '/api/test/read',
      options: {
        method: 'GET',
        query: {
          id: '{{resourceId}}',
        },
      },
      assertions: async (response) => {
        if (response.data.updated !== true) {
          throw new Error('Update not persisted');
        }
      },
    },
    {
      name: 'Delete Resource',
      handler: handlers.delete,
      url: '/api/test/delete',
      options: {
        method: 'DELETE',
        body: {
          id: '{{resourceId}}',
        },
      },
    },
    {
      name: 'Verify Deletion',
      handler: handlers.read,
      url: '/api/test/read',
      options: {
        method: 'GET',
        query: {
          id: '{{resourceId}}',
        },
      },
      assertions: async (response) => {
        if (response.status !== 404) {
          throw new Error('Resource should be deleted');
        }
      },
    },
  ];

  return executeWorkflow(steps);
}

