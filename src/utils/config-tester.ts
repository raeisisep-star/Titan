// TITAN Trading System - Configuration Testing Utilities
// Test and validate all configuration settings

import { ConfigManager, getConfig, validateConfig } from '../config/environment';
import { SecretsManager, getSecrets, validateSecrets } from '../config/secrets-manager';

export interface ConfigTestResult {
  category: string;
  name: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: any;
}

export class ConfigTester {
  private results: ConfigTestResult[] = [];
  private config: any;
  private secrets: SecretsManager;

  constructor(env: any) {
    try {
      this.config = getConfig(env);
      this.secrets = getSecrets(env);
    } catch (error) {
      this.results.push({
        category: 'initialization',
        name: 'config_load',
        status: 'error',
        message: `Failed to load configuration: ${error}`,
      });
    }
  }

  // Run all configuration tests
  public async runAllTests(): Promise<ConfigTestResult[]> {
    this.results = [];

    // Test basic configuration
    this.testBasicConfig();
    
    // Test security settings
    this.testSecurityConfig();
    
    // Test API integrations
    await this.testAPIConnections();
    
    // Test notification services
    await this.testNotificationServices();
    
    // Test exchange connections
    await this.testExchangeConnections();
    
    // Test AI services
    await this.testAIServices();
    
    // Test feature flags
    this.testFeatureFlags();

    return this.results;
  }

  private testBasicConfig(): void {
    try {
      const validation = validateConfig();
      
      if (validation.isValid) {
        this.results.push({
          category: 'basic',
          name: 'config_validation',
          status: 'success',
          message: 'Configuration validation passed',
        });
      } else {
        validation.errors.forEach(error => {
          this.results.push({
            category: 'basic',
            name: 'config_validation',
            status: 'error',
            message: error,
          });
        });
      }

      // Test environment detection
      this.results.push({
        category: 'basic',
        name: 'environment',
        status: 'info',
        message: `Environment: ${this.config.environment}`,
        details: {
          debugMode: this.config.debugMode,
          port: this.config.port,
        },
      });

    } catch (error) {
      this.results.push({
        category: 'basic',
        name: 'config_test',
        status: 'error',
        message: `Configuration test failed: ${error}`,
      });
    }
  }

  private testSecurityConfig(): void {
    try {
      const secretsValidation = validateSecrets(this.config.environment);
      
      if (secretsValidation.isValid) {
        this.results.push({
          category: 'security',
          name: 'secrets_validation',
          status: 'success',
          message: 'All required secrets are configured',
        });
      }

      // Report missing secrets
      secretsValidation.missing.forEach(missing => {
        this.results.push({
          category: 'security',
          name: 'missing_secret',
          status: 'error',
          message: `Missing required secret: ${missing}`,
        });
      });

      // Report warnings
      secretsValidation.warnings.forEach(warning => {
        this.results.push({
          category: 'security',
          name: 'secret_warning',
          status: 'warning',
          message: warning,
        });
      });

      // Test JWT secret strength
      const jwtSecret = this.secrets.getSecret('jwtSecret');
      if (jwtSecret.length < 32) {
        this.results.push({
          category: 'security',
          name: 'jwt_secret_strength',
          status: 'warning',
          message: 'JWT secret is too short (recommended: 32+ characters)',
        });
      } else {
        this.results.push({
          category: 'security',
          name: 'jwt_secret_strength',
          status: 'success',
          message: 'JWT secret meets security requirements',
        });
      }

    } catch (error) {
      this.results.push({
        category: 'security',
        name: 'security_test',
        status: 'error',
        message: `Security test failed: ${error}`,
      });
    }
  }

