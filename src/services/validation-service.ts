/**
 * TITAN Trading System - Advanced Validation Service
 * Comprehensive data validation with intelligent rules and real-time feedback
 * 
 * Features:
 * - Multi-layered validation (syntax, semantic, business logic)
 * - Real-time validation with debouncing
 * - Custom validation rules and schemas
 * - Internationalized error messages
 * - Performance-optimized validation chains
 * - Context-aware validation
 * - Integration with error handling system
 */

import { errorHandlingService, ErrorCategory } from './error-handling-service';

export enum ValidationType {
  REQUIRED = 'required',
  TYPE = 'type',
  FORMAT = 'format',
  RANGE = 'range',
  LENGTH = 'length',
  PATTERN = 'pattern',
  CUSTOM = 'custom',
  BUSINESS_RULE = 'business_rule',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface ValidationRule {
  type: ValidationType;
  severity: ValidationSeverity;
  message: string;
  params?: any;
  condition?: (value: any, context?: any) => boolean;
  validator?: (value: any, context?: any) => ValidationResult;
  dependencies?: string[]; // Fields this rule depends on
  async?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions?: string[];
  metadata?: any;
}

export interface ValidationError {
  field: string;
  type: ValidationType;
  severity: ValidationSeverity;
  message: string;
  code: string;
  value?: any;
  expected?: any;
  context?: any;
}

export interface ValidationSchema {
  name: string;
  version: string;
  fields: { [fieldName: string]: ValidationRule[] };
  businessRules?: BusinessRule[];
  context?: ValidationContext;
}

export interface BusinessRule {
  name: string;
  description: string;
  condition: string; // Expression or function name
  errorMessage: string;
  warningMessage?: string;
  severity: ValidationSeverity;
  enabled: boolean;
}

export interface ValidationContext {
  user_id?: number;
  user_role?: string;
  operation?: string;
  environment?: 'development' | 'staging' | 'production';
  request_context?: any;
  temporal_context?: {
    trading_hours?: boolean;
    market_open?: boolean;
    high_volatility?: boolean;
  };
}

export class ValidationService {
  private schemas = new Map<string, ValidationSchema>();
  private customValidators = new Map<string, Function>();
  private validationCache = new Map<string, { result: ValidationResult; timestamp: number }>();
  private businessRuleEngine: BusinessRuleEngine;

  constructor() {
    this.businessRuleEngine = new BusinessRuleEngine();
    this.setupBuiltInValidators();
    this.setupDefaultSchemas();
  }

  /**
   * Register validation schema
   */
  registerSchema(schema: ValidationSchema): void {
    this.schemas.set(schema.name, schema);
    console.log(`Validation schema registered: ${schema.name} v${schema.version}`);
  }

  /**
   * Register custom validator
   */
  registerValidator(name: string, validator: Function): void {
    this.customValidators.set(name, validator);
  }

