#!/usr/bin/env node

/**
 * Integration Test Runner
 * Runs comprehensive integration tests using the testing utilities
 */

const { execSync } = require('child_process');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`Running: ${description}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
  
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', 'blue');
  log('║     Integration Test Suite - Starting Tests          ║', 'blue');
  log('╚═══════════════════════════════════════════════════════╝\n', 'blue');

  const results = [];

  // Check if server is running
  log('Checking server status...', 'blue');
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${BASE_URL}/api/db/health`);
    if (response.ok) {
      log('✅ Server is running', 'green');
    } else {
      log('❌ Server is not responding correctly', 'red');
      process.exit(1);
    }
  } catch (error) {
    log('❌ Server is not running. Start with: npm run dev', 'red');
    process.exit(1);
  }

  // Run type checking
  results.push({
    name: 'Type Checking',
    ...runCommand('npm run typecheck', 'Type checking'),
  });

  // Run unit tests
  results.push({
    name: 'Unit Tests',
    ...runCommand('npm test -- --passWithNoTests', 'Unit tests'),
  });

  // Run API tests
  results.push({
    name: 'API Tests',
    ...runCommand('npm run test:api', 'API tests'),
  });

  // Run backend tests
  results.push({
    name: 'Backend Tests',
    ...runCommand('bash scripts/test-backend.sh', 'Backend integration tests'),
  });

  // Print summary
  log('\n╔═══════════════════════════════════════════════════════╗', 'blue');
  log('║                    Test Summary                        ║', 'blue');
  log('╚═══════════════════════════════════════════════════════╝\n', 'blue');

  let passed = 0;
  let failed = 0;

  results.forEach(result => {
    if (result.success) {
      log(`✅ ${result.name}: PASSED`, 'green');
      passed++;
    } else {
      log(`❌ ${result.name}: FAILED`, 'red');
      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }
      failed++;
    }
  });

  log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`, 'blue');

  if (failed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please review the output above.', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

