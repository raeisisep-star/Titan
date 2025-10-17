/**
 * Route Index - Mount all API routes
 * Central location for all route mounting
 */

import { Hono } from 'hono'
import portfolioRoutes from './portfolio'
import marketRoutes from './market'

export function mountNewRoutes(app: Hono) {
  // Portfolio routes with metadata signatures
  app.route('/api/portfolio', portfolioRoutes)
  
  // Market data routes with metadata signatures
  app.route('/api/market', marketRoutes)
  
  console.log('✅ New API routes mounted: /api/portfolio, /api/market')
}
