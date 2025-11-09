#!/usr/bin/env node
/**
 * Backend AI Agents Mock Routes (Agents 5-10)
 * 
 * این فایل موک‌های حداقلی برای agents 5-10 را ارائه می‌دهد.
 * 
 * نحوه استفاده:
 * 1. این کد را در server.js یا app.js اصلی خود ادغام کنید
 * 2. یا به صورت standalone اجرا کنید: node backend-ai-agents-mock.js
 * 
 * توجه: این موک‌های موقتی هستند. باید با پیاده‌سازی واقعی جایگزین شوند.
 */

const express = require('express');
const app = express();

// Helper: پاسخ 200 OK
const ok = (res, body) => res.status(200).json(body);

// ============================================================================
// AGENTS 5-10: Mock Routes
// ============================================================================

// حالت 1: "Not Available" - برای agents که هنوز پیاده‌سازی نشده‌اند
const notAvailableResponse = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  installed: false,
  available: false,
  message: 'This agent is not yet implemented'
});

// حالت 2: "Mock Active" - برای agents که می‌خواهید موقتاً سبز نشان دهید
const mockActiveStatus = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  installed: true,
  available: true,
  health: 'good',
  status: 'active',
  lastUpdate: new Date().toISOString()
});

const mockActiveConfig = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  enabled: true,
  pollingIntervalMs: 5000,
  maxConcurrency: 3,
  retries: 2
});

const mockActiveHistory = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  items: []
});

// ============================================================================
// روش 1: استفاده از حالت "Not Available" (پیشنهادی برای الان)
// ============================================================================

for (let id = 5; id <= 10; id++) {
  // Status endpoint
  app.get(`/api/ai/agents/${id}/status`, (req, res) => {
    ok(res, notAvailableResponse(id));
  });
  
  // Config endpoint
  app.get(`/api/ai/agents/${id}/config`, (req, res) => {
    ok(res, notAvailableResponse(id));
  });
  
  // History endpoint
  app.get(`/api/ai/agents/${id}/history`, (req, res) => {
    ok(res, { agentId: `agent-${String(id).padStart(2, '0')}`, items: [] });
  });
}

// ============================================================================
// روش 2: استفاده از حالت "Mock Active" (اگر می‌خواهید سبز باشند)
// ============================================================================

// این بخش را uncomment کنید اگر می‌خواهید agents سبز نمایش داده شوند:

/*
for (let id = 5; id <= 10; id++) {
  app.get(`/api/ai/agents/${id}/status`, (req, res) => {
    ok(res, mockActiveStatus(id));
  });
  
  app.get(`/api/ai/agents/${id}/config`, (req, res) => {
    ok(res, mockActiveConfig(id));
  });
  
  app.get(`/api/ai/agents/${id}/history`, (req, res) => {
    ok(res, mockActiveHistory(id));
  });
}
*/

// ============================================================================
// AGENTS 1-4 & 11: Mock Enhanced Data (اختیاری)
// ============================================================================

// اگر می‌خواهید داده‌های کامل‌تر برای agents 1-4 & 11 ارائه دهید:

// Agent 01: Technical Analysis
app.get('/api/ai/agents/1/status', (req, res) => {
  ok(res, {
    agentId: 'agent-01',
    status: 'active',
    accuracy: 87.3,
    confidence: 92.1,
    indicators: {
      rsi: 65.4,
      macd: 0.002,
      bollinger: 'neutral',
      volume: 12345
    },
    signals: [
      { type: 'BUY', value: 'Strong', timestamp: Date.now() - 3600000 },
      { type: 'SELL', value: 'Weak', timestamp: Date.now() - 7200000 }
    ],
    trend: 'bullish',
    lastUpdate: new Date().toISOString()
  });
});

// Agent 02: Portfolio Risk Management
app.get('/api/ai/agents/2/status', (req, res) => {
  ok(res, {
    agentId: 'agent-02',
    status: 'active',
    portfolioRisk: {
      valueAtRisk: 0.03,
      exposure: 0.41,
      sharpeRatio: 1.8
    },
    recommendations: [
      'کاهش exposure به 35%',
      'افزایش دارایی‌های امن',
      'توازن مجدد پرتفولیو'
    ],
    lastUpdate: new Date().toISOString()
  });
});

// Agent 03: Market Sentiment
app.get('/api/ai/agents/3/status', (req, res) => {
  ok(res, {
    agentId: 'agent-03',
    status: 'active',
    overallMarket: {
      score: 0.18,
      trend: 'bullish'
    },
    sources: [
      { name: 'Twitter', score: 0.65 },
      { name: 'Reddit', score: 0.72 },
      { name: 'News', score: 0.45 }
    ],
    lastUpdate: new Date().toISOString()
  });
});

// Agent 04: Portfolio Optimization
app.get('/api/ai/agents/4/status', (req, res) => {
  ok(res, {
    agentId: 'agent-04',
    status: 'active',
    totals: {
      totalValue: 102345.67,
      positions: 8
    },
    recommendations: [
      'افزایش BTC به 40%',
      'کاهش altcoins',
      'حفظ 20% نقدینگی'
    ],
    lastUpdate: new Date().toISOString()
  });
});

// Agent 11: Advanced Portfolio Optimization
app.get('/api/ai/agents/11/status', (req, res) => {
  ok(res, {
    agentId: 'agent-11',
    status: 'active',
    blackLitterman: {
      tau: 0.05,
      views: 3,
      optimized: true
    },
    optimizationStatus: 'تخصیص بهینه محاسبه شد با استفاده از Black-Litterman',
    lastUpdate: new Date().toISOString()
  });
});

// ============================================================================
// Health Check Endpoint
// ============================================================================

app.get('/api/health', (req, res) => {
  ok(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    agents: {
      mock: [5, 6, 7, 8, 9, 10],
      enhanced: [1, 2, 3, 4, 11]
    }
  });
});

// ============================================================================
// Server Start (فقط برای استفاده standalone)
// ============================================================================

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ AI Agents Mock Server running on port ${PORT}`);
    console.log(`📊 Mock routes:`);
    console.log(`   - Agents 5-10: /api/ai/agents/{5-10}/{status|config|history}`);
    console.log(`   - Agents 1-4, 11: Enhanced data available`);
    console.log(`   - Health check: /api/health`);
    console.log(`\n🔗 Test endpoints:`);
    console.log(`   curl http://localhost:${PORT}/api/ai/agents/5/status`);
    console.log(`   curl http://localhost:${PORT}/api/ai/agents/1/status`);
    console.log(`   curl http://localhost:${PORT}/api/health`);
  });
}

// ============================================================================
// Export (برای ادغام در server موجود)
// ============================================================================

module.exports = app;
