// Client-side helper to bypass Vercel password protection
// This adds the bypass token to all fetch requests

const BYPASS_TOKEN = process.env.NEXT_PUBLIC_VERCEL_PROTECTION_BYPASS;

export function addBypassToUrl(url: string): string {
  if (!BYPASS_TOKEN) return url;
  
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('x-vercel-protection-bypass', BYPASS_TOKEN);
  return urlObj.toString();
}

export function getBypassHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  if (BYPASS_TOKEN) {
    headers['x-vercel-protection-bypass'] = BYPASS_TOKEN;
  }
  return headers;
}

// Override fetch to automatically add bypass token
if (typeof window !== 'undefined' && BYPASS_TOKEN) {
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const headers = new Headers(init?.headers);
    headers.set('x-vercel-protection-bypass', BYPASS_TOKEN);
    
    return originalFetch(input, {
      ...init,
      headers,
    });
  };
}

