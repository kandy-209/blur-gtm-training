#!/usr/bin/env node

/**
 * Test script for Browserbase API
 * Tests if Browserbase credentials are configured and working
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Read API key from .env.local
let apiKey = '';
let projectId = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const apiKeyMatch = envContent.match(/BROWSERBASE_API_KEY="([^"]+)"/);
  const projectIdMatch = envContent.match(/BROWSERBASE_PROJECT_ID="([^"]+)"/);
  
  if (apiKeyMatch) {
    apiKey = apiKeyMatch[1].trim();
  }
  if (projectIdMatch) {
    projectId = projectIdMatch[1].trim();
  }
} catch (error) {
  console.log('❌ Could not read .env.local file');
  process.exit(1);
}

console.log('🧪 Testing Browserbase Configuration...\n');

if (!apiKey) {
  console.log('❌ BROWSERBASE_API_KEY not found in .env.local');
  process.exit(1);
}

if (!projectId) {
  console.log('❌ BROWSERBASE_PROJECT_ID not found in .env.local');
  process.exit(1);
}

console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
console.log(`📦 Project ID: ${projectId.substring(0, 10)}...${projectId.substring(projectId.length - 5)}`);
console.log('');

// Test Browserbase API
const options = {
  hostname: 'www.browserbase.com',
  port: 443,
  path: '/v1/sessions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-browserbase-api-key': apiKey,
  },
  timeout: 30000,
};

const postData = JSON.stringify({
  projectId: projectId,
  // Minimal session config for testing
});

console.log('⏳ Testing Browserbase API connection...\n');

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers['content-type'] || 'N/A');
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ SUCCESS: Browserbase API is accessible!');
      try {
        const response = JSON.parse(data);
        console.log(`   📦 Response: ${JSON.stringify(response).substring(0, 100)}...`);
      } catch (e) {
        console.log(`   📦 Response received (${data.length} bytes)`);
      }
      console.log('\n✅ Browserbase configuration is working correctly!');
      process.exit(0);
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      console.log(`❌ ERROR: Authentication failed (${res.statusCode})`);
      console.log('   The API key or project ID may be invalid.');
      try {
        const errorResponse = JSON.parse(data);
        console.log('   Error:', errorResponse.message || errorResponse.error || 'Unknown error');
      } catch (e) {
        console.log('   Response:', data.substring(0, 200));
      }
      process.exit(1);
    } else {
      console.log(`⚠️  Status: ${res.statusCode}`);
      console.log('   This may indicate a configuration issue.');
      try {
        const response = JSON.parse(data);
        console.log('   Response:', JSON.stringify(response).substring(0, 200));
      } catch (e) {
        console.log('   Response:', data.substring(0, 200));
      }
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERROR: Request failed');
  console.log('   Error:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.log('\n💡 TIP: Check your internet connection');
  }
  
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ ERROR: Request timed out');
  req.destroy();
  process.exit(1);
});

req.write(postData);
req.end();



