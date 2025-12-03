// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder for Jest environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const utf8 = [];
      for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        } else {
          i++;
          charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
      }
      return new Uint8Array(utf8);
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(bytes) {
      let str = '';
      let i = 0;
      while (i < bytes.length) {
        let c = bytes[i++];
        if (c > 127) {
          if (c > 191 && c < 224) {
            c = (c & 31) << 6 | bytes[i++] & 63;
          } else if (c > 223 && c < 240) {
            c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
          } else if (c > 239 && c < 248) {
            c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
          }
        }
        str += String.fromCharCode(c);
      }
      return str;
    }
  };
}

// Polyfill ReadableStream for Jest environment
if (typeof global.ReadableStream === 'undefined') {
  // Simple ReadableStream polyfill for tests
  global.ReadableStream = class ReadableStream {
    constructor(underlyingSource) {
      this._underlyingSource = underlyingSource;
      this._controller = null;
      this._started = false;
      this._chunks = [];
      this._closed = false;
    }

    getReader() {
      if (!this._started && this._underlyingSource?.start) {
        this._started = true;
        const controller = {
          enqueue: (chunk) => {
            this._chunks.push(chunk);
          },
          close: () => {
            this._closed = true;
          },
        };
        this._underlyingSource.start(controller);
      }
      let readIndex = 0;
      return {
        read: async () => {
          if (readIndex >= this._chunks.length) {
            return { done: true, value: undefined };
          }
          const chunk = this._chunks[readIndex++];
          return { done: false, value: chunk };
        },
      };
    }
  };
}

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
      // Store original body content for cloning
      this._bodyContent = body;
      
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
      if (this.bodyUsed) {
        throw new Error('Body already consumed');
      }
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
        this.bodyUsed = true;
        return JSON.parse(text || '{}');
      }
      return {};
    }

    async text() {
      if (this.bodyUsed) {
        throw new Error('Body already consumed');
      }
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
        this.bodyUsed = true;
        return chunks.map(chunk => decoder.decode(chunk)).join('');
      }
      return '';
    }

    clone() {
      // Create a new Response instance with the same data
      // Use stored body content to create a new independent stream
      const cloned = new Response(this._bodyContent, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
      
      cloned.url = this.url;
      cloned.redirected = this.redirected;
      cloned.type = this.type;
      
      return cloned;
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
      // Store body content for cloning
      this._bodyContent = init?.body;
    }

    async json() {
      if (this.bodyUsed) {
        throw new Error('Body already consumed');
      }
      if (this._init?.body && typeof this._init.body === 'string') {
        try {
          this.bodyUsed = true;
          return JSON.parse(this._init.body || '{}');
        } catch {
          return {};
        }
      }
      return {};
    }

    async text() {
      if (this.bodyUsed) {
        throw new Error('Body already consumed');
      }
      if (this._init?.body && typeof this._init.body === 'string') {
        this.bodyUsed = true;
        return this._init.body;
      }
      return '';
    }

    clone() {
      // Create a new Request instance with the same data
      // This allows the clone to be consumed independently
      const cloned = new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this._bodyContent, // Use stored body content
        redirect: this.redirect,
        referrer: this.referrer,
      });
      
      // Clone has its own bodyUsed flag (already false by default)
      // This allows both original and clone to be consumed independently
      
      return cloned;
    }
  };
}

// Suppress console errors in tests (optional - remove if you want to see them)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
