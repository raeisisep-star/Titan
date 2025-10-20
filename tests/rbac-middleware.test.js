/**
 * TITAN Trading System - RBAC Middleware Tests
 * 
 * Purpose: Test Role-Based Access Control (RBAC) middleware
 * Phase: 4 - RBAC Implementation
 * 
 * Test Cases:
 * 1. Admin role accessing admin-only endpoint → 200 OK
 * 2. User role accessing admin-only endpoint → 403 Forbidden
 * 3. Any authenticated user accessing user endpoint → 200 OK
 * 4. Token without role accessing protected endpoint → 403 Forbidden
 */

const jwt = require('jsonwebtoken');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://www.zala.ir';
const JWT_SECRET = process.env.JWT_SECRET || 'your-production-jwt-secret-key-change-this';

/**
 * Generate JWT token with specific role
 */
function generateToken(userId, username, role) {
    return jwt.sign(
        {
            userId,
            username,
            email: `${username}@titan-trading.com`,
            role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

/**
 * Test helper function
 */
async function testEndpoint(testName, token, endpoint, expectedStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        const passed = response.status === expectedStatus;

        console.log(`\n${passed ? '✅' : '❌'} ${testName}`);
        console.log(`   Endpoint: ${endpoint}`);
        console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));

        return passed;
    } catch (error) {
        console.log(`\n❌ ${testName}`);
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

/**
 * Main test suite
 */
async function runTests() {
    console.log('='.repeat(80));
    console.log('TITAN RBAC Middleware Tests');
    console.log('='.repeat(80));
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    const results = [];

    // Generate tokens for different roles
    const adminToken = generateToken(
        '07b18b25-fc41-4a4f-8774-d19bd15350b5',
        'admin',
        'admin'
    );

    const userToken = generateToken(
        'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
        'user',
        'user'
    );

    const noRoleToken = jwt.sign(
        {
            userId: 'x1y2z3a4-b5c6-47d8-e9f0-a1b2c3d4e5f6',
            username: 'norole',
            email: 'norole@titan-trading.com'
            // Intentionally missing 'role' field
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    // Test Case 1: Admin accessing admin-only endpoint (should be 200)
    results.push(await testEndpoint(
        'Test 1: Admin → /api/admin/users',
        adminToken,
        '/api/admin/users',
        200
    ));

    // Test Case 2: Regular user accessing admin-only endpoint (should be 403)
    results.push(await testEndpoint(
        'Test 2: User → /api/admin/users',
        userToken,
        '/api/admin/users',
        403
    ));

    // Test Case 3: Admin accessing user profile endpoint (should be 200)
    results.push(await testEndpoint(
        'Test 3: Admin → /api/user/profile',
        adminToken,
        '/api/user/profile',
        200
    ));

    // Test Case 4: Regular user accessing user profile endpoint (should be 200)
    results.push(await testEndpoint(
        'Test 4: User → /api/user/profile',
        userToken,
        '/api/user/profile',
        200
    ));

    // Test Case 5: Token without role accessing admin endpoint (should be 403)
    results.push(await testEndpoint(
        'Test 5: No Role → /api/admin/stats',
        noRoleToken,
        '/api/admin/stats',
        403
    ));

    // Test Case 6: Regular user accessing admin stats endpoint (should be 403)
    results.push(await testEndpoint(
        'Test 6: User → /api/admin/stats',
        userToken,
        '/api/admin/stats',
        403
    ));

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('Test Summary');
    console.log('='.repeat(80));
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);
    console.log(`Failed: ${total - passed}/${total}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);
    console.log('='.repeat(80));

    // Exit with appropriate code
    process.exit(passed === total ? 0 : 1);
}

// Run tests if executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = { runTests, generateToken, testEndpoint };
