/**
 * Create Discovery Call Use Case
 * Creates a new discovery call practice session
 */

import { DiscoveryCall } from '@/domain/entities/discovery-call';
import { CompanyId } from '@/domain/value-objects/company-id';
import { CreateDiscoveryCallCommand } from './create-discovery-call.command';
import { CompanyRepository } from '@/application/repositories/company.repository';
import { DiscoveryCallRepository } from '@/application/repositories/discovery-call.repository';
import { PersonaRepository } from '@/application/repositories/persona.repository';

export class CreateDiscoveryCallUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private personaRepository: PersonaRepository,
    private discoveryCallRepository: DiscoveryCallRepository
  ) {}

  async execute(command: CreateDiscoveryCallCommand): Promise<DiscoveryCall> {
    // 1. Get company
    const companyId = new CompanyId(command.companyId);
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new Error(`Company with id ${command.companyId} not found`);
    }

    // 2. Get persona
    const persona = await this.personaRepository.findById(command.personaId);

    if (!persona) {
      throw new Error(`Persona with id ${command.personaId} not found`);
    }

    // 3. Create discovery call
    const discoveryCall = DiscoveryCall.create(
      companyId,
      persona,
      command.settings
    );

    // 4. Save discovery call
    await this.discoveryCallRepository.save(discoveryCall);

    return discoveryCall;
  }
}

