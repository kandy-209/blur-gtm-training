#!/usr/bin/env node

/**
 * Test multiple Claude API keys manually
 * Usage: node test-claude-keys-manual.js "key1" "key2" "key3"
 * Or edit the keys array below
 */

const keys = process.argv.slice(2);

// If no keys provided, check environment
if (keys.length === 0) {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (key.trim().includes('ANTHROPIC') || key.trim().includes('CLAUDE')) {
            keys.push(value);
          }
        }
      }
    });
  }
}

if (keys.length === 0) {
  console.error('❌ No API keys found. Please provide keys as arguments:');
  console.error('   node test-claude-keys-manual.js "key1" "key2" "key3"');
  console.error('\nOr add them to the keys array in this file.');
  process.exit(1);
}

console.log(`🔑 Testing ${keys.length} API key(s)\n`);

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
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    if (response.ok) {
      return { available: true };
    } else {
      const error = await response.json();
      return { 
        available: false, 
        status: response.status,
        error: error.error?.message 
      };
    }
  } catch (error) {
    return { available: false, status: 'network', error: error.message };
  }
}

async function testApiKey(apiKey, index) {
  console.log(`\n📋 Key ${index + 1}: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log('   ' + '-'.repeat(50));
  
  const results = {};
  for (const model of models) {
    const result = await testModel(apiKey, model);
    results[model] = result;
    
    const icon = result.available ? '✅' : '❌';
    const status = result.available ? 'Available' : 
                   result.status === 404 ? 'Not available' : 
                   result.status === 401 ? 'Auth failed' :
                   result.status === 'network' ? 'Network error' :
                   `Error (${result.status})`;
    console.log(`   ${icon} ${model} - ${status}`);
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const available = Object.entries(results).filter(([_, r]) => r.available);
  const hasSonnet = available.some(([model]) => model.includes('sonnet'));
  const hasHaiku = available.some(([model]) => model.includes('haiku'));
  
  console.log('\n   📊 Summary:');
  if (hasSonnet) {
    console.log('   ✅ Has Sonnet access (paid plan) - BEST for quality');
  }
  if (hasHaiku) {
    console.log('   ✅ Has Haiku access (free tier) - Fast & cheap');
  }
  if (!hasSonnet && !hasHaiku) {
    console.log('   ❌ No models available');
  }
  
  return { hasSonnet, hasHaiku, available: available.map(([m]) => m) };
}

async function runTests() {
  const allResults = [];
  
  for (let i = 0; i < keys.length; i++) {
    allResults.push(await testApiKey(keys[i], i));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Comparison:\n');
  
  let bestKeyIndex = -1;
  let bestKeyType = '';
  
  allResults.forEach((result, index) => {
    if (result.hasSonnet) {
      console.log(`✅ Key ${index + 1}: Has Sonnet (BEST)`);
      if (bestKeyIndex === -1) {
        bestKeyIndex = index;
        bestKeyType = 'Sonnet';
      }
    } else if (result.hasHaiku) {
      console.log(`⚠️  Key ${index + 1}: Only Haiku`);
      if (bestKeyIndex === -1) {
        bestKeyIndex = index;
        bestKeyType = 'Haiku';
      }
    } else {
      console.log(`❌ Key ${index + 1}: No access`);
    }
  });
  
  if (bestKeyIndex >= 0) {
    console.log(`\n💡 Recommendation: Use Key ${bestKeyIndex + 1}`);
    console.log(`   Access: ${bestKeyType}`);
    if (bestKeyType === 'Haiku') {
      console.log('   To get Sonnet, upgrade your Anthropic plan at: https://console.anthropic.com/');
    }
  }
}

runTests().catch(console.error);





