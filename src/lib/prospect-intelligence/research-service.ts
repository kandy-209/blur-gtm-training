import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import {
  ProspectIntelligenceSchema,
  CareersPageSchema,
  TechDetectionSchema,
  type ProspectIntelligence,
  type CareersPageData,
  type TechDetection,
} from "./schemas";
import { 
  withRetry, 
  safeNavigateWithObservation, 
  handlePageBlockers, 
  waitForPageReady 
} from "./utils";
import { debugLog } from "./debug-utils";

// Configuration
const CONFIG = {
  timeoutMs: parseInt(process.env.DEFAULT_TIMEOUT_MS || "30000"),
  maxRetries: parseInt(process.env.MAX_RETRIES || "3"),
  rateLimitDelayMs: parseInt(process.env.RATE_LIMIT_DELAY_MS || "2000"),
};

// Common career page URL patterns to try
const CAREER_URL_PATTERNS = [
  "/careers",
  "/jobs",
  "/company/careers",
  "/about/careers",
  "/join-us",
  "/join",
  "/work-with-us",
  "/opportunities",
];

// Common engineering blog URL patterns
const BLOG_URL_PATTERNS = [
  "/blog/engineering",
  "/engineering",
  "/tech-blog",
  "/blog/tech",
  "/developers/blog",
  "/engineering-blog",
];

// Technology detection patterns
const TECH_PATTERNS = {
  react: {
    patterns: ["__NEXT_DATA__", "data-reactroot", "_reactRootContainer", "react-root"],
    name: "React",
  },
  nextjs: {
    patterns: ["__NEXT_DATA__", "/_next/"],
    name: "Next.js",
  },
  vue: {
    patterns: ["data-v-", "__VUE__", "vue-root"],
    name: "Vue.js",
  },
  angular: {
    patterns: ["ng-version", "_ngcontent", "ng-app"],
    name: "Angular",
  },
  svelte: {
    patterns: ["__svelte", "svelte-"],
    name: "Svelte",
  },
};

// Third-party tool detection patterns
const THIRD_PARTY_PATTERNS = {
  analytics: {
    segment: ["analytics.js", "segment.com", "segment.io"],
    amplitude: ["amplitude.com", "amplitude-js"],
    mixpanel: ["mixpanel.com", "mixpanel-js"],
    googleAnalytics: ["google-analytics.com", "gtag", "ga.js"],
    heap: ["heap-analytics", "heapanalytics.com"],
    posthog: ["posthog.com", "posthog-js"],
  },
  monitoring: {
    datadog: ["datadoghq.com", "dd-rum"],
    sentry: ["sentry.io", "sentry-browser"],
    logrocket: ["logrocket.com", "logrocket"],
    fullstory: ["fullstory.com", "fs.js"],
    bugsnag: ["bugsnag.com"],
  },
  chat: {
    intercom: ["intercom.io", "intercomcdn"],
    zendesk: ["zendesk.com", "zdassets"],
    drift: ["drift.com", "driftt"],
    crisp: ["crisp.chat"],
    hubspot: ["hubspot.com", "hs-scripts"],
  },
};

/**
 * Helper function to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Detect technologies from page source
 */
async function detectTechnologies(stagehand: Stagehand): Promise<TechDetection> {
  // Access page through type assertion (Stagehand v3+ API)
  const page = (stagehand as any).page;
  if (!page) {
    throw new Error('Page not available - ensure navigation completed successfully');
  }
  
  const pageSource = await page.content();
  const scripts = await page.evaluate(() => {
    return Array.from(document.scripts).map((s) => s.src).filter(Boolean);
  });

  const detected: TechDetection = {
    detectedFromSource: [],
    detectedFromScripts: [],
    detectedFromMeta: [],
    overallAssessment: "",
  };

  // Check for frameworks in page source
  for (const [key, config] of Object.entries(TECH_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pageSource.includes(pattern)) {
        detected.detectedFromSource.push({
          technology: config.name,
          evidence: `Found "${pattern}" in page source`,
          confidence: pattern === "__NEXT_DATA__" ? "high" : "medium",
        });
        break;
      }
    }
  }

  // Check scripts for third-party tools
  for (const script of scripts) {
    for (const [category, tools] of Object.entries(THIRD_PARTY_PATTERNS)) {
      for (const [tool, patterns] of Object.entries(tools)) {
        for (const pattern of patterns) {
          if (script.toLowerCase().includes(pattern.toLowerCase())) {
            detected.detectedFromScripts.push(`${tool} (${category})`);
          }
        }
      }
    }
  }

  // Remove duplicates
  detected.detectedFromScripts = [...new Set(detected.detectedFromScripts)];

  // Generate assessment
  const frameworks = detected.detectedFromSource.map((d) => d.technology);
  if (frameworks.length > 0) {
    detected.overallAssessment = `Uses ${frameworks.join(", ")}. ${
      detected.detectedFromScripts.length
    } third-party tools detected.`;
  } else {
    detected.overallAssessment = "Framework not clearly detected from page source.";
  }

  return detected;
}

/**
 * Find and analyze careers page
 */
async function analyzeCareersPage(
  stagehand: Stagehand,
  baseUrl: string,
  modelName?: string
): Promise<CareersPageData | null> {
  const baseUrlObj = new URL(baseUrl);
  const origin = baseUrlObj.origin;

  // Try different career page patterns
  for (const pattern of CAREER_URL_PATTERNS) {
    const careersUrl = `${origin}${pattern}`;
    const success = await safeNavigateWithObservation(stagehand, careersUrl, 1, modelName);
    
    if (success) {
      // Check if we landed on a valid careers page (not a 404)
      const page = (stagehand as any).page;
      if (!page) {
        continue; // Skip if page not available
      }
      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      if (
        pageTitle.toLowerCase().includes("404") ||
        pageContent.toLowerCase().includes("page not found")
      ) {
        continue;
      }

      // Extract careers data using Stagehand
      try {
        // ExtractOptions supports modelName and modelClientOptions - pass them explicitly
        const modelToUse = modelName || (stagehand as any)?.modelName || (stagehand as any)?.stagehand?.modelName;
        console.log(`🔍 Using model: ${modelToUse || 'default'} for careers extract()`);
        const extractOpts: any = {
          instruction: `Extract job listing information from this careers page. Look for:
            - Individual job titles and their departments
            - Total number of open positions
            - Which jobs are engineering/technical roles (Software Engineer, Developer, DevOps, SRE, etc.)
            - Any signs of urgent hiring (multiple similar roles, "urgently hiring", etc.)
            - The job board platform being used (look for Lever, Greenhouse, Ashby, Workable in URLs or page elements)`,
          schema: CareersPageSchema,
        };
        // Explicitly pass modelName and modelClientOptions (ExtractOptions supports them)
        if (modelToUse) {
          extractOpts.modelName = modelToUse;
        }
        const stagehandClientOpts = (stagehand as any)?.modelClientOptions || (stagehand as any)?.stagehand?.modelClientOptions;
        if (stagehandClientOpts) {
          extractOpts.modelClientOptions = stagehandClientOpts;
        }
        const extractResult = await stagehand.extract(extractOpts);
        
        // Validate and parse the result - handle both direct schema match and wrapped results
        let careersData: any;
        if (extractResult && typeof extractResult === 'object') {
          // Check if it's already in the expected format
          if ('jobListings' in extractResult || 'totalJobCount' in extractResult) {
            careersData = extractResult;
          } else if ('pageText' in extractResult) {
            // Fallback: if extract returns pageText, we need to parse it differently
            // For now, return a minimal structure
            careersData = {
              jobListings: [],
              totalJobCount: 0,
              engineeringJobCount: 0,
              jobBoardPlatform: null,
              hiringUrgencySignals: [],
            };
          } else {
            careersData = extractResult;
          }
        } else {
          careersData = {
            jobListings: [],
            totalJobCount: 0,
            engineeringJobCount: 0,
            jobBoardPlatform: null,
            hiringUrgencySignals: [],
          };
        }

        return {
          ...careersData,
          careersPageUrl: careersUrl,
        };
      } catch (extractError) {
        console.error("Failed to extract careers data:", extractError);
      }
    }
  }

  return null;
}

