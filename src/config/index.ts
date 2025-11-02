/**
 * Main configuration module for TITAN Trading System
 * Validates environment variables on startup using Zod schema
 * Supports local secrets management via providers (ENV, File, Hybrid)
 */
import 'dotenv/config';
import { validateEnv, type Env } from './schema';
import { createProductionHybridProvider } from './providers/hybrid.provider';
import type { SecretProvider } from './providers/secret-provider.interface';

/**
 * Secrets Provider - supports multiple backends
 * Production default: Hybrid (ENV → File fallback)
 */
let secretProvider: SecretProvider | null = null;

try {
  // Initialize secrets provider for production
  if (process.env.NODE_ENV === 'production') {
    secretProvider = createProductionHybridProvider({
      fileJsonPath: process.env.SECRETS_FILE_PATH || '/etc/titan/secrets.json',
      strictMode: process.env.SECRETS_STRICT_MODE === 'true',
    });
    console.log('🔐 Secrets provider initialized:', secretProvider.getProviderType());
  }
} catch (error) {
  console.warn('⚠️  Failed to initialize secrets provider (falling back to ENV only)');
  console.warn('Error:', error instanceof Error ? error.message : 'Unknown error');
}

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
  
  // Validate secrets in production
  if (env.NODE_ENV === 'production') {
    const requiredSecrets = ['JWT_SECRET', 'DATABASE_URL'];
    const missingSecrets: string[] = [];
    
    for (const secret of requiredSecrets) {
      if (!process.env[secret] || process.env[secret]!.length < 8) {
        missingSecrets.push(secret);
      }
    }
    
    if (missingSecrets.length > 0) {
      throw new Error(`Missing required secrets in production: ${missingSecrets.join(', ')}`);
    }
    
    console.log('🔐 Production secrets validated');
  }
} catch (error) {
  console.error('❌ Environment validation failed!');
  
  if (error instanceof Error) {
    // Secure error message (don't expose secret names in production logs)
    if (process.env.NODE_ENV === 'production') {
      console.error('Configuration error: Missing or invalid required environment variables.');
      console.error('Please check your secrets file and ensure all required variables are set.');
    } else {
      console.error(error.message);
      console.error('Please check your .env file and ensure all required variables are set.');
      console.error('See .env.example for reference.');
    }
  }
  
  process.exit(1);
}

/**
 * Export validated environment configuration and secrets provider
 */
export { env, secretProvider };
export default env;
