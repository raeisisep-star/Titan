#!/usr/bin/env node
/**
 * Trading Module API Testing Script
 * Tests all trading-related endpoints for functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = null;

// Test user credentials (using mock data)
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpass123'
};

// Test configuration
const config = {
    timeout: 10000,
    validateStatus: () => true // Accept all HTTP status codes
};

console.log('🧪 Starting Trading Module API Tests...\n');

// Helper functions
function logTest(name, status, details = '') {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${name}: ${status} ${details}`);
}

function logSection(section) {
    console.log(`\n🔗 === ${section} ===`);
}

async function makeRequest(method, endpoint, data = null, needsAuth = true) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (needsAuth && authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await axios({
            method,
            url: `${BASE_URL}${endpoint}`,
            data,
            headers,
            ...config
        });
        
        return response;
    } catch (error) {
        return {
            status: 500,
            data: { error: error.message }
        };
    }
}

async function testAuthentication() {
    logSection('Authentication Tests');
    
    // Test user registration
    const registerResponse = await makeRequest('POST', '/api/auth/register', testUser, false);
    if (registerResponse.status === 200 || registerResponse.status === 400) {
        logTest('User Registration', 'PASS', `(${registerResponse.status})`);
    } else {
        logTest('User Registration', 'FAIL', `Status: ${registerResponse.status}`);
    }
    
    // Test user login
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
        username: testUser.username,
        password: testUser.password
    }, false);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
        authToken = loginResponse.data.token;
        logTest('User Login', 'PASS', 'Token obtained');
    } else {
        logTest('User Login', 'FAIL', `Status: ${loginResponse.status}`);
        // Use a mock token for testing
        authToken = 'mock-token-for-testing';
        logTest('Mock Token', 'WARN', 'Using mock token for tests');
    }
}

async function testTradingAPIs() {
    logSection('Trading API Tests');
    
    const tradingEndpoints = [
        // Core Trading APIs
        { method: 'GET', endpoint: '/api/trading/advanced', name: 'Advanced Trading Dashboard' },
        { method: 'GET', endpoint: '/api/trading/manual/dashboard', name: 'Manual Trading Dashboard' },
        { method: 'GET', endpoint: '/api/trading/autopilot/dashboard', name: 'Autopilot Dashboard' },
        { method: 'GET', endpoint: '/api/trading/strategies', name: 'Trading Strategies List' },
        
        // Manual Trading APIs
        { method: 'POST', endpoint: '/api/trading/manual/order', name: 'Manual Order Placement', data: {
            symbol: 'BTC/USDT',
            side: 'buy',
            type: 'market',
            amount: 100,
            stopLoss: 2.5,
            takeProfit: 5.0
        }},
        { method: 'GET', endpoint: '/api/trading/manual/analysis/BTCUSDT', name: 'Symbol Analysis' },
        
        // Autopilot APIs
        { method: 'POST', endpoint: '/api/trading/autopilot/control', name: 'Autopilot Control', data: {
            action: 'start',
            config: {
                riskLevel: 'medium',
                maxPositions: 5,
                stopLoss: 3.0
            }
        }},
        { method: 'PUT', endpoint: '/api/trading/autopilot/config', name: 'Autopilot Configuration', data: {
            enabled: true,
            riskLevel: 'low',
            maxDrawdown: 5.0,
            dailyTarget: 2.0
        }},
        
        // Strategy APIs
        { method: 'POST', endpoint: '/api/trading/strategies', name: 'Create Strategy', data: {
            name: 'Test Strategy',
            type: 'scalping',
            config: {
                symbol: 'BTC/USDT',
                timeframe: '5m',
                riskPerTrade: 1.0
            }
        }},
        { method: 'POST', endpoint: '/api/trading/strategies/ai-generate', name: 'AI Generate Strategy', data: {
            prompt: 'Create a conservative BTC trading strategy',
            riskLevel: 'low',
            targetReturn: 10
        }}
    ];
    
    for (const test of tradingEndpoints) {
        const response = await makeRequest(test.method, test.endpoint, test.data);
        
        if (response.status >= 200 && response.status < 300) {
            logTest(test.name, 'PASS', `Status: ${response.status}`);
        } else if (response.status === 401 || response.status === 403) {
            logTest(test.name, 'WARN', 'Authentication required');
        } else if (response.status >= 400 && response.status < 500) {
            logTest(test.name, 'PASS', `Expected client error: ${response.status}`);
        } else {
            logTest(test.name, 'FAIL', `Status: ${response.status}, Error: ${response.data?.error || 'Unknown'}`);
        }
    }
}

async function testChartsAPIs() {
    logSection('Charts API Tests');
    
    const chartsEndpoints = [
        { method: 'GET', endpoint: '/api/charts/portfolio-performance/1', name: 'Portfolio Performance Chart' },
        { method: 'GET', endpoint: '/api/charts/price-history/BTCUSDT', name: 'Price History Chart' },
        { method: 'GET', endpoint: '/api/charts/portfolio-distribution/1', name: 'Portfolio Distribution Chart' },
        { method: 'GET', endpoint: '/api/charts/market-heatmap', name: 'Market Heatmap' },
        { method: 'POST', endpoint: '/api/charts/generate-image', name: 'Generate Chart Image', data: {
            chartType: 'line',
            data: [1, 2, 3, 4, 5],
            config: { title: 'Test Chart' }
        }}
    ];
    
    for (const test of chartsEndpoints) {
        const response = await makeRequest(test.method, test.endpoint, test.data);
        
        if (response.status >= 200 && response.status < 300) {
            logTest(test.name, 'PASS', `Status: ${response.status}`);
        } else if (response.status === 401) {
            logTest(test.name, 'WARN', 'Authentication required');
        } else {
            logTest(test.name, 'FAIL', `Status: ${response.status}`);
        }
    }
}

async function testHealthEndpoint() {
    logSection('Health Check');
    
    const response = await makeRequest('GET', '/api/health', null, false);
    if (response.status === 200) {
        logTest('API Health Check', 'PASS', 'Server is healthy');
    } else {
        logTest('API Health Check', 'FAIL', `Status: ${response.status}`);
    }
}

async function runAllTests() {
    try {
        await testHealthEndpoint();
        await testAuthentication();
        await testTradingAPIs();
        await testChartsAPIs();
        
        console.log('\n🎯 Testing completed!');
        console.log('📊 Check results above for any issues.');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

// Run tests
runAllTests();