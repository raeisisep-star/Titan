/**
 * TITAN Trading System - Authentication Service for Cloudflare Workers
 * Compatible with Workers runtime limitations
 */

import { v4 as uuidv4 } from 'uuid'
import { d1db } from '../lib/database-d1-adapter'
import { SecurityService } from './security-service'

// =============================================================================
// INTERFACES
// =============================================================================

export interface User {
  id: string
  username: string
  email: string
  password_hash?: string  // Added for authentication
  firstName?: string
  lastName?: string
  phone?: string
  country?: string
  timezone: string
  language: string
  isActive: boolean
  isVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: Date
  lastLoginIp?: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  country?: string
}

export interface AuthSession {
  sessionId: string
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: Date
  user: User
}

// =============================================================================
// SIMPLE JWT IMPLEMENTATION FOR WORKERS
// =============================================================================

interface JWTPayload {
  userId: string
  email: string
  username: string
  type: string
  exp: number
  iat: number
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

async function createJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
  
  const message = headerEncoded + '.' + payloadEncoded
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const signatureEncoded = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
  
  return message + '.' + signatureEncoded
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [headerEncoded, payloadEncoded, signatureEncoded] = parts
    const message = headerEncoded + '.' + payloadEncoded
    
    // Verify signature
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    const signatureBuffer = new Uint8Array(
      atob(signatureEncoded.replace(/-/g, '+').replace(/_/g, '/').padEnd(signatureEncoded.length + (4 - signatureEncoded.length % 4) % 4, '='))
        .split('')
        .map(c => c.charCodeAt(0))
    )
    
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, new TextEncoder().encode(message))
    
    if (!isValid) return null
    
    const payload = JSON.parse(base64UrlDecode(payloadEncoded))
    
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null
    }
    
    return payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// =============================================================================
// SIMPLE BCRYPT IMPLEMENTATION FOR WORKERS
// =============================================================================

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  )
  
  const hash = Array.from(new Uint8Array(bits))
  const saltArray = Array.from(salt)
  
  return '$titan$' + saltArray.map(b => b.toString(16).padStart(2, '0')).join('') + '$' + 
         hash.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!hash.startsWith('$titan$')) {
      // For testing purposes, simple string comparison  
      return password === hash
    }
    
    const parts = hash.split('$')
    if (parts.length !== 4) return false
    
    const salt = new Uint8Array(parts[2].match(/.{2}/g)?.map(h => parseInt(h, 16)) || [])
    const originalHash = parts[3]
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    )
    
    const newHash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
    return newHash === originalHash
  } catch (error) {
    console.error('Password verification failed:', error)
    return false
  }
}

// =============================================================================
// AUTHENTICATION SERVICE
// =============================================================================

const JWT_SECRET = 'titan_jwt_secret_2024_secure_key_production'

export class AuthService {
  private static instance: AuthService
  private securityService: SecurityService

