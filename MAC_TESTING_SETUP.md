# Mac Testing & Debugging Setup

This Mac is configured for **testing and debugging** while your PC handles development.

## Quick Start

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Debug specific test file
npm test -- conversation-agent.test.ts

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest conversation-agent.test.ts
```

## Test Structure

```
src/__tests__/
├── setup/
│   └── test-utils.tsx          # Shared test utilities
├── domain/                      # Domain layer tests
│   └── company.test.ts
├── infrastructure/              # Infrastructure tests
│   └── agents/
│       ├── conversation-agent.test.ts
│       └── persona-generation.test.ts
└── api/                         # API route tests
    └── discovery-call.test.ts
```

## Testing Workflow

### 1. **Write Tests First** (TDD)
```bash
# Create test file
touch src/__tests__/domain/new-feature.test.ts

# Write test
# Run test (should fail)
npm test -- new-feature.test.ts

# Implement feature
# Run test (should pass)
npm test -- new-feature.test.ts
```

### 2. **Debug Failing Tests**
```bash
# Run specific test with verbose output
npm test -- conversation-agent.test.ts --verbose

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest conversation-agent.test.ts

# Then open Chrome: chrome://inspect
```

### 3. **Coverage Analysis**
```bash
# Generate coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

## Debugging Setup

### VS Code Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest: Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${relativeFile}", "--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest: Watch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--watch", "--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Chrome DevTools Debugging

```bash
# Start Jest with inspector
node --inspect-brk node_modules/.bin/jest

# Open Chrome DevTools
# Navigate to: chrome://inspect
# Click "inspect" under your Node process
```

## Test Categories

### Unit Tests
- Domain entities and value objects
- Use cases
- Agents
- Utilities

### Integration Tests
- API routes
- Repository implementations
- Agent interactions

### E2E Tests (Future)
- Full user workflows
- Discovery call sessions

## Common Test Patterns

### Testing Domain Entities
```typescript
import { Company } from '@/domain/entities/company';

describe('Company', () => {
  it('should create company', () => {
    const company = Company.create({
      name: 'Test',
      domain: 'test.com',
    });
    expect(company.name).toBe('Test');
  });
});
```

### Testing Agents
```typescript
import { ConversationAgent } from '@/infrastructure/agents/conversation/conversation-agent';

describe('ConversationAgent', () => {
  it('should generate response', async () => {
    const agent = new ConversationAgent();
    const response = await agent.generateResponse('Hello', context);
    expect(response.message).toBeTruthy();
  });
});
```

### Testing API Routes
```typescript
import { POST } from '@/app/api/discovery-call/create/route';

describe('POST /api/discovery-call/create', () => {
  it('should create call', async () => {
    const request = new NextRequest('...', { method: 'POST', body: '...' });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## Coverage Goals

- **Domain Layer**: 90%+
- **Application Layer**: 85%+
- **Infrastructure**: 80%+
- **API Routes**: 75%+
- **Components**: 70%+

## Continuous Testing

```bash
# Watch mode - runs tests on file changes
npm run test:watch

# Coverage watch
npm run test:coverage -- --watch
```

## Debugging Tips

1. **Use `console.log` strategically** - Don't remove, comment out
2. **Use `debugger` statements** - Works with Node inspector
3. **Test in isolation** - Use `--testNamePattern` to run specific tests
4. **Mock external dependencies** - Use Jest mocks for APIs
5. **Check test output** - Look for error messages and stack traces

## Next Steps

1. ✅ Test setup complete
2. ✅ Test utilities created
3. ⏳ Add more domain tests
4. ⏳ Add more agent tests
5. ⏳ Add E2E tests
6. ⏳ Set up CI/CD testing

## Mac-Specific Commands

```bash
# Run tests in background
npm test &

# Generate test report
npm run test:coverage && open coverage/lcov-report/index.html

# Watch tests with notifications (macOS)
npm run test:watch -- --notify
```

