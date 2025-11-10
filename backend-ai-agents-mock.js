#!/usr/bin/env node
/**
 * AI Agents Mock Backend Server
 * 
 * This is a ready-to-use Express server that implements mock endpoints for AI agents 5-10.
 * 
 * Usage Options:
 * 
 * 1. Standalone Server:
 *    node backend-ai-agents-mock.js
 *    (Runs on port 3000 by default, or PORT environment variable)
 * 
 * 2. Integrate into existing Express server:
 *    const aiAgentsMock = require('./backend-ai-agents-mock');
 *    app.use('/api/ai', aiAgentsMock);
 * 
 * 3. Test endpoints:
 *    curl http://localhost:3000/api/ai/agents/5/status
 *    curl http://localhost:3000/api/health
 */

const express = require('express');
const app = express();

// Enable JSON parsing
app.use(express.json());

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to always return HTTP 200 (even for unavailable agents)
const ok = (res, body) => res.status(200).json(body);

// ============================================================================
// RESPONSE TEMPLATES
// ============================================================================

/**
 * Not Available Response (recommended for agents 5-10 initially)
 * This tells frontend to show "Coming Soon" modal
 */
const notAvailableResponse = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  installed: false,
  available: false,
  message: 'This agent is not yet implemented'
});

/**
 * Mock Active Response (for testing green display)
 * Use this to test the "active agent" UI without full implementation
 */
const mockActiveStatus = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  installed: true,
  available: true,
  health: 'good',
  status: 'active',
  lastUpdate: new Date().toISOString(),
  // Optional fields for richer display
  accuracy: 75.0 + (id * 2),
  confidence: 80.0 + id,
  signals: [],
  trend: 'neutral'
});

// ============================================================================
// AGENTS 5-10 ROUTES (Not Yet Implemented)
// ============================================================================

/**
 * Agents 5-10: Currently return "not available"
 * Change notAvailableResponse() to mockActiveStatus() to test active display
 */
for (let id = 5; id <= 10; id++) {
  // Status endpoint
  app.get(`/api/ai/agents/${id}/status`, (req, res) => {
    console.log(`📥 GET /api/ai/agents/${id}/status`);
    
    // OPTION 1: Return "not available" (shows Coming Soon modal)
    ok(res, notAvailableResponse(id));
    
    // OPTION 2: Return mock active data (shows agent as active with data)
    // ok(res, mockActiveStatus(id));
  });

  // Config endpoint
  app.get(`/api/ai/agents/${id}/config`, (req, res) => {
    console.log(`📥 GET /api/ai/agents/${id}/config`);
    
    // OPTION 1: Not available
    ok(res, notAvailableResponse(id));
    
    // OPTION 2: Mock config
    // ok(res, {
    //   agentId: `agent-${String(id).padStart(2, '0')}`,
    //   enabled: true,
    //   pollingIntervalMs: 5000,
    //   settings: {}
    // });
  });

  // History endpoint
  app.get(`/api/ai/agents/${id}/history`, (req, res) => {
    console.log(`📥 GET /api/ai/agents/${id}/history`);
    
    // Always return empty array for now
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      items: []
    });
  });
}

// ============================================================================
// AGENTS 1-4 & 11 ROUTES (Enhanced Data)
// ============================================================================

/**
 * Agent 01: Technical Analysis Agent
 * Frontend expects: indicators, signals, trend, accuracy
 */
app.get('/api/ai/agents/1/status', (req, res) => {
  console.log('📥 GET /api/ai/agents/1/status (Enhanced)');
  ok(res, {
    agentId: 'agent-01',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    accuracy: 87.3,
    confidence: 92.1,
    indicators: {
      rsi: 65.4,
      macd: 0.002,
      macdSignal: 0.0015,
      macdHistogram: 0.0005,
      bollinger: 'neutral',
      bollingerUpper: 45000,
      bollingerLower: 43000,
      volume: 1234567890,
      sma20: 44000,
      sma50: 43500,
      ema12: 44200,
      ema26: 43800
    },
    signals: [
      {
        type: 'BUY',
        value: 'Strong',
        confidence: 0.85,
        timestamp: Date.now() - 3600000,
        reason: 'RSI oversold + MACD crossover'
      }
    ],
    trend: 'bullish',
    lastUpdate: new Date().toISOString()
  });
});

/**
 * Agent 02: Order Book Analysis Agent
 * Frontend expects: buyPressure, sellPressure, spread, depth
 */
app.get('/api/ai/agents/2/status', (req, res) => {
  console.log('📥 GET /api/ai/agents/2/status (Enhanced)');
  ok(res, {
    agentId: 'agent-02',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    accuracy: 83.7,
    confidence: 88.4,
    orderBook: {
      buyPressure: 67.3,
      sellPressure: 32.7,
      spread: 0.05,
      depth: 1500000,
      imbalance: 'buy-heavy'
    },
    signals: [
      {
        type: 'ACCUMULATION',
        strength: 'moderate',
        timestamp: Date.now() - 1800000
      }
    ],
    lastUpdate: new Date().toISOString()
  });
});