/**
 * Find engineering blog
 */
async function findEngineeringBlog(
  stagehand: Stagehand,
  baseUrl: string,
  modelName?: string
): Promise<{ found: boolean; url: string | null; topics: string[] }> {
  const baseUrlObj = new URL(baseUrl);
  const origin = baseUrlObj.origin;

  for (const pattern of BLOG_URL_PATTERNS) {
    const blogUrl = `${origin}${pattern}`;
    const success = await safeNavigateWithObservation(stagehand, blogUrl, 1, modelName);

    if (success) {
      const page = (stagehand as any).page;
      if (!page) {
        continue; // Skip if page not available
      }
      const pageTitle = await page.title();
      const pageContent = await page.content();

      if (
        pageTitle.toLowerCase().includes("404") ||
        pageContent.toLowerCase().includes("page not found")
      ) {
        continue;
      }

      // Check if this looks like a blog
      if (
        pageContent.toLowerCase().includes("blog") ||
        pageContent.toLowerCase().includes("engineering") ||
        pageContent.toLowerCase().includes("tech")
      ) {
        // Try to extract recent topics
        try {
          // ExtractOptions supports modelName and modelClientOptions - pass them explicitly
          const modelToUse = modelName || (stagehand as any)?.modelName || (stagehand as any)?.stagehand?.modelName;
          console.log(`🔍 Using model: ${modelToUse || 'default'} for blog extract()`);
          const extractOpts: any = {
            instruction:
              "Extract the titles of the 3-5 most recent blog posts visible on this page",
            schema: z.object({
              postTitles: z.array(z.string()),
            }),
          };
          // Explicitly pass modelName and modelClientOptions (ExtractOptions supports them)
          if (modelToUse) {
            extractOpts.modelName = modelToUse;
          }
          const stagehandClientOpts = (stagehand as any)?.modelClientOptions || (stagehand as any)?.stagehand?.modelClientOptions;
          if (stagehandClientOpts) {
            extractOpts.modelClientOptions = stagehandClientOpts;
          }
          const extractResult = await stagehand.extract(extractOpts);
          
          // Handle extract result - may return pageText or structured data
          let topics: string[] = [];
          if (extractResult && typeof extractResult === 'object') {
            if ('postTitles' in extractResult && Array.isArray(extractResult.postTitles)) {
              topics = extractResult.postTitles;
            } else if ('pageText' in extractResult) {
              // If we only got pageText, we can't extract topics - leave empty
              topics = [];
            }
          }

          return {
            found: true,
            url: blogUrl,
            topics,
          };
        } catch {
          return { found: true, url: blogUrl, topics: [] };
        }
      }
    }
  }

  return { found: false, url: null, topics: [] };
}

/**
 * Calculate ICP score based on collected data
 */
function calculateICPScore(data: Partial<ProspectIntelligence>): {
  score: number;
  priority: "high" | "medium" | "low";
  positives: string[];
  negatives: string[];
  talkingPoints: string[];
} {
  let score = 5; // Start at neutral
  const positives: string[] = [];
  const negatives: string[] = [];
  const talkingPoints: string[] = [];

  // B2B SaaS check (+2 or -2)
  if (data.isB2BSaaS) {
    score += 2;
    positives.push("Confirmed B2B SaaS company");
  } else {
    score -= 1;
    negatives.push("May not be B2B SaaS");
  }

  // Modern tech stack (+2)
  if (data.techStack?.isModernStack) {
    score += 2;
    positives.push(`Uses modern stack: ${data.techStack.primaryFramework}`);
    talkingPoints.push(
      `Their ${data.techStack.primaryFramework} stack integrates well with Browserbase`
    );
  }

  // Hiring engineers (+2)
  if (data.hiring?.hasOpenEngineeringRoles) {
    score += 1;
    positives.push(
      `Actively hiring engineers (${data.hiring.engineeringRoleCount || "multiple"} roles)`
    );
    talkingPoints.push("Growing engineering team = good time to improve dev productivity");
  }

  // Multiple engineering roles (+1)
  if (data.hiring?.engineeringRoleCount && data.hiring.engineeringRoleCount >= 5) {
    score += 1;
    positives.push("Significant engineering hiring activity");
  }

  // Has engineering blog (+1)
  if (data.engineeringCulture?.hasEngineeringBlog) {
    score += 1;
    positives.push("Invests in engineering brand (has tech blog)");
    talkingPoints.push("They value engineering culture - could be interested in dev tools");
  }

  // Company size in ICP range
  const sizeRange = data.companySize?.estimatedEmployeeRange;
  if (sizeRange) {
    const lowerMatch = sizeRange.match(/(\d+)/);
    if (lowerMatch) {
      const lower = parseInt(lowerMatch[1]);
      if (lower >= 50 && lower <= 500) {
        score += 1;
        positives.push(`Company size (${sizeRange}) in ICP range`);
      } else if (lower < 50) {
        negatives.push("May be too small for enterprise sales");
      }
    }
  }

  // Cap score at 10
  score = Math.min(10, Math.max(1, score));

  // Determine priority
  let priority: "high" | "medium" | "low" = "medium";
  if (score >= 8) {
    priority = "high";
  } else if (score <= 4) {
    priority = "low";
  }

  return { score, priority, positives, negatives, talkingPoints };
}

/**
 * Calculate data completeness score
 */
