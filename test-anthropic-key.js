#!/usr/bin/env node

/**
 * Test Anthropic API key directly to verify it works
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

console.log('🔑 Testing Anthropic API Key...');
console.log(`Key preview: ${apiKey.substring(0, 20)}...`);
console.log(`Key length: ${apiKey.length}`);
console.log('');

// Test with direct API call
async function testAPIKey() {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Say "test"',
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Key Test Failed:');
      console.error(`Status: ${response.status}`);
      console.error(`Error:`, JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ API Key is VALID!');
    console.log('Response:', data.content[0]?.text || 'No text in response');
    console.log('');
    console.log('✅ Your Anthropic API key works correctly.');
    console.log('The issue is likely with Stagehand configuration, not the API key itself.');
  } catch (error) {
    console.error('❌ Error testing API key:');
    console.error(error.message);
    process.exit(1);
  }
}

testAPIKey();






