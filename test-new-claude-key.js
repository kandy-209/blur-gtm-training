#!/usr/bin/env node

/**
 * Test a new Claude API key to check model access
 * Usage: node test-new-claude-key.js "your-api-key-here"
 */

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ Please provide an API key as an argument:');
  console.error('   node test-new-claude-key.js "sk-ant-api03-..."');
  process.exit(1);
}

console.log('🧪 Testing New Claude API Key\n');
console.log(`Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('='.repeat(60));

const models = [
  { name: 'claude-3-haiku-20240307', tier: 'Free' },
  { name: 'claude-3-5-sonnet-20241022', tier: 'Paid' },
  { name: 'claude-3-5-sonnet-latest', tier: 'Paid' },
  { name: 'claude-3-opus-20240229', tier: 'Paid' },
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
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    if (response.ok) {
      return { available: true, status: response.status };
    } else {
      const error = await response.json();
      return { 
        available: false, 
        status: response.status,
        error: error.error?.message || 'Unknown error'
      };
    }
  } catch (error) {
    return { available: false, status: 'network', error: error.message };
  }
}

async function runTests() {
  console.log('\n📋 Testing model access:\n');
  
  const results = {};
  for (const model of models) {
    const result = await testModel(model.name);
    results[model.name] = { ...result, tier: model.tier };
    
    const icon = result.available ? '✅' : '❌';
    const status = result.available ? 'Available' : 
                   result.status === 404 ? 'Not available' : 
                   result.status === 401 ? 'Auth failed' :
                   result.status === 'network' ? 'Network error' :
                   `Error (${result.status})`;
    
    console.log(`   ${icon} ${model.name}`);
    console.log(`      Tier: ${model.tier} | Status: ${status}`);
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const available = Object.entries(results).filter(([_, r]) => r.available);
  const hasSonnet = available.some(([model]) => model.includes('sonnet'));
  const hasHaiku = available.some(([model]) => model.includes('haiku'));
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  if (hasSonnet) {
    console.log('🎉 SUCCESS! This key has Sonnet access!');
    console.log('   ✅ You can use Sonnet models (better quality)');
    console.log('   ✅ The code will automatically use Sonnet');
    console.log('\n💡 Next steps:');
    console.log('   1. Add this key to .env.local as ANTHROPIC_API_KEY');
    console.log('   2. Restart your dev server');
    console.log('   3. The code will use Sonnet automatically');
  } else if (hasHaiku) {
    console.log('⚠️  This key only has Haiku access');
    console.log('   ✅ Haiku works (fast & cheap)');
    console.log('   ❌ Sonnet requires a paid plan');
    console.log('\n💡 To get Sonnet:');
    console.log('   1. Go to https://console.anthropic.com/');
    console.log('   2. Upgrade to a paid plan');
    console.log('   3. Your key will get Sonnet access automatically');
  } else {
    console.log('❌ No models available');
    console.log('   Please check:');
    console.log('   1. API key is correct');
    console.log('   2. API key is active');
    console.log('   3. Account has credits');
  }
  
  console.log('\n📝 Available models:');
  available.forEach(([model, result]) => {
    console.log(`   ✅ ${model} (${result.tier} tier)`);
  });
}

runTests().catch(console.error);