  constructor() {
    this.securityService = SecurityService.getInstance()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // =============================================================================
  // USER REGISTRATION
  // =============================================================================

  async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(userData)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Check if user already exists
      const existingUser = await this.findUserByEmailOrUsername(userData.email, userData.username)
      if (existingUser) {
        return { success: false, error: 'User already exists with this email or username' }
      }

      // Hash password
      const passwordHash = await hashPassword(userData.password)

      // Create user
      const userId = uuidv4()

      const result = await d1db.query(`
        INSERT INTO users (
          id, username, email, password_hash, first_name, last_name, 
          phone, country, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        userId,
        userData.username,
        userData.email,
        passwordHash,
        userData.firstName || null,
        userData.lastName || null,
        userData.phone || null,
        userData.country || null,
        new Date().toISOString(),
        new Date().toISOString()
      ])

      const user = this.mapDbUserToUser(result.rows[0])
      
      console.log('✅ User registered:', user.email)
      return { success: true, user }

    } catch (error) {
      console.error('❌ Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  // =============================================================================
  // USER LOGIN
  // =============================================================================

  async login(credentials: LoginCredentials, ipAddress?: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    try {
      // Find user by email or username
      let user = null
      if (credentials.email) {
        console.log('🔍 Finding user by email:', credentials.email)
        user = await this.findUserByEmail(credentials.email)
        console.log('🔍 Found user:', user ? user.email : 'null')
      } else if (credentials.username) {
        user = await this.findUserByUsername(credentials.username)
      }
      
      if (!user) {
        console.log('❌ User not found for email:', credentials.email)
        return { success: false, error: 'Invalid credentials' }
      }

      // Verify password
      console.log('🔑 Verifying password for user:', user.email)
      console.log('🔑 Stored hash:', user.password_hash)
      const isPasswordValid = await this.securityService.verifyPassword(credentials.password, user.password_hash || '')
      console.log('🔑 Password valid:', isPasswordValid)
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Create session
      const session = await this.createSession(user, credentials.rememberMe, ipAddress)

      console.log('✅ User logged in:', user.email)
      return { success: true, session }

    } catch (error) {
      console.error('❌ Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  async createSession(user: User, rememberMe = false, ipAddress?: string): Promise<AuthSession> {
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000))
    
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      type: 'access',
      exp: Math.floor(expiresAt.getTime() / 1000),
      iat: Math.floor(Date.now() / 1000)
    }
    
    const accessToken = await createJWT(payload, JWT_SECRET)
    const refreshToken = await createJWT({ ...payload, type: 'refresh', sessionId }, JWT_SECRET)

    // Cache session
    const sessionData = { userId: user.id, sessionId, user }
    await d1db.setCache(`session:${accessToken}`, sessionData, 900) // 15 minutes

    return {
      sessionId,
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt,
      user
    }
  }

  async validateSession(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      // Check cache first
      const cachedSession = await d1db.getCache(`session:${token}`)
      if (cachedSession) {
        return { valid: true, user: cachedSession.user }
      }

      // Verify JWT token
      const payload = await verifyJWT(token, JWT_SECRET)
      if (!payload) {
        return { valid: false, error: 'Invalid or expired token' }
      }

      // Get user
      const user = await this.findUserById(payload.userId)
      if (!user) {
        return { valid: false, error: 'User not found' }
      }
      
      // Update cache
      await d1db.setCache(`session:${token}`, { userId: user.id, user }, 900)

      return { valid: true, user }

    } catch (error) {
      console.error('Session validation error:', error)
      return { valid: false, error: 'Invalid session' }
    }
  }

  async logout(token: string): Promise<{ success: boolean }> {
    try {
      await d1db.deleteCache(`session:${token}`)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false }
    }
  }

  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await d1db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email])
    return result.rows.length > 0 ? this.mapDbUserToUser(result.rows[0]) : null
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const result = await d1db.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username])
    return result.rows.length > 0 ? this.mapDbUserToUser(result.rows[0]) : null
  }

  async findUserById(userId: string): Promise<User | null> {
    const result = await d1db.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [userId])
    return result.rows.length > 0 ? this.mapDbUserToUser(result.rows[0]) : null
  }

  async findUserByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const result = await d1db.query('SELECT * FROM users WHERE (email = $1 OR username = $2) AND is_active = true', [email, username])
    return result.rows.length > 0 ? this.mapDbUserToUser(result.rows[0]) : null
  }

  // =============================================================================
  // SECURITY HELPERS
  // =============================================================================

  private async verifyPassword(password: string, userId: string): Promise<boolean> {
    const result = await d1db.query('SELECT password_hash FROM users WHERE id = $1', [userId])
    
    if (result.rows.length === 0) {
      return false
    }

    return this.securityService.verifyPassword(password, result.rows[0].password_hash)
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  private validateRegistrationData(data: RegisterData): { valid: boolean; error?: string } {
    if (!data.username || data.username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters long' }
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { valid: false, error: 'Invalid email address' }
    }

    if (!data.password || data.password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long' }
    }

    return { valid: true }
  }

  // =============================================================================
  // DATA MAPPING
  // =============================================================================

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      password_hash: dbUser.password_hash,  // Added for authentication
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phone: dbUser.phone,
      country: dbUser.country,
      timezone: dbUser.timezone || 'UTC',
      language: dbUser.language || 'en',
      isActive: dbUser.is_active,
      isVerified: dbUser.is_verified,
      twoFactorEnabled: dbUser.two_factor_enabled || false,
      lastLoginAt: dbUser.last_login_at,
      lastLoginIp: dbUser.last_login_ip,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    }
  }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const authService = AuthService.getInstance()