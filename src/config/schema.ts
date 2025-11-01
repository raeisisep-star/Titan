import { z } from 'zod';

/**
 * Environment Schema with Zod validation
 * Ensures runtime environment variable validation before server startup
 */
export const EnvSchema = z.object({
  // Server Configuration
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('production'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('*'),

  // Database Configuration (PostgreSQL)
  DATABASE_URL: z.string().url().describe('PostgreSQL connection string'),
  DB_HOST: z.string().min(1).optional(),
  DB_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  DB_USER: z.string().min(1).optional(),
  DB_PASSWORD: z.string().min(8).optional(),
  DB_NAME: z.string().min(1).optional(),

  // Redis Configuration
  REDIS_URL: z
    .string()
    .url()
    .optional()
    .describe('Redis connection string (optional)'),

  // JWT Configuration
  JWT_SECRET: z
    .string()
    .min(32)
    .describe('Strong JWT secret (minimum 32 characters)'),

  // Rate Limiting Configuration
  RATE_LIMIT_BACKEND: z.enum(['memory', 'redis']).default('memory'),
  RATE_LIMIT_DEFAULT_POINTS: z.coerce.number().int().min(1).default(60),
  RATE_LIMIT_DEFAULT_DURATION: z.coerce.number().int().min(1).default(60),
  RATE_LIMIT_DEFAULT_BLOCK_MS: z.coerce.number().int().min(0).default(0),
  RATE_LIMIT_BURST_POINTS: z.coerce.number().int().min(1).default(10),
  RATE_LIMIT_BURST_DURATION: z.coerce.number().int().min(1).default(5),

  // Exchange Configuration
  EXCHANGE_NAME: z.enum(['paper', 'mexc']).default('paper'),
  MEXC_API_KEY: z.string().optional(),
  MEXC_API_SECRET: z.string().optional(),
  MEXC_BASE_URL: z.string().url().default('https://api.mexc.com'),

  // Logging
  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
  DEBUG_RATE_LIMIT: z
    .string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .default('false'),
  DEBUG_IDEMPOTENCY: z
    .string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .default('false'),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Validate environment variables
 * @throws {ZodError} if validation fails
 */
export function validateEnv(env: NodeJS.ProcessEnv): Env {
  const result = EnvSchema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    throw new Error('Environment validation failed');
  }

  return result.data;
}
