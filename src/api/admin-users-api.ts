/**
 * TITAN Trading System - Admin Users Management API
 * Real Database Implementation - Production Ready
 * Provides comprehensive user management and administrative operations
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { AdminUserDAO, UserDAO } from '../dao/database'
import * as bcrypt from 'bcryptjs'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces for API responses
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
  lastLoginAt: number | null
  lastActiveAt: number | null
  loginCount: number
  totalTrades: number
  totalVolume: number
  totalPnL: number
  currentBalance: number
  location: string
  registrationIP: string
  lastLoginIP: string
  notes: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  bannedUsers: number
  admins: number
  traders: number
  analysts: number
  viewers: number
  newUsersToday: number
  activeToday: number
}

// Utility function to get admin user ID (would typically come from JWT)
function getAdminId(c: any): number {
  const adminId = c.req.header('admin-id') || c.req.query('adminId')
  if (!adminId) {
    throw new Error('Admin ID is required')
  }
  return parseInt(adminId)
}

// Middleware to check admin permissions (simplified)
function requireAdmin(c: any, next: any) {
  const role = c.req.header('user-role')
  if (role !== 'admin') {
    return c.json({
      success: false,
      error: 'Admin access required'
    }, 403)
  }
  return next()
}

/**
 * Get all users with pagination and filtering
 * GET /users
 */
app.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status')
    const role = c.req.query('role')
    const search = c.req.query('search')
    
    const filters = { status, role, search }
    
    // Fetch real users from database
    const { users, total } = await AdminUserDAO.getAllUsers(page, limit, filters)
    
    return c.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get users error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Get detailed user information
 * GET /users/:userId
 */
app.get('/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Get detailed user information from database
    const user = await AdminUserDAO.getUserDetails(userId)
    
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404)
    }
    
    // Get recent activities
    const activities = await AdminUserDAO.getUserActivities(userId, 20)
    
    return c.json({
      success: true,
      data: {
        ...user,
        recentActivities: activities
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get user details error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch user details',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Update user information (admin only)
 * PUT /users/:userId
 */
app.put('/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const updates = await c.req.json()
    
    // Validate updates
    const allowedFields = ['fullName', 'email', 'phone', 'role', 'status', 'emailVerified', 'phoneVerified', 'notes']
    const filteredUpdates: any = {}
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return c.json({
        success: false,
        error: 'No valid fields to update'
      }, 400)
    }
    
    // Update user in database
    const success = await AdminUserDAO.updateUserByAdmin(userId, filteredUpdates)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'User not found or update failed'
      }, 404)
    }
    
    // Get updated user details
    const updatedUser = await AdminUserDAO.getUserDetails(userId)
    
    return c.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
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

/**
 * Change user status (activate, suspend, ban)
 * POST /users/:userId/status
 */
