/**
 * Log Masking Utility Tests
 * Tests for sensitive data masking
 */

const {
  maskString,
  maskObject,
  maskEmail,
  maskUrl,
  isSensitiveField
} = require('../utils/logMasking');

function assertEqual(actual, expected, testName) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✅ ${testName}`);
    return true;
  } else {
    console.log(`❌ ${testName}`);
    console.log(`   Expected: ${JSON.stringify(expected)}`);
    console.log(`   Actual:   ${JSON.stringify(actual)}`);
    return false;
  }
}

function runTests() {
  console.log('🧪 Running Log Masking Tests\n');
  console.log('=' .repeat(60) + '\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Mask String
  console.log('Test 1: String Masking\n');
  passed += assertEqual(
    maskString('secret123456789', 4),
    'secr********6789',
    'Mask long string'
  ) ? 1 : 0;
  
  passed += assertEqual(
    maskString('abc', 4),
    '***',
    'Mask short string'
  ) ? 1 : 0;
  
  console.log('');
  
  // Test 2: Sensitive Field Detection
  console.log('Test 2: Sensitive Field Detection\n');
  passed += assertEqual(
    isSensitiveField('api_key'),
    true,
    'Detect api_key'
  ) ? 1 : 0;
  
  passed += assertEqual(
    isSensitiveField('Bearer_token'),
    true,
    'Detect Bearer_token'
  ) ? 1 : 0;
  
  passed += assertEqual(
    isSensitiveField('password'),
    true,
    'Detect password'
  ) ? 1 : 0;
  
  passed += assertEqual(
    isSensitiveField('email'),
    true,
    'Detect email'
  ) ? 1 : 0;
  
  passed += assertEqual(
    isSensitiveField('username'),
    false,
    'Ignore non-sensitive field'
  ) ? 1 : 0;
  
  console.log('');
  
  // Test 3: Email Masking
  console.log('Test 3: Email Masking\n');
  passed += assertEqual(
    maskEmail('john.doe@example.com'),
    'j*******e@example.com',
    'Mask email address'
  ) ? 1 : 0;
  
  passed += assertEqual(
    maskEmail('ab@example.com'),
    '**@example.com',
    'Mask short email'
  ) ? 1 : 0;
  
  console.log('');
  
  // Test 4: Object Masking
  console.log('Test 4: Object Masking\n');
  
  const sensitiveData = {
    username: 'john_doe',
    api_key: 'sk_live_1234567890abcdef',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    email: 'john@example.com',
    phone: '+1234567890',
    balance: 1000.50
  };
  
  const masked = maskObject(sensitiveData);
  
  // Check that sensitive fields are masked
  const apiKeyMasked = masked.api_key.includes('****');
  const tokenMasked = masked.token.includes('****');
  const emailMasked = masked.email.includes('*');
  const phoneMasked = masked.phone.includes('****');
  
  // Check that non-sensitive fields are preserved
  const usernamePreserved = masked.username === 'john_doe';
  const balancePreserved = masked.balance === 1000.50;
  
  passed += assertEqual(
    apiKeyMasked && tokenMasked && emailMasked && phoneMasked,
    true,
    'Sensitive fields are masked'
  ) ? 1 : 0;
  
  passed += assertEqual(
    usernamePreserved && balancePreserved,
    true,
    'Non-sensitive fields preserved'
  ) ? 1 : 0;
  
  console.log('');
  
  // Test 5: Nested Object Masking
  console.log('Test 5: Nested Object Masking\n');
  
  const nestedData = {
    user: {
      name: 'John',
      credentials: {
        api_key: 'secret123',
        password: 'mypassword'
      }
    }
  };
  
  const maskedNested = maskObject(nestedData);
  
  const nestedApiKeyMasked = maskedNested.user.credentials.api_key.includes('****');
  const nestedPasswordMasked = maskedNested.user.credentials.password.includes('****');
  const nestedNamePreserved = maskedNested.user.name === 'John';
  
  passed += assertEqual(
    nestedApiKeyMasked && nestedPasswordMasked && nestedNamePreserved,
    true,
    'Nested object masking works'
  ) ? 1 : 0;
  
  console.log('');
  
  // Test 6: Array Masking
  console.log('Test 6: Array Masking\n');
  
  const arrayData = [
    { api_key: 'key1', value: 100 },
    { api_key: 'key2', value: 200 }
  ];
  
  const maskedArray = maskObject(arrayData);
  
  const firstMasked = maskedArray[0].api_key.includes('****');
  const secondMasked = maskedArray[1].api_key.includes('****');
  const valuesPreserved = maskedArray[0].value === 100 && maskedArray[1].value === 200;
  
  passed += assertEqual(
    firstMasked && secondMasked && valuesPreserved,
    true,
    'Array masking works'
  ) ? 1 : 0;
  
  console.log('');
  
  // Test 7: URL Masking
  console.log('Test 7: URL Masking\n');
  
  const urlWithSecrets = 'https://api.example.com/data?api_key=secret123&user=john';
  const maskedUrlResult = maskUrl(urlWithSecrets);
  
  const urlApiKeyMasked = maskedUrlResult.includes('****') && !maskedUrlResult.includes('secret123');
  const urlUserPreserved = maskedUrlResult.includes('user=john');
  
  passed += assertEqual(
    urlApiKeyMasked && urlUserPreserved,
    true,
    'URL query parameter masking works'
  ) ? 1 : 0;
  
  console.log('');
  
  // Summary
  console.log('=' .repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  
  return passed > 0 && failed === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