  /**
   * Main validation method
   */
  async validate(
    data: any,
    schemaName: string,
    context?: ValidationContext,
    options?: {
      failFast?: boolean;
      includeWarnings?: boolean;
      useCache?: boolean;
      timeout?: number;
    }
  ): Promise<ValidationResult> {
    try {
      const schema = this.schemas.get(schemaName);
      if (!schema) {
        throw errorHandlingService.createValidationError(
          `Validation schema not found: ${schemaName}`,
          'schema',
          schemaName
        );
      }

      // Check cache if enabled
      if (options?.useCache) {
        const cached = this.getCachedResult(data, schemaName);
        if (cached) return cached;
      }

      const result = await this.executeValidation(data, schema, context, options);

      // Cache result if enabled
      if (options?.useCache && result.isValid) {
        this.cacheResult(data, schemaName, result);
      }

      return result;
    } catch (error) {
      console.error('Validation service error:', error);
      return {
        isValid: false,
        errors: [{
          field: '_system',
          type: ValidationType.CUSTOM,
          severity: ValidationSeverity.ERROR,
          message: 'Validation system error occurred',
          code: 'VALIDATION_SYSTEM_ERROR'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate single field
   */
  async validateField(
    value: any,
    fieldName: string,
    rules: ValidationRule[],
    context?: ValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const rule of rules) {
      try {
        const fieldResult = await this.executeFieldValidation(value, fieldName, rule, context);
        
        if (!fieldResult.isValid) {
          errors.push(...fieldResult.errors);
          warnings.push(...fieldResult.warnings);
        }
      } catch (error) {
        console.error(`Error validating field ${fieldName}:`, error);
        errors.push({
          field: fieldName,
          type: ValidationType.CUSTOM,
          severity: ValidationSeverity.ERROR,
          message: `Validation error for field ${fieldName}`,
          code: 'FIELD_VALIDATION_ERROR',
          value
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Real-time validation with debouncing
   */
  validateRealTime(
    data: any,
    schemaName: string,
    callback: (result: ValidationResult) => void,
    debounceMs: number = 300
  ): () => void {
    let timeoutId: NodeJS.Timeout;
    let isDestroyed = false;

    const debouncedValidation = () => {
      if (isDestroyed) return;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (isDestroyed) return;
        
        const result = await this.validate(data, schemaName, undefined, {
          includeWarnings: true,
          useCache: true
        });
        
        if (!isDestroyed) {
          callback(result);
        }
      }, debounceMs);
    };

    // Initial validation
    debouncedValidation();

    // Return cleanup function
    return () => {
      isDestroyed = true;
      clearTimeout(timeoutId);
    };
  }

  // Private validation methods
  private async executeValidation(
    data: any,
    schema: ValidationSchema,
    context?: ValidationContext,
    options?: any
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: string[] = [];

    // Validate individual fields
    for (const [fieldName, rules] of Object.entries(schema.fields)) {
      const fieldValue = this.getNestedValue(data, fieldName);
      
      for (const rule of rules) {
        // Check dependencies
        if (rule.dependencies && !this.checkDependencies(rule.dependencies, data)) {
          continue;
        }

        const fieldResult = await this.executeFieldValidation(fieldValue, fieldName, rule, context);
        
        if (!fieldResult.isValid) {
          errors.push(...fieldResult.errors);
          warnings.push(...fieldResult.warnings);
          
          if (options?.failFast && errors.length > 0) {
            break;
          }
        }
      }
      
      if (options?.failFast && errors.length > 0) {
        break;
      }
    }

    // Execute business rules
    if (schema.businessRules && errors.length === 0) {
      const businessResult = await this.businessRuleEngine.evaluate(
        data,
        schema.businessRules,
        context
      );
      
      errors.push(...businessResult.errors);
      warnings.push(...businessResult.warnings);
    }

    // Generate suggestions based on errors
    if (errors.length > 0) {
      suggestions.push(...this.generateSuggestions(errors, data));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: options?.includeWarnings ? warnings : [],
      suggestions
    };
  }

  private async executeFieldValidation(
    value: any,
    fieldName: string,
    rule: ValidationRule,
    context?: ValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Check condition if present
      if (rule.condition && !rule.condition(value, context)) {
        return { isValid: true, errors: [], warnings: [] };
      }

      let isValid = true;
      let errorMessage = rule.message;

      // Execute validation based on type
      switch (rule.type) {
        case ValidationType.REQUIRED:
          isValid = this.validateRequired(value);
          break;

        case ValidationType.TYPE:
          isValid = this.validateType(value, rule.params?.type);
          break;

        case ValidationType.FORMAT:
          isValid = this.validateFormat(value, rule.params?.format);
          break;

        case ValidationType.RANGE:
          const rangeResult = this.validateRange(value, rule.params?.min, rule.params?.max);
          isValid = rangeResult.isValid;
          errorMessage = rangeResult.message || errorMessage;
          break;

        case ValidationType.LENGTH:
          const lengthResult = this.validateLength(value, rule.params?.min, rule.params?.max);
          isValid = lengthResult.isValid;
          errorMessage = lengthResult.message || errorMessage;
          break;

        case ValidationType.PATTERN:
          isValid = this.validatePattern(value, rule.params?.pattern);
          break;

        case ValidationType.CUSTOM:
          if (rule.validator) {
            const customResult = await rule.validator(value, context);
            return customResult;
          } else if (rule.params?.validatorName) {
            const validator = this.customValidators.get(rule.params.validatorName);
            if (validator) {
              isValid = await validator(value, context);
            }
          }
          break;

        case ValidationType.SECURITY:
          isValid = await this.validateSecurity(value, rule.params);
          break;

        case ValidationType.BUSINESS_RULE:
          isValid = await this.validateBusinessRule(value, rule.params, context);
          break;

        default:
          isValid = true;
      }

      if (!isValid) {
        const error: ValidationError = {
          field: fieldName,
          type: rule.type,
          severity: rule.severity,
          message: errorMessage,
          code: this.generateErrorCode(fieldName, rule.type),
          value,
          expected: rule.params
        };

        if (rule.severity === ValidationSeverity.ERROR) {
          errors.push(error);
        } else {
          warnings.push(error);
        }
      }

    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
      errors.push({
        field: fieldName,
        type: ValidationType.CUSTOM,
        severity: ValidationSeverity.ERROR,
        message: `Validation failed: ${error.message}`,
        code: 'VALIDATION_EXECUTION_ERROR',
        value
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Built-in validators
  private validateRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private validateType(value: any, expectedType: string): boolean {
    if (value === null || value === undefined) return true; // Handled by required validator

    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && !Array.isArray(value);
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'email':
        return this.validateFormat(value, 'email');
      case 'url':
        return this.validateFormat(value, 'url');
      default:
        return true;
    }
  }

  private validateFormat(value: any, format: string): boolean {
    if (typeof value !== 'string') return false;

    const formats: { [key: string]: RegExp } = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      phone: /^\+?[\d\s\-\(\)]{10,}$/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      alpha: /^[a-zA-Z]+$/,
      numeric: /^[0-9]+$/,
      decimal: /^\d+(\.\d{1,2})?$/,
      cryptocurrency: /^[A-Z]{2,10}$/,
      exchange_symbol: /^[A-Z]{2,10}[A-Z]{2,10}$/
    };

    const regex = formats[format];
    return regex ? regex.test(value) : true;
  }

  private validateRange(value: any, min?: number, max?: number): { isValid: boolean; message?: string } {
    if (typeof value !== 'number') {
      return { isValid: false, message: 'Value must be a number for range validation' };
    }

    if (min !== undefined && value < min) {
      return { isValid: false, message: `Value must be at least ${min}` };
    }

    if (max !== undefined && value > max) {
      return { isValid: false, message: `Value must not exceed ${max}` };
    }

    return { isValid: true };
  }

  private validateLength(value: any, min?: number, max?: number): { isValid: boolean; message?: string } {
    const length = typeof value === 'string' ? value.length : 
                   Array.isArray(value) ? value.length : 
                   typeof value === 'object' ? Object.keys(value).length : 0;

    if (min !== undefined && length < min) {
      return { isValid: false, message: `Length must be at least ${min}` };
    }

    if (max !== undefined && length > max) {
      return { isValid: false, message: `Length must not exceed ${max}` };
    }

    return { isValid: true };
  }

  private validatePattern(value: any, pattern: string | RegExp): boolean {
    if (typeof value !== 'string') return false;
    
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(value);
  }

  private async validateSecurity(value: any, params: any): Promise<boolean> {
    // Implement security-specific validations
    if (params.noSQLInjection && typeof value === 'string') {
      const sqlPatterns = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION', '--', ';'];
      return !sqlPatterns.some(pattern => 
        value.toUpperCase().includes(pattern.toUpperCase())
      );
    }

    if (params.noXSS && typeof value === 'string') {
      const xssPatterns = ['<script', 'javascript:', 'onload=', 'onclick=', 'onerror='];
      return !xssPatterns.some(pattern =>
        value.toLowerCase().includes(pattern.toLowerCase())
      );
    }

    return true;
  }

  private async validateBusinessRule(value: any, params: any, context?: ValidationContext): Promise<boolean> {
    // Implement business rule validations
    return true; // Placeholder
  }

  // Helper methods
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private checkDependencies(dependencies: string[], data: any): boolean {
    return dependencies.every(dep => {
      const value = this.getNestedValue(data, dep);
      return value !== null && value !== undefined && value !== '';
    });
  }

  private generateErrorCode(fieldName: string, type: ValidationType): string {
    return `${fieldName.toUpperCase()}_${type.toUpperCase()}_ERROR`;
  }

  private generateSuggestions(errors: ValidationError[], data: any): string[] {
    const suggestions: string[] = [];

    errors.forEach(error => {
      switch (error.type) {
        case ValidationType.REQUIRED:
          suggestions.push(`Please provide a value for ${error.field}`);
          break;
        case ValidationType.FORMAT:
          if (error.field.includes('email')) {
            suggestions.push('Please enter a valid email address (e.g., user@example.com)');
          } else if (error.field.includes('phone')) {
            suggestions.push('Please enter a valid phone number with country code');
          }
          break;
        case ValidationType.RANGE:
          suggestions.push(`Adjust ${error.field} to be within the allowed range`);
          break;
        case ValidationType.LENGTH:
          suggestions.push(`${error.field} should be between the specified length limits`);
          break;
      }
    });

    return suggestions;
  }

  private getCachedResult(data: any, schemaName: string): ValidationResult | null {
    const key = this.generateCacheKey(data, schemaName);
    const cached = this.validationCache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < 60000) { // 1-minute cache
      return cached.result;
    }
    
    return null;
  }

  private cacheResult(data: any, schemaName: string, result: ValidationResult): void {
    const key = this.generateCacheKey(data, schemaName);
    this.validationCache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  private generateCacheKey(data: any, schemaName: string): string {
    return `${schemaName}_${JSON.stringify(data).substring(0, 100)}`;
  }

  private setupBuiltInValidators(): void {
    // Register built-in custom validators
    this.registerValidator('strongPassword', (value: string) => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
    });

    this.registerValidator('tradingSymbol', (value: string) => {
      return /^[A-Z]{2,10}[A-Z]{2,10}$/.test(value);
    });

    this.registerValidator('positiveAmount', (value: number) => {
      return typeof value === 'number' && value > 0;
    });

    this.registerValidator('validExchange', (value: string) => {
      const validExchanges = ['binance', 'coinbase', 'kraken'];
      return validExchanges.includes(value.toLowerCase());
    });
  }

  private setupDefaultSchemas(): void {
    // User Registration Schema
    this.registerSchema({
      name: 'user_registration',
      version: '1.0',
      fields: {
        email: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'Email is required' },
          { type: ValidationType.FORMAT, severity: ValidationSeverity.ERROR, message: 'Invalid email format', params: { format: 'email' } }
        ],
        password: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'Password is required' },
          { type: ValidationType.LENGTH, severity: ValidationSeverity.ERROR, message: 'Password must be at least 8 characters', params: { min: 8 } },
          { type: ValidationType.CUSTOM, severity: ValidationSeverity.WARNING, message: 'Use a stronger password', params: { validatorName: 'strongPassword' } }
        ],
        username: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'Username is required' },
          { type: ValidationType.LENGTH, severity: ValidationSeverity.ERROR, message: 'Username must be 3-20 characters', params: { min: 3, max: 20 } },
          { type: ValidationType.PATTERN, severity: ValidationSeverity.ERROR, message: 'Username can only contain letters, numbers, and underscores', params: { pattern: /^[a-zA-Z0-9_]+$/ } }
        ]
      }
    });

    // Trading Order Schema
    this.registerSchema({
      name: 'trading_order',
      version: '1.0', 
      fields: {
        symbol: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'Trading symbol is required' },
          { type: ValidationType.CUSTOM, severity: ValidationSeverity.ERROR, message: 'Invalid trading symbol format', params: { validatorName: 'tradingSymbol' } }
        ],
        amount: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'Amount is required' },
          { type: ValidationType.TYPE, severity: ValidationSeverity.ERROR, message: 'Amount must be a number', params: { type: 'number' } },
          { type: ValidationType.CUSTOM, severity: ValidationSeverity.ERROR, message: 'Amount must be positive', params: { validatorName: 'positiveAmount' } }
        ],
        price: [
          { type: ValidationType.TYPE, severity: ValidationSeverity.ERROR, message: 'Price must be a number', params: { type: 'number' }, condition: (value, context) => context?.orderType === 'limit' },
          { type: ValidationType.CUSTOM, severity: ValidationSeverity.ERROR, message: 'Price must be positive', params: { validatorName: 'positiveAmount' }, condition: (value, context) => context?.orderType === 'limit' }
        ],
        exchange: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'Exchange is required' },
          { type: ValidationType.CUSTOM, severity: ValidationSeverity.ERROR, message: 'Invalid exchange', params: { validatorName: 'validExchange' } }
        ]
      },
      businessRules: [
        {
          name: 'sufficient_balance',
          description: 'User must have sufficient balance for the order',
          condition: 'checkSufficientBalance',
          errorMessage: 'Insufficient balance for this order',
          severity: ValidationSeverity.ERROR,
          enabled: true
        },
        {
          name: 'market_hours',
          description: 'Orders can only be placed during market hours',
          condition: 'checkMarketHours',
          errorMessage: 'Orders can only be placed during market hours',
          warningMessage: 'Market is currently closed. Order will be queued.',
          severity: ValidationSeverity.WARNING,
          enabled: true
        }
      ]
    });

    // API Key Configuration Schema
    this.registerSchema({
      name: 'api_key_config',
      version: '1.0',
      fields: {
        api_key: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'API key is required' },
          { type: ValidationType.LENGTH, severity: ValidationSeverity.ERROR, message: 'API key length is invalid', params: { min: 32, max: 128 } },
          { type: ValidationType.SECURITY, severity: ValidationSeverity.ERROR, message: 'API key contains invalid characters', params: { noSQLInjection: true, noXSS: true } }
        ],
        api_secret: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'API secret is required' },
          { type: ValidationType.LENGTH, severity: ValidationSeverity.ERROR, message: 'API secret length is invalid', params: { min: 32, max: 128 } }
        ],
        exchange_name: [
          { type: ValidationType.REQUIRED, severity: ValidationSeverity.ERROR, message: 'Exchange name is required' },
          { type: ValidationType.CUSTOM, severity: ValidationSeverity.ERROR, message: 'Invalid exchange', params: { validatorName: 'validExchange' } }
        ]
      }
    });
  }
}

