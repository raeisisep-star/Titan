// public/static/modules/dashboard/legacy-annotator.js
// هدف: پیدا کردن ویجت‌های قدیمی بر اساس تیتر فارسی و تزریق data-* برای بایند شدن داده‌ها
(function (window, document) {
  'use strict';
  
  const T = (s) => (typeof s === 'string' ? s.trim() : '');

  // نرمال‌سازی متن فارسی: رفع اختلاف ی/ک عربی، فاصله‌ها، dash های مختلف
  function normalizeFA(str='') {
    return String(str)
      .replace(/[ي]/g,'ی').replace(/[ك]/g,'ک')  // ی و ک عربی → فارسی
      .replace(/[‌\-–—]/g,'-')                    // انواع dash و فاصله مجازی
      .replace(/\s+/g,' ')                        // فاصله‌های متعدد → یک فاصله
      .trim();
  }

  // تطبیق عنوان با لیست candidates با استفاده از includes
  function matchTitle(headingText, candidates) {
    const h = normalizeFA(headingText);
    return candidates.some(t => h.includes(normalizeFA(t)));
  }

  // عنوان‌های فارسی که روی کارت‌های قدیمی دیده می‌شود
  // به‌روزرسانی شده با تیترهای دقیق از داشبورد واقعی
  const TITLES = {
    // کارت Overview در UI شما با تیتر "ریپاب قیمت" یا "ریپاپ قیمت" دیده می‌شود
    overview:  ['ریپاب قیمت','ریپاپ قیمت','خلاصه بازار','Market Overview'],

    // اگر «بازیگران بازار» ندارید مهم نیست؛ Annotator نادیده می‌گیرد
    movers:    ['بازیگران بازار','Top Movers','گینرز/لوزرز'],

    // خلاصه سبد
    portfolio: ['خلاصه پرتفولیو','خلاصه پورتفویو','عملکرد پورتفولیو','نمودار پورتفولیو','Portfolio'],

    // سلامت سیستم
    monitor:   ['وضعیت سیستم','سلامت سیستم','System Status','Monitoring'],

    // نمودار
    chart:     ['نمودار عملکرد','نمودار پورتفولیو','Chart'],

    // اختیاری: کارت‌های دیگر که در داشبورد دیده می‌شوند
    // 'پیشنهادهای آرتیمیس'، 'خلاصه هشدارها'، 'پیشرفت یادگیری'، 'ربات قیمت'، 'معاملات فعال'
  };

  // کمک: یک المنت با سلکتور اگر نبود بساز
  function ensure(root, selector, makeHTML) {
    let el = root.querySelector(selector);
    if (!el) {
      const temp = document.createElement('div');
      temp.innerHTML = makeHTML();
      el = temp.firstElementChild || temp;
      el.setAttribute('data-autocreate', '1');
      root.appendChild(el);
      el = root.querySelector(selector);
    }
    return el;
  }

  // کمک: درج span اگر نبود
  function ensureSpan(root, field, fallbackHTML = '') {
    let el = root.querySelector(`[data-field="${field}"]`);
    if (!el) {
      const span = document.createElement('span');
      span.setAttribute('data-field', field);
      span.innerHTML = fallbackHTML;
      span.setAttribute('data-autocreate', '1');
      
      // پیش‌فرض: بالای کارت جایی برای «آخرین بروزرسانی»
      if (field === 'last-updated') {
        const header = root.querySelector('h3,h4,h2,.widget-header') || root;
        header.appendChild(document.createTextNode(' '));
        header.appendChild(span);
      } else {
        root.appendChild(span);
      }
      el = span;
    }
    return el;
  }

  // تلاش برای تشخیص یک کارت با عنوان (با نرمال‌سازی و includes)
  function findCardByTitles(titleList) {
    const headings = Array.from(document.querySelectorAll('h2,h3,h4,.widget-title,.card-title'));
    for (const h of headings) {
      const txt = T(h.textContent);
      // استفاده از matchTitle برای نرمال‌سازی و includes
      if (matchTitle(txt, titleList)) {
        // کارت والد را برگردان (container نزدیک)
        let p = h.closest('.card, .panel, .box, .widget, .grid, .shadow, .rounded, section, div[class*="container"]');
        if (!p) p = h.parentElement;
        console.log(`✅ [Legacy Annotator] Found card for "${titleList[0]}" via heading: "${txt}"`);
        return p;
      }
    }
    console.log(`⚠️ [Legacy Annotator] No card found for titles:`, titleList);
    return null;
  }

  function annotateOverview() {
    const host = findCardByTitles(TITLES.overview);
    if (!host) return null;
    host.setAttribute('data-widget', 'overview');

    ensureSpan(host, 'last-updated', '<small class="text-gray-400">—</small>');

    // فیلدهای قیمتی/حجمی
    ensureSpan(host, 'btc-price', '<span class="text-white">—</span>');
    ensureSpan(host, 'btc-change', '<span class="text-gray-400">—</span>');
    ensureSpan(host, 'eth-price', '<span class="text-white">—</span>');
    ensureSpan(host, 'eth-change', '<span class="text-gray-400">—</span>');
    ensureSpan(host, 'bnb-price', '<span class="text-white">—</span>');
    ensureSpan(host, 'bnb-change', '<span class="text-gray-400">—</span>');
    ensureSpan(host, 'total-volume', '<span class="text-white">—</span>');
    ensureSpan(host, 'avg-change', '<span class="text-white">—</span>');
    
    console.log('✅ [Legacy Annotator] Overview widget annotated');
    return host;
  }

  function annotateMovers() {
    const host = findCardByTitles(TITLES.movers);
    if (!host) return null;
    host.setAttribute('data-widget', 'movers');
    ensureSpan(host, 'last-updated', '<small class="text-gray-400">—</small>');

    // دو ستون برای گینرز/لوزرز اگر نبود
    ensure(host, '[data-field="gainers-list"]', () => '<div data-field="gainers-list" class="gainers"></div>');
    ensure(host, '[data-field="losers-list"]', () => '<div data-field="losers-list" class="losers"></div>');
    
    // فیلدهای top gainer/loser
    ensureSpan(host, 'top-gainer-symbol', '<span>—</span>');
    ensureSpan(host, 'top-gainer-change', '<span>—</span>');
    ensureSpan(host, 'top-loser-symbol', '<span>—</span>');
    ensureSpan(host, 'top-loser-change', '<span>—</span>');
    
    console.log('✅ [Legacy Annotator] Movers widget annotated');
    return host;
  }

  function annotatePortfolio() {
    const host = findCardByTitles(TITLES.portfolio);
    if (!host) return null;
    host.setAttribute('data-widget', 'portfolio');

    ensureSpan(host, 'last-updated', '<small class="text-gray-400">—</small>');
    ensureSpan(host, 'mode', '<span class="badge">—</span>');
    ensureSpan(host, 'total-equity', '<span class="text-white">—</span>');
    ensureSpan(host, 'unrealized-pnl', '<span class="text-white">—</span>');
    ensureSpan(host, 'available-balance', '<span class="text-white">—</span>');
    ensureSpan(host, 'positions-count', '<span>0</span>');
    
    // List container for positions
    ensure(host, '[data-field="positions-list"]', () => '<div data-field="positions-list" class="positions-list"></div>');
    
    console.log('✅ [Legacy Annotator] Portfolio widget annotated');
    return host;
  }

  function annotateMonitor() {
    const host = findCardByTitles(TITLES.monitor);
    if (!host) return null;
    host.setAttribute('data-widget', 'monitor');

    ensureSpan(host, 'last-updated', '<small class="text-gray-400">—</small>');
    ensureSpan(host, 'health-badge', '<span class="badge">—</span>');
    ensureSpan(host, 'server-status', '<span>—</span>');
    ensureSpan(host, 'circuit-breaker', '<span>—</span>');
    ensureSpan(host, 'uptime', '<span>—</span>');
    ensureSpan(host, 'cache-hit-rate', '<span>—</span>');
    
    console.log('✅ [Legacy Annotator] Monitor widget annotated');
    return host;
  }

  function annotateChart() {
    const host = findCardByTitles(TITLES.chart);
    if (!host) return null;
    host.setAttribute('data-widget', 'chart');
    // اگر بوم/ظرف برای چارت نبود بساز
    ensure(host, '[data-field="chart-canvas"]', () => '<div data-field="chart-canvas" style="min-height:300px;"></div>');
    
    console.log('✅ [Legacy Annotator] Chart widget annotated');
    return host;
  }

  function annotateAll() {
    console.log('🔍 [Legacy Annotator] Starting annotation scan...');
    
    const result = {
      overview: annotateOverview(),
      movers: annotateMovers(),
      portfolio: annotatePortfolio(),
      monitor: annotateMonitor(),
      chart: annotateChart(),
    };
    
    const found = Object.values(result).filter(Boolean).length;
    console.log(`✅ [Legacy Annotator] Annotation complete: ${found}/5 widgets found and annotated`);
    
    window.TitanLegacy = Object.assign(window.TitanLegacy || {}, {
      annotated: true,
      result,
      timestamp: Date.now(),
      scan: annotateAll  // برای تست دستی: window.TitanLegacy.scan()
    });
    
    return result;
  }

  // اجرا: وقتی داشبورد لود شد
  function onDashboardReady(cb) {
    const root = document.querySelector('#mainApp, #main-content, #app, body');
    if (!root) {
      console.warn('⚠️ [Legacy Annotator] Root element not found');
      return cb();
    }

    const observer = new MutationObserver(() => {
      // وقتی کارت‌ها ظاهر شدند
      if (document.querySelector('h3,h4,h2,.widget-title')) {
        observer.disconnect();
        cb();
      }
    });
    
    observer.observe(root, { childList: true, subtree: true });
    
    // fallback: اگر همین الان هست
    setTimeout(() => {
      if (document.querySelector('h3,h4,h2,.widget-title')) {
        observer.disconnect();
        cb();
      }
    }, 800);
  }

  // اجرای خودکار
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      onDashboardReady(() => {
        try {
          annotateAll();
        } catch (e) {
          console.error('❌ [Legacy Annotator] Error:', e);
        }
      });
    });
  } else {
    onDashboardReady(() => {
      try {
        annotateAll();
      } catch (e) {
        console.error('❌ [Legacy Annotator] Error:', e);
      }
    });
  }

  console.log('✅ [Legacy Annotator] Module loaded');

})(window, document);
