// public/static/modules/dashboard/services/adapters/chart.adapter.js
// آداپتر داده‌های نمودار - اتصال به /api/chart/data/:symbol/:timeframe
// استفاده: ChartAdapter.getChartData('BTCUSDT', '1h', 500)

(function (global) {
  const BASE = "/api/chart/data";

  // نگاشت بازه‌های زمانی معتبر
  const VALID_TIMEFRAMES = [
    '1m', '5m', '15m', '30m',
    '1h', '2h', '4h', '6h', '8h', '12h',
    '1d', '3d', '1w', '1M'
  ];

  /**
   * دریافت داده‌های نمودار (OHLCV candles)
   * @param {string} symbol - نماد (مثلاً "BTCUSDT")
   * @param {string} timeframe - بازه زمانی (1m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)
   * @param {number} limit - تعداد کندل‌ها (پیش‌فرض: 500، حداکثر: 1000)
   * @returns {Promise<{symbol, timeframe, mexcInterval, candleCount, candles, timestamp}>}
   * 
   * Response Schema:
   * {
   *   success: true,
   *   data: {
   *     symbol: "BTCUSDT",
   *     timeframe: "1h",
   *     mexcInterval: "60m",
   *     candleCount: 500,
   *     candles: [
   *       {
   *         time: 1762780800000,
   *         open: 106100.0,
   *         high: 106300.0,
   *         low: 105900.0,
   *         close: 106245.89,
   *         volume: 1234.56
   *       },
   *       // ... more candles
   *     ],
   *     timestamp: 1762783338350
   *   }
   * }
   */
  async function getChartData(symbol, timeframe = '1h', limit = 500) {
    try {
      // Validate timeframe
      if (!VALID_TIMEFRAMES.includes(timeframe)) {
        throw new Error(`Invalid timeframe: ${timeframe}. Valid: ${VALID_TIMEFRAMES.join(', ')}`);
      }

      // Validate limit
      const safeLimit = Math.min(Math.max(1, parseInt(limit)), 1000);

      const res = await TitanHTTP.get(`${BASE}/${symbol.toUpperCase()}/${timeframe}`, {
        params: { limit: safeLimit }
      });

      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Failed to fetch chart data");
      }

      return res.data;
    } catch (error) {
      console.error("[ChartAdapter] Error:", error);
      throw error;
    }
  }

  /**
   * دریافت فقط کندل‌ها (بدون metadata)
   * @param {string} symbol - نماد
   * @param {string} timeframe - بازه زمانی
   * @param {number} limit - تعداد کندل
   * @returns {Promise<Array>}
   */
  async function getCandles(symbol, timeframe = '1h', limit = 500) {
    try {
      const chartData = await getChartData(symbol, timeframe, limit);
      return chartData.candles || [];
    } catch (error) {
      console.error("[ChartAdapter] Error fetching candles:", error);
      throw error;
    }
  }

  /**
   * دریافت آخرین کندل
   * @param {string} symbol - نماد
   * @param {string} timeframe - بازه زمانی
   * @returns {Promise<Object|null>}
   */
  async function getLatestCandle(symbol, timeframe = '1h') {
    try {
      const candles = await getCandles(symbol, timeframe, 1);
      return candles[0] || null;
    } catch (error) {
      console.error("[ChartAdapter] Error fetching latest candle:", error);
      throw error;
    }
  }

  /**
   * تبدیل داده‌های کندل به فرمت TradingView
   * @param {Array} candles - آرایه کندل‌ها از ChartAdapter
   * @returns {Array} فرمت TradingView: [{time, open, high, low, close, volume}]
   */
  function toTradingViewFormat(candles) {
    if (!Array.isArray(candles)) return [];
    
    return candles.map(c => ({
      time: Math.floor(c.time / 1000), // TradingView needs seconds, not ms
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume)
    }));
  }

  /**
   * تبدیل داده‌های کندل به فرمت Chart.js
   * @param {Array} candles - آرایه کندل‌ها از ChartAdapter
   * @returns {Object} فرمت Chart.js: {labels, datasets}
   */
  function toChartJsFormat(candles) {
    if (!Array.isArray(candles)) return { labels: [], datasets: [] };

    const labels = candles.map(c => new Date(c.time).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    }));

    const prices = candles.map(c => parseFloat(c.close));
    const volumes = candles.map(c => parseFloat(c.volume));

    return {
      labels,
      datasets: [
        {
          label: 'قیمت',
          data: prices,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'حجم',
          data: volumes,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'volume'
        }
      ]
    };
  }

  /**
   * محاسبه تغییر قیمت از اولین تا آخرین کندل
   * @param {Array} candles - آرایه کندل‌ها
   * @returns {Object} {change, changePercent}
   */
  function calculatePriceChange(candles) {
    if (!Array.isArray(candles) || candles.length < 2) {
      return { change: 0, changePercent: 0 };
    }

    const firstCandle = candles[candles.length - 1]; // oldest
    const lastCandle = candles[0]; // newest

    const firstPrice = parseFloat(firstCandle.open);
    const lastPrice = parseFloat(lastCandle.close);

    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2)
    };
  }

  /**
   * دریافت لیست بازه‌های زمانی معتبر
   * @returns {Array<string>}
   */
  function getValidTimeframes() {
    return [...VALID_TIMEFRAMES];
  }

  // Export public methods
  global.ChartAdapter = {
    getChartData,
    getCandles,
    getLatestCandle,
    toTradingViewFormat,
    toChartJsFormat,
    calculatePriceChange,
    getValidTimeframes,
    VALID_TIMEFRAMES
  };
})(window);
