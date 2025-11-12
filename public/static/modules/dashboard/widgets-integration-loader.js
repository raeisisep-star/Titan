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
      
      // تلاش برای بارگذاری دینامیک
      const script = document.createElement('script');
      script.src = '/static/modules/dashboard/widgets-integration.js';
      script.async = false;
      
      script.onload = () => {
        console.log('✅ [Widgets Loader] Dynamic load successful');
        window.dispatchEvent(new Event('titan:widgets-ready'));
      };
      
      script.onerror = () => {
        console.error('❌ [Widgets Loader] Failed to dynamically load widgets-integration.js');
      };
      
      document.head.appendChild(script);
    }
  }, 500);
  
  console.log('🔄 [Widgets Loader] Waiting for widgets-integration.js...');
})();
