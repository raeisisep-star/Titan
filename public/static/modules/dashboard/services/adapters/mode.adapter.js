// public/static/modules/dashboard/services/adapters/mode.adapter.js
// آداپتر مدیریت حالت معاملاتی (demo/live)
// منبع حقیقت: بک‌اند (/api/mode)
// استفاده: ModeAdapter.getMode(), ModeAdapter.setMode('live')

(function (global) {
  const MODE_URL = "/api/mode";

  /**
   * دریافت حالت فعلی معاملاتی از بک‌اند
   * @returns {Promise<string>} - "demo" یا "live"
   */
  async function getMode() {
    try {
      const res = await TitanHTTP.get(MODE_URL);
      // انتظار: { success: true, mode: "demo" | "live", timestamp }
      return (res && res.mode) || "demo";
    } catch (err) {
      console.warn('Failed to fetch trading mode, defaulting to demo:', err.message);
      return "demo";
    }
  }

  /**
   * تغییر حالت معاملاتی
   * @param {string} nextMode - "demo" یا "live"
   * @returns {Promise<string>} - حالت جدید تایید شده از سرور
   */
  async function setMode(nextMode) {
    if (!['demo', 'live'].includes(nextMode)) {
      throw new Error(`Invalid mode: ${nextMode}. Must be "demo" or "live"`);
    }

    try {
      const res = await TitanHTTP.put(MODE_URL, { mode: nextMode });
      // انتظار: { success: true, mode: "demo" | "live", previousMode, timestamp }
      const confirmedMode = (res && res.mode) || "demo";
      
      // به‌روزرسانی متغیر سراسری
      if (global.TITAN_MODE !== confirmedMode) {
        global.TITAN_MODE = confirmedMode;
        console.log(`🔄 Trading mode changed to: ${confirmedMode}`);
        
        // بروزرسانی badge در UI
        updateModeBadge(confirmedMode);
      }
      
      return confirmedMode;
    } catch (err) {
      console.error('Failed to set trading mode:', err.message);
      throw err;
    }
  }

  /**
   * به‌روزرسانی نشان حالت در رابط کاربری
   * @private
   */
  function updateModeBadge(mode) {
    const badge = document.querySelector('[data-mode-badge]');
    if (badge) {
      badge.textContent = mode.toUpperCase();
      badge.classList.toggle('is-live', mode === 'live');
      badge.classList.toggle('is-demo', mode === 'demo');
    }
  }

  global.ModeAdapter = {
    getMode,
    setMode
  };
})(window);
