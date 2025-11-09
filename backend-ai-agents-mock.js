#!/usr/bin/env node

/**
 * AI Agents Mock Backend Server
 * ==============================
 * 
 * این سرور Mock برای تست و پیاده‌سازی اولیه Agents 5-10 طراحی شده است.
 * 
 * استفاده:
 * 1. نصب وابستگی‌ها: npm install express
 * 2. اجرای مستقل: node backend-ai-agents-mock.js
 * 3. یا ادغام در سرور موجود: const mockRouter = require('./backend-ai-agents-mock');
 * 
 * پورت پیش‌فرض: 3000 (قابل تغییر با environment variable PORT)
 */

const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// CORS برای تست محلی
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Helper function: همیشه HTTP 200 برگردان
const ok = (res, body) => res.status(200).json(body);

// ============================================================================
// Response Templates
// ============================================================================

/**
 * حالت 1: Not Available (پیشنهادی برای شروع)
 * این response باعث می‌شود که در UI مودال "Coming Soon" نمایش داده شود
 */
const notAvailableResponse = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  installed: false,
  available: false,
  message: 'This agent is not yet implemented'
});

/**
 * حالت 2: Mock Active (برای تست نمایش سبز)
 * این response باعث می‌شود که agent در UI به صورت فعال نمایش داده شود
 */
const mockActiveStatus = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  installed: true,
  available: true,
  health: 'good',
  status: 'active',
  lastUpdate: new Date().toISOString(),
  message: 'Mock data - agent is simulated as active'
});

// ============================================================================
// Agents 5-10 Routes (Not Yet Implemented)
// ============================================================================

// برای هر agent از 5 تا 10، سه endpoint تعریف می‌کنیم
for (let id = 5; id <= 10; id++) {
  // GET /api/ai/agents/{id}/status
  app.get(`/api/ai/agents/${id}/status`, (req, res) => {
    // حالت 1: Not Available (پیشنهادی)
    ok(res, notAvailableResponse(id));
    
    // حالت 2: Mock Active (کامنت را بردارید برای تست)
    // ok(res, mockActiveStatus(id));
  });
  
  // GET /api/ai/agents/{id}/config
  app.get(`/api/ai/agents/${id}/config`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      enabled: false,
      pollingIntervalMs: 5000,
      message: 'Configuration not yet available'
    });
  });
  
  // GET /api/ai/agents/{id}/history
  app.get(`/api/ai/agents/${id}/history`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      items: [],
      message: 'History not yet available'
    });
  });
}

// ============================================================================
// Enhanced Data for Agents 1-4 & 11 (برای تست کامل)
// ============================================================================

// Agent 01: Technical Analysis
app.get('/api/ai/agents/1/status', (req, res) => {
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
      macdSignal: 0.001,
      macdHistogram: 0.001,
      bollinger: 'neutral',
      bollingerUpper: 45000,
      bollingerLower: 42000,
      volume: 12345678,
      ema20: 43500,
      ema50: 43200
    },
    signals: [
      { type: 'BUY', value: 'Strong', timestamp: Date.now() - 3600000, price: 43800 },
      { type: 'HOLD', value: 'Medium', timestamp: Date.now() - 7200000, price: 43500 }
    ],
    trend: 'bullish',
    support: [43000, 42500],
    resistance: [44500, 45000],
    lastUpdate: new Date().toISOString()
  });
});

// Agent 02: Market Sentiment
app.get('/api/ai/agents/2/status', (req, res) => {
  ok(res, {
    agentId: 'agent-02',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    sentiment: 'bullish',
    sentimentScore: 78.5,
    confidence: 85.2,
    sources: {
      twitter: 45,
      news: 32,
      forums: 23
    },
    keywords: [
      { word: 'bullish', count: 234, sentiment: 'positive' },
      { word: 'surge', count: 189, sentiment: 'positive' },
      { word: 'correction', count: 87, sentiment: 'negative' }
    ],
    trendingTopics: ['Bitcoin ETF', 'Halving', 'Adoption'],
    lastUpdate: new Date().toISOString()
  });
});

