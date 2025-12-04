/**
 * Mock Data Generators
 * Generate realistic test data for all entities
 */

// Simple faker implementation if @faker-js/faker is not available
const simpleFaker = {
  string: {
    uuid: () => `uuid_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  },
  company: {
    name: () => `Company ${Math.floor(Math.random() * 1000)}`,
    catchPhrase: () => `Innovative ${Math.random().toString(36).substring(7)}`,
    buzzNoun: () => ['Technology', 'Software', 'SaaS', 'Enterprise'][Math.floor(Math.random() * 4)],
  },
  lorem: {
    paragraph: () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    sentence: () => 'This is a test sentence.',
  },
  helpers: {
    arrayElement: <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)],
    arrayElements: <T>(arr: T[], count?: number): T[] => {
      const num = count || Math.floor(Math.random() * arr.length) + 1;
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    },
  },
  internet: {
    email: () => `test_${Date.now()}@example.com`,
    domainName: () => `example${Math.floor(Math.random() * 100)}.com`,
  },
  person: {
    fullName: () => `Test User ${Math.floor(Math.random() * 100)}`,
    jobTitle: () => ['VP Engineering', 'CTO', 'Engineering Manager'][Math.floor(Math.random() * 3)],
  },
  location: {
    city: () => 'San Francisco',
    state: () => 'CA',
    country: () => 'USA',
  },
  number: {
    int: (options: { min: number; max: number }) => 
      Math.floor(Math.random() * (options.max - options.min + 1)) + options.min,
    float: (options: { min: number; max: number }) => 
      Math.random() * (options.max - options.min) + options.min,
  },
  date: {
    recent: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    past: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  },
  datatype: {
    boolean: () => Math.random() > 0.5,
  },
};

// Try to use @faker-js/faker if available, otherwise use simple implementation
let faker: typeof simpleFaker;
try {
  faker = require('@faker-js/faker').faker;
} catch {
  faker = simpleFaker;
}

export interface MockScenario {
  id: string;
  title: string;
  description: string;
  objection_category: string;
  objection_statement: string;
  difficulty: 'easy' | 'medium' | 'hard';
  industry?: string;
}

export interface MockTrainingEvent {
  eventType: string;
  userId: string;
  scenarioId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MockUserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
  company?: string;
  created_at?: Date;
}

export interface MockCompany {
  name: string;
  domain?: string;
  industry?: string;
  sector?: string;
  employeeCount?: number;
  revenue?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Generate mock scenario
 */
export function generateMockScenario(overrides: Partial<MockScenario> = {}): MockScenario {
  const categories = [
    'price_objection',
    'integration_complexity',
    'security_concerns',
    'timing_issues',
    'competitor_comparison',
    'budget_constraints',
  ];

  return {
    id: faker.string.uuid(),
    title: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    objection_category: faker.helpers.arrayElement(categories),
    objection_statement: faker.lorem.sentence(),
    difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
    industry: faker.company.buzzNoun(),
    ...overrides,
  };
}

/**
 * Generate mock training event
 */
export function generateMockTrainingEvent(
  overrides: Partial<MockTrainingEvent> = {}
): MockTrainingEvent {
  const eventTypes = [
    'scenario_start',
    'scenario_complete',
    'turn_submit',
    'feedback_view',
    'module_complete',
  ];

  return {
    eventType: faker.helpers.arrayElement(eventTypes),
    userId: faker.string.uuid(),
    scenarioId: faker.string.uuid(),
    timestamp: faker.date.recent(),
    metadata: {},
    ...overrides,
  };
}

/**
 * Generate mock user profile
 */
export function generateMockUserProfile(
  overrides: Partial<MockUserProfile> = {}
): MockUserProfile {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: faker.person.jobTitle(),
    company: faker.company.name(),
    created_at: faker.date.past(),
    ...overrides,
  };
}

/**
 * Generate mock company data
 */
export function generateMockCompany(overrides: Partial<MockCompany> = {}): MockCompany {
  return {
    name: faker.company.name(),
    domain: faker.internet.domainName(),
    industry: faker.company.buzzNoun(),
    sector: faker.company.buzzNoun(),
    employeeCount: faker.number.int({ min: 10, max: 10000 }),
    revenue: faker.number.int({ min: 1000000, max: 1000000000 }),
    location: {
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
    },
    ...overrides,
  };
}

/**
 * Generate mock email data
 */
export function generateMockEmailData(overrides: Record<string, any> = {}) {
  return {
    companyName: faker.company.name(),
    prospectName: faker.person.fullName(),
    companyDomain: faker.internet.domainName(),
    role: faker.person.jobTitle(),
    industry: faker.company.buzzNoun(),
    emailType: faker.helpers.arrayElement([
      'cold-outreach',
      'follow-up',
      'demo-invite',
      'objection-response',
    ]),
    tone: faker.helpers.arrayElement([
      'professional',
      'friendly',
      'urgent',
      'consultative',
    ]),
    context: faker.lorem.sentence(),
    ...overrides,
  };
}

/**
 * Generate mock persona
 */
export function generateMockPersona(overrides: Record<string, any> = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    role: faker.helpers.arrayElement([
      'VP Engineering',
      'CTO',
      'Engineering Manager',
      'Lead Developer',
    ]),
    seniority: faker.helpers.arrayElement(['junior', 'mid', 'senior', 'executive']),
    technicalProfile: {
      expertise: faker.helpers.arrayElements([
        'TypeScript',
        'React',
        'Node.js',
        'Python',
        'Go',
        'Rust',
      ]),
      architectureExperience: faker.helpers.arrayElement([
        'monolith',
        'microservices',
        'serverless',
      ]),
      teamSize: faker.number.int({ min: 5, max: 100 }),
      codebaseFamiliarity: faker.helpers.arrayElement(['shallow', 'moderate', 'deep']),
    },
    concerns: faker.helpers.arrayElements([
      'Scalability',
      'Security',
      'Performance',
      'Cost',
    ]),
    priorities: faker.helpers.arrayElements([
      'Performance',
      'Quality',
      'Speed',
      'Reliability',
    ]),
    painPoints: faker.helpers.arrayElements([
      'Slow deployments',
      'Code quality issues',
      'Team collaboration',
      'Technical debt',
    ]),
    communicationStyle: {
      usesTechnicalTerms: faker.datatype.boolean(),
      asksArchitectureQuestions: faker.datatype.boolean(),
      referencesCode: faker.datatype.boolean(),
      prefersData: faker.datatype.boolean(),
      directness: faker.helpers.arrayElement(['direct', 'diplomatic', 'casual']),
    },
    decisionFactors: {
      technical: faker.number.float({ min: 0, max: 1 }),
      business: faker.number.float({ min: 0, max: 1 }),
      team: faker.number.float({ min: 0, max: 1 }),
    },
    ...overrides,
  };
}

/**
 * Generate multiple mock items
 */
export function generateMockArray<T>(
  generator: () => T,
  count: number = 10
): T[] {
  return Array.from({ length: count }, () => generator());
}

/**
 * Generate mock analytics stats
 */
export function generateMockAnalyticsStats(overrides: Record<string, any> = {}) {
  return {
    totalScenarios: faker.number.int({ min: 0, max: 100 }),
    totalStarts: faker.number.int({ min: 0, max: 200 }),
    totalTurns: faker.number.int({ min: 0, max: 1000 }),
    averageScore: faker.number.float({ min: 0, max: 100 }),
    completionRate: faker.number.float({ min: 0, max: 1 }),
    scenarioBreakdown: [],
    eventTypeBreakdown: {
      scenario_start: faker.number.int({ min: 0, max: 50 }),
      scenario_complete: faker.number.int({ min: 0, max: 50 }),
      turn_submit: faker.number.int({ min: 0, max: 200 }),
      feedback_view: faker.number.int({ min: 0, max: 100 }),
      module_complete: faker.number.int({ min: 0, max: 20 }),
    },
    ...overrides,
  };
}

