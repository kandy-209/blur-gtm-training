#!/usr/bin/env node

/**
 * Setup script for Prospect Intelligence database
 * This script helps you set up the database table in Supabase
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Prospect Intelligence Database Setup\n');
  console.log('This script will help you set up the database table in Supabase.\n');

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, '../supabase/migrations/create_prospect_intelligence_table.sql');
  let migrationSQL;
  
  try {
    migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration SQL file found\n');
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    process.exit(1);
  }

  console.log('📋 Options:\n');
  console.log('1. Copy SQL to clipboard (for manual paste into Supabase Dashboard)');
  console.log('2. Display SQL in terminal (you can copy it)');
  console.log('3. Save SQL to a file');
  console.log('4. Open Supabase Dashboard (if you have the URL configured)\n');

  const choice = await question('Choose an option (1-4): ');

  switch (choice.trim()) {
    case '1':
      await copyToClipboard(migrationSQL);
      break;
    case '2':
      displaySQL(migrationSQL);
      break;
    case '3':
      await saveToFile(migrationSQL);
      break;
    case '4':
      openSupabaseDashboard();
      break;
    default:
      console.log('Invalid choice. Displaying SQL instead...\n');
      displaySQL(migrationSQL);
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Click "New Query"');
  console.log('5. Paste the SQL migration');
  console.log('6. Click "Run" to execute\n');

  console.log('✅ After running the migration, your database will be ready!\n');

  rl.close();
}

async function copyToClipboard(sql) {
  try {
    // Try to use clipboardy if available, otherwise fall back
    const { execSync } = require('child_process');
    const platform = process.platform;
    
    if (platform === 'darwin') {
      // macOS
      execSync(`echo "${sql.replace(/"/g, '\\"')}" | pbcopy`);
      console.log('\n✅ SQL copied to clipboard! (macOS)');
    } else if (platform === 'linux') {
      // Linux
      try {
        execSync(`echo "${sql.replace(/"/g, '\\"')}" | xclip -selection clipboard`);
        console.log('\n✅ SQL copied to clipboard! (Linux)');
      } catch {
        console.log('\n⚠️  Could not copy to clipboard. Please copy manually from option 2.');
      }
    } else if (platform === 'win32') {
      // Windows
      try {
        execSync(`echo "${sql.replace(/"/g, '\\"')}" | clip`);
        console.log('\n✅ SQL copied to clipboard! (Windows)');
      } catch {
        console.log('\n⚠️  Could not copy to clipboard. Please copy manually from option 2.');
      }
    } else {
      console.log('\n⚠️  Clipboard not supported on this platform. Use option 2 to view SQL.');
    }
  } catch (error) {
    console.log('\n⚠️  Could not copy to clipboard:', error.message);
    console.log('Please use option 2 to view and copy the SQL manually.');
  }
}

function displaySQL(sql) {
  console.log('\n' + '='.repeat(80));
  console.log('MIGRATION SQL - Copy this and paste into Supabase SQL Editor:');
  console.log('='.repeat(80) + '\n');
  console.log(sql);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function saveToFile(sql) {
  const outputPath = path.join(process.cwd(), 'prospect-intelligence-migration.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`\n✅ SQL saved to: ${outputPath}`);
  console.log('You can now open this file and copy its contents to Supabase.\n');
}

function openSupabaseDashboard() {
  const { exec } = require('child_process');
  const url = 'https://supabase.com/dashboard';
  
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = `open ${url}`;
  } else if (platform === 'linux') {
    command = `xdg-open ${url}`;
  } else if (platform === 'win32') {
    command = `start ${url}`;
  } else {
    console.log(`\n⚠️  Please open this URL manually: ${url}`);
    return;
  }
  
  exec(command, (error) => {
    if (error) {
      console.log(`\n⚠️  Could not open browser. Please visit: ${url}`);
    } else {
      console.log(`\n✅ Opening Supabase Dashboard in your browser...`);
    }
  });
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
