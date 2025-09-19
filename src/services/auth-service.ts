/**
 * TITAN Trading System - Real Authentication Service
 * PostgreSQL + Redis + JWT Integration
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/database';

// =============================================================================
// INTERFACES
// =============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  timezone: string;
  language: string;
  isActive: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const JWT_CONFIG = {
  secret: 'titan_jwt_secret_2024_secure_key_production',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'titan-trading-system',
  audience: 'titan-users'
};

const SECURITY_CONFIG = {
  saltRounds: 12,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes in seconds
  sessionCacheTtl: 900, // 15 minutes in seconds
};

// =============================================================================
// AUTHENTICATION SERVICE
// =============================================================================

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // =============================================================================
  // USER REGISTRATION
  // =============================================================================

  async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(userData);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if user already exists
      const existingUser = await this.findUserByEmailOrUsername(userData.email, userData.username);
      if (existingUser) {
        return { success: false, error: 'User already exists with this email or username' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, SECURITY_CONFIG.saltRounds);

      // Create user
      const userId = uuidv4();
      const verificationToken = uuidv4();

      const query = `
        INSERT INTO users (
          id, username, email, password_hash, first_name, last_name, 
          phone, country, verification_token, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `;

      const result = await db.query(query, [
        userId,
        userData.username,
        userData.email,
        passwordHash,
        userData.firstName || null,
        userData.lastName || null,
        userData.phone || null,
        userData.country || null,
        verificationToken
      ]);

      const user = this.mapDbUserToUser(result.rows[0]);
      
      console.log('✅ User registered:', user.email);
      return { success: true, user };

    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // =============================================================================
  // USER LOGIN
  // =============================================================================

  async login(credentials: LoginCredentials, ipAddress?: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    try {
      // Find user by email
      const user = await this.findUserByEmail(credentials.email);
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if account is locked
      if (await this.isAccountLocked(user.id)) {
        return { success: false, error: 'Account is temporarily locked due to too many failed attempts' };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(credentials.password, user.id);
      if (!isPasswordValid) {
        await this.recordFailedLogin(user.id);
        return { success: false, error: 'Invalid email or password' };
      }

      // Reset login attempts on successful login
      await this.resetLoginAttempts(user.id);

      // Update last login
      await this.updateLastLogin(user.id, ipAddress);

      // Create session
      const session = await this.createSession(user, credentials.rememberMe, ipAddress);

      console.log('✅ User logged in:', user.email);
      return { success: true, session };

    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  async createSession(user: User, rememberMe = false, ipAddress?: string): Promise<AuthSession> {
    const sessionId = uuidv4();
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user, sessionId);
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)); // 30 days or 1 day

    // Store session in database
    const query = `
      INSERT INTO user_sessions (id, user_id, session_token, refresh_token, expires_at, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    await db.query(query, [sessionId, user.id, accessToken, refreshToken, expiresAt, ipAddress]);

    // Cache session in Redis
    const sessionData = { userId: user.id, sessionId, user };
    await db.setCache(`session:${accessToken}`, sessionData, SECURITY_CONFIG.sessionCacheTtl);

    return {
      sessionId,
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt,
      user
    };
  }

  async validateSession(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      // Check cache first
      const cachedSession = await db.getCache(`session:${token}`);
      if (cachedSession) {
        return { valid: true, user: cachedSession.user };
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_CONFIG.secret) as any;
      
      // Check session in database
      const query = `
        SELECT s.*, u.* 
        FROM user_sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.session_token = $1 AND s.is_active = true AND s.expires_at > NOW()
      `;

      const result = await db.query(query, [token]);
      if (result.rows.length === 0) {
        return { valid: false, error: 'Session not found or expired' };
      }

      const user = this.mapDbUserToUser(result.rows[0]);
      
      // Update cache
      await db.setCache(`session:${token}`, { userId: user.id, user }, SECURITY_CONFIG.sessionCacheTtl);

      return { valid: true, user };

    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, error: 'Invalid session' };
    }
  }

  async logout(token: string): Promise<{ success: boolean }> {
    try {
      // Remove from cache
      await db.deleteCache(`session:${token}`);

      // Deactivate session in database
      const query = `UPDATE user_sessions SET is_active = false WHERE session_token = $1`;
      await db.query(query, [token]);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  async findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await db.query(query, [email]);
    return result.rows.length > 0 ? this.mapDbUserToUser(result.rows[0]) : null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    const result = await db.query(query, [userId]);
    return result.rows.length > 0 ? this.mapDbUserToUser(result.rows[0]) : null;
  }

  async findUserByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE (email = $1 OR username = $2) AND is_active = true';
    const result = await db.query(query, [email, username]);
    return result.rows.length > 0 ? this.mapDbUserToUser(result.rows[0]) : null;
  }

  // =============================================================================
  // SECURITY HELPERS
  // =============================================================================

  private async verifyPassword(password: string, userId: string): Promise<boolean> {
    const query = 'SELECT password_hash FROM users WHERE id = $1';
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return false;
    }

    return bcrypt.compare(password, result.rows[0].password_hash);
  }

  private async isAccountLocked(userId: string): Promise<boolean> {
    const query = 'SELECT locked_until FROM users WHERE id = $1';
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return false;
    }

    const lockedUntil = result.rows[0].locked_until;
    return lockedUntil && new Date(lockedUntil) > new Date();
  }

  private async recordFailedLogin(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET login_attempts = login_attempts + 1,
          locked_until = CASE 
            WHEN login_attempts + 1 >= $1 THEN NOW() + INTERVAL '${SECURITY_CONFIG.lockoutDuration} seconds'
            ELSE locked_until
          END
      WHERE id = $2
    `;

    await db.query(query, [SECURITY_CONFIG.maxLoginAttempts, userId]);
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    const query = 'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = $1';
    await db.query(query, [userId]);
  }

  private async updateLastLogin(userId: string, ipAddress?: string): Promise<void> {
    const query = 'UPDATE users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2';
    await db.query(query, [ipAddress, userId]);
  }

  // =============================================================================
  // JWT HELPERS
  // =============================================================================

  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        type: 'access'
      },
      JWT_CONFIG.secret,
      {
        expiresIn: JWT_CONFIG.accessTokenExpiry,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }
    );
  }

  private generateRefreshToken(user: User, sessionId: string): string {
    return jwt.sign(
      {
        userId: user.id,
        sessionId,
        type: 'refresh'
      },
      JWT_CONFIG.secret,
      {
        expiresIn: JWT_CONFIG.refreshTokenExpiry,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }
    );
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  private validateRegistrationData(data: RegisterData): { valid: boolean; error?: string } {
    if (!data.username || data.username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters long' };
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { valid: false, error: 'Invalid email address' };
    }

    if (!data.password || data.password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long' };
    }

    return { valid: true };
  }

  // =============================================================================
  // DATA MAPPING
  // =============================================================================

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phone: dbUser.phone,
      country: dbUser.country,
      timezone: dbUser.timezone || 'UTC',
      language: dbUser.language || 'en',
      isActive: dbUser.is_active,
      isVerified: dbUser.is_verified,
      twoFactorEnabled: dbUser.two_factor_enabled,
      lastLoginAt: dbUser.last_login_at,
      lastLoginIp: dbUser.last_login_ip,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    };
  }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const authService = AuthService.getInstance();