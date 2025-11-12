// public/static/modules/dashboard/dashboard-widgets-loader.js
// Task 3.3: Wire Main Dashboard to Adapters
// تاریخ: 2025-11-10
// هدف: اتصال ویجت‌های Phase C به داشبورد اصلی بدون تغییر معماری موجود

(function(global) {
  'use strict';

  // === Prefer Legacy Widgets (Green) over New Ones (Red) ===
  window.TitanFlags = window.TitanFlags || {};
  window.TitanFlags.preferLegacyWidgets = true;

  // انتخاب‌گرهای کانتینرهای قدیمی (legacy)
  const LEGACY_SELECTORS = {
    overview:  ['[data-widget="overview"]',  '#overview-widget',  '.widget-overview'],
    movers:    ['[data-widget="movers"]',    '#movers-widget',    '.widget-movers'],
    portfolio: ['[data-widget="portfolio"]', '#portfolio-widget', '.widget-portfolio'],
    monitor:   ['[data-widget="monitor"]',   '#monitor-widget',   '.widget-monitor'],
    chart:     ['[data-widget="chart"]',     '#chart-widget',     '.widget-chart'],
  };

  /**
   * پیدا کردن کانتینر قدیمی اگر وجود داشته باشد
   * @param {string} key - کلید ویجت (overview, movers, portfolio, monitor, chart)
   * @returns {HTMLElement|null}
   */
  function findLegacyContainer(key) {
    if (!window.TitanFlags.preferLegacyWidgets) return null;
    const selectors = LEGACY_SELECTORS[key] || [];
    for (const sel of selectors) {
      const n = document.querySelector(sel);
      if (n) {
        console.log(`✅ [Legacy Container] Found legacy container for ${key}: ${sel}`);
        return n;
      }
    }
    console.log(`ℹ️ [Legacy Container] No legacy container found for ${key}`);
    return null;
  }

  /**
   * دریافت یا ایجاد کانتینر
   * اگر preferLegacyWidgets فعال باشد، ابتدا legacy را جستجو می‌کند
   * در غیر این صورت یک div fallback ایجاد می‌کند
   * 
   * @param {string} key - کلید ویجت
   * @param {string} fallbackClass - کلاس CSS برای fallback container
   * @returns {HTMLElement}
   */
  function getOrCreateContainer(key, fallbackClass) {
    const legacy = findLegacyContainer(key);
    if (legacy) return legacy;

    // اگر legacy پیدا نشد، یک fallback مخفی بساز
    const div = document.createElement('div');
    div.className = (fallbackClass || '') + ' legacy-fallback hidden';
    div.id = `fallback-${key}-widget`;
    console.log(`ℹ️ [Fallback Container] Created fallback container for ${key} (hidden)`);
    return div;
  }

  // تنظیمات
  const WIDGETS_CONFIG = {
    marketOverview: {
      id: 'market-overview-widget',
      title: 'نمای کلی بازار',
      icon: '📊',
      order: 1
    },
    marketMovers: {
      id: 'market-movers-widget',
      title: 'بازیگران بازار',
      icon: '🔥',
      order: 2
    },
    portfolio: {
      id: 'portfolio-widget',
      title: 'عملکرد پرتفوی',
      icon: '💼',
      order: 3
    },
    monitoring: {
      id: 'monitoring-widget',
      title: 'وضعیت سیستم',
      icon: '⚙️',
      order: 4
    }
  };

  /**
   * ایجاد ساختار HTML برای widget containerها
   * اگر legacy containers وجود داشته باشند، از آنها استفاده می‌شود
   * در غیر این صورت fallback containers ایجاد می‌شود (مخفی)
   */
  function createWidgetsSection() {
    const section = document.createElement('div');
    section.id = 'dashboard-widgets-section';
    section.className = 'widgets-section mt-6 mb-6';
    
    // چک کردن اینکه آیا legacy containers وجود دارند
    const hasLegacy = window.TitanFlags.preferLegacyWidgets && (
      findLegacyContainer('overview') ||
      findLegacyContainer('movers') ||
      findLegacyContainer('portfolio') ||
      findLegacyContainer('monitor')
    );

    if (hasLegacy) {
      // اگر legacy widgets موجود هستند، فقط یک section خالی برگردان
      console.log('ℹ️ [Widgets Section] Using existing legacy containers, not creating new ones');
      section.innerHTML = `
        <!-- Legacy Widgets در DOM موجود هستند، فقط به آنها سیم‌کشی می‌شود -->
        <div class="legacy-mode-indicator text-center text-xs text-gray-500 py-2">
          ✓ Legacy Mode: Using existing dashboard widgets
        </div>
      `;
      return section;
    }

    // اگر legacy نیست، fallback containers بساز (مخفی)
    console.log('⚠️ [Widgets Section] No legacy containers found, creating hidden fallbacks');
    section.innerHTML = `
      <!-- Fallback Widgets (Hidden) - فقط زمانی که legacy موجود نیست -->
      <div class="widgets-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Market Overview Widget -->
        <div class="widget-container bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 legacy-fallback hidden">
          <div id="market-overview-widget">
            <div class="widget-loading text-center py-8">
              <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p class="text-gray-400 mt-2">در حال بارگذاری...</p>
            </div>
          </div>
        </div>

        <!-- Market Movers Widget -->
        <div class="widget-container bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 legacy-fallback hidden">
          <div id="market-movers-widget">
            <div class="widget-loading text-center py-8">
              <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p class="text-gray-400 mt-2">در حال بارگذاری...</p>
            </div>
          </div>
        </div>

        <!-- Portfolio Widget -->
        <div class="widget-container bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 legacy-fallback hidden">
          <div id="portfolio-widget">
            <div class="widget-loading text-center py-8">
              <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p class="text-gray-400 mt-2">در حال بارگذاری...</p>
            </div>
          </div>
        </div>

        <!-- Monitoring Widget -->
        <div class="widget-container bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 legacy-fallback hidden">
          <div id="monitoring-widget">
            <div class="widget-loading text-center py-8">
              <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p class="text-gray-400 mt-2">در حال بارگذاری...</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return section;
  }

  /**
   * تزریق Widgets به داشبورد
   */
  function injectWidgets() {
    // پیدا کردن main-content
    let mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
      console.warn('⚠️ [Dashboard Widgets] main-content not found, will retry...');
      return false;
    }

    // بررسی اینکه آیا widgets قبلاً اضافه شده‌اند
    if (document.getElementById('dashboard-widgets-section')) {
      console.log('ℹ️ [Dashboard Widgets] Widgets already injected');
      return true;
    }

    // ایجاد و اضافه کردن widgets section
    const widgetsSection = createWidgetsSection();
    
    // اضافه کردن بعد از اولین child (معمولاً header/navigation)
    // یا در ابتدا اگر خالی است
    if (mainContent.firstChild) {
      mainContent.insertBefore(widgetsSection, mainContent.firstChild.nextSibling);
    } else {
      mainContent.appendChild(widgetsSection);
    }

    console.log('✅ [Dashboard Widgets] Widgets section injected');
    return true;
  }

  /**
   * بارگذاری widgets با استفاده از widgets-integration.js
   */
  function loadWidgets() {
    // بررسی منعطف آمادگی widgets-integration module
    const ready =
      window.__WidgetsIntegrationLoaded === true ||
      (window.TitanLegacyBind && typeof window.TitanLegacyBind.bindAllLegacy === 'function');

    if (!ready) {
      console.warn('⚠️ [Dashboard Widgets] widgets-integration.js not ready yet; retrying...');
      setTimeout(loadWidgets, 400);
      return;
    }

    // بارگذاری همه widgets
    console.log('🔄 [Dashboard Widgets] Loading all widgets...');
    
    try {
      // بارگذاری با تأخیر کوچک برای جلوگیری از race condition
      setTimeout(() => {
        if (typeof loadMarketOverview === 'function') loadMarketOverview();
      }, 100);
      
      setTimeout(() => {
        if (typeof loadMarketMovers === 'function') loadMarketMovers();
      }, 200);
      
      setTimeout(() => {
        if (typeof loadPortfolioWidget === 'function') loadPortfolioWidget();
      }, 300);
      
      setTimeout(() => {
        if (typeof loadMonitoringWidget === 'function') loadMonitoringWidget();
      }, 400);

      console.log('✅ [Dashboard Widgets] All widgets loading initiated');
    } catch (error) {
      console.error('❌ [Dashboard Widgets] Error loading widgets:', error);
    }
  }

  /**
   * Observer برای تشخیص زمان آماده شدن dashboard
   */
  function observeDashboardReady() {
    let retryCount = 0;
    const maxRetries = 20; // 10 ثانیه (20 × 500ms)

    const interval = setInterval(() => {
      retryCount++;

      // تلاش برای تزریق widgets
      const injected = injectWidgets();

      if (injected) {
        clearInterval(interval);
        // بارگذاری widgets
        loadWidgets();
        console.log('✅ [Dashboard Widgets] Initialization complete');
      } else if (retryCount >= maxRetries) {
        clearInterval(interval);
        console.warn('⚠️ [Dashboard Widgets] Max retries reached, dashboard may not be ready');
      }
    }, 500);
  }

  /**
   * راه‌اندازی اصلی
   */
  function init() {
    console.log('🚀 [Dashboard Widgets Loader] Initializing...');

    // بررسی وجود adapters
    const requiredAdapters = ['OverviewAdapter', 'MoversAdapter', 'PortfolioAdapter', 'MonitoringAdapter'];
    const missingAdapters = requiredAdapters.filter(name => typeof global[name] === 'undefined');

    if (missingAdapters.length > 0) {
      console.error(`❌ [Dashboard Widgets] Missing adapters: ${missingAdapters.join(', ')}`);
      return;
    }

    // شروع observer
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeDashboardReady);
    } else {
      observeDashboardReady();
    }

    // listener برای رویداد login
    document.addEventListener('user-logged-in', () => {
      console.log('🔄 [Dashboard Widgets] User logged in, reinitializing...');
      setTimeout(observeDashboardReady, 1000);
    });
  }

  // Export برای دسترسی خارجی
  global.DashboardWidgetsLoader = {
    init,
    injectWidgets,
    loadWidgets,
    findLegacyContainer,
    getOrCreateContainer
  };

  // راه‌اندازی خودکار
  init();

  console.log('✅ [Dashboard Widgets Loader] Module loaded');

})(window);
