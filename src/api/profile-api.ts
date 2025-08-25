import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces
interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string
  avatar: string
  phone: string
  bio: string
  location: string
  timezone: string
  language: string
  role: 'admin' | 'trader' | 'analyst' | 'viewer' | 'demo'
  status: 'active' | 'inactive' | 'suspended' | 'banned'
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  createdAt: number
  lastLoginAt: number
  lastActiveAt: number
  loginCount: number
  settings: {
    notifications: {
      email: boolean
      sms: boolean
      telegram: boolean
      discord: boolean
      trading: boolean
      priceAlerts: boolean
    }
    security: {
      sessionTimeout: number
      maxDevices: number
      ipWhitelist: string[]
      requireApproval: boolean
    }
    trading: {
      defaultMode: 'demo' | 'live'
      riskLevel: 'low' | 'medium' | 'high'
      autoTrade: boolean
      maxPositions: number
    }
    display: {
      theme: 'dark' | 'light'
      currency: 'USD' | 'EUR' | 'IRR'
      timezone: string
      dateFormat: string
    }
  }
}

interface UserSession {
  id: string
  userId: string
  deviceInfo: {
    browser: string
    os: string
    device: string
    ip: string
    location: string
    userAgent: string
  }
  createdAt: number
  lastActiveAt: number
  expiresAt: number
  isActive: boolean
}

interface UserActivity {
  id: string
  userId: string
  type: 'login' | 'logout' | 'trade' | 'deposit' | 'withdraw' | 'settings_change' | 'security_event'
  description: string
  details: any
  ip: string
  device: string
  timestamp: number
  severity: 'info' | 'warning' | 'critical'
}

interface SecurityLog {
  id: string
  userId: string
  event: 'failed_login' | 'suspicious_activity' | 'device_change' | 'location_change' | 'password_change'
  description: string
  ip: string
  location: string
  device: string
  blocked: boolean
  timestamp: number
}

