// public/static/modules/dashboard/widgets-integration.js
// Phase C: Widget UI Integration با استفاده از Adapters جدید (Sprint 2)
// تاریخ: 2025-11-10

(function(global) {
  'use strict';

  // اطمینان از قطع mock و استفاده از API واقعی
  window.TitanFlags = window.TitanFlags || {};
  window.TitanFlags.useMockData = false; // ⛔ mock off - force real API
  window.TitanFlags.preferLegacyWidgets = true; // استفاده از ویجت‌های قدیمی

  // 👇 اعلام آمادگی برای dashboard-widgets-loader.js
  window.__WidgetsIntegrationLoaded = true;
  window.dispatchEvent(new Event('titan:widgets-ready'));
  
  // تنظیمات Auto-refresh
  const REFRESH_INTERVAL = 30000; // 30 seconds
  let refreshTimers = {};
  let isPageVisible = true;

  // 👁️ Improvement 2: Visibility API با توقف/ازسرگیری Auto-Refresh
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    console.log(`📊 [Widgets] Page visibility: ${isPageVisible ? 'visible' : 'hidden'}`);
    
    if (document.hidden) {
      // توقف همه تایمرها
      Object.values(refreshTimers || {}).forEach(clearInterval);
      refreshTimers = {};
      console.log('⏸️ [Widgets] Auto-refresh paused (tab hidden)');
    } else {
      // ازسرگیری با scan و bind
      if (window.TitanLegacy?.scan) window.TitanLegacy.scan();
      if (window.TitanLegacyBind?.bindAllLegacy) {
        window.TitanLegacyBind.bindAllLegacy()
          .then(() => {
            // ازسرگیری تایمرها
            startAutoRefresh('MarketOverview', loadMarketOverview);
            startAutoRefresh('MarketMovers', loadMarketMovers);
            startAutoRefresh('Portfolio', loadPortfolioWidget);
            startAutoRefresh('Monitoring', loadMonitoringWidget);
            console.log('▶️ [Widgets] Auto-refresh resumed (tab visible)');
          })
          .catch(console.error);
      }
    }
  });

  // =============================================================================
  // 1. Market Overview Widget
  // =============================================================================
  async function loadMarketOverview() {
    // Try to find legacy container first, then fallback to new widget
    let container = null;
    if (window.DashboardWidgetsLoader && window.DashboardWidgetsLoader.findLegacyContainer) {
      container = window.DashboardWidgetsLoader.findLegacyContainer('overview');
    }
    if (!container) {
      container = document.getElementById('market-overview-widget');
    }
    if (!container) return;

    try {
      showWidgetLoading(container);
      
      const overview = await OverviewAdapter.getMarketOverview();
      
      // رندر داده‌ها با TitanBind.renderInto
      const html = `
        <div class="widget-header">
          <h3 class="text-lg font-bold">نمای کلی بازار</h3>
          <span class="last-updated text-xs text-gray-400">${TitanDT.formatDateTimeFA(Date.now())}</span>
        </div>
        <div class="market-stats grid grid-cols-2 gap-4 mt-4">
          <div class="stat-card">
            <div class="stat-label">حجم کل 24h</div>
            <div class="stat-value">${formatVolume(overview.market.totalVolume24h)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">تغییر میانگین</div>
            <div class="stat-value ${overview.market.avgChange24h > 0 ? 'text-green-400' : 'text-red-400'}">
              ${overview.market.avgChange24h > 0 ? '+' : ''}${overview.market.avgChange24h.toFixed(2)}%
            </div>
          </div>
        </div>
        <div class="symbols-list mt-4">
          ${overview.symbols.map(s => `
            <div class="symbol-row flex justify-between items-center py-2 border-b border-gray-700">
              <span class="font-bold">${s.symbol}</span>
              <span>$${s.price.toFixed(2)}</span>
              <span class="${s.change24h > 0 ? 'text-green-400' : 'text-red-400'}">
                ${s.change24h > 0 ? '+' : ''}${s.change24h.toFixed(2)}%
              </span>
            </div>
          `).join('')}
        </div>
      `;
      
      // Use smart rendering: legacy binding or HTML injection
      if (window.TitanBind && window.TitanBind.renderInto) {
        window.TitanBind.renderInto(container, html, window.TitanBind.bindOverviewData, overview);
      } else {
        // Fallback to direct HTML injection
        container.innerHTML = html;
      }
      
      hideWidgetLoading(container);
      
    } catch (error) {
      console.error('❌ [Market Overview] Error:', error);
      showWidgetError(container, 'خطا در بارگذاری نمای کلی بازار');
    }
  }

  // =============================================================================
  // 2. Market Movers Widget
  // =============================================================================
  async function loadMarketMovers() {
    // Try to find legacy container first, then fallback to new widget
    let container = null;
    if (window.DashboardWidgetsLoader && window.DashboardWidgetsLoader.findLegacyContainer) {
      container = window.DashboardWidgetsLoader.findLegacyContainer('movers');
    }
    if (!container) {
      container = document.getElementById('market-movers-widget');
    }
    if (!container) return;

    try {
      showWidgetLoading(container);
      
      const movers = await MoversAdapter.getMovers(5);
      
      // Check that movers has the correct structure
      if (!movers || !movers.gainers || !movers.losers) {
        console.error('❌ [Market Movers] Invalid data structure:', movers);
        showWidgetError(container, 'ساختار داده نامعتبر');
        return;
      }
      
      const html = `
        <div class="widget-header">
          <h3 class="text-lg font-bold">بازیگران بازار</h3>
          <span class="last-updated text-xs text-gray-400">${TitanDT.formatDateTimeFA(Date.now())}</span>
        </div>
        <div class="movers-container grid grid-cols-2 gap-4 mt-4">
          <div class="gainers">
            <h4 class="text-green-400 font-bold mb-2">🔥 برترین سودآورها</h4>
            ${movers.gainers.map(g => `
              <div class="mover-item flex justify-between py-1">
                <span>${g.symbol}</span>
                <span class="text-green-400">+${g.change24h.toFixed(2)}%</span>
              </div>
            `).join('')}
          </div>
          <div class="losers">
            <h4 class="text-red-400 font-bold mb-2">❄️ بیشترین ضررزاها</h4>
            ${movers.losers.map(l => `
              <div class="mover-item flex justify-between py-1">
                <span>${l.symbol}</span>
                <span class="text-red-400">${l.change24h.toFixed(2)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      // Use smart rendering: legacy binding or HTML injection
      if (window.TitanBind && window.TitanBind.renderInto) {
        window.TitanBind.renderInto(container, html, window.TitanBind.bindMoversData, movers);
      } else {
        // Fallback to direct HTML injection
        container.innerHTML = html;
      }
      
      hideWidgetLoading(container);
      
    } catch (error) {
      console.error('❌ [Market Movers] Error:', error);
      showWidgetError(container, 'خطا در بارگذاری بازیگران بازار');
    }
  }

  // =============================================================================
  // 3. Portfolio Widget
  // =============================================================================
  async function loadPortfolioWidget() {
    // Try to find legacy container first, then fallback to new widget
    let container = null;
    if (window.DashboardWidgetsLoader && window.DashboardWidgetsLoader.findLegacyContainer) {
      container = window.DashboardWidgetsLoader.findLegacyContainer('portfolio');
    }
    if (!container) {
      container = document.getElementById('portfolio-widget');
    }
    if (!container) return;

    try {
      showWidgetLoading(container);
      
      const perf = await PortfolioAdapter.getPerformance();
      
      if (!perf || !perf.summary) {
        showWidgetEmpty(container, 'پورتفولیو خالی است');
        return;
      }
      
      const html = `
        <div class="widget-header">
          <h3 class="text-lg font-bold">عملکرد پورتفولیو</h3>
          <span class="badge ${perf.mode === 'demo' ? 'bg-yellow-600' : 'bg-blue-600'}">${perf.mode || 'live'}</span>
          <span class="last-updated text-xs text-gray-400">${TitanDT.formatDateTimeFA(Date.now())}</span>
        </div>
        <div class="portfolio-stats grid grid-cols-3 gap-4 mt-4">
          <div class="stat-card">
            <div class="stat-label">کل دارایی</div>
            <div class="stat-value">$${(perf.summary.totalEquity || 0).toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">سود/زیان</div>
            <div class="stat-value ${(perf.summary.unrealizedPnl || 0) > 0 ? 'text-green-400' : 'text-red-400'}">
              ${(perf.summary.unrealizedPnl || 0) > 0 ? '+' : ''}$${(perf.summary.unrealizedPnl || 0).toFixed(2)}
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">موجودی</div>
            <div class="stat-value">$${(perf.summary.availableBalance || 0).toFixed(2)}</div>
          </div>
        </div>
        ${perf.positions && perf.positions.length > 0 ? `
          <div class="positions-list mt-4">
            <h4 class="font-bold mb-2">موقعیت‌های باز (${perf.positions.length})</h4>
            ${perf.positions.map(p => `
              <div class="position-row flex justify-between items-center py-2 border-b border-gray-700">
                <span class="font-bold">${p.symbol}</span>
                <span class="text-sm ${p.side === 'LONG' ? 'text-green-400' : 'text-red-400'}">${p.side}</span>
                <span>${p.size}</span>
                <span class="${(p.unrealizedPnl || 0) > 0 ? 'text-green-400' : 'text-red-400'}">
                  ${(p.unrealizedPnl || 0) > 0 ? '+' : ''}$${(p.unrealizedPnl || 0).toFixed(2)}
                </span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `;
      
      // Use smart rendering: legacy binding or HTML injection
      if (window.TitanBind && window.TitanBind.renderInto) {
        window.TitanBind.renderInto(container, html, window.TitanBind.bindPortfolioData, perf);
      } else {
        // Fallback to direct HTML injection
        container.innerHTML = html;
      }
      
      hideWidgetLoading(container);
      
    } catch (error) {
      console.error('❌ [Portfolio] Error:', error);
      showWidgetError(container, 'خطا در بارگذاری پورتفولیو');
    }
  }

  // =============================================================================
  // 4. Monitoring Widget
  // =============================================================================
  async function loadMonitoringWidget() {
    // Try to find legacy container first, then fallback to new widget
    let container = null;
    if (window.DashboardWidgetsLoader && window.DashboardWidgetsLoader.findLegacyContainer) {
      container = window.DashboardWidgetsLoader.findLegacyContainer('monitor');
    }
    if (!container) {
      container = document.getElementById('monitoring-widget');
    }
    if (!container) return;

    try {
      showWidgetLoading(container);
      
      const status = await MonitoringAdapter.getStatus();
      const healthy = await MonitoringAdapter.isHealthy();
      const cbState = await MonitoringAdapter.getCircuitBreakerState();
      const cbStateFa = MonitoringAdapter.translateCBState(cbState);
      
      // Create combined data object for binding
      const monitorData = {
        server: status.server,
        services: status.services,
        circuitBreaker: { state: cbState },
        healthy: healthy
      };
      
      const html = `
        <div class="widget-header">
          <h3 class="text-lg font-bold">وضعیت سیستم</h3>
          <span class="badge ${healthy ? 'bg-green-600' : 'bg-red-600'}">${healthy ? '✓ عملیاتی' : '✗ خطا'}</span>
          <span class="last-updated text-xs text-gray-400">${TitanDT.formatDateTimeFA(Date.now())}</span>
        </div>
        <div class="monitoring-stats mt-4">
          <div class="stat-row flex justify-between py-2">
            <span>وضعیت سرور:</span>
            <span class="font-bold">${status.server?.status || 'N/A'}</span>
          </div>
          <div class="stat-row flex justify-between py-2">
            <span>Circuit Breaker:</span>
            <span class="font-bold ${cbState === 'CLOSED' ? 'text-green-400' : 'text-red-400'}">${cbStateFa}</span>
          </div>
          <div class="stat-row flex justify-between py-2">
            <span>Uptime:</span>
            <span>${formatUptime(status.server?.uptimeSeconds || 0)}</span>
          </div>
          ${status.services?.mexcApi?.cache ? `
          <div class="stat-row flex justify-between py-2">
            <span>Cache Hit Rate:</span>
            <span>${status.services.mexcApi.cache.hitRate || 0}%</span>
          </div>
          ` : ''}
        </div>
      `;
      
      // Use smart rendering: legacy binding or HTML injection
      if (window.TitanBind && window.TitanBind.renderInto) {
        window.TitanBind.renderInto(container, html, window.TitanBind.bindMonitorData, monitorData);
      } else {
        // Fallback to direct HTML injection
        container.innerHTML = html;
      }
      
      hideWidgetLoading(container);
      
    } catch (error) {
      console.error('❌ [Monitoring] Error:', error);
      showWidgetError(container, 'خطا در بارگذاری وضعیت سیستم');
    }
  }

  // =============================================================================
  // Helper Functions
  // =============================================================================
  
  function showWidgetLoading(container) {
    container.innerHTML = `
      <div class="widget-loading flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    `;
  }

  function hideWidgetLoading(container) {
    const loader = container.querySelector('.widget-loading');
    if (loader) loader.remove();
  }

  function showWidgetError(container, message) {
    container.innerHTML = `
      <div class="widget-error text-center py-8">
        <i class="fas fa-exclamation-triangle text-red-400 text-3xl mb-2"></i>
        <div class="text-red-400">${message}</div>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700">
          تلاش مجدد
        </button>
      </div>
    `;
  }

  function showWidgetEmpty(container, message) {
    container.innerHTML = `
      <div class="widget-empty text-center py-8">
        <i class="fas fa-inbox text-gray-500 text-3xl mb-2"></i>
        <div class="text-gray-400">${message}</div>
      </div>
    `;
  }

  function formatTime(date) {
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatVolume(volume) {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  }

  function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // =============================================================================
  // Auto-refresh System
  // =============================================================================
  
  function startAutoRefresh(widgetName, loadFunction) {
    // اگر تایمر قبلی وجود دارد، پاک کن
    if (refreshTimers[widgetName]) {
      clearInterval(refreshTimers[widgetName]);
    }
    
    // تایمر جدید بساز
    refreshTimers[widgetName] = setInterval(() => {
      if (isPageVisible) {
        console.log(`🔄 [${widgetName}] Auto-refresh triggered`);
        loadFunction();
      }
    }, REFRESH_INTERVAL);
    
    console.log(`✅ [${widgetName}] Auto-refresh started (${REFRESH_INTERVAL/1000}s interval)`);
  }

  function stopAllAutoRefresh() {
    Object.keys(refreshTimers).forEach(widgetName => {
      clearInterval(refreshTimers[widgetName]);
      console.log(`⏹️  [${widgetName}] Auto-refresh stopped`);
    });
    refreshTimers = {};
  }

  function refreshAllWidgets() {
    console.log('🔄 [Widgets] Manual refresh all');
    loadMarketOverview();
    loadMarketMovers();
    loadPortfolioWidget();
    loadMonitoringWidget();
  }

  // =============================================================================
  // Initialization
  // =============================================================================
  
  function initializeWidgets() {
    console.log('🚀 [Widgets Integration] Initializing Phase C widgets...');
    
    // بررسی وجود Adapters
    if (typeof OverviewAdapter === 'undefined') {
      console.error('❌ OverviewAdapter not loaded!');
      return;
    }
    if (typeof MoversAdapter === 'undefined') {
      console.error('❌ MoversAdapter not loaded!');
      return;
    }
    if (typeof PortfolioAdapter === 'undefined') {
      console.error('❌ PortfolioAdapter not loaded!');
      return;
    }
    if (typeof MonitoringAdapter === 'undefined') {
      console.error('❌ MonitoringAdapter not loaded!');
      return;
    }
    
    console.log('✅ All adapters loaded successfully');
    
    // بارگذاری اولیه
    loadMarketOverview();
    loadMarketMovers();
    loadPortfolioWidget();
    loadMonitoringWidget();
    
    // شروع auto-refresh برای هر ویجت
    startAutoRefresh('MarketOverview', loadMarketOverview);
    startAutoRefresh('MarketMovers', loadMarketMovers);
    startAutoRefresh('Portfolio', loadPortfolioWidget);
    startAutoRefresh('Monitoring', loadMonitoringWidget);
    
    console.log('✅ [Widgets Integration] All widgets initialized');
  }

  // Export به global scope
  global.WidgetsIntegration = {
    initialize: initializeWidgets,
    refresh: refreshAllWidgets,
    stop: stopAllAutoRefresh,
    loadMarketOverview,
    loadMarketMovers,
    loadPortfolioWidget,
    loadMonitoringWidget
  };

  // ---- Expose TitanAPI globally for external access ----
  global.TitanAPI = global.TitanAPI || {
    getMarketOverview: () => OverviewAdapter?.getMarketOverview?.(),
    getMarketMovers: () => MoversAdapter?.getMovers?.(5),
    getPortfolioPerformance: () => PortfolioAdapter?.getPerformance?.(),
    getSystemStatus: () => MonitoringAdapter?.getStatus?.(),
    isHealthy: () => MonitoringAdapter?.isHealthy?.(),
    getCircuitBreakerState: () => MonitoringAdapter?.getCircuitBreakerState?.(),
    refresh: refreshAllWidgets,
    stop: stopAllAutoRefresh
  };

  // Auto-initialize وقتی صفحه لود شد
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidgets);
  } else {
    initializeWidgets();
  }

})(window);

