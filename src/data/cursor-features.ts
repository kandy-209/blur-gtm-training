export interface CursorFeature {
  id: string;
  name: string;
  category: 'productivity' | 'collaboration' | 'security' | 'code-quality' | 'developer-experience';
  description: string;
  keyBenefits: string[];
  impactOnTeams: {
    leadership: {
      roi: string;
      metrics: string[];
      businessValue: string[];
    };
    ic: {
      productivity: string;
      dailyImpact: string[];
      timeSaved: string;
    };
  };
  useCases: string[];
  technicalDetails?: string[];
}

export const cursorFeatures: CursorFeature[] = [
  {
    id: 'codebase-understanding',
    name: 'Codebase-Wide Understanding',
    category: 'productivity',
    description: 'Cursor understands your entire codebase context, not just the current file. It can reference functions, classes, and patterns across your repository.',
    keyBenefits: [
      'Reduces context switching between files',
      'Suggests code that fits your existing patterns',
      'Understands relationships between components',
      'Helps navigate large codebases faster'
    ],
    impactOnTeams: {
      leadership: {
        roi: '30-50% reduction in onboarding time for new developers',
        metrics: [
          'Faster feature delivery (2-3x)',
          'Reduced code review cycles',
          'Lower bug rates from better context awareness',
          'Improved code consistency across teams'
        ],
        businessValue: [
          'Faster time-to-market for new features',
          'Reduced technical debt',
          'Better knowledge transfer',
          'Lower support costs'
        ]
      },
      ic: {
        productivity: 'Spend less time reading code, more time writing',
        dailyImpact: [
          'No more hunting through multiple files to understand context',
          'Instant suggestions based on your codebase patterns',
          'Faster debugging with full codebase awareness',
          'Confidence in making changes to unfamiliar code'
        ],
        timeSaved: '2-3 hours per day on average'
      }
    },
    useCases: [
      'Working with large monorepos',
      'Onboarding to new codebases',
      'Refactoring across multiple files',
      'Understanding legacy code',
      'Maintaining consistency in team code'
    ],
    technicalDetails: [
      'Indexes entire repository for context',
      'Uses semantic search across codebase',
      'Maintains understanding of code relationships',
      'Works with any language/framework'
    ]
  },
  {
    id: 'composer-mode',
    name: 'Composer Mode',
    category: 'productivity',
    description: 'Build entire features, refactor large sections, or implement complex changes across multiple files with natural language instructions.',
    keyBenefits: [
      'Multi-file editing in one operation',
      'Natural language to code conversion',
      'Complex refactoring made simple',
      'Maintains code quality and patterns'
    ],
    impactOnTeams: {
      leadership: {
        roi: '40-60% faster feature development cycles',
        metrics: [
          'Reduced development time for complex features',
          'Fewer iterations needed',
          'Higher code quality consistency',
          'Better adherence to team standards'
        ],
        businessValue: [
          'Faster product iteration',
          'More features shipped per quarter',
          'Reduced development costs',
          'Competitive advantage in speed'
        ]
      },
      ic: {
        productivity: 'Turn ideas into code faster than ever',
        dailyImpact: [
          'Implement features that would take days in hours',
          'Focus on problem-solving, not boilerplate',
          'Experiment with ideas faster',
          'Less mental overhead on syntax'
        ],
        timeSaved: '4-6 hours per week on complex features'
      }
    },
    useCases: [
      'Building new features from scratch',
      'Large-scale refactoring',
      'Implementing design system changes',
      'Adding tests across multiple files',
      'Migrating between frameworks'
    ]
  },
  {
    id: 'chat-with-codebase',
    name: 'Chat with Codebase',
    category: 'developer-experience',
    description: 'Ask questions about your codebase in natural language. Get instant answers about how things work, where code lives, and how to make changes.',
    keyBenefits: [
      'Instant answers to codebase questions',
      'No more grep/ripgrep searches',
      'Understand architecture quickly',
      'Find examples and patterns easily'
    ],
    impactOnTeams: {
      leadership: {
        roi: '50% reduction in time spent answering questions',
        metrics: [
          'Faster onboarding (days instead of weeks)',
          'Reduced dependency on senior engineers',
          'Better knowledge distribution',
          'Lower support overhead'
        ],
        businessValue: [
          'Faster team scaling',
          'Reduced knowledge silos',
          'Better documentation through usage',
          'Lower training costs'
        ]
      },
      ic: {
        productivity: 'Get unstuck instantly',
        dailyImpact: [
          'Find code examples in seconds',
          'Understand complex systems faster',
          'Learn codebase patterns naturally',
          'Reduce time blocked on questions'
        ],
        timeSaved: '1-2 hours per day'
      }
    },
    useCases: [
      'Understanding existing code',
      'Finding where features are implemented',
      'Learning codebase patterns',
      'Debugging unfamiliar code',
      'Onboarding to new projects'
    ]
  },
  {
    id: 'enterprise-security',
    name: 'Enterprise Security & Compliance',
    category: 'security',
    description: 'On-premise deployment options, SOC 2 Type II compliance, data encryption, and enterprise-grade access controls for security-conscious organizations.',
    keyBenefits: [
      'Data never leaves your infrastructure',
      'SOC 2 Type II certified',
      'Enterprise SSO integration',
      'Audit logs and compliance reporting',
      'Data residency options'
    ],
    impactOnTeams: {
      leadership: {
        roi: 'Enables AI adoption in regulated industries',
        metrics: [
          'Zero data breaches',
          '100% compliance with regulations',
          'Reduced security review time',
          'Faster procurement approval'
        ],
        businessValue: [
          'Unlock AI productivity in regulated environments',
          'Meet compliance requirements automatically',
          'Reduce security team overhead',
          'Enable enterprise sales'
        ]
      },
      ic: {
        productivity: 'Use AI tools without security concerns',
        dailyImpact: [
          'No security review delays',
          'Work with sensitive code confidently',
          'Access AI assistance for all projects',
          'No restrictions on code types'
        ],
        timeSaved: 'Avoid 2-4 hours/week of security processes'
      }
    },
    useCases: [
      'Financial services',
      'Healthcare applications',
      'Government contracts',
      'Companies with strict data policies',
      'Multi-tenant SaaS platforms'
    ]
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration Features',
    category: 'collaboration',
    description: 'Shared knowledge base, team patterns, code review assistance, and collaborative editing features that help teams work together more effectively.',
    keyBenefits: [
      'Shared team knowledge',
      'Consistent code patterns',
      'Better code reviews',
      'Reduced merge conflicts',
      'Team-wide best practices'
    ],
    impactOnTeams: {
      leadership: {
        roi: '30% reduction in code review time, 40% fewer merge conflicts',
        metrics: [
          'Faster PR reviews',
          'Higher code quality',
          'Better knowledge sharing',
          'Reduced onboarding time',
          'More consistent codebase'
        ],
        businessValue: [
          'Faster shipping velocity',
          'Lower bug rates',
          'Better team cohesion',
          'Reduced technical debt',
          'Improved developer satisfaction'
        ]
      },
      ic: {
        productivity: 'Work better together, ship faster',
        dailyImpact: [
          'Faster PR reviews',
          'Less back-and-forth on code changes',
          'Learn from team patterns',
          'Confidence in following team standards',
          'Smoother collaboration'
        ],
        timeSaved: '3-5 hours per week on reviews and conflicts'
      }
    },
    useCases: [
      'Large engineering teams',
      'Distributed teams',
      'Code review optimization',
      'Knowledge sharing',
      'Onboarding new team members'
    ]
  },
  {
    id: 'self-healing-code',
    name: 'Self-Healing Code',
    category: 'code-quality',
    description: 'Automatically fix bugs, suggest improvements, and maintain code quality. Cursor can detect and fix issues before they become problems.',
    keyBenefits: [
      'Automatic bug detection',
      'Proactive code improvements',
      'Reduced technical debt',
      'Better code quality over time',
      'Fewer production incidents'
    ],
    impactOnTeams: {
      leadership: {
        roi: '50% reduction in bug-related incidents',
        metrics: [
          'Lower bug rates',
          'Faster bug fixes',
          'Reduced on-call incidents',
          'Better code quality metrics',
          'Lower maintenance costs'
        ],
        businessValue: [
          'Fewer production outages',
          'Lower support costs',
          'Better customer satisfaction',
          'Reduced technical debt',
          'Faster feature development'
        ]
      },
      ic: {
        productivity: 'Spend less time fixing bugs',
        dailyImpact: [
          'Bugs caught before production',
          'Automatic fixes for common issues',
          'Less time in debugging',
          'More time on features',
          'Higher code quality confidence'
        ],
        timeSaved: '5-8 hours per week on bug fixes'
      }
    },
    useCases: [
      'Maintaining large codebases',
      'Reducing technical debt',
      'Preventing production bugs',
      'Code quality improvement',
      'Legacy code modernization'
    ]
  },
  {
    id: 'advanced-editing',
    name: 'Advanced Editing Capabilities',
    category: 'productivity',
    description: 'Beyond autocomplete - Cursor provides intelligent code generation, refactoring, documentation, and complex multi-file operations.',
    keyBenefits: [
      'Intelligent code generation',
      'Smart refactoring',
      'Automatic documentation',
      'Multi-file operations',
      'Context-aware suggestions'
    ],
    impactOnTeams: {
      leadership: {
        roi: '2-3x faster development velocity',
        metrics: [
          'More features per sprint',
          'Faster time-to-market',
          'Higher code quality',
          'Reduced development costs',
          'Better documentation coverage'
        ],
        businessValue: [
          'Competitive advantage',
          'Faster product iteration',
          'Lower development costs',
          'Better product quality',
          'Improved developer retention'
        ]
      },
      ic: {
        productivity: 'Write better code, faster',
        dailyImpact: [
          'Generate boilerplate instantly',
          'Refactor with confidence',
          'Documentation writes itself',
          'Focus on logic, not syntax',
          'Experiment faster'
        ],
        timeSaved: '4-6 hours per day'
      }
    },
    useCases: [
      'Rapid prototyping',
      'Code refactoring',
      'Documentation generation',
      'API development',
      'Feature implementation'
    ]
  }
];

export const featureCategories = [
  { id: 'all', name: 'All Features', icon: '📚' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
  { id: 'collaboration', name: 'Collaboration', icon: '👥' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'code-quality', name: 'Code Quality', icon: '✨' },
  { id: 'developer-experience', name: 'Developer Experience', icon: '🎯' },
];

