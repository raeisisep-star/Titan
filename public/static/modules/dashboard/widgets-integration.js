// public/static/modules/dashboard/widgets-integration.js
// Phase C: Widget UI Integration با استفاده از Adapters جدید (Sprint 2)
// تاریخ: 2025-11-10

(function(global) {
  'use strict';

  // تنظیمات Auto-refresh
  const REFRESH_INTERVAL = 30000; // 30 seconds
  let refreshTimers = {};
  let isPageVisible = true;

  // Visibility API برای توقف refresh در تب مخفی
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    console.log(`📊 [Widgets] Page visibility: ${isPageVisible ? 'visible' : 'hidden'}`);
    
    if (isPageVisible) {
      // وقتی تب دوباره visible شد، همه را refresh کن
      refreshAllWidgets();
    }
  });

  // =============================================================================
  // 1. Market Overview Widget
  // =============================================================================
  async function loadMarketOverview() {
    const container = document.getElementById('market-overview-widget');
    if (!container) return;

    try {
      showWidgetLoading(container);
      
      const overview = await OverviewAdapter.getMarketOverview();
      
      // رندر داده‌ها
      const html = `
        <div class="widget-header">
          <h3 class="text-lg font-bold">نمای کلی بازار</h3>
          <span class="last-updated text-xs text-gray-400">${formatTime(new Date())}</span>
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
      
      container.innerHTML = html;
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
    const container = document.getElementById('market-movers-widget');
    if (!container) return;

    try {
      showWidgetLoading(container);
      
      const movers = await MoversAdapter.getMovers(5);
      
      const html = `
        <div class="widget-header">
          <h3 class="text-lg font-bold">بازیگران بازار</h3>
          <span class="last-updated text-xs text-gray-400">${formatTime(new Date())}</span>
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
      
      container.innerHTML = html;
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
    const container = document.getElementById('portfolio-widget');
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
          <span class="last-updated text-xs text-gray-400">${formatTime(new Date())}</span>
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
      
      container.innerHTML = html;
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
    const container = document.getElementById('monitoring-widget');
    if (!container) return;

    try {
      showWidgetLoading(container);
      
      const status = await MonitoringAdapter.getStatus();
      const healthy = await MonitoringAdapter.isHealthy();
      const cbState = await MonitoringAdapter.getCircuitBreakerState();
      const cbStateFa = MonitoringAdapter.translateCBState(cbState);
      
      const html = `
        <div class="widget-header">
          <h3 class="text-lg font-bold">وضعیت سیستم</h3>
          <span class="badge ${healthy ? 'bg-green-600' : 'bg-red-600'}">${healthy ? '✓ عملیاتی' : '✗ خطا'}</span>
          <span class="last-updated text-xs text-gray-400">${formatTime(new Date())}</span>
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
      
      container.innerHTML = html;
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

  // Auto-initialize وقتی صفحه لود شد
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidgets);
  } else {
    initializeWidgets();
  }

})(window);
