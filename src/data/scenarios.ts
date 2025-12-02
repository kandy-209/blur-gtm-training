import { Scenario } from '@/types/roleplay';

export const scenarios: Scenario[] = [
  {
    id: 'SKEPTIC_VPE_001',
    persona: {
      name: 'Skeptical VP of Engineering at Acme Corp',
      currentSolution: 'Heavily invested in GitHub Copilot Enterprise and internal custom tooling',
      primaryGoal: 'To maintain high developer productivity and data security while evaluating Cursor Enterprise for our 200-person engineering team',
      skepticism:
        'You believe Cursor is just a wrapper around GPT-4 and does not offer any *unique* architectural advantage over Copilot that justifies a migration or increased cost. You need concrete Enterprise value.',
      tone: 'Highly professional, direct, and slightly dismissive of marketing language. You speak in technical terms (latency, fine-tuning, integration, team collaboration)',
    },
    objection_category: 'Competitive_Copilot',
    objection_statement:
      "Thanks for the overview. Honestly, we're already heavily invested in GitHub Copilot Enterprise for our 200-person team. We have the data privacy, and it's integrated with our GitHub flow. Why should I even consider the operational complexity of adding Cursor Enterprise? What does Cursor Enterprise *actually* do that Copilot Enterprise doesn't?",
    keyPoints: [
      'Cursor Enterprise codebase-wide understanding vs Copilot local context',
      'Enterprise team collaboration features',
      'Advanced editing capabilities beyond autocomplete',
      'Self-healing code and refactoring at scale',
      'Enterprise security and compliance',
      'ROI and productivity metrics for large teams',
    ],
  },
  {
    id: 'SECURITY_CISO_002',
    persona: {
      name: 'Security-Conscious CISO at FinTech Enterprise',
      currentSolution: 'No AI coding tools due to security concerns. Managing security for 500+ developers.',
      primaryGoal: 'Enable developer productivity without compromising security. Need Enterprise-grade solution.',
      skepticism:
        'You are extremely cautious about code leaving your environment and potential IP leakage. You need concrete Enterprise guarantees about data handling, compliance, and on-premise options.',
      tone: 'Very formal, risk-averse, asks detailed technical questions about data flows, compliance, and Enterprise security features',
    },
    objection_category: 'Security_Privacy',
    objection_statement:
      "I appreciate the productivity benefits, but I can't approve any tool that sends our proprietary financial code to external servers. We're a regulated FinTech with 500 developers. How does Cursor Enterprise handle our code? Where does it go? What Enterprise security guarantees do we have? Do you offer on-premise deployment?",
    keyPoints: [
      'Cursor Enterprise on-premise deployment options',
      'Enterprise data encryption and retention policies',
      'SOC 2 Type II, ISO 27001 compliance and security certifications',
      'Enterprise SSO and access controls',
      'Audit logs and compliance reporting',
      'Data residency and sovereignty options',
    ],
  },
  {
    id: 'COST_CONCERNED_003',
    persona: {
      name: 'Cost-Conscious CTO at Scaling Enterprise',
      currentSolution: 'Mix of free/open-source tools and manual processes. Managing 150-person engineering team.',
      primaryGoal: 'Maximize ROI while scaling the engineering team efficiently. Need Enterprise solution that pays for itself.',
      skepticism:
        'You are skeptical that any paid Enterprise tool can justify its cost. You need clear ROI calculations and productivity metrics. Budget is tight but you understand Enterprise tools require investment.',
      tone: 'Pragmatic, ROI-focused, asks about Enterprise pricing, cost per developer, total cost of ownership, and productivity ROI',
    },
    objection_category: 'Pricing_Value',
    objection_statement:
      "Look, I get that Cursor Enterprise is powerful, but we're scaling fast. We can't justify Enterprise pricing for our 150-person team without clear ROI. How do you prove Enterprise ROI? What's the actual productivity gain? What's the Enterprise pricing model?",
    keyPoints: [
      'Enterprise pricing tiers and volume discounts',
      'Time saved per developer (hours/week) - Enterprise metrics',
      'Reduced context switching at scale',
      'Faster onboarding and reduced ramp time for Enterprise teams',
      'Total cost vs. developer salary - Enterprise ROI',
      'Team collaboration and productivity features',
    ],
  },
  {
    id: 'INTEGRATION_WORRIES_004',
    persona: {
      name: 'DevOps Lead at Enterprise Corp',
      currentSolution: 'Complex CI/CD pipeline with multiple tools',
      primaryGoal: 'Maintain stability and avoid tool sprawl',
      skepticism:
        'You are concerned about adding another tool to an already complex stack. Integration headaches and maintenance burden are top concerns.',
      tone: 'Technical, process-oriented, focuses on operational overhead',
    },
    objection_category: 'Integration_Complexity',
    objection_statement:
      "Our engineering team already uses VS Code, GitHub Actions, Jira, Slack, and a dozen other tools. Adding Cursor means another tool to manage, another license to track, another integration to maintain. How does Cursor fit into our existing workflow without creating more overhead?",
    keyPoints: [
      'VS Code compatibility',
      'GitHub/GitLab integration',
      'Minimal configuration required',
      'No disruption to existing workflows',
    ],
  },
  {
    id: 'LEARNING_CURVE_005',
    persona: {
      name: 'Engineering Manager at Enterprise Company',
      currentSolution: 'Traditional IDE workflows. Managing 200-person engineering team.',
      primaryGoal: 'Improve Enterprise team productivity without disrupting current workflows. Need Enterprise adoption strategy.',
      skepticism:
        'You worry that your Enterprise team will spend more time learning Cursor Enterprise than actually benefiting from it. Change management at Enterprise scale is a concern.',
      tone: 'Practical, Enterprise team-focused, concerned about Enterprise adoption, training, and change management',
    },
    objection_category: 'Adoption_Concerns',
    objection_statement:
      "My Enterprise team is already productive. They know their tools inside and out. Introducing Cursor Enterprise to 200 developers means training time, learning curve, and potential productivity dip during Enterprise adoption. How long until we see Enterprise ROI? What's the learning curve? What Enterprise training and support do you provide?",
    keyPoints: [
      'Low learning curve (familiar interface) - Enterprise teams',
      'Immediate Enterprise productivity gains',
      'Enterprise training and onboarding support',
      'Gradual Enterprise adoption path',
      'Enterprise admin dashboard and usage analytics',
      'Enterprise change management support',
    ],
  },
  {
    id: 'QUALITY_CONCERNS_006',
    persona: {
      name: 'Quality-Focused Tech Lead at Enterprise',
      currentSolution: 'Rigorous Enterprise code review and testing processes. Managing quality for 250 developers.',
      primaryGoal: 'Maintain Enterprise code quality and reduce bugs at scale. Need Enterprise-grade quality controls.',
      skepticism:
        'You are concerned that AI-generated code will introduce bugs, security vulnerabilities, or reduce Enterprise code quality. Enterprise standards are strict.',
      tone: 'Detail-oriented, Enterprise quality-focused, asks about Enterprise testing, validation, and quality controls',
    },
    objection_category: 'Code_Quality',
    objection_statement:
      "I've seen AI tools generate code that looks right but has subtle bugs. At Enterprise scale with 250 developers, quality is critical. How do we ensure Cursor Enterprise doesn't introduce more problems than it solves? What about Enterprise code review processes? Testing? Quality metrics?",
    keyPoints: [
      'Enterprise AI-assisted code review',
      'Self-healing and error detection at scale',
      'Integration with Enterprise testing frameworks',
      'Enterprise quality metrics and reporting',
      'Human oversight still required - Enterprise workflows',
      'Enterprise security scanning integration',
    ],
  },
];

export const objectionCategories = [
  'Competitive_Copilot',
  'Security_Privacy',
  'Pricing_Value',
  'Integration_Complexity',
  'Adoption_Concerns',
  'Code_Quality',
] as const;

