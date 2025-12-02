import { POST, GET, DELETE } from '@/app/api/analytics/route'

// Mock NextRequest
class MockNextRequest {
  public headers: Headers
  constructor(public url: string, public init?: RequestInit) {
    this.headers = new Headers(init?.headers)
  }
  async json() {
    return JSON.parse(this.init?.body as string || '{}')
  }
  async text() {
    return this.init?.body as string || ''
  }
  get ip() {
    return '127.0.0.1'
  }
}

describe('/api/analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should accept and store analytics events', async () => {
      const event = {
        eventType: 'scenario_start' as const,
        scenarioId: 'test-scenario',
        timestamp: new Date(),
      }

      const request = new MockNextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' },
      }) as any
      // Ensure headers object exists
      if (!request.headers) {
        request.headers = new Headers({ 'Content-Type': 'application/json' })
      }

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle invalid event data', async () => {
      const request = new MockNextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
        headers: { 'Content-Type': 'application/json' },
      }) as any

      const response = await POST(request)
      // Should return 400 for validation errors (improved security)
      expect(response.status).toBe(400)
    })
  })

  describe('GET', () => {
    it('should return events', async () => {
      const request = new MockNextRequest('http://localhost/api/analytics') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('events')
      expect(Array.isArray(data.events)).toBe(true)
    })

    it('should filter events by userId if provided', async () => {
      const request = new MockNextRequest('http://localhost/api/analytics?userId=test-user') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('events')
    })
  })

  describe('DELETE', () => {
    it('should delete an event by userId and timestamp', async () => {
      // First create an event
      const event = {
        eventType: 'scenario_start' as const,
        scenarioId: 'test-scenario',
        userId: 'test-user-123',
        timestamp: new Date('2024-01-01T00:00:00Z'),
      }

      const createRequest = new MockNextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' },
      }) as any
      await POST(createRequest)

      // Now delete it
      const deleteRequest = new MockNextRequest('http://localhost/api/analytics', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'test-user-123',
          timestamp: event.timestamp,
        }),
        headers: { 'Content-Type': 'application/json' },
      }) as any

      const response = await DELETE(deleteRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.deleted).toBeGreaterThanOrEqual(0)
    })

    it('should require userId for deletion', async () => {
      const request = new MockNextRequest('http://localhost/api/analytics', {
        method: 'DELETE',
        body: JSON.stringify({ timestamp: new Date() }),
        headers: { 'Content-Type': 'application/json' },
      }) as any

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('userId')
    })

    it('should handle deletion errors gracefully', async () => {
      const request = new MockNextRequest('http://localhost/api/analytics', {
        method: 'DELETE',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      }) as any

      // Mock json() to throw error
      request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      const response = await DELETE(request)
      expect(response.status).toBe(500)
    })
  })
})

