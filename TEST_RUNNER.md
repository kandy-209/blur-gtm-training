# 🚀 Test Runner Guide

## Quick Start

### Windows (PowerShell)
```powershell
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run Windows-specific script
npm run test:windows

# Or directly
powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1
```

### All Platforms
```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (for automated testing)
npm run test:ci
```

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode - reruns on file changes |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ci` | CI mode with coverage |
| `npm run test:windows` | Windows PowerShell runner |
| `npm run test:lighthouse` | Performance audit |
| `npm run test:a11y` | Accessibility check |

## Test Structure

```
src/
├── __tests__/          # Global tests
├── components/
│   └── __tests__/     # Component tests
├── lib/
│   └── __tests__/     # Library tests
└── app/
    └── api/
        └── __tests__/ # API route tests
```

## Running Specific Tests

```bash
# Run specific test file
npm test -- src/components/__tests__/RoleplayEngine.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Roleplay"

# Run tests in specific directory
npm test -- src/components/__tests__/
```

## Coverage Goals

- **Overall Coverage**: >80%
- **Critical Components**: >90%
- **API Routes**: >85%
- **Utilities**: >95%

## Test Types

### Unit Tests
- Component rendering
- Function logic
- Utility functions
- Hooks

### Integration Tests
- API routes
- Database operations
- Authentication flows
- Component interactions

### E2E Tests (Coming Soon)
- User journeys
- Critical workflows
- Cross-browser testing

## Troubleshooting

### Tests failing?
1. Check if dev server is running on port 3000
2. Verify environment variables are set
3. Clear Jest cache: `npm test -- --clearCache`
4. Check test mocks are configured correctly

### Coverage not updating?
1. Delete `.next` folder
2. Run `npm run test:coverage` again
3. Check `jest.config.js` settings

### Windows-specific issues?
1. Use PowerShell (not CMD)
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Use `npm run test:windows` script

## Next Steps

1. ✅ Run `npm test` to see current status
2. ✅ Fix any failing tests
3. ✅ Add tests for new features
4. ✅ Set up CI/CD pipeline
5. ✅ Add E2E testing

---

**Ready?** Run `npm test` now! 🎯

