import { analytics } from '@/lib/analytics'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Analytics', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset analytics instance
    ;(analytics as any).events = []
    ;(analytics as any).userId = null
  })

  it('should generate a user ID', () => {
    const userId = analytics.getUserId()
    expect(userId).toBeTruthy()
    expect(userId).toMatch(/^user_\d+_[a-z0-9]+$/)
  })

  it('should track events', () => {
    // Mock fetch to return a resolved promise
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }))
    
    analytics.track({
      eventType: 'scenario_start',
      scenarioId: 'test-scenario',
    })

    const events = analytics.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('scenario_start')
    expect(events[0].scenarioId).toBe('test-scenario')
    expect(events[0].userId).toBeTruthy()
    expect(events[0].timestamp).toBeInstanceOf(Date)
  })

  it('should calculate stats correctly', () => {
    // Mock fetch to return a resolved promise
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }))

    analytics.track({
      eventType: 'scenario_complete',
      scenarioId: 'test-1',
      score: 80,
    })
    analytics.track({
      eventType: 'scenario_complete',
      scenarioId: 'test-2',
      score: 90,
    })
    analytics.track({
      eventType: 'turn_submit',
      scenarioId: 'test-1',
      turnNumber: 1,
    })

    const stats = analytics.getStats()
    expect(stats.totalScenarios).toBe(2)
    expect(stats.averageScore).toBe(85)
    expect(stats.totalTurns).toBe(1)
  })

  it('should handle empty stats', () => {
    const stats = analytics.getStats()
    expect(stats.totalScenarios).toBe(0)
    expect(stats.averageScore).toBe(0)
    expect(stats.totalTurns).toBe(0)
  })
})

