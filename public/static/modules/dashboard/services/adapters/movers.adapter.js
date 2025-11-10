// public/static/modules/dashboard/services/adapters/movers.adapter.js
// آداپتر بازیگران بازار - اتصال به /api/market/movers
// استفاده: MoversAdapter.getMovers(5), MoversAdapter.getGainers(10)

(function (global) {
  const BASE = "/api/market";

  /**
   * دریافت بازیگران بازار (برترین سودآورها و ضررزاها)
   * @param {number} limit - تعداد نتایج (پیش‌فرض: 10، حداکثر: 20)
   * @returns {Promise<{gainers: Array, losers: Array, mode: string, timestamp: number}>}
   * 
   * Response Schema:
   * {
   *   success: true,
   *   data: {
   *     gainers: [
   *       {
   *         symbol: "UNIUSDT",
   *         price: 12.34,
   *         change24h: 8.5,
   *         volume24h: 5678901.23
   *       },
   *       // ... more gainers
   *     ],
   *     losers: [
   *       {
   *         symbol: "ATOMUSDT",
   *         price: 12.34,
   *         change24h: -3.2,
   *         volume24h: 876543.21
   *       },
   *       // ... more losers
   *     ],
   *     mode: "demo",
   *     timestamp: 1762783338350
   *   }
   * }
   */
  async function getMovers(limit = 10) {
    try {
      const res = await TitanHTTP.get(`${BASE}/movers`, {
        params: { limit: Math.min(limit, 20) }
      });
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Failed to fetch market movers");
      }
      return res.data;
    } catch (error) {
      console.error("[MoversAdapter] Error:", error);
      throw error;
    }
  }

  /**
   * دریافت فقط برترین سودآورها
   * @param {number} limit - تعداد نتایج
   * @returns {Promise<Array>}
   */
  async function getGainers(limit = 10) {
    try {
      const movers = await getMovers(limit);
      return movers.gainers || [];
    } catch (error) {
      console.error("[MoversAdapter] Error fetching gainers:", error);
      throw error;
    }
  }

  /**
   * دریافت فقط بیشترین ضررزاها
   * @param {number} limit - تعداد نتایج
   * @returns {Promise<Array>}
   */
  async function getLosers(limit = 10) {
    try {
      const movers = await getMovers(limit);
      return movers.losers || [];
    } catch (error) {
      console.error("[MoversAdapter] Error fetching losers:", error);
      throw error;
    }
  }

  /**
   * دریافت برترین سودآور
   * @returns {Promise<Object|null>}
   */
  async function getTopGainer() {
    try {
      const gainers = await getGainers(1);
      return gainers[0] || null;
    } catch (error) {
      console.error("[MoversAdapter] Error fetching top gainer:", error);
      throw error;
    }
  }

  /**
   * دریافت بیشترین ضررزا
   * @returns {Promise<Object|null>}
   */
  async function getTopLoser() {
    try {
      const losers = await getLosers(1);
      return losers[0] || null;
    } catch (error) {
      console.error("[MoversAdapter] Error fetching top loser:", error);
      throw error;
    }
  }

  // Export public methods
  global.MoversAdapter = {
    getMovers,
    getGainers,
    getLosers,
    getTopGainer,
    getTopLoser
  };
})(window);
