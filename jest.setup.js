// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.OPENAI_API_KEY = 'test-key'
process.env.ANTHROPIC_API_KEY = 'test-key'
process.env.ALPHA_VANTAGE_API_KEY = 'test-api-key'

// Ensure Response and Request are available for Next.js server mocks
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.headers = new Headers(init?.headers);
      this.status = init?.status ?? 200;
      this.statusText = init?.statusText ?? '';
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
      this.type = 'default';
      this.url = '';
      this.bodyUsed = false;
      this.body = null;
      
      if (body) {
        if (typeof body === 'string') {
          this.body = new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode(body));
              controller.close();
            },
          });
        }
      }
    }

    async json() {
      if (this.body) {
        const reader = this.body.getReader();
        const chunks = [];
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) chunks.push(value);
        }
        const decoder = new TextDecoder();
        const text = chunks.map(chunk => decoder.decode(chunk)).join('');
        return JSON.parse(text || '{}');
      }
      return {};
    }

    async text() {
      if (this.body) {
        const reader = this.body.getReader();
        const chunks = [];
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) chunks.push(value);
        }
        const decoder = new TextDecoder();
        return chunks.map(chunk => decoder.decode(chunk)).join('');
      }
      return '';
    }

    clone() {
      return this;
    }
  };
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.toString();
      this.method = init?.method ?? 'GET';
      this.headers = new Headers(init?.headers);
      this.redirect = 'follow';
      this.referrer = '';
      this.bodyUsed = false;
      this.body = null;
      this._init = init;
    }

    async json() {
      if (this._init?.body && typeof this._init.body === 'string') {
        try {
          return JSON.parse(this._init.body || '{}');
        } catch {
          return {};
        }
      }
      return {};
    }

    async text() {
      if (this._init?.body && typeof this._init.body === 'string') {
        return this._init.body;
      }
      return '';
    }

    clone() {
      return this;
    }
  };
}

// Suppress console errors in tests (optional - remove if you want to see them)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
