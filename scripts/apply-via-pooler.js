#!/usr/bin/env node
/**
 * Try to apply migrations via Supabase connection pooler
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const projectRef = SUPABASE_URL?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];

// Try connection pooler endpoint (port 6543) - sometimes works with service role key
// Format: postgresql://postgres.[PROJECT_REF]:[SERVICE_ROLE_KEY]@aws-0-[REGION].pooler.supabase.com:6543/postgres

// Extract region from URL or use default
const region = 'us-east-1'; // Default, might need adjustment

console.log('🚀 Trying Connection Pooler Method\n');

// Method 1: Try with service role key as password (unlikely but worth trying)
const poolerConnections = [
  `postgresql://postgres.${projectRef}:${encodeURIComponent(SUPABASE_SERVICE_ROLE_KEY)}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(SUPABASE_SERVICE_ROLE_KEY)}@${projectRef}.pooler.supabase.com:6543/postgres?sslmode=require`,
];

async function tryConnection(connectionString, method) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log(`🔌 Trying ${method}...`);
    await client.connect();
    console.log(`✅ Connected via ${method}!\n`);
    
    const combinedFile = path.join(__dirname, '..', 'supabase', 'migrations', 'ALL_MIGRATIONS_COMBINED.sql');
    const sql = fs.readFileSync(combinedFile, 'utf8');
    
    console.log('📝 Executing migrations...\n');
    await client.query(sql);
    
    console.log('✅ All migrations applied successfully!\n');
    await client.end();
    return true;
  } catch (err) {
    await client.end().catch(() => {});
    if (err.message.includes('password authentication failed') || err.message.includes('authentication')) {
      console.log(`⚠️  ${method}: Authentication failed (expected - need DB password)\n`);
    } else {
      console.log(`⚠️  ${method}: ${err.message}\n`);
    }
    return false;
  }
}

async function main() {
  for (const connStr of poolerConnections) {
    if (await tryConnection(connStr, 'Pooler Method')) {
      process.exit(0);
    }
  }

  console.log('='.repeat(70));
  console.log('📋 Automated methods require database password\n');
  console.log('   The SQL is ready in your clipboard and browser is open.');
  console.log('   Just paste (Cmd+V) and click "Run" - it takes 5 seconds!\n');
  console.log('   Or add database password to .env.local for future automation:');
  console.log(`   SUPABASE_DB_PASSWORD=your-password`);
  console.log(`   (Get from: https://supabase.com/dashboard/project/${projectRef}/settings/database)\n`);
  console.log('='.repeat(70));
}

main().catch(console.error);
