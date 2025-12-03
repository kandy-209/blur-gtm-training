/**
 * Conversation Agent Tests
 */

import { ConversationAgent } from '@/infrastructure/agents/conversation/conversation-agent';
import { ProspectPersona } from '@/domain/entities/prospect-persona';
import { CompanyId } from '@/domain/value-objects/company-id';
import { createMockPersona } from '../../setup/test-utils';

describe('ConversationAgent', () => {
  let agent: ConversationAgent;
  let persona: ProspectPersona;

  beforeEach(() => {
    agent = new ConversationAgent();
    const personaData = createMockPersona();
    persona = ProspectPersona.create(personaData, new CompanyId('comp_123'));
  });

  describe('generateResponse', () => {
    it('should generate a response to rep message', async () => {
      const context = {
        persona,
        conversationHistory: [],
        difficulty: 'medium' as const,
        personality: 'professional' as const,
      };

      const response = await agent.generateResponse(
        'Hello, I wanted to introduce you to our product.',
        context
      );

      expect(response).toBeDefined();
      expect(response.message).toBeTruthy();
      expect(response.objectionState).toBeDefined();
    });

    it('should detect price objections', async () => {
      const context = {
        persona,
        conversationHistory: [],
        difficulty: 'hard' as const,
        personality: 'skeptical' as const,
      };

      const response = await agent.generateResponse(
        'Our pricing starts at $50 per seat.',
        context
      );

      expect(response.objectionState.objectionRaised).toBe(true);
      expect(response.objectionState.objectionType).toBe('price');
    });

    it('should increase pushback with difficulty level', async () => {
      const easyContext = {
        persona,
        conversationHistory: [],
        difficulty: 'easy' as const,
        personality: 'friendly' as const,
      };

      const hardContext = {
        persona,
        conversationHistory: [],
        difficulty: 'hard' as const,
        personality: 'skeptical' as const,
      };

      const easyResponse = await agent.generateResponse(
        'Our pricing starts at $50 per seat.',
        easyContext
      );

      const hardResponse = await agent.generateResponse(
        'Our pricing starts at $50 per seat.',
        hardContext
      );

      expect(hardResponse.objectionState.pushbackLevel).toBeGreaterThan(
        easyResponse.objectionState.pushbackLevel
      );
    });

    it('should not roll over on objections', async () => {
      const context = {
        persona,
        conversationHistory: [],
        difficulty: 'expert' as const,
        personality: 'hostile' as const,
      };

      // First objection
      const response1 = await agent.generateResponse(
        'Our pricing starts at $50 per seat.',
        context
      );

      // Second objection (should push back harder)
      const context2 = {
        ...context,
        conversationHistory: [
          { role: 'rep' as const, message: 'Our pricing starts at $50 per seat.', timestamp: new Date() },
          { role: 'prospect' as const, message: response1.message, timestamp: new Date() },
        ],
      };

      const response2 = await agent.generateResponse(
        'But think about the ROI you\'ll get.',
        context2
      );

      expect(response2.objectionState.timesRaised).toBeGreaterThan(0);
      expect(response2.objectionState.pushbackLevel).toBeGreaterThan(0.5);
    });
  });

  describe('detectBuyingSignals', () => {
    it('should detect price inquiries as buying signals', async () => {
      const context = {
        persona,
        conversationHistory: [
          { role: 'prospect' as const, message: 'How much does it cost?', timestamp: new Date() },
        ],
        difficulty: 'medium' as const,
        personality: 'professional' as const,
      };

      const response = await agent.generateResponse(
        'Our pricing is $50 per seat.',
        context
      );

      expect(response.buyingSignals).toContain('price_inquiry');
    });
  });
});

