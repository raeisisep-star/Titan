// public/static/modules/dashboard/services/adapters/portfolio.adapter.js
// آداپتر عملکرد پورتفولیو - اتصال به /api/portfolio/performance
// استفاده: PortfolioAdapter.getPerformance(), PortfolioAdapter.getPositions()

(function (global) {
  const BASE = "/api/portfolio";

  /**
   * دریافت عملکرد کامل پورتفولیو (خلاصه + موقعیت‌ها)
   * @returns {Promise<{summary: Object, positions: Array, mode: string, timestamp: number}>}
   * 
   * Response Schema:
   * {
   *   success: true,
   *   data: {
   *     summary: {
   *       totalEquity: 10217.64,
   *       unrealizedPnl: 217.64,
   *       realizedPnl: 0,
   *       margin: 10000,
   *       availableBalance: 10217.64
   *     },
   *     positions: [
   *       {
   *         symbol: "BTCUSDT",
   *         side: "LONG",
   *         size: 0.05,
   *         entryPrice: 105000,
   *         currentPrice: 106245.89,
   *         unrealizedPnl: 62.29,
   *         leverage: 1
   *       },
   *       // ... more positions
   *     ],
   *     mode: "demo",
   *     timestamp: 1762783338350
   *   }
   * }
   */
  async function getPerformance() {
    try {
      const res = await TitanHTTP.get(`${BASE}/performance`);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Failed to fetch portfolio performance");
      }
      return res.data;
    } catch (error) {
      console.error("[PortfolioAdapter] Error:", error);
      throw error;
    }
  }

  /**
   * دریافت فقط خلاصه پورتفولیو (بدون موقعیت‌ها)
   * @returns {Promise<Object>}
   */
  async function getSummary() {
    try {
      const performance = await getPerformance();
      return performance.summary || {};
    } catch (error) {
      console.error("[PortfolioAdapter] Error fetching summary:", error);
      throw error;
    }
  }

  /**
   * دریافت فقط موقعیت‌های باز
   * @returns {Promise<Array>}
   */
  async function getPositions() {
    try {
      const performance = await getPerformance();
      return performance.positions || [];
    } catch (error) {
      console.error("[PortfolioAdapter] Error fetching positions:", error);
      throw error;
    }
  }

  /**
   * دریافت موقعیت یک نماد خاص
   * @param {string} symbol - نماد (مثلاً "BTCUSDT")
   * @returns {Promise<Object|null>}
   */
  async function getPositionBySymbol(symbol) {
    try {
      const positions = await getPositions();
      const position = positions.find(p => p.symbol === symbol);
      return position || null;
    } catch (error) {
      console.error(`[PortfolioAdapter] Error fetching position for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * محاسبه کل سود و زیان
   * @returns {Promise<number>}
   */
  async function getTotalPnL() {
    try {
      const summary = await getSummary();
      return (summary.unrealizedPnl || 0) + (summary.realizedPnl || 0);
    } catch (error) {
      console.error("[PortfolioAdapter] Error calculating total PnL:", error);
      throw error;
    }
  }

  /**
   * محاسبه درصد سود و زیان
   * @returns {Promise<number>} درصد (مثلاً 2.17 برای 2.17%)
   */
  async function getPnLPercentage() {
    try {
      const summary = await getSummary();
      if (!summary.margin || summary.margin === 0) return 0;
      const totalPnl = (summary.unrealizedPnl || 0) + (summary.realizedPnl || 0);
      return (totalPnl / summary.margin) * 100;
    } catch (error) {
      console.error("[PortfolioAdapter] Error calculating PnL%:", error);
      throw error;
    }
  }

  // Export public methods
  global.PortfolioAdapter = {
    getPerformance,
    getSummary,
    getPositions,
    getPositionBySymbol,
    getTotalPnL,
    getPnLPercentage
  };
})(window);
