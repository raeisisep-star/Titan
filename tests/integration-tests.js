/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 INTEGRATION TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive integration tests for TITAN Trading System
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'https://www.zala.ir';
const TEST_USER = {
  username: 'testuser',
  email: 'test@titan.com',
  password: 'test123'
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper functions
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n🧪 Testing: ${name}...`);
  
  try {
    await testFn();
    testResults.passed++;
    testResults.details.push({ name, status: 'PASS', error: null });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

async function apiCall(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (data) {
    config.data = data;
  }
  
  const response = await axios(config);
  return response.data;
}

// Test Suite
async function runIntegrationTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TITAN TRADING SYSTEM - INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  
  let authToken = null;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('\n📌 AUTHENTICATION TESTS');
  
  await runTest('User Registration', async () => {
    const result = await apiCall('POST', '/api/auth/register', {
      username: TEST_USER.username + Date.now(),
      email: `test${Date.now()}@titan.com`,
      password: TEST_USER.password,
      name: 'Test User'
    });
    
    if (!result.success) {
      throw new Error('Registration failed');
    }
  });
  
  await runTest('User Login', async () => {
    const result = await apiCall('POST', '/api/auth/login', {
      username: 'analyticsuser',
      password: 'test123'
    });
    
    if (!result.success || !result.data.token) {
      throw new Error('Login failed');
    }
    
    authToken = result.data.token;
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MARKET DATA TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('\n📌 MARKET DATA TESTS');
  
  await runTest('Get Bitcoin Price', async () => {
    const result = await apiCall('GET', '/api/market/price/BTCUSDT');
    
    if (!result.success || !result.data.price) {
      throw new Error('Failed to get price');
    }
    
    console.log(`   BTC Price: $${result.data.price}`);
  });
  
  await runTest('Get Multiple Prices', async () => {
    const result = await apiCall('GET', '/api/market/prices?symbols=BTCUSDT,ETHUSDT');
    
    if (!result.success || !result.data.prices || result.data.prices.length < 2) {
      throw new Error('Failed to get multiple prices');
    }
  });
  
  await runTest('Get 24h Ticker', async () => {
    const result = await apiCall('GET', '/api/market/ticker/BTCUSDT');
    
    if (!result.success || !result.data.symbol) {
      throw new Error('Failed to get ticker');
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('\n📌 ANALYTICS TESTS');
  
  await runTest('Get Portfolio Performance', async () => {
    const result = await apiCall('GET', '/api/analytics/portfolio/performance?timeframe=30d', null, authToken);
    
    if (!result.success || !result.data.current) {
      throw new Error('Failed to get portfolio performance');
    }
    
    console.log(`   Total Value: $${result.data.current.totalValue}`);
  });
  
  await runTest('Get Trading Stats', async () => {
    const result = await apiCall('GET', '/api/analytics/trading/stats?timeframe=30d', null, authToken);
    
    if (!result.success || result.data.totalTrades === undefined) {
      throw new Error('Failed to get trading stats');
    }
  });
  
  await runTest('System Health Check', async () => {
    const result = await apiCall('GET', '/api/analytics/system/health');
    
    if (!result.success || result.data.status !== 'healthy') {
      throw new Error('System health check failed');
    }
    
    console.log(`   Database: ${result.data.database.connected ? '✅' : '❌'}`);
  });
  
  await runTest('Dashboard Summary', async () => {
    const result = await apiCall('GET', '/api/analytics/dashboard?timeframe=30d', null, authToken);
    
    if (!result.success || !result.data.portfolio) {
      throw new Error('Failed to get dashboard summary');
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AI TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('\n📌 AI CHATBOT TESTS');
  
  await runTest('AI Chat Response', async () => {
    const result = await apiCall('POST', '/api/ai/chat/real', {
      message: 'What is Bitcoin?'
    }, authToken);
    
    if (!result.success || !result.data.response) {
      throw new Error('AI chat failed');
    }
    
    console.log(`   Response length: ${result.data.response.length} chars`);
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTOPILOT TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('\n📌 AUTOPILOT TESTS');
  
  await runTest('Get Autopilot Status', async () => {
    const result = await apiCall('GET', '/api/autopilot/status', null, authToken);
    
    if (!result.success) {
      throw new Error('Failed to get autopilot status');
    }
  });
  
  await runTest('Calculate Position Size', async () => {
    const result = await apiCall('POST', '/api/autopilot/calculate-position', {
      symbol: 'BTCUSDT',
      entryPrice: 100000,
      stopLoss: 95000,
      riskPerTrade: 0.02
    }, authToken);
    
    if (!result.success || !result.data.positionSize) {
      throw new Error('Failed to calculate position size');
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BACKTESTING TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('\n📌 BACKTESTING TESTS');
  
  await runTest('Get Backtest History', async () => {
    const result = await apiCall('GET', '/api/backtest/history?limit=10', null, authToken);
    
    if (!result.success || !result.data.backtests) {
      throw new Error('Failed to get backtest history');
    }
    
    console.log(`   Total backtests: ${result.data.count}`);
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Failed: ${testResults.failed}/${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log('═══════════════════════════════════════════════════════════');
  
  // Save results to file
  const fs = require('fs');
  fs.writeFileSync(
    '/tmp/webapp/Titan/tests/test-results.json',
    JSON.stringify(testResults, null, 2)
  );
  
  console.log('\n💾 Results saved to tests/test-results.json');
  console.log(`🕐 Completed: ${new Date().toISOString()}`);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

module.exports = { runIntegrationTests };
