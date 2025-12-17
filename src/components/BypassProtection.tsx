'use client';

import { useEffect } from 'react';

// Bypass token from environment or fallback
const BYPASS_TOKEN = process.env.NEXT_PUBLIC_VERCEL_PROTECTION_BYPASS || 'H57sUHKy51E0Jix1JARV0MNeUQmMug4G';

export default function BypassProtection() {
  useEffect(() => {
    if (typeof window === 'undefined' || !BYPASS_TOKEN) return;

    // Check if bypass token is already in URL
    const url = new URL(window.location.href);
    const hasBypass = url.searchParams.has('x-vercel-protection-bypass');
    
    if (!hasBypass) {
      // Add bypass token to current URL without redirect (to avoid loops)
      url.searchParams.set('x-vercel-protection-bypass', BYPASS_TOKEN);
      // Use replaceState instead of redirect to avoid page reload
      window.history.replaceState({}, '', url.toString());
    }

    // Set cookie for API requests
    document.cookie = `x-vercel-protection-bypass=${BYPASS_TOKEN}; path=/; max-age=86400; SameSite=Lax`;

    // Override fetch to add bypass token to all requests
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      // Early check for localhost/debug URLs - prevent fetch entirely to avoid CSP violations
      let urlString: string | null = null;
      
      if (typeof input === 'string') {
        urlString = input;
      } else if (input instanceof URL) {
        urlString = input.toString();
      } else if (input instanceof Request) {
        urlString = input.url;
      }
      
      // If it's a localhost debug URL, prevent fetch entirely to avoid CSP violation
      if (urlString && (urlString.includes('127.0.0.1:7243') || urlString.includes('localhost:7243'))) {
        // Return a promise that never resolves (effectively cancels the request)
        // This prevents CSP violations by not attempting the fetch at all
        // The calling code should have .catch() to handle this silently
        return new Promise(() => {
          // Never resolves - silently cancels the request
          // This prevents the browser from attempting the fetch, avoiding CSP violations
        });
      }
      
      let url: string;
      let urlObj: URL;
      
      if (typeof input === 'string') {
        url = input;
        try {
          urlObj = new URL(url, window.location.origin);
        } catch {
          // If URL parsing fails, use original fetch
          return originalFetch(input, init);
        }
      } else if (input instanceof URL) {
        urlObj = new URL(input.toString());
        url = urlObj.toString();
      } else if (input instanceof Request) {
        url = input.url;
        try {
          urlObj = new URL(url, window.location.origin);
        } catch {
          return originalFetch(input, init);
        }
      } else {
        return originalFetch(input, init);
      }
      
      // Skip modification for localhost/debug endpoints to avoid CSP violations
      if (urlObj.hostname === '127.0.0.1' || urlObj.hostname === 'localhost') {
        // Silently fail for localhost URLs to prevent CSP violations
        return Promise.reject(new Error('Localhost endpoint blocked by CSP'));
      }

      // Add bypass token to query params if not present
      if (!urlObj.searchParams.has('x-vercel-protection-bypass')) {
        urlObj.searchParams.set('x-vercel-protection-bypass', BYPASS_TOKEN);
      }

      // Add bypass header
      const headers = new Headers(init?.headers || {});
      headers.set('x-vercel-protection-bypass', BYPASS_TOKEN);

      // Create new request with updated URL and headers
      const newUrl = urlObj.toString();
      const newInput = typeof input === 'string' 
        ? newUrl 
        : input instanceof URL 
        ? urlObj 
        : input instanceof Request
        ? new Request(newUrl, { ...input, headers })
        : input;

      return originalFetch(newInput, {
        ...init,
        headers,
      });
    };
  }, []);

  return null; // This component doesn't render anything
}
