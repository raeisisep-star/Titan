// public/static/modules/dashboard/services/adapters/movers.adapter.js
// آداپتر بازیگران بازار - اتصال به /api/market/movers
// استفاده: MoversAdapter.getMovers(5), MoversAdapter.getGainers(10)
// Fixed: Returns unified {gainers: [], losers: []} structure

(function (global) {
  const BASE = "/api/market";

  /**
   * Helper: Fetch a specific type (gainers or losers)
   * @param {string} type - 'gainers' or 'losers'
   * @param {number} limit - Number of items to fetch
   * @returns {Promise<Array>}
   */
  async function fetchType(type, limit) {
    try {
      const res = await TitanHTTP.get(`${BASE}/movers`, {
        params: { type, limit: Math.min(limit || 5, 20) }
      });
      
      if (!res?.success || !res?.data) {
        console.warn(`[MoversAdapter] Failed to fetch ${type}:`, res?.message);
        return [];
      }
      
      return Array.isArray(res.data.items) ? res.data.items : [];
    } catch (error) {
      console.error(`[MoversAdapter] Error fetching ${type}:`, error);
      return [];
    }
  }

  /**
   * دریافت بازیگران بازار (برترین سودآورها و ضررزاها)
   * @param {number} limit - تعداد نتایج (پیش‌فرض: 5، حداکثر: 20)
   * @returns {Promise<{gainers: Array, losers: Array, timestamp: number}>}
   * 
   * Response Schema:
   * {
   *   gainers: [
   *     {
   *       symbol: "UNIUSDT",
   *       price: 12.34,
   *       change24h: 8.5,
   *       volume24h: 5678901.23,
   *       high24h: 13.00,
   *       low24h: 11.50
   *     },
   *     // ... more gainers
   *   ],
   *   losers: [
   *     {
   *       symbol: "ATOMUSDT",
   *       price: 12.34,
   *       change24h: -3.2,
   *       volume24h: 876543.21,
   *       high24h: 12.80,
   *       low24h: 11.90
   *     },
   *     // ... more losers
   *   ],
   *   timestamp: 1762783338350
   * }
   */
  async function getMovers(limit = 5) {
    try {
      // Fetch both gainers and losers in parallel
      const [gainers, losers] = await Promise.all([
        fetchType('gainers', limit),
        fetchType('losers', limit)
      ]);

      return {
        gainers,
        losers,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("[MoversAdapter] Error in getMovers:", error);
      // Return empty structure on error
      return {
        gainers: [],
        losers: [],
        timestamp: Date.now()
      };
    }
  }

  /**
   * دریافت فقط برترین سودآورها
   * @param {number} limit - تعداد نتایج
   * @returns {Promise<Array>}
   */
  async function getGainers(limit = 10) {
    return fetchType('gainers', limit);
  }

  /**
   * دریافت فقط بیشترین ضررزاها
   * @param {number} limit - تعداد نتایج
   * @returns {Promise<Array>}
   */
  async function getLosers(limit = 10) {
    return fetchType('losers', limit);
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
      return null;
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
      return null;
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

  console.log('✅ [MoversAdapter] Market movers adapter loaded (unified structure)');
})(window);
