#!/usr/bin/env node

// Verify Supabase Setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Supabase Configuration...\n');

// Check .env.local
const envPath = path.join(process.cwd(), '.env.local');
let hasEnvFile = false;
let hasSupabaseUrl = false;
let hasSupabaseKey = false;

if (fs.existsSync(envPath)) {
  hasEnvFile = true;
  const envContent = fs.readFileSync(envPath, 'utf8');
  hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && 
                   !envContent.includes('your-project-id');
  hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') && 
                   !envContent.includes('your-anon-key');
  
  console.log('✅ .env.local file exists');
  if (hasSupabaseUrl) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set');
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL not configured');
  }
  if (hasSupabaseKey) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not configured');
  }
} else {
  console.log('❌ .env.local file not found');
}

console.log('\n📋 Setup Checklist:');
console.log('  [ ] Created Supabase project at supabase.com');
console.log('  [ ] Got Project URL and Anon Key');
console.log('  [ ] Ran database migration SQL');
console.log('  [ ] Enabled Email authentication');
console.log('  [ ] Set environment variables');

if (!hasEnvFile || !hasSupabaseUrl || !hasSupabaseKey) {
  console.log('\n⚠️  Action Required:');
  console.log('  1. Create Supabase project: https://supabase.com');
  console.log('  2. Get credentials from: Settings → API');
  console.log('  3. Run: bash scripts/setup-supabase.sh');
  console.log('  4. Or manually edit .env.local');
} else {
  console.log('\n✅ Environment variables are set!');
  console.log('   Next: Run database migration in Supabase SQL Editor');
}

console.log('\n📄 Migration file: scripts/create-supabase-tables.sql');
console.log('📖 Guide: SETUP_SUPABASE_NOW.md\n');

