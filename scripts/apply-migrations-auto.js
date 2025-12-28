#!/usr/bin/env node
/**
 * Auto-apply Supabase migrations using CLI or provide easy manual steps
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'dxgjaznmtsgvxnfnzhbn';

console.log('🚀 Supabase Migration Auto-Applicator\n');

// Option 1: Try CLI with token if available
if (SUPABASE_ACCESS_TOKEN) {
  console.log('🔑 Access token found, attempting CLI method...\n');
  
  try {
    // Login with token
    execSync(`npx supabase login --token "${SUPABASE_ACCESS_TOKEN}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    // Link project
    execSync(`npx supabase link --project-ref ${PROJECT_REF}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    // Push migrations
    execSync('npx supabase db push', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    console.log('\n✅ Migrations applied successfully via CLI!');
    process.exit(0);
  } catch (err) {
    console.log('\n⚠️  CLI method failed, falling back to manual instructions...\n');
  }
}

// Option 2: Provide easy manual steps
console.log('📋 Manual Application (Easiest Method):\n');
console.log('   1. Open this URL in your browser:');
console.log(`      https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new\n`);
console.log('   2. Open this file in your editor:');
const combinedFile = path.join(__dirname, '..', 'supabase', 'migrations', 'ALL_MIGRATIONS_COMBINED.sql');
console.log(`      ${combinedFile}\n`);
console.log('   3. Copy ALL contents from that file');
console.log('   4. Paste into the Supabase SQL Editor');
console.log('   5. Click "Run" button\n');
console.log('✨ That\'s it! All 5 migrations will be applied at once.\n');

// Option 3: Alternative CLI method (if user wants to login interactively)
console.log('📋 Alternative: Use Supabase CLI (requires interactive login):\n');
console.log('   npx supabase login');
console.log(`   npx supabase link --project-ref ${PROJECT_REF}`);
console.log('   npx supabase db push\n');
