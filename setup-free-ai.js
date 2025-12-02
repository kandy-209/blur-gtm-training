#!/usr/bin/env node
// Interactive script to set up free AI provider (Hugging Face)

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🆓 Free AI Provider Setup (Hugging Face)');
console.log('==========================================\n');

console.log('📝 Steps:');
console.log('1. Visit: https://huggingface.co/settings/tokens');
console.log('2. Click "New token"');
console.log('3. Name it: cursor-training-app');
console.log('4. Select "Read" permission');
console.log('5. Click "Generate token"');
console.log('6. Copy the token (starts with hf_...)\n');

rl.question('Paste your Hugging Face API token here (or press Enter to skip): ', (token) => {
  if (!token || token.trim() === '') {
    console.log('\n⏭️  Skipped. You can run this script again later.');
    rl.close();
    return;
  }

  const trimmedToken = token.trim();
  
  if (!trimmedToken.startsWith('hf_')) {
    console.log('\n❌ Invalid token format. Token should start with "hf_"');
    rl.close();
    return;
  }

  console.log('\n🔧 Adding token to Vercel...\n');

  try {
    // Add to production
    console.log('Adding to Production...');
    execSync(`echo "${trimmedToken}" | npx vercel env add HUGGINGFACE_API_KEY production`, { stdio: 'inherit' });
    
    console.log('\nSetting AI_PROVIDER to huggingface (Production)...');
    execSync(`echo "huggingface" | npx vercel env add AI_PROVIDER production`, { stdio: 'inherit' });

    // Add to preview
    console.log('\nAdding to Preview...');
    execSync(`echo "${trimmedToken}" | npx vercel env add HUGGINGFACE_API_KEY preview`, { stdio: 'inherit' });
    
    console.log('\nSetting AI_PROVIDER to huggingface (Preview)...');
    execSync(`echo "huggingface" | npx vercel env add AI_PROVIDER preview`, { stdio: 'inherit' });

    // Add to development
    console.log('\nAdding to Development...');
    execSync(`echo "${trimmedToken}" | npx vercel env add HUGGINGFACE_API_KEY development`, { stdio: 'inherit' });
    
    console.log('\nSetting AI_PROVIDER to huggingface (Development)...');
    execSync(`echo "huggingface" | npx vercel env add AI_PROVIDER development`, { stdio: 'inherit' });

    console.log('\n✅ Success! Environment variables added.');
    console.log('\n🚀 Next step: Redeploy your app');
    console.log('   Run: npx vercel --prod\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Tip: Make sure you\'re logged into Vercel CLI');
    console.log('   Run: npx vercel login\n');
  }

  rl.close();
});

