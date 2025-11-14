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
  // VERSION F: Broadened titles + proper ordering to avoid conflicts
  const TITLES = {
    // PRIORITY: Most specific first to avoid conflicts
    
    // Portfolio - MUST be first to catch specific portfolio titles before generic "نمودار"
    portfolio: ['خلاصه پرتفولیو','خلاصه پورتفویو','عملکرد پورتفولیو','نمودار پورتفولیو','Portfolio Summary','Portfolio'],
    
    // Monitor - System health
    monitor:   ['وضعیت سیستم','سلامت سیستم','System Status','System Monitor','Monitoring'],
    
    // Chart - Performance chart (generic, so comes after portfolio)
    chart:     ['نمودار عملکرد','Performance Chart','نمودار','Chart'],
    
    // Overview - Market overview/prices
    overview:  ['بازار رمزارز','ریپاب قیمت','ریپاپ قیمت','خلاصه بازار','نمای کلی','نماي كلی','Market Overview','Overview','بازار','قیمت'],
    
    // Movers - Will be blocked by Safe Mode but annotator can try
    movers:    ['بازیگران بازار','Top Movers','بازیگران','گینرز/لوزرز','Gainers','Losers','Movers'],
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
  // VERSION F: Enhanced with Set tracking to prevent double-annotation
  function findCardByTitles(titleList, widgetType, processedCards = new Set()) {
    const headings = Array.from(document.querySelectorAll('h2,h3,h4,.widget-title,.card-title'));
    for (const h of headings) {
      const txt = T(h.textContent);
      // استفاده از matchTitle برای نرمال‌سازی و includes
      if (matchTitle(txt, titleList)) {
        // کارت والد را برگردان (container نزدیک)
        let p = h.closest('.card, .panel, .box, .widget, .grid, .shadow, .rounded, section, div[class*="container"]');
        if (!p) p = h.parentElement;
        if (!p) continue;
        
        // CRITICAL: Skip if this card was already processed in this scan
        if (processedCards.has(p)) {
          console.log(`⏭️ [Legacy Annotator] Skipping card "${txt}" - already processed in this scan`);
          continue;
        }
        
        // CRITICAL: Skip if this card is already annotated with a different widget type
        const existingType = p.getAttribute('data-widget');
        if (existingType && existingType !== widgetType) {
          console.log(`⏭️ [Legacy Annotator] Skipping card "${txt}" - already annotated as "${existingType}"`);
          continue;
        }
        
        console.log(`✅ [Legacy Annotator] Found card for "${titleList[0]}" via heading: "${txt}"`);
        return p;
      }
    }
    console.log(`⚠️ [Legacy Annotator] No card found for titles:`, titleList);
    return null;
  }

  function annotateOverview(processedCards) {
    const host = findCardByTitles(TITLES.overview, 'overview', processedCards);
    if (!host) return null;
    processedCards.add(host);
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

  function annotateMovers(processedCards) {
    const host = findCardByTitles(TITLES.movers, 'movers', processedCards);
    if (!host) return null;
    processedCards.add(host);
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

  function annotatePortfolio(processedCards) {
    const host = findCardByTitles(TITLES.portfolio, 'portfolio', processedCards);
    if (!host) return null;
    processedCards.add(host);
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

  function annotateMonitor(processedCards) {
    const host = findCardByTitles(TITLES.monitor, 'monitor', processedCards);
    if (!host) return null;
    processedCards.add(host);
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

  function annotateChart(processedCards) {
    const host = findCardByTitles(TITLES.chart, 'chart', processedCards);
    if (!host) return null;
    processedCards.add(host);
    host.setAttribute('data-widget', 'chart');
    // اگر بوم/ظرف برای چارت نبود بساز
    ensure(host, '[data-field="chart-canvas"]', () => '<div data-field="chart-canvas" style="min-height:300px;"></div>');
    
    console.log('✅ [Legacy Annotator] Chart widget annotated');
    return host;
  }

  function scan() {
    console.log('🔍 [Legacy Annotator] Starting annotation scan...');
    
    // VERSION F: Proper Set tracking to prevent double-annotation
    const processedCards = new Set();
    
    // CRITICAL: Process in priority order (most specific first)
    const result = {
      portfolio: annotatePortfolio(processedCards),  // Most specific first
      monitor: annotateMonitor(processedCards),
      chart: annotateChart(processedCards),          // Generic, so after portfolio
      overview: annotateOverview(processedCards),
      movers: annotateMovers(processedCards),        // Blocked by Safe Mode
    };
    
    const found = Object.values(result).filter(Boolean).length;
    console.log(`✅ [Legacy Annotator] Annotation complete: ${found}/5 widgets found and annotated`);
    console.log(`🔍 [Legacy Annotator] DOM check: ${document.querySelectorAll('[data-widget]').length} widgets in DOM`);
    console.log(`📦 [Legacy Annotator] Processed ${processedCards.size} unique cards`);
    
    // Log what was found
    const foundTypes = Object.entries(result)
      .filter(([_, host]) => host !== null)
      .map(([type]) => type);
    console.log(`📋 [Legacy Annotator] Found types:`, foundTypes.join(', '));
    
    return result;
  }

  // ---- Persistent Annotation Observer ----
  // این Observer دائماً DOM را رصد می‌کند و تا زمانی که ویجت‌ها
  // فاقد data-widget هستند، دوباره annotation را اجرا می‌کند
  let observerActive = false;
  let scanTimeout = null;
  let lastKnownCount = 0; // Track widget count to detect loss
  
  function startPersistentAnnotation() {
    if (observerActive) {
      console.log('⏭️ [Legacy Annotator] Persistent observer already active');
      return;
    }
    
    observerActive = true;
    console.log('👁️ [Legacy Annotator] Starting persistent annotation observer...');
    
    // Function to check and re-scan if needed
    function checkAndRescan() {
      clearTimeout(scanTimeout);
      scanTimeout = setTimeout(() => {
        // Count annotated widgets
        const annotatedCount = document.querySelectorAll('[data-widget]').length;
        
        // Count potential widget containers (cards with headings)
        const cards = document.querySelectorAll('.card');
        const potentialCount = cards.length;
        
        // Smart detection: rescan if:
        // 1. We have cards but ZERO widgets (complete loss)
        // 2. Widget count DECREASED from last known count (partial loss)
        // 3. We have more cards than widgets (some missing)
        const shouldRescan = 
          (potentialCount > 0 && annotatedCount === 0) ||                // Complete loss
          (lastKnownCount > 0 && annotatedCount < lastKnownCount) ||     // Partial loss
          (potentialCount > annotatedCount && annotatedCount < 3);       // Gap detected
        
        if (shouldRescan) {
          console.log(`🔄 [Legacy Annotator] Widget loss detected (had: ${lastKnownCount}, now: ${annotatedCount}/${potentialCount} cards), rescanning...`);
          const result = scan();
          window.TitanLegacy.result = result;
          window.TitanLegacy.timestamp = Date.now();
          
          // Verify the annotation stuck and update tracking
          const newCount = document.querySelectorAll('[data-widget]').length;
          console.log(`✅ [Legacy Annotator] After rescan: ${newCount} widgets in DOM`);
          lastKnownCount = newCount;
        } else if (annotatedCount > lastKnownCount) {
          // Widget count increased (good sign), update tracking
          lastKnownCount = annotatedCount;
          console.log(`📊 [Legacy Annotator] Widget count updated: ${annotatedCount}`);
        }
      }, 200); // Reduced debounce to 200ms for faster reaction
    }
    
    // Watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      // Only react to significant changes (added/removed nodes)
      const hasSignificantChange = mutations.some(m => 
        m.addedNodes.length > 0 || m.removedNodes.length > 0
      );
      
      if (hasSignificantChange) {
        checkAndRescan();
      }
    });
    
    // Observe the entire body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false // Don't watch attribute changes to avoid infinite loops
    });
    
    // Initial check
    checkAndRescan();
    
    console.log('✅ [Legacy Annotator] Persistent observer started');
  }
  
  // ---- Debug Helper: Inspect Widget Titles ----
  function inspectWidgets() {
    console.log('🔍 [Legacy Annotator] Inspecting dashboard widgets...');
    const cards = document.querySelectorAll('.card');
    console.log(`📦 Total cards found: ${cards.length}`);
    
    cards.forEach((card, idx) => {
      const headings = card.querySelectorAll('h2, h3, h4, .widget-title, .card-title');
      const hasDataWidget = card.hasAttribute('data-widget');
      const widgetType = card.getAttribute('data-widget');
      
      console.log(`\n📄 Card ${idx + 1}:`);
      console.log(`   Annotated: ${hasDataWidget ? '✅ ' + widgetType : '❌ NO'}`);
      
      if (headings.length > 0) {
        headings.forEach((h, hidx) => {
          const text = h.textContent?.trim();
          const norm = normalizeFA(text);
          console.log(`   Heading ${hidx + 1}: "${text}"`);
          console.log(`   Normalized: "${norm}"`);
        });
      } else {
        console.log(`   ⚠️ No headings found`);
      }
    });
    
    const annotated = document.querySelectorAll('[data-widget]');
    console.log(`\n✅ Total annotated: ${annotated.length}`);
    annotated.forEach(w => {
      console.log(`   - ${w.getAttribute('data-widget')}`);
    });
    
    return {
      totalCards: cards.length,
      annotatedWidgets: annotated.length,
      widgets: Array.from(annotated).map(w => w.getAttribute('data-widget'))
    };
  }
  
  // ---- Expose Annotator globally ----
  window.TitanLegacy = Object.assign(window.TitanLegacy || {}, {
    scan,
    normalizeFA,
    matchTitle,
    startPersistentAnnotation,
    inspectWidgets, // NEW: Debug helper to view all card titles
    annotated: false,  // will be set to true after first scan
    result: null,
    timestamp: null
  });

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

  // اجرای خودکار با استفاده از scan() + persistent observer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      onDashboardReady(() => {
        try {
          const result = scan();
          window.TitanLegacy.annotated = true;
          window.TitanLegacy.result = result;
          window.TitanLegacy.timestamp = Date.now();
          console.log('✅ [Legacy Annotator] First scan completed on DOMContentLoaded');
          
          // Start persistent observer to survive SPA re-renders
          setTimeout(() => startPersistentAnnotation(), 500);
        } catch (e) {
          console.error('❌ [Legacy Annotator] Error:', e);
        }
      });
    });
  } else {
    onDashboardReady(() => {
      try {
        const result = scan();
        window.TitanLegacy.annotated = true;
        window.TitanLegacy.result = result;
        window.TitanLegacy.timestamp = Date.now();
        console.log('✅ [Legacy Annotator] First scan completed immediately');
        
        // Start persistent observer to survive SPA re-renders
        setTimeout(() => startPersistentAnnotation(), 500);
      } catch (e) {
        console.error('❌ [Legacy Annotator] Error:', e);
      }
    });
  }

  console.log('✅ [Legacy Annotator] Module loaded');

})(window, document);
