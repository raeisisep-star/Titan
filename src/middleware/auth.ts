// Authentication and Authorization Middleware
// میدل‌ویر احراز هویت و کنترل دسترسی

import type { Context, Next } from 'hono'
import type { Env } from '../types/cloudflare'

export interface AuthRequest extends Context {
  user?: {
    id: string
    username: string
    role: string
    permissions: string[]
  }
}

// JWT Authentication Middleware
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    const authorization = c.req.header('Authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'توکن احراز هویت مورد نیاز است' }, 401)
    }

    const token = authorization.substring(7) // Remove 'Bearer '
    
    // Handle demo tokens for development/testing
    if (token.startsWith('demo_token_')) {
      c.set('user', {
        id: '1',
        username: 'demo_user',
        role: 'admin',
        permissions: ['*'] // Admin has all permissions
      })
      await next()
      return
    }
    
    const SecurityService = (await import('../services/security-service')).default
    const security = new SecurityService(c.env)
    
    const payload = await security.verifyJWT(token)
    
    if (!payload) {
      return c.json({ success: false, message: 'توکن نامعتبر یا منقضی شده' }, 401)
    }

    // Add user info to context
    c.set('user', {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      permissions: payload.permissions
    })

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ success: false, message: 'خطا در احراز هویت' }, 500)
  }
}

// Role-based Authorization Middleware
export function requireRole(allowedRoles: string[]) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ success: false, message: 'احراز هویت مورد نیاز است' }, 401)
    }

    if (!allowedRoles.includes(user.role) && !user.permissions.includes('*')) {
      const SecurityService = (await import('../services/security-service')).default
      const security = new SecurityService(c.env)
      
      await security.logSecurityEvent({
        type: 'permission_denied',
        userId: user.id,
        username: user.username,
        details: {
          required_roles: allowedRoles,
          user_role: user.role,
          endpoint: c.req.url
        }
      })
      
      return c.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز - نقش کاربری مناسب ندارید',
        required_roles: allowedRoles 
      }, 403)
    }

    await next()
  }
}

// Permission-based Authorization Middleware
export function requirePermission(requiredPermission: string) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ success: false, message: 'احراز هویت مورد نیاز است' }, 401)
    }

    const SecurityService = (await import('../services/security-service')).default
    const security = new SecurityService(c.env)
    
    if (!security.hasPermission(user.role, requiredPermission)) {
      await security.logSecurityEvent({
        type: 'permission_denied',
        userId: user.id,
        username: user.username,
        details: {
          required_permission: requiredPermission,
          user_permissions: user.permissions,
          endpoint: c.req.url
        }
      })
      
      return c.json({ 
        success: false, 
        message: `دسترسی غیرمجاز - مجوز ${requiredPermission} مورد نیاز است` 
      }, 403)
    }

    await next()
  }
}

// Rate Limiting Middleware
export function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    try {
      const clientIP = c.req.header('CF-Connecting-IP') || 'unknown'
      const user = c.get('user')
      const identifier = user ? user.id : clientIP
      
      const StorageService = (await import('../services/storage-service')).default
      const storage = new StorageService(c.env)
      
      const rateLimit = await storage.checkRateLimit(identifier, maxRequests, windowSeconds)
      
      // Add rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', rateLimit.remaining.toString())
      c.header('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())
      
      if (!rateLimit.allowed) {
        return c.json({
          success: false,
          message: 'تعداد درخواست‌ها بیش از حد مجاز',
          retry_after: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }, 429)
      }

      await next()
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      await next() // Continue on error
    }
  }
}

// Security Headers Middleware
export async function securityHeaders(c: Context<{ Bindings: Env }>, next: Next) {
  const SecurityService = (await import('../services/security-service')).default
  const security = new SecurityService(c.env)
  
  const headers = security.getSecurityHeaders()
  
  Object.entries(headers).forEach(([key, value]) => {
    c.header(key, value)
  })

  await next()
}

// Demo Mode Restriction Middleware
export async function demoModeRestriction(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user')
  
  if (user && user.role === 'demo') {
    // Check if this is a write operation that affects real data
    const method = c.req.method
    const path = c.req.url
    
    if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && 
        (path.includes('/trading/') && !path.includes('/demo/')) ||
        path.includes('/wallet/transfer') ||
        path.includes('/system/mode')) {
      
      return c.json({
        success: false,
        message: 'در حالت دمو نمی‌توانید این عملیات را انجام دهید',
        demo_mode: true
      }, 403)
    }
  }

  await next()
}

// Session Validation Middleware  
export async function sessionMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    const sessionId = c.req.header('X-Session-ID')
    
    if (!sessionId) {
      await next()
      return
    }

    const SecurityService = (await import('../services/security-service')).default
    const security = new SecurityService(c.env)
    
    const session = await security.getSession(sessionId)
    
    if (!session) {
      return c.json({ 
        success: false, 
        message: 'جلسه منقضی شده یا نامعتبر است',
        session_expired: true 
      }, 401)
    }

    // Add session info to context
    c.set('session', session)

    await next()
  } catch (error) {
    console.error('Session middleware error:', error)
    await next()
  }
}

export default {
  authMiddleware,
  requireRole,
  requirePermission,
  rateLimit,
  securityHeaders,
  demoModeRestriction,
  sessionMiddleware
}