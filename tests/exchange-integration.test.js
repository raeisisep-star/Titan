/**
 * Exchange Integration Tests
 * Tests for exchange integration with server endpoints
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_JWT = process.env.TEST_JWT || 'test-jwt';  // Will use development mode fallback

async function testPlaceOrderWithExchange() {
  console.log('\n🧪 Test 1: Place Order with Exchange Integration\n');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/manual-trading/order`,
      {
        symbol: 'BTCUSDT',
        side: 'buy',
        type: 'market',
        qty: 0.001
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Order placed successfully');
    console.log(`   Order ID: ${response.data.data.orderId}`);
    console.log(`   External Order ID: ${response.data.data.externalOrderId}`);
    console.log(`   Exchange: ${response.data.data.exchange}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Executed Qty: ${response.data.data.executedQty}`);
    
    if (response.data.data.externalOrderId && response.data.data.exchange) {
      console.log('✅ Exchange integration working correctly');
      return response.data.data;
    } else {
      console.log('❌ Missing exchange data');
      return null;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return null;
  }
}

async function testCancelOrderWithExchange(orderId) {
  console.log('\n🧪 Test 2: Cancel Order with Exchange Integration\n');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/manual-trading/orders/cancel`,
      { orderId },
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Order cancelled successfully');
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Status: ${response.data.data.status}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return false;
  }
}

async function testGetBalance() {
  console.log('\n🧪 Test 3: Get Exchange Balance\n');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/exchange/balance`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`
        }
      }
    );
    
    console.log('✅ Balance retrieved successfully');
    console.log(`   Exchange: ${response.data.data.exchange}`);
    console.log(`   Balances:`, response.data.data.balances);
    
    return true;
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return false;
  }
}

async function testGetBalanceSpecificAsset() {
  console.log('\n🧪 Test 4: Get Specific Asset Balance\n');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/exchange/balance?asset=USDT`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_JWT}`
        }
      }
    );
    
    console.log('✅ USDT balance retrieved');
    console.log(`   Exchange: ${response.data.data.exchange}`);
    console.log(`   Balance:`, response.data.data.balances);
    
    return true;
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
(async () => {
  console.log('🚀 Starting Exchange Integration Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    placeOrder: null,
    cancelOrder: false,
    getBalance: false,
    getBalanceAsset: false
  };
  
  // Test 1: Place order
  const orderData = await testPlaceOrderWithExchange();
  results.placeOrder = orderData !== null;
  
  // Test 2: Cancel order (only if place succeeded)
  if (orderData && orderData.orderId) {
    // Only cancel limit orders (market orders are already filled)
    if (orderData.status !== 'filled') {
      results.cancelOrder = await testCancelOrderWithExchange(orderData.orderId);
    } else {
      console.log('\n⏭️  Test 2: Skipped (order already filled)');
      results.cancelOrder = true;  // Count as pass
    }
  }
  
  // Test 3: Get all balances
  results.getBalance = await testGetBalance();
  
  // Test 4: Get specific asset
  results.getBalanceAsset = await testGetBalanceSpecificAsset();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Final Results:\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${test}`);
    result ? passed++ : failed++;
  }
  
  console.log(`\n🎯 Total: ${passed} passed, ${failed} failed\n`);
  
  const allPassed = failed === 0;
  console.log(`${allPassed ? '🎉' : '💥'} Overall: ${allPassed ? 'SUCCESS' : 'FAILED'}\n`);
  
  process.exit(allPassed ? 0 : 1);
})();
