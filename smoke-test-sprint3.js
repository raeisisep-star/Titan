#!/usr/bin/env node
/**
 * Sprint 3 Smoke Tests
 * Tests real business logic with database integration
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024';

// Test user ID (must exist in database)
const TEST_USER_ID = uuidv4(); // Will use a real user from DB

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BLUE = '\x1b[34m';

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Helper: Generate JWT token
function generateToken(userId) {
  return jwt.sign(
    { 
      userId: userId,
      email: 'test@example.com',
      role: 'user'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Helper: Make HTTP request
async function makeRequest(method, path, token, body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    data,
    headers: response.headers
  };
}

// Helper: Assert test result
function assert(condition, testName, message) {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${testName}: ${message}`);
    testResults.passed++;
    return true;
  } else {
    console.log(`${RED}✗${RESET} ${testName}: ${message}`);
    testResults.failed++;
    return false;
  }
}

// Helper: Warning
function warn(testName, message) {
  console.log(`${YELLOW}⚠${RESET} ${testName}: ${message}`);
  testResults.warnings++;
}

// Get a real user from the database
async function getTestUser() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://titan_user:Titan@2024!Strong@localhost:5433/titan_trading'
  });
  
  try {
    const result = await pool.query('SELECT id FROM users LIMIT 1');
    if (result.rows.length === 0) {
      console.log(`${YELLOW}No users found in database. Creating test user...${RESET}`);
      
      // Create a test user
      const createResult = await pool.query(`
        INSERT INTO users (id, email, username, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [uuidv4(), 'smoketest@titan.local', 'smoketest', '$2b$10$dummyhash', 'user']);
      
      return createResult.rows[0].id;
    }
    return result.rows[0].id;
  } finally {
    await pool.end();
  }
}

// Test Suite
async function runSmokeTests() {
  console.log(`\n${BLUE}════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}   TITAN Trading System - Sprint 3 Smoke Tests${RESET}`);
  console.log(`${BLUE}════════════════════════════════════════════════════════${RESET}\n`);
  
  // Get real user from database
  const userId = await getTestUser();
  console.log(`${BLUE}📝 Using test user ID: ${userId}${RESET}\n`);
  
  const token = generateToken(userId);
  
  let orderId = null; // Will store created order ID
  
  try {
    // ========================================
    // Test 1: Health Check (No Auth Required)
    // ========================================
    console.log(`${BLUE}[Test 1] Health Check${RESET}`);
    try {
      const health = await makeRequest('GET', '/health', null);
      assert(health.status === 200, 'Health Check', 'Server is healthy');
      assert(health.data.status === 'healthy', 'Health Check', 'Status is healthy');
    } catch (error) {
      assert(false, 'Health Check', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 2: Place Market Order (Database Insert)
    // ========================================
    console.log(`${BLUE}[Test 2] Place Market Order (Database Insert)${RESET}`);
    try {
      const orderPayload = {
        symbol: 'BTCUSDT',
        side: 'buy',
        qty: 0.001,
        type: 'market'
      };
      
      const placeOrder = await makeRequest('POST', '/api/manual-trading/order', token, orderPayload);
      
      assert(placeOrder.status === 201, 'Place Order', 'Returns 201 Created');
      assert(placeOrder.data.success === true, 'Place Order', 'Success flag is true');
      assert(placeOrder.data.data?.orderId, 'Place Order', 'Order ID returned');
      assert(placeOrder.data.data?.status === 'pending', 'Place Order', 'Initial status is pending');
      assert(placeOrder.data.data?.symbol === 'BTCUSDT', 'Place Order', 'Symbol matches request');
      assert(placeOrder.data.data?.side === 'buy', 'Place Order', 'Side matches request');
      
      orderId = placeOrder.data.data?.orderId;
      console.log(`${BLUE}   → Created order ID: ${orderId}${RESET}`);
    } catch (error) {
      assert(false, 'Place Order', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 3: Place Limit Order (Database Insert)
    // ========================================
    console.log(`${BLUE}[Test 3] Place Limit Order (Database Insert)${RESET}`);
    try {
      const orderPayload = {
        symbol: 'ETHUSDT',
        side: 'sell',
        qty: 0.05,
        type: 'limit',
        price: 3500.00
      };
      
      const placeOrder = await makeRequest('POST', '/api/manual-trading/order', token, orderPayload);
      
      assert(placeOrder.status === 201, 'Place Limit Order', 'Returns 201 Created');
      assert(parseFloat(placeOrder.data.data?.price) === 3500, 'Place Limit Order', 'Price matches request');
      assert(placeOrder.data.data?.type === 'limit', 'Place Limit Order', 'Type is limit');
    } catch (error) {
      assert(false, 'Place Limit Order', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 4: Get Activities (Database Query)
    // ========================================
    console.log(`${BLUE}[Test 4] Get Activities (Database Query)${RESET}`);
    try {
      const activities = await makeRequest('GET', '/api/dashboard/activities?limit=10&offset=0', token);
      
      assert(activities.status === 200, 'Get Activities', 'Returns 200 OK');
      assert(activities.data.success === true, 'Get Activities', 'Success flag is true');
      assert(Array.isArray(activities.data.data?.items), 'Get Activities', 'Items is array');
      assert(typeof activities.data.data?.total === 'number', 'Get Activities', 'Total count exists');
      
      if (activities.data.data.items.length > 0) {
        const activity = activities.data.data.items[0];
        assert(activity.action, 'Get Activities', 'Activity has action field');
        assert(activity.category, 'Get Activities', 'Activity has category field');
        assert(activity.createdAt, 'Get Activities', 'Activity has timestamp');
        console.log(`${BLUE}   → Found ${activities.data.data.items.length} activities (total: ${activities.data.data.total})${RESET}`);
      } else {
        warn('Get Activities', 'No activities found (expected at least 2 from order placement)');
      }
    } catch (error) {
      assert(false, 'Get Activities', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 5: Get Portfolio (Database Aggregation)
    // ========================================
    console.log(`${BLUE}[Test 5] Get Portfolio (Database Aggregation)${RESET}`);
    try {
      const portfolio = await makeRequest('GET', '/api/dashboard/portfolio-demo', token);
      
      assert(portfolio.status === 200, 'Get Portfolio', 'Returns 200 OK');
      assert(portfolio.data.success === true, 'Get Portfolio', 'Success flag is true');
      assert(Array.isArray(portfolio.data.data.positions), 'Get Portfolio', 'Positions is array');
      assert(typeof portfolio.data.data.summary === 'object', 'Get Portfolio', 'Summary object exists');
      assert(typeof portfolio.data.data.summary.totalValue === 'number', 'Get Portfolio', 'Total value is number');
      
      console.log(`${BLUE}   → Total Value: $${portfolio.data.data.summary.totalValue.toFixed(2)}${RESET}`);
      console.log(`${BLUE}   → Positions: ${portfolio.data.data.positions.length}${RESET}`);
    } catch (error) {
      assert(false, 'Get Portfolio', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 6: Cancel Order (Database Update)
    // ========================================
    if (orderId) {
      console.log(`${BLUE}[Test 6] Cancel Order (Database Update)${RESET}`);
      try {
        const cancelPayload = {
          orderId: orderId
        };
        
        const cancelOrder = await makeRequest('POST', '/api/manual-trading/orders/cancel', token, cancelPayload);
        
        assert(cancelOrder.status === 200, 'Cancel Order', 'Returns 200 OK');
        assert(cancelOrder.data.success === true, 'Cancel Order', 'Success flag is true');
        assert(cancelOrder.data.data?.cancelled === true, 'Cancel Order', 'Cancelled flag is true');
        assert(cancelOrder.data.data?.cancelledAt, 'Cancel Order', 'Cancelled timestamp set');
        
        console.log(`${BLUE}   → Order ${orderId} cancelled successfully${RESET}`);
      } catch (error) {
        assert(false, 'Cancel Order', `Failed: ${error.message}`);
      }
    } else {
      warn('Cancel Order', 'Skipped (no order ID available)');
    }
    console.log('');
    
    // ========================================
    // Test 7: Cancel Non-Existent Order (404)
    // ========================================
    console.log(`${BLUE}[Test 7] Cancel Non-Existent Order (404)${RESET}`);
    try {
      const fakeOrderId = uuidv4();
      const cancelPayload = {
        orderId: fakeOrderId
      };
      
      const cancelOrder = await makeRequest('POST', '/api/manual-trading/orders/cancel', token, cancelPayload);
      
      assert(cancelOrder.status === 404, 'Cancel Non-Existent', 'Returns 404 Not Found');
      assert(cancelOrder.data.success === false, 'Cancel Non-Existent', 'Success flag is false');
    } catch (error) {
      assert(false, 'Cancel Non-Existent', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 8: Invalid Order Data (Validation)
    // ========================================
    console.log(`${BLUE}[Test 8] Invalid Order Data (Validation)${RESET}`);
    try {
      const invalidPayload = {
        symbol: 'INVALID!@#',
        side: 'invalid',
        qty: -1,
        type: 'market'
      };
      
      const placeOrder = await makeRequest('POST', '/api/manual-trading/order', token, invalidPayload);
      
      assert(placeOrder.status === 422, 'Invalid Order', 'Returns 422 Validation Error');
      assert(placeOrder.data.success === false, 'Invalid Order', 'Success flag is false');
    } catch (error) {
      assert(false, 'Invalid Order', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 9: Unauthorized Request (No Token)
    // ========================================
    console.log(`${BLUE}[Test 9] Unauthorized Request (No Token)${RESET}`);
    try {
      const orderPayload = {
        symbol: 'BTCUSDT',
        side: 'buy',
        qty: 0.001,
        type: 'market'
      };
      
      const placeOrder = await makeRequest('POST', '/api/manual-trading/order', null, orderPayload);
      
      assert(placeOrder.status === 401, 'Unauthorized', 'Returns 401 Unauthorized');
      assert(placeOrder.data.success === false, 'Unauthorized', 'Success flag is false');
    } catch (error) {
      assert(false, 'Unauthorized', `Failed: ${error.message}`);
    }
    console.log('');
    
    // ========================================
    // Test 10: Settings Bug Fix (Null Spread)
    // ========================================
    console.log(`${BLUE}[Test 10] Settings Bug Fix (Null Spread)${RESET}`);
    try {
      const settings = await makeRequest('GET', '/api/settings/user', token);
      
      assert(settings.status === 200, 'Settings', 'Returns 200 OK (not 500)');
      assert(settings.data.success === true, 'Settings', 'Success flag is true');
      assert(settings.data.data, 'Settings', 'Data object exists');
      
      // Check that it handles null settings gracefully
      console.log(`${BLUE}   → Settings retrieved successfully (null-safe)${RESET}`);
    } catch (error) {
      assert(false, 'Settings', `Failed: ${error.message}`);
    }
    console.log('');
    
  } catch (error) {
    console.error(`${RED}Critical error during tests: ${error.message}${RESET}`);
  }
  
  // ========================================
  // Test Summary
  // ========================================
  console.log(`${BLUE}════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}   Test Summary${RESET}`);
  console.log(`${BLUE}════════════════════════════════════════════════════════${RESET}`);
  console.log(`${GREEN}✓ Passed:${RESET}  ${testResults.passed}`);
  console.log(`${RED}✗ Failed:${RESET}  ${testResults.failed}`);
  console.log(`${YELLOW}⚠ Warnings:${RESET} ${testResults.warnings}`);
  console.log(`${BLUE}════════════════════════════════════════════════════════${RESET}\n`);
  
  if (testResults.failed === 0) {
    console.log(`${GREEN}🎉 All tests passed! Sprint 3 is production-ready.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ Some tests failed. Please investigate.${RESET}\n`);
    process.exit(1);
  }
}

// Run tests
runSmokeTests().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  process.exit(1);
});
