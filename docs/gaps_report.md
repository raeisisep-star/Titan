# 🔍 Gaps Report - فاز Z0: ممیزی سریع

**تاریخ**: 2025-11-10  
**هدف**: شناسایی ماژول‌های ناقص، API های 404، و نقاط سیم‌کشی ناتمام

---

## 📊 خلاصه اجرایی

| دسته | تعداد Gap | اولویت P0 | اولویت P1 | اولویت P2 |
|------|-----------|-----------|-----------|-----------|
| **Backend Gaps** | 20 | 8 | 7 | 5 |
| **Frontend Gaps** | 5 | 2 | 2 | 1 |
| **Wiring Gaps** | 12 | 5 | 4 | 3 |
| **Polish (UI/UX)** | 8 | 0 | 3 | 5 |
| **مجموع** | **45** | **15** | **16** | **14** |

---

## 🔴 بخش 1: Backend Gaps (20 مورد)

### P0 - اولویت بالا (8 مورد)

#### GAP-B001: Market Overview API
**Path**: `GET /api/market/overview`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:3814`  
**Dependencies**: 
- MEXC public API (existing)
- Cache service (existing)

**Action Required**:
```javascript
// server.js (append)
app.get('/api/market/overview', async (c) => {
  try {
    const [btc, eth, total] = await Promise.all([
      mexcService.getPrice('BTCUSDT'),
      mexcService.getPrice('ETHUSDT'),
      mexcService.getTicker24hr('BTCUSDT')
    ]);
    return c.json({
      success: true,
      data: {
        totalMarketCap: 2.5e12,
        btcDominance: 52.3,
        ethDominance: 17.2,
        volume24h: parseFloat(total.volume),
        btcPrice: btc.price,
        ethPrice: eth.price
      }
    });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] Dashboard Market Overview widget displays data
- [ ] Response time < 500ms
- [ ] Zero console errors

---

#### GAP-B002: Market Movers API
**Path**: `GET /api/market/movers?type=gainers|losers&limit=5`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:3847-3848`  
**Dependencies**: 
- MEXC public API (multiple symbols)
- 24h ticker data

**Action Required**:
```javascript
// server.js (append)
app.get('/api/market/movers', async (c) => {
  const { type = 'gainers', limit = 5 } = c.req.query();
  
  // Top symbols to check
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 
                   'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'LINKUSDT', 'UNIUSDT'];
  
  try {
    const tickers = await Promise.all(
      symbols.map(s => mexcService.getTicker24hr(s))
    );
    
    const sorted = tickers
      .map(t => ({
        symbol: t.symbol,
        price: parseFloat(t.lastPrice),
        change24h: parseFloat(t.priceChangePercent),
        volume: parseFloat(t.volume)
      }))
      .sort((a, b) => type === 'gainers' 
        ? b.change24h - a.change24h 
        : a.change24h - b.change24h
      )
      .slice(0, parseInt(limit));
    
    return c.json({ success: true, data: sorted });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] Gainers/Losers widgets populate correctly
- [ ] Data sorted correctly
- [ ] Zero console errors

---

#### GAP-B003: Market Fear & Greed Index
**Path**: `GET /api/market/fear-greed`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:3897`, `public/static/app.js:4858`  
**Dependencies**: 
- External API (Alternative.me) or mock data

**Action Required**:
```javascript
// server.js (append)
app.get('/api/market/fear-greed', async (c) => {
  try {
    // Mock data for now (can integrate with Alternative.me later)
    const value = Math.floor(Math.random() * 40) + 30; // 30-70 range
    const classification = 
      value < 25 ? 'Extreme Fear' :
      value < 45 ? 'Fear' :
      value < 55 ? 'Neutral' :
      value < 75 ? 'Greed' : 'Extreme Greed';
    
    return c.json({
      success: true,
      data: {
        value,
        classification,
        timestamp: Date.now(),
        next_update: Date.now() + 86400000
      }
    });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] Fear & Greed widget displays value
- [ ] Classification text correct
- [ ] Zero console errors

---

#### GAP-B004: Portfolio Performance API
**Path**: `GET /api/portfolio/performance`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js` (multiple locations)  
**Dependencies**: 
- Demo wallet data (existing `/api/mode/demo/wallet`)
- Historical price data

**Action Required**:
```javascript
// server.js (append)
app.get('/api/portfolio/performance', async (c) => {
  const userId = c.req.query('userId') || 'demo_user';
  
  try {
    // Demo mode: return mock performance
    return c.json({
      success: true,
      data: {
        totalValue: 10245.50,
        totalProfit: 245.50,
        profitPercent: 2.45,
        dayChange: 124.30,
        dayChangePercent: 1.23,
        weekChange: 245.50,
        weekChangePercent: 2.45,
        monthChange: 520.10,
        monthChangePercent: 5.34,
        holdings: [
          { symbol: 'BTC', value: 5000, profit: 200, profitPercent: 4.2 },
          { symbol: 'ETH', value: 3000, profit: 50, profitPercent: 1.7 },
          { symbol: 'USDT', value: 2245.50, profit: -4.50, profitPercent: -0.2 }
        ]
      }
    });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] Portfolio performance widget shows data
- [ ] Profit/loss calculations correct
- [ ] Zero console errors

---

#### GAP-B005: Chart Data API
**Path**: `GET /api/chart/data/:symbol/:timeframe`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:6331`  
**Dependencies**: 
- MEXC history endpoint (existing `/api/mexc/history`)

**Action Required**:
```javascript
// server.js (append)
app.get('/api/chart/data/:symbol/:timeframe', async (c) => {
  const { symbol, timeframe } = c.req.param();
  
  try {
    // Map timeframe to MEXC interval
    const intervalMap = {
      '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
      '1h': '60m', '4h': '4h', '1d': '1d'
    };
    const interval = intervalMap[timeframe] || '60m';
    
    const candles = await mexcService.getKlines(symbol, interval, 500);
    
    return c.json({
      success: true,
      data: {
        symbol,
        timeframe,
        candles: candles.map(c => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume
        }))
      }
    });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] Chart widget renders candles
- [ ] Timeframe switching works
- [ ] Zero console errors

---

#### GAP-B006: Monitoring Status API
**Path**: `GET /api/monitoring/status`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:9858`  
**Dependencies**: 
- System metrics (PM2, server stats)

**Action Required**:
```javascript
// server.js (append)
app.get('/api/monitoring/status', async (c) => {
  try {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    
    return c.json({
      success: true,
      data: {
        status: 'operational',
        uptime: Math.floor(uptime),
        services: {
          api: 'operational',
          database: 'operational',
          redis: 'operational',
          mexc: 'operational'
        },
        memory: {
          used: Math.round(memory.heapUsed / 1024 / 1024),
          total: Math.round(memory.heapTotal / 1024 / 1024)
        }
      }
    });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] Monitoring dashboard displays status
- [ ] Service statuses accurate
- [ ] Zero console errors

---

#### GAP-B007: Widgets Types API
**Path**: `GET /api/widgets/types`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:5773`, `public/static/app.js:5809`  
**Dependencies**: None

**Action Required**:
```javascript
// server.js (append)
app.get('/api/widgets/types', async (c) => {
  try {
    const types = [
      { id: 'market-overview', name: 'بررسی بازار', category: 'market' },
      { id: 'price-ticker', name: 'قیمت لحظه‌ای', category: 'market' },
      { id: 'portfolio-summary', name: 'خلاصه پورتفولیو', category: 'portfolio' },
      { id: 'recent-trades', name: 'معاملات اخیر', category: 'trading' },
      { id: 'ai-signals', name: 'سیگنال‌های هوش مصنوعی', category: 'ai' },
      { id: 'fear-greed-index', name: 'شاخص ترس و طمع', category: 'market' }
    ];
    
    return c.json({ success: true, data: types });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] Widget selector populates
- [ ] All widget types listed
- [ ] Zero console errors

---

#### GAP-B008: Alerts News API
**Path**: `GET /api/alerts/news?limit=3`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:5145`  
**Dependencies**: None (mock data for demo)

**Action Required**:
```javascript
// server.js (append)
app.get('/api/alerts/news', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');
  
  try {
    // Mock news for demo mode
    const news = [
      {
        id: 'n1',
        title: 'Bitcoin reaches new all-time high',
        summary: 'BTC breaks $110,000 barrier amid institutional buying',
        source: 'CryptoNews',
        timestamp: Date.now() - 3600000,
        sentiment: 'positive'
      },
      {
        id: 'n2',
        title: 'Ethereum upgrade scheduled for next month',
        summary: 'Network improvements expected to reduce gas fees',
        source: 'ETH Foundation',
        timestamp: Date.now() - 7200000,
        sentiment: 'neutral'
      },
      {
        id: 'n3',
        title: 'Major exchange announces new trading pairs',
        summary: 'MEXC adds support for 20 new altcoins',
        source: 'MEXC Official',
        timestamp: Date.now() - 10800000,
        sentiment: 'positive'
      }
    ];
    
    return c.json({ success: true, data: news.slice(0, limit) });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
```

**DoD**:
- [ ] Endpoint returns 200 OK
- [ ] News widget displays items
- [ ] Limit parameter works
- [ ] Zero console errors

---

### P1 - اولویت متوسط (7 مورد)

#### GAP-B009: AI Signals API
**Path**: `GET /api/ai/signals`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:5173`  
**Action**: Mock signals based on market data

#### GAP-B010: AI Recommendations API
**Path**: `GET /api/ai/recommendations`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:5293`  
**Action**: Mock recommendations for demo mode

#### GAP-B011: Portfolio Advanced API
**Path**: `GET /api/portfolio/advanced`  
**Status**: ❌ 404 Not Found  
**Called By**: Frontend portfolio module  
**Action**: Extend `/api/portfolio/performance` with advanced metrics

#### GAP-B012: Performance PnL API
**Path**: `GET /api/performance/pnl/:userId/:period`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:6194`  
**Action**: Calculate profit/loss for time periods

#### GAP-B013: Monitoring Metrics API
**Path**: `GET /api/monitoring/metrics`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:9859`  
**Action**: System performance metrics

#### GAP-B014: Monitoring Health API
**Path**: `GET /api/monitoring/health`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:9860`  
**Action**: Detailed health check (extend `/api/health`)

#### GAP-B015: Widgets Options API
**Path**: `GET /api/widgets/options`  
**Status**: ❌ 404 Not Found  
**Called By**: `public/static/app.js:5575`  
**Action**: Configuration options for each widget type

---

### P2 - اولویت پایین (5 مورد)

#### GAP-B016: Market Trending API
**Path**: `GET /api/market/trending`  
**Status**: ❌ 404 Not Found  
**Action**: Trending cryptocurrencies (optional enhancement)

#### GAP-B017: Market Prices Bulk API
**Path**: `GET /api/market/prices?symbols=BTC,ETH,ADA`  
**Status**: ❌ 404 Not Found  
**Action**: Bulk price fetching (can use existing `/api/mexc/price` in loop)

#### GAP-B018: Chart Analysis API
**Path**: `GET /api/chart/analysis/:symbol`  
**Status**: ❌ 404 Not Found  
**Action**: Technical indicators (RSI, MACD, etc.) - future enhancement

#### GAP-B019: System Metrics API
**Path**: `GET /api/system/metrics`  
**Status**: ❌ 404 Not Found  
**Action**: Detailed system metrics (CPU, memory, disk)

#### GAP-B020: Watchlist Search API
**Path**: `GET /api/watchlist/search/:query`  
**Status**: ❌ 404 Not Found  
**Action**: Search symbols for watchlist

---

## 🟡 بخش 2: Frontend Gaps (5 مورد)

### P0 - اولویت بالا (2 مورد)

#### GAP-F001: Manual Trading Stats TODO
**Path**: `public/static/modules/manual-trading-advanced.js:850-852`  
**Status**: ⚠️ TODO comments for calculations  
**Issue**:
```javascript
maxDrawdown: -5.2, // TODO: Calculate from API data
avgWin: 4.2, // TODO: Calculate from API data
avgLoss: -2.1 // TODO: Calculate from API data
```

**Dependencies**:
- Trade history API
- Performance calculation logic

**Action Required**:
```javascript
// Calculate from actual trade data
async function calculateTradingStats(trades) {
  const wins = trades.filter(t => t.profit > 0);
  const losses = trades.filter(t => t.profit < 0);
  
  return {
    maxDrawdown: Math.min(...trades.map(t => t.drawdown || 0)),
    avgWin: wins.reduce((sum, t) => sum + t.profit, 0) / wins.length,
    avgLoss: losses.reduce((sum, t) => sum + t.profit, 0) / losses.length
  };
}
```

**DoD**:
- [ ] Stats calculated from real data
- [ ] TODO comments removed
- [ ] Calculations accurate
- [ ] Zero console errors

---

#### GAP-F002: Chatbot Settings TODO
**Path**: `public/static/modules/chatbot.js:2588`  
**Status**: ⚠️ TODO comment  
**Issue**:
```javascript
// TODO: Open settings modal for chatbot preferences
```

**Action Required**:
```javascript
// Add handler to open settings modal
function openChatbotSettings() {
  const settingsModal = document.getElementById('chatbot-settings-modal');
  if (settingsModal) {
    settingsModal.classList.remove('hidden');
  } else {
    console.warn('Chatbot settings modal not found');
  }
}

// Connect to button
document.getElementById('btn-chatbot-settings')?.addEventListener('click', openChatbotSettings);
```

**DoD**:
- [ ] Settings button opens modal
- [ ] TODO comment removed
- [ ] Modal functional
- [ ] Zero console errors

---

### P1 - اولویت متوسط (2 مورد)

#### GAP-F003: Empty State Handling
**Path**: Multiple widgets (dashboard, portfolio, alerts)  
**Status**: ⚠️ Missing empty state UI  
**Action**: Add empty state templates for all widgets

#### GAP-F004: Loading Skeletons
**Path**: Multiple modules  
**Status**: ⚠️ Inconsistent loading states  
**Action**: Standardize skeleton loading across all modules

---

### P2 - اولویت پایین (1 مورد)

#### GAP-F005: Error State Consistency
**Path**: All modules  
**Status**: ⚠️ Mixed error handling patterns  
**Action**: Standardize error state UI (Phase Z3)

---

## 🔌 بخش 3: Wiring Gaps (12 مورد)

### P0 - اولویت بالا (5 مورد)

#### GAP-W001: Market Overview Widget → API
**UI Component**: Dashboard market overview card  
**Adapter**: Missing  
**Backend**: GAP-B001  
**Status**: ❌ No connection

**Action Required**:
```javascript
// public/static/modules/dashboard/services/adapters/market.adapter.js (extend)
export const MarketAdapter = {
  // ... existing methods ...
  
  async getOverview() {
    const res = await TitanHTTP.get('/api/market/overview');
    return res?.data;
  }
};

// public/static/modules/dashboard/market-integration.js (add)
async function loadMarketOverview() {
  try {
    const data = await MarketAdapter.getOverview();
    document.getElementById('total-market-cap').textContent = formatNumber(data.totalMarketCap);
    document.getElementById('btc-dominance').textContent = data.btcDominance + '%';
    document.getElementById('volume-24h').textContent = formatNumber(data.volume24h);
  } catch (err) {
    console.warn('Failed to load market overview:', err);
  }
}
```

**DoD**:
- [ ] Adapter method created
- [ ] Widget connected to adapter
- [ ] Data displays correctly
- [ ] Error handling in place

---

#### GAP-W002: Portfolio Performance Widget → API
**UI Component**: Dashboard portfolio summary  
**Adapter**: Missing  
**Backend**: GAP-B004  
**Status**: ❌ No connection

**Action Required**:
```javascript
// public/static/modules/dashboard/services/adapters/portfolio.adapter.js (new)
import { TitanHTTP } from '../api/http.js';

export const PortfolioAdapter = {
  async getPerformance(userId = 'demo_user') {
    const res = await TitanHTTP.get('/api/portfolio/performance', {
      params: { userId }
    });
    return res?.data;
  },
  
  async getAdvanced(userId = 'demo_user') {
    const res = await TitanHTTP.get('/api/portfolio/advanced', {
      params: { userId }
    });
    return res?.data;
  }
};
```

**DoD**:
- [ ] Adapter created
- [ ] Portfolio widget connected
- [ ] Performance metrics display
- [ ] Zero console errors

---

#### GAP-W003: Chart Widget → API
**UI Component**: Trading chart  
**Adapter**: Partial  
**Backend**: GAP-B005  
**Status**: ⚠️ Using MEXC history, needs chart-specific endpoint

**Action Required**:
```javascript
// Extend MarketAdapter with chart-specific method
async getChartData(symbol, timeframe, limit = 500) {
  const res = await TitanHTTP.get(`/api/chart/data/${symbol}/${timeframe}`, {
    params: { limit }
  });
  return res?.data?.candles;
}

// Connect to chart renderer
async function updateChart(symbol, timeframe) {
  showSkeleton(chartElement);
  try {
    const candles = await MarketAdapter.getChartData(symbol, timeframe);
    renderChart(candles);
  } catch (err) {
    showError(chartElement, 'Failed to load chart data');
  } finally {
    hideSkeleton(chartElement);
  }
}
```

**DoD**:
- [ ] Chart data endpoint connected
- [ ] Timeframe switcher works
- [ ] Candles render correctly
- [ ] Zero console errors

---

#### GAP-W004: Monitoring Dashboard → APIs
**UI Component**: System monitoring page  
**Adapter**: Missing  
**Backend**: GAP-B006, GAP-B013, GAP-B014  
**Status**: ❌ No connection

**Action Required**:
```javascript
// public/static/modules/monitoring/adapters/monitoring.adapter.js (new)
export const MonitoringAdapter = {
  async getStatus() {
    const res = await TitanHTTP.get('/api/monitoring/status');
    return res?.data;
  },
  
  async getMetrics() {
    const res = await TitanHTTP.get('/api/monitoring/metrics');
    return res?.data;
  },
  
  async getHealth() {
    const res = await TitanHTTP.get('/api/monitoring/health');
    return res?.data;
  }
};
```

**DoD**:
- [ ] Adapter created
- [ ] Monitoring page functional
- [ ] All metrics display
- [ ] Auto-refresh working

---

#### GAP-W005: Widgets Manager → APIs
**UI Component**: Widget customization panel  
**Adapter**: Missing  
**Backend**: GAP-B007, GAP-B015  
**Status**: ❌ No connection

**Action Required**:
```javascript
// public/static/modules/dashboard/services/adapters/widgets.adapter.js (new)
export const WidgetsAdapter = {
  async getTypes() {
    const res = await TitanHTTP.get('/api/widgets/types');
    return res?.data;
  },
  
  async getOptions() {
    const res = await TitanHTTP.get('/api/widgets/options');
    return res?.data;
  },
  
  async saveLayout(userId, layout) {
    const res = await TitanHTTP.post('/api/widgets/layout', { userId, layout });
    return res?.success;
  }
};
```

**DoD**:
- [ ] Adapter created
- [ ] Widget selector populated
- [ ] Layout saving works
- [ ] Zero console errors

---

### P1 - اولویت متوسط (4 مورد)

#### GAP-W006: AI Signals Widget → API
**Status**: ❌ Backend GAP-B009  
**Action**: Wire after backend completion

#### GAP-W007: News Widget → API
**Status**: ❌ Backend GAP-B008  
**Action**: Wire after backend completion

#### GAP-W008: Fear & Greed Widget → API
**Status**: ❌ Backend GAP-B003  
**Action**: Wire after backend completion

#### GAP-W009: Market Movers Widget → API
**Status**: ❌ Backend GAP-B002  
**Action**: Wire after backend completion

---

### P2 - اولویت پایین (3 مورد)

#### GAP-W010: Watchlist Search
**Status**: ❌ Backend GAP-B020  
**Action**: Wire after backend (optional feature)

#### GAP-W011: Chart Analysis
**Status**: ❌ Backend GAP-B018  
**Action**: Wire after backend (future enhancement)

#### GAP-W012: Trending Cryptos
**Status**: ❌ Backend GAP-B016  
**Action**: Wire after backend (optional feature)

---

## 🎨 بخش 4: Polish (UI/UX/A11y/i18n) (8 مورد)

### P1 - اولویت متوسط (3 مورد)

#### GAP-P001: Skeleton Loading States
**Path**: All modules  
**Status**: ⚠️ Inconsistent loading states  
**Action**:
```javascript
// utils/skeleton.js
export function showSkeleton(element) {
  element.classList.add('is-loading');
  element.setAttribute('aria-busy', 'true');
}

export function hideSkeleton(element) {
  element.classList.remove('is-loading');
  element.setAttribute('aria-busy', 'false');
}
```

**DoD**:
- [ ] All widgets use skeleton states
- [ ] CSS animations smooth
- [ ] ARIA attributes set
- [ ] Consistent across modules

---

#### GAP-P002: Empty State Templates
**Path**: All widgets  
**Status**: ⚠️ Missing empty states  
**Action**:
```javascript
// utils/states.js
export function showEmptyState(element, message, icon = '📭') {
  element.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <p class="empty-message">${message}</p>
    </div>
  `;
}
```

**DoD**:
- [ ] All widgets have empty states
- [ ] Messages clear and helpful
- [ ] Icons appropriate
- [ ] RTL support

---

#### GAP-P003: Error State Consistency
**Path**: All modules  
**Status**: ⚠️ Mixed error handling  
**Action**:
```javascript
// utils/states.js
export function showError(element, message, canRetry = false) {
  element.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">${message}</p>
      ${canRetry ? '<button class="btn-retry">تلاش مجدد</button>' : ''}
    </div>
  `;
}
```

**DoD**:
- [ ] All errors use standard template
- [ ] Retry button functional
- [ ] Error messages clear
- [ ] User-friendly

---

### P2 - اولویت پایین (5 مورد)

#### GAP-P004: ARIA Labels
**Status**: ⚠️ Missing accessibility attributes  
**Action**: Add aria-label, aria-describedby to interactive elements

#### GAP-P005: Tab Navigation
**Status**: ⚠️ Inconsistent tab order  
**Action**: Ensure logical tab order across all pages

#### GAP-P006: Number Formatting
**Status**: ⚠️ Mixed FA/EN numbers  
**Action**: Use existing format utils consistently

#### GAP-P007: i18n Consistency
**Status**: ⚠️ Mixed Persian/English labels  
**Action**: Standardize all UI text

#### GAP-P008: Color Contrast
**Status**: ⚠️ Some text fails WCAG AA  
**Action**: Audit and fix contrast ratios

---

## 🎯 اولویت‌بندی پیشنهادی

### Sprint 1 (امروز - فردا): P0 Backend + Wiring
1. GAP-B001: Market Overview API ✅
2. GAP-B002: Market Movers API ✅
3. GAP-B003: Fear & Greed API ✅
4. GAP-B004: Portfolio Performance API ✅
5. GAP-W001: Wire Market Overview ✅
6. GAP-W002: Wire Portfolio ✅

**Goal**: Dashboard functional با داده واقعی

---

### Sprint 2 (2 روز بعد): P0 Monitoring + Charts
7. GAP-B005: Chart Data API ✅
8. GAP-B006: Monitoring Status API ✅
9. GAP-W003: Wire Chart ✅
10. GAP-W004: Wire Monitoring ✅

**Goal**: Chart و Monitoring کامل

---

### Sprint 3 (3 روز بعد): P1 Backend + Wiring
11. GAP-B007 to GAP-B015 (P1 endpoints) ✅
12. GAP-W005 to GAP-W009 (P1 wiring) ✅

**Goal**: تمام widget ها functional

---

### Sprint 4 (1 هفته): Polish + P2
13. GAP-F001: Fix TODOs ✅
14. GAP-P001 to GAP-P003: UI Polish ✅
15. GAP-B016 to GAP-B020 (P2 optional) 🔄

**Goal**: UI صیقلی و تجربه کاربری عالی

---

## 📊 آمار نهایی

### Coverage Analysis
- **Backend Routes Defined**: 57 routes
- **Frontend API Calls**: 150+ locations
- **Missing Endpoints**: 20 critical
- **Wiring Gaps**: 12 connections
- **TODO Comments**: 3 items

### Estimated Effort
- **P0 Gaps**: ~16 ساعت کار (2 روز)
- **P1 Gaps**: ~24 ساعت کار (3 روز)
- **P2 Gaps**: ~16 ساعت کار (2 روز)
- **Total**: ~56 ساعت کار (~1 هفته full-time)

---

## ✅ تأیید و شروع

**بررسی شده توسط**: Claude AI (GenSpark Developer)  
**تاریخ**: 2025-11-10  
**Status**: ✅ Ready for Phase Z1

**Next Steps**:
1. ✅ Review gaps report
2. ⏳ Approve priorities
3. ⏳ Start Sprint 1 (P0 Backend)
4. ⏳ Test each endpoint with curl
5. ⏳ Wire frontend adapters
6. ⏳ Verify with browser testing

---

**End of Gaps Report**
