// TITAN Trading System - Configuration Testing API
// API endpoints for testing and validating system configuration

import { Hono } from 'hono';
import { testConfiguration, getConfigurationHealth } from '../../utils/config-tester';
import { getConfigSummary, validateConfig } from '../../config/environment';
import { getSecrets } from '../../config/secrets-manager';

const app = new Hono();

// Get configuration health check
app.get('/health', async (c) => {
  try {
    const env = c.env;
    const health = await getConfigurationHealth(env);
    
    return c.json({
      success: true,
      data: {
        healthy: health.healthy,
        readinessScore: health.score,
        summary: health.summary,
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Configuration health check failed: ${error}`,
    }, 500);
  }
});

// Run full configuration tests
app.get('/test', async (c) => {
  try {
    const env = c.env;
    const results = await testConfiguration(env);
    
    const summary = results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {} as any);

    return c.json({
      success: true,
      data: {
        results: summary,
        totalTests: results.length,
        summary: {
          success: results.filter(r => r.status === 'success').length,
          warnings: results.filter(r => r.status === 'warning').length,
          errors: results.filter(r => r.status === 'error').length,
          info: results.filter(r => r.status === 'info').length,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Configuration test failed: ${error}`,
    }, 500);
  }
});

// Get configuration summary (safe for logging)
app.get('/summary', async (c) => {
  try {
    const env = c.env;
    const configSummary = getConfigSummary(env);
    const secrets = getSecrets(env);
    const secretsSummary = secrets.getSecretsSummary();
    
    return c.json({
      success: true,
      data: {
        configuration: configSummary,
        secrets: secretsSummary,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get configuration summary: ${error}`,
    }, 500);
  }
});

// Validate current configuration
app.get('/validate', async (c) => {
  try {
    const env = c.env;
    const configValidation = validateConfig(env);
    const secrets = getSecrets(env);
    const environment = env.NODE_ENV || 'development';
    const secretsValidation = secrets.validateSecrets(environment as any);
    
    return c.json({
      success: true,
      data: {
        configuration: configValidation,
        secrets: secretsValidation,
        environment,
        overall: {
          isValid: configValidation.isValid && secretsValidation.isValid,
          hasWarnings: secretsValidation.warnings.length > 0,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Configuration validation failed: ${error}`,
    }, 500);
  }
});

// Get environment info (safe)
app.get('/environment', async (c) => {
  try {
    const env = c.env;
    
    // Safe environment info (no sensitive data)
    const envInfo = {
      nodeEnv: env.NODE_ENV || 'development',
      cloudflareAccount: env.CLOUDFLARE_ACCOUNT_ID ? 'configured' : 'not_set',
      runtime: typeof env.CLOUDFLARE_ACCOUNT_ID === 'string' ? 'cloudflare-workers' : 'local-development',
      timestamp: new Date().toISOString(),
      userAgent: c.req.header('user-agent'),
    };

    return c.json({
      success: true,
      data: envInfo,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get environment info: ${error}`,
    }, 500);
  }
});

// Test specific service connectivity
app.post('/test/:service', async (c) => {
  try {
    const service = c.req.param('service');
    const env = c.env;
    
    // This would contain specific tests for each service
    // For now, return a placeholder response
    
    const serviceTests: { [key: string]: () => Promise<any> } = {
      'openai': async () => {
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
          return { configured: false, message: 'OpenAI API key not configured' };
        }
        
        try {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });
          
          return {
            configured: true,
            reachable: response.ok,
            status: response.status,
            message: response.ok ? 'OpenAI API is accessible' : `API returned status ${response.status}`,
          };
        } catch (error) {
          return {
            configured: true,
            reachable: false,
            message: `Connection failed: ${error}`,
          };
        }
      },
      
      'binance': async () => {
        const apiKey = env.BINANCE_API_KEY;
        const testnet = env.BINANCE_TESTNET === 'true';
        const baseUrl = testnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
        
        try {
          const response = await fetch(`${baseUrl}/api/v3/ping`);
          return {
            configured: !!apiKey,
            reachable: response.ok,
            testnet,
            message: response.ok ? `Binance API is accessible (${testnet ? 'testnet' : 'mainnet'})` : `API returned status ${response.status}`,
          };
        } catch (error) {
          return {
            configured: !!apiKey,
            reachable: false,
            message: `Connection failed: ${error}`,
          };
        }
      },
      
      'telegram': async () => {
        const botToken = env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          return { configured: false, message: 'Telegram bot token not configured' };
        }
        
        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
          const data = await response.json();
          
          return {
            configured: true,
            reachable: response.ok,
            message: response.ok ? `Telegram bot is accessible: ${data.result?.username}` : `API returned error: ${data.description}`,
          };
        } catch (error) {
          return {
            configured: true,
            reachable: false,
            message: `Connection failed: ${error}`,
          };
        }
      },
    };
    
    if (!serviceTests[service]) {
      return c.json({
        success: false,
        error: `Unknown service: ${service}. Available services: ${Object.keys(serviceTests).join(', ')}`,
      }, 400);
    }
    
    const testResult = await serviceTests[service]();
    
    return c.json({
      success: true,
      data: {
        service,
        result: testResult,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: `Service test failed: ${error}`,
    }, 500);
  }
});

export default app;