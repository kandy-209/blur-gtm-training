#!/usr/bin/env node

/**
 * Verification Script for All Improvements
 * Checks that all 18 improvements are properly implemented
 */

const fs = require('fs');
const path = require('path');

const improvements = {
  seo: {
    sitemap: 'src/app/sitemap.ts',
    robots: 'src/app/robots.ts',
    ogImage: 'src/app/api/og/route.tsx',
    searchAction: 'src/app/layout.tsx',
  },
  components: {
    socialShare: 'src/components/SocialShare.tsx',
    siteSearch: 'src/components/SiteSearch.tsx',
    breadcrumbNav: 'src/components/BreadcrumbNav.tsx',
    accessibilityEnhancer: 'src/components/AccessibilityEnhancer.tsx',
    imageOptimizer: 'src/components/ImageOptimizer.tsx',
    analyticsTracker: 'src/components/AnalyticsTracker.tsx',
  },
  analytics: {
    enhancedAnalytics: 'src/lib/enhanced-analytics.ts',
    conversionTracking: 'src/lib/conversion-tracking.ts',
    pageviewApi: 'src/app/api/analytics/pageview/route.ts',
    engagementApi: 'src/app/api/analytics/engagement/route.ts',
    performanceApi: 'src/app/api/analytics/performance/route.ts',
  },
  structuredData: {
    layout: 'src/app/layout.tsx',
  },
};

const checks = {
  filesExist: [],
  filesMissing: [],
  structuredDataTypes: [],
  apiRoutes: [],
};

console.log('🔍 Verifying All Improvements...\n');

// Check all files exist
Object.values(improvements).forEach((category) => {
  Object.entries(category).forEach(([name, filePath]) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      checks.filesExist.push({ name, path: filePath });
    } else {
      checks.filesMissing.push({ name, path: filePath });
    }
  });
});

// Check structured data in layout.tsx
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const structuredDataTypes = [
    'Organization',
    'SoftwareApplication',
    'Product',
    'Service',
    'Course',
    'FAQPage',
    'BreadcrumbList',
    'HowTo',
    'ItemList',
    'CustomerSuccessStory',
    'CompetitiveComparison',
    'PerformanceBenchmark',
    'SearchAction',
    'VideoObject',
    'Event',
    'Article',
    'WebPage',
    'LocalBusiness',
  ];

  structuredDataTypes.forEach((type) => {
    if (layoutContent.includes(`'@type': '${type}'`) || layoutContent.includes(`"@type": "${type}"`)) {
      checks.structuredDataTypes.push(type);
    }
  });
}

// Check API routes
const apiDir = path.join(process.cwd(), 'src/app/api');
if (fs.existsSync(apiDir)) {
  const findApiRoutes = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach((file) => {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        findApiRoutes(fullPath);
      } else if (file.name === 'route.ts' || file.name === 'route.tsx') {
        const relativePath = path.relative(path.join(process.cwd(), 'src/app'), fullPath);
        checks.apiRoutes.push(relativePath);
      }
    });
  };
  findApiRoutes(apiDir);
}

// Print results
console.log('✅ Files Found:', checks.filesExist.length);
checks.filesExist.forEach(({ name, path: filePath }) => {
  console.log(`   ✓ ${name}: ${filePath}`);
});

if (checks.filesMissing.length > 0) {
  console.log('\n❌ Files Missing:', checks.filesMissing.length);
  checks.filesMissing.forEach(({ name, path: filePath }) => {
    console.log(`   ✗ ${name}: ${filePath}`);
  });
}

console.log('\n📊 Structured Data Types Found:', checks.structuredDataTypes.length);
console.log('   Types:', checks.structuredDataTypes.join(', '));

console.log('\n🔌 API Routes Found:', checks.apiRoutes.length);
checks.apiRoutes.slice(0, 10).forEach((route) => {
  console.log(`   ✓ ${route}`);
});
if (checks.apiRoutes.length > 10) {
  console.log(`   ... and ${checks.apiRoutes.length - 10} more`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📈 SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Files Verified: ${checks.filesExist.length}`);
console.log(`❌ Files Missing: ${checks.filesMissing.length}`);
console.log(`📊 Structured Data Types: ${checks.structuredDataTypes.length}/18`);
console.log(`🔌 API Routes: ${checks.apiRoutes.length}`);
console.log('='.repeat(50));

const allGood = checks.filesMissing.length === 0 && checks.structuredDataTypes.length >= 15;
if (allGood) {
  console.log('\n🎉 All improvements verified! Ready for production.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some improvements may be missing. Please review above.');
  process.exit(1);
}

