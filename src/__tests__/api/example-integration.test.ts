/**
 * Example Integration Test
 * Demonstrates how to use the testing utilities
 */

import { testApiEndpoint } from '@/lib/testing/api-test-utils';
import { setupIntegrationTest, testUserFlow, testApiWithDatabase } from '@/lib/testing/integration-helpers';
import { generateMockEmailData } from '@/lib/testing/mock-data';

// Mock Supabase client for integration tests
jest.mock('@/lib/supabase-client', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: { id: 'test_user_123', email: 'test@example.com' }, 
            error: null 
          }),
        }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
        like: jest.fn().mockResolvedValue({ error: null }),
      }),
    })),
  };
  return {
    getSupabaseClient: jest.fn(() => mockSupabase),
  };
});

// Example: Test database health endpoint
describe('Database Health API', () => {
  it('should return healthy status', async () => {
    // This is a placeholder - you'll need to import the actual handler
    // const handler = (await import('@/app/api/db/health/route')).GET;
    
    // const response = await testApiEndpoint(handler, '/api/db/health');
    // expect(response.status).toBe(200);
    // expect(response.data.connected).toBe(true);
  });
});

// Example: Test email generation with database
describe('Email Generation API', () => {
  it('should generate email with proper structure', async () => {
    // const handler = (await import('@/app/api/llm/generate-email/route')).POST;
    // const emailData = generateMockEmailData();
    
    // const response = await testApiEndpoint(handler, '/api/llm/generate-email', {
    //   method: 'POST',
    //   body: emailData,
    // });
    
    // expect(response.status).toBe(200);
    // expect(response.data).toHaveProperty('subject');
    // expect(response.data).toHaveProperty('body');
    // expect(response.data).toHaveProperty('cta');
  });
});

// Example: Integration test with database
describe('User Flow Integration', () => {
  it('should complete full user flow', async () => {
    const context = await setupIntegrationTest();
    
    try {
      // Test user creation, scenario start, turn submission, analytics
      // This demonstrates the full flow
      
      expect(context.userId).toBeDefined();
      expect(context.scenarioId).toBeDefined();
    } finally {
      await context.cleanup();
    }
  });
});

