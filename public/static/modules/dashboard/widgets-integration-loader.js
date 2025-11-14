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
    
    // Set guard flag (use a unique timestamp to track state)
    window.__TitanBindOnce = Date.now();
    console.log(`🔒 [Widgets Loader] Bind guard set: ${window.__TitanBindOnce}`);
    
    // Clear guard after 2 seconds
    setTimeout(() => {
      const oldValue = window.__TitanBindOnce;
      window.__TitanBindOnce = false;
      console.log(`🔓 [Widgets Loader] Bind guard cleared (was: ${oldValue})`);
    }, 2000);
    
    // Run annotation scan
    if (window.TitanLegacy?.scan) {
      try {
        const result = window.TitanLegacy.scan();
        window.TitanLegacy.annotated = true;
        window.TitanLegacy.result = result;
        window.TitanLegacy.timestamp = Date.now();
        console.log('✅ [Widgets Loader] Auto-scan completed');
      } catch(e) {
        console.warn('⚠️ [Widgets Loader] Auto-scan failed:', e);
      }
    } else {
      console.warn('⚠️ [Widgets Loader] window.TitanLegacy.scan not available');
    }
    
    // Run data binding (with delay to let annotation settle)
    setTimeout(() => {
      if (window.TitanLegacyBind?.bindAllLegacy) {
        window.TitanLegacyBind.bindAllLegacy()
          .then(() => {
            console.log('✅ [Widgets Loader] Auto-bind completed');
            // Verify widgets are bound
            const boundCount = document.querySelectorAll('[data-widget]').length;
            console.log(`✅ [Widgets Loader] ${boundCount} widgets currently in DOM`);
          })
          .catch(e => console.warn('⚠️ [Widgets Loader] Auto-bind failed:', e));
      } else {
        console.warn('⚠️ [Widgets Loader] window.TitanLegacyBind.bindAllLegacy not available');
      }
    }, 100);
  }
  
  // Listen on both document and window (with once:true to prevent double-fire)
  document.addEventListener('titan:widgets-ready', tryBindAll, { once: true });
  window.addEventListener('titan:widgets-ready', tryBindAll, { once: true });
  
  console.log('✅ [Widgets Loader] Auto-bind listeners registered');
  
  // 🔄 Improvement 1: MutationObserver for SPA route changes (debounced)
  // Now with smarter detection and coordination with persistent annotator
  (function setupWidgetObserver(){
    let t;
    const debouncedBind = ()=> {
      clearTimeout(t);
      t = setTimeout(() => {
        // Only trigger if we have headings but no widgets
        const headings = document.querySelectorAll('h2,h3,h4,.widget-title,.card-title').length;
        const widgets = document.querySelectorAll('[data-widget]').length;
        
        if (headings > 0 && widgets === 0) {
          console.log(`[Widgets Loader] DOM changed (${headings} headings, ${widgets} widgets), re-attempting auto-bind...`);
          tryBindAll();
        } else if (widgets > 0) {
          console.log(`[Widgets Loader] DOM stable: ${widgets} widgets already bound`);
        }
      }, 400); // Slightly longer debounce to let SPA render complete
    };
    const mo = new MutationObserver(debouncedBind);
    mo.observe(document.body, { childList: true, subtree: true });
    // first kick
    debouncedBind();
    console.log('✅ [Widgets Loader] MutationObserver active for SPA route changes');
  })();
})();
