import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces
interface AdminUserData {
  id: string
  username: string
  email: string
  fullName: string
  avatar: string
  phone: string
  role: 'admin' | 'trader' | 'analyst' | 'viewer' | 'demo'
  status: 'active' | 'inactive' | 'suspended' | 'banned'
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  createdAt: number
  lastLoginAt: number
  lastActiveAt: number
  loginCount: number
  totalTrades: number
  totalVolume: number
  totalPnL: number
  currentBalance: number
  activeSessions: number
  suspiciousActivities: number
  location: string
  registrationIP: string
  lastLoginIP: string
  notes: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  onlineUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  suspendedUsers: number
  bannedUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  totalTrades: number
  totalVolume: number
  suspiciousActivities: number
}

interface SuspiciousActivity {
  id: string
  userId: string
  username: string
  type: 'multiple_login_attempts' | 'unusual_location' | 'high_volume_trades' | 'api_abuse' | 'bot_activity'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  ip: string
  location: string
  resolved: boolean
  adminNotes: string
}

// Get users statistics
app.get('/stats', async (c) => {
  try {
    const stats = getUserStats()
    
    return c.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get user stats error:', error)
    return c.json({
      success: false,
      error: 'Failed to get user statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get all users with filtering and pagination
app.get('/list', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const role = c.req.query('role')
    const search = c.req.query('search')
    const sortBy = c.req.query('sortBy') || 'lastActiveAt'
    const sortOrder = c.req.query('sortOrder') || 'desc'
    
    const { users, total } = getAllUsers(page, limit, { status, role, search, sortBy, sortOrder })
    
    return c.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get users list error:', error)
    return c.json({
      success: false,
      error: 'Failed to get users list',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get suspicious activities - MUST be before /:userId route
app.get('/suspicious-activities', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100')
    const severity = c.req.query('severity')
    const resolved = c.req.query('resolved')
    
    const activities = getSuspiciousActivities(limit, { severity, resolved })
    
    return c.json({
      success: true,
      data: activities,
      count: activities.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get suspicious activities error:', error)
    return c.json({
      success: false,
      error: 'Failed to get suspicious activities',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Resolve suspicious activity - MUST be before /:userId route
app.post('/suspicious-activities/:activityId/resolve', async (c) => {
  try {
    const activityId = c.req.param('activityId')
    const { adminNotes, action } = await c.req.json()
    
    const resolved = resolveSuspiciousActivity(activityId, adminNotes, action)
    
    if (!resolved) {
      return c.json({
        success: false,
        error: 'Activity not found',
        message: 'Suspicious activity not found'
      }, 404)
    }
    
    // Log admin action
    logAdminAction('resolve_suspicious', activityId, { adminNotes, action })
    
    return c.json({
      success: true,
      message: 'Suspicious activity resolved',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Resolve suspicious activity error:', error)
    return c.json({
      success: false,
      error: 'Failed to resolve suspicious activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get specific user details for admin view
app.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const userDetails = getAdminUserDetails(userId)
    
    if (!userDetails) {
      return c.json({
        success: false,
        error: 'User not found',
        message: 'User not found in system'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: userDetails,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get user details error:', error)
    return c.json({
      success: false,
      error: 'Failed to get user details',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Update user details (admin only)
app.put('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const updates = await c.req.json()
    
    if (!updates || typeof updates !== 'object') {
      return c.json({
        success: false,
        error: 'Invalid update data',
        message: 'Update data is required'
      }, 400)
    }
    
    const updatedUser = updateUserByAdmin(userId, updates)
    
    if (!updatedUser) {
      return c.json({
        success: false,
        error: 'User not found',
        message: 'User not found or update failed'
      }, 404)
    }
    
    // Log admin action
    logAdminAction('update_user', userId, updates)
    
    return c.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Update user error:', error)
    return c.json({
      success: false,
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Change user status (activate/deactivate/suspend/ban)
app.post('/:userId/status', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { status, reason } = await c.req.json()
    
    if (!status || !['active', 'inactive', 'suspended', 'banned'].includes(status)) {
      return c.json({
        success: false,
        error: 'Invalid status',
        message: 'Status must be one of: active, inactive, suspended, banned'
      }, 400)
    }
    
    const updatedUser = changeUserStatus(userId, status, reason)
    
    if (!updatedUser) {
      return c.json({
        success: false,
        error: 'User not found',
        message: 'User not found or status change failed'
      }, 404)
    }
    
    // Log admin action
    logAdminAction('change_status', userId, { status, reason })
    
    return c.json({
      success: true,
      data: updatedUser,
      message: `User status changed to ${status}`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Change user status error:', error)
    return c.json({
      success: false,
      error: 'Failed to change user status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Delete user (permanent)
app.delete('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { confirmation } = await c.req.json()
    
    if (!confirmation || confirmation !== 'DELETE_USER_PERMANENTLY') {
      return c.json({
        success: false,
        error: 'Confirmation required',
        message: 'Please provide confirmation: DELETE_USER_PERMANENTLY'
      }, 400)
    }
    
    const deleted = deleteUserPermanently(userId)
    
    if (!deleted) {
      return c.json({
        success: false,
        error: 'User not found',
        message: 'User not found or deletion failed'
      }, 404)
    }
    
    // Log admin action
    logAdminAction('delete_user', userId, { permanent: true })
    
    return c.json({
      success: true,
      message: 'User deleted permanently',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Delete user error:', error)
    return c.json({
      success: false,
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Reset user password (admin action)
app.post('/:userId/reset-password', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { temporaryPassword } = await c.req.json()
    
    const newPassword = temporaryPassword || generateTemporaryPassword()
    const resetResult = resetUserPasswordByAdmin(userId, newPassword)
    
    if (!resetResult) {
      return c.json({
        success: false,
        error: 'User not found',
        message: 'User not found or password reset failed'
      }, 404)
    }
    
    // Log admin action
    logAdminAction('reset_password', userId, { temporaryPassword: true })
    
    return c.json({
      success: true,
      data: {
        temporaryPassword: newPassword,
        mustChangeOnLogin: true
      },
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Reset password error:', error)
    return c.json({
      success: false,
      error: 'Failed to reset password',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Force logout user from all devices
app.post('/:userId/force-logout', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const loggedOut = forceLogoutUser(userId)
    
    if (!loggedOut) {
      return c.json({
        success: false,
        error: 'User not found',
        message: 'User not found or logout failed'
      }, 404)
    }
    
    // Log admin action
    logAdminAction('force_logout', userId, { allDevices: true })
    
    return c.json({
      success: true,
      message: 'User logged out from all devices',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Force logout error:', error)
    return c.json({
      success: false,
      error: 'Failed to force logout',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create new user (admin creation)
app.post('/create', async (c) => {
  try {
    const userData = await c.req.json()
    
    if (!userData.username || !userData.email || !userData.password) {
      return c.json({
        success: false,
        error: 'Missing required fields',
        message: 'Username, email, and password are required'
      }, 400)
    }
    
    const newUser = createUserByAdmin(userData)
    
    if (!newUser) {
      return c.json({
        success: false,
        error: 'User creation failed',
        message: 'Username or email already exists'
      }, 400)
    }
    
    // Log admin action
    logAdminAction('create_user', newUser.id, userData)
    
    return c.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Create user error:', error)
    return c.json({
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Helper functions
function getUserStats(): UserStats {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay
  
  return {
    totalUsers: 1247,
    activeUsers: 856,
    onlineUsers: 43,
    newUsersToday: 12,
    newUsersThisWeek: 89,
    newUsersThisMonth: 342,
    suspendedUsers: 15,
    bannedUsers: 8,
    verifiedUsers: 1089,
    unverifiedUsers: 158,
    totalTrades: 45673,
    totalVolume: 12850000,
    suspiciousActivities: 23
  }
}

function getAllUsers(page: number, limit: number, filters: any): { users: AdminUserData[], total: number } {
  const users: AdminUserData[] = []
  
  // Generate mock users
  const userTemplates = [
    { username: 'admin@titan.com', fullName: 'مدیر سیستم', role: 'admin' as const },
    { username: 'trader1@example.com', fullName: 'علی رضایی', role: 'trader' as const },
    { username: 'analyst1@example.com', fullName: 'سارا احمدی', role: 'analyst' as const },
    { username: 'viewer1@example.com', fullName: 'محمد حسینی', role: 'viewer' as const },
    { username: 'demo@titan.com', fullName: 'کاربر دمو', role: 'demo' as const }
  ]
  
  for (let i = 0; i < limit && i < 50; i++) {
    const template = userTemplates[i % userTemplates.length]
    const userId = `user_${i + 1}`
    
    users.push({
      id: userId,
      username: i === 0 ? template.username : `user${i + 1}@example.com`,
      email: i === 0 ? template.username : `user${i + 1}@example.com`,
      fullName: i === 0 ? template.fullName : `کاربر ${i + 1}`,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(template.fullName)}&background=3B82F6&color=ffffff&size=64`,
      phone: `+98 912 ${(i + 1).toString().padStart(3, '0')} ${(i * 123).toString().padStart(4, '0')}`,
      role: template.role,
      status: i < 40 ? 'active' : (i < 45 ? 'inactive' : (i < 48 ? 'suspended' : 'banned')),
      emailVerified: i < 42,
      phoneVerified: i < 35,
      twoFactorEnabled: i < 20,
      createdAt: Date.now() - (i * 24 * 60 * 60 * 1000),
      lastLoginAt: Date.now() - (i * 60 * 60 * 1000),
      lastActiveAt: Date.now() - (i * 30 * 60 * 1000),
      loginCount: 100 + i * 10,
      totalTrades: i * 15,
      totalVolume: i * 50000,
      totalPnL: (Math.random() - 0.5) * 10000,
      currentBalance: Math.random() * 100000,
      activeSessions: Math.floor(Math.random() * 4) + 1,
      suspiciousActivities: i > 40 ? Math.floor(Math.random() * 5) : 0,
      location: i % 3 === 0 ? 'تهران' : (i % 3 === 1 ? 'اصفهان' : 'مشهد'),
      registrationIP: `192.168.${Math.floor(i / 10)}.${(i % 10) + 1}`,
      lastLoginIP: `192.168.${Math.floor(i / 10)}.${(i % 10) + 1}`,
      notes: i > 45 ? 'کاربر مشکوک - نیاز به بررسی' : ''
    })
  }
  
  return {
    users: users.filter(user => {
      if (filters.status && user.status !== filters.status) return false
      if (filters.role && user.role !== filters.role) return false
      if (filters.search) {
        const search = filters.search.toLowerCase()
        return user.username.toLowerCase().includes(search) || 
               user.fullName.toLowerCase().includes(search) ||
               user.email.toLowerCase().includes(search)
      }
      return true
    }),
    total: 1247
  }
}

function getAdminUserDetails(userId: string): AdminUserData | null {
  const { users } = getAllUsers(1, 50, {})
  return users.find(u => u.id === userId) || null
}

function updateUserByAdmin(userId: string, updates: any): AdminUserData | null {
  // In real implementation, update database
  const user = getAdminUserDetails(userId)
  if (!user) return null
  
  return { ...user, ...updates, updatedAt: Date.now() }
}

function changeUserStatus(userId: string, status: string, reason?: string): AdminUserData | null {
  const user = getAdminUserDetails(userId)
  if (!user) return null
  
  return { ...user, status: status as any, statusReason: reason, statusChangedAt: Date.now() }
}

function deleteUserPermanently(userId: string): boolean {
  // In real implementation, delete from database
  const user = getAdminUserDetails(userId)
  return !!user
}

function resetUserPasswordByAdmin(userId: string, newPassword: string): boolean {
  // In real implementation, hash and save new password
  const user = getAdminUserDetails(userId)
  return !!user
}

function forceLogoutUser(userId: string): boolean {
  // In real implementation, invalidate all user sessions
  const user = getAdminUserDetails(userId)
  return !!user
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function getSuspiciousActivities(limit: number, filters: any): SuspiciousActivity[] {
  const activities: SuspiciousActivity[] = []
  
  const activityTypes = [
    { type: 'multiple_login_attempts', description: 'تلاش‌های متعدد برای ورود ناموفق', severity: 'high' },
    { type: 'unusual_location', description: 'ورود از مکان غیرعادی', severity: 'medium' },
    { type: 'high_volume_trades', description: 'معاملات با حجم بالای غیرعادی', severity: 'medium' },
    { type: 'api_abuse', description: 'استفاده نادرست از API', severity: 'high' },
    { type: 'bot_activity', description: 'فعالیت مشکوک ربات', severity: 'critical' }
  ]
  
  for (let i = 0; i < Math.min(limit, 30); i++) {
    const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    
    activities.push({
      id: `suspicious_${i + 1}`,
      userId: `user_${Math.floor(Math.random() * 50) + 1}`,
      username: `user${Math.floor(Math.random() * 50) + 1}@example.com`,
      type: activity.type as any,
      description: activity.description,
      severity: activity.severity as any,
      timestamp: Date.now() - (i * 60 * 60 * 1000),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: ['تهران', 'اصفهان', 'مشهد', 'شیراز'][Math.floor(Math.random() * 4)],
      resolved: i > 20,
      adminNotes: i > 20 ? 'بررسی شد - مشکلی وجود ندارد' : ''
    })
  }
  
  return activities.filter(activity => {
    if (filters.severity && activity.severity !== filters.severity) return false
    if (filters.resolved !== undefined) {
      const isResolved = filters.resolved === 'true'
      if (activity.resolved !== isResolved) return false
    }
    return true
  })
}

function resolveSuspiciousActivity(activityId: string, adminNotes: string, action?: string): boolean {
  // In real implementation, update database
  return activityId.includes('suspicious_')
}

function createUserByAdmin(userData: any): AdminUserData | null {
  // In real implementation, validate and create user
  const newUserId = `user_${Date.now()}`
  
  return {
    id: newUserId,
    username: userData.username,
    email: userData.email,
    fullName: userData.fullName || userData.username,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || userData.username)}&background=3B82F6&color=ffffff&size=64`,
    phone: userData.phone || '',
    role: userData.role || 'viewer',
    status: 'active',
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    createdAt: Date.now(),
    lastLoginAt: 0,
    lastActiveAt: 0,
    loginCount: 0,
    totalTrades: 0,
    totalVolume: 0,
    totalPnL: 0,
    currentBalance: 0,
    activeSessions: 0,
    suspiciousActivities: 0,
    location: 'نامشخص',
    registrationIP: '0.0.0.0',
    lastLoginIP: '0.0.0.0',
    notes: 'ایجاد شده توسط مدیر سیستم'
  }
}

function logAdminAction(action: string, targetUserId: string, details: any) {
  // In real implementation, log admin actions for audit
  console.log(`Admin Action: ${action} - Target: ${targetUserId}`, details)
}

export default app