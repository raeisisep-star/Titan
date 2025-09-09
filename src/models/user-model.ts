// TITAN Trading System - User Model
// User management with authentication and profile features

import { BaseModel, ModelValidationResult } from './base-model';
import { DatabaseService } from '../services/database-service';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  role: 'admin' | 'user' | 'trader' | 'analyst';
  avatar_url?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  email_verified: boolean;
  two_factor_enabled: boolean;
}

export interface CreateUserData {
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  role?: 'admin' | 'user' | 'trader' | 'analyst';
  avatar_url?: string;
  settings?: Record<string, any>;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: string;
  role?: 'admin' | 'user' | 'trader' | 'analyst';
  avatar_url?: string;
  settings?: Record<string, any>;
  is_active?: boolean;
  email_verified?: boolean;
  two_factor_enabled?: boolean;
}

export interface UserSession {
  id: string;
  user_id: number;
  device_info: Record<string, any>;
  ip_address: string;
  location?: string;
  expires_at: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
}

export class UserModel extends BaseModel<User> {
  constructor(db: DatabaseService) {
    super(
      db,
      {
        tableName: 'users',
        primaryKey: 'id',
        timestamps: true,
      },
      [
        'username',
        'email',
        'password_hash',
        'full_name',
        'role',
        'avatar_url',
        'settings',
        'is_active',
        'email_verified',
        'two_factor_enabled',
      ],
      ['password_hash'], // Hidden fields
      {
        settings: 'json',
        is_active: 'boolean',
        email_verified: 'boolean',
        two_factor_enabled: 'boolean',
      }
    );
  }

  // ===========================
  // Validation
  // ===========================

  protected validate(data: Partial<User>): ModelValidationResult {
    const errors: string[] = [];

    // Username validation
    if (data.username !== undefined) {
      if (!data.username || data.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
    }

    // Email validation
    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Valid email address is required');
      }
    }

    // Password validation (only for new users or password changes)
    if (data.password_hash !== undefined) {
      if (!data.password_hash || data.password_hash.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
    }

    // Role validation
    if (data.role !== undefined) {
      const validRoles = ['admin', 'user', 'trader', 'analyst'];
      if (!validRoles.includes(data.role)) {
        errors.push('Invalid role specified');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ===========================
  // Authentication Methods
  // ===========================

  public async createUser(userData: CreateUserData): Promise<User | null> {
    // Check if username or email already exists
    const existingUser = await this.findByUsernameOrEmail(userData.username, userData.email);
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Set default values
    const data = {
      ...userData,
      role: userData.role || 'user',
      settings: userData.settings || {},
      is_active: true,
      email_verified: false,
      two_factor_enabled: false,
    };

    const result = await this.create(data);
    if (result.success && result.meta?.lastRowId) {
      return await this.findById(result.meta.lastRowId);
    }

    return null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    return await this.findOne({ username });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email });
  }

  public async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    const result = await this.query<User>(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );

    if (result.success && result.data && result.data.length > 0) {
      return this.castModel(result.data[0]);
    }

    return null;
  }

  public async updateLastLogin(userId: number): Promise<void> {
    await this.update(userId, {
      last_login: new Date().toISOString(),
    } as any);
  }

  public async verifyEmail(userId: number): Promise<boolean> {
    const result = await this.update(userId, {
      email_verified: true,
    } as any);

    return result.success;
  }

  public async enable2FA(userId: number): Promise<boolean> {
    const result = await this.update(userId, {
      two_factor_enabled: true,
    } as any);

    return result.success;
  }

  public async disable2FA(userId: number): Promise<boolean> {
    const result = await this.update(userId, {
      two_factor_enabled: false,
    } as any);

    return result.success;
  }

  // ===========================
  // User Management Methods
  // ===========================

  public async getActiveUsers(limit: number = 50): Promise<User[]> {
    return await this.findMany(
      { is_active: true },
      {
        orderBy: 'last_login DESC',
        limit,
      }
    );
  }

  public async getUsersByRole(role: string): Promise<User[]> {
    return await this.findMany({ role } as any, {
      orderBy: 'created_at DESC',
    });
  }

  public async deactivateUser(userId: number): Promise<boolean> {
    const result = await this.update(userId, {
      is_active: false,
    } as any);

    return result.success;
  }

