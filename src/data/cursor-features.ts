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
      blogLinks?: Array<{ title: string; url: string }>;
      youtubeLinks?: Array<{ title: string; url: string }>;
      videoLinks?: Array<{ title: string; url: string }>;
    };
    ic: {
      productivity: string;
      dailyImpact: string[];
      timeSaved: string;
      blogLinks?: Array<{ title: string; url: string }>;
      youtubeLinks?: Array<{ title: string; url: string }>;
      videoLinks?: Array<{ title: string; url: string }>;
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
        ],
        blogLinks: [
          { title: 'Browserbase Blog', url: 'https://www.browserbase.com/blog' },
          { title: 'Browserbase Blog', url: 'https://www.browserbase.com/blog' }
        ],
        youtubeLinks: []
      },
      ic: {
        productivity: 'Spend less time reading code, more time writing',
        dailyImpact: [
          'No more hunting through multiple files to understand context',
          'Instant suggestions based on your codebase patterns',
          'Faster debugging with full codebase awareness',
          'Confidence in making changes to unfamiliar code'
        ],
        timeSaved: '2-3 hours per day on average',
        blogLinks: [
          { title: 'Browserbase Blog', url: 'https://www.browserbase.com/blog' },
          { title: 'Browserbase Blog', url: 'https://www.browserbase.com/blog' }
        ],
        youtubeLinks: []
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
  },
  {
    id: 'plan-mode',
    name: 'Plan Mode',
    category: 'productivity',
    description: 'Create comprehensive plans for complex features and refactoring. Cursor responds with clarifying questions to improve plan quality, and provides an interactive UI to easily answer questions. Search plans with ⌘+F.',
    keyBenefits: [
      'Interactive clarifying questions',
      'Improved plan quality',
      'Searchable plans (⌘+F)',
      'Comprehensive feature planning',
      'Better project organization'
    ],
    impactOnTeams: {
      leadership: {
        roi: '30-40% reduction in planning time, better project outcomes',
        metrics: [
          'Faster project kickoff',
          'Reduced planning overhead',
          'Better project success rates',
          'Clearer project scope',
          'Improved team alignment'
        ],
        businessValue: [
          'Faster time-to-market',
          'Reduced project risk',
          'Better resource allocation',
          'Improved project outcomes',
          'Higher team productivity'
        ],
        blogLinks: [],
        youtubeLinks: [],
        videoLinks: [
          { title: 'Improved Plan Mode Demo', url: 'https://cdn.sanity.io/files/2hv88549/production/3e43d59b79f4e400fa3412e99fa87427a025cf0b.mp4' }
        ]
      },
      ic: {
        productivity: 'Plan complex features faster with AI assistance',
        dailyImpact: [
          'Interactive planning with clarifying questions',
          'Searchable plans for quick reference',
          'Better project organization',
          'Clearer implementation path',
          'Reduced planning overhead'
        ],
        timeSaved: '2-3 hours per week on planning',
        blogLinks: [],
        youtubeLinks: [],
        videoLinks: [
          { title: 'Improved Plan Mode Demo', url: 'https://cdn.sanity.io/files/2hv88549/production/3e43d59b79f4e400fa3412e99fa87427a025cf0b.mp4' }
        ]
      }
    },
    useCases: [
      'Planning complex features',
      'Large-scale refactoring',
      'Multi-file implementations',
      'Project kickoff',
      'Technical design documents'
    ],
    technicalDetails: [
      'Interactive UI for answering questions',
      'Search functionality (⌘+F)',
      'Clarifying questions improve plan quality',
      'Comprehensive plan generation'
    ]
  },
  {
    id: 'ai-code-review',
    name: 'AI Code Review in Editor',
    category: 'code-quality',
    description: 'Find and fix bugs directly in Cursor with AI code reviews. It analyzes your changes and finds issues which you can see in the sidepanel. This is in addition to Bugbot, which runs on your source control provider like GitHub (including Enterprise Server), GitLab, and more.',
    keyBenefits: [
      'Find bugs directly in editor',
      'Issues shown in sidepanel',
      'Catch issues before commit',
      'Works alongside Bugbot',
      'GitHub/GitLab integration',
      'Enterprise Server support'
    ],
    impactOnTeams: {
      leadership: {
        roi: '40-50% reduction in code review time, higher code quality',
        metrics: [
          'Faster code review cycles',
          'Higher code quality',
          'Reduced bug rates',
          'Better code consistency',
          'Faster PR reviews'
        ],
        businessValue: [
          'Faster shipping velocity',
          'Lower bug rates',
          'Better code quality',
          'Reduced technical debt',
          'Improved developer satisfaction'
        ],
        blogLinks: [],
        youtubeLinks: [],
        videoLinks: [
          { title: 'AI Code Review in Editor Demo', url: 'https://cdn.sanity.io/files/2hv88549/production/f92b6ce94b56a8df4e38a3ccad7d992a5ec20093.mp4' }
        ]
      },
      ic: {
        productivity: 'Get instant feedback on code quality without waiting for reviews',
        dailyImpact: [
          'Instant code review feedback',
          'Catch issues early',
          'Learn best practices',
          'Improve code quality',
          'Faster iteration cycles'
        ],
        timeSaved: '3-5 hours per week on code review',
        blogLinks: [],
        youtubeLinks: [],
        videoLinks: [
          { title: 'AI Code Review in Editor Demo', url: 'https://cdn.sanity.io/files/2hv88549/production/f92b6ce94b56a8df4e38a3ccad7d992a5ec20093.mp4' }
        ]
      }
    },
    useCases: [
      'Pre-commit code review',
      'Code quality checks',
      'Learning best practices',
      'Catching bugs early',
      'Improving code consistency',
      'GitHub Enterprise Server integration',
      'GitLab integration'
    ],
    technicalDetails: [
      'In-editor code review',
      'Sidepanel issue display',
      'Instant feedback',
      'Quality suggestions',
      'Issue detection',
      'Bugbot integration',
      'Source control provider support'
    ]
  },
  {
    id: 'instant-grep',
    name: 'Instant Grep',
    category: 'developer-experience',
    description: 'Lightning-fast code search across your entire codebase. Find code, functions, and patterns instantly without waiting for search results.',
    keyBenefits: [
      'Lightning-fast search',
      'Search entire codebase',
      'Find code patterns',
      'Instant results',
      'Better code navigation'
    ],
    impactOnTeams: {
      leadership: {
        roi: '20-30% reduction in time spent searching code',
        metrics: [
          'Faster code navigation',
          'Reduced context switching',
          'Better code discovery',
          'Improved productivity',
          'Faster onboarding'
        ],
        businessValue: [
          'Faster development cycles',
          'Better code reuse',
          'Reduced onboarding time',
          'Improved productivity',
          'Lower development costs'
        ],
        blogLinks: [],
        youtubeLinks: []
      },
      ic: {
        productivity: 'Find code instantly, spend less time searching',
        dailyImpact: [
          'Instant code search results',
          'Find patterns quickly',
          'Better code navigation',
          'Discover existing code',
          'Faster debugging'
        ],
        timeSaved: '1-2 hours per day on code search',
        blogLinks: [],
        youtubeLinks: []
      }
    },
    useCases: [
      'Finding code patterns',
      'Code navigation',
      'Discovering existing code',
      'Debugging',
      'Onboarding to new codebases'
    ],
    technicalDetails: [
      'Lightning-fast search',
      'Full codebase search',
      'Pattern matching',
      'Instant results'
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

