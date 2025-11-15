// public/static/modules/dashboard/services/adapters/market.adapter.js
// آداپتر داده‌های بازار - اتصال به MEXC API بدون KYC
// استفاده: MarketAdapter.getPrice('BTCUSDT'), MarketAdapter.getHistory('ETHUSDT', '1h', 200)

(function (global) {
  const BASE = "/api/mexc";

  // نگاشت بازه‌های زمانی به فرمت MEXC
  const intervalMap = {
    "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
    "1h": "60m", "2h": "120m", "4h": "4h", "6h": "6h", "8h": "8h", "12h": "12h",
    "1d": "1d", "3d": "3d", "1M": "1M"
  };

  function mapInterval(i) {
    const key = String(i || "").trim();
    if (!intervalMap[key]) {
      throw new Error(`Invalid interval: ${i}. Valid values: ${Object.keys(intervalMap).join(', ')}`);
    }
    return intervalMap[key];
  }

  /**
   * دریافت قیمت لحظه‌ای یک نماد
   * @param {string} symbol - نماد (مثلاً BTCUSDT)
   * @returns {Promise<{symbol: string, price: number, timestamp: number}>}
   */
  async function getPrice(symbol) {
    const res = await TitanHTTP.get(`${BASE}/price/${symbol}`);
    return res?.data; // { symbol, price, timestamp }
  }

  /**
   * دریافت آمار 24 ساعته بازار
   * @param {string} symbol - نماد
   * @returns {Promise<{symbol, priceChange, priceChangePercent, high, low, volume, quoteVolume}>}
   */
  async function getTicker24h(symbol) {
    const res = await TitanHTTP.get(`${BASE}/ticker/${symbol}`);
    return res?.data; // 24h statistics
  }

  /**
   * دریافت تاریخچه کندل‌ها (OHLCV)
   * @param {string} symbol - نماد
   * @param {string} interval - بازه زمانی (1m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1M)
   * @param {number} limit - تعداد کندل (پیش‌فرض: 200، حداکثر: 1000)
   * @returns {Promise<Array<{openTime, open, high, low, close, volume, closeTime}>>}
   */
  async function getHistory(symbol, interval, limit = 200) {
    const mapped = mapInterval(interval || "1h");
    const res = await TitanHTTP.get(`${BASE}/history/${symbol}`, {
      params: { interval: mapped, limit }
    });
    // انتظار: { candles: [ { openTime, open, high, low, close, volume, closeTime } ] }
    return res?.data?.candles || [];
  }

  /**
   * دریافت عمق دفتر سفارش (Order Book)
   * @param {string} symbol - نماد
   * @param {number} limit - تعداد سطوح (پیش‌فرض: 50، حداکثر: 100)
   * @returns {Promise<{bids: Array, asks: Array, lastUpdateId: number}>}
   */
  async function getDepth(symbol, limit = 50) {
    const res = await TitanHTTP.get(`${BASE}/depth/${symbol}`, {
      params: { limit }
    });
    return res?.data; // { bids, asks, lastUpdateId }
  }

  global.MarketAdapter = {
    getPrice,
    getTicker24h,
    getHistory,
    getDepth
  };
})(window);
