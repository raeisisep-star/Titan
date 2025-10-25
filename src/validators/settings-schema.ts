/**
 * Settings JSON Schema Validation
 * Task-7: Validate user settings updates with ajv
 */

import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, removeAdditional: true });
addFormats(ajv);

/**
 * User Preferences Schema
 */
export interface UserPreferencesInput {
  trading_mode?: 'demo' | 'real';
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'en' | 'fa';
    notifications?: {
      email?: boolean;
      telegram?: boolean;
      push?: boolean;
    };
    risk_settings?: {
      max_position_size?: number;
      stop_loss_percent?: number;
      take_profit_percent?: number;
    };
  };
}

const userPreferencesSchema: JSONSchemaType<UserPreferencesInput> = {
  type: 'object',
  properties: {
    trading_mode: {
      type: 'string',
      enum: ['demo', 'real'],
      nullable: true
    },
    preferences: {
      type: 'object',
      nullable: true,
      properties: {
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'auto'],
          nullable: true
        },
        language: {
          type: 'string',
          enum: ['en', 'fa'],
          nullable: true
        },
        notifications: {
          type: 'object',
          nullable: true,
          properties: {
            email: { type: 'boolean', nullable: true },
            telegram: { type: 'boolean', nullable: true },
            push: { type: 'boolean', nullable: true }
          },
          required: [],
          additionalProperties: false
        },
        risk_settings: {
          type: 'object',
          nullable: true,
          properties: {
            max_position_size: { type: 'number', minimum: 0, maximum: 10000, nullable: true },
            stop_loss_percent: { type: 'number', minimum: 0, maximum: 100, nullable: true },
            take_profit_percent: { type: 'number', minimum: 0, maximum: 1000, nullable: true }
          },
          required: [],
          additionalProperties: false
        }
      },
      required: [],
      additionalProperties: false
    }
  },
  required: [],
  additionalProperties: false
};

/**
 * Feature Flag Update Schema
 */
export interface FeatureFlagInput {
  flag_key: string;
  flag_value: boolean;
  description?: string;
}

const featureFlagSchema: JSONSchemaType<FeatureFlagInput> = {
  type: 'object',
  properties: {
    flag_key: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '^[A-Z_]+$' // UPPERCASE_WITH_UNDERSCORES
    },
    flag_value: {
      type: 'boolean'
    },
    description: {
      type: 'string',
      maxLength: 500,
      nullable: true
    }
  },
  required: ['flag_key', 'flag_value'],
  additionalProperties: false
};

/**
 * Compiled validators
 */
export const validateUserPreferences = ajv.compile(userPreferencesSchema);
export const validateFeatureFlag = ajv.compile(featureFlagSchema);

/**
 * Validation helper with detailed error messages
 */
export function validateWithErrors<T>(
  validator: any,
  data: unknown
): { valid: boolean; errors: string[] | null; data: T | null } {
  const valid = validator(data);
  
  if (!valid) {
    const errors = validator.errors?.map((err: any) => {
      const field = err.instancePath || err.params?.missingProperty || 'root';
      return `${field}: ${err.message}`;
    }) ?? ['Validation failed'];
    
    return { valid: false, errors, data: null };
  }
  
  return { valid: true, errors: null, data: data as T };
}

/**
 * Example usage in endpoint:
 * 
 * const result = validateWithErrors<UserPreferencesInput>(
 *   validateUserPreferences,
 *   await c.req.json()
 * );
 * 
 * if (!result.valid) {
 *   return c.json({ error: 'Validation failed', details: result.errors }, 400);
 * }
 * 
 * // Use result.data (validated and type-safe)
 */
