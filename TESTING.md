# Testing Guide

Comprehensive guide for testing the backend and APIs.

## Quick Start

```bash
# Run all tests
npm run test:all

# Run backend API tests
npm run test:backend

# Run integration tests
npm run test:integration

# Run specific test suites
npm run test:api
npm run test:domain
npm run test:ui
```

## Testing Infrastructure

### Test Utilities

Located in `src/lib/testing/`:

- **`api-test-utils.ts`** - API endpoint testing helpers
- **`mock-data.ts`** - Mock data generators
- **`db-test-utils.ts`** - Database testing utilities
- **`integration-helpers.ts`** - Integration test helpers

### Enhanced Test Utils

Located in `src/__tests__/setup/`:

- **`enhanced-test-utils.ts`** - Extended React testing utilities
- **`test-utils.tsx`** - Basic test utilities

## Writing Tests

### API Tests

```typescript
import { testApiEndpoint, assertApiResponse } from '@/lib/testing/api-test-utils';
import { generateMockEmailData } from '@/lib/testing/mock-data';

describe('Email API', () => {
  it('should generate email', async () => {
    const handler = (await import('@/app/api/llm/generate-email/route')).POST;
    const emailData = generateMockEmailData();
    
    const response = await testApiEndpoint(handler, '/api/llm/generate-email', {
      method: 'POST',
      body: emailData,
    });
    
    assertApiResponse(response, 200, (data) => {
      return data.subject && data.body && data.cta;
    });
  });
});
```

### Database Tests

```typescript
import { createTestDatabase, assertRecordExists } from '@/lib/testing/db-test-utils';

describe('User Database', () => {
  let db: Awaited<ReturnType<typeof createTestDatabase>>;
  
  beforeAll(async () => {
    db = await createTestDatabase();
  });
  
  afterAll(async () => {
    await db.cleanup();
  });
  
  it('should create user', async () => {
    const user = await db.createUser({ email: 'test@example.com' });
    expect(user.id).toBeDefined();
    
    const exists = await assertRecordExists('user_profiles', { id: user.id });
    expect(exists).toBe(true);
  });
});
```

### Integration Tests

```typescript
import { setupIntegrationTest, testUserFlow } from '@/lib/testing/integration-helpers';

describe('User Flow', () => {
  it('should complete full flow', async () => {
    const context = await setupIntegrationTest();
    
    try {
      // Test your flow here
      expect(context.userId).toBeDefined();
    } finally {
      await context.cleanup();
    }
  });
});
```

## Mock Data

Generate realistic test data:

```typescript
import {
  generateMockScenario,
  generateMockUserProfile,
  generateMockCompany,
  generateMockEmailData,
  generateMockArray,
} from '@/lib/testing/mock-data';

// Single items
const scenario = generateMockScenario();
const user = generateMockUserProfile();
const company = generateMockCompany();

// Arrays
const scenarios = generateMockArray(generateMockScenario, 10);
```

## Test Scripts

### Backend Test Script

Tests all APIs and database connections:

```bash
bash scripts/test-backend.sh
```

Tests:
- Database health
- Analytics API
- Company enrichment
- Email generation
- Rate limiting
- Error handling
- Performance

### Integration Test Script

Runs comprehensive integration tests:

```bash
node scripts/test-integration.js
```

Runs:
- Type checking
- Unit tests
- API tests
- Backend tests

## Best Practices

1. **Always cleanup**: Use `createTestDatabase()` and call `cleanup()` after tests
2. **Use mock data**: Generate realistic test data with `mock-data.ts`
3. **Test error cases**: Test validation, rate limiting, and error handling
4. **Isolate tests**: Each test should be independent
5. **Use descriptive names**: Test names should clearly describe what they test

## Performance Testing

```typescript
import { testPerformance } from '@/lib/testing/api-test-utils';

const perf = await testPerformance(handler, '/api/endpoint', {}, 10);
console.log(`Average: ${perf.averageTime}ms`);
```

## Load Testing

```typescript
import { loadTest } from '@/lib/testing/integration-helpers';

const results = await loadTest(handler, '/api/endpoint', {
  concurrent: 5,
  iterations: 10,
});
```

## Troubleshooting

### Tests failing due to database

- Ensure Supabase is configured
- Check environment variables
- Verify database tables exist

### Mock data issues

- Check if `@faker-js/faker` is installed (optional)
- Fallback implementation is used if not available

### API tests timing out

- Check if server is running: `npm run dev`
- Verify BASE_URL environment variable
- Check network connectivity

## Continuous Integration

Add to your CI pipeline:

```yaml
- name: Run tests
  run: |
    npm install
    npm run test:all
```

