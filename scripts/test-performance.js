#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests design system performance metrics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Performance Testing Suite');
console.log('============================\n');

// Check if lighthouse is installed
try {
  execSync('npx lighthouse --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installing Lighthouse...');
  execSync('npm install -g lighthouse', { stdio: 'inherit' });
}

const testUrl = process.env.TEST_URL || 'http://localhost:3000';

console.log(`Testing URL: ${testUrl}\n`);

// Check if server is running
try {
  execSync(`curl -s ${testUrl} > /dev/null`, { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Server is not running!');
  console.error('Please start the dev server with: npm run dev');
  process.exit(1);
}

console.log('✅ Server is running\n');

// Run Lighthouse audit
console.log('🔍 Running Lighthouse audit...');
console.log('This may take a minute...\n');

try {
  const output = execSync(
    `npx lighthouse ${testUrl} --output json --output-path ./lighthouse-report.json --quiet`,
    { encoding: 'utf-8' }
  );

  if (fs.existsSync('./lighthouse-report.json')) {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf-8'));
    const scores = report.categories;

    console.log('📊 Lighthouse Scores:');
    console.log('====================');
    console.log(`Performance:     ${Math.round(scores.performance.score * 100)}`);
    console.log(`Accessibility:   ${Math.round(scores.accessibility.score * 100)}`);
    console.log(`Best Practices:  ${Math.round(scores['best-practices'].score * 100)}`);
    console.log(`SEO:            ${Math.round(scores.seo.score * 100)}`);
    console.log('');

    // Check scores
    const performance = Math.round(scores.performance.score * 100);
    const accessibility = Math.round(scores.accessibility.score * 100);

    if (performance >= 95) {
      console.log('✅ Performance: Excellent');
    } else if (performance >= 90) {
      console.log('⚠️  Performance: Good (target: 95+)');
    } else {
      console.log('❌ Performance: Needs improvement');
    }

    if (accessibility >= 95) {
      console.log('✅ Accessibility: Excellent');
    } else if (accessibility >= 90) {
      console.log('⚠️  Accessibility: Good (target: 95+)');
    } else {
      console.log('❌ Accessibility: Needs improvement');
    }

    console.log('\n📄 Full report saved to: lighthouse-report.json');
    console.log('📄 HTML report: Run "npx lighthouse http://localhost:3000 --view"');
  }
} catch (error) {
  console.error('❌ Lighthouse audit failed');
  console.error(error.message);
  process.exit(1);
}

console.log('\n✅ Performance testing complete!');


