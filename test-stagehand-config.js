#!/usr/bin/env node

/**
 * Test different Stagehand configuration approaches
 */

const fs = require('fs');
const path = require('path');

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

const { Stagehand } = require('@browserbasehq/stagehand');

const apiKey = process.env.ANTHROPIC_API_KEY;
const browserbaseKey = process.env.BROWSERBASE_API_KEY;
const projectId = process.env.BROWSERBASE_PROJECT_ID;

console.log('🧪 Testing Stagehand Configuration Approaches\n');

if (!apiKey || !browserbaseKey || !projectId) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Test different configuration approaches
const configs = [
  {
    name: 'Approach 1: modelClientOptions with apiKey',
    config: {
      env: 'BROWSERBASE',
      apiKey: browserbaseKey,
      projectId: projectId,
      model: 'claude-3-haiku-20240307',
      modelClientOptions: {
        apiKey: apiKey,
      },
    },
  },
  {
    name: 'Approach 2: modelClientOptions + top-level anthropicApiKey',
    config: {
      env: 'BROWSERBASE',
      apiKey: browserbaseKey,
      projectId: projectId,
      model: 'claude-3-haiku-20240307',
      modelClientOptions: {
        apiKey: apiKey,
      },
      anthropicApiKey: apiKey,
    },
  },
  {
    name: 'Approach 3: Just modelClientOptions with different structure',
    config: {
      env: 'BROWSERBASE',
      apiKey: browserbaseKey,
      projectId: projectId,
      model: 'claude-3-haiku-20240307',
      modelClientOptions: {
        apiKey: apiKey,
        apiKey: apiKey, // Anthropic SDK format
      },
    },
  },
];

async function testConfig(configObj) {
  console.log(`\n📋 Testing: ${configObj.name}`);
  console.log(`   Model: ${configObj.config.model}`);
  
  try {
    const stagehand = new Stagehand(configObj.config);
    console.log('   ✅ Stagehand instance created');
    
    // Try to initialize (this is where it usually fails)
    await stagehand.init();
    console.log('   ✅✅ Stagehand.init() SUCCEEDED!');
    await stagehand.close();
    return true;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) {
      console.log(`\n🎉 SUCCESS! Working configuration: ${config.name}`);
      return;
    }
  }
  
  console.log('\n❌ All configuration approaches failed.');
  console.log('   The issue may be with Stagehand version compatibility or API key format.');
}

runTests().catch(console.error);