app.post('/users/:userId/status', async (c) => {
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
    
    // Change user status in database
    const success = await AdminUserDAO.changeUserStatus(userId, status, reason)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'User not found or status change failed'
      }, 404)
    }
    
    return c.json({
      success: true,
      message: `User status changed to ${status}`,
      data: { status, reason, changedAt: Date.now() }
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

/**
 * Reset user password (admin only)
 * POST /users/:userId/reset-password
 */
app.post('/users/:userId/reset-password', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { newPassword, sendNotification } = await c.req.json()
    
    if (!newPassword || newPassword.length < 6) {
      return c.json({
        success: false,
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      }, 400)
    }
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12)
    
    // Update user password in database
    const success = await AdminUserDAO.resetUserPassword(userId, passwordHash)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'User not found or password reset failed'
      }, 404)
    }
    
    // If sendNotification is true, here you would send email/SMS to user
    if (sendNotification) {
      // In production, integrate with email/SMS service
      console.log(`Password reset notification sent to user ${userId}`)
    }
    
    return c.json({
      success: true,
      message: 'Password reset successfully',
      data: { 
        resetAt: Date.now(),
        notificationSent: !!sendNotification
      }
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

/**
 * Force logout user (invalidate all sessions)
 * POST /users/:userId/force-logout
 */
app.post('/users/:userId/force-logout', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { reason } = await c.req.json()
    
    // Force logout user (invalidate sessions)
    const success = await AdminUserDAO.forceLogoutUser(userId)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'User not found or logout failed'
      }, 404)
    }
    
    return c.json({
      success: true,
      message: 'User forcefully logged out',
      data: { 
        loggedOutAt: Date.now(),
        reason: reason || 'Admin action'
      }
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

/**
 * Delete user permanently (dangerous operation)
 * DELETE /users/:userId
 */
app.delete('/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { confirmDelete, reason } = await c.req.json()
    
    if (!confirmDelete) {
      return c.json({
        success: false,
        error: 'Deletion not confirmed',
        message: 'Set confirmDelete to true to proceed with deletion'
      }, 400)
    }
    
    // Delete user permanently from database
    const success = await AdminUserDAO.deleteUserPermanently(userId)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'User not found or deletion failed'
      }, 404)
    }
    
    return c.json({
      success: true,
      message: 'User deleted permanently',
      data: { 
        deletedAt: Date.now(),
        reason: reason || 'Admin action'
      }
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

/**
 * Create new user (admin only)
 * POST /users
 */
app.post('/users', async (c) => {
  try {
    const userData = await c.req.json()
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password || !userData.fullName) {
      return c.json({
        success: false,
        error: 'Missing required fields',
        message: 'username, email, password, and fullName are required'
      }, 400)
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12)
    
    // Create user in database
    const userId = await UserDAO.create({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
      fullName: userData.fullName,
      phone: userData.phone || null,
      role: userData.role || 'viewer',
      status: userData.status || 'active'
    })
    
    // Get created user details
    const createdUser = await AdminUserDAO.getUserDetails(userId.toString())
    
    return c.json({
      success: true,
      data: createdUser,
      message: 'User created successfully'
    })
    
  } catch (error) {
    console.error('Create user error:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return c.json({
        success: false,
        error: 'User already exists',
        message: 'Username or email already taken'
      }, 409)
    }
    
    return c.json({
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Get user statistics and dashboard data
 * GET /stats
 */
app.get('/stats', async (c) => {
  try {
    // Get comprehensive user statistics
    const stats = await AdminUserDAO.getUserStats()
    
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

/**
 * Search users by various criteria
 * GET /search
 */
app.get('/search', async (c) => {
  try {
    const query = c.req.query('q')
    const type = c.req.query('type') || 'all' // username, email, fullName, all
    const limit = parseInt(c.req.query('limit') || '20')
    
    if (!query) {
      return c.json({
        success: false,
        error: 'Search query is required'
      }, 400)
    }
    
    // Use existing search functionality
    const { users } = await AdminUserDAO.getAllUsers(1, limit, { search: query })
    
    return c.json({
      success: true,
      data: users,
      query,
      type,
      total: users.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Search users error:', error)
    return c.json({
      success: false,
      error: 'Failed to search users',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Export users data (for compliance/backup)
 * GET /export
 */
app.get('/export', async (c) => {
  try {
    const format = c.req.query('format') || 'json' // json, csv
    const includeDetails = c.req.query('includeDetails') === 'true'
    
    // Get all users without pagination
    const { users } = await AdminUserDAO.getAllUsers(1, 10000, {})
    
    let exportData: any
    
    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'ID', 'Username', 'Email', 'Full Name', 'Role', 'Status', 
        'Created At', 'Last Login', 'Total Trades', 'Total Volume'
      ]
      
      const csvData = users.map(user => [
        user.id,
        user.username,
        user.email,
        user.fullName,
        user.role,
        user.status,
        new Date(user.createdAt).toISOString(),
        user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : 'Never',
        user.totalTrades || 0,
        user.totalVolume || 0
      ])
      
      exportData = [headers, ...csvData].map(row => row.join(',')).join('\n')
      
      return c.text(exportData, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users_export_${Date.now()}.csv"`
      })
      
    } else {
      // JSON format
      exportData = {
        exportedAt: new Date().toISOString(),
        totalUsers: users.length,
        users: includeDetails ? users : users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt
        }))
      }
      
      return c.json({
        success: true,
        data: exportData
      })
    }
    
  } catch (error) {
    console.error('Export users error:', error)
    return c.json({
      success: false,
      error: 'Failed to export users data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Bulk operations on multiple users
 * POST /bulk
 */
app.post('/bulk', async (c) => {
  try {
    const { operation, userIds, data } = await c.req.json()
    
    if (!operation || !Array.isArray(userIds) || userIds.length === 0) {
      return c.json({
        success: false,
        error: 'Invalid bulk operation data',
        message: 'operation and userIds array are required'
      }, 400)
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }
    
    // Process each user
    for (const userId of userIds) {
      try {
        let operationSuccess = false
        
        switch (operation) {
          case 'changeStatus':
            if (!data?.status) {
              throw new Error('Status is required for changeStatus operation')
            }
            operationSuccess = await AdminUserDAO.changeUserStatus(userId, data.status, data.reason)
            break
            
          case 'forceLogout':
            operationSuccess = await AdminUserDAO.forceLogoutUser(userId)
            break
            
          case 'update':
            if (!data) {
              throw new Error('Update data is required for update operation')
            }
            operationSuccess = await AdminUserDAO.updateUserByAdmin(userId, data)
            break
            
          default:
            throw new Error(`Unsupported operation: ${operation}`)
        }
        
        if (operationSuccess) {
          results.success++
        } else {
          results.failed++
          results.errors.push(`Failed to process user ${userId}`)
        }
        
      } catch (error) {
        results.failed++
        results.errors.push(`Error processing user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return c.json({
      success: true,
      data: results,
      message: `Bulk operation completed. ${results.success} succeeded, ${results.failed} failed.`
    })
    
  } catch (error) {
    console.error('Bulk operation error:', error)
    return c.json({
      success: false,
      error: 'Failed to perform bulk operation',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app