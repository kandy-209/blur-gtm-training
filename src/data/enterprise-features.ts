export interface EnterpriseFeature {
  id: string;
  name: string;
  category: 'security' | 'access' | 'privacy' | 'controls' | 'analytics' | 'compliance' | 'deployment' | 'integration';
  description: string;
  keyBenefits: string[];
  useCases: string[];
  documentation: {
    overview: string;
    setupSteps: string[];
    keyPoints: string[];
    resources: {
      docsUrl?: string;
      blogLinks?: Array<{ title: string; url: string }>;
      youtubeLinks?: Array<{ title: string; url: string }>;
    };
  };
  salesTalkingPoints: {
    leadership: {
      value: string;
      metrics: string[];
      businessValue: string[];
    };
    technical: {
      capabilities: string[];
      implementation: string[];
      advantages: string[];
    };
  };
}

export const enterpriseFeatures: EnterpriseFeature[] = [
  {
    id: 'security-compliance',
    name: 'Security & Compliance',
    category: 'security',
    description: 'Enterprise-grade security with SOC 2 Type II certification, GDPR compliance, and comprehensive security controls for organizations deploying AI-assisted development at scale.',
    keyBenefits: [
      'SOC 2 Type II certified',
      'GDPR compliant with Data Processing Agreement',
      'Comprehensive security architecture',
      'Trust Center with certifications and assessments',
      'Responsible disclosure program for vulnerabilities'
    ],
    useCases: [
      'Financial services organizations',
      'Healthcare and HIPAA compliance',
      'Government contracts',
      'Companies with strict data policies',
      'Multi-tenant SaaS platforms'
    ],
    documentation: {
      overview: 'Cursor provides enterprise-grade security and compliance for organizations deploying AI-assisted development. Our Trust Center provides all security practices, certifications, and compliance information needed for security reviews.',
      setupSteps: [
        'Review Trust Center (https://trust.cursor.com/) for security practices',
        'Access Security page (https://cursor.com/security) for detailed architecture',
        'Review Privacy Overview (https://cursor.com/privacy-overview)',
        'Sign Data Processing Agreement (https://cursor.com/terms/dpa) for GDPR compliance',
        'Download latest certification documents from Trust Center'
      ],
      keyPoints: [
        'SOC 2 Type II certified',
        'GDPR compliant with DPA',
        'Comprehensive security controls',
        'Third-party assessment reports available',
        'Regular security audits and updates'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/enterprise',
        blogLinks: [
          { title: 'Enterprise Security Overview', url: 'https://cursor.com/security' }
        ],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Enables AI adoption in regulated industries with zero compromise on security',
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
      technical: {
        capabilities: [
          'SOC 2 Type II certification',
          'GDPR-compliant data handling',
          'Comprehensive audit logs',
          'Security architecture documentation'
        ],
        implementation: [
          'Trust Center access for security reviews',
          'DPA available for GDPR compliance',
          'Third-party assessment reports',
          'Responsible disclosure program'
        ],
        advantages: [
          'No security review delays',
          'Work with sensitive code confidently',
          'Access AI assistance for all projects',
          'No restrictions on code types'
        ]
      }
    }
  },
  {
    id: 'identity-access',
    name: 'Identity & Access Management',
    category: 'access',
    description: 'SSO, SCIM provisioning, RBAC, and MDM policies for centralized user management and secure access control across your organization.',
    keyBenefits: [
      'SSO and SAML authentication',
      'SCIM automated provisioning',
      'MDM policy enforcement',
      'Role-based access control',
      'Centralized user management'
    ],
    useCases: [
      'Large enterprises with existing SSO',
      'Organizations using identity providers',
      'Teams requiring automated user provisioning',
      'Companies with MDM solutions',
      'Multi-team organizations'
    ],
    documentation: {
      overview: 'Browserbase provides comprehensive identity and access management through SSO, SCIM, RBAC, and MDM policies. Streamline authentication and enforce team-wide policies.',
      setupSteps: [
        'Set up SSO/SAML with your identity provider',
        'Configure SCIM for automated user provisioning',
        'Define RBAC roles and permissions',
        'Deploy MDM policies for team ID enforcement',
        'Configure allowed extensions via MDM'
      ],
      keyPoints: [
        'Single sign-on for streamlined authentication',
        'Automated user provisioning and deprovisioning',
        'Enforce allowed team IDs via MDM',
        'Control extension access',
        'Centralized dashboard management'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/enterprise/identity-and-access-management',
        blogLinks: [],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Reduces IT overhead and improves security posture with centralized access management',
        metrics: [
          'Faster onboarding (automated provisioning)',
          'Reduced IT support tickets',
          'Better security compliance',
          'Centralized access control'
        ],
        businessValue: [
          'Lower IT operational costs',
          'Improved security posture',
          'Faster team scaling',
          'Better compliance tracking'
        ]
      },
      technical: {
        capabilities: [
          'SSO/SAML integration',
          'SCIM 2.0 provisioning',
          'MDM policy distribution',
          'RBAC configuration'
        ],
        implementation: [
          'Works with major identity providers',
          'Automated user lifecycle management',
          'Policy enforcement via MDM',
          'Dashboard-based configuration'
        ],
        advantages: [
          'No manual user management',
          'Consistent security policies',
          'Easy integration with existing systems',
          'Scalable to thousands of users'
        ]
      }
    }
  },
  {
    id: 'privacy-data-governance',
    name: 'Privacy & Data Governance',
    category: 'privacy',
    description: 'Privacy Mode with zero data retention, data residency options, and comprehensive data governance controls for sensitive codebases.',
    keyBenefits: [
      'Privacy Mode with zero data retention',
      'Data residency options',
      'Data flow transparency',
      'Privacy Mode enforcement',
      'Comprehensive data governance'
    ],
    useCases: [
      'Companies with proprietary code',
      'Organizations handling sensitive data',
      'Regulated industries',
      'Multi-region deployments',
      'Privacy-conscious teams'
    ],
    documentation: {
      overview: 'Browserbase provides comprehensive privacy and data governance controls, including privacy mode for zero data retention and data residency options.',
      setupSteps: [
        'Review data flows documentation',
        'Configure Privacy Mode settings',
        'Set data residency preferences',
        'Enforce Privacy Mode organization-wide',
        'Configure data governance policies'
      ],
      keyPoints: [
        'Privacy Mode: Zero data retention with AI providers',
        'Data residency options available',
        'Transparent data flows',
        'Organization-wide enforcement',
        'Comprehensive privacy controls'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/enterprise/privacy-and-data-governance',
        blogLinks: [
          { title: 'Privacy Overview', url: 'https://cursor.com/privacy-overview' }
        ],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Enables AI adoption without compromising data privacy or regulatory compliance',
        metrics: [
          'Zero data retention in Privacy Mode',
          '100% data residency control',
          'Compliance with privacy regulations',
          'Reduced privacy review time'
        ],
        businessValue: [
          'Use AI with sensitive code',
          'Meet privacy regulations',
          'Reduce compliance overhead',
          'Enable AI in restricted environments'
        ]
      },
      technical: {
        capabilities: [
          'Privacy Mode enforcement',
          'Data residency control',
          'Transparent data flows',
          'Organization-wide policies'
        ],
        implementation: [
          'Zero data retention option',
          'Regional data storage',
          'Policy enforcement via dashboard',
          'Comprehensive audit trails'
        ],
        advantages: [
          'Work with sensitive code safely',
          'No privacy concerns',
          'Regulatory compliance',
          'Full control over data'
        ]
      }
    }
  },
  {
    id: 'hooks',
    name: 'Hooks',
    category: 'controls',
    description: 'Observe, control, and extend the agent loop using custom scripts. Add observability, enforce compliance, and integrate with external systems.',
    keyBenefits: [
      'Add observability to agent actions',
      'Enforce compliance policies',
      'Block unapproved commands',
      'Scrub secrets in real-time',
      'Connect external systems'
    ],
    useCases: [
      'Compliance monitoring',
      'Security auditing',
      'Integration with engineering intelligence platforms',
      'Custom workflow automation',
      'Policy enforcement'
    ],
    documentation: {
      overview: 'Hooks allow you to observe, control, and extend the agent loop using custom scripts. They can add observability, enforce compliance, and integrate with external systems.',
      setupSteps: [
        'Create hook configuration file',
        'Define hooks for agent lifecycle events',
        'Write custom scripts for hook actions',
        'Distribute via MDM or cloud option',
        'Test and monitor hook execution'
      ],
      keyPoints: [
        'Observe agent actions, tool calls, prompts, and completions',
        'Control the full agent loop',
        'Enforce compliance policies',
        'Block unapproved commands',
        'Scrub secrets or proprietary code in real-time',
        'Connect external systems and trigger automations'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/agent/hooks',
        blogLinks: [
          { title: 'Introducing Cursor for Enterprise', url: 'https://cursor.com/blog/enterprise' }
        ],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Provides full visibility and control over AI usage, enabling smarter engineering decisions',
        metrics: [
          '100% visibility into AI usage',
          'Real-time compliance enforcement',
          'Reduced security incidents',
          'Better engineering insights'
        ],
        businessValue: [
          'Understand AI impact on productivity',
          'Enforce security policies automatically',
          'Integrate with existing tools',
          'Make data-driven decisions'
        ]
      },
      technical: {
        capabilities: [
          'beforeSubmitPrompt hooks',
          'beforeShellCommand hooks',
          'Custom script execution',
          'MDM and cloud distribution'
        ],
        implementation: [
          'JSON configuration file',
          'Custom shell scripts',
          'Integration with external systems',
          'Real-time policy enforcement'
        ],
        advantages: [
          'Full agent loop control',
          'Custom compliance workflows',
          'Seamless integrations',
          'Real-time security enforcement'
        ]
      }
    }
  },
  {
    id: 'team-rules',
    name: 'Team Rules',
    category: 'controls',
    description: 'Shared context and best practices for every developer. Standardize API schemas, enforce conventions, and teach common workflows organization-wide.',
    keyBenefits: [
      'Standardize API schemas',
      'Enforce coding conventions',
      'Teach common workflows',
      'Recommend or require rules',
      'Cloud dashboard management'
    ],
    useCases: [
      'Large engineering teams',
      'Multi-team organizations',
      'Consistency across codebases',
      'Onboarding new developers',
      'Enforcing best practices'
    ],
    documentation: {
      overview: 'Team Rules bring shared context and best practices to every developer in your organization. Rules can standardize API schemas, enforce conventions, or teach common workflows.',
      setupSteps: [
        'Define team rules and best practices',
        'Create rule documentation',
        'Configure rules in cloud dashboard',
        'Set as recommended or required',
        'Monitor rule adoption'
      ],
      keyPoints: [
        'Standardize API schemas and conventions',
        'Enforce coding best practices',
        'Guide developers automatically',
        'Recommend or require rules',
        'Cloud dashboard configuration'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/context/rules#team-rules',
        blogLinks: [
          { title: 'Introducing Cursor for Enterprise', url: 'https://cursor.com/blog/enterprise' }
        ],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Ensures consistency and quality across teams while reducing onboarding time',
        metrics: [
          'Reduced code review time',
          'Higher code quality',
          'Faster onboarding',
          'Better consistency'
        ],
        businessValue: [
          'Faster shipping velocity',
          'Lower bug rates',
          'Better team cohesion',
          'Reduced technical debt'
        ]
      },
      technical: {
        capabilities: [
          'API schema standardization',
          'Convention enforcement',
          'Workflow guidance',
          'Rule recommendation/requirement'
        ],
        implementation: [
          'Cloud dashboard configuration',
          'Automatic rule application',
          'Developer guidance',
          'Rule adoption tracking'
        ],
        advantages: [
          'Consistent code patterns',
          'Faster onboarding',
          'Less time fixing',
          'More time shipping'
        ]
      }
    }
  },
  {
    id: 'analytics',
    name: 'Upgraded Analytics',
    category: 'analytics',
    description: 'Comprehensive analytics dashboard with real-time data on AI usage, team activity, and productivity metrics. Export data via API or CSV.',
    keyBenefits: [
      'Daily activity and top users',
      'CLI, Background Agent, and Bugbot adoption',
      'AI lines of code per commit',
      'Filter by Active Directory group',
      'Exportable data (API or CSV)',
      'Updates every 2 minutes'
    ],
    useCases: [
      'Engineering leadership',
      'Productivity analysis',
      'Team performance tracking',
      'ROI measurement',
      'Usage optimization'
    ],
    documentation: {
      overview: 'Upgraded analytics provide leaders with comprehensive data about how their teams use AI, including daily activity, top users, and detailed usage metrics.',
      setupSteps: [
        'Access analytics dashboard',
        'Configure Active Directory groups',
        'Set up data exports',
        'Review usage metrics',
        'Export data via API or CSV'
      ],
      keyPoints: [
        'Daily activity and top users at a glance',
        'CLI, Background Agent, and Bugbot adoption data',
        'AI lines of code percentage per commit',
        'Filter by Active Directory group',
        'Exportable replication data',
        'Real-time updates (every 2 minutes)'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/account/teams/analytics',
        blogLinks: [
          { title: 'Introducing Cursor for Enterprise', url: 'https://cursor.com/blog/enterprise' }
        ],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Provides data-driven insights into AI productivity and team performance',
        metrics: [
          'Real-time usage data',
          'Productivity metrics',
          'Team adoption rates',
          'ROI measurement'
        ],
        businessValue: [
          'Make smarter engineering decisions',
          'Identify power users and patterns',
          'Measure AI productivity impact',
          'Optimize team performance'
        ]
      },
      technical: {
        capabilities: [
          'Daily activity tracking',
          'Top users leaderboard',
          'CLI/Agent/Bugbot adoption',
          'AI code percentage per commit',
          'AD group filtering',
          'API and CSV exports'
        ],
        implementation: [
          'Web dashboard access',
          'Real-time data updates',
          'Exportable data',
          'AD integration'
        ],
        advantages: [
          'Trustworthy, actionable data',
          'Real-time insights',
          'Easy data export',
          'Comprehensive metrics'
        ]
      }
    }
  },
  {
    id: 'audit-log',
    name: 'Audit Log',
    category: 'compliance',
    description: 'Full visibility into every key event on the platform. Track authentication, user management, security changes, and configuration updates.',
    keyBenefits: [
      'Track 19 event types',
      'Access and authentication events',
      'Asset edits and configuration',
      'Security changes',
      'CSV export available'
    ],
    useCases: [
      'Compliance requirements',
      'Security auditing',
      'Change tracking',
      'SIEM integration',
      'Forensic analysis'
    ],
    documentation: {
      overview: 'Audit Log gives administrators full visibility into every key event on the platform, from security changes to rule updates.',
      setupSteps: [
        'Access audit log dashboard',
        'Configure event tracking',
        'Set up SIEM integration',
        'Export logs as needed',
        'Monitor key events'
      ],
      keyPoints: [
        'Tracks 19 event types',
        'Access and authentication tracking',
        'Asset edits and configuration',
        'Security changes',
        'CSV export available',
        'SIEM integration support'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/enterprise/compliance-and-monitoring#audit-logs',
        blogLinks: [
          { title: 'Introducing Cursor for Enterprise', url: 'https://cursor.com/blog/enterprise' }
        ],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Ensures compliance and provides full audit trail for security and regulatory requirements',
        metrics: [
          '100% event visibility',
          'Compliance with audit requirements',
          'Reduced audit preparation time',
          'Better security posture'
        ],
        businessValue: [
          'Meet compliance requirements',
          'Faster security audits',
          'Better incident response',
          'Reduced compliance risk'
        ]
      },
      technical: {
        capabilities: [
          '19 event types tracked',
          'Access and authentication logs',
          'Configuration change tracking',
          'Security event logging',
          'SIEM integration'
        ],
        implementation: [
          'Web dashboard access',
          'CSV export',
          'SIEM streaming',
          'Real-time monitoring'
        ],
        advantages: [
          'Full audit trail',
          'Compliance ready',
          'Easy integration',
          'Comprehensive tracking'
        ]
      }
    }
  },
  {
    id: 'sandbox-mode',
    name: 'Sandbox Mode',
    category: 'controls',
    description: 'Execute agent terminal commands in a restricted environment for faster and safer iteration. Blocks network access and limits file access.',
    keyBenefits: [
      'Restricted execution environment',
      'Blocks network access by default',
      'Limits file access to workspace and /tmp/',
      'User can skip or re-run outside sandbox',
      'Admin control over availability'
    ],
    useCases: [
      'Safer agent iteration',
      'Testing untrusted code',
      'Compliance requirements',
      'Security-sensitive environments',
      'Development workflows'
    ],
    documentation: {
      overview: 'Sandbox Mode executes agent terminal commands in a restricted environment to enable faster and safer iteration.',
      setupSteps: [
        'Enable Sandbox Mode',
        'Configure network restrictions',
        'Set file access limits',
        'Configure team-wide settings',
        'Test sandbox behavior'
      ],
      keyPoints: [
        'Restricted execution environment',
        'Blocks network access by default',
        'Limits file access to workspace and /tmp/',
        'User can skip or re-run outside sandbox',
        'Admin control over availability',
        'Team-wide git and network access control'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/agent/terminal#sandbox',
        blogLinks: [
          { title: 'Introducing Cursor for Enterprise', url: 'https://cursor.com/blog/enterprise' }
        ],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Enables safer AI agent usage while maintaining productivity and security',
        metrics: [
          'Reduced security incidents',
          'Faster iteration cycles',
          'Better compliance',
          'Improved safety'
        ],
        businessValue: [
          'Safer AI adoption',
          'Faster development',
          'Better security posture',
          'Reduced risk'
        ]
      },
      technical: {
        capabilities: [
          'Restricted execution environment',
          'Network access blocking',
          'File access limits',
          'Admin control',
          'Team-wide enforcement'
        ],
        implementation: [
          'Default network blocking',
          'Workspace and /tmp/ access',
          'User override options',
          'Admin configuration'
        ],
        advantages: [
          'Safer agent execution',
          'Faster iteration',
          'Better security',
          'Admin control'
        ]
      }
    }
  },
  {
    id: 'network-configuration',
    name: 'Network Configuration',
    category: 'security',
    description: 'Proxy setup, IP allowlisting, and encryption controls for secure network access and compliance with corporate network policies.',
    keyBenefits: [
      'Proxy configuration support',
      'IP allowlisting',
      'Encryption controls',
      'Corporate network compliance',
      'Secure access management'
    ],
    useCases: [
      'Corporate network requirements',
      'VPN and proxy environments',
      'IP-based access control',
      'Network security compliance',
      'Restricted network access'
    ],
    documentation: {
      overview: 'Browserbase supports proxy setup, IP allowlisting, and encryption controls for secure network access.',
      setupSteps: [
        'Configure proxy settings',
        'Set up IP allowlisting',
        'Configure encryption',
        'Test network connectivity',
        'Monitor network access'
      ],
      keyPoints: [
        'Proxy configuration support',
        'IP allowlisting',
        'Encryption controls',
        'Corporate network compliance',
        'Secure access management'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/enterprise/network-configuration',
        blogLinks: [],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Ensures compliance with corporate network policies and security requirements',
        metrics: [
          '100% network policy compliance',
          'Reduced security review time',
          'Better network security',
          'Faster deployment'
        ],
        businessValue: [
          'Meet network requirements',
          'Faster security approval',
          'Better security posture',
          'Easier deployment'
        ]
      },
      technical: {
        capabilities: [
          'Proxy configuration',
          'IP allowlisting',
          'Encryption controls',
          'Network access management'
        ],
        implementation: [
          'Standard proxy protocols',
          'IP-based access control',
          'Encryption configuration',
          'Network monitoring'
        ],
        advantages: [
          'Corporate network compatible',
          'Secure access',
          'Easy configuration',
          'Compliance ready'
        ]
      }
    }
  },
  {
    id: 'model-integration-management',
    name: 'Model & Integration Management',
    category: 'integration',
    description: 'Control which models users can access, manage MCP servers, and configure third-party integrations including GitHub, Linear, and Slack.',
    keyBenefits: [
      'Control model access',
      'MCP server trust management',
      'GitHub integration',
      'Linear integration',
      'Slack Cloud Agents',
      'Repository blocklist'
    ],
    useCases: [
      'Model access control',
      'Integration management',
      'Repository security',
      'Third-party tool integration',
      'MCP server management'
    ],
    documentation: {
      overview: 'Browserbase provides comprehensive integration management, including API access controls and third-party integrations.',
      setupSteps: [
        'Configure model access restrictions',
        'Set up MCP server trust',
        'Configure GitHub integration',
        'Set up Linear integration',
        'Enable Slack Cloud Agents',
        'Configure repository blocklist'
      ],
      keyPoints: [
        'Control which models users can use',
        'MCP server trust management',
        'GitHub repository integration',
        'Linear issue tracking',
        'Slack Cloud Agents',
        'Repository blocklist for security'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/enterprise/model-and-integration-management',
        blogLinks: [],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Provides granular control over AI models and integrations while enabling seamless workflow integration',
        metrics: [
          'Better security control',
          'Reduced integration overhead',
          'Faster workflow integration',
          'Improved productivity'
        ],
        businessValue: [
          'Control AI model usage',
          'Seamless tool integration',
          'Better security',
          'Improved workflows'
        ]
      },
      technical: {
        capabilities: [
          'Model access restrictions',
          'MCP server management',
          'GitHub integration',
          'Linear integration',
          'Slack Cloud Agents',
          'Repository blocklist'
        ],
        implementation: [
          'Dashboard configuration',
          'API access',
          'OAuth integrations',
          'Trust management'
        ],
        advantages: [
          'Granular control',
          'Seamless integration',
          'Better security',
          'Workflow optimization'
        ]
      }
    }
  },
  {
    id: 'deployment-patterns',
    name: 'Deployment Patterns',
    category: 'deployment',
    description: 'Choose between MDM-managed IDE deployment or self-hosted CLI. Configure deployment patterns to match your organization\'s needs.',
    keyBenefits: [
      'MDM-managed IDE deployment',
      'Self-hosted CLI option',
      'Flexible deployment models',
      'Team ID enforcement',
      'Extension management'
    ],
    useCases: [
      'Large enterprise deployments',
      'MDM-managed environments',
      'Self-hosted requirements',
      'Flexible deployment needs',
      'Team-wide configuration'
    ],
    documentation: {
      overview: 'Browserbase supports multiple deployment patterns, including cloud-managed and on-premise options.',
      setupSteps: [
        'Choose deployment pattern',
        'Configure MDM policies (if applicable)',
        'Set up self-hosted CLI (if applicable)',
        'Enforce team IDs',
        'Configure extensions',
        'Deploy to users'
      ],
      keyPoints: [
        'MDM-managed IDE deployment',
        'Self-hosted CLI option',
        'Team ID enforcement',
        'Extension management',
        'Flexible deployment models'
      ],
      resources: {
        docsUrl: 'https://cursor.com/docs/enterprise/deployment-patterns',
        blogLinks: [],
        youtubeLinks: []
      }
    },
    salesTalkingPoints: {
      leadership: {
        value: 'Provides flexible deployment options to match your organization\'s infrastructure and security requirements',
        metrics: [
          'Faster deployment',
          'Better security control',
          'Reduced IT overhead',
          'Flexible options'
        ],
        businessValue: [
          'Match infrastructure needs',
          'Faster rollout',
          'Better security',
          'Lower IT costs'
        ]
      },
      technical: {
        capabilities: [
          'MDM-managed deployment',
          'Self-hosted CLI',
          'Team ID enforcement',
          'Extension management',
          'Flexible patterns'
        ],
        implementation: [
          'MDM policy configuration',
          'CLI installation',
          'Team ID setup',
          'Extension distribution'
        ],
        advantages: [
          'Flexible deployment',
          'Security control',
          'Easy management',
          'Scalable options'
        ]
      }
    }
  }
];

export const enterpriseCategories = [
  { id: 'all', name: 'All Features', icon: '📚' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'access', name: 'Access Management', icon: '👥' },
  { id: 'privacy', name: 'Privacy', icon: '🛡️' },
  { id: 'controls', name: 'Controls', icon: '⚙️' },
  { id: 'analytics', name: 'Analytics', icon: '📊' },
  { id: 'compliance', name: 'Compliance', icon: '✅' },
  { id: 'deployment', name: 'Deployment', icon: '🚀' },
  { id: 'integration', name: 'Integrations', icon: '🔗' },
];

