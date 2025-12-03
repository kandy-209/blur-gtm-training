/**
 * Generate Persona Use Case
 * Generates a realistic prospect persona from company intelligence
 */

import { ProspectPersona } from '@/domain/entities/prospect-persona';
import { CompanyId } from '@/domain/value-objects/company-id';
import { GeneratePersonaCommand } from './generate-persona.command';
import { CompanyRepository } from '@/application/repositories/company.repository';
import { PersonaGenerationAgent } from '@/infrastructure/agents/persona-generation-agent';

export class GeneratePersonaUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private personaAgent: PersonaGenerationAgent
  ) {}

  async execute(command: GeneratePersonaCommand): Promise<ProspectPersona> {
    // 1. Get company
    const companyId = new CompanyId(command.companyId);
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new Error(`Company with id ${command.companyId} not found`);
    }

    if (!company.intelligence) {
      throw new Error('Company intelligence not available. Analyze company first.');
    }

    // 2. Generate persona using agent
    const personaData = await this.personaAgent.generate(
      company.intelligence,
      command.settings
    );

    // 3. Create persona entity
    const persona = ProspectPersona.create(personaData, companyId);

    return persona;
  }
}

