/**
 * TITAN Trading System - Hybrid Secrets Provider
 * 
 * Strategy: Try ENV first, fallback to File JSON if not found
 * Production default: LocalEnv + FileJson fallback
 */

import {
  SecretProvider,
  SecretValue,
  GetSecretOptions,
  SecretProviderType,
  SecretProviderError,
  SecretErrorCode,
} from './secret-provider.interface';
import { LocalEnvProvider } from './local-env.provider';
import { FileJsonProvider } from './file-json.provider';

export interface HybridProviderConfig {
  primaryProvider: SecretProvider;
  fallbackProvider?: SecretProvider;
  /**
   * If true, throw error immediately if primary fails
   * If false, try fallback provider
   */
  strictMode?: boolean;
  cacheEnabled?: boolean;
  cacheTTLSeconds?: number;
}

export class HybridProvider implements SecretProvider {
  private primary: SecretProvider;
  private fallback?: SecretProvider;
  private strictMode: boolean;
  private cache: Map<string, { value: SecretValue; expiresAt: number; source: string }> = new Map();
  private cacheEnabled: boolean;
  private cacheTTL: number;

  constructor(config: HybridProviderConfig) {
    this.primary = config.primaryProvider;
    this.fallback = config.fallbackProvider;
    this.strictMode = config.strictMode ?? false;
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.cacheTTL = (config.cacheTTLSeconds ?? 300) * 1000;
  }

  async getSecret(key: string, options?: GetSecretOptions): Promise<SecretValue> {
    // Check cache first
    if (this.cacheEnabled && !options?.bypassCache) {
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
    }

    let lastError: Error | undefined;

    // Try primary provider
    try {
      const value = await this.primary.getSecret(key, options);
      this.cacheResult(key, value, 'primary');
      return value;
    } catch (error) {
      lastError = error as Error;

      if (this.strictMode || !this.fallback) {
        throw error;
      }
    }

    // Try fallback provider
    if (this.fallback) {
      try {
        const value = await this.fallback.getSecret(key, options);
        this.cacheResult(key, value, 'fallback');
        return value;
      } catch (error) {
        // Both providers failed
        throw new SecretProviderError(
          `Secret '${key}' not found in primary or fallback providers. Primary error: ${lastError?.message}`,
          SecretErrorCode.NOT_FOUND,
          SecretProviderType.HYBRID,
          lastError
        );
      }
    }

    // No fallback and primary failed
    throw lastError!;
  }

  private cacheResult(key: string, value: SecretValue, source: string): void {
    if (this.cacheEnabled) {
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + this.cacheTTL,
        source,
      });
    }
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
        SecretProviderType.HYBRID
      );
    }

    return results;
  }

  async healthCheck(): Promise<boolean> {
    const primaryHealthy = await this.primary.healthCheck();

    if (this.strictMode) {
      return primaryHealthy;
    }

    if (primaryHealthy) {
      return true;
    }

    // Check fallback if primary is unhealthy
    if (this.fallback) {
      return await this.fallback.healthCheck();
    }

    return false;
  }

  getProviderType(): SecretProviderType {
    return SecretProviderType.HYBRID;
  }

  invalidateCache(key: string): void {
    this.cache.delete(key);
    this.primary.invalidateCache(key);
    this.fallback?.invalidateCache(key);
  }

  clearCache(): void {
    this.cache.clear();
    this.primary.clearCache();
    this.fallback?.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    bySource: { primary: number; fallback: number };
  } {
    const bySource = { primary: 0, fallback: 0 };
    for (const entry of this.cache.values()) {
      if (entry.source === 'primary') {
        bySource.primary++;
      } else {
        bySource.fallback++;
      }
    }

    return {
      size: this.cache.size,
      bySource,
    };
  }

  /**
   * Get provider summary for debugging
   */
  getProviderSummary(): {
    primary: string;
    fallback: string | null;
    strictMode: boolean;
    cacheSize: number;
  } {
    return {
      primary: this.primary.getProviderType(),
      fallback: this.fallback?.getProviderType() ?? null,
      strictMode: this.strictMode,
      cacheSize: this.cache.size,
    };
  }
}

/**
 * Factory function to create default hybrid provider for production
 */
export function createProductionHybridProvider(config?: {
  fileJsonPath?: string;
  strictMode?: boolean;
}): HybridProvider {
  const envProvider = new LocalEnvProvider({
    cacheEnabled: true,
    cacheTTLSeconds: 300, // 5 minutes
  });

  let fileProvider: FileJsonProvider | undefined;
  if (config?.fileJsonPath) {
    fileProvider = new FileJsonProvider({
      filePath: config.fileJsonPath,
      cacheEnabled: true,
      cacheTTLSeconds: 300,
      watchFile: false, // Don't watch in production
    });
  }

  return new HybridProvider({
    primaryProvider: envProvider,
    fallbackProvider: fileProvider,
    strictMode: config?.strictMode ?? false,
    cacheEnabled: true,
    cacheTTLSeconds: 300,
  });
}
