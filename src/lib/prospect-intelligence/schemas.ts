import { z } from "zod";

/**
 * Schema for detected third-party tools and integrations
 */
export const ThirdPartyToolsSchema = z.object({
  analytics: z.array(z.string()).describe("Analytics tools like Segment, Amplitude, Mixpanel, Google Analytics"),
  monitoring: z.array(z.string()).describe("Monitoring tools like Datadog, Sentry, LogRocket"),
  deployment: z.array(z.string()).describe("Deployment platforms like Vercel, Netlify, AWS"),
  chat: z.array(z.string()).describe("Chat/support tools like Intercom, Zendesk"),
  other: z.array(z.string()).describe("Other notable third-party tools"),
});

/**
 * Schema for job/hiring information
 */
export const HiringDataSchema = z.object({
  hasOpenEngineeringRoles: z.boolean().describe("Whether the company has open engineering positions"),
  engineeringRoleCount: z.number().nullable().describe("Number of open engineering roles, null if unknown"),
  totalOpenRoles: z.number().nullable().describe("Total number of all open positions, null if unknown"),
  jobBoardPlatform: z.string().nullable().describe("Job board platform used (Lever, Greenhouse, Ashby, etc.)"),
  engineeringRoleTitles: z.array(z.string()).describe("List of engineering job titles found"),
  seniorityLevels: z.array(z.string()).describe("Seniority levels being hired (Junior, Senior, Staff, etc.)"),
  hiringSignals: z.array(z.string()).describe("Notable hiring signals or patterns"),
  confidenceScore: z.number().min(0).max(100).describe("0-100 score of how confident you are in these findings"),
  fallbackReason: z.string().nullable().optional().describe("Reason why some fields might be missing or uncertain"),
});

/**
 * Schema for technology stack detection
 */
export const TechStackSchema = z.object({
  primaryFramework: z.string().nullable().describe("Primary frontend framework (React, Vue, Angular, Svelte, etc.)"),
  frameworkConfidence: z.enum(["high", "medium", "low"]).describe("Confidence level in framework detection"),
  frameworkEvidence: z.array(z.string()).describe("Evidence that led to framework detection"),
  additionalFrameworks: z.array(z.string()).describe("Other frameworks or libraries detected"),
  buildTools: z.array(z.string()).describe("Build tools detected (Webpack, Vite, etc.)"),
  isModernStack: z.boolean().describe("Whether they use a modern JavaScript stack"),
  confidenceScore: z.number().min(0).max(100).describe("0-100 score of how confident you are in these findings"),
  fallbackReason: z.string().nullable().optional().describe("Reason why some fields might be missing or uncertain"),
});

/**
 * Schema for engineering culture information
 */
export const EngineeringCultureSchema = z.object({
  hasEngineeringBlog: z.boolean().describe("Whether they have a technical/engineering blog"),
  engineeringBlogUrl: z.string().nullable().describe("URL to engineering blog if found"),
  recentBlogTopics: z.array(z.string()).describe("Recent engineering blog topics"),
  developmentPractices: z.array(z.string()).describe("Mentioned dev practices (CI/CD, Agile, etc.)"),
  techCultureHighlights: z.array(z.string()).describe("Key quotes about their engineering culture"),
  opensourcePresence: z.boolean().describe("Whether they mention open source contributions"),
});

/**
 * Schema for company size and growth indicators
 */
export const CompanySizeSchema = z.object({
  estimatedEmployeeRange: z.string().nullable().describe("Estimated employee count range (e.g., '50-100', '100-250')"),
  estimatedEngineeringTeamSize: z.string().nullable().describe("Estimated engineering team size if mentioned"),
  growthIndicators: z.array(z.string()).describe("Signals of company growth"),
  fundingInfo: z.string().nullable().describe("Any funding information found"),
});

/**
 * Schema for ICP (Ideal Customer Profile) scoring
 */
export const ICPScoreSchema = z.object({
  overallScore: z.number().min(1).max(10).describe("Overall ICP fit score from 1-10"),
  priorityLevel: z.enum(["high", "medium", "low"]).describe("Recommended priority for outreach"),
  positiveSignals: z.array(z.string()).describe("Factors that increase ICP fit"),
  negativeSignals: z.array(z.string()).describe("Factors that decrease ICP fit"),
  recommendedTalkingPoints: z.array(z.string()).describe("Suggested talking points for outreach"),
  outreachTiming: z.string().describe("Recommendation on outreach timing"),
});

/**
 * Main prospect intelligence schema - combines all sub-schemas
 */
export const ProspectIntelligenceSchema = z.object({
  // Basic company info
  companyName: z.string().describe("Company name"),
  companyWebsite: z.string().describe("Main website URL"),
  companyDescription: z.string().describe("Brief description of what the company does"),
  industry: z.string().describe("Industry or sector"),
  isB2BSaaS: z.boolean().describe("Whether this is a B2B SaaS company"),

  // Nested schemas
  techStack: TechStackSchema,
  hiring: HiringDataSchema,
  engineeringCulture: EngineeringCultureSchema,
  companySize: CompanySizeSchema,
  thirdPartyTools: ThirdPartyToolsSchema,
  icpScore: ICPScoreSchema,

  // Metadata
  dataQuality: z.object({
    completenessScore: z.number().min(0).max(100).describe("Percentage of fields successfully populated"),
    confidenceLevel: z.enum(["high", "medium", "low"]).describe("Overall confidence in the data"),
    sourcesChecked: z.array(z.string()).describe("URLs that were visited"),
    missingData: z.array(z.string()).describe("Data points that could not be found"),
  }),

  // Extraction metadata
  extractedAt: z.string().describe("ISO timestamp of when data was extracted"),
  extractionDurationMs: z.number().describe("How long the extraction took in milliseconds"),
});

/**
 * Schema for careers page extraction
 */
export const CareersPageSchema = z.object({
  careersPageUrl: z.string().describe("URL of the careers page"),
  jobListings: z.array(z.object({
    title: z.string(),
    department: z.string().nullable(),
    location: z.string().nullable(),
    isEngineering: z.boolean(),
    seniority: z.string().nullable(),
  })).describe("List of job openings found"),
  totalJobCount: z.number().describe("Total number of jobs listed"),
  engineeringJobCount: z.number().describe("Number of engineering jobs"),
  jobBoardPlatform: z.string().nullable().describe("Detected job board platform"),
  hiringUrgencySignals: z.array(z.string()).describe("Signs of urgent hiring"),
});

/**
 * Schema for tech stack detection from page analysis
 */
export const TechDetectionSchema = z.object({
  detectedFromSource: z.array(z.object({
    technology: z.string(),
    evidence: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  })).describe("Technologies detected from page source"),
  detectedFromScripts: z.array(z.string()).describe("Technologies detected from loaded scripts"),
  detectedFromMeta: z.array(z.string()).describe("Technologies detected from meta tags"),
  overallAssessment: z.string().describe("Summary of tech stack"),
});

// Type exports for TypeScript usage
export type ProspectIntelligence = z.infer<typeof ProspectIntelligenceSchema>;
export type CareersPageData = z.infer<typeof CareersPageSchema>;
export type TechDetection = z.infer<typeof TechDetectionSchema>;
export type ThirdPartyTools = z.infer<typeof ThirdPartyToolsSchema>;
export type HiringData = z.infer<typeof HiringDataSchema>;
export type TechStack = z.infer<typeof TechStackSchema>;
export type EngineeringCulture = z.infer<typeof EngineeringCultureSchema>;
export type CompanySize = z.infer<typeof CompanySizeSchema>;
export type ICPScore = z.infer<typeof ICPScoreSchema>;

