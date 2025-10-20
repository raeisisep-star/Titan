// Add these functions after getCryptoPrices (around line 758)

// ═══════════════════════════════════════════════════════════════════════════
// 💹 ADDITIONAL MARKET DATA FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// 1. Get Fear & Greed Index
async function getFearGreedIndex() {
  const cacheKey = 'market:fear-greed';
  
  return await withCache(cacheKey, CONFIG.cache.marketData * 10, async () => {
    try {
      // Try to fetch from Alternative.me Fear & Greed Index API (free)
      const response = await axios.get('https://api.alternative.me/fng/', {
        timeout: 5000
      });
      
      if (response.data && response.data.data && response.data.data[0]) {
        const fng = response.data.data[0];
        return {
          value: parseInt(fng.value),
          value_classification: fng.value_classification,
          timestamp: fng.timestamp,
          time_until_update: fng.time_until_update
        };
      }
    } catch (error) {
      console.warn('Fear & Greed API failed:', error.message);
    }
    
    // Fallback: Calculate from market data
    try {
      const marketData = await getMarketOverview();
      if (marketData && marketData.market_cap_change_24h) {
        const change = marketData.market_cap_change_24h;
        // Simple calculation: 50 + (market change * 2)
        const value = Math.min(100, Math.max(0, Math.round(50 + change * 2)));
        
        let classification = 'Neutral';
        if (value >= 75) classification = 'Extreme Greed';
        else if (value >= 65) classification = 'Greed';
        else if (value >= 45) classification = 'Neutral';
        else if (value >= 35) classification = 'Fear';
        else classification = 'Extreme Fear';
        
        return {
          value: value,
          value_classification: classification,
          timestamp: Date.now(),
          source: 'calculated'
        };
      }
    } catch (err) {
      console.warn('Fallback Fear & Greed calculation failed');
    }
    
    // Final fallback
    return {
      value: 50,
      value_classification: 'Neutral',
      timestamp: Date.now(),
      source: 'default'
    };
  });
}

// 2. Get Top Movers (gainers and losers)
async function getTopMovers() {
  const cacheKey = 'market:top-movers';
  
  return await withCache(cacheKey, CONFIG.cache.marketData, async () => {
    try {
      // Fetch multiple coins and sort by 24h change
      const symbols = ['bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink', 
                       'ripple', 'solana', 'avalanche-2', 'dogecoin', 'shiba-inu',
                       'polygon', 'litecoin', 'uniswap', 'cosmos', 'stellar'];
      
      const prices = await getCryptoPrices(symbols);
      const coins = Object.values(prices);
      
      if (coins.length === 0) {
        return { gainers: [], losers: [] };
      }
      
      // Sort by price change
      const sorted = coins.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      
      return {
        gainers: sorted.slice(0, 5),
        losers: sorted.slice(-5).reverse()
      };
    } catch (error) {
      console.warn('Top movers calculation failed:', error.message);
      return { gainers: [], losers: [] };
    }
  });
}

