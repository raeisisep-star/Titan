/**
 * TITAN Trading System - Secret Provider Interface
 * 
 * Abstraction layer for secret management supporting multiple backends:
 * - AWS Secrets Manager (production)
 * - Environment variables (.env for development)
 * - In-memory cache with TTL
 */

export interface SecretMetadata {
  version?: string;
  createdAt?: Date;
  lastRotated?: Date;
  rotationEnabled?: boolean;
}

export interface SecretValue {
  value: string;
  metadata?: SecretMetadata;
}

export interface SecretProvider {
  /**
   * Get a secret by key
   * @param key Secret identifier (e.g., 'JWT_SECRET', '/titan/prod/JWT_SECRET')
   * @param options Optional parameters for retrieval
   * @returns Promise resolving to secret value
   */
  getSecret(key: string, options?: GetSecretOptions): Promise<SecretValue>;

  /**
   * Get multiple secrets at once
   * @param keys Array of secret identifiers
   * @returns Promise resolving to key-value map
   */
  getSecrets(keys: string[]): Promise<Map<string, SecretValue>>;

  /**
   * Check if provider is available and properly configured
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get provider type identifier
   */
  getProviderType(): SecretProviderType;

  /**
   * Invalidate cache for a specific secret (if caching is enabled)
   */
  invalidateCache(key: string): void;

  /**
   * Clear all cached secrets
   */
  clearCache(): void;
}

export interface GetSecretOptions {
  /**
   * Bypass cache and fetch fresh value
   */
  bypassCache?: boolean;

  /**
   * Version ID (for versioned secret stores like AWS Secrets Manager)
   */
  versionId?: string;

  /**
   * Timeout for the operation in milliseconds
   */
  timeout?: number;
}

export enum SecretProviderType {
  AWS_SECRETS_MANAGER = 'aws-secrets-manager',
  ENV_VARIABLES = 'env-variables',
  HYBRID = 'hybrid', // AWS with .env fallback
}

export interface SecretProviderConfig {
  /**
   * Provider type to use
   */
  type: SecretProviderType;

  /**
   * AWS Secrets Manager configuration
   */
  aws?: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    /**
     * Prefix for secret names (e.g., '/titan/prod/')
     */
    secretPrefix?: string;
  };

  /**
   * Cache configuration
   */
  cache?: {
    enabled: boolean;
    /**
     * Time-to-live in seconds (default: 300 = 5 minutes)
     */
    ttl: number;
    /**
     * Maximum cache size (default: 100 secrets)
     */
    maxSize: number;
  };

  /**
   * Fallback to environment variables if AWS fetch fails
   */
  fallbackToEnv?: boolean;

  /**
   * Retry configuration
   */
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export class SecretProviderError extends Error {
  constructor(
    message: string,
    public readonly code: SecretErrorCode,
    public readonly provider: SecretProviderType,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SecretProviderError';
  }
}

export enum SecretErrorCode {
  NOT_FOUND = 'SECRET_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
}
