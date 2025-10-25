/**
 * Demo Mode Middleware
 * Task-7: Intercept real trading requests and redirect to demo when DEMO_MODE is active
 */

import { Context, Next } from 'hono';
import { FeatureFlagsService, EnvFeatureFlags } from '../feature-flags';

/**
 * Middleware to enforce demo mode on trading endpoints
 * When DEMO_MODE=true (global) or user.trading_mode='demo', redirect to demo execution
 */
export function demoModeMiddleware(featureFlagsService: FeatureFlagsService) {
  return async (c: Context, next: Next) => {
    const path = c.req.path;
    
    // Only apply to trading endpoints
    const tradingEndpoints = [
      '/api/manual-trading/order',
      '/api/autopilot/start',
      '/api/manual-trading/orders/cancel'
    ];
    
    if (!tradingEndpoints.some(endpoint => path.includes(endpoint))) {
      return next();
    }
    
    // Check if demo mode is active
    const userId = c.get('userId'); // Assumes auth middleware sets this
    
    if (!userId) {
      return next(); // Let auth middleware handle
    }
    
    // Check global DEMO_MODE environment variable first
    const globalDemoMode = EnvFeatureFlags.isDemoMode();
    
    // Check database-level demo mode setting
    const shouldUseDemoFromDB = await featureFlagsService.shouldUseDemoMode(userId);
    
    const shouldUseDemo = globalDemoMode || shouldUseDemoFromDB;
    
    if (shouldUseDemo) {
      // Add demo flag to context for downstream handlers
      c.set('forceDemo', true);
      c.set('demoReason', globalDemoMode ? 'global_demo_mode' : 'user_preference');
      
      // Log warning
      console.warn(`[DEMO MODE] User ${userId} trading request redirected to demo`, {
        path,
        reason: globalDemoMode ? 'DEMO_MODE=true' : 'user_trading_mode=demo'
      });
    }
    
    return next();
  };
}

/**
 * Helper to check if request should be executed in demo mode
 */
export function isDemoRequest(c: Context): boolean {
  return c.get('forceDemo') === true;
}

/**
 * Helper to get demo mode reason
 */
export function getDemoReason(c: Context): string | null {
  return c.get('demoReason') ?? null;
}
