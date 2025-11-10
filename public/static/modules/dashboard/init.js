// public/static/modules/dashboard/init.js
// Dashboard Initialization with Adapters (Phase B2)
// اتصال Dashboard به API واقعی بدون تغییر معماری UI

(function(global) {
  'use strict';

  // Helper: تضمین وجود element اصلی
  function ensureMainContent() {
    let el = document.getElementById('main-content');
    if (!el) {
      el = document.createElement('div');
      el.id = 'main-content';
      el.className = 'titan-main';
      document.body.appendChild(el);
      console.log('✅ Created main-content element');
    }
    return el;
  }

  // Helper: بارگذاری حالت معاملاتی از بک‌اند
  async function initTradingMode() {
    try {
      const mode = await ModeAdapter.getMode();
      global.TITAN_MODE = mode;
      console.log(`✅ Trading mode loaded: ${mode}`);
      
      // به‌روزرسانی Badge در UI
      const badge = document.querySelector('[data-mode-badge]');
      if (badge) {
        badge.textContent = mode.toUpperCase();
        badge.classList.toggle('is-live', mode === 'live');
        badge.classList.toggle('is-demo', mode === 'demo');
      }
      
      return mode;
    } catch (err) {
      console.warn('⚠️ Mode unavailable, defaulting to demo:', err.message);
      global.TITAN_MODE = 'demo';
      return 'demo';
    }
  }

  // Helper: نمایش خطای نرم بدون توقف UI
  function showSoftError(msg) {
    let box = document.querySelector('.titan-soft-error');
    if (!box) {
      box = document.createElement('div');
      box.className = 'titan-soft-error';
      box.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;background:#ef4444;color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
      box.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="soft-error__text"></span>
          <button class="soft-error__retry" style="background:#fff;color:#ef4444;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-weight:bold;">
            تلاش مجدد
          </button>
        </div>`;
      document.body.appendChild(box);
      
      box.querySelector('.soft-error__retry').addEventListener('click', () => {
        box.remove();
        loadRealMarketData();
      });
    }
    box.querySelector('.soft-error__text').textContent = msg;
  }

  // بارگذاری داده‌های واقعی بازار
  async function loadRealMarketData() {
    try {
      const symbol = global.TITAN_SYMBOL || 'BTCUSDT';
      
      // 1. قیمت لحظه‌ای
      const { price } = await MarketAdapter.getPrice(symbol);
      console.log(`✅ Real price loaded: ${symbol} = $${price}`);
      updatePriceUI(price);
      
      // 2. تاریخچه (برای چارت)
      const candles = await MarketAdapter.getHistory(symbol, '1h', 200);
      if (candles.length > 0) {
        console.log(`✅ Loaded ${candles.length} candles for ${symbol}`);
        // اگر تابع renderChart موجود باشد
        if (typeof renderChart === 'function') {
          renderChart(candles);
        }
      }
      
      // 3. دفتر سفارش
      const depth = await MarketAdapter.getDepth(symbol, 50);
      console.log(`✅ Order book loaded: ${depth.bids?.length || 0} bids, ${depth.asks?.length || 0} asks`);
      if (typeof renderOrderBook === 'function') {
        renderOrderBook(depth.bids, depth.asks);
      }
      
    } catch (err) {
      console.error('❌ Failed to load market data:', err);
      showSoftError('عدم دریافت داده از سرور بازار. دکمه «تلاش مجدد» را بزنید.');
    }
  }

  // به‌روزرسانی UI قیمت
  function updatePriceUI(price) {
    // شماره به فرمت USD
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
    
    // به‌روزرسانی المنت‌های UI
    const priceElements = document.querySelectorAll('[data-current-price]');
    priceElements.forEach(el => {
      el.textContent = formatted;
      el.classList.add('price-update-animation');
      setTimeout(() => el.classList.remove('price-update-animation'), 600);
    });
  }

  // Helper: تضمین بارگذاری TitanReady
  const TitanReady = (fn) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  };

  // 🚀 Main Initialization
  TitanReady(async () => {
    console.log('🎯 Dashboard initialization starting...');
    
    try {
      // 1. تضمین وجود main-content
      const root = ensureMainContent();
      
      // 2. بارگذاری حالت معاملاتی
      await initTradingMode();
      
      // 3. اگر ModuleLoader وجود دارد، آن را راه‌اندازی کن
      if (global.ModuleLoader && typeof global.ModuleLoader.init === 'function') {
        global.ModuleLoader.init(root);
        console.log('✅ ModuleLoader initialized');
      } else {
        // Retry برای Race Condition
        setTimeout(() => {
          if (global.ModuleLoader?.init) {
            global.ModuleLoader.init(root);
          }
        }, 100);
      }
      
      // 4. بارگذاری داده‌های بازار (اگر در صفحه داشبورد هستیم)
      if (window.location.pathname === '/dashboard' || document.getElementById('portfolioChart')) {
        setTimeout(() => loadRealMarketData(), 500);
      }
      
      console.log('✅ Dashboard initialization complete');
      
    } catch (err) {
      console.error('❌ Dashboard initialization failed:', err);
    }
  });

  // Export برای دسترسی خارجی
  global.TitanDashboard = {
    loadRealMarketData,
    initTradingMode,
    showSoftError
  };

})(window);
