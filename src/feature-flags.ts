/**
 * Feature Flags System
 * Task-7: Global and per-user feature flag management
 */

import { Pool } from 'pg';

export interface FeatureFlag {
  id: number;
  flag_key: string;
  flag_value: boolean;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  trading_mode: 'demo' | 'real';
  preferences: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogEntry {
  user_id: number | null;
  setting_type: string;
  setting_key: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: number | null;
  ip_address?: string;
  user_agent?: string;
}

export class FeatureFlagsService {
  constructor(private pool: Pool) {}

  /**
   * Get global feature flag value
   */
  async getFlag(flagKey: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT flag_value FROM feature_flags WHERE flag_key = $1',
      [flagKey]
    );
    
    return result.rows[0]?.flag_value ?? false;
  }

  /**
   * Set global feature flag value
   */
  async setFlag(
    flagKey: string,
    value: boolean,
    changedBy: number | null = null,
    auditInfo: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get old value for audit
      const oldResult = await client.query(
        'SELECT flag_value FROM feature_flags WHERE flag_key = $1',
        [flagKey]
      );
      const oldValue = oldResult.rows[0]?.flag_value?.toString() ?? 'null';
      
      // Update flag
      await client.query(
        `INSERT INTO feature_flags (flag_key, flag_value)
         VALUES ($1, $2)
         ON CONFLICT (flag_key) DO UPDATE SET flag_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [flagKey, value]
      );
      
      // Log to audit
      await this.logAudit({
        user_id: null,
        setting_type: 'feature_flag',
        setting_key: flagKey,
        old_value: oldValue,
        new_value: value.toString(),
        changed_by: changedBy,
        ...auditInfo
      });
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user trading mode
   */
  async getUserTradingMode(userId: number): Promise<'demo' | 'real'> {
    const result = await this.pool.query(
      'SELECT trading_mode FROM user_prefs WHERE user_id = $1',
      [userId]
    );
    
    return result.rows[0]?.trading_mode ?? 'demo';
  }

  /**
   * Set user trading mode
   */
  async setUserTradingMode(
    userId: number,
    mode: 'demo' | 'real',
    changedBy: number | null = null,
    auditInfo: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get old value for audit
      const oldResult = await client.query(
        'SELECT trading_mode FROM user_prefs WHERE user_id = $1',
        [userId]
      );
      const oldValue = oldResult.rows[0]?.trading_mode ?? 'null';
      
      // Upsert user preference
      await client.query(
        `INSERT INTO user_prefs (user_id, trading_mode)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET trading_mode = $2, updated_at = CURRENT_TIMESTAMP`,
        [userId, mode]
      );
      
      // Log to audit
      await this.logAudit({
        user_id: userId,
        setting_type: 'user_pref',
        setting_key: 'trading_mode',
        old_value: oldValue,
        new_value: mode,
        changed_by: changedBy ?? userId,
        ...auditInfo
      });
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if user should use demo mode (considers global flag + user preference)
   */
  async shouldUseDemoMode(userId: number): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT should_use_demo_mode($1) as use_demo',
      [userId]
    );
    
    return result.rows[0]?.use_demo ?? true;
  }

  /**
   * Get user preferences (full object)
   */
  async getUserPreferences(userId: number): Promise<UserPreferences | null> {
    const result = await this.pool.query(
      'SELECT * FROM user_prefs WHERE user_id = $1',
      [userId]
    );
    
    return result.rows[0] ?? null;
  }

  /**
   * Update user preferences JSON
   */
  async updateUserPreferences(
    userId: number,
    preferences: Record<string, any>,
    changedBy: number | null = null,
    auditInfo: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get old preferences for audit
      const oldResult = await client.query(
        'SELECT preferences FROM user_prefs WHERE user_id = $1',
        [userId]
      );
      const oldValue = JSON.stringify(oldResult.rows[0]?.preferences ?? {});
      
      // Update preferences
      await client.query(
        `INSERT INTO user_prefs (user_id, preferences)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id) DO UPDATE SET preferences = $2::jsonb, updated_at = CURRENT_TIMESTAMP`,
        [userId, JSON.stringify(preferences)]
      );
      
      // Log to audit
      await this.logAudit({
        user_id: userId,
        setting_type: 'user_pref',
        setting_key: 'preferences',
        old_value: oldValue,
        new_value: JSON.stringify(preferences),
        changed_by: changedBy ?? userId,
        ...auditInfo
      });
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Log to settings audit trail
   */
  private async logAudit(entry: AuditLogEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO settings_audit 
       (user_id, setting_type, setting_key, old_value, new_value, changed_by, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        entry.user_id,
        entry.setting_type,
        entry.setting_key,
        entry.old_value,
        entry.new_value,
        entry.changed_by,
        entry.ip_address ?? null,
        entry.user_agent ?? null
      ]
    );
  }

  /**
   * Get audit history for a user or setting
   */
  async getAuditHistory(
    filters: {
      userId?: number;
      settingKey?: string;
      settingType?: string;
      limit?: number;
    } = {}
  ): Promise<any[]> {
    const { userId, settingKey, settingType, limit = 50 } = filters;
    
    let query = 'SELECT * FROM settings_audit WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(userId);
    }
    
    if (settingKey) {
      query += ` AND setting_key = $${paramIndex++}`;
      params.push(settingKey);
    }
    
    if (settingType) {
      query += ` AND setting_type = $${paramIndex++}`;
      params.push(settingType);
    }
    
    query += ` ORDER BY changed_at DESC LIMIT $${paramIndex}`;
    params.push(limit);
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }
}

/**
 * Environment-based feature flag helpers
 */
export class EnvFeatureFlags {
  static isDemoMode(): boolean {
    return process.env.DEMO_MODE === 'true';
  }

  static isMexcOnly(): boolean {
    return process.env.MEXC_ONLY !== 'false'; // Default true
  }

  static getAll(): Record<string, boolean> {
    return {
      DEMO_MODE: this.isDemoMode(),
      MEXC_ONLY: this.isMexcOnly()
    };
  }
}