/**
 * Agent 03: News Sentiment Agent
 * Frontend expects: sentiment score, keywords, sources
 */
app.get('/api/ai/agents/3/status', (req, res) => {
  console.log('📥 GET /api/ai/agents/3/status (Enhanced)');
  ok(res, {
    agentId: 'agent-03',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    accuracy: 79.2,
    confidence: 82.6,
    sentiment: {
      score: 0.65,
      label: 'positive',
      confidence: 0.82
    },
    keywords: ['bullish', 'adoption', 'institutional'],
    sources: 12,
    signals: [
      {
        type: 'SENTIMENT_SHIFT',
        from: 'neutral',
        to: 'positive',
        timestamp: Date.now() - 7200000
      }
    ],
    lastUpdate: new Date().toISOString()
  });
});

/**
 * Agent 04: Market Microstructure Agent
 * Frontend expects: liquidity, volatility, efficiency
 */
app.get('/api/ai/agents/4/status', (req, res) => {
  console.log('📥 GET /api/ai/agents/4/status (Enhanced)');
  ok(res, {
    agentId: 'agent-04',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    accuracy: 85.9,
    confidence: 89.2,
    microstructure: {
      liquidity: 'high',
      volatility: 2.3,
      efficiency: 0.87,
      bidAskSpread: 0.03
    },
    signals: [
      {
        type: 'LIQUIDITY_ALERT',
        value: 'increasing',
        timestamp: Date.now() - 900000
      }
    ],
    lastUpdate: new Date().toISOString()
  });
});

/**
 * Agent 11: Multi-Timeframe Analysis Agent
 * Frontend expects: timeframes analysis, consensus
 */
app.get('/api/ai/agents/11/status', (req, res) => {
  console.log('📥 GET /api/ai/agents/11/status (Enhanced)');
  ok(res, {
    agentId: 'agent-11',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    accuracy: 88.1,
    confidence: 91.3,
    timeframes: {
      '1m': { trend: 'bullish', strength: 0.6 },
      '5m': { trend: 'bullish', strength: 0.7 },
      '15m': { trend: 'bullish', strength: 0.8 },
      '1h': { trend: 'neutral', strength: 0.5 },
      '4h': { trend: 'bullish', strength: 0.75 },
      '1d': { trend: 'bullish', strength: 0.85 }
    },
    consensus: {
      overall: 'bullish',
      confidence: 0.73,
      agreement: 0.83
    },
    signals: [
      {
        type: 'TIMEFRAME_ALIGNMENT',
        value: 'bullish',
        confidence: 0.73,
        timestamp: Date.now() - 600000
      }
    ],
    lastUpdate: new Date().toISOString()
  });
});

// Generic config endpoint for agents 1-4 & 11
[1, 2, 3, 4, 11].forEach(id => {
  app.get(`/api/ai/agents/${id}/config`, (req, res) => {
    console.log(`📥 GET /api/ai/agents/${id}/config`);
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      enabled: true,
      pollingIntervalMs: 5000,
      settings: {
        threshold: 0.7,
        maxSignals: 10
      }
    });
  });

  app.get(`/api/ai/agents/${id}/history`, (req, res) => {
    console.log(`📥 GET /api/ai/agents/${id}/history`);
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      items: [
        {
          timestamp: Date.now() - 3600000,
          event: 'signal_generated',
          data: { type: 'BUY', confidence: 0.85 }
        },
        {
          timestamp: Date.now() - 7200000,
          event: 'status_update',
          data: { status: 'active' }
        }
      ]
    });
  });
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/api/health', (req, res) => {
  console.log('📥 GET /api/health');
  ok(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'AI Agents Mock Backend',
    agents: {
      available: [1, 2, 3, 4, 11],
      mock: [5, 6, 7, 8, 9, 10],
      unavailable: [12, 13, 14, 15]
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'This endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('✅ AI Agents Mock Server Started');
    console.log('='.repeat(50));
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('  Agents 1-4, 11: /api/ai/agents/{1-4,11}/{status|config|history}');
    console.log('  Agents 5-10:    /api/ai/agents/{5-10}/{status|config|history}');
    console.log('');
    console.log('💡 Test with:');
    console.log(`  curl http://localhost:${PORT}/api/ai/agents/1/status`);
    console.log(`  curl http://localhost:${PORT}/api/ai/agents/5/status`);
    console.log('='.repeat(50));
    console.log('');
  });
}

// Export for integration with existing servers
module.exports = app;