// Business Rule Engine
class BusinessRuleEngine {
  async evaluate(
    data: any, 
    rules: BusinessRule[], 
    context?: ValidationContext
  ): Promise<{ errors: ValidationError[]; warnings: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      try {
        const isValid = await this.evaluateRule(rule, data, context);
        
        if (!isValid) {
          const error: ValidationError = {
            field: '_business_rule',
            type: ValidationType.BUSINESS_RULE,
            severity: rule.severity,
            message: rule.severity === ValidationSeverity.ERROR ? rule.errorMessage : (rule.warningMessage || rule.errorMessage),
            code: `BUSINESS_RULE_${rule.name.toUpperCase()}`,
            context: { rule: rule.name }
          };

          if (rule.severity === ValidationSeverity.ERROR) {
            errors.push(error);
          } else {
            warnings.push(error);
          }
        }
      } catch (error) {
        console.error(`Error evaluating business rule ${rule.name}:`, error);
      }
    }

    return { errors, warnings };
  }

  private async evaluateRule(rule: BusinessRule, data: any, context?: ValidationContext): Promise<boolean> {
    // Implement business rule evaluation logic
    switch (rule.condition) {
      case 'checkSufficientBalance':
        return this.checkSufficientBalance(data, context);
      case 'checkMarketHours':
        return this.checkMarketHours(data, context);
      default:
        return true;
    }
  }

  private checkSufficientBalance(data: any, context?: ValidationContext): boolean {
    // Mock implementation - in real system, check user's actual balance
    const requiredBalance = (data.amount || 0) * (data.price || 1);
    const availableBalance = 10000; // Mock balance
    return availableBalance >= requiredBalance;
  }

  private checkMarketHours(data: any, context?: ValidationContext): boolean {
    // Mock implementation - in real system, check actual market hours
    const currentHour = new Date().getHours();
    return currentHour >= 9 && currentHour <= 17; // 9 AM to 5 PM
  }
}

// Export singleton instance
export const validationService = new ValidationService();