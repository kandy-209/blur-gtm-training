#!/usr/bin/env node

/**
 * Direct test of ElevenLabs API key
 * Tests the API key directly against ElevenLabs API
 */

const https = require('https');
const fs = require('fs');

// Read API key from .env.local
let apiKey = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/ELEVENLABS_API_KEY="([^"]+)"/);
  if (match) {
    // Remove all whitespace, newlines, and carriage returns
    apiKey = match[1].replace(/\s+/g, '').replace(/\n/g, '').replace(/\r/g, '').trim();
  }
} catch (error) {
  console.log('❌ Could not read .env.local file');
  process.exit(1);
}

if (!apiKey) {
  console.log('❌ API key not found in .env.local');
  process.exit(1);
}

console.log('🧪 Testing ElevenLabs API key directly...\n');
console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
console.log(`📏 Key Length: ${apiKey.length} characters\n`);

const testText = "Hello, this is a test.";
const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Default voice

const options = {
  hostname: 'api.elevenlabs.io',
  port: 443,
  path: `/v1/text-to-speech/${voiceId}`,
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': apiKey,
  },
  timeout: 30000,
};

const postData = JSON.stringify({
  text: testText,
  model_id: 'eleven_multilingual_v2',
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    use_speaker_boost: true
  }
});

console.log('⏳ Sending request to ElevenLabs API...\n');

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Content-Type: ${res.headers['content-type'] || 'N/A'}`);
  console.log('');

  let data = Buffer.alloc(0);

  res.on('data', (chunk) => {
    data = Buffer.concat([data, chunk]);
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS: API key is valid!');
      console.log(`   📦 Audio Size: ${data.length} bytes`);
      console.log(`   🎵 Format: ${res.headers['content-type'] || 'audio/mpeg'}`);
      console.log('\n✅ ElevenLabs API key is working correctly!');
      process.exit(0);
    } else {
      console.log(`❌ ERROR: Request failed with status ${res.statusCode}`);
      
      try {
        const errorResponse = JSON.parse(data.toString());
        console.log('   Error Message:', errorResponse.detail?.message || errorResponse.message || 'Unknown error');
        
        if (res.statusCode === 401) {
          console.log('\n💡 The API key is invalid or expired.');
          console.log('   Please check your ElevenLabs account and generate a new API key.');
        } else if (res.statusCode === 429) {
          console.log('\n💡 Rate limit exceeded. Try again later.');
        } else if (res.statusCode === 402) {
          console.log('\n💡 Insufficient credits. Check your ElevenLabs account balance.');
        }
      } catch (e) {
        console.log('   Response:', data.toString().substring(0, 200));
      }
      
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERROR: Request failed');
  console.log('   Error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ ERROR: Request timed out');
  req.destroy();
  process.exit(1);
});

req.write(postData);
req.end();
