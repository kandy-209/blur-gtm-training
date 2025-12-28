# Prospect Intelligence Test Suite

## Overview
Comprehensive test suite for the Prospect Intelligence feature covering edge cases, error handling, and integration scenarios.

## Test Files

### 1. `src/lib/prospect-intelligence/__tests__/utils.test.ts`
Tests utility functions:
- **withRetry**: Retry logic with exponential backoff
- **handlePageBlockers**: Cookie banner and popup detection/handling
- **waitForPageReady**: Page loading state detection
- **safeNavigateWithObservation**: Safe navigation with retry and blocker handling

**Edge Cases Tested:**
- ✅ Success on first attempt
- ✅ Retry on failure with exponential backoff
- ✅ Max retries exceeded
- ✅ Zero retries
- ✅ Non-Error exceptions
- ✅ Pages without blockers
- ✅ Cookie banner detection
- ✅ GDPR consent dialogs
- ✅ Page evaluation errors
- ✅ Missing page objects
- ✅ Navigation failures
- ✅ Timeout errors
- ✅ Invalid URLs

### 2. `src/lib/prospect-intelligence/__tests__/research-service-edge-cases.test.ts`
Tests ResearchService edge cases:
- **Initialization**: Missing API keys, multiple providers, priority selection
- **Research**: Invalid URLs, navigation failures, extraction failures, timeouts
- **Error Handling**: Quota errors, auth errors, network errors, cleanup errors

**Edge Cases Tested:**
- ✅ Missing BROWSERBASE_API_KEY
- ✅ Missing BROWSERBASE_PROJECT_ID
- ✅ No LLM API keys configured
- ✅ Multiple LLM keys (priority: Claude > Gemini > OpenAI)
- ✅ STAGEHAND_LLM_PROVIDER override
- ✅ Invalid URLs
- ✅ Navigation failures
- ✅ Extraction failures
- ✅ Timeout errors
- ✅ Missing company information
- ✅ API quota errors (429)
- ✅ Authentication errors (401)
- ✅ Network errors
- ✅ Malformed responses
- ✅ Blocked websites
- ✅ Slow-loading websites
- ✅ Missing careers page
- ✅ Cleanup errors
- ✅ Concurrent requests

### 3. `src/app/api/prospect-intelligence/__tests__/research-route-edge-cases.test.ts`
Tests API route edge cases:
- **Request Validation**: Content type, missing fields, invalid URLs
- **API Key Validation**: Missing keys, multiple providers
- **Error Handling**: Timeouts, quota errors, auth errors, network errors
- **Response Format**: Valid JSON, request IDs, error structure

**Edge Cases Tested:**
- ✅ Non-JSON content type
- ✅ Missing websiteUrl
- ✅ Invalid URL format
- ✅ Empty websiteUrl
- ✅ URLs without protocol
- ✅ Extremely long URLs
- ✅ URLs with special characters
- ✅ No LLM API keys
- ✅ Research timeout (504)
- ✅ Quota errors (429)
- ✅ Authentication errors (401)
- ✅ Network errors
- ✅ Initialization errors
- ✅ Cleanup on error
- ✅ Cleanup errors
- ✅ Valid JSON structure
- ✅ Request ID in responses
- ✅ Concurrent requests

### 4. `src/lib/prospect-intelligence/__tests__/schemas.test.ts`
Tests schema validation:
- **HiringDataSchema**: Complete data, null values, invalid confidence scores
- **TechStackSchema**: Complete data, null framework, invalid confidence enum
- **ICPScoreSchema**: Valid scores, out-of-range scores, invalid priority
- **ProspectIntelligenceSchema**: Complete data, minimal data, URL validation

**Edge Cases Tested:**
- ✅ Complete hiring data
- ✅ Null optional fields
- ✅ Invalid confidence scores (>100, <0)
- ✅ Complete tech stack data
- ✅ Null primary framework
- ✅ Invalid framework confidence enum
- ✅ Valid ICP scores
- ✅ Out-of-range scores (>10, <1)
- ✅ Invalid priority level
- ✅ Complete prospect data
- ✅ Valid URLs
- ✅ Minimal valid data

## Running Tests

```bash
# Run all prospect intelligence tests
npm test -- src/lib/prospect-intelligence/__tests__

# Run specific test file
npm test -- src/lib/prospect-intelligence/__tests__/utils.test.ts

# Run with coverage
npm test -- src/lib/prospect-intelligence/__tests__ --coverage

# Run in watch mode
npm test -- src/lib/prospect-intelligence/__tests__ --watch
```

## Test Coverage Goals

- **Unit Tests**: >90% coverage for utility functions
- **Integration Tests**: >80% coverage for service and API routes
- **Edge Cases**: All error scenarios and boundary conditions tested
- **Schema Validation**: All data structures validated

## Known Issues & Fixes

### Fixed Issues:
1. ✅ Model name format for Stagehand (removed "anthropic/" prefix)
2. ✅ Multi-LLM support (Claude, Gemini, OpenAI)
3. ✅ Error handling for quota/rate limit errors
4. ✅ API key validation and fallback logic
5. ✅ Test mocking for Stagehand and dependencies

### Remaining Test Issues:
- Some tests need better mocking for Stagehand's complex initialization
- API route tests need improved error response handling mocks

## Future Test Additions

- [ ] End-to-end integration tests with real Browserbase (optional)
- [ ] Performance tests for large websites
- [ ] Rate limiting tests
- [ ] Concurrent request stress tests
- [ ] Memory leak detection tests
- [ ] Browser compatibility tests








