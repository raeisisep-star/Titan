// public/static/modules/dashboard/widgets-integration-loader.js
// Fallback loader برای تضمین بارگذاری widgets-integration.js
// اگر race condition رخ داد، این loader خودکار اسکریپت را بارگذاری می‌کند

(function() {
  'use strict';
  
  // چک کردن آماده بودن widgets-integration
  function checkIntegrationReady() {
    return window.__WidgetsIntegrationLoaded === true ||
           (window.TitanLegacyBind && typeof window.TitanLegacyBind.bindAllLegacy === 'function');
  }
  
  // اگر آماده است، فقط event را dispatch کن
  if (checkIntegrationReady()) {
    console.log('✅ [Widgets Loader] Integration already loaded');
    window.dispatchEvent(new Event('titan:widgets-ready'));
    return;
  }
  
  // اگر آماده نیست، منتظر بمان یا بارگذاری کن
  let retryCount = 0;
  const maxRetries = 10; // 5 seconds (10 × 500ms)
  
  const checkInterval = setInterval(() => {
    retryCount++;
    
    if (checkIntegrationReady()) {
      clearInterval(checkInterval);
      console.log('✅ [Widgets Loader] Integration loaded successfully');
      window.dispatchEvent(new Event('titan:widgets-ready'));
      return;
    }
    
    if (retryCount >= maxRetries) {
      clearInterval(checkInterval);
      console.warn('⚠️ [Widgets Loader] Max retries reached, attempting dynamic load...');
      
      // تلاش برای بارگذاری دینامیک با CSP nonce و cache busting
      const script = document.createElement('script');
      
      // Cache busting
      const cacheParam = window.__BUILD_ID__ || Date.now();
      script.src = `/static/modules/dashboard/widgets-integration.js?v=${cacheParam}`;
      script.async = false;
      
      // CSP nonce support
      const metaNonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');
      if (metaNonce) {
        script.nonce = metaNonce;
        console.log('🔒 [Widgets Loader] CSP nonce applied');
      }
      
      script.onload = () => {
        console.log('✅ [Widgets Loader] Dynamic load successful');
        if (!window.__TitanWidgetsReadyFired) {
          window.__TitanWidgetsReadyFired = true;
          const ev = new Event('titan:widgets-ready');
          try { document.dispatchEvent(ev); } catch {}
          try { window.dispatchEvent(ev); } catch {}
        }
      };
      
      script.onerror = () => {
        console.error('❌ [Widgets Loader] Failed to dynamically load widgets-integration.js');
      };
      
      document.head.appendChild(script);
    }
  }, 500);
  
  console.log('🔄 [Widgets Loader] Waiting for widgets-integration.js...');
  
  // Auto-bind when ready event fires (with anti-double-bind guard)
  function tryBindAll() {
    console.log('🔄 [Widgets Loader] Ready event received, attempting auto-bind...');
    
    // Guard: جلوگیری از Bind بی‌پایان
    if (window.__TitanBindOnce) {
      console.log('⏭️ [Widgets Loader] Bind already in progress, skipping...');
      return;
    }
    window.__TitanBindOnce = true;
    setTimeout(() => { window.__TitanBindOnce = false; }, 1500);
    
    // Run annotation scan
    if (window.TitanLegacy?.scan) {
      try {
        window.TitanLegacy.scan();
        console.log('✅ [Widgets Loader] Auto-scan completed');
      } catch(e) {
        console.warn('⚠️ [Widgets Loader] Auto-scan failed:', e);
      }
    }
    
    // Run data binding
    if (window.TitanLegacyBind?.bindAllLegacy) {
      window.TitanLegacyBind.bindAllLegacy()
        .then(() => console.log('✅ [Widgets Loader] Auto-bind completed'))
        .catch(e => console.warn('⚠️ [Widgets Loader] Auto-bind failed:', e));
    }
  }
  
  // Listen on both document and window (with once:true to prevent double-fire)
  document.addEventListener('titan:widgets-ready', tryBindAll, { once: true });
  window.addEventListener('titan:widgets-ready', tryBindAll, { once: true });
  
  console.log('✅ [Widgets Loader] Auto-bind listeners registered');
  
  // 🔄 Improvement 1: MutationObserver for SPA route changes (debounced)
  (function setupWidgetObserver(){
    let t;
    const debouncedBind = ()=> {
      clearTimeout(t);
      t = setTimeout(() => {
        if (window.TitanLegacy?.scan) window.TitanLegacy.scan();
        if (window.TitanLegacyBind?.bindAllLegacy) window.TitanLegacyBind.bindAllLegacy().catch(console.error);
      }, 250);
    };
    const mo = new MutationObserver(debouncedBind);
    mo.observe(document.body, { childList: true, subtree: true });
    // first kick
    debouncedBind();
    console.log('✅ [Widgets Loader] MutationObserver active for SPA route changes');
  })();
})();
