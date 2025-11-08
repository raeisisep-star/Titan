// backend/routes/compat.js
const { Hono } = require('hono');
const router = new Hono();

/**
 * Compatibility Router for Legacy Frontend Endpoints
 * 
 * This router provides backward compatibility with old API paths
 * that the frontend still uses. It serves mock data when INTERNAL_APIS_DEMO=true
 * and redirects or proxies to new endpoints where appropriate.
 * 
 * NOTE: This is a temporary solution until frontend is fully migrated to new API structure.
 */

const isDemoMode = () => process.env.INTERNAL_APIS_DEMO === 'true';

// --- Mock Data Helpers ---
const agentsMock = [
  { 
    id: 1, 
    agentId: 'agent-01', 
    name: 'Market Sentiment Analyzer', 
    status: 'active', 
    health: 'good', 
    lastRun: new Date().toISOString(),
    performance: { successRate: 98.5, avgResponseTime: 250, totalRequests: 1547 } 
  },
  { 
    id: 2, 
    agentId: 'agent-02', 
    name: 'News Classifier', 
    status: 'active', 
    health: 'good', 
    lastRun: new Date().toISOString(),
    performance: { successRate: 97.1, avgResponseTime: 230, totalRequests: 1022 } 
  },
  { 
    id: 3, 
    agentId: 'agent-03', 
    name: 'Sentiment Scorer', 
    status: 'active', 
    health: 'good', 
    lastRun: new Date().toISOString(),
    performance: { successRate: 99.0, avgResponseTime: 180, totalRequests: 2450 } 
  },
  { 
    id: 4, 
    agentId: 'agent-04', 
    name: 'Portfolio Optimization', 
    status: 'degraded', 
    health: 'warn', 
    lastRun: new Date().toISOString(),
    performance: { successRate: 80.0, avgResponseTime: 450, totalRequests: 740 } 
  },
  { 
    id: 11, 
    agentId: 'agent-11', 
    name: 'Portfolio Optimization (ESM)', 
    status: 'active', 
    health: 'good', 
    lastRun: new Date().toISOString(),
    performance: { successRate: 98.9, avgResponseTime: 210, totalRequests: 320 } 
  },
  { 
    id: 14, 
    agentId: 'agent-14', 
    name: 'Performance Analytics', 
    status: 'active', 
    health: 'good', 
    lastRun: new Date().toISOString(),
    performance: { successRate: 99.2, avgResponseTime: 200, totalRequests: 610 } 
  },
  { 
    id: 15, 
    agentId: 'agent-15', 
    name: 'System Orchestrator', 
    status: 'active', 
    health: 'good', 
    lastRun: new Date().toISOString(),
    performance: { successRate: 97.5, avgResponseTime: 260, totalRequests: 990 } 
  },
];

// Response helpers
function ok(data) { 
  return { success: true, data, timestamp: new Date().toISOString() }; 
}

function err404(msg = 'Not Found') { 
  return { success: false, error: msg, timestamp: new Date().toISOString() }; 
}

// ---------- Legacy Endpoint Aliases ----------

/**
 * GET /api/ai/overview
 * Legacy endpoint for AI dashboard overview
 * New endpoint: /api/ai-analytics/agents (with aggregation on frontend)
 */
router.get('/ai/overview', async (c) => {
  if (!isDemoMode()) {
    return c.json(err404('Endpoint not available in production mode'), 404);
  }
  
  const overview = {
    agents: agentsMock.length,
    activeAgents: agentsMock.filter(a => a.status === 'active').length,
    degradedAgents: agentsMock.filter(a => a.status === 'degraded').length,
    inactiveAgents: agentsMock.filter(a => a.status === 'inactive').length,
    totalRequests: agentsMock.reduce((sum, a) => sum + a.performance.totalRequests, 0),
    avgSuccessRate: (agentsMock.reduce((sum, a) => sum + a.performance.successRate, 0) / agentsMock.length).toFixed(2),
    lastUpdated: new Date().toISOString()
  };
  
  return c.json(ok(overview));
});

/**
 * GET /api/agents/:id/status
 * Legacy endpoint for agent status
 * New endpoint: /api/ai-analytics/agents/:id
 */
router.get('/agents/:id/status', async (c) => {
  if (!isDemoMode()) {
    return c.json(err404('Endpoint not available in production mode'), 404);
  }
  
  const id = parseInt(c.req.param('id'), 10);
  const agent = agentsMock.find(x => x.id === id) || 
                agentsMock.find(x => x.agentId === `agent-${String(id).padStart(2, '0')}`);
  
  if (!agent) {
    return c.json(err404('Agent not found'), 404);
  }
  
  const statusData = {
    id: agent.id,
    agentId: agent.agentId,
    name: agent.name,
    status: agent.status,
    health: agent.health,
    lastRun: agent.lastRun,
    performance: agent.performance
  };
  
  return c.json(ok(statusData));
});

/**
 * GET /api/agents/:id/config
 * Legacy endpoint for agent configuration
 */
router.get('/agents/:id/config', async (c) => {
  if (!isDemoMode()) {
    return c.json(err404('Endpoint not available in production mode'), 404);
  }
  
  const id = parseInt(c.req.param('id'), 10);
  const agent = agentsMock.find(x => x.id === id) || 
                agentsMock.find(x => x.agentId === `agent-${String(id).padStart(2, '0')}`);
  
  if (!agent) {
    return c.json(err404('Agent not found'), 404);
  }
  
  // Mock configuration
  const config = {
    agentId: agent.agentId,
    enabled: agent.status !== 'inactive',
    pollingIntervalMs: 5000,
    maxConcurrency: 3,
    retries: 2,
    timeout: 30000,
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      recoveryTimeout: 30000
    }
  };
  
  return c.json(ok(config));
});

/**
 * GET /api/agents/:id/history
 * Legacy endpoint for agent execution history
 */
router.get('/agents/:id/history', async (c) => {
  if (!isDemoMode()) {
    return c.json(err404('Endpoint not available in production mode'), 404);
  }
  
  const id = parseInt(c.req.param('id'), 10);
  const agent = agentsMock.find(x => x.id === id) || 
                agentsMock.find(x => x.agentId === `agent-${String(id).padStart(2, '0')}`);
  
  if (!agent) {
    return c.json(err404('Agent not found'), 404);
  }
  
  const limit = parseInt(c.req.query('limit') || '20', 10);
  
  // Generate mock history
  const items = Array.from({ length: limit }).map((_, i) => ({
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    status: i % 7 === 0 ? 'warn' : 'ok',
    message: i % 7 === 0 ? 'Transient upstream error' : 'Tick successful',
    duration: Math.floor(Math.random() * 500) + 100,
    details: i % 7 === 0 ? 'Circuit breaker opened temporarily' : null
  }));
  
  return c.json(ok(items));
});

/**
 * GET /api/alerts/alerts/:id
 * Legacy endpoint with double "alerts" in path
 * Redirects to correct path: /api/alerts/:id
 */
router.get('/alerts/alerts/:id', async (c) => {
  const id = c.req.param('id');
  const search = c.req.raw.url.includes('?') ? c.req.raw.url.split('?')[1] : '';
  const redirectUrl = `/api/alerts/${id}${search ? '?' + search : ''}`;
  
  // 301 Permanent Redirect
  return c.redirect(redirectUrl, 301);
});

module.exports = router;
