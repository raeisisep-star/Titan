// TITAN Trading System - Secrets Management for Production
// Secure handling of API keys and sensitive configuration

export interface SecretsConfig {
  // External API Keys
  openaiApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;

  // Exchange API Keys
  binanceApiKey: string;
  binanceSecretKey: string;
  coinbaseApiKey: string;
  coinbaseSecret: string;
  coinbasePassphrase: string;
  kucoinApiKey: string;
  kucoinSecretKey: string;
  kucoinPassphrase: string;

  // Notification Service Keys
  smtpPass: string;
  telegramBotToken: string;
  kavenegarApiKey: string;
  discordWebhookUrl: string;

  // Security Keys
  jwtSecret: string;
  sessionSecret: string;
  backupEncryptionKey: string;

  // Third-party Service Keys
  coingeckoApiKey: string;
  coinmarketcapApiKey: string;
  alphaVantageApiKey: string;
  sentryDsn: string;
}

export class SecretsManager {
  private static instance: SecretsManager;
  private secrets: Partial<SecretsConfig> = {};
  private isCloudflare: boolean;

  private constructor(env: any) {
    this.isCloudflare = typeof env?.CLOUDFLARE_ACCOUNT_ID === 'string';
    this.loadSecrets(env);
  }

  public static getInstance(env?: any): SecretsManager {
    if (!SecretsManager.instance) {
      if (!env) {
        throw new Error('Environment object required for first initialization');
      }
      SecretsManager.instance = new SecretsManager(env);
    }
    return SecretsManager.instance;
  }

  private loadSecrets(env: any): void {
    // In Cloudflare Workers, secrets are injected as environment variables
    // In local development, they come from .env or .dev.vars
    this.secrets = {
      // External AI API Keys
      openaiApiKey: env.OPENAI_API_KEY || '',
      anthropicApiKey: env.ANTHROPIC_API_KEY || '',
      googleApiKey: env.GOOGLE_API_KEY || '',

      // Exchange API Keys
      binanceApiKey: env.BINANCE_API_KEY || '',
      binanceSecretKey: env.BINANCE_SECRET_KEY || '',
      coinbaseApiKey: env.COINBASE_API_KEY || '',
      coinbaseSecret: env.COINBASE_SECRET || '',
      coinbasePassphrase: env.COINBASE_PASSPHRASE || '',
      kucoinApiKey: env.KUCOIN_API_KEY || '',
      kucoinSecretKey: env.KUCOIN_SECRET_KEY || '',
      kucoinPassphrase: env.KUCOIN_PASSPHRASE || '',

      // Notification Service Keys
      smtpPass: env.SMTP_PASS || '',
      telegramBotToken: env.TELEGRAM_BOT_TOKEN || '',
      kavenegarApiKey: env.KAVENEGAR_API_KEY || '',
      discordWebhookUrl: env.DISCORD_WEBHOOK_URL || '',

      // Security Keys
      jwtSecret: env.JWT_SECRET || this.generateFallbackSecret(),
      sessionSecret: env.SESSION_SECRET || this.generateFallbackSecret(),
      backupEncryptionKey: env.BACKUP_ENCRYPTION_KEY || this.generateFallbackSecret(),

      // Third-party Service Keys
      coingeckoApiKey: env.COINGECKO_API_KEY || '',
      coinmarketcapApiKey: env.COINMARKETCAP_API_KEY || '',
      alphaVantageApiKey: env.ALPHA_VANTAGE_API_KEY || '',
      sentryDsn: env.SENTRY_DSN || '',
    };
  }