// Agent 03: Risk Management
app.get('/api/ai/agents/3/status', (req, res) => {
  ok(res, {
    agentId: 'agent-03',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    riskLevel: 'moderate',
    riskScore: 45.8,
    volatility: 'medium',
    volatilityIndex: 2.3,
    recommendations: [
      { type: 'stop_loss', value: 42000, reason: 'Support level' },
      { type: 'take_profit', value: 46000, reason: 'Resistance level' },
      { type: 'position_size', value: '5%', reason: 'Risk management' }
    ],
    alerts: [
      { level: 'warning', message: 'Increased volatility detected', timestamp: Date.now() - 1800000 }
    ],
    lastUpdate: new Date().toISOString()
  });
});

// Agent 04: Price Prediction
app.get('/api/ai/agents/4/status', (req, res) => {
  ok(res, {
    agentId: 'agent-04',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    prediction: {
      '24h': { price: 44500, confidence: 78.3, range: [43800, 45200] },
      '7d': { price: 46200, confidence: 65.7, range: [44000, 48000] },
      '30d': { price: 48500, confidence: 52.1, range: [42000, 52000] }
    },
    accuracy: {
      last24h: 82.5,
      last7d: 75.3,
      last30d: 68.9
    },
    model: 'LSTM-Transformer',
    lastTrained: new Date(Date.now() - 86400000).toISOString(),
    lastUpdate: new Date().toISOString()
  });
});

// Agent 11: Portfolio Optimizer
app.get('/api/ai/agents/11/status', (req, res) => {
  ok(res, {
    agentId: 'agent-11',
    installed: true,
    available: true,
    status: 'active',
    health: 'good',
    optimizationScore: 88.7,
    recommendations: [
      { action: 'rebalance', symbol: 'BTC', currentWeight: 45, targetWeight: 50, reason: 'Increase exposure' },
      { action: 'rebalance', symbol: 'ETH', currentWeight: 30, targetWeight: 25, reason: 'Reduce risk' },
      { action: 'hold', symbol: 'USDT', currentWeight: 25, targetWeight: 25, reason: 'Maintain cash position' }
    ],
    portfolioMetrics: {
      sharpeRatio: 1.85,
      maxDrawdown: 18.5,
      volatility: 25.3,
      expectedReturn: 42.8
    },
    lastOptimization: new Date(Date.now() - 3600000).toISOString(),
    lastUpdate: new Date().toISOString()
  });
});

// Config endpoints (برای agents 1-4 & 11)
[1, 2, 3, 4, 11].forEach(id => {
  app.get(`/api/ai/agents/${id}/config`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      enabled: true,
      pollingIntervalMs: 5000,
      autoTrade: false,
      notifications: true,
      thresholds: {
        minConfidence: 75,
        maxRisk: 50
      }
    });
  });
  
  app.get(`/api/ai/agents/${id}/history`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      items: [
        { timestamp: Date.now() - 3600000, action: 'analysis', result: 'positive' },
        { timestamp: Date.now() - 7200000, action: 'analysis', result: 'neutral' }
      ]
    });
  });
});

// ============================================================================
// Health Check Endpoint
// ============================================================================

app.get('/api/health', (req, res) => {
  ok(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'AI Agents Mock Backend Server is running',
    agents: {
      notImplemented: [5, 6, 7, 8, 9, 10],
      enhancedMock: [1, 2, 3, 4, 11],
      total: 11
    }
  });
});

// ============================================================================
// Server Start
// ============================================================================

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  ✅ AI Agents Mock Backend Server                                  ║
║  📡 Running on: http://localhost:${PORT}                            ║
║  🔧 Health Check: http://localhost:${PORT}/api/health               ║
╠════════════════════════════════════════════════════════════════════╣
║  📊 Available Endpoints:                                           ║
║  ├─ GET /api/ai/agents/{1-4,11}/status   (Enhanced Mock Data)     ║
║  ├─ GET /api/ai/agents/{5-10}/status     (Not Available)          ║
║  ├─ GET /api/ai/agents/{1-11}/config                              ║
║  └─ GET /api/ai/agents/{1-11}/history                             ║
╠════════════════════════════════════════════════════════════════════╣
║  💡 Usage:                                                         ║
║  curl http://localhost:${PORT}/api/ai/agents/1/status              ║
║  curl http://localhost:${PORT}/api/ai/agents/5/status              ║
╚════════════════════════════════════════════════════════════════════╝
    `);
  });
}

// Export برای استفاده در سرورهای دیگر
module.exports = app;
