/**
 * Prospect Persona - Entity
 * Represents a generated prospect persona for practice
 */

import { BaseEntity } from '../shared/base-entity';
import { CompanyId } from '../value-objects/company-id';

export interface ProspectPersonaData {
  id: string;
  name: string;
  title: string;
  company: string;
  role: 'CTO' | 'VP Engineering' | 'Staff Engineer' | 'Engineering Manager' | 'Lead Developer';
  seniority: 'junior' | 'mid' | 'senior' | 'expert';
  technicalProfile: {
    expertise: string[];
    architectureExperience: string;
    teamSize: number;
    codebaseFamiliarity: 'deep' | 'moderate' | 'surface';
  };
  concerns: string[];
  priorities: string[];
  painPoints: string[];
  communicationStyle: {
    usesTechnicalTerms: boolean;
    asksArchitectureQuestions: boolean;
    referencesCode: boolean;
    prefersData: boolean;
    directness: 'very_direct' | 'direct' | 'conversational' | 'diplomatic';
  };
  decisionFactors: {
    technical: number;
    business: number;
    team: number;
  };
  currentSituation: {
    currentSolution: string;
    evaluationStage: 'not_evaluating' | 'researching' | 'evaluating' | 'deciding';
    budget: 'constrained' | 'moderate' | 'flexible';
    timeline: 'urgent' | 'this_quarter' | 'this_year' | 'exploratory';
  };
  skepticism: string;
  tone: string;
  metadata: {
    generationMethod: string;
    attributeCount: number;
    narrativeLength: number;
    confidence: number;
    realismScore: number;
  };
}

export class ProspectPersona extends BaseEntity<string> {
  private _data: ProspectPersonaData;
  private _companyId: CompanyId;

  private constructor(id: string, data: ProspectPersonaData, companyId: CompanyId, createdAt?: Date) {
    super(id, createdAt);
    this._data = data;
    this._companyId = companyId;
  }

  static create(data: ProspectPersonaData, companyId: CompanyId): ProspectPersona {
    const id = data.id || `persona_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return new ProspectPersona(id, data, companyId);
  }

  get data(): ProspectPersonaData {
    return { ...this._data };
  }

  get companyId(): CompanyId {
    return this._companyId;
  }

  get name(): string {
    return this._data.name;
  }

  get role(): string {
    return this._data.role;
  }

  get communicationStyle() {
    return this._data.communicationStyle;
  }

  get concerns(): string[] {
    return [...this._data.concerns];
  }

  get painPoints(): string[] {
    return [...this._data.painPoints];
  }

  update(data: Partial<ProspectPersonaData>): void {
    this._data = { ...this._data, ...data };
    this.markAsUpdated();
  }
}

