/**
 * TITAN Trading System - File-based JSON Secrets Provider
 * 
 * Reads secrets from a JSON file (e.g., /etc/titan/secrets.json)
 * Useful for future migration to file-based secrets storage
 * 
 * Example file structure:
 * {
 *   "JWT_SECRET": "...",
 *   "DATABASE_URL": "...",
 *   "REDIS_URL": "..."
 * }
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  SecretProvider,
  SecretValue,
  GetSecretOptions,
  SecretProviderType,
  SecretProviderError,
  SecretErrorCode,
} from './secret-provider.interface';

export interface FileJsonProviderConfig {
  filePath: string;
  cacheEnabled?: boolean;
  cacheTTLSeconds?: number;
  /**
   * Watch file for changes and auto-reload
   */
  watchFile?: boolean;
}

export class FileJsonProvider implements SecretProvider {
  private cache: Map<string, { value: SecretValue; expiresAt: number }> = new Map();
  private cacheEnabled: boolean;
  private cacheTTL: number;
  private filePath: string;
  private secrets: Record<string, string> = {};
  private lastLoadTime: number = 0;
  private watchFile: boolean;
  private fileWatcher?: fs.FSWatcher;

  constructor(config: FileJsonProviderConfig) {
    this.filePath = config.filePath;
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.cacheTTL = (config.cacheTTLSeconds ?? 300) * 1000;
    this.watchFile = config.watchFile ?? false;
  }

  async initialize(): Promise<void> {
    await this.loadSecretsFile();

    if (this.watchFile) {
      await this.setupFileWatcher();
    }
  }

  private async loadSecretsFile(): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.secrets = JSON.parse(content);
      this.lastLoadTime = Date.now();

      // Clear cache on reload
      this.clearCache();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new SecretProviderError(
          `Secrets file not found: ${this.filePath}`,
          SecretErrorCode.NOT_FOUND,
          SecretProviderType.ENV_VARIABLES,
          error
        );
      } else if (error instanceof SyntaxError) {
        throw new SecretProviderError(
          `Invalid JSON in secrets file: ${this.filePath}`,
          SecretErrorCode.INVALID_CONFIGURATION,
          SecretProviderType.ENV_VARIABLES,
          error
        );
      }
      throw new SecretProviderError(
        `Failed to load secrets file: ${error.message}`,
        SecretErrorCode.PROVIDER_UNAVAILABLE,
        SecretProviderType.ENV_VARIABLES,
        error
      );
    }
  }

  private async setupFileWatcher(): Promise<void> {
    try {
      const { watch } = await import('fs');
      this.fileWatcher = watch(this.filePath, async (eventType) => {
        if (eventType === 'change') {
          console.log(`[FileJsonProvider] Secrets file changed, reloading...`);
          await this.loadSecretsFile();
        }
      });
    } catch (error) {
      console.warn('[FileJsonProvider] Failed to setup file watcher:', error);
    }
  }

  async getSecret(key: string, options?: GetSecretOptions): Promise<SecretValue> {
    // Check cache first
    if (this.cacheEnabled && !options?.bypassCache) {
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
    }

    // Reload file if cache is stale and not watching
    if (!this.watchFile && Date.now() - this.lastLoadTime > this.cacheTTL) {
      await this.loadSecretsFile();
    }

    const value = this.secrets[key];

    if (value === undefined) {
      throw new SecretProviderError(
        `Secret '${key}' not found in file: ${path.basename(this.filePath)}`,
        SecretErrorCode.NOT_FOUND,
        SecretProviderType.ENV_VARIABLES
      );
    }

    const secretValue: SecretValue = {
      value,
      metadata: {
        createdAt: new Date(this.lastLoadTime),
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
    try {
      await fs.access(this.filePath, fs.constants.R_OK);
      // Try to parse the file
      const content = await fs.readFile(this.filePath, 'utf-8');
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  getProviderType(): SecretProviderType {
    return SecretProviderType.ENV_VARIABLES; // Treated as env variables
  }

  invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reload secrets from file immediately
   */
  async reload(): Promise<void> {
    await this.loadSecretsFile();
  }

  /**
   * Stop file watcher
   */
  async dispose(): Promise<void> {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }
  }

  /**
   * Get all available keys
   */
  getAvailableKeys(): string[] {
    return Object.keys(this.secrets);
  }

  /**
   * Check if a specific key exists
   */
  hasSecret(key: string): boolean {
    return this.secrets[key] !== undefined;
  }
}
