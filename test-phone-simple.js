/**
 * Simple test script for phone number API
 * Run: node test-phone-simple.js
 */

const testCases = [
  { phone: '+1 (209) 470-2824', desc: 'Formatted US number' },
  { phone: '12094702824', desc: 'Cleaned US number' },
  { phone: '2094702824', desc: 'US number without country code' },
  { phone: '+12094702824', desc: 'E.164 format' },
];

async function test() {
  console.log('🧪 Testing Phone Number API\n');
  console.log('Make sure dev server is running: npm run dev\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.desc}`);
    console.log(`Phone: ${testCase.phone}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testCase.phone,
          userId: 'test_user_123',
          scenarioId: 'SKEPTIC_VPE_001',
          trainingMode: 'practice',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ SUCCESS');
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ ERROR (${response.status})`);
        console.log(`Error: ${data.error || data.message}`);
        if (data.hint) console.log(`Hint: ${data.hint}`);
        if (data.received) console.log(`Received: ${data.received}`);
        if (data.cleaned) console.log(`Cleaned: ${data.cleaned}`);
        if (data.formatted) console.log(`Formatted: ${data.formatted}`);
      }
    } catch (error) {
      console.log(`❌ NETWORK ERROR: ${error.message}`);
      console.log('   Make sure the dev server is running!');
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ (for native fetch)');
  console.log('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

test().catch(console.error);
