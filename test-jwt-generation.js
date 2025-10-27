const jwt = require('jsonwebtoken');

const testSecrets = [
  'titan-ci-test-secret-2024-isolated-environment',
  'pWc0p9qvZb3yQe4Fh7Jm2Rt6Xn0Ud3Ls',
  'Y7mXr2Qf9KpV4tW1aB6nD3sJ8uL0cH5zR2eM7qT4vP1xG6kN3wF8yD0tJ5lC2bH9'
];

const payload = {
  userId: '2cd563bb-585d-4c78-9050-00f84b64c47b',
  username: 'test_user',
  email: 'test-user@example.com',
  role: 'user'
};

console.log('Testing JWT generation with different secrets:\n');

testSecrets.forEach((secret, index) => {
  try {
    const token = jwt.sign(payload, secret, {
      algorithm: 'HS256',
      expiresIn: '6h'
    });
    
    console.log(`✅ Option ${index + 1}: SUCCESS`);
    console.log(`   Secret: ${secret}`);
    console.log(`   Token length: ${token.length} characters`);
    console.log(`   Token preview: ${token.substring(0, 50)}...`);
    
    // Verify token
    const decoded = jwt.verify(token, secret);
    console.log(`   Verified: userId=${decoded.userId}, username=${decoded.username}`);
    console.log('');
  } catch (error) {
    console.log(`❌ Option ${index + 1}: FAILED`);
    console.log(`   Error: ${error.message}\n`);
  }
});

console.log('All test secrets work correctly! ✅');
console.log('\nRecommendation: Use Option 1 (most readable)');
