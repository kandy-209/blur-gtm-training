#!/usr/bin/env node

/**
 * Test Claude API key directly to see which models are available
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

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('🧪 Testing Claude API Key\n');
console.log(`API Key: ${apiKey.substring(0, 15)}...`);
console.log('='.repeat(60));

// Test models
const models = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-latest',
  'claude-3-haiku-20240307',
  'claude-3-opus-20240229',
];

async function testModel(modelName) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hi',
          },
        ],
      }),
    });

    if (response.ok) {
      console.log(`✅ ${modelName} - Available`);
      return true;
    } else {
      const error = await response.json();
      if (response.status === 404) {
        console.log(`❌ ${modelName} - Not available (404): ${error.error?.message || 'Model not found'}`);
      } else if (response.status === 401) {
        console.log(`❌ ${modelName} - Authentication failed (401): Invalid API key`);
      } else {
        console.log(`❌ ${modelName} - Error (${response.status}): ${error.error?.message || 'Unknown error'}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${modelName} - Network error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n📋 Testing model availability:\n');
  
  const results = {};
  for (const model of models) {
    results[model] = await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  const available = Object.entries(results).filter(([_, available]) => available);
  const unavailable = Object.entries(results).filter(([_, available]) => !available);

  if (available.length > 0) {
    console.log('✅ Available models:');
    available.forEach(([model]) => {
      console.log(`   - ${model}`);
    });
  }

  if (unavailable.length > 0) {
    console.log('\n❌ Unavailable models:');
    unavailable.forEach(([model]) => {
      console.log(`   - ${model}`);
    });
  }

  console.log('\n💡 Recommendation:');
  if (results['claude-3-5-sonnet-20241022'] || results['claude-3-5-sonnet-latest']) {
    console.log('   ✅ Your API key has access to Sonnet models!');
    console.log('   The code should work with Sonnet.');
  } else if (results['claude-3-haiku-20240307']) {
    console.log('   ⚠️  Your API key only has access to Haiku.');
    console.log('   The code will automatically fall back to Haiku.');
    console.log('   To use Sonnet, upgrade your Anthropic plan at: https://console.anthropic.com/');
  } else {
    console.log('   ❌ No models are available. Please check:');
    console.log('      1. API key is correct');
    console.log('      2. API key is active');
    console.log('      3. Account has not been suspended');
  }
}

runTests().catch(console.error);





