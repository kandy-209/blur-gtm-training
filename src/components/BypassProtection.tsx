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
