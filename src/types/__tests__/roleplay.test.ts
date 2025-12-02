import { Scenario, Persona, AgentResponse } from '@/types/roleplay'

describe('Roleplay Types', () => {
  describe('Persona', () => {
    it('should have required properties', () => {
      const persona: Persona = {
        name: 'Test Persona',
        currentSolution: 'Test Solution',
        primaryGoal: 'Test Goal',
        skepticism: 'Test Skepticism',
        tone: 'Test Tone',
      }

      expect(persona.name).toBe('Test Persona')
      expect(persona.currentSolution).toBe('Test Solution')
      expect(persona.primaryGoal).toBe('Test Goal')
      expect(persona.skepticism).toBe('Test Skepticism')
      expect(persona.tone).toBe('Test Tone')
    })
  })

  describe('AgentResponse', () => {
    it('should have required properties', () => {
      const response: AgentResponse = {
        agent_response_text: 'Test response',
        scoring_feedback: 'Test feedback',
        response_evaluation: 'PASS',
        next_step_action: 'FOLLOW_UP',
        confidence_score: 85,
      }

      expect(response.agent_response_text).toBe('Test response')
      expect(response.scoring_feedback).toBe('Test feedback')
      expect(response.response_evaluation).toBe('PASS')
      expect(response.next_step_action).toBe('FOLLOW_UP')
      expect(response.confidence_score).toBe(85)
    })

    it('should accept valid evaluation values', () => {
      const validEvaluations: AgentResponse['response_evaluation'][] = ['PASS', 'FAIL', 'REJECT']
      validEvaluations.forEach(evaluation => {
        const response: AgentResponse = {
          agent_response_text: 'Test',
          scoring_feedback: 'Test',
          response_evaluation: evaluation,
          next_step_action: 'FOLLOW_UP',
          confidence_score: 50,
        }
        expect(response.response_evaluation).toBe(evaluation)
      })
    })

    it('should accept valid next_step_action values', () => {
      const validActions: AgentResponse['next_step_action'][] = [
        'FOLLOW_UP',
        'REJECT_AND_RESTATE',
        'MEETING_BOOKED',
        'ENTERPRISE_SALE',
        'END_SCENARIO',
      ]
      validActions.forEach(action => {
        const response: AgentResponse = {
          agent_response_text: 'Test',
          scoring_feedback: 'Test',
          response_evaluation: 'PASS',
          next_step_action: action,
          confidence_score: 50,
        }
        expect(response.next_step_action).toBe(action)
      })
    })

    it('should validate confidence_score range', () => {
      const response: AgentResponse = {
        agent_response_text: 'Test',
        scoring_feedback: 'Test',
        response_evaluation: 'PASS',
        next_step_action: 'FOLLOW_UP',
        confidence_score: 75,
      }
      expect(response.confidence_score).toBeGreaterThanOrEqual(50)
      expect(response.confidence_score).toBeLessThanOrEqual(100)
    })
  })
})

