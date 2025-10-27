/**
 * Idempotency Middleware Tests
 * Tests for duplicate request prevention
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_JWT = process.env.TEST_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwN2IxOGIyNS1mYzQxLTRhNGYtODc3NC1kMTliZDE1MzUwYjUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTc3MDAwMDB9.fake';

// Generate unique idempotency key
function generateIdempotencyKey() {
  return `idem_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

async function testIdempotencyBasic() {
  console.log('🧪 Test 1: Basic Idempotency - Duplicate Detection\n');
  
  const idempotencyKey = generateIdempotencyKey();
  const orderData = {
    symbol: 'BTCUSDT',
    side: 'buy',
    type: 'market',
    qty: '0.001'
  };
  
  try {
    // First request
    console.log('📤 Sending first request...');
    const response1 = await axios.post(
      `${BASE_URL}/api/manual-trading/order`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`,
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ First request succeeded: ${response1.status}`);
    console.log(`   Order ID: ${response1.data.data?.orderId}`);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second request with same key (should return cached response)
    console.log('📤 Sending duplicate request with same idempotency key...');
    const response2 = await axios.post(
      `${BASE_URL}/api/manual-trading/order`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`,
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Second request returned cached response: ${response2.status}`);
    console.log(`   Order ID: ${response2.data.data?.orderId}`);
    
    // Verify both responses are identical
    if (response1.data.data?.orderId === response2.data.data?.orderId) {
      console.log('✅ Idempotency verified: Same order ID returned\n');
      return true;
    } else {
      console.log('❌ Idempotency failed: Different order IDs returned\n');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}\n`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return false;
  }
}

async function testIdempotencyConflict() {
  console.log('🧪 Test 2: Idempotency Conflict - Different Body with Same Key\n');
  
  const idempotencyKey = generateIdempotencyKey();
  
  const orderData1 = {
    symbol: 'BTCUSDT',
    side: 'buy',
    type: 'market',
    qty: '0.001'
  };
  
  const orderData2 = {
    symbol: 'ETHUSDT', // Different symbol
    side: 'buy',
    type: 'market',
    qty: '0.002'
  };
  
  try {
    // First request
    console.log('📤 Sending first request...');
    const response1 = await axios.post(
      `${BASE_URL}/api/manual-trading/order`,
      orderData1,
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`,
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ First request succeeded: ${response1.status}`);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second request with same key but different body (should fail)
    console.log('📤 Sending request with same key but different data...');
    const response2 = await axios.post(
      `${BASE_URL}/api/manual-trading/order`,
      orderData2,
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`,
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json'
        },
        validateStatus: () => true // Don't throw on any status
      }
    );
    
    if (response2.status === 409) {
      console.log('✅ Conflict detected correctly: 409 status\n');
      return true;
    } else {
      console.log(`❌ Expected 409, got ${response2.status}\n`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}\n`);
    return false;
  }
}

async function testWithoutIdempotencyKey() {
  console.log('🧪 Test 3: Request Without Idempotency Key (Optional)\n');
  
  const orderData = {
    symbol: 'BTCUSDT',
    side: 'buy',
    type: 'market',
    qty: '0.001'
  };
  
  try {
    // Request without idempotency key
    console.log('📤 Sending request without idempotency key...');
    const response = await axios.post(
      `${BASE_URL}/api/manual-trading/order`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`,
          'Content-Type': 'application/json'
          // No Idempotency-Key header
        }
      }
    );
    
    console.log(`✅ Request succeeded without idempotency key: ${response.status}`);
    console.log('✅ Idempotency is optional as expected\n');
    return true;
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}\n`);
    return false;
  }
}

async function testRequestIdTracking() {
  console.log('🧪 Test 4: Request ID Tracking\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    
    const requestId = response.headers['x-request-id'];
    
    if (requestId) {
      console.log(`✅ Request ID present in response: ${requestId}`);
      console.log('✅ Request ID tracking is working\n');
      return true;
    } else {
      console.log('❌ Request ID not found in response headers\n');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}\n`);
    return false;
  }
}

// Run all tests
(async () => {
  console.log('🚀 Starting Idempotency Tests...\n');
  console.log('=' .repeat(60) + '\n');
  
  const results = {
    basicIdempotency: await testIdempotencyBasic(),
    idempotencyConflict: await testIdempotencyConflict(),
    withoutKey: await testWithoutIdempotencyKey(),
    requestIdTracking: await testRequestIdTracking()
  };
  
  console.log('=' .repeat(60));
  console.log('\n📊 Test Results Summary:\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${test}`);
    result ? passed++ : failed++;
  }
  
  console.log(`\n🎯 Total: ${passed} passed, ${failed} failed\n`);
  
  process.exit(failed > 0 ? 1 : 0);
})();
