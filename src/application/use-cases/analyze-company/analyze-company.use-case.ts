/**
 * Analyze Company Use Case
 * Orchestrates company analysis from multiple sources
 */

import { Company } from '@/domain/entities/company';
import { CompanyIntelligence } from '@/domain/value-objects/company-intelligence';
import { AnalyzeCompanyCommand } from './analyze-company.command';
import { CompanyRepository } from '@/application/repositories/company.repository';
import { CompanyIntelligenceAgent } from '@/infrastructure/agents/company-intelligence-agent';

export class AnalyzeCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private intelligenceAgent: CompanyIntelligenceAgent
  ) {}

  async execute(command: AnalyzeCompanyCommand): Promise<CompanyIntelligence> {
    // 1. Identify company from input
    const companyInfo = await this.identifyCompany(command.input);

    // 2. Check if company exists and intelligence is fresh
    if (!command.forceRefresh) {
      const existing = await this.companyRepository.findByDomain(companyInfo.domain);
      if (existing?.isIntelligenceFresh(24)) {
        return existing.intelligence!;
      }
    }

    // 3. Analyze company using intelligence agent
    const intelligence = await this.intelligenceAgent.analyze(companyInfo);

    // 4. Save or update company
    const company = await this.companyRepository.findByDomain(companyInfo.domain);
    if (company) {
      company.updateIntelligence(intelligence);
      await this.companyRepository.save(company);
    } else {
      const newCompany = Company.create({
        name: intelligence.company.name,
        domain: companyInfo.domain,
        githubRepo: companyInfo.githubRepo,
      });
      newCompany.updateIntelligence(intelligence);
      await this.companyRepository.save(newCompany);
    }

    return intelligence;
  }

  private async identifyCompany(
    input: AnalyzeCompanyCommand['input']
  ): Promise<{ domain: string; githubRepo?: string }> {
    if (typeof input === 'string') {
      // Try to parse as GitHub URL
      if (input.includes('github.com')) {
        return { domain: '', githubRepo: input };
      }
      // Assume it's a domain or company name
      return { domain: input };
    }

    return {
      domain: input.domain || '',
      githubRepo: input.githubRepo,
    };
  }
}

