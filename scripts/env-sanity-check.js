#!/usr/bin/env node

/**
 * Environment Variables Sanity Check
 * Validates required environment variables for production/staging deployments
 */

const requiredVarsProduction = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
];

const requiredVarsStaging = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
];

const optionalVars = [
  'EXCHANGE_NAME',
  'RATE_LIMIT_BACKEND',
  'LOG_LEVEL',
];

function checkEnv(requiredVars, envName) {
  console.log(`\n🔍 Checking ${envName} environment variables...\n`);
  
  let missingCount = 0;
  let presentCount = 0;
  
  requiredVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      console.error(`  ❌ MISSING: ${varName}`);
      missingCount++;
    } else {
      // Mask sensitive values
      const value = process.env[varName];
      const masked = value.length > 10 
        ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
        : '***';
      console.log(`  ✅ ${varName}: ${masked}`);
      presentCount++;
    }
  });
  
  console.log(`\n📊 Optional variables:`);
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      const value = process.env[varName];
      console.log(`  ℹ️  ${varName}: ${value}`);
    } else {
      console.log(`  ⚠️  ${varName}: not set (optional)`);
    }
  });
  
  console.log(`\n📈 Summary: ${presentCount}/${requiredVars.length} required variables present`);
  
  if (missingCount > 0) {
    console.error(`\n❌ FAILED: ${missingCount} required variable(s) missing`);
    process.exit(1);
  } else {
    console.log(`\n✅ SUCCESS: All required variables present\n`);
    process.exit(0);
  }
}

// Detect environment
const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  checkEnv(requiredVarsProduction, 'Production');
} else if (nodeEnv === 'staging') {
  checkEnv(requiredVarsStaging, 'Staging');
} else {
  console.log(`\nℹ️  Environment: ${nodeEnv} (development mode)`);
  console.log('Skipping strict validation for development environment\n');
  process.exit(0);
}
