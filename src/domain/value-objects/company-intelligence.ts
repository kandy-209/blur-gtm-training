/**
 * Company Intelligence - Value Object
 * Comprehensive company analysis data
 */

import { ValueObject } from '../shared/value-object';

export interface FinancialData {
  revenue: number | null;
  revenueGrowth: number | null;
  employeeCount: number | null;
  marketCap: number | null;
  rndSpending: number | null;
  estimatedEngineeringCost: number | null;
  estimatedEngineeringHeadcount: number | null;
}

export interface CodebaseData {
  repositories: Array<{
    name: string;
    url: string;
    languages: string[];
    stars: number;
    contributors: number;
  }>;
  techStack: {
    languages: string[];
    frameworks: string[];
    infrastructure: string[];
    databases: string[];
    tools: string[];
    ciCd: string[];
  };
  architecture: {
    type: 'monolith' | 'microservices' | 'serverless' | 'hybrid';
    complexity: 'low' | 'medium' | 'high';
    patterns: string[];
  };
  codeQuality: {
    testCoverage: number;
    codeComplexity: number;
    documentationScore: number;
    maintainabilityIndex: number;
  };
  teamMetrics: {
    totalContributors: number;
    activeContributors: number;
    commitsPerWeek: number;
    prsPerWeek: number;
    averagePrSize: number;
    averageReviewTime: number;
    deploymentFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

export interface ContactData {
  name: string;
  title: string;
  email: string;
  department: string;
  seniority: string;
  linkedin?: string;
}

export interface Insights {
  painPoints: string[];
  priorities: string[];
  buyingSignals: string[];
  concerns: string[];
  decisionFactors: {
    technical: number;
    business: number;
    team: number;
  };
}

export interface CompanyIntelligenceData {
  company: {
    name: string;
    domain: string;
    industry: string;
    sector: string;
    size: 'startup' | 'mid-size' | 'enterprise';
    founded: number | null;
    headquarters: string | null;
  };
  financial: FinancialData;
  codebase: CodebaseData | null;
  contacts: ContactData[];
  insights: Insights;
  sources: string[];
  analyzedAt: Date;
}

export class CompanyIntelligence extends ValueObject<CompanyIntelligenceData> {
  constructor(data: CompanyIntelligenceData) {
    super(data);
  }

  protected validate(data: CompanyIntelligenceData): CompanyIntelligenceData {
    if (!data.company || !data.company.name) {
      throw new Error('Company intelligence must include company name');
    }
    if (!data.insights) {
      throw new Error('Company intelligence must include insights');
    }
    return data;
  }

  static empty(): CompanyIntelligence {
    return new CompanyIntelligence({
      company: {
        name: 'Unknown Company',
        domain: '',
        industry: '',
        sector: '',
        size: 'startup',
        founded: null,
        headquarters: null,
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
      sources: [],
      analyzedAt: new Date(),
    });
  }

  get company() {
    return this._value.company;
  }

  get financial() {
    return this._value.financial;
  }

  get codebase() {
    return this._value.codebase;
  }

  get contacts() {
    return this._value.contacts;
  }

  get insights() {
    return this._value.insights;
  }

  get sources() {
    return this._value.sources;
  }

  get analyzedAt() {
    return this._value.analyzedAt;
  }
}

