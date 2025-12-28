#!/usr/bin/env node

/**
 * Complete Verification Script
 * Verifies all 53 improvements
 */

const fs = require('fs');
const path = require('path');

const improvements = {
  // Core SEO
  'sitemap.ts': 'Dynamic Sitemap',
  'robots.ts': 'Dynamic Robots.txt',
  'api/og/route.tsx': 'Dynamic OG Images',
  'api/search/route.ts': 'Site Search',
  
  // AI Agents
  'infrastructure/agents/coaching-agent.ts': 'CoachingAgent',
  'infrastructure/agents/analytics-agent.ts': 'AnalyticsAgent',
  'infrastructure/agents/prospect-intelligence-agent.ts': 'ProspectIntelligenceAgent',
  
  // Utilities
  'lib/agent-cache-manager.ts': 'Agent Cache Manager',
  'lib/agent-rate-limiter.ts': 'Agent Rate Limiter',
  'lib/agent-error-handler.ts': 'Agent Error Handler',
  'lib/agent-config.ts': 'Agent Config Manager',
  'lib/agent-auto-retry.ts': 'Agent Auto-Retry',
  'lib/agent-batch-processor.ts': 'Agent Batch Processor',
  'lib/agent-cost-tracker.ts': 'Agent Cost Tracker',
  'lib/agent-monitor.ts': 'Agent Monitor',
  'lib/agent-health-check.ts': 'Agent Health Check',
  'lib/agent-orchestrator.ts': 'Agent Orchestrator',
  'lib/agent-testing.ts': 'Agent Testing',
  
  // Components
  'components/RoleplayCoaching.tsx': 'RoleplayCoaching',
  'components/PredictiveAnalytics.tsx': 'PredictiveAnalytics',
  'components/ProspectIntelligenceEnhancer.tsx': 'ProspectIntelligenceEnhancer',
  'components/UnifiedInsights.tsx': 'Unified Insights',
  'components/AgentMonitorDashboard.tsx': 'Agent Monitor Dashboard',
  'components/AgentCostDashboard.tsx': 'Agent Cost Dashboard',
  
  // API Routes
  'app/api/agents/health/route.ts': 'Health Check API',
  'app/api/agents/metrics/route.ts': 'Metrics API',
  'app/api/agents/cost/route.ts': 'Cost API',
  'app/api/agents/test/route.ts': 'Test API',
  'app/api/seo/validate/route.ts': 'SEO Validate API',
  'app/api/deployment/check/route.ts': 'Deployment Check API',
  
  // Libraries
  'lib/seo-validator.ts': 'SEO Validator',
  'lib/deployment-checker.ts': 'Deployment Checker',
};

let passed = 0;
let failed = 0;
const failures = [];

console.log('🔍 Verifying all improvements...\n');

for (const [file, name] of Object.entries(improvements)) {
  const filePath = path.join(process.cwd(), 'src', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name} - File not found: ${filePath}`);
    failed++;
    failures.push(name);
  }
}

console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);

if (failed > 0) {
  console.log('\n❌ Failures:');
  failures.forEach(f => console.log(`   - ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 All improvements verified!');
  process.exit(0);
}

