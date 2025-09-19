/**
 * TITAN Trading System - Error Handling & Validation API Routes
 * RESTful API endpoints for error management, validation, and system monitoring
 * 
 * Features:
 * - Error reporting and analytics
 * - Validation endpoint with real-time feedback
 * - System health monitoring
 * - Circuit breaker status and management
 * - Error pattern analysis and insights
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  errorHandlingService,
  TitanError,
  ErrorCategory,
  ErrorSeverity,
  CircuitBreakerState,
  ErrorMetrics
} from '../services/error-handling-service';
import {
  validationService,
  ValidationSchema,
  ValidationResult,
  ValidationType,
  ValidationSeverity
} from '../services/validation-service';

type Bindings = {
  DB: D1Database;
};

const errorValidationRoutes = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
errorValidationRoutes.use('/*', cors());

/**
 * ================================================
 * ERROR HANDLING ENDPOINTS
 * ================================================
 */

// Initialize error handling service
errorValidationRoutes.post('/errors/initialize', async (c) => {
  try {
    await errorHandlingService.initialize();
    
    return c.json({
      success: true,
      message: 'Error handling service initialized successfully'
    });
  } catch (error) {
    console.error('Failed to initialize error handling service:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Report error
errorValidationRoutes.post('/errors/report', async (c) => {
  try {
    const errorData = await c.req.json();
    
    // Create error context
    const context = {
      user_id: errorData.user_id,
      session_id: errorData.session_id,
      request_id: errorData.request_id,
      operation: errorData.operation || 'unknown',
      service: errorData.service || 'unknown',
      endpoint: errorData.endpoint,
      parameters: errorData.parameters,
      headers: errorData.headers,
      timestamp: Date.now(),
      additional_data: errorData.additional_data
    };

    let titanError: TitanError;

    if (errorData.is_titan_error) {
      // Reconstruct TitanError from JSON
      titanError = new TitanError(
        errorData.message,
        errorData.category as ErrorCategory,
        errorData.severity as ErrorSeverity,
        errorData.code,
        context,
        errorData.recoverable,
        errorData.user_message
      );
    } else {
      // Create new error from generic error data
      const error = new Error(errorData.message || 'Unknown error');
      if (errorData.stack) {
        error.stack = errorData.stack;
      }
      
      titanError = await errorHandlingService.handleError(error, context);
    }

    return c.json({
      success: true,
      error_id: titanError.id,
      message: 'Error reported and processed successfully',
      recovery_attempted: titanError.recovery_attempted,
      user_message: titanError.user_message
    });
  } catch (error) {
    console.error('Failed to report error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Get error metrics and analytics
errorValidationRoutes.get('/errors/metrics', async (c) => {
  try {
    const timeRange = {
      start: parseInt(c.req.query('start') || (Date.now() - 24 * 60 * 60 * 1000).toString()),
      end: parseInt(c.req.query('end') || Date.now().toString())
    };

    const metrics = errorHandlingService.getErrorMetrics(timeRange);
    
    return c.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Failed to get error metrics:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get error patterns
errorValidationRoutes.get('/errors/patterns', async (c) => {
  try {
    const patterns = errorHandlingService.getErrorPatterns();
    
    return c.json({
      success: true,
      patterns,
      count: patterns.length
    });
  } catch (error) {
    console.error('Failed to get error patterns:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get circuit breaker status
errorValidationRoutes.get('/errors/circuit-breakers', async (c) => {
  try {
    const circuitBreakers = errorHandlingService.getCircuitBreakerStatus();
    
    return c.json({
      success: true,
      circuit_breakers: circuitBreakers,
      count: circuitBreakers.length
    });
  } catch (error) {
    console.error('Failed to get circuit breaker status:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test circuit breaker for specific service
errorValidationRoutes.post('/errors/circuit-breakers/:service/test', async (c) => {
  try {
    const service = c.req.param('service');
    const isOpen = errorHandlingService.isCircuitBreakerOpen(service);
    
    return c.json({
      success: true,
      service,
      is_open: isOpen,
      message: isOpen ? 'Circuit breaker is OPEN' : 'Circuit breaker is CLOSED'
    });
  } catch (error) {
    console.error('Failed to test circuit breaker:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Record success for circuit breaker
errorValidationRoutes.post('/errors/circuit-breakers/:service/success', async (c) => {
  try {
    const service = c.req.param('service');
    errorHandlingService.recordSuccess(service);
    
    return c.json({
      success: true,
      message: `Success recorded for service: ${service}`
    });
  } catch (error) {
    console.error('Failed to record success:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Create specific error types (for testing and development)
errorValidationRoutes.post('/errors/create/:type', async (c) => {
  try {
    const errorType = c.req.param('type');
    const { message, context } = await c.req.json();
    
    let titanError: TitanError;
    
    switch (errorType) {
      case 'validation':
        titanError = errorHandlingService.createValidationError(
          message || 'Validation failed',
          context?.field,
          context?.value,
          context
        );
        break;
        
      case 'network':
        titanError = errorHandlingService.createNetworkError(
          message || 'Network error',
          context?.url,
          context?.statusCode,
          context
        );
        break;
        
      case 'exchange':
        titanError = errorHandlingService.createExchangeAPIError(
          message || 'Exchange API error',
          context?.exchange || 'binance',
          context?.endpoint,
          context
        );
        break;
        
      case 'rate_limit':
        titanError = errorHandlingService.createRateLimitError(
          message || 'Rate limit exceeded',
          context?.service || 'api',
          context?.resetTime,
          context
        );
        break;
        
      case 'auth':
        titanError = errorHandlingService.createAuthenticationError(
          message || 'Authentication failed',
          context
        );
        break;
        
      case 'database':
        titanError = errorHandlingService.createDatabaseError(
          message || 'Database error',
          context?.query,
          context
        );
        break;
        
      default:
        return c.json({
          success: false,
          error: `Unknown error type: ${errorType}`
        }, 400);
    }
    
    const processedError = await errorHandlingService.handleError(titanError);
    
    return c.json({
      success: true,
      error: processedError.toJSON(),
      message: 'Error created and processed successfully'
    });
  } catch (error) {
    console.error('Failed to create error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * ================================================
 * VALIDATION ENDPOINTS
 * ================================================
 */

// Validate data against schema
errorValidationRoutes.post('/validation/validate', async (c) => {
  try {
    const { data, schema_name, context, options } = await c.req.json();
    
    if (!data || !schema_name) {
      return c.json({
        success: false,
        error: 'Data and schema_name are required'
      }, 400);
    }
    
    const result = await validationService.validate(data, schema_name, context, options);
    
    return c.json({
      success: result.isValid,
      validation_result: result
    });
  } catch (error) {
    console.error('Failed to validate data:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Validate single field
errorValidationRoutes.post('/validation/validate-field', async (c) => {
  try {
    const { value, field_name, rules, context } = await c.req.json();
    
    if (field_name === undefined || !rules || !Array.isArray(rules)) {
      return c.json({
        success: false,
        error: 'field_name and rules array are required'
      }, 400);
    }
    
    const result = await validationService.validateField(value, field_name, rules, context);
    
    return c.json({
      success: result.isValid,
      validation_result: result
    });
  } catch (error) {
    console.error('Failed to validate field:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Register new validation schema
errorValidationRoutes.post('/validation/schemas', async (c) => {
  try {
    const schema = await c.req.json();
    
    // Validate schema structure
    if (!schema.name || !schema.version || !schema.fields) {
      return c.json({
        success: false,
        error: 'Schema must have name, version, and fields'
      }, 400);
    }
    
    validationService.registerSchema(schema as ValidationSchema);
    
    return c.json({
      success: true,
      message: `Schema '${schema.name}' registered successfully`
    });
  } catch (error) {
    console.error('Failed to register schema:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Get available validation schemas
errorValidationRoutes.get('/validation/schemas', async (c) => {
  try {
    // Mock response - in real implementation, get from service
    const schemas = [
      {
        name: 'user_registration',
        version: '1.0',
        description: 'User registration validation schema',
        fields_count: 3
      },
      {
        name: 'trading_order',
        version: '1.0',
        description: 'Trading order validation schema',
        fields_count: 4
      },
      {
        name: 'api_key_config',
        version: '1.0',
        description: 'API key configuration validation schema',
        fields_count: 3
      }
    ];
    
    return c.json({
      success: true,
      schemas,
      count: schemas.length
    });
  } catch (error) {
    console.error('Failed to get schemas:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test validation with sample data
errorValidationRoutes.post('/validation/test/:schemaName', async (c) => {
  try {
    const schemaName = c.req.param('schemaName');
    
    // Sample test data based on schema
    const testData: { [key: string]: any } = {
      user_registration: {
        email: 'test@example.com',
        password: 'TestPass123!',
        username: 'testuser'
      },
      trading_order: {
        symbol: 'BTCUSDT',
        amount: 0.001,
        price: 50000,
        exchange: 'binance'
      },
      api_key_config: {
        api_key: 'test_api_key_12345678901234567890123456789012',
        api_secret: 'test_api_secret_12345678901234567890123456789012',
        exchange_name: 'binance'
      }
    };
    
    const data = testData[schemaName];
    if (!data) {
      return c.json({
        success: false,
        error: `No test data available for schema: ${schemaName}`
      }, 404);
    }
    
    const result = await validationService.validate(data, schemaName, undefined, {
      includeWarnings: true
    });
    
    return c.json({
      success: true,
      test_data: data,
      validation_result: result,
      message: `Test validation completed for schema: ${schemaName}`
    });
  } catch (error) {
    console.error('Failed to test validation:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * ================================================
 * SYSTEM HEALTH ENDPOINTS
 * ================================================
 */

// Get comprehensive system health status
errorValidationRoutes.get('/health/comprehensive', async (c) => {
  try {
    // Get error metrics for last hour
    const errorMetrics = errorHandlingService.getErrorMetrics({
      start: Date.now() - 60 * 60 * 1000,
      end: Date.now()
    });
    
    const circuitBreakers = errorHandlingService.getCircuitBreakerStatus();
    const errorPatterns = errorHandlingService.getErrorPatterns();
    
    // Calculate health scores
    const errorRate = errorMetrics.error_rate;
    const recoveryRate = errorMetrics.recovery_success_rate;
    const openCircuitBreakers = circuitBreakers.filter(cb => cb.state === 'OPEN').length;
    
    // Determine overall health status
    let healthStatus = 'healthy';
    if (errorRate > 10 || openCircuitBreakers > 2) {
      healthStatus = 'critical';
    } else if (errorRate > 5 || openCircuitBreakers > 0) {
      healthStatus = 'degraded';
    } else if (errorRate > 1) {
      healthStatus = 'warning';
    }
    
    const healthReport = {
      overall_status: healthStatus,
      timestamp: Date.now(),
      error_metrics: {
        total_errors: errorMetrics.total_errors,
        error_rate: errorRate,
        recovery_success_rate: recoveryRate,
        critical_errors: errorMetrics.errors_by_severity?.critical || 0,
        high_errors: errorMetrics.errors_by_severity?.high || 0
      },
      circuit_breakers: {
        total: circuitBreakers.length,
        open: openCircuitBreakers,
        half_open: circuitBreakers.filter(cb => cb.state === 'HALF_OPEN').length,
        closed: circuitBreakers.filter(cb => cb.state === 'CLOSED').length
      },
      error_patterns: {
        total_patterns: errorPatterns.length,
        high_frequency_patterns: errorPatterns.filter(p => p.occurrence_count > 10).length,
        recent_patterns: errorPatterns.filter(p => (Date.now() - p.last_seen) < 60 * 60 * 1000).length
      },
      services_status: {
        error_handler: 'operational',
        validation_service: 'operational',
        circuit_breakers: openCircuitBreakers === 0 ? 'operational' : 'degraded'
      },
      recommendations: this.generateHealthRecommendations(errorRate, openCircuitBreakers, errorPatterns)
    };
    
    return c.json({
      success: true,
      health_report: healthReport
    });
  } catch (error) {
    console.error('Failed to get comprehensive health status:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get error trends analysis
errorValidationRoutes.get('/analytics/trends', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '7');
    const groupBy = c.req.query('groupBy') || 'hour'; // hour, day, category, service
    
    // Mock trend data - in real implementation, analyze historical data
    const trendData = {
      time_period: `Last ${days} days`,
      group_by: groupBy,
      trends: [
        {
          timestamp: Date.now() - 6 * 60 * 60 * 1000,
          error_count: 12,
          error_rate: 2.4,
          recovery_rate: 85.5,
          categories: {
            network: 5,
            validation: 4,
            exchange_api: 2,
            system: 1
          }
        },
        {
          timestamp: Date.now() - 5 * 60 * 60 * 1000,
          error_count: 8,
          error_rate: 1.6,
          recovery_rate: 92.3,
          categories: {
            network: 3,
            validation: 3,
            exchange_api: 1,
            system: 1
          }
        },
        {
          timestamp: Date.now() - 4 * 60 * 60 * 1000,
          error_count: 15,
          error_rate: 3.1,
          recovery_rate: 78.2,
          categories: {
            network: 8,
            validation: 2,
            exchange_api: 4,
            system: 1
          }
        }
      ],
      insights: [
        'Network errors show increasing trend - consider circuit breaker tuning',
        'Validation errors are decreasing - recent schema updates are effective',
        'Exchange API errors spike during high volatility periods',
        'Recovery rate is consistently above 75% - good system resilience'
      ]
    };
    
    return c.json({
      success: true,
      trend_analysis: trendData
    });
  } catch (error) {
    console.error('Failed to get error trends:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Generate system recommendations
function generateHealthRecommendations(errorRate: number, openCircuitBreakers: number, patterns: any[]): string[] {
  const recommendations: string[] = [];
  
  if (errorRate > 5) {
    recommendations.push('High error rate detected - review recent deployments and system changes');
  }
  
  if (openCircuitBreakers > 0) {
    recommendations.push(`${openCircuitBreakers} circuit breaker(s) open - check external service connectivity`);
  }
  
  if (patterns.filter(p => p.occurrence_count > 20).length > 0) {
    recommendations.push('High-frequency error patterns detected - consider implementing permanent fixes');
  }
  
  if (errorRate < 1 && openCircuitBreakers === 0) {
    recommendations.push('System health is optimal - maintain current monitoring practices');
  }
  
  return recommendations;
}

export default errorValidationRoutes;