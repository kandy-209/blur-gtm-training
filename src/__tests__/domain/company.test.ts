/**
 * Company Entity Tests
 */

import { Company } from '@/domain/entities/company';
import { CompanyId } from '@/domain/value-objects/company-id';
import { Domain } from '@/domain/value-objects/domain';
import { CompanyIntelligence } from '@/domain/value-objects/company-intelligence';

describe('Company Entity', () => {
  describe('create', () => {
    it('should create a company with valid data', () => {
      const company = Company.create({
        name: 'Test Company',
        domain: 'test.com',
      });

      expect(company).toBeDefined();
      expect(company.name).toBe('Test Company');
      expect(company.domain.value).toBe('test.com');
      expect(company.id).toBeInstanceOf(CompanyId);
    });

    it('should create domain events when created', () => {
      const company = Company.create({
        name: 'Test Company',
        domain: 'test.com',
      });

      const events = company.domainEvents;
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('company.created');
    });

    it('should accept optional GitHub repo', () => {
      const company = Company.create({
        name: 'Test Company',
        domain: 'test.com',
        githubRepo: 'https://github.com/test/repo',
      });

      expect(company.githubRepo).toBeDefined();
      expect(company.githubRepo?.fullName).toBe('test/repo');
    });
  });

  describe('updateIntelligence', () => {
    it('should update company intelligence', () => {
      const company = Company.create({
        name: 'Test Company',
        domain: 'test.com',
      });

      const intelligence = new CompanyIntelligence({
        company: {
          name: 'Test Company',
          domain: 'test.com',
          industry: 'Technology',
          sector: 'Software',
          size: 'mid-size',
          founded: 2020,
          headquarters: 'San Francisco, CA',
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
            technical: 0.6,
            business: 0.3,
            team: 0.1,
          },
        },
        sources: [],
        analyzedAt: new Date(),
      });

      company.updateIntelligence(intelligence);

      expect(company.intelligence).toBe(intelligence);
      expect(company.lastAnalyzedAt).toBeDefined();
    });

    it('should create intelligence updated event', () => {
      const company = Company.create({
        name: 'Test Company',
        domain: 'test.com',
      });

      const intelligence = new CompanyIntelligence({
        company: {
          name: 'Test Company',
          domain: 'test.com',
          industry: 'Technology',
          sector: 'Software',
          size: 'mid-size',
          founded: 2020,
          headquarters: 'San Francisco, CA',
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
            technical: 0.6,
            business: 0.3,
            team: 0.1,
          },
        },
        sources: [],
        analyzedAt: new Date(),
      });

      company.updateIntelligence(intelligence);

      const events = company.domainEvents;
      const updateEvent = events.find(e => e.type === 'company.intelligence.updated');
      expect(updateEvent).toBeDefined();
    });
  });

  describe('isIntelligenceFresh', () => {
    it('should return false if never analyzed', () => {
      const company = Company.create({
        name: 'Test Company',
        domain: 'test.com',
      });

      expect(company.isIntelligenceFresh()).toBe(false);
    });

    it('should return true if analyzed recently', () => {
      const company = Company.create({
        name: 'Test Company',
        domain: 'test.com',
      });

      const intelligence = new CompanyIntelligence({
        company: {
          name: 'Test Company',
          domain: 'test.com',
          industry: 'Technology',
          sector: 'Software',
          size: 'mid-size',
          founded: 2020,
          headquarters: 'San Francisco, CA',
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
            technical: 0.6,
            business: 0.3,
            team: 0.1,
          },
        },
        sources: [],
        analyzedAt: new Date(),
      });

      company.updateIntelligence(intelligence);

      expect(company.isIntelligenceFresh(24)).toBe(true);
    });
  });
});

