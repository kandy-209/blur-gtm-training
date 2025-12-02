import '@testing-library/jest-dom'

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID = 'test-agent-id'
process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-key'

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
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
  })
)

// Mock Request and Response for Next.js API routes
global.Request = class Request {
  constructor(input, init) {
    this.url = typeof input === 'string' ? input : input.url
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = init?.body
  }
}

global.Response = class Response {
  constructor(body, init) {
    this._body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
  }
  json() {
    return Promise.resolve(typeof this._body === 'string' ? JSON.parse(this._body) : this._body)
  }
  text() {
    return Promise.resolve(typeof this._body === 'string' ? this._body : JSON.stringify(this._body))
  }
  static json(data, init) {
    return new Response(JSON.stringify(data), init)
  }
}

global.Headers = class Headers {
  constructor(init) {
    this._headers = {}
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers[key.toLowerCase()] = value
      })
    }
  }
  get(name) {
    return this._headers[name.toLowerCase()] || null
  }
  set(name, value) {
    this._headers[name.toLowerCase()] = value
  }
}

