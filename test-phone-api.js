/**
 * Test script for phone number validation and sales-call API
 * Run with: node test-phone-api.js
 */

const testPhoneNumbers = [
  '+1 (209) 470-2824',  // Formatted US number
  '12094702824',        // Cleaned US number with country code
  '2094702824',         // US number without country code
  '+12094702824',       // E.164 format
  '(209) 470-2824',     // US format without country code
];

async function testPhoneNumber(phoneNumber) {
  console.log(`\n🧪 Testing phone number: "${phoneNumber}"`);
  
  try {
    const response = await fetch('http://localhost:3000/api/vapi/sales-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        userId: 'test_user_123',
        scenarioId: 'SKEPTIC_VPE_001', // Use a valid scenario ID
        trainingMode: 'practice',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS:', data);
    } else {
      console.log(`❌ ERROR (${response.status}):`, {
        error: data.error,
        message: data.message,
        hint: data.hint,
        received: data.received,
        cleaned: data.cleaned,
        formatted: data.formatted,
      });
    }
  } catch (error) {
    console.error('❌ NETWORK ERROR:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting phone number validation tests...');
  console.log('Make sure the dev server is running on http://localhost:3000\n');
  
  for (const phoneNumber of testPhoneNumbers) {
    await testPhoneNumber(phoneNumber);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✅ All tests completed!');
}

// Check if server is running
fetch('http://localhost:3000/api/health')
  .then(() => {
    console.log('✅ Dev server is running');
    runTests();
  })
  .catch(() => {
    console.error('❌ Dev server is not running!');
    console.log('Please start it with: npm run dev');
    process.exit(1);
  });
