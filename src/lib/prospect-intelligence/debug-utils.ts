/**
 * Debug utility - conditionally enables debug telemetry
 * Set ENABLE_DEBUG_TELEMETRY=true in .env.local to enable
 * 
 * NOTE: This is server-side only. Client-side calls are disabled to avoid CSP violations.
 */

const DEBUG_ENABLED = process.env.ENABLE_DEBUG_TELEMETRY === 'true';

export function debugLog(location: string, message: string, data: any): void {
  // Always skip in client-side code to avoid CSP violations
  if (typeof window !== 'undefined') {
    return;
  }

  if (!DEBUG_ENABLED) {
    return; // Silently skip if debug is disabled
  }

  // Only log in development and if explicitly enabled (server-side only)
  if (process.env.NODE_ENV === 'development' && DEBUG_ENABLED) {
    // Use node-fetch or native fetch (Node.js 18+)
    const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    
    fetchFn('http://127.0.0.1:7243/ingest/07b364a5-6862-4730-a70c-26891b09d092', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A'
      })
    }).catch(() => {
      // Silently fail - debug endpoint may not be available
    });
  }
}

