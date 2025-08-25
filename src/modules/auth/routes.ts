import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'

export const authRoutes = new Hono<{ Bindings: Env }>()

// User roles and access levels
const USER_ROLES = {
  ADMIN: 'admin',
  TRADER: 'trader', 
  ANALYST: 'analyst',
  VIEWER: 'viewer',
  DEMO: 'demo'
}

const ACCESS_LEVELS = {
  FULL: 'full',
  LIMITED: 'limited',
  READ_ONLY: 'read_only',
  DEMO: 'demo'
}

// Demo users (in production, these would be in database)
const DEMO_USERS = {
  'admin@titan.com': { password: 'admin123', role: USER_ROLES.ADMIN, access: ACCESS_LEVELS.FULL },
  'trader@titan.com': { password: 'trader123', role: USER_ROLES.TRADER, access: ACCESS_LEVELS.LIMITED },
  'analyst@titan.com': { password: 'analyst123', role: USER_ROLES.ANALYST, access: ACCESS_LEVELS.LIMITED },
  'viewer@titan.com': { password: 'viewer123', role: USER_ROLES.VIEWER, access: ACCESS_LEVELS.READ_ONLY },
  'demo@titan.com': { password: 'demo123', role: USER_ROLES.DEMO, access: ACCESS_LEVELS.DEMO }
}

// Get permissions for role
function getPermissionsForRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    admin: ['*'],
    trader: ['trade', 'view_portfolio', 'view_analytics', 'chat'],
    analyst: ['view_portfolio', 'view_analytics', 'chat', 'analysis'],
    viewer: ['view_portfolio', 'view_analytics'],
    demo: ['demo_trade', 'view_demo', 'chat']
  }
  return permissions[role] || []
}

// Enhanced Login with Security Service
authRoutes.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    if (!username || !password) {
      return c.json({ success: false, message: 'نام کاربری و رمز عبور الزامی است' }, 400)
    }

    const SecurityService = (await import('../../services/security-service')).default
    const security = new SecurityService(c.env)
    
    // Check rate limiting
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown'
    const rateLimit = await security.checkLoginAttempts(clientIP)
    
    if (!rateLimit.allowed) {
      await security.logSecurityEvent({
        type: 'failed_login',
        username,
        ipAddress: clientIP,
        details: { reason: 'rate_limited' }
      })
      
      return c.json({ 
        success: false, 
        message: `تعداد تلاش‌های ورود بیش از حد. تا ${Math.ceil((rateLimit.lockedUntil! - Date.now()) / 60000)} دقیقه دیگر منتظر بمانید`,
        locked_until: rateLimit.lockedUntil
      }, 429)
    }

    // Check demo users (in production, check database)
    const user = DEMO_USERS[username as keyof typeof DEMO_USERS]
    
    if (!user || user.password !== password) {
      // Record failed attempt
      await security.recordLoginAttempt(clientIP, false)
      await security.logSecurityEvent({
        type: 'failed_login',
        username,
        ipAddress: clientIP,
        userAgent: c.req.header('User-Agent'),
        details: { reason: 'invalid_credentials' }
      })
      
      return c.json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' }, 401)
    }

    // Success - record successful login
    await security.recordLoginAttempt(clientIP, true)
    
    // Generate JWT token
    const jwtToken = await security.generateJWT({
      id: username,
      username,
      role: user.role,
      access: user.access,
      permissions: getPermissionsForRole(user.role)
    })
    
    // Create session
    const sessionId = await security.createSession(username, {
      username,
      role: user.role,
      ipAddress: clientIP,
      userAgent: c.req.header('User-Agent')
    })

    // Log successful login
    await security.logSecurityEvent({
      type: 'login',
      userId: username,
      username,
      ipAddress: clientIP,
      userAgent: c.req.header('User-Agent')
    })

    return c.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: username,
        username,
        role: user.role,
        access: user.access,
        permissions: getPermissionsForRole(user.role)
      },
      token: jwtToken,
      session_id: sessionId
    })

  } catch (error) {
    return c.json({ success: false, message: 'خطا در ورود به سیستم' }, 500)
  }
})

// Verify JWT token
authRoutes.post('/verify', async (c) => {
  try {
    const { token } = await c.req.json()
    
    if (!token) {
      return c.json({ success: false, message: 'توکن ارسال نشده' }, 400)
    }

    const SecurityService = (await import('../../services/security-service')).default
    const security = new SecurityService(c.env)
    
    // Verify JWT token
    const payload = await security.verifyJWT(token)
    
    if (!payload) {
      return c.json({ success: false, message: 'توکن نامعتبر یا منقضی شده' }, 401)
    }

    return c.json({
      success: true,
      user: {
        id: payload.id,
        username: payload.username,
        role: payload.role,
        access: payload.access,
        permissions: payload.permissions
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در تأیید توکن' }, 500)
  }
})

// Enhanced Logout
authRoutes.post('/logout', async (c) => {
  try {
    const { token, session_id } = await c.req.json()
    
    if (!token && !session_id) {
      return c.json({ success: false, message: 'توکن یا شناسه جلسه ارسال نشده' }, 400)
    }

    const SecurityService = (await import('../../services/security-service')).default
    const security = new SecurityService(c.env)
    
    let username = ''
    
    // Get user info from token
    if (token) {
      const payload = await security.verifyJWT(token)
      if (payload) {
        username = payload.username
      }
    }
    
    // Destroy session
    if (session_id) {
      await security.destroySession(session_id)
    }
    
    // Log logout event
    await security.logSecurityEvent({
      type: 'logout',
      userId: username,
      username,
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    })

    return c.json({
      success: true,
      message: 'خروج موفقیت‌آمیز'
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در خروج از سیستم' }, 500)
  }
})

// Refresh Token
authRoutes.post('/refresh', async (c) => {
  try {
    const { token } = await c.req.json()
    
    if (!token) {
      return c.json({ success: false, message: 'توکن ارسال نشده' }, 400)
    }

    const SecurityService = (await import('../../services/security-service')).default
    const security = new SecurityService(c.env)
    
    const newToken = await security.refreshToken(token)
    
    if (!newToken) {
      return c.json({ success: false, message: 'توکن نامعتبر یا منقضی شده' }, 401)
    }

    return c.json({
      success: true,
      token: newToken,
      message: 'توکن تمدید شد'
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در تمدید توکن' }, 500)
  }
})

export default authRoutes