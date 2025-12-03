/**
 * Persona Repository Implementation
 * In-memory implementation (will be replaced with database)
 */

import { ProspectPersona } from '@/domain/entities/prospect-persona';
import { CompanyId } from '@/domain/value-objects/company-id';
import { PersonaRepository as IPersonaRepository } from '@/application/repositories/persona.repository';

export class PersonaRepository implements IPersonaRepository {
  private personas: Map<string, ProspectPersona> = new Map();

  async findById(id: string): Promise<ProspectPersona | null> {
    return this.personas.get(id) || null;
  }

  async findByCompanyId(companyId: CompanyId): Promise<ProspectPersona[]> {
    const results: ProspectPersona[] = [];
    for (const persona of Array.from(this.personas.values())) {
      if (persona.companyId.equals(companyId)) {
        results.push(persona);
      }
    }
    return results;
  }

  async save(persona: ProspectPersona): Promise<void> {
    this.personas.set(persona.id, persona);
  }

  async delete(id: string): Promise<void> {
    this.personas.delete(id);
  }
}

