/**
 * Persona Generation Agent
 * Facade that uses DeepPersona for advanced persona generation
 */

import { CompanyIntelligence } from '@/domain/value-objects/company-intelligence';
import { ProspectPersonaData } from '@/domain/entities/prospect-persona';
import { DeepPersonaGenerator } from './deeppersona/deeppersona-generator';

export class PersonaGenerationAgent {
  private deepPersona: DeepPersonaGenerator;

  constructor() {
    this.deepPersona = new DeepPersonaGenerator();
  }

  /**
   * Generate realistic persona from company intelligence
   * Uses DeepPersona framework for advanced generation
   */
  async generate(
    intelligence: CompanyIntelligence,
    settings: {
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      personality: 'friendly' | 'professional' | 'skeptical' | 'abrasive' | 'hostile';
      role?: 'CTO' | 'VP Engineering' | 'Staff Engineer' | 'Engineering Manager';
    }
  ): Promise<ProspectPersonaData> {
    // Use DeepPersona for advanced generation
    return await this.deepPersona.generatePersona(intelligence, settings);
  }
}

