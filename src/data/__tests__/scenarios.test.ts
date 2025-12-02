import { scenarios, objectionCategories } from '@/data/scenarios'
import { Scenario } from '@/types/roleplay'

describe('Scenarios Data', () => {
  it('should have scenarios defined', () => {
    expect(scenarios).toBeDefined()
    expect(Array.isArray(scenarios)).toBe(true)
    expect(scenarios.length).toBeGreaterThan(0)
  })

  it('should have valid scenario structure', () => {
    scenarios.forEach((scenario: Scenario) => {
      expect(scenario).toHaveProperty('id')
      expect(scenario).toHaveProperty('persona')
      expect(scenario).toHaveProperty('objection_category')
      expect(scenario).toHaveProperty('objection_statement')
      expect(scenario).toHaveProperty('keyPoints')
      
      expect(typeof scenario.id).toBe('string')
      expect(scenario.id.length).toBeGreaterThan(0)
      
      expect(scenario.persona).toHaveProperty('name')
      expect(scenario.persona).toHaveProperty('currentSolution')
      expect(scenario.persona).toHaveProperty('primaryGoal')
      expect(scenario.persona).toHaveProperty('skepticism')
      expect(scenario.persona).toHaveProperty('tone')
      
      expect(Array.isArray(scenario.keyPoints)).toBe(true)
      expect(scenario.keyPoints.length).toBeGreaterThan(0)
    })
  })

  it('should have unique scenario IDs', () => {
    const ids = scenarios.map(s => s.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })

  it('should have valid objection categories', () => {
    scenarios.forEach((scenario: Scenario) => {
      expect(objectionCategories).toContain(scenario.objection_category)
    })
  })

  it('should have objection categories defined', () => {
    expect(objectionCategories).toBeDefined()
    expect(Array.isArray(objectionCategories)).toBe(true)
    expect(objectionCategories.length).toBeGreaterThan(0)
  })
})