function calculateCompleteness(data: Partial<ProspectIntelligence>): number {
  const fields = [
    data.companyName,
    data.companyDescription,
    data.industry,
    data.techStack?.primaryFramework,
    data.hiring?.hasOpenEngineeringRoles !== undefined,
    data.engineeringCulture?.hasEngineeringBlog !== undefined,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

/**
 * Find missing data points
 */
function findMissingData(data: Partial<ProspectIntelligence>): string[] {
  const missing: string[] = [];
  if (!data.techStack?.primaryFramework) missing.push("Primary framework");
  if (!data.hiring?.engineeringRoleCount) missing.push("Engineering role count");
  if (!data.companySize?.estimatedEmployeeRange) missing.push("Employee count");
  return missing;
}

/**
 * Research Service - Main class for prospect intelligence research
 */
export class ResearchService {
  private stagehand: Stagehand | null = null;
  private configuredModel: string = "claude-3-5-sonnet-latest"; // Store configured model name
  private modelClientOptions: any = null; // Store model client options for reuse
  
  // Session resilience properties
  private sessionStartTime: number = 0;
  private readonly SESSION_REFRESH_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes
  private lastCheckpoint: any = null;
  private checkpointInterval: NodeJS.Timeout | null = null;
  private actionCount: number = 0;

  /**
   * Initialize Browserbase/Stagehand connection
   * Supports multiple LLM providers: Claude (priority), Gemini, OpenAI (fallback)
   */
  async initialize(): Promise<void> {
    if (!process.env.BROWSERBASE_API_KEY) {
      throw new Error("BROWSERBASE_API_KEY environment variable is required");
    }
    if (!process.env.BROWSERBASE_PROJECT_ID) {
      throw new Error("BROWSERBASE_PROJECT_ID environment variable is required");
    }

    // Determine which LLM to use with Browserbase mode
    // PRIORITY: Gemini (Browserbase partnership) > Claude (via Browserbase) > GPT-4o (via Browserbase)
    // Browserbase mode is the default and recommended approach (official @browserbasehq/stagehand)
    // Or use STAGEHAND_LLM_PROVIDER env var to force a specific provider
    const preferredProvider = process.env.STAGEHAND_LLM_PROVIDER?.toLowerCase();
    let model: string;
    let apiKey: string;
    let providerName: string;
    let useBrowserbase = true; // Default to Browserbase for all models
    
    // Priority order: Gemini (best Browserbase integration) > Claude > OpenAI
    const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;
    const hasClaude = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    console.log(`🔍 Checking providers: Gemini=${hasGemini}, Claude=${hasClaude}, OpenAI=${hasOpenAI}, Preferred=${preferredProvider || 'none'}`);
    
    // Priority 1: Gemini (Browserbase partnership - best integration)
    if (preferredProvider === 'gemini' || (!preferredProvider && hasGemini)) {
      console.log(`✅ Gemini detected - using Gemini with Browserbase`);
      if (!process.env.GOOGLE_GEMINI_API_KEY) {
        throw new Error("GOOGLE_GEMINI_API_KEY is required when using Gemini. Set STAGEHAND_LLM_PROVIDER=gemini or provide GOOGLE_GEMINI_API_KEY.");
      }
      
      // For Browserbase + Gemini: Use Gemini model name directly (Stagehand v3+ supports it)
      // IMPORTANT: Must be one of the supported model IDs exposed by the aggregation layer.
      // Supported Gemini models currently include:
      // - gemini-1.5-flash
      // - gemini-1.5-pro
      // - gemini-1.5-flash-8b
      // - gemini-2.0-flash-lite
      // - gemini-2.0-flash
      // - gemini-2.5-flash-preview-04-17
      // - gemini-2.5-pro-preview-03-25
      //
      // Default to gemini-2.0-flash (stable, supported) if GEMINI_MODEL is not set.
      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      model = geminiModel; // Use actual Gemini model name
      apiKey = process.env.GOOGLE_GEMINI_API_KEY.trim();
      providerName = "Gemini (Google) via Browserbase";
      this.configuredModel = geminiModel;
      useBrowserbase = true; // Gemini works best with Browserbase
      console.log("🤖 Using Gemini via Browserbase partnership");
      console.log(`   Gemini model: ${geminiModel}`);
      console.log(`   Browserbase will route to Gemini based on GOOGLE_GEMINI_API_KEY`);
      console.log(`🔑 Gemini API Key format: ${apiKey.substring(0, 15)}...`);
    } else if (preferredProvider === 'openai' && process.env.OPENAI_API_KEY) {
      // Explicitly requested OpenAI
      model = "gpt-4o";
      apiKey = process.env.OPENAI_API_KEY;
      providerName = "GPT-4o (OpenAI)";
      this.configuredModel = model;
      useBrowserbase = true;
      console.log("🤖 Using GPT-4o for Stagehand AI extraction");
    } else if (preferredProvider === 'claude' || (!preferredProvider && hasClaude && !hasGemini)) {
      // Priority 2: Claude (use LOCAL mode - Browserbase has proxy errors with Claude)
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY is required when using Claude. Set STAGEHAND_LLM_PROVIDER=claude or provide ANTHROPIC_API_KEY.");
      }
      
      // Validate API key format
      const anthropicKey = process.env.ANTHROPIC_API_KEY.trim();
      if (!anthropicKey.startsWith('sk-ant-')) {
        throw new Error("ANTHROPIC_API_KEY appears to be invalid. Anthropic API keys should start with 'sk-ant-'");
      }
      
      // Use Claude with Browserbase (Stagehand v3+ should support it)
      const requestedModel = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
      const supportedModels = [
        "claude-3-5-sonnet-latest",
        "claude-3-5-sonnet-20240620",
        "claude-3-5-sonnet-20241022",
        "claude-3-7-sonnet-20250219",
        "claude-3-7-sonnet-latest",
        "claude-3-haiku-20240307", // Fallback to Haiku if Sonnet not available
      ];
      if (supportedModels.includes(requestedModel)) {
        model = requestedModel;
        this.configuredModel = requestedModel;
      } else {
        model = "claude-3-haiku-20240307"; // Default to Haiku (free tier)
        this.configuredModel = model;
        console.log(`⚠️ Requested model "${requestedModel}" not supported, using "${model}" instead`);
      }
      apiKey = anthropicKey;
      providerName = "Claude (Anthropic) via Browserbase";
      useBrowserbase = true; // Try Browserbase mode with Claude
      console.log(`🤖 Using Claude ${model} with Browserbase`);
      console.log(`   Browserbase will forward to Anthropic API`);
      console.log(`🔑 API Key format validated (starts with: ${apiKey.substring(0, 10)}...)`);
    } else if (process.env.OPENAI_API_KEY) {
      // Use GPT-4o as fallback (works with Browserbase)
      model = "gpt-4o";
      apiKey = process.env.OPENAI_API_KEY;
      providerName = "GPT-4o (OpenAI) - Fallback";
      this.configuredModel = model;
      useBrowserbase = true;
      console.log("🤖 Using GPT-4o for Stagehand AI extraction (fallback)");
    } else {
      // No valid LLM provider found - prioritize Claude and Gemini
      throw new Error("No LLM API key found. Please set ANTHROPIC_API_KEY (recommended) or GOOGLE_GEMINI_API_KEY. OpenAI is only used if explicitly requested via STAGEHAND_LLM_PROVIDER=openai.");
    }

    // Use BROWSERBASE mode for all models (official @browserbasehq/stagehand recommendation)
    // Browserbase provides serverless, scalable headless browsers for automation
    // Gemini, Claude, and OpenAI all work with Browserbase
    const finalEnv = useBrowserbase ? "BROWSERBASE" : "LOCAL";
    
    const stagehandConfig: any = {
      env: finalEnv,
      modelName: model,
    };
    
    if (useBrowserbase) {
      // BROWSERBASE mode - works with Gemini, Claude, and OpenAI
      stagehandConfig.apiKey = process.env.BROWSERBASE_API_KEY;
      stagehandConfig.projectId = process.env.BROWSERBASE_PROJECT_ID;
      console.log("🌐 Using Browserbase for browser automation");
      console.log(`   Stagehand modelName: ${model}`);
      
      // For Gemini: Stagehand v3 requires modelApiKey in config (CRITICAL - must be set before Stagehand constructor)
      if (this.configuredModel?.startsWith('gemini')) {
        console.log(`🔍 Using Gemini model: ${this.configuredModel} with Browserbase`);
        console.log(`   Browserbase will route to Gemini based on GOOGLE_GEMINI_API_KEY env var`);
        // Stagehand v3 requires modelApiKey for Gemini models - set it at top level
        // CRITICAL: This must be set BEFORE creating Stagehand instance
        stagehandConfig.modelApiKey = apiKey.trim();
        console.log(`🔑 Set modelApiKey for Gemini: ${apiKey.substring(0, 15)}...`);
        console.log(`🔑 modelApiKey length: ${apiKey.trim().length} characters`);
        console.log(`🔑 modelApiKey starts with: ${apiKey.trim().substring(0, 10)}`);
      }
      
      // For Claude: Browserbase should support Claude models directly
      if (model.startsWith('claude')) {
        console.log(`🔍 Using Claude model: ${model} with Browserbase`);
        console.log(`   Browserbase will forward to Anthropic API`);
      }
    } else {
      // LOCAL mode - fallback option (uses Playwright directly)
      console.log("💻 Using LOCAL browser mode (Playwright/Chromium)");
      console.log("   This calls the LLM API directly, bypassing Browserbase");
      stagehandConfig.localBrowserLaunchOptions = {
        headless: true, // Run headless for server environments
      };
      
      // For LOCAL mode, also set modelApiKey for Gemini
      if (this.configuredModel?.startsWith('gemini')) {
        stagehandConfig.modelApiKey = apiKey.trim();
      }
    }
    
    
    // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
    
    // Configure model client options based on provider
    // For Browserbase mode: Pass modelClientOptions so Stagehand can create llmClient
    // Browserbase will use the API keys from environment variables for routing
    const clientOptions: any = {
      apiKey: apiKey.trim(),
    };
    
    // For Gemini: Also include modelApiKey in clientOptions (required by Stagehand)
    if (this.configuredModel?.startsWith('gemini')) {
      clientOptions.modelApiKey = apiKey.trim();
      // Ensure modelApiKey is also at the top level for Stagehand v3
      if (!stagehandConfig.modelApiKey) {
        stagehandConfig.modelApiKey = apiKey.trim();
      }
    }
    
    stagehandConfig.modelClientOptions = clientOptions;
    this.modelClientOptions = clientOptions; // Store for reuse in extract()/act() calls
    
    if (this.configuredModel?.startsWith('gemini')) {
      console.log(`🔑 Stored Gemini API key: ${apiKey.substring(0, 15)}...`);
      if (useBrowserbase) {
        console.log(`🔑 Browserbase will route to Gemini using GOOGLE_GEMINI_API_KEY`);
      }
    } else if (model.startsWith('claude') || this.configuredModel?.startsWith('claude')) {
      // For Anthropic Claude - pass API key (works for both Browserbase and LOCAL mode)
      console.log(`🔑 Stored Claude API key: ${apiKey.substring(0, 15)}...`);
      if (useBrowserbase) {
        console.log(`🔑 Browserbase will forward Claude API key to Anthropic API`);
      } else {
        console.log(`🔑 LOCAL mode: Stagehand will use this API key directly`);
      }
    } else if (model.startsWith('gpt')) {
      // For OpenAI, pass API key in modelClientOptions
      console.log(`🔑 Stored OpenAI API key: ${apiKey.substring(0, 15)}...`);
      if (useBrowserbase) {
        console.log(`🔑 Browserbase will forward OpenAI API key to OpenAI API`);
      } else {
        console.log(`🔑 LOCAL mode: Stagehand will use this API key directly`);
      }
    }

    // Log configuration for debugging
    console.log(`🔍 Stagehand config - modelName: ${stagehandConfig.modelName}, env: ${stagehandConfig.env}`);
    console.log(`🔍 modelApiKey set: ${!!stagehandConfig.modelApiKey}`);
    console.log(`🔍 modelClientOptions: ${JSON.stringify(stagehandConfig.modelClientOptions ? { apiKey: '***', modelApiKey: stagehandConfig.modelClientOptions.modelApiKey ? '***' : undefined } : {})}`);
    
    // Set environment variables for Browserbase mode
    // Browserbase reads API keys from environment variables when using BROWSERBASE mode
    if (useBrowserbase) {
      if (this.configuredModel?.startsWith('gemini')) {
        // For Gemini: Set GOOGLE_GEMINI_API_KEY for Browserbase (required for routing)
        process.env.GOOGLE_GEMINI_API_KEY = apiKey.trim();
        console.log(`🔑 Set GOOGLE_GEMINI_API_KEY for Browserbase routing`);
      } else if (model.startsWith('claude')) {
        // For Claude: Set ANTHROPIC_API_KEY for Browserbase
        process.env.ANTHROPIC_API_KEY = apiKey.trim();
        console.log(`🔑 Set ANTHROPIC_API_KEY for Browserbase`);
      } else if (model.startsWith('gpt')) {
        // For OpenAI: Set OPENAI_API_KEY for Browserbase
        process.env.OPENAI_API_KEY = apiKey.trim();
        console.log(`🔑 Set OPENAI_API_KEY for Browserbase`);
      }
    }
    
    // Create Stagehand instance
    // For Browserbase mode with Gemini: Stagehand will create llmClient from modelClientOptions
    // For LOCAL mode: Stagehand needs modelClientOptions to create llmClient
    
    // CRITICAL: For Gemini, ensure modelApiKey is set at top level (required by Stagehand)
    // Stagehand v3 requires modelApiKey for Gemini models - it must be present before constructor
    if (this.configuredModel?.startsWith('gemini')) {
      if (!stagehandConfig.modelApiKey) {
        stagehandConfig.modelApiKey = apiKey.trim();
        console.log(`🔑 CRITICAL: Set modelApiKey at top level for Gemini (required by Stagehand)`);
      }
      // Double-check it's set
      if (!stagehandConfig.modelApiKey || stagehandConfig.modelApiKey.trim() === '') {
        throw new Error('modelApiKey is required for Gemini models but was not set. Please check GOOGLE_GEMINI_API_KEY is configured.');
      }
      console.log(`✅ Verified modelApiKey is set for Gemini: ${stagehandConfig.modelApiKey.substring(0, 15)}...`);
    }
    
    this.stagehand = new Stagehand(stagehandConfig);
    
    console.log(`✅ Stagehand configured with ${providerName} (model: ${model})`);
    console.log(`📝 Stored configuredModel: ${this.configuredModel}`);
    console.log(`📝 modelClientOptions set: ${!!stagehandConfig.modelClientOptions}`);
    
    // Check if llmClient was created by constructor
    const llmClientBeforeInit = (this.stagehand as any)?.llmClient;
    console.log(`📝 llmClient after constructor: ${!!llmClientBeforeInit ? 'EXISTS' : 'MISSING'}`);
    
    // If llmClient is missing, create it using llmProvider
    if (!llmClientBeforeInit && stagehandConfig.modelClientOptions) {
      try {
        const llmProvider = (this.stagehand as any)?.llmProvider;
        if (llmProvider) {
          console.log(`🔧 Creating llmClient using llmProvider...`);
          const createdClient = llmProvider.getClient(model as any, stagehandConfig.modelClientOptions);
          if (createdClient) {
            (this.stagehand as any).llmClient = createdClient;
            console.log(`✅ Created llmClient before init()`);
          } else {
            console.warn(`⚠️ llmProvider.getClient() returned undefined`);
          }
        }
      } catch (createErr: any) {
        console.error(`❌ Failed to create llmClient: ${createErr.message}`);
        // Don't throw - let init() try to handle it
      }
    }
    
    try {
      console.log(`🚀 Calling stagehand.init() with model: ${model}`);
      console.log(`🚀 Environment: ${finalEnv}`);
      console.log(`🚀 llmClient before init: ${!!(this.stagehand as any)?.llmClient ? 'EXISTS' : 'MISSING'}`);
      await this.stagehand.init();
      
      // After init(), check if llmClient was created
      const llmClientAfterInit = (this.stagehand as any)?.llmClient;
      console.log(`🚀 llmClient exists after init(): ${!!llmClientAfterInit}`);
      if (llmClientAfterInit) {
        console.log(`🚀 llmClient type: ${llmClientAfterInit.constructor?.name || 'unknown'}`);
      }
      
      const actualModel = (this.stagehand as any)?.modelName || (this.stagehand as any)?._modelName || 'unknown';
      const llmClientModel = (this.stagehand as any)?.llmClient?.modelName || (this.stagehand as any)?.llmClient?._modelName || 'unknown';
      const stagehandInternal = (this.stagehand as any)?.stagehand || {};
      const browserbaseConfig = (this.stagehand as any)?.browserbaseConfig || {};
      // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
      
         console.log(`✅ Stagehand init() completed successfully`);
         console.log(`📝 Configured model: ${this.configuredModel}`);
         console.log(`📝 Actual Stagehand modelName: ${actualModel}`);
         console.log(`📝 LLM Client modelName: ${llmClientModel}`);
         console.log(`📝 LLM Client exists: ${!!(this.stagehand as any)?.llmClient}`);
         // Don't access page property here - it might not be available until first navigation
         // Page will be created on first navigation, so we don't need to check it here
         console.log(`📝 Page will be created on first navigation`);
         console.log(`📝 ANTHROPIC_API_KEY in env: ${!!process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO'}`);
         
         // Initialize session resilience
         this.sessionStartTime = Date.now();
         this.startCheckpointing();
         console.log(`🛡️ Session resilience enabled (refresh every ${this.SESSION_REFRESH_INTERVAL_MS / 1000 / 60} minutes)`);
      
      // If we're using a different model than what Stagehand initialized with, update it
      if (this.configuredModel && this.configuredModel !== model && (this.stagehand as any)?.llmClient) {
        const llmClient = (this.stagehand as any).llmClient;
        if (llmClient && llmClient.modelName) {
          console.log(`🔄 Overriding llmClient.modelName from ${llmClient.modelName} to ${this.configuredModel}`);
          llmClient.modelName = this.configuredModel as any;
          console.log(`✅ llmClient now uses model: ${llmClient.modelName}`);
        }
      }
      
      // CRITICAL: llmClient MUST exist for extract handler to be created
      // The extract handler is only created if llmClient exists when page is constructed
      const hasLLMClient = !!(this.stagehand as any)?.llmClient;
      
      if (!hasLLMClient) {
        // For Gemini with Browserbase: Try to create llmClient using Gemini model
        if (this.configuredModel?.startsWith('gemini') && finalEnv === 'BROWSERBASE') {
          try {
            const llmProvider = (this.stagehand as any)?.llmProvider;
            if (llmProvider && this.modelClientOptions) {
              const geminiClient = llmProvider.getClient(this.configuredModel as any, this.modelClientOptions);
              if (geminiClient) {
                (this.stagehand as any).llmClient = geminiClient;
                console.log(`✅ Created llmClient after init() for Gemini`);
              }
            }
          } catch (err: any) {
            console.error(`❌ Failed to create llmClient: ${err.message}`);
          }
        }
        
        // Check again after potential creation
        const hasLLMClientNow = !!(this.stagehand as any)?.llmClient;
        if (!hasLLMClientNow && !(this.configuredModel?.startsWith('gemini') && finalEnv === 'BROWSERBASE')) {
          console.error(`❌ CRITICAL: llmClient not initialized after init()!`);
          console.error(`   Extract handler will NOT be created without llmClient`);
          console.error(`   Model: ${model}, Configured: ${this.configuredModel}`);
          console.error(`   Environment: ${finalEnv}`);
          throw new Error(`llmClient not initialized. Extract handler requires llmClient. Model: ${model}`);
        }
      }
      
      const finalHasLLMClient = !!(this.stagehand as any)?.llmClient;
      if (finalHasLLMClient) {
        console.log(`✅ llmClient verified - extract handler will be created`);
      } else if (this.configuredModel?.startsWith('gemini') && finalEnv === 'BROWSERBASE') {
        console.log(`ℹ️ Gemini with Browserbase: llmClient may not be required (Browserbase handles routing)`);
      }
      
      // Page will be created on first navigation
      // Don't access page property here - it will be created on first navigation
      console.log(`ℹ️ Page will be created on first navigation`);
      
      if (actualModel !== model) {
        console.log(`⚠️ MODEL MISMATCH: Configured ${model} but Stagehand is using ${actualModel}`);
      }
      
      // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
      
    } catch (initError: any) {
      const errorMessage = initError.message || String(initError);
      const errorString = String(initError);
      console.error(`❌ Stagehand initialization failed:`, errorMessage);
      console.error(`❌ Full error:`, errorString);
      console.error(`❌ Model attempted: ${model}`);
      console.error(`❌ ANTHROPIC_API_KEY set: ${!!process.env.ANTHROPIC_API_KEY}`);
      
      // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
      
      
      // If initialization fails, try different model names and configurations
      if (this.configuredModel?.startsWith('gemini')) {
        // For Gemini: Check if it's a proxy error or initialization issue
        if (errorMessage.includes('proxy') || errorMessage.includes('Cannot create proxy')) {
          // This is likely from llmClient initialization - try to continue
          console.log(`⚠️ Proxy error detected - attempting to continue with Browserbase routing.`);
          if (this.stagehand) {
            console.log(`✅ Stagehand initialized (Browserbase will handle LLM routing)`);
            return; // Success - continue
          }
        }
        // If it's a different error, throw it
        throw new Error(
          `Failed to initialize Stagehand with Gemini model "${this.configuredModel}". ` +
          `Stagehand model: "${model}". ` +
          `Please check: 1) GOOGLE_GEMINI_API_KEY is correctly set in .env.local, 2) Restart dev server after adding keys, 3) Check Browserbase session limits. ` +
          `Error: ${errorMessage}`
        );
      } else if (model.startsWith('claude')) {
        // If Haiku failed, something is wrong with the API key or configuration
        // But if Haiku succeeded and we want Sonnet, we can try upgrading
        // For now, if Haiku fails, try Sonnet variants as fallback
        const modelVariants = [
          "claude-3-haiku-20240307",    // Haiku (always available)
          "claude-3-5-sonnet-20241022", // Sonnet (requires paid plan)
        ];
        
        for (const variant of modelVariants) {
          if (variant === model) continue; // Skip the one we already tried
          
          console.log(`⚠️ Trying alternative model: ${variant}...`);
          stagehandConfig.model = variant;
          this.configuredModel = variant; // Update configured model
          // Reset modelClientOptions (keep it simple)
          stagehandConfig.modelClientOptions = {
            apiKey: apiKey.trim(),
          };
          // Remove anthropicApiKey if it exists (not needed)
          delete stagehandConfig.anthropicApiKey;
          
          this.stagehand = new Stagehand(stagehandConfig);
          try {
            await this.stagehand.init();
            console.log(`✅ Stagehand initialized with ${variant}`);
            return; // Success with fallback
          } catch (variantError: any) {
            console.log(`❌ ${variant} also failed: ${variantError.message}`);
            continue; // Try next variant
          }
        }
        
        // If all variants failed, throw error with helpful message
        throw new Error(
          `Failed to initialize Stagehand with any Claude model. ` +
          `Your API key is valid (tested directly), but Stagehand initialization failed. ` +
          `Error: ${errorMessage}. ` +
          `This may be a Stagehand version compatibility issue. ` +
          `Please check: 1) API key is correctly set in .env.local, 2) Restart dev server after adding keys, 3) Check Browserbase session limits.`
        );
      }
      
      // Provide more helpful error message based on error type
      if (errorMessage.includes('401') || errorMessage.includes('Incorrect API key') || errorString.includes('401')) {
        const provider = model.startsWith('claude') ? 'ANTHROPIC' : model.startsWith('gpt') ? 'OPENAI' : 'LLM';
        const helpUrl = model.startsWith('claude') 
          ? 'https://console.anthropic.com/settings/keys' 
          : 'https://platform.openai.com/account/api-keys';
        throw new Error(
          `Failed to initialize Stagehand with ${providerName}. ` +
          `The ${provider} API key may be invalid, expired, or incorrectly formatted. ` +
          `Please verify your API key at ${helpUrl}. ` +
          `Error details: ${errorMessage}`
        );
      }
      
      if (errorMessage.includes('404') || errorMessage.includes('not_found') || errorMessage.includes('model') || errorString.includes('404')) {
        throw new Error(
          `Model "${model}" not found or not available. ` +
          `Please check that your API key has access to this model. ` +
          `For Claude, ensure you're using a valid model name. ` +
          `Error details: ${errorMessage}`
        );
      }
      
      // Generic error with full details
      throw new Error(
        `Failed to initialize Stagehand: ${errorMessage}. ` +
        `Please check your API keys and configuration. ` +
        `Full error: ${errorString}`
      );
    }
  }

  /**
   * Main research function - performs comprehensive prospect intelligence gathering
   */
  async researchProspect(
    websiteUrl: string,
    companyName?: string
  ): Promise<ProspectIntelligence> {
    if (!this.stagehand) {
      await this.initialize();
    }

    const startTime = Date.now();
    const sourcesChecked: string[] = [websiteUrl];

    try {
      // Step 1: CRITICAL - Ensure llmClient is initialized BEFORE navigation
      // The extract handler is ONLY created if llmClient exists when StagehandPage is constructed
      // This happens during navigation, so llmClient MUST exist before we navigate
      let llmClient = (this.stagehand as any)?.llmClient;
      
      if (!llmClient) {
        console.log(`🔧 CRITICAL: llmClient missing - initializing before navigation (required for extract handler)...`);
        const apiKey = (this.modelClientOptions as any)?.apiKey;
        
        if (!apiKey) {
          throw new Error(`Cannot initialize llmClient: No API key available. modelClientOptions.apiKey is missing.`);
        }
        
        try {
          if (this.configuredModel?.startsWith('claude') || this.configuredModel === 'claude-3-haiku-20240307') {
            const { Anthropic } = require('@anthropic-ai/sdk');
            llmClient = new Anthropic({ apiKey });
            (this.stagehand as any).llmClient = llmClient;
            console.log(`✅ llmClient initialized (Anthropic) - extract handler will be created`);
          } else if (this.configuredModel?.startsWith('gemini')) {
            // For Gemini with Browserbase, we still need llmClient for extract handler
            // Create a minimal Anthropic client (Browserbase will route actual calls)
            // OR use OpenAI client as placeholder
            const { OpenAI } = require('openai');
            // Use a dummy OpenAI client - Browserbase will route to Gemini
            llmClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });
            (this.stagehand as any).llmClient = llmClient;
            console.log(`✅ llmClient initialized (placeholder for Gemini) - Browserbase will route to Gemini`);
          } else if (this.configuredModel?.startsWith('gpt')) {
            const { OpenAI } = require('openai');
            llmClient = new OpenAI({ apiKey });
            (this.stagehand as any).llmClient = llmClient;
            console.log(`✅ llmClient initialized (OpenAI) - extract handler will be created`);
          } else {
            throw new Error(`Unknown model type: ${this.configuredModel}`);
          }
        } catch (err: any) {
          console.error(`❌ Failed to initialize llmClient: ${err.message}`);
          throw new Error(`Failed to initialize llmClient before navigation. This is required for extract handler. Error: ${err.message}`);
        }
      } else {
        console.log(`✅ llmClient already exists - extract handler will be created`);
      }
      
      // Step 2: Validate session and refresh if needed before navigation
      await this.refreshSessionIfNeeded();
      const isValid = await this.validateSession();
      if (!isValid) {
        console.log(`🔄 Session invalid, reinitializing...`);
        await this.initialize();
      }
      
      // Step 3: Navigate to main website with observation pattern
      console.log(`🕵️ Launching research for: ${websiteUrl}`);
      this.actionCount++;
      await this.saveCheckpoint('before_navigation');
      
      // Navigate with retry logic
      const navSuccess = await this.retryOperation(
        async () => {
          await this.refreshSessionIfNeeded();
          return await safeNavigateWithObservation(this.stagehand!, websiteUrl, CONFIG.maxRetries, this.configuredModel);
        },
        'navigate(main_website)',
        3,
        2000
      );
      if (!navSuccess) {
        throw new Error(`Failed to navigate to ${websiteUrl}`);
      }
      
      // Verify page is available after navigation
      try {
        const page = (this.stagehand as any)?.page;
        if (!page) {
          console.error(`❌ Page not available after navigation`);
          console.error(`   Stagehand env: ${(this.stagehand as any)?.env || 'unknown'}`);
          throw new Error(`Page not available after navigation. This may be a Stagehand initialization issue.`);
        }
        console.log(`✅ Page available after navigation`);
      } catch (pageError: any) {
        // Page access might fail - this is okay, it will be created
        console.log(`ℹ️ Page check skipped (will be available for extract)`);
      }

      // Step 2: Extract basic company information
      
      // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
      
      // Pass modelName to ensure the correct model is used
      console.log(`🔍 Using model: ${this.configuredModel} for extract()`);
      console.log(`🔍 Stagehand instance modelName: ${(this.stagehand as any)?.modelName || 'not found'}`);
      console.log(`🔍 LLM Client modelName: ${(this.stagehand as any)?.llmClient?.modelName || 'not found'}`);
      console.log(`🔍 About to call extract() with modelName: ${this.configuredModel}`);
      const extractOptions: any = {
        instruction: `Extract basic company information from this website:
            - Company name
            - What the company does (brief description)
            - Industry/sector
            - Whether this appears to be a B2B SaaS company
            - Any company size indicators (employee count, team size mentions)
            - Any funding or growth indicators`,
        schema: z.object({
          companyName: z.string(),
          description: z.string(),
          industry: z.string(),
          isB2BSaaS: z.boolean(),
          sizeIndicators: z.array(z.string()),
          growthIndicators: z.array(z.string()),
        }),
      };
      
      // ExtractOptions supports modelName and modelClientOptions (per Stagehand types)
      // Pass modelName for all models (Stagehand v3+ supports Gemini and Claude model names directly)
      if (this.configuredModel) {
        extractOptions.modelName = this.configuredModel;
        console.log(`🔍 Passing modelName: ${this.configuredModel} to extract()`);
      }
      
      // Pass modelClientOptions to ensure API key is available for the model
      if (this.modelClientOptions) {
        extractOptions.modelClientOptions = this.modelClientOptions;
        console.log(`🔍 Added modelClientOptions to extract call with API key: ${(this.modelClientOptions as any)?.apiKey?.substring(0, 15) || 'missing'}...`);
      } else {
        console.warn(`⚠️ modelClientOptions not available! Falling back to environment variable.`);
      }
      
      console.log(`🔍 Extract options keys: ${Object.keys(extractOptions).join(', ')}`);
      
      // For Browserbase mode, ensure we can call extract() directly
      // Stagehand will handle extract handler initialization internally
      let companyInfo: {
        companyName: string;
        description: string;
        industry: string;
        isB2BSaaS: boolean;
        sizeIndicators: string[];
        growthIndicators: string[];
      };
      try {
        // Call extract() with retry logic for resilience
        console.log(`🔍 Calling stagehand.extract()...`);
        this.actionCount++;
        
        // Retry extract operation with session validation
        const extractResult = await this.retryOperation(
          async () => {
            // Validate session before extract
            await this.refreshSessionIfNeeded();
            const isValid = await this.validateSession();
            if (!isValid) {
              throw new Error('Session invalid before extract');
            }
            
            return await this.stagehand!.extract(extractOptions);
          },
          'extract(companyInfo)',
          3,
          2000
        );
        
        // Handle extract result - validate structure
        if (extractResult && typeof extractResult === 'object') {
          if ('companyName' in extractResult && 'description' in extractResult) {
            companyInfo = {
              companyName: (extractResult as any).companyName || companyName || 'Unknown Company',
              description: (extractResult as any).description || 'Unable to extract description',
              industry: (extractResult as any).industry || 'Unknown',
              isB2BSaaS: (extractResult as any).isB2BSaaS || false,
              sizeIndicators: (extractResult as any).sizeIndicators || [],
              growthIndicators: (extractResult as any).growthIndicators || [],
            };
          } else if ('pageText' in extractResult) {
            // Fallback: if we only got pageText, create minimal structure
            companyInfo = {
              companyName: companyName || 'Unknown Company',
              description: 'Unable to extract description',
              industry: 'Unknown',
              isB2BSaaS: false,
              sizeIndicators: [],
              growthIndicators: [],
            };
          } else {
            // Try to extract what we can
            companyInfo = {
              companyName: (extractResult as any).companyName || companyName || 'Unknown Company',
              description: (extractResult as any).description || 'Unable to extract description',
              industry: (extractResult as any).industry || 'Unknown',
              isB2BSaaS: (extractResult as any).isB2BSaaS || false,
              sizeIndicators: (extractResult as any).sizeIndicators || [],
              growthIndicators: (extractResult as any).growthIndicators || [],
            };
          }
        } else {
          // Fallback if extract failed
          companyInfo = {
            companyName: companyName || 'Unknown Company',
            description: 'Unable to extract description',
            industry: 'Unknown',
            isB2BSaaS: false,
            sizeIndicators: [],
            growthIndicators: [],
          };
        }
        
        await this.saveCheckpoint('after_company_extract');
        
        // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
        
      } catch (extractError: any) {
        
        const errorMsg = extractError?.message || String(extractError);
        const errorStr = String(extractError);
        const is404 = errorMsg.includes('404') || errorStr.includes('404') || errorMsg.includes('not_found');
        // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
        
        
        // If 404 error with Claude model, try falling back to Haiku if we were using Sonnet
        if (is404 && this.configuredModel?.startsWith('claude')) {
          const isLocalMode = (this.stagehand as any)?.env === 'LOCAL';
          
          // If we're using Sonnet and it fails, try Haiku as fallback
          if (isLocalMode && this.configuredModel.includes('sonnet')) {
            console.warn(`⚠️ Sonnet model "${this.configuredModel}" not available. Falling back to Haiku...`);
            try {
              // Update model to Haiku
              const haikuModel = "claude-3-haiku-20240307";
              this.configuredModel = haikuModel;
              
              // Update extract options with Haiku model
              extractOptions.modelName = haikuModel;
              
              console.log(`🔄 Retrying with Haiku model: ${haikuModel}`);
              this.actionCount++;
              const haikuResult = await this.retryOperation(
                async () => {
                  await this.refreshSessionIfNeeded();
                  return await this.stagehand!.extract(extractOptions);
                },
                'extract(companyInfo_haiku_fallback)',
                2,
                2000
              );
              
              // Validate and parse the Haiku result
              if (haikuResult && typeof haikuResult === 'object') {
                if ('companyName' in haikuResult && 'description' in haikuResult) {
                  companyInfo = {
                    companyName: (haikuResult as any).companyName || companyName || 'Unknown Company',
                    description: (haikuResult as any).description || 'Unable to extract description',
                    industry: (haikuResult as any).industry || 'Unknown',
                    isB2BSaaS: (haikuResult as any).isB2BSaaS || false,
                    sizeIndicators: (haikuResult as any).sizeIndicators || [],
                    growthIndicators: (haikuResult as any).growthIndicators || [],
                  };
                } else {
                  // Fallback structure
                  companyInfo = {
                    companyName: companyName || 'Unknown Company',
                    description: 'Unable to extract description',
                    industry: 'Unknown',
                    isB2BSaaS: false,
                    sizeIndicators: [],
                    growthIndicators: [],
                  };
                }
              } else {
                companyInfo = {
                  companyName: companyName || 'Unknown Company',
                  description: 'Unable to extract description',
                  industry: 'Unknown',
                  isB2BSaaS: false,
                  sizeIndicators: [],
                  growthIndicators: [],
                };
              }
              console.log(`✅ Successfully extracted with Haiku model`);
            } catch (haikuError: any) {
              // If Haiku also fails, throw the original error with helpful message
              const helpfulError = new Error(
                `Anthropic API returned 404 for both Sonnet and Haiku models. ` +
                `This is unusual - Haiku should always be available. ` +
                `Please verify: ` +
                `1. Your API key is correct and active at https://console.anthropic.com/ ` +
                `2. Your API key format is correct (should start with 'sk-ant-') ` +
                `3. Your account has not been suspended ` +
                `Original error: ${errorMsg}`
              );
              (helpfulError as any).originalError = extractError;
              (helpfulError as any).isAnthropicApiIssue = true;
              (helpfulError as any).modelName = this.configuredModel;
              throw helpfulError;
            }
          } else if (isLocalMode) {
            // LOCAL mode - Anthropic API directly returned 404 (not a Sonnet fallback case)
            const helpfulError = new Error(
              `Anthropic API returned 404 for Claude model "${this.configuredModel}" in LOCAL mode. ` +
              `This suggests the model name may be incorrect or not available. ` +
              `Tried model: ${this.configuredModel}. ` +
              `Please check Anthropic's model documentation for available models. ` +
              `Original error: ${errorMsg}`
            );
            (helpfulError as any).originalError = extractError;
            (helpfulError as any).isAnthropicApiIssue = true;
            (helpfulError as any).modelName = this.configuredModel;
            throw helpfulError;
          } else {
            // Browserbase mode - this is the known Browserbase bug
            const helpfulError = new Error(
              `Browserbase API returned 404 for Claude model "${this.configuredModel}". ` +
              `This is a known Browserbase integration issue. ` +
              `The code should automatically use LOCAL mode for Claude models to work around this. ` +
              `If you see this error, LOCAL mode workaround may not be active. ` +
              `Original error: ${errorMsg}`
            );
            (helpfulError as any).originalError = extractError;
            (helpfulError as any).isBrowserbaseCompatibilityIssue = true;
            (helpfulError as any).modelName = this.configuredModel;
            (helpfulError as any).browserbaseIssue = true;
            throw helpfulError;
          }
        }
        
        throw extractError;
      }

      // Step 3: Detect technologies with retry
      const techDetection = await withRetry(
        () => detectTechnologies(this.stagehand!),
        CONFIG.maxRetries,
        CONFIG.rateLimitDelayMs,
        'Tech stack detection'
      );

      // Step 4: Analyze careers page with retry
      await delay(CONFIG.rateLimitDelayMs);
      const careersData = await withRetry(
        () => analyzeCareersPage(this.stagehand!, websiteUrl, this.configuredModel),
        2, // Fewer retries for careers page (might not exist)
        CONFIG.rateLimitDelayMs,
        'Careers page analysis'
      );
      if (careersData) {
        sourcesChecked.push(careersData.careersPageUrl);
      }

      // Step 5: Find engineering blog
      await delay(CONFIG.rateLimitDelayMs);
      this.actionCount++;
      await this.saveCheckpoint('before_blog_search');
      const blogData = await this.retryOperation(
        async () => {
          await this.refreshSessionIfNeeded();
          return await findEngineeringBlog(this.stagehand!, websiteUrl, this.configuredModel);
        },
        'findEngineeringBlog',
        2,
        2000
      );
      if (blogData.url) {
        sourcesChecked.push(blogData.url);
      }

      // Step 6: Go back to about page for culture info
      await delay(CONFIG.rateLimitDelayMs);
      const aboutUrl = new URL(websiteUrl).origin + "/about";
      await safeNavigateWithObservation(this.stagehand!, aboutUrl, 1, this.configuredModel);
      sourcesChecked.push(aboutUrl);

      let cultureInfo = {
        developmentPractices: [] as string[],
        techCultureHighlights: [] as string[],
      };

      try {
        // Pass modelName to ensure the correct model is used
        console.log(`🔍 Using model: ${this.configuredModel} for culture extract()`);
        const extractOpts: any = {
          instruction: `Extract any information about engineering culture, development practices, or technical approach. Look for:
              - Development methodologies (Agile, DevOps, CI/CD)
              - Technical values or principles
              - Open source involvement
              - Engineering team structure`,
          schema: z.object({
            developmentPractices: z.array(z.string()),
            techCultureHighlights: z.array(z.string()),
          }),
        };
        // Explicitly pass modelName and modelClientOptions (ExtractOptions supports them)
        if (this.configuredModel) {
          extractOpts.modelName = this.configuredModel;
        }
        if (this.modelClientOptions) {
          extractOpts.modelClientOptions = this.modelClientOptions;
        }
        this.actionCount++;
        const extractResult = await this.retryOperation(
          async () => {
            await this.refreshSessionIfNeeded();
            return await this.stagehand!.extract(extractOpts);
          },
          'extract(cultureInfo)',
          3,
          2000
        );
        
        // Handle extract result - validate structure
        if (extractResult && typeof extractResult === 'object') {
          if ('developmentPractices' in extractResult && 'techCultureHighlights' in extractResult) {
            cultureInfo = extractResult as typeof cultureInfo;
          } else if ('pageText' in extractResult) {
            // Fallback: if we only got pageText, use empty arrays
            cultureInfo = {
              developmentPractices: [],
              techCultureHighlights: [],
            };
          } else {
            cultureInfo = extractResult as typeof cultureInfo;
          }
        }
        await this.saveCheckpoint('after_culture_extract');
      } catch {
        // About page extraction is optional
      }

      // Build the complete prospect profile
      const primaryFramework =
        techDetection.detectedFromSource.find((d) => d.confidence === "high")?.technology ||
        techDetection.detectedFromSource[0]?.technology ||
        null;

      const partialData: Partial<ProspectIntelligence> = {
        companyName: companyName || companyInfo.companyName,
        companyWebsite: websiteUrl,
        companyDescription: companyInfo.description,
        industry: companyInfo.industry,
        isB2BSaaS: companyInfo.isB2BSaaS,
        techStack: {
          primaryFramework,
          frameworkConfidence:
            techDetection.detectedFromSource[0]?.confidence || "low",
          frameworkEvidence: techDetection.detectedFromSource.map((d) => d.evidence),
          additionalFrameworks: techDetection.detectedFromSource
            .slice(1)
            .map((d) => d.technology),
          buildTools: [],
          isModernStack: ["React", "Next.js", "Vue.js", "Angular", "Svelte"].includes(
            primaryFramework || ""
          ),
          confidenceScore: techDetection.detectedFromSource.length > 0 
            ? (techDetection.detectedFromSource[0]?.confidence === "high" ? 85 : 
               techDetection.detectedFromSource[0]?.confidence === "medium" ? 65 : 45)
            : 30,
          fallbackReason: primaryFramework ? null : "Framework not clearly detected from page source",
        },
        hiring: {
          hasOpenEngineeringRoles: careersData?.engineeringJobCount
            ? careersData.engineeringJobCount > 0
            : false,
          engineeringRoleCount: careersData?.engineeringJobCount || null,
          totalOpenRoles: careersData?.totalJobCount || null,
          jobBoardPlatform: careersData?.jobBoardPlatform || null,
          engineeringRoleTitles:
            careersData?.jobListings
              .filter((j) => j.isEngineering)
              .map((j) => j.title) || [],
          seniorityLevels: [
            ...new Set(
              careersData?.jobListings
                .map((j) => j.seniority)
                .filter(Boolean) as string[]
            ),
          ],
          hiringSignals: careersData?.hiringUrgencySignals || [],
          confidenceScore: careersData ? 80 : 40,
          fallbackReason: careersData ? null : "Careers page not found or inaccessible",
        },
        engineeringCulture: {
          hasEngineeringBlog: blogData.found,
          engineeringBlogUrl: blogData.url,
          recentBlogTopics: blogData.topics,
          developmentPractices: cultureInfo.developmentPractices,
          techCultureHighlights: cultureInfo.techCultureHighlights,
          opensourcePresence:
            cultureInfo.techCultureHighlights.some(
              (h) =>
                h.toLowerCase().includes("open source") ||
                h.toLowerCase().includes("opensource")
            ) || false,
        },
        companySize: {
          estimatedEmployeeRange: null,
          estimatedEngineeringTeamSize: null,
          growthIndicators: companyInfo.growthIndicators,
          fundingInfo: null,
        },
      };

      // Calculate ICP score
      const icpResult = calculateICPScore(partialData);

      // Build final result
      const result: ProspectIntelligence = {
        ...partialData,
        thirdPartyTools: {
          analytics: techDetection.detectedFromScripts.filter((s) =>
            s.includes("analytics")
          ),
          monitoring: techDetection.detectedFromScripts.filter((s) =>
            s.includes("monitoring")
          ),
          deployment: [],
          chat: techDetection.detectedFromScripts.filter((s) => s.includes("chat")),
          other: techDetection.detectedFromScripts.filter(
            (s) =>
              !s.includes("analytics") &&
              !s.includes("monitoring") &&
              !s.includes("chat")
          ),
        },
        icpScore: {
          overallScore: icpResult.score,
          priorityLevel: icpResult.priority,
          positiveSignals: icpResult.positives,
          negativeSignals: icpResult.negatives,
          recommendedTalkingPoints: icpResult.talkingPoints,
          outreachTiming:
            icpResult.priority === "high"
              ? "Reach out immediately"
              : icpResult.priority === "medium"
              ? "Add to nurture sequence"
              : "Lower priority - revisit later",
        },
        dataQuality: {
          completenessScore: calculateCompleteness(partialData),
          confidenceLevel:
            techDetection.detectedFromSource.length > 0 ? "medium" : "low",
          sourcesChecked,
          missingData: findMissingData(partialData),
        },
        extractedAt: new Date().toISOString(),
        extractionDurationMs: Date.now() - startTime,
      } as ProspectIntelligence;

      return result;
    } catch (error) {
      throw new Error(
        `Failed to research prospect: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Quick tech stack check with resilience
   */
  async checkTechStack(websiteUrl: string): Promise<TechDetection> {
    if (!this.stagehand) {
      await this.initialize();
    }

    // Apply resilience patterns
    await this.refreshSessionIfNeeded();
    const isValid = await this.validateSession();
    if (!isValid) {
      await this.initialize();
    }

    this.actionCount++;
    await this.saveCheckpoint('before_tech_check');

    const navSuccess = await this.retryOperation(
      async () => {
        await this.refreshSessionIfNeeded();
        return await safeNavigateWithObservation(this.stagehand!, websiteUrl, CONFIG.maxRetries, this.configuredModel);
      },
      'navigate(tech_check)',
      3,
      2000
    );

    if (!navSuccess) {
      throw new Error(`Failed to navigate to ${websiteUrl} for tech stack check`);
    }

    const result = await this.retryOperation(
      async () => {
        await this.refreshSessionIfNeeded();
        return await withRetry(
          () => detectTechnologies(this.stagehand!),
          CONFIG.maxRetries,
          CONFIG.rateLimitDelayMs,
          'Tech stack check'
        );
      },
      'detectTechnologies',
      3,
      2000
    );

    await this.saveCheckpoint('after_tech_check');
    return result;
  }

  /**
   * Quick hiring check with resilience
   */
  async checkHiring(websiteUrl: string): Promise<CareersPageData | null> {
    if (!this.stagehand) {
      await this.initialize();
    }

    // Apply resilience patterns
    await this.refreshSessionIfNeeded();
    const isValid = await this.validateSession();
    if (!isValid) {
      await this.initialize();
    }

    this.actionCount++;
    await this.saveCheckpoint('before_hiring_check');

    const result = await this.retryOperation(
      async () => {
        await this.refreshSessionIfNeeded();
        return await analyzeCareersPage(this.stagehand!, websiteUrl, this.configuredModel);
      },
      'analyzeCareersPage',
      2,
      2000
    );

    await this.saveCheckpoint('after_hiring_check');
    return result;
  }

  /**
   * Session resilience: Refresh session if it's been active for too long
   */
  private async refreshSessionIfNeeded(): Promise<void> {
    const now = Date.now();
    const sessionAge = now - this.sessionStartTime;
    
    if (sessionAge > this.SESSION_REFRESH_INTERVAL_MS && this.stagehand) {
      console.log(`🔄 Session age ${Math.round(sessionAge / 1000 / 60)} minutes - refreshing...`);
      try {
        // Save checkpoint before refresh
        await this.saveCheckpoint('before_refresh');
        
        // Close current session
        await this.stagehand.close();
        this.stagehand = null;
        
        // Reinitialize
        await this.initialize();
        console.log(`✅ Session refreshed successfully`);
      } catch (err: any) {
        console.error(`❌ Failed to refresh session: ${err.message}`);
        throw err;
      }
    }
  }

  /**
   * Session resilience: Validate that session is still active
   */
  private async validateSession(): Promise<boolean> {
    if (!this.stagehand) {
      return false;
    }
    
    try {
      // Check if page is accessible (basic validation)
      const hasPage = !!(this.stagehand as any)?.page;
      return hasPage;
    } catch {
      return false;
    }
  }

  /**
   * Session resilience: Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
          console.log(`⚠️ ${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
          await delay(delayMs);
          
          // Try to refresh session before retry
          try {
            await this.refreshSessionIfNeeded();
          } catch (refreshError) {
            console.warn(`⚠️ Session refresh failed before retry: ${refreshError}`);
          }
        }
      }
    }
    
    throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Session resilience: Save checkpoint for recovery
   */
  private async saveCheckpoint(checkpointName: string): Promise<void> {
    try {
      this.lastCheckpoint = {
        name: checkpointName,
        timestamp: Date.now(),
        actionCount: this.actionCount,
        sessionAge: Date.now() - this.sessionStartTime,
      };
      
      // In a production system, you might want to persist this to a database
      // For now, we just store it in memory
    } catch (err: any) {
      console.warn(`⚠️ Failed to save checkpoint ${checkpointName}: ${err.message}`);
    }
  }

  /**
   * Session resilience: Start periodic checkpointing
   */
  private startCheckpointing(): void {
    if (this.checkpointInterval) {
      return; // Already started
    }
    
    // Save checkpoint every 5 minutes
    const CHECKPOINT_INTERVAL_MS = 5 * 60 * 1000;
    
    this.checkpointInterval = setInterval(async () => {
      if (this.actionCount > 0) {
        await this.saveCheckpoint('periodic_checkpoint');
      }
    }, CHECKPOINT_INTERVAL_MS);
  }

  /**
   * Cleanup - close browser session with proper cleanup
   */
  async close(): Promise<void> {
    // Stop checkpointing
    if (this.checkpointInterval) {
      clearInterval(this.checkpointInterval);
      this.checkpointInterval = null;
    }
    
    // Save final checkpoint
    if (this.actionCount > 0) {
      await this.saveCheckpoint('session_end').catch(() => {
        // Ignore errors during cleanup
      });
    }
    
    if (this.stagehand) {
      try {
        await this.stagehand.close();
      } catch (err: any) {
        console.warn(`⚠️ Error closing stagehand session: ${err.message}`);
      }
      this.stagehand = null;
    }
    
    // Reset state
    this.sessionStartTime = 0;
    this.lastCheckpoint = null;
    this.actionCount = 0;
    
    console.log(`🧹 Session closed and cleaned up`);
  }
}