// 3. Generate Trading Signals based on market data
async function getTradingSignals() {
  const cacheKey = 'ai:trading-signals';
  
  return await withCache(cacheKey, CONFIG.cache.marketData * 5, async () => {
    try {
      // Get current prices for major coins
      const prices = await getCryptoPrices(['bitcoin', 'ethereum', 'cardano']);
      const signals = [];
      
      for (const [symbol, coin] of Object.entries(prices)) {
        const change = coin.price_change_percentage_24h;
        
        // Simple signal generation based on 24h change
        let signal = 'hold';
        let confidence = 50;
        let reason = 'نوسان عادی بازار';
        
        if (change > 5) {
          signal = 'buy';
          confidence = Math.min(95, 60 + Math.abs(change) * 3);
          reason = `روند صعودی قوی (+${change.toFixed(2)}%)`;
        } else if (change > 2) {
          signal = 'buy';
          confidence = Math.min(80, 55 + Math.abs(change) * 5);
          reason = `روند مثبت (+${change.toFixed(2)}%)`;
        } else if (change < -5) {
          signal = 'sell';
          confidence = Math.min(85, 60 + Math.abs(change) * 3);
          reason = `روند نزولی شدید (${change.toFixed(2)}%)`;
        } else if (change < -2) {
          signal = 'hold';
          confidence = Math.min(70, 50 + Math.abs(change) * 5);
          reason = `نوسان منفی (${change.toFixed(2)}%)`;
        }
        
        signals.push({
          symbol: coin.symbol,
          name: coin.name,
          signal: signal,
          confidence: Math.round(confidence),
          price: coin.current_price,
          target: signal === 'buy' ? coin.current_price * 1.08 : coin.current_price * 0.92,
          stopLoss: signal === 'buy' ? coin.current_price * 0.95 : coin.current_price * 1.05,
          reason: reason,
          timeframe: '24H',
          indicator: 'Price Action + Market Sentiment',
          timestamp: new Date().toISOString()
        });
      }
      
      return signals;
    } catch (error) {
      console.warn('Trading signals generation failed:', error.message);
      return [];
    }
  });
}

// 4. Generate AI Recommendations
async function getAIRecommendations() {
  const cacheKey = 'ai:recommendations';
  
  return await withCache(cacheKey, CONFIG.cache.marketData * 5, async () => {
    try {
      const prices = await getCryptoPrices(['bitcoin', 'ethereum', 'cardano']);
      const marketData = await getMarketOverview();
      const recommendations = [];
      
      // Recommendation 1: Based on Bitcoin
      if (prices.BTC) {
        const btcChange = prices.BTC.price_change_percentage_24h;
        if (btcChange > 3) {
          recommendations.push(`بیت‌کوین رشد ${btcChange.toFixed(2)}% - روند صعودی قوی، فرصت خرید`);
        } else if (btcChange > 0) {
          recommendations.push(`بیت‌کوین رشد ${btcChange.toFixed(2)}% - روند مثبت، نگهداری توصیه می‌شود`);
        } else if (btcChange < -3) {
          recommendations.push(`بیت‌کوین کاهش ${Math.abs(btcChange).toFixed(2)}% - احتیاط، انتظار تثبیت`);
        } else {
          recommendations.push(`بیت‌کوین در حال نوسان (${btcChange.toFixed(2)}%) - صبر و نظاره`);
        }
      }
      
      // Recommendation 2: Based on Ethereum
      if (prices.ETH) {
        const ethChange = prices.ETH.price_change_percentage_24h;
        if (ethChange > 3) {
          recommendations.push(`اتریوم رشد ${ethChange.toFixed(2)}% - پتانسیل رشد بیشتر`);
        } else if (ethChange > 0) {
          recommendations.push(`اتریوم روند مثبت (${ethChange.toFixed(2)}%) - نگهداری`);
        } else {
          recommendations.push(`اتریوم تحت فشار (${ethChange.toFixed(2)}%) - احتیاط`);
        }
      }
      
      // Recommendation 3: Based on market sentiment
      if (marketData && marketData.market_cap_change_24h) {
        const marketChange = marketData.market_cap_change_24h;
        if (marketChange > 2) {
          recommendations.push(`بازار کلی صعودی است (+${marketChange.toFixed(1)}%) - فضای مناسب برای معامله`);
        } else if (marketChange < -2) {
          recommendations.push(`بازار کلی نزولی است (${marketChange.toFixed(1)}%) - مدیریت ریسک`);
        } else {
          recommendations.push(`بازار در حالت تعادل - تنوع‌بخشی پورتفولیو`);
        }
      }
      
      return recommendations;
    } catch (error) {
      console.warn('AI recommendations generation failed:', error.message);
      return [
        'بازار در حال بررسی است',
        'توصیه به مدیریت ریسک',
        'تنوع‌بخشی پورتفولیو'
      ];
    }
  });
}
