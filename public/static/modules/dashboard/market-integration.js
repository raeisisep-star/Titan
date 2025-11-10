// public/static/modules/dashboard/market-integration.js
// Phase B2: اتصال کامل Dashboard به MEXC API واقعی
// اضافه به ساختار موجود - بدون بازنویسی

(function(global) {
  'use strict';

  // Symbol پیش‌فرض (می‌تواند از تنظیمات کاربر بیاید)
  const DEFAULT_SYMBOL = 'BTCUSDT';
  
  // Timer برای auto-refresh
  let refreshTimer = null;
  const REFRESH_INTERVAL = 30000; // 30 ثانیه
  
  // Flag برای جلوگیری از درخواست‌های موازی
  let isLoading = false;

  /**
   * بارگذاری نمودار اصلی با داده‌های واقعی از MEXC
   * Updated: Sprint 2 - Now using /api/chart/data/:symbol/:timeframe endpoint
   */
  async function loadPrimaryChart(timeframe = '1h', limit = 200) {
    if (isLoading) return;
    
    try {
      isLoading = true;
      const symbol = global.TITAN_SYMBOL || DEFAULT_SYMBOL;
      
      // دریافت کندل‌ها از API جدید
      // Sprint 2: Using ChartAdapter instead of MarketAdapter
      const candles = typeof ChartAdapter !== 'undefined'
        ? await ChartAdapter.getCandles(symbol, timeframe, limit)
        : await MarketAdapter.getHistory(symbol, timeframe, limit); // Fallback
      
      if (!candles || candles.length === 0) {
        throw new Error('No candles received from API');
      }
      
      console.log(`✅ Loaded ${candles.length} candles for ${symbol} (${timeframe})`);
      
      // تبدیل به فرمت مورد نیاز چارت
      const chartData = candles.map(c => ({
        time: c.time || c.openTime,
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume)
      }));
      
      // رندر چارت (از تابع موجود استفاده می‌کنیم)
      if (typeof renderMarketChart === 'function') {
        renderMarketChart(chartData);
      } else if (global.dashboardModule?.renderChart) {
        global.dashboardModule.renderChart(chartData);
      } else {
        console.warn('⚠️ Chart render function not found');
      }
      
    } catch (error) {
      console.error('❌ Failed to load chart data:', error);
      showSoftError('خطا در بارگذاری نمودار. لطفاً دوباره تلاش کنید.');
    } finally {
      isLoading = false;
    }
  }

  /**
   * بارگذاری و به‌روزرسانی قیمت لحظه‌ای
   */
  async function loadPriceTicker() {
    try {
      const symbol = global.TITAN_SYMBOL || DEFAULT_SYMBOL;
      const data = await MarketAdapter.getPrice(symbol);
      
      if (!data || !data.price) {
        throw new Error('Invalid price data');
      }
      
      // به‌روزرسانی UI
      updatePriceUI(data.price, symbol);
      
      // بارگذاری 24hr stats
      const ticker = await MarketAdapter.getTicker24h(symbol);
      if (ticker) {
        updateTickerUI(ticker);
      }
      
    } catch (error) {
      console.error('❌ Failed to load price ticker:', error);
      // در صورت خطا، UI را به حالت -- تنظیم می‌کنیم
      updatePriceUI(null, 'ERROR');
    }
  }

  /**
   * بارگذاری Order Book
   */
  async function loadOrderBook() {
    try {
      const symbol = global.TITAN_SYMBOL || DEFAULT_SYMBOL;
      const depth = await MarketAdapter.getDepth(symbol, 50);
      
      if (!depth || !depth.bids || !depth.asks) {
        throw new Error('Invalid order book data');
      }
      
      console.log(`✅ Order book loaded: ${depth.bids.length} bids, ${depth.asks.length} asks`);
      
      // رندر order book
      if (typeof renderOrderBook === 'function') {
        renderOrderBook(depth.bids, depth.asks);
      } else if (global.dashboardModule?.renderOrderBook) {
        global.dashboardModule.renderOrderBook(depth.bids, depth.asks);
      }
      
    } catch (error) {
      console.error('❌ Failed to load order book:', error);
    }
  }

  /**
   * به‌روزرسانی UI قیمت
   */
  function updatePriceUI(price, symbol) {
    // فرمت قیمت
    const formatted = price ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price) : '--';
    
    // پیدا کردن المنت‌های UI
    const priceElements = document.querySelectorAll('[data-current-price], #current-price, .price-display');
    
    priceElements.forEach(el => {
      el.textContent = formatted;
      
      // انیمیشن تغییر قیمت
      if (price) {
        el.classList.add('price-update-flash');
        setTimeout(() => el.classList.remove('price-update-flash'), 600);
      }
    });
    
    // به‌روزرسانی symbol
    if (symbol) {
      const symbolElements = document.querySelectorAll('[data-current-symbol], #current-symbol');
      symbolElements.forEach(el => {
        el.textContent = symbol;
      });
    }
  }

  /**
   * به‌روزرسانی UI تیکر 24 ساعته
   */
  function updateTickerUI(ticker) {
    // تغییر درصد
    const changePercent = ticker.priceChangePercent;
    const changeClass = changePercent >= 0 ? 'text-green-400' : 'text-red-400';
    const changeIcon = changePercent >= 0 ? '▲' : '▼';
    
    const changeElements = document.querySelectorAll('[data-price-change]');
    changeElements.forEach(el => {
      el.textContent = `${changeIcon} ${Math.abs(changePercent).toFixed(2)}%`;
      el.className = `${changeClass} font-bold`;
    });
    
    // Volume
    if (ticker.volume) {
      const volumeElements = document.querySelectorAll('[data-volume]');
      volumeElements.forEach(el => {
        el.textContent = new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 2
        }).format(ticker.volume);
      });
    }
    
    // High/Low
    if (ticker.highPrice) {
      const highElements = document.querySelectorAll('[data-high-price]');
      highElements.forEach(el => {
        el.textContent = `$${parseFloat(ticker.highPrice).toFixed(2)}`;
      });
    }
    
    if (ticker.lowPrice) {
      const lowElements = document.querySelectorAll('[data-low-price]');
      lowElements.forEach(el => {
        el.textContent = `$${parseFloat(ticker.lowPrice).toFixed(2)}`;
      });
    }
  }

  /**
   * نمایش خطای نرم
   */
  function showSoftError(message) {
    // بررسی وجود box خطا
    let errorBox = document.querySelector('.market-data-error');
    
    if (!errorBox) {
      errorBox = document.createElement('div');
      errorBox.className = 'market-data-error';
      errorBox.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
      `;
      
      errorBox.innerHTML = `
        <span class="error-message"></span>
        <button class="retry-btn" style="
          background: white;
          color: #ef4444;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        ">تلاش مجدد</button>
      `;
      
      document.body.appendChild(errorBox);
      
      // دکمه retry
      errorBox.querySelector('.retry-btn').addEventListener('click', () => {
        errorBox.remove();
        loadAllMarketData();
      });
    }
    
    errorBox.querySelector('.error-message').textContent = message;
    
    // حذف خودکار بعد از 10 ثانیه
    setTimeout(() => errorBox.remove(), 10000);
  }

  /**
   * بارگذاری همه داده‌های بازار
   */
  async function loadAllMarketData() {
    console.log('🔄 Loading all market data...');
    
    try {
      // بارگذاری موازی
      await Promise.allSettled([
        loadPrimaryChart(),
        loadPriceTicker(),
        loadOrderBook()
      ]);
      
      console.log('✅ All market data loaded');
      
    } catch (error) {
      console.error('❌ Error loading market data:', error);
    }
  }

  /**
   * شروع auto-refresh با visibility management
   */
  function startAutoRefresh() {
    stopAutoRefresh();
    
    console.log('🔄 Starting auto-refresh (30s interval)');
    
    refreshTimer = setInterval(() => {
      // فقط اگر صفحه visible باشد
      if (!document.hidden) {
        console.log('🔄 Auto-refreshing market data...');
        loadPriceTicker().catch(err => console.warn('Price refresh failed:', err));
        // نمودار و order book را کمتر refresh می‌کنیم
      }
    }, REFRESH_INTERVAL);
  }

  /**
   * توقف auto-refresh
   */
  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
      console.log('⏸️ Auto-refresh stopped');
    }
  }

  /**
   * مدیریت visibility change
   */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('👁️ Page hidden, stopping auto-refresh');
      stopAutoRefresh();
    } else {
      console.log('👁️ Page visible, starting auto-refresh');
      startAutoRefresh();
      // رفرش فوری
      loadPriceTicker().catch(err => console.warn('Refresh failed:', err));
    }
  });

  /**
   * Cleanup on page unload
   */
  window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
  });

  // Export به global scope
  global.MarketIntegration = {
    loadAllMarketData,
    loadPrimaryChart,
    loadPriceTicker,
    loadOrderBook,
    startAutoRefresh,
    stopAutoRefresh,
    updatePriceUI,
    updateTickerUI
  };

  console.log('✅ Market Integration module loaded');

})(window);
