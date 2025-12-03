// Mock Next.js server components for testing
// Ensure Response and Request are available
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: ReadableStream | null = null;
    bodyUsed = false;
    headers: Headers;
    ok: boolean;
    redirected: boolean;
    status: number;
    statusText: string;
    type: ResponseType;
    url: string;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.headers = new Headers(init?.headers);
      this.status = init?.status ?? 200;
      this.statusText = init?.statusText ?? '';
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
      this.type = 'default';
      this.url = '';
      
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
        const chunks: Uint8Array[] = [];
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
        const chunks: Uint8Array[] = [];
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
  } as any;
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    body: ReadableStream | null = null;
    bodyUsed = false;
    headers: Headers;
    method: string;
    redirect: RequestRedirect;
    referrer: string;
    url: string;
    private _init?: RequestInit;

    constructor(input: RequestInfo | URL, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.toString();
      this.method = init?.method ?? 'GET';
      this.headers = new Headers(init?.headers);
      this.redirect = 'follow';
      this.referrer = '';
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
  } as any;
}

export class NextResponse extends (global.Response as typeof Response) {
  static json(body: any, init?: ResponseInit) {
    return new NextResponse(JSON.stringify(body), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  }
}

export class NextRequest extends Request {
  private _init?: RequestInit;
  
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init)
    this._init = init;
  }
  
  async json() {
    // Handle string body (from test mocks) - check init first
    if (this._init?.body && typeof this._init.body === 'string') {
      try {
        return JSON.parse(this._init.body || '{}');
      } catch {
        return {};
      }
    }
    
    // Try to get body from Request
    if (this.body) {
      // Handle ReadableStream body
      if (this.body instanceof ReadableStream) {
        const reader = this.body.getReader();
        const chunks: Uint8Array[] = [];
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
    }
    
    // Fallback to text parsing
    try {
      const text = await this.text();
      return JSON.parse(text || '{}');
    } catch {
      return {};
    }
  }
  
  async text() {
    // If body is already a string (from test mocks), return it
    if (this._init?.body && typeof this._init.body === 'string') {
      return this._init.body;
    }
    
    // Try to read from Request body
    try {
      return await super.text();
    } catch {
      return '';
    }
  }
}

