#!/usr/bin/env node

/**
 * Direct test of Anthropic API key
 */

const https = require('https');
const fs = require('fs');

let apiKey = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/ANTHROPIC_API_KEY="([^"]+)"/);
  if (match) apiKey = match[1].trim();
} catch (e) {}

console.log('🧪 Testing Anthropic API key...');
if (!apiKey) {
  console.log('❌ ANTHROPIC_API_KEY not found in .env.local');
  process.exit(1);
}
console.log(`🔑 Key prefix: ${apiKey.substring(0, 8)}... (length=${apiKey.length})`);

const data = JSON.stringify({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 10,
  messages: [{ role: 'user', content: 'Hello' }],
});

const options = {
  hostname: 'api.anthropic.com',
  port: 443,
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  timeout: 20000,
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Anthropic key is valid');
    } else {
      try {
        const err = JSON.parse(body);
        console.log('⚠️  Error:', err.error?.message || body.slice(0, 200));
      } catch {
        console.log('⚠️  Error body:', body.slice(0, 200));
      }
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Network / request error:', e.message);
});

req.write(data);
req.end();