  private async testAPIConnections(): Promise<void> {
    // Test external API reachability
    const apiTests = [
      { name: 'OpenAI API', url: 'https://api.openai.com/v1/models', requiresAuth: true },
      { name: 'Binance API', url: 'https://api.binance.com/api/v3/ping', requiresAuth: false },
      { name: 'CoinGecko API', url: 'https://api.coingecko.com/api/v3/ping', requiresAuth: false },
      { name: 'CoinMarketCap API', url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map', requiresAuth: true },
    ];

    for (const apiTest of apiTests) {
      try {
        const response = await fetch(apiTest.url, {
          method: 'GET',
          headers: apiTest.requiresAuth ? {} : {},
        });

        if (response.ok || response.status === 401) {
          // 401 is OK for authenticated endpoints without keys
          this.results.push({
            category: 'api',
            name: apiTest.name.toLowerCase().replace(' ', '_'),
            status: 'success',
            message: `${apiTest.name} is reachable`,
            details: { status: response.status },
          });
        } else {
          this.results.push({
            category: 'api',
            name: apiTest.name.toLowerCase().replace(' ', '_'),
            status: 'warning',
            message: `${apiTest.name} returned status ${response.status}`,
          });
        }
      } catch (error) {
        this.results.push({
          category: 'api',
          name: apiTest.name.toLowerCase().replace(' ', '_'),
          status: 'error',
          message: `Cannot reach ${apiTest.name}: ${error}`,
        });
      }
    }
  }

  private async testNotificationServices(): Promise<void> {
    const notifications = this.secrets.getConfiguredNotifications();
    
    notifications.forEach(notification => {
      this.results.push({
        category: 'notifications',
        name: notification.service,
        status: notification.configured ? 'success' : 'warning',
        message: notification.configured 
          ? `${notification.service} is configured` 
          : `${notification.service} is not configured`,
        details: notification.details,
      });
    });

    // Test SMTP configuration
    if (this.config.notifications.smtp.user) {
      this.results.push({
        category: 'notifications',
        name: 'smtp_config',
        status: 'info',
        message: `SMTP configured with ${this.config.notifications.smtp.host}:${this.config.notifications.smtp.port}`,
        details: {
          host: this.config.notifications.smtp.host,
          port: this.config.notifications.smtp.port,
          secure: this.config.notifications.smtp.secure,
          user: this.config.notifications.smtp.user,
        },
      });
    }
  }

  private async testExchangeConnections(): Promise<void> {
    const exchanges = this.secrets.getConfiguredExchanges();
    
    if (exchanges.length === 0) {
      this.results.push({
        category: 'exchanges',
        name: 'no_exchanges',
        status: 'warning',
        message: 'No exchange APIs are configured',
      });
      return;
    }

    for (const exchange of exchanges) {
      // Test basic connectivity (without authentication for now)
      let testUrl = '';
      switch (exchange.name) {
        case 'binance':
          testUrl = this.config.exchanges.binance.testnet 
            ? 'https://testnet.binance.vision/api/v3/ping'
            : 'https://api.binance.com/api/v3/ping';
          break;
        case 'coinbase':
          testUrl = this.config.exchanges.coinbase.sandbox
            ? 'https://api-public.sandbox.pro.coinbase.com/time'
            : 'https://api.pro.coinbase.com/time';
          break;
        case 'kucoin':
          testUrl = this.config.exchanges.kucoin.sandbox
            ? 'https://openapi-sandbox.kucoin.com/api/v1/timestamp'
            : 'https://api.kucoin.com/api/v1/timestamp';
          break;
      }

      if (testUrl) {
        try {
          const response = await fetch(testUrl);
          if (response.ok) {
            this.results.push({
              category: 'exchanges',
              name: `${exchange.name}_connectivity`,
              status: 'success',
              message: `${exchange.name} API is reachable`,
              details: { 
                testnet: exchange.name === 'binance' ? this.config.exchanges.binance.testnet : undefined,
                sandbox: exchange.name !== 'binance' ? (exchange.name === 'coinbase' ? this.config.exchanges.coinbase.sandbox : this.config.exchanges.kucoin.sandbox) : undefined,
              },
            });
          } else {
            this.results.push({
              category: 'exchanges',
              name: `${exchange.name}_connectivity`,
              status: 'warning',
              message: `${exchange.name} API returned status ${response.status}`,
            });
          }
        } catch (error) {
          this.results.push({
            category: 'exchanges',
            name: `${exchange.name}_connectivity`,
            status: 'error',
            message: `Cannot reach ${exchange.name} API: ${error}`,
          });
        }
      }

      // Report API key configuration
      this.results.push({
        category: 'exchanges',
        name: `${exchange.name}_config`,
        status: 'info',
        message: `${exchange.name} API keys are configured`,
        details: {
          hasApiKey: !!exchange.apiKey,
          hasSecret: !!exchange.secretKey,
          hasPassphrase: !!exchange.passphrase,
        },
      });
    }
  }

  private async testAIServices(): Promise<void> {
    const aiProviders = this.secrets.getConfiguredAIKeys();
    
    if (aiProviders.length === 0) {
      this.results.push({
        category: 'ai',
        name: 'no_ai_providers',
        status: 'warning',
        message: 'No AI providers are configured',
      });
      return;
    }

    for (const provider of aiProviders) {
      this.results.push({
        category: 'ai',
        name: `${provider.provider}_config`,
        status: 'success',
        message: `${provider.provider} API key is configured`,
        details: {
          provider: provider.provider,
          keyLength: provider.apiKey.length,
        },
      });

      // Test AI provider connectivity (basic test without actual API calls)
      let testEndpoint = '';
      switch (provider.provider) {
        case 'openai':
          testEndpoint = 'https://api.openai.com/v1/models';
          break;
        case 'anthropic':
          testEndpoint = 'https://api.anthropic.com/v1/messages';
          break;
        case 'google':
          // Google AI doesn't have a simple ping endpoint
          this.results.push({
            category: 'ai',
            name: 'google_connectivity',
            status: 'info',
            message: 'Google AI API key configured (connectivity test skipped)',
          });
          continue;
      }

      if (testEndpoint) {
        try {
          const response = await fetch(testEndpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${provider.apiKey}`,
            },
          });

          // 401 means the endpoint exists but key is invalid/missing permissions
          // 200 means success
          if (response.status === 200 || response.status === 401) {
            this.results.push({
              category: 'ai',
              name: `${provider.provider}_connectivity`,
              status: response.status === 200 ? 'success' : 'warning',
              message: response.status === 200 
                ? `${provider.provider} API is accessible and authenticated`
                : `${provider.provider} API is reachable (check API key permissions)`,
            });
          } else {
            this.results.push({
              category: 'ai',
              name: `${provider.provider}_connectivity`,
              status: 'warning',
              message: `${provider.provider} API returned status ${response.status}`,
            });
          }
        } catch (error) {
          this.results.push({
            category: 'ai',
            name: `${provider.provider}_connectivity`,
            status: 'error',
            message: `Cannot reach ${provider.provider} API: ${error}`,
          });
        }
      }
    }
  }

  private testFeatureFlags(): void {
    const features = this.config.features;
    
    Object.entries(features).forEach(([feature, enabled]) => {
      this.results.push({
        category: 'features',
        name: feature,
        status: 'info',
        message: `${feature}: ${enabled ? 'enabled' : 'disabled'}`,
      });
    });

    // Validate feature dependencies
    if (features.enableLiveTrading && this.secrets.getConfiguredExchanges().length === 0) {
      this.results.push({
        category: 'features',
        name: 'live_trading_dependency',
        status: 'error',
        message: 'Live trading is enabled but no exchange APIs are configured',
      });
    }

    if (features.enableAiPredictions && this.secrets.getConfiguredAIKeys().length === 0) {
      this.results.push({
        category: 'features',
        name: 'ai_predictions_dependency',
        status: 'error',
        message: 'AI predictions are enabled but no AI providers are configured',
      });
    }

    if (features.enableNotifications && this.secrets.getConfiguredNotifications().filter(n => n.configured).length === 0) {
      this.results.push({
        category: 'features',
        name: 'notifications_dependency',
        status: 'warning',
        message: 'Notifications are enabled but no notification services are configured',
      });
    }
  }

  // Get summary of test results
  public getTestSummary(): any {
    const summary = {
      total: this.results.length,
      success: this.results.filter(r => r.status === 'success').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      errors: this.results.filter(r => r.status === 'error').length,
      info: this.results.filter(r => r.status === 'info').length,
    };

    const categorySummary = this.results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = { success: 0, warning: 0, error: 0, info: 0 };
      }
      acc[result.category][result.status]++;
      return acc;
    }, {} as any);

    return {
      overall: summary,
      categories: categorySummary,
      isHealthy: summary.errors === 0,
      readinessScore: Math.round(((summary.success + summary.info) / summary.total) * 100),
    };
  }
}

// Helper functions for easy testing
export const testConfiguration = async (env: any): Promise<ConfigTestResult[]> => {
  const tester = new ConfigTester(env);
  return await tester.runAllTests();
};

export const getConfigurationHealth = async (env: any): Promise<{ healthy: boolean; score: number; summary: any }> => {
  const tester = new ConfigTester(env);
  await tester.runAllTests();
  const summary = tester.getTestSummary();
  
  return {
    healthy: summary.isHealthy,
    score: summary.readinessScore,
    summary,
  };
};