// === [Task 3.4] Farsi Date/Time Helpers (append at end of file) ===
(function () {
  /**
   * تاریخ/زمان فارسی با فرمت خوانا:
   * مثال: "۱۴۰۴/۰۸/۱۹ — ۱۴:۳۰:۴۵"
   */
  function formatDateTimeFA(ts) {
    const d = new Date(ts);
    const dateStr = d.toLocaleDateString('fa-IR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const timeStr = d.toLocaleTimeString('fa-IR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    return `${dateStr} — ${timeStr}`;
  }

  /**
   * زمان کوتاه (فقط ساعت) برای ویدجت‌ها
   * مثال: "۱۴:۳۰:۴۵"
   */
  function formatTimeFA(ts) {
    return new Date(ts).toLocaleTimeString('fa-IR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  // در دسترس برای سایر ماژول‌ها
  window.TitanDT = window.TitanDT || {};
  window.TitanDT.formatDateTimeFA = formatDateTimeFA;
  window.TitanDT.formatTimeFA = formatTimeFA;
})();

// === Legacy Binders: تزریق داده در ویجت‌های قدیمی (بدون بازنویسی DOM) ===
(function () {
  /**
   * Helper: set text content in a selector
   */
  function setText(root, sel, val) {
    const n = root.querySelector(sel);
    if (n) n.textContent = val;
  }

  /**
   * تشخیص اینکه container قدیمی (legacy) است یا نه
   * با چک کردن وجود [data-field] attributeها
   */
  function isLegacy(root) {
    return !!root.querySelector('[data-field]');
  }

  /**
   * Bind Overview Data به ویجت قدیمی
   * فرض: container شامل [data-field="btc-price"], [data-field="eth-price"], etc.
   */
  function bindOverviewData(root, data) {
    if (!data || !data.symbols) return;
    
    console.log('📊 [TitanBind] Binding overview data to legacy container');
    
    // Bind symbol prices
    data.symbols.forEach(s => {
      const symbolLower = s.symbol.toLowerCase().replace('usdt', '');
      setText(root, `[data-field="${symbolLower}-price"]`, `$${s.price.toFixed(2)}`);
      setText(root, `[data-field="${symbolLower}-change"]`, `${s.change24h > 0 ? '+' : ''}${s.change24h.toFixed(2)}%`);
      
      // Update color class
      const changeEl = root.querySelector(`[data-field="${symbolLower}-change"]`);
      if (changeEl) {
        changeEl.className = s.change24h > 0 ? 'text-green-400' : 'text-red-400';
      }
    });
    
    // Bind market stats
    if (data.market) {
      setText(root, '[data-field="total-volume"]', formatVolume(data.market.totalVolume24h));
      setText(root, '[data-field="avg-change"]', `${data.market.avgChange24h > 0 ? '+' : ''}${data.market.avgChange24h.toFixed(2)}%`);
      
      const avgChangeEl = root.querySelector('[data-field="avg-change"]');
      if (avgChangeEl) {
        avgChangeEl.className = data.market.avgChange24h > 0 ? 'text-green-400' : 'text-red-400';
      }
    }
    
    // Update timestamp
    setText(root, '[data-field="last-updated"]', window.TitanDT.formatDateTimeFA(Date.now()));
  }

  /**
   * Bind Movers Data به ویجت قدیمی
   */
  function bindMoversData(root, data) {
    if (!data || (!data.gainers && !data.losers)) return;
    
    console.log('🔥 [TitanBind] Binding movers data to legacy container');
    
    // Bind gainers
    if (data.gainers && data.gainers.length > 0) {
      const gainersContainer = root.querySelector('[data-field="gainers-list"]');
      if (gainersContainer) {
        gainersContainer.innerHTML = data.gainers.map(g => `
          <div class="mover-item flex justify-between py-1">
            <span>${g.symbol}</span>
            <span class="text-green-400">+${g.change24h.toFixed(2)}%</span>
          </div>
        `).join('');
      }
      
      // Bind top gainer
      const topGainer = data.gainers[0];
      setText(root, '[data-field="top-gainer-symbol"]', topGainer.symbol);
      setText(root, '[data-field="top-gainer-change"]', `+${topGainer.change24h.toFixed(2)}%`);
    }
    
    // Bind losers
    if (data.losers && data.losers.length > 0) {
      const losersContainer = root.querySelector('[data-field="losers-list"]');
      if (losersContainer) {
        losersContainer.innerHTML = data.losers.map(l => `
          <div class="mover-item flex justify-between py-1">
            <span>${l.symbol}</span>
            <span class="text-red-400">${l.change24h.toFixed(2)}%</span>
          </div>
        `).join('');
      }
      
      // Bind top loser
      const topLoser = data.losers[0];
      setText(root, '[data-field="top-loser-symbol"]', topLoser.symbol);
      setText(root, '[data-field="top-loser-change"]', `${topLoser.change24h.toFixed(2)}%`);
    }
    
    // Update timestamp
    setText(root, '[data-field="last-updated"]', window.TitanDT.formatDateTimeFA(Date.now()));
  }

  /**
   * Bind Portfolio Data به ویجت قدیمی
   */
  function bindPortfolioData(root, data) {
    if (!data || !data.summary) return;
    
    console.log('💼 [TitanBind] Binding portfolio data to legacy container');
    
    const summary = data.summary;
    
    // Bind summary stats
    setText(root, '[data-field="total-equity"]', `$${(summary.totalEquity || 0).toFixed(2)}`);
    setText(root, '[data-field="unrealized-pnl"]', `${(summary.unrealizedPnl || 0) > 0 ? '+' : ''}$${(summary.unrealizedPnl || 0).toFixed(2)}`);
    setText(root, '[data-field="available-balance"]', `$${(summary.availableBalance || 0).toFixed(2)}`);
    
    // Update PnL color
    const pnlEl = root.querySelector('[data-field="unrealized-pnl"]');
    if (pnlEl) {
      pnlEl.className = (summary.unrealizedPnl || 0) > 0 ? 'text-green-400' : 'text-red-400';
    }
    
    // Bind mode badge
    setText(root, '[data-field="mode"]', data.mode || 'live');
    
    // Bind positions count
    if (data.positions) {
      setText(root, '[data-field="positions-count"]', data.positions.length);
      
      // Bind positions list
      const positionsContainer = root.querySelector('[data-field="positions-list"]');
      if (positionsContainer && data.positions.length > 0) {
        positionsContainer.innerHTML = data.positions.map(p => `
          <div class="position-row flex justify-between items-center py-2 border-b border-gray-700">
            <span class="font-bold">${p.symbol}</span>
            <span class="text-sm ${p.side === 'LONG' ? 'text-green-400' : 'text-red-400'}">${p.side}</span>
            <span>${p.size}</span>
            <span class="${(p.unrealizedPnl || 0) > 0 ? 'text-green-400' : 'text-red-400'}">
              ${(p.unrealizedPnl || 0) > 0 ? '+' : ''}$${(p.unrealizedPnl || 0).toFixed(2)}
            </span>
          </div>
        `).join('');
      }
    }
    
    // Update timestamp
    setText(root, '[data-field="last-updated"]', window.TitanDT.formatDateTimeFA(Date.now()));
  }

  /**
   * Bind Monitoring Data به ویجت قدیمی
   */
  function bindMonitorData(root, data) {
    if (!data || !data.server) return;
    
    console.log('⚙️ [TitanBind] Binding monitoring data to legacy container');
    
    // Bind server status
    setText(root, '[data-field="server-status"]', data.server.status || 'N/A');
    
    // Bind circuit breaker state
    const cbState = data.circuitBreaker?.state || 'UNKNOWN';
    const cbStateFa = window.MonitoringAdapter?.translateCBState?.(cbState) || cbState;
    setText(root, '[data-field="circuit-breaker"]', cbStateFa);
    
    const cbEl = root.querySelector('[data-field="circuit-breaker"]');
    if (cbEl) {
      cbEl.className = cbState === 'CLOSED' ? 'text-green-400' : 'text-red-400';
    }
    
    // Bind uptime
    if (data.server.uptimeSeconds) {
      const uptimeStr = formatUptime(data.server.uptimeSeconds);
      setText(root, '[data-field="uptime"]', uptimeStr);
    }
    
    // Bind cache hit rate
    if (data.services?.mexcApi?.cache) {
      setText(root, '[data-field="cache-hit-rate"]', `${data.services.mexcApi.cache.hitRate || 0}%`);
    }
    
    // Bind health badge
    const healthy = data.healthy !== false;
    setText(root, '[data-field="health-badge"]', healthy ? '✓ عملیاتی' : '✗ خطا');
    
    const healthBadge = root.querySelector('[data-field="health-badge"]');
    if (healthBadge) {
      healthBadge.className = healthy ? 'bg-green-600' : 'bg-red-600';
    }
    
    // Update timestamp
    setText(root, '[data-field="last-updated"]', window.TitanDT.formatDateTimeFA(Date.now()));
  }

  /**
   * Smart Rendering: اگر legacy است bind کن، وگرنه HTML را inject کن
   * 
   * @param {HTMLElement} container - کانتینری که باید داده در آن رندر شود
   * @param {string} html - HTML جدید برای injection (اگر legacy نباشد)
   * @param {Function} binder - تابع binder برای legacy mode
   * @param {Object} data - داده‌ای که باید رندر شود
   */
  function renderInto(container, html, binder, data) {
    if (!container) {
      console.warn('⚠️ [TitanBind] renderInto: container is null');
      return;
    }
    
    if (isLegacy(container)) {
      console.log('✅ [TitanBind] Using legacy binding mode');
      binder(container, data);
      container.classList.remove('hidden');
    } else {
      console.log('✅ [TitanBind] Using HTML injection mode');
      container.innerHTML = html;
      container.classList.remove('hidden');
    }
  }

  // Helper function from widgets-integration.js
  function formatVolume(volume) {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  }

  function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // Export
  window.TitanBind = {
    renderInto,
    bindOverviewData,
    bindMoversData,
    bindPortfolioData,
    bindMonitorData,
    isLegacy
  };

  console.log('✅ [TitanBind] Legacy data binding system loaded');
})();

// === Direct Legacy Widget Binders: اتصال مستقیم ویجت‌های قدیمی به APIهای واقعی ===
(function () {
  'use strict';

  // 3.1 Overview (بازار رمز ارزها)
  async function bindLegacyOverview() {
    try {
      const host = document.querySelector('[data-widget="overview"]');
      if (!host) {
        console.log('ℹ️ [bindLegacyOverview] Widget not found');
        return;
      }

      const data = await OverviewAdapter.getMarketOverview();
      console.log('✅ [bindLegacyOverview] Data received:', data);

      // انتظار: { symbols: [{symbol:'BTCUSDT', price, volume, change24h}, ...], market, timestamp }
      const find = (f) => host.querySelector(`[data-field="${f}"]`);

      const by = (sym) => (data.symbols || []).find(s => s.symbol?.startsWith(sym));
      const btc = by('BTC');
      const eth = by('ETH');
      const bnb = by('BNB');

      if (btc) {
        if (find('btc-price'))  find('btc-price').textContent  = `$${(+btc.price).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
        if (find('btc-change')) find('btc-change').textContent = `${btc.change24h >= 0 ? '+' : ''}${(+btc.change24h).toFixed(2)}%`;
        if (find('btc-volume')) find('btc-volume').textContent = `$${(+btc.volume24h).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
      }
      if (eth) {
        if (find('eth-price'))  find('eth-price').textContent  = `$${(+eth.price).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
        if (find('eth-change')) find('eth-change').textContent = `${eth.change24h >= 0 ? '+' : ''}${(+eth.change24h).toFixed(2)}%`;
        if (find('eth-volume')) find('eth-volume').textContent = `$${(+eth.volume24h).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
      }
      if (bnb) {
        if (find('bnb-price'))  find('bnb-price').textContent  = `$${(+bnb.price).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
        if (find('bnb-change')) find('bnb-change').textContent = `${bnb.change24h >= 0 ? '+' : ''}${(+bnb.change24h).toFixed(2)}%`;
        if (find('bnb-volume')) find('bnb-volume').textContent = `$${(+bnb.volume24h).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
      }

      // Total volume and average change
      if (data.market) {
        if (find('total-volume')) find('total-volume').textContent = formatVolume(data.market.totalVolume24h);
        if (find('avg-change'))   find('avg-change').textContent = `${data.market.avgChange24h >= 0 ? '+' : ''}${data.market.avgChange24h.toFixed(2)}%`;
      }

      const ts = data.timestamp || Date.now();
      const lt = find('last-updated');
      if (lt) lt.textContent = window.TitanDT?.formatDateTimeFA
        ? window.TitanDT.formatDateTimeFA(ts)
        : new Date(ts).toLocaleString('fa-IR');

      console.log('✅ [bindLegacyOverview] Binding complete');
    } catch (e) {
      console.error('❌ [bindLegacyOverview] Error:', e);
    }
  }

  // 3.2 Movers (بازیگران بازار)
  async function bindLegacyMovers() {
    try {
      const host = document.querySelector('[data-widget="movers"]');
      if (!host) {
        console.log('ℹ️ [bindLegacyMovers] Widget not found');
        return;
      }

      const { gainers = [], losers = [] } = await MoversAdapter.getMovers(5);
      console.log('✅ [bindLegacyMovers] Data received:', { gainersCount: gainers.length, losersCount: losers.length });

      const gBox = host.querySelector('[data-field="gainers-list"]');
      const lBox = host.querySelector('[data-field="losers-list"]');

      const make = (arr, isGainer) => (arr || []).map(it =>
        `<div class="flex justify-between py-1 border-b border-gray-700">
          <span class="font-semibold">${it.symbol}</span>
          <span class="${isGainer ? 'text-green-400' : 'text-red-400'}">${isGainer ? '+' : ''}${(+it.change24h).toFixed(2)}%</span>
        </div>`
      ).join('');

      if (gBox) gBox.innerHTML = make(gainers, true);
      if (lBox) lBox.innerHTML = make(losers, false);

      // Top gainer/loser
      const find = (f) => host.querySelector(`[data-field="${f}"]`);
      if (gainers[0]) {
        if (find('top-gainer-symbol')) find('top-gainer-symbol').textContent = gainers[0].symbol;
        if (find('top-gainer-change')) find('top-gainer-change').textContent = `+${gainers[0].change24h.toFixed(2)}%`;
      }
      if (losers[0]) {
        if (find('top-loser-symbol')) find('top-loser-symbol').textContent = losers[0].symbol;
        if (find('top-loser-change')) find('top-loser-change').textContent = `${losers[0].change24h.toFixed(2)}%`;
      }

      const lt = find('last-updated');
      if (lt) lt.textContent = window.TitanDT?.formatDateTimeFA(Date.now());

      console.log('✅ [bindLegacyMovers] Binding complete');
    } catch (e) {
      console.error('❌ [bindLegacyMovers] Error:', e);
    }
  }

  // 3.3 Portfolio (خلاصه پرتفولیو)
  async function bindLegacyPortfolio() {
    try {
      const host = document.querySelector('[data-widget="portfolio"]');
      if (!host) {
        console.log('ℹ️ [bindLegacyPortfolio] Widget not found');
        return;
      }

      const perf = await PortfolioAdapter.getPerformance();
      console.log('✅ [bindLegacyPortfolio] Data received:', perf);

      // انتظار: { mode, summary: {totalEquity, unrealizedPnl, availableBalance}, positions, ... }
      const F = (f) => host.querySelector(`[data-field="${f}"]`);
      
      if (F('mode')) F('mode').textContent = (perf.mode || 'live').toUpperCase();
      
      if (perf.summary) {
        if (F('total-equity')) F('total-equity').textContent = `$${(+perf.summary.totalEquity || 0).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
        if (F('unrealized-pnl')) {
          const pnl = +perf.summary.unrealizedPnl || 0;
          F('unrealized-pnl').textContent = `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
          F('unrealized-pnl').className = pnl >= 0 ? 'text-green-400' : 'text-red-400';
        }
        if (F('available-balance')) F('available-balance').textContent = `$${(+perf.summary.availableBalance || 0).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
      }
      
      if (F('positions-count')) F('positions-count').textContent = `${(perf.positions || []).length}`;

      // Positions list
      if (perf.positions && perf.positions.length > 0) {
        const posList = F('positions-list');
        if (posList) {
          posList.innerHTML = perf.positions.map(p => `
            <div class="position-row flex justify-between items-center py-2 border-b border-gray-700">
              <span class="font-bold">${p.symbol}</span>
              <span class="text-sm ${p.side === 'LONG' ? 'text-green-400' : 'text-red-400'}">${p.side}</span>
              <span>${p.size}</span>
              <span class="${(p.unrealizedPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${(p.unrealizedPnl || 0) >= 0 ? '+' : ''}$${Math.abs(p.unrealizedPnl || 0).toFixed(2)}
              </span>
            </div>
          `).join('');
        }
      }

      const lt = F('last-updated');
      if (lt) lt.textContent = window.TitanDT?.formatDateTimeFA(Date.now());

      console.log('✅ [bindLegacyPortfolio] Binding complete');
    } catch (e) {
      console.error('❌ [bindLegacyPortfolio] Error:', e);
    }
  }

  // 3.4 Monitor (وضعیت سیستم)
  async function bindLegacyMonitor() {
    try {
      const host = document.querySelector('[data-widget="monitor"]');
      if (!host) {
        console.log('ℹ️ [bindLegacyMonitor] Widget not found');
        return;
      }

      const m = await MonitoringAdapter.getStatus();
      const healthy = await MonitoringAdapter.isHealthy();
      const cbState = await MonitoringAdapter.getCircuitBreakerState();
      
      console.log('✅ [bindLegacyMonitor] Data received:', { healthy, cbState });

      // انتظار: { server: {status, uptimeSeconds}, services, ... }
      const F = (f) => host.querySelector(`[data-field="${f}"]`);
      
      if (F('health-badge')) {
        F('health-badge').textContent = healthy ? '✓ عملیاتی' : '✗ خطا';
        F('health-badge').className = healthy ? 'badge bg-green-600' : 'badge bg-red-600';
      }
      
      if (F('server-status')) F('server-status').textContent = m.server?.status || 'N/A';
      
      if (F('circuit-breaker')) {
        const cbStateFa = MonitoringAdapter.translateCBState(cbState);
        F('circuit-breaker').textContent = cbStateFa;
        F('circuit-breaker').className = cbState === 'CLOSED' ? 'text-green-400' : 'text-red-400';
      }
      
      if (F('uptime')) {
        const uptimeSec = m.server?.uptimeSeconds || 0;
        F('uptime').textContent = formatUptime(uptimeSec);
      }
      
      if (F('cache-hit-rate') && m.services?.mexcApi?.cache) {
        F('cache-hit-rate').textContent = `${m.services.mexcApi.cache.hitRate || 0}%`;
      }

      const lt = F('last-updated');
      if (lt) lt.textContent = window.TitanDT?.formatDateTimeFA(Date.now());

      console.log('✅ [bindLegacyMonitor] Binding complete');
    } catch (e) {
      console.error('❌ [bindLegacyMonitor] Error:', e);
    }
  }

  // 3.5 Bind All Legacy Widgets
  async function bindAllLegacy() {
    if (window.TitanFlags?.preferLegacyWidgets === false) {
      console.log('ℹ️ [bindAllLegacy] Legacy widgets disabled by flag');
      return;
    }

    console.log('🔄 [bindAllLegacy] Starting legacy widget binding...');
    
    // 🚨 SAFE MODE: Only bind allowed widgets
    const isSafeMode = window.TitanFlags?.SafeMode || window.TitanSafeMode?.config?.enabled;
    
    if (isSafeMode) {
      console.log('🚨 [bindAllLegacy] SAFE MODE ACTIVE - binding only 4 core widgets');
      
      // Only bind the 4 core widgets (skip movers/watchlist)
      await Promise.allSettled([
        bindLegacyOverview(),   // Market overview
        bindLegacyPortfolio(),  // Portfolio summary
        bindLegacyMonitor()     // System monitoring
        // bindLegacyMovers() - SKIPPED in Safe Mode (not in core 4)
      ]);
    } else {
      // Normal mode: bind all widgets
      await Promise.allSettled([
        bindLegacyOverview(),
        bindLegacyMovers(),
        bindLegacyPortfolio(),
        bindLegacyMonitor()
      ]);
    }

    console.log('✅ [bindAllLegacy] All legacy widgets processed');
  }

  // Helper: formatUptime (if not already defined)
  function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // Helper: formatVolume (if not already defined)
  function formatVolume(volume) {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  }

  // 3.6 Auto-execution after DOM ready + 30s interval refresh
  function initLegacyBinding() {
    // Wait for Annotator to complete (400ms delay)
    setTimeout(() => {
      bindAllLegacy();
    }, 400);

    // Auto-refresh every 30 seconds
    setInterval(() => {
      if (!document.hidden) { // Only refresh when page is visible
        bindAllLegacy();
      }
    }, 30000);

    console.log('✅ [Legacy Binding] Auto-refresh system initialized (30s interval)');
  }

  // Execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLegacyBinding);
  } else {
    initLegacyBinding();
  }

  // Export for manual testing
  window.TitanLegacyBind = {
    bindLegacyOverview,
    bindLegacyMovers,
    bindLegacyPortfolio,
    bindLegacyMonitor,
    bindAllLegacy
  };

  console.log('✅ [Legacy Binding] Direct API binding system loaded');
  
  // یکنواخت‌سازی رویداد Ready با گارد anti-double-fire
  (function ensureReadyOnce(){
    if (!window.__TitanWidgetsReadyFired) {
      window.__TitanWidgetsReadyFired = true;
      
      const ev = new Event('titan:widgets-ready');
      try { document.dispatchEvent(ev); } catch(e) { console.warn('Failed to dispatch on document:', e); }
      try { window.dispatchEvent(ev); } catch(e) { console.warn('Failed to dispatch on window:', e); }
      
      console.log('✅ [Widgets Ready] Event dispatched to both document and window');
    }
  })();
  
  // اگر صفحه بعداً لود شد، دوباره سیگنال بفرست
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      if (!window.__TitanWidgetsReadyFired) {
        window.__TitanWidgetsReadyFired = true;
        const ev = new Event('titan:widgets-ready');
        try { document.dispatchEvent(ev); } catch {}
        try { window.dispatchEvent(ev); } catch {}
      }
    });
  }
  
  // 🩺 Improvement 3: گزارش سلامت سبک در کنسول (دیباگ سریع)
  window.TitanDiag = async function(){
    const widgets = [...document.querySelectorAll('[data-widget]')].map(n=>n.getAttribute('data-widget'));
    const api = !!(window.TitanAPI && typeof TitanAPI.getMarketSummary==='function');
    const bind = !!(window.TitanLegacyBind && typeof TitanLegacyBind.bindAllLegacy==='function');
    const ready = !!window.__TitanWidgetsReadyFired;
    console.table([{ widgets: widgets.join(', ') || '—', count: widgets.length, api, bind, ready }]);
    try {
      const r = await fetch('/api/market/overview', { cache:'no-store' });
      console.log('overview:', r.status, r.ok ? 'OK' : 'FAIL');
    } catch (e) { console.log('overview: network error'); }
  };
  console.log('ℹ️ Type TitanDiag() for a one-shot health table');
})();
