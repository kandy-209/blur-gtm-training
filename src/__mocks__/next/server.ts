// Mock Next.js server components for testing
export class NextResponse extends Response {
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

