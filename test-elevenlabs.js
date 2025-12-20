#!/usr/bin/env node

/**
 * Test script for ElevenLabs TTS API
 * Tests the /api/tts endpoint to verify ElevenLabs integration is working
 */

const https = require('https');
const http = require('http');

const TEST_TEXT = "Hello, this is a test of the ElevenLabs text-to-speech feature. If you can hear this, the integration is working correctly.";

// Get the base URL from environment or use localhost
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/tts`;

console.log('🧪 Testing ElevenLabs TTS API...\n');
console.log(`📍 Endpoint: ${API_ENDPOINT}`);
console.log(`📝 Test Text: "${TEST_TEXT.substring(0, 50)}..."\n`);

// Parse URL
const url = new URL(API_ENDPOINT);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
};

const postData = JSON.stringify({
  text: TEST_TEXT,
});

console.log('⏳ Sending request...\n');

const req = client.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers['content-type'] || 'N/A');
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        
        if (response.audio) {
          const audioSize = response.size || 'unknown';
          console.log('✅ SUCCESS: Audio generated successfully!');
          console.log(`   📦 Audio Size: ${audioSize} bytes`);
          console.log(`   🎵 Format: ${response.format || 'mp3'}`);
          console.log(`   📊 Audio Data: ${response.audio.substring(0, 50)}...`);
          console.log('\n✅ ElevenLabs TTS API is working correctly!');
          process.exit(0);
        } else {
          console.log('❌ ERROR: No audio data in response');
          console.log('   Response:', data.substring(0, 200));
          process.exit(1);
        }
      } catch (error) {
        console.log('❌ ERROR: Failed to parse response');
        console.log('   Error:', error.message);
        console.log('   Response:', data.substring(0, 200));
        process.exit(1);
      }
    } else {
      console.log(`❌ ERROR: Request failed with status ${res.statusCode}`);
      try {
        const errorResponse = JSON.parse(data);
        console.log('   Error Message:', errorResponse.error || 'Unknown error');
        console.log('   Full Response:', data.substring(0, 500));
      } catch (e) {
        console.log('   Response:', data.substring(0, 500));
      }
      
      if (res.statusCode === 401) {
        console.log('\n💡 TIP: Check your ELEVENLABS_API_KEY environment variable');
      } else if (res.statusCode === 429) {
        console.log('\n💡 TIP: Rate limit exceeded. Try again later.');
      } else if (res.statusCode === 402) {
        console.log('\n💡 TIP: Insufficient credits. Check your ElevenLabs account balance.');
      } else if (res.statusCode === 500) {
        console.log('\n💡 TIP: Server error. Check server logs for details.');
      }
      
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERROR: Request failed');
  console.log('   Error:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 TIP: Make sure the development server is running:');
    console.log('   npm run dev');
  } else if (error.code === 'ENOTFOUND') {
    console.log('\n💡 TIP: Check the URL/hostname is correct');
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
