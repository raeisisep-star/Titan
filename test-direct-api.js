const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production-2024';
const BASE_URL = 'http://localhost:5000';

async function testAPIs() {
  // Get real user from database
  const pool = new Pool({
    connectionString: 'postgresql://titan_user:Titan@2024!Strong@localhost:5433/titan_trading'
  });
  
  try {
    const result = await pool.query('SELECT id FROM users LIMIT 1');
    if (result.rows.length === 0) {
      console.log('No users found');
      return;
    }
    
    const userId = result.rows[0].id;
    console.log('Using user:', userId);
    
    // Generate token
    const token = jwt.sign({ userId, email: 'test@example.com', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    
    // Test 1: Place order
    console.log('\n[Test 1] Placing order...');
    const orderRes = await fetch(`${BASE_URL}/api/manual-trading/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symbol: 'BTCUSDT',
        side: 'buy',
        qty: 0.001,
        type: 'market'
      })
    });
    
    const orderData = await orderRes.json();
    console.log('Status:', orderRes.status);
    console.log('Response:', JSON.stringify(orderData, null, 2));
    
    if (orderRes.status === 429) {
      console.log('\nRate limited! Waiting 65 seconds...');
      await new Promise(resolve => setTimeout(resolve, 65000));
      console.log('Retrying...');
      
      const retryRes = await fetch(`${BASE_URL}/api/manual-trading/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          side: 'buy',
          qty: 0.001,
          type: 'market'
        })
      });
      
      const retryData = await retryRes.json();
      console.log('Retry Status:', retryRes.status);
      console.log('Retry Response:', JSON.stringify(retryData, null, 2));
    }
    
  } finally {
    await pool.end();
  }
}

testAPIs().catch(console.error);