// Get user profile
app.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const profile = generateUserProfile(userId)
    
    return c.json({
      success: true,
      data: profile,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get profile error:', error)
    return c.json({
      success: false,
      error: 'Failed to get user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Update user profile
app.put('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const updates = await c.req.json()
    
    // Validate required fields
    if (!updates || typeof updates !== 'object') {
      return c.json({
        success: false,
        error: 'Invalid update data',
        message: 'Update data is required'
      }, 400)
    }
    
    const updatedProfile = updateUserProfile(userId, updates)
    
    // Log activity
    logUserActivity(userId, 'settings_change', 'Profile updated', updates)
    
    return c.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
    return c.json({
      success: false,
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Upload avatar
app.post('/:userId/avatar', async (c) => {
  try {
    const userId = c.req.param('userId')
    const body = await c.req.arrayBuffer()
    
    if (!body || body.byteLength === 0) {
      return c.json({
        success: false,
        error: 'No image data provided',
        message: 'Please provide image data'
      }, 400)
    }
    
    // In real implementation, upload to R2 or other storage
    const avatarUrl = `https://avatar.example.com/${userId}_${Date.now()}.jpg`
    
    // Update user profile with new avatar
    const updatedProfile = updateUserProfile(userId, { avatar: avatarUrl })
    
    // Log activity
    logUserActivity(userId, 'settings_change', 'Avatar updated', { avatarUrl })
    
    return c.json({
      success: true,
      data: {
        avatarUrl,
        profile: updatedProfile
      },
      message: 'Avatar uploaded successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Upload avatar error:', error)
    return c.json({
      success: false,
      error: 'Failed to upload avatar',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Change password
app.post('/:userId/change-password', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { currentPassword, newPassword, confirmPassword } = await c.req.json()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return c.json({
        success: false,
        error: 'Missing required fields',
        message: 'Current password, new password, and confirmation are required'
      }, 400)
    }
    
    if (newPassword !== confirmPassword) {
      return c.json({
        success: false,
        error: 'Password mismatch',
        message: 'New password and confirmation do not match'
      }, 400)
    }
    
    if (newPassword.length < 8) {
      return c.json({
        success: false,
        error: 'Password too short',
        message: 'Password must be at least 8 characters long'
      }, 400)
    }
    
    // In real implementation, verify current password and update
    const passwordChanged = changeUserPassword(userId, currentPassword, newPassword)
    
    if (!passwordChanged) {
      return c.json({
        success: false,
        error: 'Invalid current password',
        message: 'Current password is incorrect'
      }, 400)
    }
    
    // Log security event
    logSecurityEvent(userId, 'password_change', 'Password changed successfully')
    logUserActivity(userId, 'security_event', 'Password changed', {})
    
    return c.json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Change password error:', error)
    return c.json({
      success: false,
      error: 'Failed to change password',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get user sessions
app.get('/:userId/sessions', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const sessions = getUserSessions(userId)
    
    return c.json({
      success: true,
      data: sessions,
      count: sessions.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get sessions error:', error)
    return c.json({
      success: false,
      error: 'Failed to get user sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Revoke session
app.delete('/:userId/sessions/:sessionId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const sessionId = c.req.param('sessionId')
    
    const revoked = revokeUserSession(userId, sessionId)
    
    if (!revoked) {
      return c.json({
        success: false,
        error: 'Session not found',
        message: 'Session not found or already revoked'
      }, 404)
    }
    
    // Log security event
    logSecurityEvent(userId, 'device_change', `Session ${sessionId} revoked`)
    logUserActivity(userId, 'security_event', 'Session revoked', { sessionId })
    
    return c.json({
      success: true,
      message: 'Session revoked successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Revoke session error:', error)
    return c.json({
      success: false,
      error: 'Failed to revoke session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get user activity log
app.get('/:userId/activity', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '50')
    const type = c.req.query('type')
    
    const activities = getUserActivities(userId, limit, type)
    
    return c.json({
      success: true,
      data: activities,
      count: activities.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get activity error:', error)
    return c.json({
      success: false,
      error: 'Failed to get user activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get security logs
app.get('/:userId/security', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '30')
    
    const securityLogs = getUserSecurityLogs(userId, limit)
    
    return c.json({
      success: true,
      data: securityLogs,
      count: securityLogs.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get security logs error:', error)
    return c.json({
      success: false,
      error: 'Failed to get security logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Toggle 2FA
app.post('/:userId/2fa/toggle', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { enabled, secret } = await c.req.json()
    
    const result = toggleTwoFactor(userId, enabled, secret)
    
    // Log security event
    logSecurityEvent(userId, 'security_event', `2FA ${enabled ? 'enabled' : 'disabled'}`)
    logUserActivity(userId, 'security_event', `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`, {})
    
    return c.json({
      success: true,
      data: result,
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Toggle 2FA error:', error)
    return c.json({
      success: false,
      error: 'Failed to toggle 2FA',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Helper functions
function generateUserProfile(userId: string): UserProfile {
  const users = {
    'admin': {
      username: 'admin@titan.com',
      email: 'admin@titan.com',
      fullName: 'مدیر سیستم تایتان',
      role: 'admin' as const
    },
    'demo_user': {
      username: 'demo@titan.com',
      email: 'demo@titan.com',
      fullName: 'کاربر دمو',
      role: 'demo' as const
    },
    'trader': {
      username: 'trader@titan.com',
      email: 'trader@titan.com',
      fullName: 'معامله‌گر حرفه‌ای',
      role: 'trader' as const
    }
  }
  
  const userInfo = users[userId as keyof typeof users] || users['demo_user']
  
  return {
    id: userId,
    username: userInfo.username,
    email: userInfo.email,
    fullName: userInfo.fullName,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.fullName)}&background=3B82F6&color=ffffff&size=128`,
    phone: '+98 912 345 6789',
    bio: 'کاربر سیستم معاملاتی تایتان',
    location: 'تهران، ایران',
    timezone: 'Asia/Tehran',
    language: 'fa',
    role: userInfo.role,
    status: 'active',
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastLoginAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    lastActiveAt: Date.now() - (5 * 60 * 1000), // 5 minutes ago
    loginCount: 156,
    settings: {
      notifications: {
        email: true,
        sms: false,
        telegram: true,
        discord: false,
        trading: true,
        priceAlerts: true
      },
      security: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxDevices: 3,
        ipWhitelist: [],
        requireApproval: false
      },
      trading: {
        defaultMode: 'demo',
        riskLevel: 'medium',
        autoTrade: false,
        maxPositions: 10
      },
      display: {
        theme: 'dark',
        currency: 'USD',
        timezone: 'Asia/Tehran',
        dateFormat: 'YYYY/MM/DD'
      }
    }
  }
}

function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
  const currentProfile = generateUserProfile(userId)
  
  // Merge updates with current profile
  const updatedProfile = {
    ...currentProfile,
    ...updates,
    id: userId, // Don't allow ID changes
    updatedAt: Date.now()
  }
  
  // In real implementation, save to database
  return updatedProfile
}

function changeUserPassword(userId: string, currentPassword: string, newPassword: string): boolean {
  // In real implementation, verify current password and hash new password
  return currentPassword === 'admin123' || currentPassword === 'demo123' // Mock validation
}

function getUserSessions(userId: string): UserSession[] {
  const sessions: UserSession[] = []
  
  // Generate mock sessions
  const devices = [
    { browser: 'Chrome 120', os: 'Windows 11', device: 'Desktop', ip: '192.168.1.100', location: 'تهران، ایران' },
    { browser: 'Safari 17', os: 'iOS 17', device: 'iPhone 15', ip: '192.168.1.101', location: 'تهران، ایران' },
    { browser: 'Firefox 121', os: 'macOS 14', device: 'MacBook Pro', ip: '10.0.0.50', location: 'اصفهان، ایران' }
  ]
  
  devices.forEach((device, index) => {
    sessions.push({
      id: `session_${userId}_${index + 1}`,
      userId,
      deviceInfo: {
        ...device,
        userAgent: `Mozilla/5.0 (${device.os}) ${device.browser}`
      },
      createdAt: Date.now() - (index * 2 * 60 * 60 * 1000), // Hours apart
      lastActiveAt: Date.now() - (index * 30 * 60 * 1000), // 30 mins apart
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      isActive: index === 0 // First session is current
    })
  })
  
  return sessions
}

function revokeUserSession(userId: string, sessionId: string): boolean {
  // In real implementation, invalidate the session
  return sessionId.includes(userId)
}

function getUserActivities(userId: string, limit: number, type?: string): UserActivity[] {
  const activities: UserActivity[] = []
  
  const activityTypes = [
    { type: 'login', description: 'ورود موفق به سیستم', severity: 'info' },
    { type: 'trade', description: 'انجام معامله BTC/USDT', severity: 'info' },
    { type: 'settings_change', description: 'تغییر تنظیمات پروفایل', severity: 'info' },
    { type: 'security_event', description: 'تغییر رمز عبور', severity: 'warning' },
    { type: 'deposit', description: 'واریز 1000 USDT', severity: 'info' },
    { type: 'withdraw', description: 'برداشت 500 USDT', severity: 'warning' }
  ]
  
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    
    if (!type || activity.type === type) {
      activities.push({
        id: `activity_${userId}_${i + 1}`,
        userId,
        type: activity.type as any,
        description: activity.description,
        details: { amount: Math.random() * 1000, symbol: 'BTC' },
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        timestamp: Date.now() - (i * 60 * 60 * 1000), // Hours apart
        severity: activity.severity as any
      })
    }
  }
  
  return activities.sort((a, b) => b.timestamp - a.timestamp)
}

function getUserSecurityLogs(userId: string, limit: number): SecurityLog[] {
  const logs: SecurityLog[] = []
  
  const events = [
    { event: 'failed_login', description: 'تلاش ناموفق برای ورود', blocked: true },
    { event: 'device_change', description: 'ورود از دستگاه جدید', blocked: false },
    { event: 'location_change', description: 'ورود از مکان جدید', blocked: false },
    { event: 'suspicious_activity', description: 'فعالیت مشکوک شناسایی شد', blocked: true }
  ]
  
  for (let i = 0; i < Math.min(limit, 10); i++) {
    const event = events[Math.floor(Math.random() * events.length)]
    
    logs.push({
      id: `security_${userId}_${i + 1}`,
      userId,
      event: event.event as any,
      description: event.description,
      ip: `192.168.1.${100 + i}`,
      location: i % 2 === 0 ? 'تهران، ایران' : 'اصفهان، ایران',
      device: 'Chrome/Windows',
      blocked: event.blocked,
      timestamp: Date.now() - (i * 2 * 60 * 60 * 1000) // Hours apart
    })
  }
  
  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

function toggleTwoFactor(userId: string, enabled: boolean, secret?: string): any {
  // In real implementation, handle TOTP setup
  return {
    enabled,
    secret: enabled ? 'JBSWY3DPEHPK3PXP' : null,
    qrCode: enabled ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/TITAN:${userId}?secret=JBSWY3DPEHPK3PXP&issuer=TITAN` : null
  }
}

function logUserActivity(userId: string, type: string, description: string, details: any) {
  // In real implementation, log to database
  console.log(`User Activity: ${userId} - ${type} - ${description}`, details)
}

function logSecurityEvent(userId: string, event: string, description: string) {
  // In real implementation, log to security system
  console.log(`Security Event: ${userId} - ${event} - ${description}`)
}

export default app