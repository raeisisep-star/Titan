// public/static/modules/dashboard/services/adapters/monitoring.adapter.js
// آداپتر نظارت و سلامت سیستم - اتصال به /api/monitoring/status
// استفاده: MonitoringAdapter.getStatus(), MonitoringAdapter.getCircuitBreakerState()

(function (global) {
  const BASE = "/api/monitoring";

  /**
   * دریافت وضعیت کامل سیستم (سرور + سرویس‌ها)
   * @returns {Promise<{server: Object, services: Object, timestamp: number}>}
   * 
   * Response Schema:
   * {
   *   success: true,
   *   data: {
   *     server: {
   *       status: "operational",
   *       uptimeSeconds: 150,
   *       memoryUsageMB: 450,
   *       cpuUsagePercent: 25
   *     },
   *     services: {
   *       mexcApi: {
   *         status: "healthy",
   *         circuitBreaker: {
   *           state: "CLOSED",
   *           failureCount: 0,
   *           lastFailureTime: null
   *         },
   *         cache: {
   *           hitRate: 85,
   *           entries: 150
   *         }
   *       }
   *     },
   *     timestamp: 1762783338350
   *   }
   * }
   */
  async function getStatus() {
    try {
      const res = await TitanHTTP.get(`${BASE}/status`);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Failed to fetch monitoring status");
      }
      return res.data;
    } catch (error) {
      console.error("[MonitoringAdapter] Error:", error);
      throw error;
    }
  }

  /**
   * دریافت فقط وضعیت سرور
   * @returns {Promise<Object>}
   */
  async function getServerStatus() {
    try {
      const status = await getStatus();
      return status.server || {};
    } catch (error) {
      console.error("[MonitoringAdapter] Error fetching server status:", error);
      throw error;
    }
  }

  /**
   * دریافت وضعیت سرویس MEXC API
   * @returns {Promise<Object>}
   */
  async function getMexcApiStatus() {
    try {
      const status = await getStatus();
      return status.services?.mexcApi || {};
    } catch (error) {
      console.error("[MonitoringAdapter] Error fetching MEXC API status:", error);
      throw error;
    }
  }

  /**
   * دریافت وضعیت Circuit Breaker
   * @returns {Promise<string>} "CLOSED", "OPEN", یا "HALF_OPEN"
   */
  async function getCircuitBreakerState() {
    try {
      const mexcStatus = await getMexcApiStatus();
      return mexcStatus.circuitBreaker?.state || "UNKNOWN";
    } catch (error) {
      console.error("[MonitoringAdapter] Error fetching CB state:", error);
      throw error;
    }
  }

  /**
   * بررسی سلامت کلی سیستم
   * @returns {Promise<boolean>} true اگر همه سرویس‌ها سالم باشند
   */
  async function isHealthy() {
    try {
      const status = await getStatus();
      const serverOk = status.server?.status === "operational";
      const mexcOk = status.services?.mexcApi?.status === "healthy";
      const cbClosed = status.services?.mexcApi?.circuitBreaker?.state === "CLOSED";
      return serverOk && mexcOk && cbClosed;
    } catch (error) {
      console.error("[MonitoringAdapter] Error checking health:", error);
      return false;
    }
  }

  /**
   * دریافت آمار کش
   * @returns {Promise<Object>}
   */
  async function getCacheStats() {
    try {
      const mexcStatus = await getMexcApiStatus();
      return mexcStatus.cache || {};
    } catch (error) {
      console.error("[MonitoringAdapter] Error fetching cache stats:", error);
      throw error;
    }
  }

  /**
   * دریافت زمان کارکرد سرور (به ثانیه)
   * @returns {Promise<number>}
   */
  async function getUptime() {
    try {
      const serverStatus = await getServerStatus();
      return serverStatus.uptimeSeconds || 0;
    } catch (error) {
      console.error("[MonitoringAdapter] Error fetching uptime:", error);
      throw error;
    }
  }

  /**
   * تبدیل Circuit Breaker state به متن فارسی
   * @param {string} state - "CLOSED", "OPEN", "HALF_OPEN"
   * @returns {string}
   */
  function translateCBState(state) {
    const translations = {
      "CLOSED": "عملیاتی",
      "OPEN": "خارج از سرویس",
      "HALF_OPEN": "در حال بازیابی",
      "UNKNOWN": "نامشخص"
    };
    return translations[state] || state;
  }

  // Export public methods
  global.MonitoringAdapter = {
    getStatus,
    getServerStatus,
    getMexcApiStatus,
    getCircuitBreakerState,
    isHealthy,
    getCacheStats,
    getUptime,
    translateCBState
  };
})(window);
