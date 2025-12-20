#!/usr/bin/env node

/**
 * Check Anthropic API key plan status
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
let apiKey = null;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (key.trim() === 'ANTHROPIC_API_KEY') {
          apiKey = value;
        }
      }
    }
  });
}

if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

console.log('🔍 Checking Anthropic API Key Plan Status\n');
console.log(`Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('='.repeat(60));

async function checkPlan() {
  // Test with Haiku (always available)
  const haikuResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  });

  // Test with Sonnet (requires paid plan)
  const sonnetResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  });

  console.log('\n📊 Plan Status:\n');
  
  if (haikuResponse.ok) {
    console.log('✅ Haiku: Available (free tier)');
  } else {
    console.log('❌ Haiku: Not available');
  }

  if (sonnetResponse.ok) {
    console.log('✅ Sonnet: Available (paid plan)');
    console.log('\n🎉 You have Sonnet access! The code should work with Sonnet.');
  } else if (sonnetResponse.status === 404) {
    console.log('❌ Sonnet: Not available (requires paid plan)');
    console.log('\n💡 To get Sonnet access:');
    console.log('   1. Go to: https://console.anthropic.com/');
    console.log('   2. Click "Settings" → "Billing"');
    console.log('   3. Add payment method');
    console.log('   4. Upgrade to a paid plan');
    console.log('   5. Your existing API key will automatically get Sonnet access');
  } else {
    console.log(`❌ Sonnet: Error (${sonnetResponse.status})`);
  }

  console.log('\n📝 Current Setup:');
  console.log('   - Code is configured to use Haiku (works with your current plan)');
  console.log('   - If you upgrade, Sonnet will work automatically');
  console.log('   - No need to create a new API key');
}

checkPlan().catch(console.error);





