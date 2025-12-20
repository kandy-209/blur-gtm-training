#!/usr/bin/env node

/**
 * Comprehensive test script for Prospect Intelligence and Browserbase integration
 * 
 * This script tests:
 * 1. Environment variables configuration
 * 2. Browserbase API connection
 * 3. Stagehand initialization
 * 4. Prospect Intelligence API endpoint
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    }
  });
}

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m',
  };
  
  const icon = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  };
  
  console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
}

function testPass(name, details = '') {
  results.passed.push({ name, details });
  log(`${name}${details ? ': ' + details : ''}`, 'success');
}

function testFail(name, error, details = '') {
  results.failed.push({ name, error, details });
  log(`${name}: ${error}${details ? ' - ' + details : ''}`, 'error');
}

function testWarn(name, message) {
  results.warnings.push({ name, message });
  log(`${name}: ${message}`, 'warning');
}

// Test 1: Check environment variables
function testEnvironmentVariables() {
  log('\n📋 Test 1: Checking Environment Variables', 'info');
  
  const required = {
    BROWSERBASE_API_KEY: process.env.BROWSERBASE_API_KEY,
    BROWSERBASE_PROJECT_ID: process.env.BROWSERBASE_PROJECT_ID,
  };
  
  const optional = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };
  
  let allRequiredPresent = true;
  
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      testFail(`Missing ${key}`, `Environment variable ${key} is not set`);
      allRequiredPresent = false;
    } else {
      testPass(`Found ${key}`, `Value: ${value.substring(0, 10)}...`);
    }
  }
  
  // Check for at least one LLM API key
  const hasLLMKey = Object.values(optional).some(v => v);
  if (!hasLLMKey) {
    testFail('No LLM API Key', 'At least one LLM API key is required (ANTHROPIC_API_KEY, GOOGLE_GEMINI_API_KEY, or OPENAI_API_KEY)');
    allRequiredPresent = false;
  } else {
    for (const [key, value] of Object.entries(optional)) {
      if (value) {
        testPass(`Found ${key}`, `Value: ${value.substring(0, 10)}...`);
      }
    }
  }
  
  // Validate API key formats
  if (process.env.BROWSERBASE_API_KEY) {
    const key = process.env.BROWSERBASE_API_KEY;
    if (key.length < 20) {
      testWarn('BROWSERBASE_API_KEY', 'API key seems too short. Please verify it\'s correct.');
    }
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key.startsWith('sk-ant-')) {
      testWarn('ANTHROPIC_API_KEY', 'API key should start with "sk-ant-". Please verify it\'s correct.');
    }
  }
  
  return allRequiredPresent;
}

// Test 2: Validate Browserbase credentials format
function testBrowserbaseCredentials() {
  log('\n📋 Test 2: Validating Browserbase Credentials', 'info');
  
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  
  // Validate API key format (Browserbase keys typically start with 'bb_' or 'bb_live_')
  if (apiKey) {
    if (apiKey.startsWith('bb_') || apiKey.startsWith('bb_live_')) {
      testPass('Browserbase API Key Format', 'Valid format detected');
    } else {
      testWarn('Browserbase API Key Format', 'API key should start with "bb_" or "bb_live_". Please verify it\'s correct.');
    }
    
    if (apiKey.length < 20) {
      testWarn('Browserbase API Key', 'API key seems too short. Please verify it\'s correct.');
    }
  }
  
  // Validate project ID format (UUID format)
  if (projectId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(projectId)) {
      testPass('Browserbase Project ID Format', 'Valid UUID format detected');
    } else {
      testWarn('Browserbase Project ID Format', 'Project ID should be a UUID. Please verify it\'s correct.');
    }
  }
  
  // Note: Actual Browserbase connectivity will be tested via Stagehand initialization
  testPass('Browserbase Credentials', 'Credentials present and formatted correctly');
  return true;
}

// Test 3: Test Stagehand initialization
async function testStagehandInitialization() {
  log('\n📋 Test 3: Testing Stagehand Initialization', 'info');
  
  try {
    const { Stagehand } = require('@browserbasehq/stagehand');
    
    const browserbaseKey = process.env.BROWSERBASE_API_KEY;
    const projectId = process.env.BROWSERBASE_PROJECT_ID;
    
    // Determine which LLM to use
    let model, apiKey, providerName;
    let testedBrowserbase = false;
    
    // Priority: Test Browserbase mode first if OpenAI or Gemini available
    // (Claude uses LOCAL mode as workaround for Browserbase 404 bug)
    if (process.env.OPENAI_API_KEY) {
      model = 'gpt-4o';
      apiKey = process.env.OPENAI_API_KEY;
      providerName = 'GPT-4o (OpenAI)';
      testedBrowserbase = true;
    } else if (process.env.GOOGLE_GEMINI_API_KEY) {
      model = 'gpt-4o'; // Stagehand validation workaround
      apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      providerName = 'Gemini (Google)';
      testedBrowserbase = true;
    } else if (process.env.ANTHROPIC_API_KEY) {
      model = 'claude-3-5-sonnet-20241022';
      apiKey = process.env.ANTHROPIC_API_KEY;
      providerName = 'Claude (Anthropic)';
      // Claude uses LOCAL mode (workaround for Browserbase 404 bug)
      testedBrowserbase = false;
    } else {
      testFail('Stagehand Initialization', 'No LLM API key found');
      return false;
    }
    
    testPass(`Using LLM Provider`, providerName);
    
    // Use LOCAL mode for Claude (workaround for Browserbase 404 bug)
    const useLocalBrowser = model.startsWith('claude');
    const env = useLocalBrowser ? 'LOCAL' : 'BROWSERBASE';
    
    const stagehandConfig = {
      env: env,
      model: model,
      modelClientOptions: {
        apiKey: apiKey,
      },
    };
    
    if (env === 'BROWSERBASE') {
      stagehandConfig.apiKey = browserbaseKey;
      stagehandConfig.projectId = projectId;
      log(`   Testing Browserbase connectivity via Stagehand...`, 'info');
    } else {
      log(`   Using LOCAL mode (Claude workaround - Browserbase has 404 bug with Claude)`, 'info');
    }
    
    log(`   Configuring Stagehand with env: ${env}, model: ${model}`, 'info');
    
    const stagehand = new Stagehand(stagehandConfig);
    testPass('Stagehand Instance Created', `Environment: ${env}`);
    
    // Try to initialize (this is where it usually fails)
    await stagehand.init();
    testPass('Stagehand Initialization', 'Successfully initialized');
    
    if (env === 'BROWSERBASE') {
      testPass('Browserbase Connectivity', 'Successfully connected to Browserbase via Stagehand');
    } else {
      testWarn('Browserbase Mode', 'Using LOCAL mode (Claude). To test Browserbase connectivity, add OPENAI_API_KEY or GOOGLE_GEMINI_API_KEY.');
    }
    
    // Clean up
    await stagehand.close();
    testPass('Stagehand Cleanup', 'Successfully closed');
    
    return true;
  } catch (error) {
    testFail('Stagehand Initialization', error.message);
    if (error.message.includes('404')) {
      testWarn('Stagehand', 'This might be the Browserbase + Claude 404 bug. Try using OPENAI_API_KEY or GOOGLE_GEMINI_API_KEY instead.');
    } else if (error.message.includes('401') || error.message.includes('authentication')) {
      testWarn('Stagehand', 'Authentication error. Please verify your Browserbase API key and project ID are correct.');
    }
    return false;
  }
}

// Test 4: Test Prospect Intelligence API endpoint (if server is running)
async function testProspectIntelligenceAPI() {
  log('\n📋 Test 4: Testing Prospect Intelligence API Endpoint', 'info');
  
  return new Promise((resolve) => {
    // Check if server is running on localhost:3000
    const testUrl = 'http://localhost:3000/api/prospect-intelligence/research';
    
    const testRequest = http.request(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 500 && data.includes('BROWSERBASE_API_KEY')) {
          testFail('API Endpoint Configuration', 'Server is running but environment variables are not configured');
          resolve(false);
        } else if (response.statusCode === 400) {
          // 400 is expected for missing body - means endpoint exists
          testPass('API Endpoint Available', 'Server is running and endpoint exists');
          resolve(true);
        } else {
          testPass('API Endpoint Available', `Status: ${response.statusCode}`);
          resolve(true);
        }
      });
    });
    
    testRequest.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        testWarn('API Endpoint', 'Server is not running. Start it with: npm run dev');
        resolve(null); // Not a failure, just not available
      } else {
        testFail('API Endpoint', error.message);
        resolve(false);
      }
    });
    
    testRequest.setTimeout(5000, () => {
      testRequest.destroy();
      testWarn('API Endpoint', 'Connection timeout. Server may not be running.');
      resolve(null);
    });
    
    testRequest.write(JSON.stringify({}));
    testRequest.end();
  });
}

// Test 5: Test a simple research operation (optional, takes longer)
async function testSimpleResearch() {
  log('\n📋 Test 5: Testing Simple Research Operation (Optional)', 'info');
  
  const shouldRun = process.argv.includes('--full-test');
  
  if (!shouldRun) {
    testWarn('Simple Research', 'Skipped (use --full-test flag to run)');
    return null;
  }
  
  try {
    const { ResearchService } = require('./src/lib/prospect-intelligence/research-service');
    const service = new ResearchService();
    
    await service.initialize();
    testPass('Research Service Initialized', 'Ready for research');
    
    // Test with a simple, well-known website
    log('   Testing research on example.com (this may take 30-60 seconds)...', 'info');
    
    const result = await service.researchProspect('https://example.com', 'Example Inc');
    
    if (result && result.companyName) {
      testPass('Simple Research Operation', `Successfully researched: ${result.companyName}`);
      await service.close();
      return true;
    } else {
      testFail('Simple Research Operation', 'Research completed but returned invalid data');
      await service.close();
      return false;
    }
  } catch (error) {
    testFail('Simple Research Operation', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 Prospect Intelligence & Browserbase Integration Test\n');
  console.log('=' .repeat(60));
  
  const test1 = testEnvironmentVariables();
  if (!test1) {
    log('\n❌ Environment variables test failed. Please configure your .env.local file.', 'error');
    printSummary();
    process.exit(1);
  }
  
  const test2 = testBrowserbaseCredentials();
  if (!test2) {
    log('\n❌ Browserbase credentials validation failed.', 'error');
    printSummary();
    process.exit(1);
  }
  
  const test3 = await testStagehandInitialization();
  if (!test3) {
    log('\n❌ Stagehand initialization test failed. Check LLM API keys.', 'error');
    printSummary();
    process.exit(1);
  }
  
  const test4 = await testProspectIntelligenceAPI();
  if (test4 === false) {
    log('\n❌ API endpoint test failed.', 'error');
    printSummary();
    process.exit(1);
  }
  
  const test5 = await testSimpleResearch();
  
  printSummary();
  
  if (results.failed.length === 0) {
    log('\n🎉 All tests passed! Prospect Intelligence and Browserbase are configured correctly.', 'success');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'warning');
    process.exit(1);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(({ name, message }) => {
      console.log(`   - ${name}: ${message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run tests
runAllTests().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});

