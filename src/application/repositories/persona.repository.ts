/**
 * Persona Repository Interface
 * Repository pattern for ProspectPersona entity
 */

import { ProspectPersona } from '@/domain/entities/prospect-persona';
import { CompanyId } from '@/domain/value-objects/company-id';

export interface PersonaRepository {
  findById(id: string): Promise<ProspectPersona | null>;
  findByCompanyId(companyId: CompanyId): Promise<ProspectPersona[]>;
  save(persona: ProspectPersona): Promise<void>;
  delete(id: string): Promise<void>;
}

