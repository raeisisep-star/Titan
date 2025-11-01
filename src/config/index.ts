/**
 * Main configuration module for TITAN Trading System
 * Validates environment variables on startup using Zod schema
 */
import 'dotenv/config';
import { validateEnv, type Env } from './schema';

/**
 * Validated environment configuration
 * This will throw an error and exit if validation fails
 */
let env: Env;

try {
  env = validateEnv(process.env);
  console.log('✅ Environment variables validated successfully');
  console.log(`📌 NODE_ENV: ${env.NODE_ENV}`);
  console.log(`📌 PORT: ${env.PORT}`);
  console.log(`📌 DATABASE: ${env.DATABASE_URL.split('@')[1] || 'configured'}`);
  console.log(`📌 REDIS: ${env.REDIS_URL ? 'configured' : 'not configured'}`);
  console.log(`📌 EXCHANGE: ${env.EXCHANGE_NAME}`);
} catch (error) {
  console.error('❌ Environment validation failed!');
  console.error('Please check your .env file and ensure all required variables are set.');
  console.error('See .env.example for reference.');
  process.exit(1);
}

/**
 * Export validated environment configuration
 */
export { env };
export default env;
