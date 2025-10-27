/**
 * Exchange Adapter Tests
 * Tests for Paper Trading and MEXC adapters
 */

require('dotenv').config();
const ExchangeFactory = require('../adapters/ExchangeFactory');

async function testPaperTrading() {
  console.log('\n🧪 Testing Paper Trading Adapter...\n');
  
  let passed = 0;
  let failed = 0;
  
  try {
    const exchange = ExchangeFactory.create('paper');
    
    // Test 1: Initialize
    const initialized = await exchange.initialize();
    if (initialized) {
      console.log('✅ Test 1: Initialize');
      passed++;
    } else {
      console.log('❌ Test 1: Initialize failed');
      failed++;
    }
    
    // Test 2: Get balance
    const balance = await exchange.getBalance('USDT');
    if (balance.asset === 'USDT' && balance.total > 0) {
      console.log(`✅ Test 2: Get balance (USDT: ${balance.total})`);
      passed++;
    } else {
      console.log('❌ Test 2: Get balance failed');
      failed++;
    }
    
    // Test 3: Place market order
    const order = await exchange.placeOrder({
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'market',
      quantity: '0.001'
    });
    
    if (order.success && order.orderId) {
      console.log(`✅ Test 3: Place market order (ID: ${order.orderId})`);
      passed++;
    } else {
      console.log('❌ Test 3: Place market order failed');
      failed++;
    }
    
    // Test 4: Get order
    const orderDetails = await exchange.getOrder(order.orderId, 'BTCUSDT');
    if (orderDetails.orderId === order.orderId) {
      console.log(`✅ Test 4: Get order (Status: ${orderDetails.status})`);
      passed++;
    } else {
      console.log('❌ Test 4: Get order failed');
      failed++;
    }
    
    // Test 5: Place limit order
    const limitOrder = await exchange.placeOrder({
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'limit',
      quantity: '0.001',
      price: '40000'
    });
    
    if (limitOrder.success && limitOrder.orderId) {
      console.log(`✅ Test 5: Place limit order (ID: ${limitOrder.orderId})`);
      passed++;
    } else {
      console.log('❌ Test 5: Place limit order failed');
      failed++;
    }
    
    // Test 6: Cancel order
    const cancelled = await exchange.cancelOrder(limitOrder.orderId, 'BTCUSDT');
    if (cancelled.success && cancelled.status === 'cancelled') {
      console.log(`✅ Test 6: Cancel order`);
      passed++;
    } else {
      console.log('❌ Test 6: Cancel order failed');
      failed++;
    }
    
    // Test 7: Get all balances
    const allBalances = await exchange.getBalance();
    if (Object.keys(allBalances).length > 0) {
      console.log(`✅ Test 7: Get all balances (${Object.keys(allBalances).length} assets)`);
      passed++;
    } else {
      console.log('❌ Test 7: Get all balances failed');
      failed++;
    }
    
  } catch (error) {
    console.log(`❌ Paper Trading test error: ${error.message}`);
    failed++;
  }
  
  console.log(`\n📊 Paper Trading Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

async function testMEXC() {
  console.log('\n🧪 Testing MEXC Adapter...\n');
  
  if (!process.env.MEXC_API_KEY || !process.env.MEXC_API_SECRET) {
    console.log('⚠️  MEXC credentials not found in environment, skipping MEXC tests');
    return true;
  }
  
  let passed = 0;
  let failed = 0;
  
  try {
    const exchange = ExchangeFactory.create('mexc');
    
    // Test 1: Initialize
    console.log('Testing initialization...');
    const initialized = await exchange.initialize();
    if (initialized) {
      console.log('✅ Test 1: Initialize and authenticate');
      passed++;
    } else {
      console.log('❌ Test 1: Initialize failed');
      failed++;
    }
    
    // Test 2: Test connection
    const connected = await exchange.testConnection();
    if (connected) {
      console.log('✅ Test 2: Test connection');
      passed++;
    } else {
      console.log('❌ Test 2: Connection test failed');
      failed++;
    }
    
    // Test 3: Get balance
    console.log('Getting account balance...');
    const balance = await exchange.getBalance('USDT');
    console.log(`✅ Test 3: Get balance (USDT: ${balance.total})`);
    passed++;
    
    // Test 4: Get exchange info
    const info = await exchange.getExchangeInfo();
    if (info.exchangeName && info.symbols.length > 0) {
      console.log(`✅ Test 4: Get exchange info (${info.symbols.length} symbols)`);
      passed++;
    } else {
      console.log('❌ Test 4: Get exchange info failed');
      failed++;
    }
    
    console.log('\n⚠️  Skipping real order tests to avoid fees');
    console.log('   To test real orders, uncomment the code and use small amounts\n');
    
    /*
    // Uncomment for real order testing (USE AT YOUR OWN RISK)
    
    // Test 5: Place small market order
    const order = await exchange.placeOrder({
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'market',
      quantity: '0.00001' // Very small amount
    });
    
    if (order.success && order.orderId) {
      console.log(`✅ Test 5: Place market order (ID: ${order.orderId})`);
      passed++;
      
      // Test 6: Get order status
      const orderDetails = await exchange.getOrder(order.orderId, 'BTCUSDT');
      console.log(`✅ Test 6: Get order (Status: ${orderDetails.status})`);
      passed++;
    }
    */
    
  } catch (error) {
    console.log(`❌ MEXC test error: ${error.message}`);
    console.error('Full error:', error);
    failed++;
  }
  
  console.log(`\n📊 MEXC Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

async function testExchangeFactory() {
  console.log('\n🧪 Testing Exchange Factory...\n');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Test 1: Get supported exchanges
    const supported = ExchangeFactory.getSupportedExchanges();
    if (supported.includes('paper') && supported.includes('mexc')) {
      console.log(`✅ Test 1: Get supported exchanges (${supported.join(', ')})`);
      passed++;
    } else {
      console.log('❌ Test 1: Get supported exchanges failed');
      failed++;
    }
    
    // Test 2: Create from env (should default to paper)
    const exchange = ExchangeFactory.createFromEnv();
    if (exchange) {
      console.log(`✅ Test 2: Create from env (${exchange.name})`);
      passed++;
    } else {
      console.log('❌ Test 2: Create from env failed');
      failed++;
    }
    
  } catch (error) {
    console.log(`❌ Factory test error: ${error.message}`);
    failed++;
  }
  
  console.log(`\n📊 Factory Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// Run all tests
(async () => {
  console.log('🚀 Starting Exchange Adapter Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    factory: await testExchangeFactory(),
    paper: await testPaperTrading(),
    mexc: await testMEXC()
  };
  
  console.log('=' .repeat(60));
  console.log('\n📊 Final Results:\n');
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${test}`);
  }
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '🎉' : '💥'} Overall: ${allPassed ? 'SUCCESS' : 'FAILED'}\n`);
  
  process.exit(allPassed ? 0 : 1);
})();
