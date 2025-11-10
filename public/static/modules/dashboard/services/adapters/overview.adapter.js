// public/static/modules/dashboard/services/adapters/overview.adapter.js
// آداپتر نمای کلی بازار - اتصال به /api/market/overview
// استفاده: OverviewAdapter.getMarketOverview()

(function (global) {
  const BASE = "/api/market";

  /**
   * دریافت نمای کلی بازار (BTC, ETH, BNB + آمار کلی)
   * @returns {Promise<{symbols: Array, market: Object, timestamp: number}>}
   * 
   * Response Schema:
   * {
   *   success: true,
   *   data: {
   *     timestamp: 1762783338350,
   *     symbols: [
   *       {
   *         symbol: "BTCUSDT",
   *         price: 106245.89,
   *         change24h: 0.013,
   *         volume24h: 45678.23,
   *         high24h: 106500.00,
   *         low24h: 105800.00
   *       },
   *       // ... ETH, BNB
   *     ],
   *     market: {
   *       provider: "MEXC",
   *       totalVolume24h: 203702.9,
   *       avgChange24h: 0.032,
   *       symbolCount: 3
   *     }
   *   }
   * }
   */
  async function getMarketOverview() {
    try {
      const res = await TitanHTTP.get(`${BASE}/overview`);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Failed to fetch market overview");
      }
      return res.data;
    } catch (error) {
      console.error("[OverviewAdapter] Error:", error);
      throw error;
    }
  }

  /**
   * دریافت داده‌های یک نماد خاص از نمای کلی
   * @param {string} symbol - نماد (مثلاً "BTCUSDT")
   * @returns {Promise<Object>} داده‌های نماد یا null
   */
  async function getSymbolData(symbol) {
    try {
      const overview = await getMarketOverview();
      const symbolData = overview.symbols.find(s => s.symbol === symbol);
      return symbolData || null;
    } catch (error) {
      console.error(`[OverviewAdapter] Error fetching ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * دریافت آمار کلی بازار (بدون داده‌های نمادها)
   * @returns {Promise<Object>} market metadata
   */
  async function getMarketStats() {
    try {
      const overview = await getMarketOverview();
      return overview.market;
    } catch (error) {
      console.error("[OverviewAdapter] Error fetching market stats:", error);
      throw error;
    }
  }

  // Export public methods
  global.OverviewAdapter = {
    getMarketOverview,
    getSymbolData,
    getMarketStats
  };
})(window);
