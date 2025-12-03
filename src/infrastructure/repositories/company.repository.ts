/**
 * Company Repository Implementation
 * In-memory implementation (will be replaced with database)
 */

import { Company } from '@/domain/entities/company';
import { CompanyId } from '@/domain/value-objects/company-id';
import { CompanyRepository as ICompanyRepository } from '@/application/repositories/company.repository';

export class CompanyRepository implements ICompanyRepository {
  private companies: Map<string, Company> = new Map();

  async findById(id: CompanyId): Promise<Company | null> {
    return this.companies.get(id.value) || null;
  }

  async findByDomain(domain: string): Promise<Company | null> {
    for (const company of Array.from(this.companies.values())) {
      if (company.domain.value === domain) {
        return company;
      }
    }
    return null;
  }

  async save(company: Company): Promise<void> {
    this.companies.set(company.id.value, company);
  }

  async delete(id: CompanyId): Promise<void> {
    this.companies.delete(id.value);
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<Company[]> {
    const all = Array.from(this.companies.values());
    return all.slice(offset, offset + limit);
  }
}

