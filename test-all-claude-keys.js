#!/usr/bin/env node

/**
 * Test all Claude API keys to see which models each has access to
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
const apiKeys = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        const keyName = key.trim();
        
        // Find all Anthropic/Claude related keys
        if (keyName.includes('ANTHROPIC') || keyName.includes('CLAUDE')) {
          apiKeys[keyName] = value;
        }
      }
    }
  });
}

console.log('🔑 Found API Keys:\n');
Object.keys(apiKeys).forEach(key => {
  const value = apiKeys[key];
  console.log(`   ${key}: ${value.substring(0, 15)}...${value.substring(value.length - 4)}`);
});

if (Object.keys(apiKeys).length === 0) {
  console.error('❌ No Anthropic/Claude API keys found in .env.local');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('\n🧪 Testing each API key for model access\n');

// Test models
const models = [
  'claude-3-haiku-20240307',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-latest',
  'claude-3-opus-20240229',
];

async function testModel(apiKey, modelName) {
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
      return { available: true, error: null };
    } else {
      const error = await response.json();
      return { 
        available: false, 
        status: response.status,
        error: error.error?.message || 'Unknown error'
      };
    }
  } catch (error) {
    return { 
      available: false, 
      status: 'network',
      error: error.message 
    };
  }
}

async function testApiKey(keyName, apiKey) {
  console.log(`\n📋 Testing: ${keyName}`);
  console.log(`   Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log('   ' + '-'.repeat(50));
  
  const results = {};
  for (const model of models) {
    const result = await testModel(apiKey, model);
    results[model] = result;
    
    if (result.available) {
      console.log(`   ✅ ${model}`);
    } else {
      const status = result.status === 404 ? 'Not available' : 
                     result.status === 401 ? 'Auth failed' :
                     result.status === 'network' ? 'Network error' :
                     `Error (${result.status})`;
      console.log(`   ❌ ${model} - ${status}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
  }
  
  const available = Object.entries(results).filter(([_, r]) => r.available);
  const hasSonnet = available.some(([model]) => model.includes('sonnet'));
  const hasHaiku = available.some(([model]) => model.includes('haiku'));
  
  console.log('\n   📊 Summary:');
  if (hasSonnet) {
    console.log('   ✅ Has Sonnet access (paid plan)');
  }
  if (hasHaiku) {
    console.log('   ✅ Has Haiku access (free tier)');
  }
  if (!hasSonnet && !hasHaiku) {
    console.log('   ❌ No models available - check API key');
  }
  
  return { results, hasSonnet, hasHaiku };
}

async function runTests() {
  const allResults = {};
  
  for (const [keyName, apiKey] of Object.entries(apiKeys)) {
    allResults[keyName] = await testApiKey(keyName, apiKey);
    console.log(''); // Blank line between keys
  }
  
  console.log('='.repeat(60));
  console.log('\n📊 Overall Summary:\n');
  
  let bestKey = null;
  let bestKeyName = null;
  
  for (const [keyName, result] of Object.entries(allResults)) {
    if (result.hasSonnet) {
      console.log(`✅ ${keyName}: Has Sonnet access (BEST for quality)`);
      if (!bestKey) {
        bestKey = apiKeys[keyName];
        bestKeyName = keyName;
      }
    } else if (result.hasHaiku) {
      console.log(`⚠️  ${keyName}: Only Haiku access (free tier)`);
      if (!bestKey) {
        bestKey = apiKeys[keyName];
        bestKeyName = keyName;
      }
    } else {
      console.log(`❌ ${keyName}: No models available`);
    }
  }
  
  if (bestKeyName) {
    console.log(`\n💡 Recommendation: Use ${bestKeyName}`);
    if (allResults[bestKeyName].hasSonnet) {
      console.log('   This key has Sonnet access - best quality!');
    } else {
      console.log('   This key has Haiku access - upgrade plan for Sonnet');
    }
  }
}

runTests().catch(console.error);


