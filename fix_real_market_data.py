import re

# Read the file
with open('server-real-v3.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace getMarketOverview function
old_market_function = r'''async function getMarketOverview\(\) {
  const cacheKey = 'market:overview';
  
  return await withCache\(cacheKey, CONFIG\.cache\.marketData, async \(\) => {
    // In production, fetch from real market data API \(Binance, CoinGecko, etc\.\)
    // For now, return realistic mock data
    return {
      btcPrice: 43250 \+ \(Math\.random\(\) \* 1000 - 500\),
      ethPrice: 2680 \+ \(Math\.random\(\) \* 50 - 25\),
      fear_greed_index: 65,
      dominance: 51\.2,
      total_market_cap: 1750000000000,
      volume_24h: 85000000000
    };
  \}\);
}'''

new_market_function = '''async function getMarketOverview() {
  const cacheKey = 'market:overview';
  
  return await withCache(cacheKey, CONFIG.cache.marketData, async () => {
    try {
      // Fetch real market data from CoinGecko API (Free, no API key required)
      const response = await axios.get('https://api.coingecko.com/api/v3/global', {
        timeout: 5000
      });
      
      const data = response.data.data;
      
      return {
        btcPrice: data.market_cap_percentage?.btc || 0,
        ethPrice: data.market_cap_percentage?.eth || 0,
        total_market_cap: data.total_market_cap?.usd || 0,
        total_volume_24h: data.total_volume?.usd || 0,
        market_cap_change_24h: data.market_cap_change_percentage_24h_usd || 0,
        btc_dominance: data.market_cap_percentage?.btc || 0,
        active_cryptocurrencies: data.active_cryptocurrencies || 0
      };
    } catch (error) {
      console.warn('Failed to fetch market data from CoinGecko:', error.message);
      // Fallback to basic data
      return {
        btcPrice: 0,
        ethPrice: 0,
        total_market_cap: 0,
        total_volume_24h: 0,
        market_cap_change_24h: 0,
        btc_dominance: 0,
        active_cryptocurrencies: 0
      };
    }
  });
}'''

# Replace the function
content = re.sub(old_market_function, new_market_function, content, flags=re.DOTALL)

# Write back
with open('server-real-v3.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Market overview function updated with real CoinGecko API")
