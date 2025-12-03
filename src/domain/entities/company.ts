/**
 * Company - Aggregate Root
 * Represents a company being analyzed
 */

import { AggregateRoot } from '../shared/aggregate-root';
import { CompanyId } from '../value-objects/company-id';
import { Domain } from '../value-objects/domain';
import { GitHubRepo } from '../value-objects/github-repo';
import { CompanyIntelligence } from '../value-objects/company-intelligence';
import { DomainEvent } from '../shared/base-entity';

export interface CompanyCreatedEvent extends DomainEvent {
  type: 'company.created';
  payload: {
    companyId: string;
    domain: string;
  };
}

export interface CompanyIntelligenceUpdatedEvent extends DomainEvent {
  type: 'company.intelligence.updated';
  payload: {
    companyId: string;
    intelligenceVersion: number;
  };
}

export class Company extends AggregateRoot<CompanyId> {
  private _name: string;
  private _domain: Domain;
  private _githubRepo: GitHubRepo | null;
  private _intelligence: CompanyIntelligence | null;
  private _lastAnalyzedAt: Date | null;

  private constructor(
    id: CompanyId,
    name: string,
    domain: Domain,
    createdAt?: Date
  ) {
    super(id, createdAt);
    this._name = name;
    this._domain = domain;
    this._githubRepo = null;
    this._intelligence = null;
    this._lastAnalyzedAt = null;
  }

  static create(props: {
    name: string;
    domain: string;
    githubRepo?: string;
  }): Company {
    const id = CompanyId.generate();
    const domain = new Domain(props.domain);
    const company = new Company(id, props.name, domain);

    if (props.githubRepo) {
      company._githubRepo = new GitHubRepo(props.githubRepo);
    }

    company.addDomainEvent({
      type: 'company.created',
      aggregateId: id.value,
      occurredOn: new Date(),
      payload: {
        companyId: id.value,
        domain: domain.value,
      },
    } as CompanyCreatedEvent);

    return company;
  }

  get name(): string {
    return this._name;
  }

  get domain(): Domain {
    return this._domain;
  }

  get githubRepo(): GitHubRepo | null {
    return this._githubRepo;
  }

  get intelligence(): CompanyIntelligence | null {
    return this._intelligence;
  }

  get lastAnalyzedAt(): Date | null {
    return this._lastAnalyzedAt;
  }

  updateIntelligence(intelligence: CompanyIntelligence): void {
    this._intelligence = intelligence;
    this._lastAnalyzedAt = new Date();
    this.markAsUpdated();

    this.addDomainEvent({
      type: 'company.intelligence.updated',
      aggregateId: this._id.value,
      occurredOn: new Date(),
      payload: {
        companyId: this._id.value,
        intelligenceVersion: this.version,
      },
    } as CompanyIntelligenceUpdatedEvent);
  }

  setGithubRepo(repo: string): void {
    this._githubRepo = new GitHubRepo(repo);
    this.markAsUpdated();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Company name cannot be empty');
    }
    this._name = name.trim();
    this.markAsUpdated();
  }

  isIntelligenceFresh(maxAgeHours: number = 24): boolean {
    if (!this._lastAnalyzedAt) {
      return false;
    }
    const ageHours = (Date.now() - this._lastAnalyzedAt.getTime()) / (1000 * 60 * 60);
    return ageHours < maxAgeHours;
  }
}

