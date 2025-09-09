// TITAN Trading System - Environment Configuration Manager
// Centralized configuration management for all environments

export interface TitanConfig {
  // Environment
  environment: 'development' | 'staging' | 'production';
  debugMode: boolean;
  port: number;

  // API Keys - External Services
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };

  anthropic: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };

  google: {
    apiKey: string;
    model: string;
  };

  // Exchange APIs
  exchanges: {
    binance: {
      apiKey: string;
      secretKey: string;
      testnet: boolean;
    };
    coinbase: {
      apiKey: string;
      secret: string;
      passphrase: string;
      sandbox: boolean;
    };
    kucoin: {
      apiKey: string;
      secretKey: string;
      passphrase: string;
      sandbox: boolean;
    };
  };

  // Notification Services
  notifications: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
      fromEmail: string;
      fromName: string;
    };
    telegram: {
      botToken: string;
      chatId: string;
    };
    sms: {
      apiKey: string;
      sender: string;
    };
    discord: {
      webhookUrl: string;
    };
  };

  // Security Settings
  security: {
    jwtSecret: string;
    jwtExpiry: string;
    sessionSecret: string;
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };

  // Market Data Providers
  marketData: {
    coingecko: {
      apiKey: string;
    };
    coinmarketcap: {
      apiKey: string;
    };
    alphaVantage: {
      apiKey: string;
    };
  };

  // Feature Flags
  features: {
    enableLiveTrading: boolean;
    enableAiPredictions: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableBackupAutomation: boolean;
  };

  // Trading Settings
  trading: {
    maxConcurrentTrades: number;
    defaultRiskPercentage: number;
    emergencyStopLoss: number;
  };

  // AI Settings
  ai: {
    confidenceThreshold: number;
    fallbackProvider: string;
    rateLimit: number;
  };

  // System Settings
  system: {
    maintenanceMode: boolean;
    healthCheckInterval: number;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: TitanConfig;

  private constructor(env: any) {
    this.config = this.loadConfig(env);
  }

  public static getInstance(env?: any): ConfigManager {
    if (!ConfigManager.instance) {
      if (!env) {
        throw new Error('Environment object required for first initialization');
      }
      ConfigManager.instance = new ConfigManager(env);
    }
    return ConfigManager.instance;
  }

  public getConfig(): TitanConfig {
    return this.config;
  }

  private loadConfig(env: any): TitanConfig {
    // Helper function to get environment variable with fallback
    const getEnvVar = (key: string, defaultValue?: string, required: boolean = false): string => {
      const value = env[key] || defaultValue || '';
      if (required && !value) {
        throw new Error(`Environment variable ${key} is required but not set`);
      }
      return value;
    };

    // Helper function to get boolean environment variable
    const getEnvBool = (key: string, defaultValue: boolean = false): boolean => {
      const value = env[key];
      if (value === undefined) return defaultValue;
      return value.toLowerCase() === 'true' || value === '1';
    };

    // Helper function to get number environment variable
    const getEnvNumber = (key: string, defaultValue?: number): number => {
      const value = env[key];
      if (value === undefined) {
        if (defaultValue === undefined) {
          throw new Error(`Environment variable ${key} is required but not set`);
        }
        return defaultValue;
      }
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        throw new Error(`Environment variable ${key} must be a valid number`);
      }
      return parsed;
    };

    return {
      // Environment
      environment: (env.NODE_ENV || 'development') as 'development' | 'staging' | 'production',
      debugMode: getEnvBool('DEBUG_MODE', true),
      port: getEnvNumber('PORT', 3000),

      // API Keys - External Services
      openai: {
        apiKey: getEnvVar('OPENAI_API_KEY', '', false),
        model: getEnvVar('OPENAI_MODEL', 'gpt-4-turbo-preview', false),
        maxTokens: getEnvNumber('OPENAI_MAX_TOKENS', 2000),
      },

      anthropic: {
        apiKey: getEnvVar('ANTHROPIC_API_KEY', '', false),
        model: getEnvVar('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229', false),
        maxTokens: getEnvNumber('ANTHROPIC_MAX_TOKENS', 2000),
      },

      google: {
        apiKey: getEnvVar('GOOGLE_API_KEY', '', false),
        model: getEnvVar('GOOGLE_MODEL', 'gemini-1.5-pro-latest', false),
      },

      // Exchange APIs
      exchanges: {
        binance: {
          apiKey: getEnvVar('BINANCE_API_KEY', '', false),
          secretKey: getEnvVar('BINANCE_SECRET_KEY', '', false),
          testnet: getEnvBool('BINANCE_TESTNET', true),
        },
        coinbase: {
          apiKey: getEnvVar('COINBASE_API_KEY', '', false),
          secret: getEnvVar('COINBASE_SECRET', '', false),
          passphrase: getEnvVar('COINBASE_PASSPHRASE', '', false),
          sandbox: getEnvBool('COINBASE_SANDBOX', true),
        },
        kucoin: {
          apiKey: getEnvVar('KUCOIN_API_KEY', '', false),
          secretKey: getEnvVar('KUCOIN_SECRET_KEY', '', false),
          passphrase: getEnvVar('KUCOIN_PASSPHRASE', '', false),
          sandbox: getEnvBool('KUCOIN_SANDBOX', true),
        },
      },

      // Notification Services
      notifications: {
        smtp: {
          host: getEnvVar('SMTP_HOST', 'smtp.gmail.com', false),
          port: getEnvNumber('SMTP_PORT', 587),
          secure: getEnvBool('SMTP_SECURE', false),
          user: getEnvVar('SMTP_USER', '', false),
          pass: getEnvVar('SMTP_PASS', '', false),
          fromEmail: getEnvVar('FROM_EMAIL', 'noreply@titan-trading.com', false),
          fromName: getEnvVar('FROM_NAME', 'TITAN Trading System', false),
        },
        telegram: {
          botToken: getEnvVar('TELEGRAM_BOT_TOKEN', '', false),
          chatId: getEnvVar('TELEGRAM_CHAT_ID', '', false),
        },
        sms: {
          apiKey: getEnvVar('KAVENEGAR_API_KEY', '', false),
          sender: getEnvVar('KAVENEGAR_SENDER', '', false),
        },
        discord: {
          webhookUrl: getEnvVar('DISCORD_WEBHOOK_URL', '', false),
        },
      },

      // Security Settings
      security: {
        jwtSecret: getEnvVar('JWT_SECRET', 'default-jwt-secret-change-in-production', false),
        jwtExpiry: getEnvVar('JWT_EXPIRY', '24h', false),
        sessionSecret: getEnvVar('SESSION_SECRET', 'default-session-secret-change-in-production', false),
        bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 12),
        rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
        rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
      },

      // Market Data Providers
      marketData: {
        coingecko: {
          apiKey: getEnvVar('COINGECKO_API_KEY', '', false),
        },
        coinmarketcap: {
          apiKey: getEnvVar('COINMARKETCAP_API_KEY', '', false),
        },
        alphaVantage: {
          apiKey: getEnvVar('ALPHA_VANTAGE_API_KEY', '', false),
        },
      },

      // Feature Flags
      features: {
        enableLiveTrading: getEnvBool('ENABLE_LIVE_TRADING', false),
        enableAiPredictions: getEnvBool('ENABLE_AI_PREDICTIONS', true),
        enableNotifications: getEnvBool('ENABLE_NOTIFICATIONS', true),
        enableAnalytics: getEnvBool('ENABLE_ANALYTICS', true),
        enableBackupAutomation: getEnvBool('ENABLE_BACKUP_AUTOMATION', true),
      },

      // Trading Settings
      trading: {
        maxConcurrentTrades: getEnvNumber('MAX_CONCURRENT_TRADES', 50),
        defaultRiskPercentage: getEnvNumber('DEFAULT_RISK_PERCENTAGE', 2),
        emergencyStopLoss: getEnvNumber('EMERGENCY_STOP_LOSS', 10),
      },

      // AI Settings
      ai: {
        confidenceThreshold: parseFloat(getEnvVar('AI_CONFIDENCE_THRESHOLD', '0.75', false)),
        fallbackProvider: getEnvVar('AI_FALLBACK_PROVIDER', 'openai', false),
        rateLimit: getEnvNumber('AI_RATE_LIMIT', 60),
      },

      // System Settings
      system: {
        maintenanceMode: getEnvBool('SYSTEM_MAINTENANCE_MODE', false),
        healthCheckInterval: getEnvNumber('SYSTEM_HEALTH_CHECK_INTERVAL', 30),
      },
    };
  }

  // Validation methods
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.config;

    // Check required API keys based on feature flags
    if (config.features.enableAiPredictions) {
      if (!config.openai.apiKey && !config.anthropic.apiKey && !config.google.apiKey) {
        errors.push('At least one AI provider API key is required when AI predictions are enabled');
      }
    }

    if (config.features.enableLiveTrading) {
      if (!config.exchanges.binance.apiKey && !config.exchanges.coinbase.apiKey && !config.exchanges.kucoin.apiKey) {
        errors.push('At least one exchange API key is required when live trading is enabled');
      }
    }

    if (config.features.enableNotifications) {
      if (!config.notifications.smtp.user && !config.notifications.telegram.botToken && !config.notifications.sms.apiKey) {
        errors.push('At least one notification service must be configured when notifications are enabled');
      }
    }

    // Security validation
    if (config.environment === 'production') {
      if (config.security.jwtSecret === 'default-jwt-secret-change-in-production') {
        errors.push('JWT secret must be changed for production environment');
      }
      if (config.security.sessionSecret === 'default-session-secret-change-in-production') {
        errors.push('Session secret must be changed for production environment');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get configuration summary for logging
  public getConfigSummary(): any {
    const config = this.config;
    
    return {
      environment: config.environment,
      debugMode: config.debugMode,
      features: config.features,
      services: {
        openaiConfigured: !!config.openai.apiKey,
        anthropicConfigured: !!config.anthropic.apiKey,
        googleConfigured: !!config.google.apiKey,
        binanceConfigured: !!config.exchanges.binance.apiKey,
        coinbaseConfigured: !!config.exchanges.coinbase.apiKey,
        kucoinConfigured: !!config.exchanges.kucoin.apiKey,
        smtpConfigured: !!config.notifications.smtp.user,
        telegramConfigured: !!config.notifications.telegram.botToken,
        smsConfigured: !!config.notifications.sms.apiKey,
      },
    };
  }
}

// Export singleton instance getter
export const getConfig = (env?: any): TitanConfig => {
  return ConfigManager.getInstance(env).getConfig();
};

// Export validation function
export const validateConfig = (env?: any): { isValid: boolean; errors: string[] } => {
  return ConfigManager.getInstance(env).validateConfig();
};

// Export config summary function
export const getConfigSummary = (env?: any): any => {
  return ConfigManager.getInstance(env).getConfigSummary();
};