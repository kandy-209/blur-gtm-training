/**
 * Company Repository Interface
 * Repository pattern for Company aggregate
 */

import { Company } from '@/domain/entities/company';
import { CompanyId } from '@/domain/value-objects/company-id';
import { Domain } from '@/domain/value-objects/domain';

export interface CompanyRepository {
  findById(id: CompanyId): Promise<Company | null>;
  findByDomain(domain: string): Promise<Company | null>;
  save(company: Company): Promise<void>;
  delete(id: CompanyId): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<Company[]>;
}

