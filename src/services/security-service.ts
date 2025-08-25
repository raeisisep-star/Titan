// Security Service for Enhanced Authentication
// مدیریت امنیت، JWT tokens، و کنترل دسترسی

import type { Env } from '../types/cloudflare'

export interface UserPayload {
  id: string
  username: string
  role: string
  access: string
  permissions: string[]
  iat?: number
  exp?: number
}

export interface SessionData {
  userId: string
  username: string
  role: string
  loginTime: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
}

export interface SecurityConfig {
  jwtSecret: string
  jwtExpiry: number // seconds
  sessionTimeout: number // seconds
  maxLoginAttempts: number
  lockoutDuration: number // seconds
  requireStrongPassword: boolean
}

export class SecurityService {
  private env: Env
  private config: SecurityConfig

  constructor(env: Env) {
    this.env = env
    this.config = {
      jwtSecret: env.JWT_SECRET || 'titan-secret-key-' + Date.now(),
      jwtExpiry: 24 * 60 * 60, // 24 hours
      sessionTimeout: 30 * 60, // 30 minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60, // 15 minutes
      requireStrongPassword: true
    }
  }

  // JWT Token Operations
  async generateJWT(payload: UserPayload): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.config.jwtExpiry
    }

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
    const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload))
    
    const signature = await this.sign(`${encodedHeader}.${encodedPayload}`)
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  async verifyJWT(token: string): Promise<UserPayload | null> {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      const [encodedHeader, encodedPayload, signature] = parts
      
      // Verify signature
      const expectedSignature = await this.sign(`${encodedHeader}.${encodedPayload}`)
      if (signature !== expectedSignature) {
        return null
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as UserPayload
      
      // Check expiry
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        return null
      }

      return payload
    } catch (error) {
      console.error('JWT verification error:', error)
      return null
    }
  }

  async refreshToken(oldToken: string): Promise<string | null> {
    const payload = await this.verifyJWT(oldToken)
    if (!payload) {
      return null
    }

    // Generate new token with same payload
    delete payload.iat
    delete payload.exp
    
    return await this.generateJWT(payload)
  }

  // Session Management
  async createSession(userId: string, userInfo: Partial<SessionData>): Promise<string> {
    const storage = await this.getStorage()
    const sessionId = this.generateSessionId()
    
    const sessionData: SessionData = {
      userId,
      username: userInfo.username || '',
      role: userInfo.role || 'user',
      loginTime: Date.now(),
      lastActivity: Date.now(),
      ipAddress: userInfo.ipAddress,
      userAgent: userInfo.userAgent
    }

    await storage.set(`session:${sessionId}`, sessionData, this.config.sessionTimeout)
    
    // Track active sessions for user
    const userSessions = await storage.get<string[]>(`user_sessions:${userId}`) || []
    userSessions.push(sessionId)
    await storage.set(`user_sessions:${userId}`, userSessions, this.config.sessionTimeout)

    return sessionId
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const storage = await this.getStorage()
    const session = await storage.get<SessionData>(`session:${sessionId}`)
    
    if (!session) {
      return null
    }

    // Check session timeout
    const now = Date.now()
    if (now - session.lastActivity > this.config.sessionTimeout * 1000) {
      await this.destroySession(sessionId)
      return null
    }

    // Update last activity
    session.lastActivity = now
    await storage.set(`session:${sessionId}`, session, this.config.sessionTimeout)

    return session
  }

  async destroySession(sessionId: string): Promise<void> {
    const storage = await this.getStorage()
    const session = await storage.get<SessionData>(`session:${sessionId}`)
    
    if (session) {
      // Remove from user sessions
      const userSessions = await storage.get<string[]>(`user_sessions:${session.userId}`) || []
      const updatedSessions = userSessions.filter(id => id !== sessionId)
      await storage.set(`user_sessions:${session.userId}`, updatedSessions, this.config.sessionTimeout)
    }

    await storage.delete(`session:${sessionId}`)
  }

  async destroyAllUserSessions(userId: string): Promise<void> {
    const storage = await this.getStorage()
    const userSessions = await storage.get<string[]>(`user_sessions:${userId}`) || []
    
    for (const sessionId of userSessions) {
      await storage.delete(`session:${sessionId}`)
    }
    
    await storage.delete(`user_sessions:${userId}`)
  }

  // Rate Limiting & Login Attempts
  async checkLoginAttempts(identifier: string): Promise<{
    allowed: boolean
    remaining: number
    lockedUntil?: number
  }> {
    const storage = await this.getStorage()
    const key = `login_attempts:${identifier}`
    const attempts = await storage.get<{
      count: number
      firstAttempt: number
      lockedUntil?: number
    }>(key)

    const now = Date.now()

    if (!attempts) {
      return { allowed: true, remaining: this.config.maxLoginAttempts }
    }

    // Check if lockout period has expired
    if (attempts.lockedUntil && now > attempts.lockedUntil) {
      await storage.delete(key)
      return { allowed: true, remaining: this.config.maxLoginAttempts }
    }

    // If locked
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      return { 
        allowed: false, 
        remaining: 0, 
        lockedUntil: attempts.lockedUntil 
      }
    }

    const remaining = this.config.maxLoginAttempts - attempts.count
    return { 
      allowed: remaining > 0, 
      remaining: Math.max(0, remaining)
    }
  }

  async recordLoginAttempt(identifier: string, success: boolean): Promise<void> {
    const storage = await this.getStorage()
    const key = `login_attempts:${identifier}`
    
    if (success) {
      // Reset attempts on successful login
      await storage.delete(key)
      return
    }

    const attempts = await storage.get<{
      count: number
      firstAttempt: number
      lockedUntil?: number
    }>(key) || { count: 0, firstAttempt: Date.now() }

    attempts.count++
    
    if (attempts.count >= this.config.maxLoginAttempts) {
      attempts.lockedUntil = Date.now() + (this.config.lockoutDuration * 1000)
    }

    await storage.set(key, attempts, this.config.lockoutDuration)
  }

  // Password Security
  validatePasswordStrength(password: string): {
    valid: boolean
    score: number
    issues: string[]
  } {
    const issues: string[] = []
    let score = 0

    if (password.length < 8) {
      issues.push('حداقل ۸ کاراکتر')
    } else {
      score += 20
    }

    if (!/[a-z]/.test(password)) {
      issues.push('حداقل یک حرف کوچک')
    } else {
      score += 20
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('حداقل یک حرف بزرگ')
    } else {
      score += 20
    }

    if (!/[0-9]/.test(password)) {
      issues.push('حداقل یک عدد')
    } else {
      score += 20
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      issues.push('حداقل یک کاراکتر خاص')
    } else {
      score += 20
    }

    return {
      valid: issues.length === 0,
      score,
      issues
    }
  }

  async hashPassword(password: string): Promise<string> {
    // Simple hash for demonstration - in production use bcrypt
    const encoder = new TextEncoder()
    const data = encoder.encode(password + this.config.jwtSecret)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password)
    return hashedInput === hash
  }

  // Permission System
  hasPermission(userRole: string, requiredPermission: string): boolean {
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // All permissions
      trader: ['trade', 'view_portfolio', 'view_analytics', 'chat'],
      analyst: ['view_portfolio', 'view_analytics', 'chat', 'analysis'],
      viewer: ['view_portfolio', 'view_analytics'],
      demo: ['demo_trade', 'view_demo', 'chat']
    }

    const permissions = rolePermissions[userRole] || []
    return permissions.includes('*') || permissions.includes(requiredPermission)
  }

  // Security Headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  }

  // Audit Logging
  async logSecurityEvent(event: {
    type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'session_expired'
    userId?: string
    username?: string
    ipAddress?: string
    userAgent?: string
    details?: any
  }): Promise<void> {
    const storage = await this.getStorage()
    await storage.logEvent({
      type: `security_${event.type}`,
      data: {
        ...event,
        timestamp: Date.now()
      }
    })
  }

  // Utility Methods
  private async getStorage() {
    const StorageService = (await import('./storage-service')).default
    return new StorageService(this.env)
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2)
  }

  private base64UrlEncode(str: string): string {
    const base64 = btoa(str)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return atob(base64)
  }

  private async sign(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(this.config.jwtSecret)
    const messageData = encoder.encode(data)
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData)
    const signatureArray = Array.from(new Uint8Array(signature))
    const base64Signature = btoa(String.fromCharCode(...signatureArray))
    
    return base64Signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }
}

export default SecurityService