  private generateFallbackSecret(): string {
    // Generate a secure fallback secret for development
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get individual secrets
  public getSecret(key: keyof SecretsConfig): string {
    return this.secrets[key] || '';
  }

  // Get all AI API keys that are configured
  public getConfiguredAIKeys(): { provider: string; apiKey: string }[] {
    const aiKeys: { provider: string; apiKey: string }[] = [];

    if (this.secrets.openaiApiKey) {
      aiKeys.push({ provider: 'openai', apiKey: this.secrets.openaiApiKey });
    }
    if (this.secrets.anthropicApiKey) {
      aiKeys.push({ provider: 'anthropic', apiKey: this.secrets.anthropicApiKey });
    }
    if (this.secrets.googleApiKey) {
      aiKeys.push({ provider: 'google', apiKey: this.secrets.googleApiKey });
    }

    return aiKeys;
  }

  // Get all exchange API keys that are configured
  public getConfiguredExchanges(): { name: string; apiKey: string; secretKey: string; passphrase?: string }[] {
    const exchanges: { name: string; apiKey: string; secretKey: string; passphrase?: string }[] = [];

    if (this.secrets.binanceApiKey && this.secrets.binanceSecretKey) {
      exchanges.push({
        name: 'binance',
        apiKey: this.secrets.binanceApiKey,
        secretKey: this.secrets.binanceSecretKey,
      });
    }

    if (this.secrets.coinbaseApiKey && this.secrets.coinbaseSecret && this.secrets.coinbasePassphrase) {
      exchanges.push({
        name: 'coinbase',
        apiKey: this.secrets.coinbaseApiKey,
        secretKey: this.secrets.coinbaseSecret,
        passphrase: this.secrets.coinbasePassphrase,
      });
    }

    if (this.secrets.kucoinApiKey && this.secrets.kucoinSecretKey && this.secrets.kucoinPassphrase) {
      exchanges.push({
        name: 'kucoin',
        apiKey: this.secrets.kucoinApiKey,
        secretKey: this.secrets.kucoinSecretKey,
        passphrase: this.secrets.kucoinPassphrase,
      });
    }

    return exchanges;
  }

  // Get all notification services that are configured
  public getConfiguredNotifications(): { service: string; configured: boolean; details?: any }[] {
    return [
      {
        service: 'smtp',
        configured: !!this.secrets.smtpPass,
        details: this.secrets.smtpPass ? { hasPassword: true } : undefined,
      },
      {
        service: 'telegram',
        configured: !!this.secrets.telegramBotToken,
        details: this.secrets.telegramBotToken ? { hasToken: true } : undefined,
      },
      {
        service: 'sms',
        configured: !!this.secrets.kavenegarApiKey,
        details: this.secrets.kavenegarApiKey ? { provider: 'kavenegar' } : undefined,
      },
      {
        service: 'discord',
        configured: !!this.secrets.discordWebhookUrl,
        details: this.secrets.discordWebhookUrl ? { hasWebhook: true } : undefined,
      },
    ];
  }

  // Validate that required secrets are present for a given environment
  public validateSecrets(environment: 'development' | 'staging' | 'production'): { isValid: boolean; missing: string[]; warnings: string[] } {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Required for all environments
    if (!this.secrets.jwtSecret || this.secrets.jwtSecret.length < 32) {
      if (environment === 'production') {
        missing.push('JWT_SECRET (must be at least 32 characters for production)');
      } else {
        warnings.push('JWT_SECRET is short or missing (auto-generated for development)');
      }
    }

    if (!this.secrets.sessionSecret || this.secrets.sessionSecret.length < 32) {
      if (environment === 'production') {
        missing.push('SESSION_SECRET (must be at least 32 characters for production)');
      } else {
        warnings.push('SESSION_SECRET is short or missing (auto-generated for development)');
      }
    }

    // Production-specific requirements
    if (environment === 'production') {
      // At least one AI provider required
      if (!this.secrets.openaiApiKey && !this.secrets.anthropicApiKey && !this.secrets.googleApiKey) {
        missing.push('At least one AI API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY)');
      }

      // At least one exchange for live trading
      const hasExchange = (this.secrets.binanceApiKey && this.secrets.binanceSecretKey) ||
                         (this.secrets.coinbaseApiKey && this.secrets.coinbaseSecret && this.secrets.coinbasePassphrase) ||
                         (this.secrets.kucoinApiKey && this.secrets.kucoinSecretKey && this.secrets.kucoinPassphrase);
      
      if (!hasExchange) {
        warnings.push('No exchange API keys configured - live trading will be disabled');
      }

      // At least one notification method
      const hasNotification = this.secrets.smtpPass || this.secrets.telegramBotToken || this.secrets.kavenegarApiKey;
      if (!hasNotification) {
        warnings.push('No notification services configured - alerts will be disabled');
      }

      // Backup encryption key
      if (!this.secrets.backupEncryptionKey) {
        missing.push('BACKUP_ENCRYPTION_KEY (required for secure backups in production)');
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
      warnings,
    };
  }

  // Get summary of configured services (without exposing actual keys)
  public getSecretsSummary(): any {
    const aiProviders = this.getConfiguredAIKeys().map(k => k.provider);
    const exchanges = this.getConfiguredExchanges().map(e => e.name);
    const notifications = this.getConfiguredNotifications().filter(n => n.configured).map(n => n.service);

    return {
      environment: this.isCloudflare ? 'cloudflare' : 'local',
      aiProviders: {
        configured: aiProviders,
        count: aiProviders.length,
      },
      exchanges: {
        configured: exchanges,
        count: exchanges.length,
      },
      notifications: {
        configured: notifications,
        count: notifications.length,
      },
      security: {
        jwtSecret: this.secrets.jwtSecret ? 'configured' : 'missing',
        sessionSecret: this.secrets.sessionSecret ? 'configured' : 'missing',
        backupEncryption: this.secrets.backupEncryptionKey ? 'configured' : 'missing',
      },
      marketData: {
        coingecko: this.secrets.coingeckoApiKey ? 'configured' : 'missing',
        coinmarketcap: this.secrets.coinmarketcapApiKey ? 'configured' : 'missing',
        alphaVantage: this.secrets.alphaVantageApiKey ? 'configured' : 'missing',
      },
    };
  }

  // Mask secrets for logging (show only first/last chars)
  public maskSecret(secret: string): string {
    if (!secret || secret.length < 8) {
      return secret ? '***masked***' : 'not_set';
    }
    
    const firstChars = secret.substring(0, 4);
    const lastChars = secret.substring(secret.length - 4);
    const maskedLength = secret.length - 8;
    
    return `${firstChars}${'*'.repeat(maskedLength)}${lastChars}`;
  }

  // Get masked summary for safe logging
  public getMaskedSummary(): any {
    return {
      openaiApiKey: this.maskSecret(this.secrets.openaiApiKey || ''),
      anthropicApiKey: this.maskSecret(this.secrets.anthropicApiKey || ''),
      googleApiKey: this.maskSecret(this.secrets.googleApiKey || ''),
      binanceApiKey: this.maskSecret(this.secrets.binanceApiKey || ''),
      coinbaseApiKey: this.maskSecret(this.secrets.coinbaseApiKey || ''),
      kucoinApiKey: this.maskSecret(this.secrets.kucoinApiKey || ''),
      telegramBotToken: this.maskSecret(this.secrets.telegramBotToken || ''),
      kavenegarApiKey: this.maskSecret(this.secrets.kavenegarApiKey || ''),
    };
  }
}

// Export singleton instance getter
export const getSecrets = (env?: any): SecretsManager => {
  return SecretsManager.getInstance(env);
};

// Export specific getters for common use cases
export const getSecret = (key: keyof SecretsConfig, env?: any): string => {
  return SecretsManager.getInstance(env).getSecret(key);
};

export const validateSecrets = (environment: 'development' | 'staging' | 'production', env?: any) => {
  return SecretsManager.getInstance(env).validateSecrets(environment);
};