  public async activateUser(userId: number): Promise<boolean> {
    const result = await this.update(userId, {
      is_active: true,
    } as any);

    return result.success;
  }

  public async updateUserSettings(userId: number, settings: Record<string, any>): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    const newSettings = { ...user.settings, ...settings };
    const result = await this.update(userId, {
      settings: newSettings,
    } as any);

    return result.success;
  }

  // ===========================
  // Session Management
  // ===========================

  public async createSession(sessionData: {
    id: string;
    user_id: number;
    device_info: Record<string, any>;
    ip_address: string;
    location?: string;
    expires_at: string;
  }): Promise<boolean> {
    const result = await this.db.create('user_sessions', {
      ...sessionData,
      is_active: true,
    });

    return result.success;
  }

  public async findSession(sessionId: string): Promise<UserSession | null> {
    return await this.db.findOne<UserSession>('user_sessions', { id: sessionId });
  }

  public async updateSessionActivity(sessionId: string): Promise<boolean> {
    const result = await this.db.update(
      'user_sessions',
      { last_activity: new Date().toISOString() },
      { id: sessionId }
    );

    return result.success;
  }

  public async getUserSessions(userId: number, activeOnly: boolean = true): Promise<UserSession[]> {
    const conditions: any = { user_id: userId };
    if (activeOnly) {
      conditions.is_active = true;
    }

    const result = await this.db.read<UserSession>('user_sessions', conditions, {
      orderBy: 'last_activity DESC',
    });

    return result.success && result.data ? result.data : [];
  }

  public async deactivateSession(sessionId: string): Promise<boolean> {
    const result = await this.db.update(
      'user_sessions',
      { is_active: false },
      { id: sessionId }
    );

    return result.success;
  }

  public async deactivateAllUserSessions(userId: number, exceptSessionId?: string): Promise<boolean> {
    let sql = 'UPDATE user_sessions SET is_active = false WHERE user_id = ?';
    const params = [userId];

    if (exceptSessionId) {
      sql += ' AND id != ?';
      params.push(exceptSessionId);
    }

    const result = await this.db.execute(sql, params);
    return result.success;
  }

  public async cleanExpiredSessions(): Promise<number> {
    const result = await this.db.execute(
      'DELETE FROM user_sessions WHERE expires_at < ? OR (is_active = false AND created_at < ?)',
      [new Date().toISOString(), new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()]
    );

    return result.meta?.changes || 0;
  }

  // ===========================
  // User Statistics
  // ===========================

  public async getUserStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    byRole: Record<string, number>;
    newToday: number;
    newThisWeek: number;
  }> {
    const total = await this.count();
    const active = await this.count({ is_active: true });
    const verified = await this.count({ email_verified: true });

    // Get counts by role
    const roleResult = await this.query<{ role: string; count: number }>(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    const byRole: Record<string, number> = {};
    if (roleResult.success && roleResult.data) {
      roleResult.data.forEach(row => {
        byRole[row.role] = row.count;
      });
    }

    // Get new users today and this week
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newTodayResult = await this.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?',
      [today]
    );
    const newToday = newTodayResult.success && newTodayResult.data ? newTodayResult.data[0].count : 0;

    const newWeekResult = await this.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) >= ?',
      [weekAgo]
    );
    const newThisWeek = newWeekResult.success && newWeekResult.data ? newWeekResult.data[0].count : 0;

    return {
      total,
      active,
      verified,
      byRole,
      newToday,
      newThisWeek,
    };
  }

  // ===========================
  // Hooks Override
  // ===========================

  protected async beforeCreate(data: Partial<User>): Promise<Partial<User>> {
    // Ensure settings is an object
    if (!data.settings) {
      data.settings = {};
    }

    return data;
  }

  protected async afterCreate(user: User): Promise<void> {
    // Log user creation
    console.log(`[User Model] User created: ${user.username} (${user.email})`);
  }

  protected async beforeDelete(userId: any): Promise<boolean> {
    // Check if user has any active sessions or trades
    // This is a safety check to prevent accidental deletions
    const sessions = await this.getUserSessions(userId, true);
    if (sessions.length > 0) {
      console.warn(`[User Model] Cannot delete user ${userId}: has active sessions`);
      return false;
    }

    return true;
  }
}

// Export factory function
export const createUserModel = (db: DatabaseService): UserModel => {
  return new UserModel(db);
};