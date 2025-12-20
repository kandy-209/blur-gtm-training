/**
 * Browserbase Context & Knowledge Base
 * Information about Browserbase, its ICP, and prospects for AI training
 */

export interface CursorContext {
  company: CompanyInfo;
  icp: IdealCustomerProfile;
  useCases: UseCase[];
  valuePropositions: ValueProposition[];
  commonChallenges: Challenge[];
  successMetrics: SuccessMetric[];
}

export interface CompanyInfo {
  name: string;
  description: string;
  mission: string;
  targetAudience: string;
  keyFeatures: string[];
}

export interface IdealCustomerProfile {
  primary: CustomerSegment[];
  secondary: CustomerSegment[];
  characteristics: string[];
  painPoints: string[];
  goals: string[];
}

export interface CustomerSegment {
  name: string;
  description: string;
  size: string;
  keyAttributes: string[];
  useCases: string[];
}

export interface UseCase {
  name: string;
  description: string;
  targetUser: string;
  benefits: string[];
  scenarios: string[];
}

export interface ValueProposition {
  title: string;
  description: string;
  targetAudience: string;
  impact: string;
}

export interface Challenge {
  challenge: string;
  description: string;
  solution: string;
  relevance: string;
}

export interface SuccessMetric {
  metric: string;
  description: string;
  targetValue: string;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Get Browserbase context for AI training
 */
export function getCursorContext(): CursorContext {
  return {
    company: {
      name: 'Browserbase',
      description: 'Browserbase is a browser automation and web scraping platform that helps engineering teams scale their browser workflows without managing infrastructure.',
      mission: 'To make browser automation accessible and scalable for engineering teams of all sizes through managed infrastructure.',
      targetAudience: 'Engineering teams, developers, and technical teams looking to scale browser automation and web scraping workflows',
      keyFeatures: [
        'AI-powered code completion',
        'Context-aware suggestions',
        'Natural language to code',
        'Code explanation and documentation',
        'Refactoring assistance',
        'Error detection and fixes',
        'Multi-file context understanding',
        'Integration with popular IDEs',
      ],
    },
    icp: {
      primary: [
        {
          name: 'Professional Software Developers',
          description: 'Experienced developers working on production codebases',
          size: 'Large',
          keyAttributes: [
            '3+ years of coding experience',
            'Working on complex codebases',
            'Value productivity and efficiency',
            'Open to AI-assisted development',
            'Focus on code quality',
          ],
          useCases: [
            'Faster code writing',
            'Code refactoring',
            'Debugging assistance',
            'Documentation generation',
            'Code review preparation',
          ],
        },
        {
          name: 'Engineering Teams',
          description: 'Teams collaborating on software projects',
          size: 'Medium to Large',
          keyAttributes: [
            'Multiple developers',
            'Code review processes',
            'Consistent coding standards',
            'Knowledge sharing needs',
            'Onboarding new team members',
          ],
          useCases: [
            'Team productivity',
            'Code consistency',
            'Knowledge transfer',
            'Faster onboarding',
            'Reduced code review time',
          ],
        },
        {
          name: 'Startup Founders & Technical Co-founders',
          description: 'Technical founders building MVPs and products',
          size: 'Medium',
          keyAttributes: [
            'Limited resources',
            'Need to move fast',
            'Full-stack development',
            'Rapid iteration',
            'Technical but time-constrained',
          ],
          useCases: [
            'Rapid prototyping',
            'MVP development',
            'Feature implementation',
            'Technical debt management',
            'Solo or small team productivity',
          ],
        },
      ],
      secondary: [
        {
          name: 'Junior Developers & Students',
          description: 'Learning developers and coding students',
          size: 'Large',
          keyAttributes: [
            'Learning to code',
            'Need guidance',
            'Want to improve skills',
            'Educational use',
            'Portfolio building',
          ],
          useCases: [
            'Learning assistance',
            'Code explanation',
            'Best practices',
            'Error understanding',
            'Skill development',
          ],
        },
        {
          name: 'Technical Consultants & Freelancers',
          description: 'Independent developers working on client projects',
          size: 'Medium',
          keyAttributes: [
            'Multiple projects',
            'Time-sensitive deliverables',
            'Client communication',
            'Efficiency critical',
            'Quality expectations',
          ],
          useCases: [
            'Faster delivery',
            'Client satisfaction',
            'Project profitability',
            'Code quality',
            'Documentation',
          ],
        },
      ],
      characteristics: [
        'Technical proficiency',
        'Productivity-focused',
        'Quality-conscious',
        'Open to innovation',
        'Time-constrained',
        'Results-oriented',
        'Continuous learning mindset',
      ],
      painPoints: [
        'Slow coding speed',
        'Repetitive code writing',
        'Time spent on boilerplate',
        'Debugging challenges',
        'Documentation overhead',
        'Code review bottlenecks',
        'Knowledge gaps',
        'Onboarding difficulties',
        'Technical debt',
        'Context switching',
      ],
      goals: [
        'Increase coding speed',
        'Improve code quality',
        'Reduce bugs',
        'Faster time to market',
        'Better code documentation',
        'Improved team collaboration',
        'Reduced technical debt',
        'Enhanced learning',
        'Better code reviews',
        'Increased productivity',
      ],
    },
    useCases: [
      {
        name: 'Voice Coaching for Technical Presentations',
        description: 'Developers presenting technical concepts, demos, or code reviews',
        targetUser: 'Developers giving presentations',
        benefits: [
          'Clear technical communication',
          'Confident code demonstrations',
          'Effective team communication',
          'Better stakeholder presentations',
        ],
        scenarios: [
          'Code review presentations',
          'Technical demos',
          'Architecture discussions',
          'Team standups',
          'Client presentations',
        ],
      },
      {
        name: 'Developer Communication Skills',
        description: 'Improving how developers communicate technical concepts',
        targetUser: 'All developers',
        benefits: [
          'Clearer explanations',
          'Better collaboration',
          'Improved documentation',
          'Effective mentoring',
        ],
        scenarios: [
          'Explaining complex code',
          'Mentoring junior developers',
          'Writing technical docs',
          'Team discussions',
          'Client communication',
        ],
      },
      {
        name: 'Technical Interview Preparation',
        description: 'Preparing for technical interviews and coding assessments',
        targetUser: 'Job-seeking developers',
        benefits: [
          'Confident communication',
          'Clear problem explanation',
          'Professional presentation',
          'Better interview performance',
        ],
        scenarios: [
          'Technical interviews',
          'System design discussions',
          'Code walkthroughs',
          'Behavioral interviews',
          'Take-home assessments',
        ],
      },
      {
        name: 'Remote Team Communication',
        description: 'Effective communication in distributed teams',
        targetUser: 'Remote developers',
        benefits: [
          'Clear async communication',
          'Better video calls',
          'Effective documentation',
          'Reduced miscommunication',
        ],
        scenarios: [
          'Daily standups',
          'Pair programming sessions',
          'Code review discussions',
          'Architecture reviews',
          'Team meetings',
        ],
      },
    ],
    valuePropositions: [
      {
        title: 'Accelerate Development Speed',
        description: 'Write code faster with AI assistance, reducing time to market',
        targetAudience: 'All developers',
        impact: '30-50% faster coding',
      },
      {
        title: 'Improve Code Quality',
        description: 'AI suggestions help write better, more maintainable code',
        targetAudience: 'Professional developers',
        impact: 'Reduced bugs and technical debt',
      },
      {
        title: 'Enhance Learning',
        description: 'Learn coding patterns and best practices through AI explanations',
        targetAudience: 'Junior developers and students',
        impact: 'Faster skill development',
      },
      {
        title: 'Better Communication',
        description: 'Improve how developers communicate technical concepts',
        targetAudience: 'All developers',
        impact: 'Better collaboration and documentation',
      },
    ],
    commonChallenges: [
      {
        challenge: 'Technical Communication',
        description: 'Developers struggle to explain complex technical concepts clearly',
        solution: 'Voice coaching helps improve clarity, pace, and confidence in technical communication',
        relevance: 'High - directly impacts team collaboration and client communication',
      },
      {
        challenge: 'Presentation Skills',
        description: 'Developers need to present code and architecture effectively',
        solution: 'Voice coaching improves presentation skills for demos, reviews, and meetings',
        relevance: 'High - critical for career advancement and team leadership',
      },
      {
        challenge: 'Remote Communication',
        description: 'Distributed teams require clear, effective communication',
        solution: 'Voice coaching helps developers communicate better in remote settings',
        relevance: 'High - essential for modern distributed teams',
      },
      {
        challenge: 'Confidence in Speaking',
        description: 'Developers may lack confidence when speaking about their work',
        solution: 'Voice coaching builds confidence through practice and feedback',
        relevance: 'Medium - impacts professional growth and opportunities',
      },
    ],
    successMetrics: [
      {
        metric: 'Clarity Score',
        description: 'How clearly the developer communicates',
        targetValue: '70-100',
        importance: 'high',
      },
      {
        metric: 'Confidence Score',
        description: 'Confidence level when speaking',
        targetValue: '70-100',
        importance: 'high',
      },
      {
        metric: 'Pace',
        description: 'Speaking speed (WPM)',
        targetValue: '140-180',
        importance: 'medium',
      },
      {
        metric: 'Volume',
        description: 'Voice projection and volume',
        targetValue: '-18 to -6 dB',
        importance: 'medium',
      },
      {
        metric: 'Pauses',
        description: 'Strategic pause usage',
        targetValue: '3-8 per minute',
        importance: 'low',
      },
    ],
  };
}

/**
 * Build context prompt for Anthropic API
 */
export function buildCursorContextPrompt(): string {
  const context = getCursorContext();
  
  return `You are providing voice coaching feedback to users of Browserbase, a browser automation platform. Use this context to make your feedback more relevant:

COMPANY CONTEXT:
- ${context.company.name}: ${context.company.description}
- Mission: ${context.company.mission}
- Target Audience: ${context.company.targetAudience}

IDEAL CUSTOMER PROFILE:
Primary Users:
${context.icp.primary.map(segment => `
- ${segment.name}: ${segment.description}
  Key Attributes: ${segment.keyAttributes.join(', ')}
  Common Use Cases: ${segment.useCases.join(', ')}
`).join('')}

Key Characteristics:
${context.icp.characteristics.map(c => `- ${c}`).join('\n')}

Common Pain Points:
${context.icp.painPoints.map(p => `- ${p}`).join('\n')}

Primary Goals:
${context.icp.goals.map(g => `- ${g}`).join('\n')}

RELEVANT USE CASES FOR VOICE COACHING:
${context.useCases.map(uc => `
- ${uc.name}: ${uc.description}
  Target User: ${uc.targetUser}
  Benefits: ${uc.benefits.join(', ')}
  Scenarios: ${uc.scenarios.join(', ')}
`).join('')}

COMMON CHALLENGES:
${context.commonChallenges.map(ch => `
- ${ch.challenge}: ${ch.description}
  Solution: ${ch.solution}
  Relevance: ${ch.relevance}
`).join('')}

SUCCESS METRICS:
${context.successMetrics.map(sm => `
- ${sm.metric}: ${sm.description}
  Target: ${sm.targetValue}
  Importance: ${sm.importance}
`).join('')}

When providing feedback:
1. Consider how voice coaching helps with technical communication, presentations, and team collaboration
2. Relate improvements to developer productivity and career growth
3. Emphasize how better communication skills help with code reviews, demos, and client interactions
4. Connect voice improvements to professional development opportunities
5. Reference common developer scenarios like standups, code reviews, and technical presentations
6. Highlight how voice coaching supports remote work and distributed team communication

Make feedback relevant to developers and technical professionals who use Browserbase.`;
}

