#!/usr/bin/env node
/**
 * Try to get database connection info and apply migrations
 */

const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const projectRef = SUPABASE_URL?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];

console.log('🔍 Attempting to retrieve database connection info...\n');

// Try to get connection string from Supabase API
// Note: This typically requires an access token, not service role key
const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectRef}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const project = JSON.parse(data);
        console.log('✅ Project info retrieved');
        console.log('   Name:', project.name);
        console.log('   Region:', project.region);
        // Database password is not exposed via API for security
        console.log('\n⚠️  Database password not available via API');
        console.log('   You need to get it from:');
        console.log(`   https://supabase.com/dashboard/project/${projectRef}/settings/database\n`);
      } catch (err) {
        console.log('Response:', data.substring(0, 200));
      }
    } else {
      console.log(`⚠️  API returned ${res.statusCode}`);
      console.log('   Response:', data.substring(0, 200));
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

req.end();
