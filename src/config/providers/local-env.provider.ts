/**
 * TITAN Trading System - Local Environment Variables Provider
 * 
 * Reads secrets from process.env (loaded from .env via dotenv)
 * Simple, fast, suitable for development and single-server deployments
 */

import {
  SecretProvider,
  SecretValue,
  GetSecretOptions,
  SecretProviderType,
  SecretProviderError,
  SecretErrorCode,
} from './secret-provider.interface';

export class LocalEnvProvider implements SecretProvider {
  private cache: Map<string, { value: SecretValue; expiresAt: number }> = new Map();
  private cacheEnabled: boolean;
  private cacheTTL: number; // in milliseconds

  constructor(config?: { cacheEnabled?: boolean; cacheTTLSeconds?: number }) {
    this.cacheEnabled = config?.cacheEnabled ?? true;
    this.cacheTTL = (config?.cacheTTLSeconds ?? 300) * 1000; // default 5 min
  }

  async getSecret(key: string, options?: GetSecretOptions): Promise<SecretValue> {
    // Check cache first (unless bypassed)
    if (this.cacheEnabled && !options?.bypassCache) {
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
    }

    // Read from process.env
    const value = process.env[key];

    if (value === undefined) {
      throw new SecretProviderError(
        `Secret '${key}' not found in environment variables`,
        SecretErrorCode.NOT_FOUND,
        SecretProviderType.ENV_VARIABLES
      );
    }

    const secretValue: SecretValue = {
      value,
      metadata: {
        createdAt: new Date(),
      },
    };

    // Cache the result
    if (this.cacheEnabled) {
      this.cache.set(key, {
        value: secretValue,
        expiresAt: Date.now() + this.cacheTTL,
      });
    }

    return secretValue;
  }

  async getSecrets(keys: string[]): Promise<Map<string, SecretValue>> {
    const results = new Map<string, SecretValue>();
    const errors: string[] = [];

    for (const key of keys) {
      try {
        const value = await this.getSecret(key);
        results.set(key, value);
      } catch (error) {
        errors.push(key);
      }
    }

    if (errors.length > 0) {
      throw new SecretProviderError(
        `Failed to load ${errors.length} secret(s): ${errors.join(', ')}`,
        SecretErrorCode.NOT_FOUND,
        SecretProviderType.ENV_VARIABLES
      );
    }

    return results;
  }

  async healthCheck(): Promise<boolean> {
    // Always healthy - process.env is always available
    return true;
  }

  getProviderType(): SecretProviderType {
    return SecretProviderType.ENV_VARIABLES;
  }

  invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get all available env keys (for debugging, never log values!)
   */
  getAvailableKeys(): string[] {
    return Object.keys(process.env).filter((key) => {
      // Only include keys that look like config (not system env vars)
      return key.includes('_') || key.toUpperCase() === key;
    });
  }

  /**
   * Check if a specific key exists (without reading its value)
   */
  hasSecret(key: string): boolean {
    return process.env[key] !== undefined;
  }
}
