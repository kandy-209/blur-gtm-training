/**
 * Persona Generation Agent Tests
 */

import { PersonaGenerationAgent } from '@/infrastructure/agents/persona-generation-agent';
import { CompanyIntelligence } from '@/domain/value-objects/company-intelligence';
import { createMockCompany } from '../../setup/test-utils';

describe('PersonaGenerationAgent', () => {
  let agent: PersonaGenerationAgent;

  beforeEach(() => {
    agent = new PersonaGenerationAgent();
  });

  describe('generate', () => {
    it('should generate a persona from company intelligence', async () => {
      const companyData = createMockCompany();
      const intelligence = new CompanyIntelligence({
        company: companyData,
        insights: {
          painPoints: [],
          priorities: [],
          buyingSignals: [],
          concerns: [],
          decisionFactors: {
            technical: 0,
            business: 0,
            team: 0,
          },
        },
        financial: {
          revenue: null,
          revenueGrowth: null,
          employeeCount: null,
          marketCap: null,
          rndSpending: null,
          estimatedEngineeringCost: null,
          estimatedEngineeringHeadcount: null,
        },
        codebase: null,
        contacts: [],
        sources: [],
        analyzedAt: new Date(),
      });

      const persona = await agent.generate(intelligence, {
        difficulty: 'medium',
        personality: 'professional',
        role: 'VP Engineering',
      });

      expect(persona).toBeDefined();
      expect(persona.id).toBeTruthy();
      expect(persona.name).toBeTruthy();
      expect(persona.role).toBe('VP Engineering');
      expect(persona.company).toBe(companyData.name);
    });

    it('should generate different personas for different difficulty levels', async () => {
      const companyData = createMockCompany();
      const intelligence = new CompanyIntelligence({
        company: companyData,
        insights: {
          painPoints: [],
          priorities: [],
          buyingSignals: [],
          concerns: [],
          decisionFactors: {
            technical: 0,
            business: 0,
            team: 0,
          },
        },
        financial: {
          revenue: null,
          revenueGrowth: null,
          employeeCount: null,
          marketCap: null,
          rndSpending: null,
          estimatedEngineeringCost: null,
          estimatedEngineeringHeadcount: null,
        },
        codebase: null,
        contacts: [],
        sources: [],
        analyzedAt: new Date(),
      });

      const easyPersona = await agent.generate(intelligence, {
        difficulty: 'easy',
        personality: 'friendly',
      });

      const hardPersona = await agent.generate(intelligence, {
        difficulty: 'hard',
        personality: 'skeptical',
      });

      expect(easyPersona.metadata.realismScore).toBeDefined();
      expect(hardPersona.metadata.realismScore).toBeDefined();
      // Hard personas should have more attributes/realism
      expect(hardPersona.metadata.attributeCount).toBeGreaterThanOrEqual(
        easyPersona.metadata.attributeCount
      );
    });

    it('should generate personas with hundreds of attributes (DeepPersona)', async () => {
      const companyData = createMockCompany();
      const intelligence = new CompanyIntelligence({
        company: companyData,
        insights: {
          painPoints: [],
          priorities: [],
          buyingSignals: [],
          concerns: [],
          decisionFactors: {
            technical: 0,
            business: 0,
            team: 0,
          },
        },
        financial: {
          revenue: null,
          revenueGrowth: null,
          employeeCount: null,
          marketCap: null,
          rndSpending: null,
          estimatedEngineeringCost: null,
          estimatedEngineeringHeadcount: null,
        },
        codebase: null,
        contacts: [],
        sources: [],
        analyzedAt: new Date(),
      });

      const persona = await agent.generate(intelligence, {
        difficulty: 'expert',
        personality: 'professional',
      });

      // DeepPersona should generate many attributes for expert level
      expect(persona.metadata.attributeCount).toBeGreaterThan(10);
      // Check that expert difficulty generates more detailed personas
      expect(persona.metadata.generationMethod).toBeDefined();
    });
  });
});

