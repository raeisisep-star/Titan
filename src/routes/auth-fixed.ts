/**
 * Auth Routes - Fixed Login with Proper Response Format
 */

import { Hono } from 'hono'

const app = new Hono()

// Login endpoint with frontend-compatible response
app.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    console.log('🔐 Login attempt:', body.username || body.email)
    
    // Demo authentication - accepts multiple credentials
    const validCredentials = [
      { username: 'testuser', password: 'testpass123' },
      { username: 'demo', password: 'demo123' },
      { username: 'admin', password: 'admin' },
      { email: 'demo@titan.dev', password: 'admin123' },
      { email: 'admin@titan.com', password: 'admin123' }
    ]
    
    let isValid = false
    
    // Check username or email
    for (const cred of validCredentials) {
      if (body.username && cred.username === body.username && cred.password === body.password) {
        isValid = true
        break
      }
      if (body.email && cred.email === body.email && cred.password === body.password) {
        isValid = true
        break
      }
    }
    
    if (isValid) {
      const user = {
        id: '1',
        username: body.username || 'demo_user',
        email: body.email || 'demo@titan.dev',
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
        timezone: 'Asia/Tehran',
        language: 'fa',
        isActive: true,
        isVerified: true,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const accessToken = 'demo_token_' + Date.now()
      
      console.log('✅ Login successful for:', body.username || body.email)
      
      // Return BOTH formats for maximum compatibility
      return c.json({ 
        success: true,
        data: {
          token: accessToken,  // Frontend expects this
          user: user
        },
        session: {  // Legacy format
          accessToken: accessToken,
          user: user
        }
      })
    } else {
      console.log('❌ Invalid credentials')
      return c.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, 401)
    }
  } catch (error: any) {
    console.error('❌ Login error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Login failed' 
    }, 500)
  }
})

// Register endpoint
app.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    console.log('📝 Registration attempt:', body.email)
    
    const user = {
      id: '1',
      username: body.username || 'demo_user',
      email: body.email,
      firstName: body.firstName || 'Demo',
      lastName: body.lastName || 'User',
      timezone: 'Asia/Tehran',
      language: 'fa',
      isActive: true,
      isVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('✅ Registration successful:', body.email)
    return c.json({ success: true, user: user }, 201)
  } catch (error: any) {
    console.error('❌ Registration error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Registration failed' 
    }, 500)
  }
})

// Verify token endpoint
app.get('/verify', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'No token provided' }, 401)
    }
    
    const token = authorization.substring(7)
    
    // Simple validation for demo tokens
    if (token.startsWith('demo_token_')) {
      return c.json({
        success: true,
        user: {
          id: '1',
          username: 'demo_user',
          email: 'demo@titan.dev',
          role: 'admin'
        }
      })
    }
    
    return c.json({ success: false, error: 'Invalid token' }, 401)
  } catch (error: any) {
    console.error('❌ Verify error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Verification failed' 
    }, 500)
  }
})

export default app
