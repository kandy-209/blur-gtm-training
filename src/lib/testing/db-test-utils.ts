/**
 * Database Testing Utilities
 * Helpers for testing database operations
 */

import { getSupabaseClient } from '@/lib/supabase-client';
import { generateMockUserProfile, generateMockTrainingEvent } from './mock-data';

export interface TestDatabase {
  cleanup: () => Promise<void>;
  createUser: (overrides?: Record<string, any>) => Promise<any>;
  createEvent: (overrides?: Record<string, any>) => Promise<any>;
  getUser: (id: string) => Promise<any>;
  getEvents: (userId?: string) => Promise<any[]>;
}

/**
 * Create a test database instance with cleanup
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const testId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const createdIds: string[] = [];
  
  // Store testId for cleanup
  (createTestDatabase as any).testId = testId;

  return {
    async cleanup() {
      // Clean up all test data
      for (const id of createdIds) {
        try {
          await supabase.from('user_profiles').delete().eq('id', id);
          await supabase.from('user_activity').delete().like('user_id', `%${id}%`);
          await supabase.from('training_events').delete().like('user_id', `%${id}%`);
        } catch (error) {
          console.warn(`Failed to cleanup test data ${id}:`, error);
        }
      }
    },

    async createUser(overrides = {}) {
      const mockUser = generateMockUserProfile({
        id: `${testId}_user_${createdIds.length}`,
        ...overrides,
      });

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(mockUser)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create test user: ${error.message}`);
      }

      createdIds.push(data.id);
      return data;
    },

    async createEvent(overrides = {}) {
      const mockEvent = generateMockTrainingEvent({
        userId: `${testId}_user_0`,
        ...overrides,
      });

      const { data, error } = await supabase
        .from('training_events')
        .insert({
          ...mockEvent,
          timestamp: mockEvent.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create test event: ${error.message}`);
      }

      return data;
    },

    async getUser(id: string) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to get user: ${error.message}`);
      }

      return data;
    },

    async getEvents(userId?: string) {
      let query = supabase.from('training_events').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get events: ${error.message}`);
      }

      return data || [];
    },
  };
}

/**
 * Setup test database with sample data
 */
export async function setupTestDatabase(
  options: {
    users?: number;
    eventsPerUser?: number;
  } = {}
): Promise<TestDatabase> {
  const { users = 3, eventsPerUser = 5 } = options;
  const db = await createTestDatabase();

  // Create test users
  for (let i = 0; i < users; i++) {
    await db.createUser();
  }

  // Create test events
  // Note: This assumes users were created sequentially
  // In a real implementation, you'd track the created user IDs
  for (let i = 0; i < users; i++) {
    for (let j = 0; j < eventsPerUser; j++) {
      await db.createEvent();
    }
  }

  return db;
}

/**
 * Assert database record exists
 */
export async function assertRecordExists(
  table: string,
  conditions: Record<string, any>
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  let query = supabase.from(table).select('*').limit(1);

  Object.entries(conditions).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to check record: ${error.message}`);
  }

  return (data?.length || 0) > 0;
}

/**
 * Assert database record count
 */
export async function assertRecordCount(
  table: string,
  expectedCount: number,
  conditions?: Record<string, any>
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  if (conditions) {
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count records: ${error.message}`);
  }

  if (count !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} records, got ${count}`
    );
  }
}

/**
 * Wait for database operation to complete
 */
export async function waitForDatabase(
  checkFn: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await checkFn()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Database operation timeout');
}

