# Network Error Handling & CSP Fixes

This document describes the fixes for Content Security Policy violations and network error handling.

## Issues Fixed

### 1. Content Security Policy (CSP) Violations ✅

**Problem**: Debug fetch calls to `127.0.0.1:7243` were causing CSP violations in the browser.

**Solution**:
- Updated `debug-utils.ts` to skip execution in client-side code (`typeof window !== 'undefined'`)
- Removed all debug fetch calls from client-side code
- Made debug logging server-side only
- Updated `BypassProtection.tsx` to skip localhost URLs

**Files Changed**:
- `src/lib/prospect-intelligence/debug-utils.ts` - Added client-side check
- `src/lib/prospect-intelligence/research-service.ts` - Removed debug calls
- `src/lib/prospect-intelligence/utils.ts` - Removed debug calls
- `src/components/BypassProtection.tsx` - Skip localhost URLs

### 2. Network Error Handling ✅

**Problem**: Network errors like `ERR_HTTP2_PROTOCOL_ERROR` were not handled gracefully.

**Solution**:
- Added retry logic with different wait strategies for HTTP/2 errors
- Added timeout handling with shorter timeouts
- Added user-friendly error messages for network errors
- Added error handling in API route

**Files Changed**:
- `src/lib/prospect-intelligence/utils.ts` - Enhanced `safeNavigateWithObservation()`
- `src/app/api/prospect-intelligence/research/route.ts` - Added network error handling

## Error Handling Strategies

### HTTP/2 Protocol Errors
When `ERR_HTTP2_PROTOCOL_ERROR` occurs:
1. First retry with `waitUntil: 'domcontentloaded'` (less strict)
2. If that fails, retry with `waitUntil: 'load'` (even less strict)
3. If still failing, show user-friendly error message

### Timeout Errors
When navigation times out:
1. Retry with shorter timeout (15s instead of 30s)
2. Use less strict wait condition (`domcontentloaded`)
3. Show helpful error message

### Other Network Errors
- Catch all `net::ERR_*` errors
- Provide helpful error messages
- Suggest alternatives (try different website, check bot protection)

## Testing

Run the test script to see test cases:
```bash
node test-network-errors.js
```

### Manual Testing

1. **HTTP/2 Protocol Error**:
   - Try: `https://www.dickssportinggoods.com/`
   - Expected: Retry with different wait strategies, or show helpful error

2. **Timeout Error**:
   - Try: A slow-loading website
   - Expected: Retry with shorter timeout, or show timeout error

3. **Bot Protection**:
   - Try: `https://www.cloudflare.com/`
   - Expected: Show helpful error about bot protection

## CSP Violations - Prevention

To prevent CSP violations:
1. ✅ Debug logging is server-side only
2. ✅ `BypassProtection` skips localhost URLs
3. ✅ All debug fetch calls removed from client code
4. ✅ Debug utility checks for client-side execution

## Debug Logging

Debug logging is disabled by default. To enable:
1. Add `ENABLE_DEBUG_TELEMETRY=true` to `.env.local`
2. Debug logs will only run server-side (no CSP violations)
3. Debug endpoint: `http://127.0.0.1:7243/ingest/...`

## Error Messages

All error messages are now user-friendly:
- Network errors explain the issue and suggest solutions
- Timeout errors suggest trying simpler websites
- Bot protection errors explain why the site might be blocking

## Next Steps

1. Test with various websites to ensure error handling works
2. Monitor for any remaining CSP violations
3. Consider adding more retry strategies if needed
4. Add metrics for error types to track common issues





