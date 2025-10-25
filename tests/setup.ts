// Jest setup file - loads test environment variables
// This file runs before all tests

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test file for test environment
const envPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envPath });

console.log('✅ Test environment loaded from .env.test');
console.log('   TEST_BASE_URL:', process.env.TEST_BASE_URL);
console.log('   DEMO_MODE:', process.env.DEMO_MODE);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   TEST_JWT length:', process.env.TEST_JWT?.length || 0, 'characters');
