#!/usr/bin/env node

// Interactive script to add environment variables to Vercel
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addEnvVar(name, description, getUrl) {
  console.log(`\n📋 ${name}`);
  console.log(`   ${description}`);
  if (getUrl) {
    console.log(`   Get it: ${getUrl}`);
  }
  const value = await question(`   Enter value (press Enter to skip): `);
  
  if (!value.trim()) {
    console.log(`   ⏭️  Skipped ${name}`);
    return false;
  }

  try {
    console.log(`   Adding to Production...`);
    execSync(`npx vercel env add ${name} production`, {
      input: value + '\n',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(`   Adding to Preview...`);
    execSync(`npx vercel env add ${name} preview`, {
      input: value + '\n',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(`   Adding to Development...`);
    execSync(`npx vercel env add ${name} development`, {
      input: value + '\n',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(`   ✅ Added ${name}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Failed to add ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔐 Vercel Environment Variables Setup');
  console.log('=====================================\n');
  console.log('This script will help you add environment variables to Vercel.');
  console.log('You can skip any variable by pressing Enter.\n');

  const vars = [
    {
      name: 'OPENAI_API_KEY',
      desc: 'OpenAI API key for AI role-play (starts with sk-proj-)',
      url: 'https://platform.openai.com/api-keys'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      desc: 'Supabase project URL',
      url: 'Supabase Dashboard → Settings → API → Project URL'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      desc: 'Supabase service_role key (keep secret!)',
      url: 'Supabase Dashboard → Settings → API → service_role key'
    },
    {
      name: 'NEXT_PUBLIC_ELEVENLABS_AGENT_ID',
      desc: 'ElevenLabs agent ID (optional, for voice features)',
      url: 'ElevenLabs Dashboard'
    }
  ];

  const added = [];
  for (const v of vars) {
    const result = await addEnvVar(v.name, v.desc, v.url);
    if (result) added.push(v.name);
  }

  // Add NODE_ENV
  console.log(`\n📋 NODE_ENV`);
  try {
    execSync(`npx vercel env add NODE_ENV production`, {
      input: 'production\n',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`   ✅ Added NODE_ENV`);
    added.push('NODE_ENV');
  } catch (error) {
    console.log(`   ⚠️  NODE_ENV may already exist`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Setup Complete!');
  console.log('='.repeat(50));
  console.log(`\nAdded ${added.length} environment variable(s):`);
  added.forEach(v => console.log(`   - ${v}`));

  console.log('\n📤 Next Steps:');
  console.log('   1. Redeploy your application:');
  console.log('      npx vercel --prod');
  console.log('\n   2. Or redeploy from Vercel dashboard:');
  console.log('      https://vercel.com/dashboard');
  console.log('\n   3. Test your deployment!');

  rl.close();
}

main().catch(console.error);

