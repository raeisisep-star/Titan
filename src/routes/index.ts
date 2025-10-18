/**
 * Route Index - Mount all API routes
 * Central location for all route mounting
 */

import { Hono } from 'hono'
import portfolioRoutes from './portfolio'
import marketRoutes from './market'
import dashboardRoutes from './dashboard'
import authRoutes from './auth-fixed'

export function mountNewRoutes(app: Hono) {
  // Auth routes with fixed login response format
  app.route('/api/auth', authRoutes)
  
  // Portfolio routes with metadata signatures
  app.route('/api/portfolio', portfolioRoutes)
  
  // Market data routes with metadata signatures
  app.route('/api/market', marketRoutes)
  
  // Dashboard routes with comprehensive orchestration
  app.route('/api/dashboard', dashboardRoutes)
  
  console.log('✅ New API routes mounted: /api/auth, /api/portfolio, /api/market, /api/dashboard')
}
