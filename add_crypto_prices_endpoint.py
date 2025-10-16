# Read the file
with open('server-real-v3.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the position after getMarketOverview function
marker = "// Dashboard endpoints"

# New endpoint to add
new_endpoint = '''// Get real-time cryptocurrency prices
async function getCryptoPrices(symbols = ['bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink']) {
  const cacheKey = `crypto:prices:${symbols.join(',')}`;
  
  return await withCache(cacheKey, CONFIG.cache.marketData, async () => {
    try {
      // Fetch real prices from CoinGecko API
      const ids = symbols.join(',');
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: ids,
          vs_currencies: 'usd',
          include_24hr_change: 'true',
          include_market_cap: 'true'
        },
        timeout: 5000
      });
      
      // Transform to our format
      const prices = {};
      const symbolMap = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'cardano': 'ADA',
        'polkadot': 'DOT',
        'chainlink': 'LINK',
        'ripple': 'XRP',
        'solana': 'SOL',
        'avalanche-2': 'AVAX'
      };
      
      for (const [id, data] of Object.entries(response.data)) {
        const symbol = symbolMap[id] || id.toUpperCase().substring(0, 3);
        prices[symbol] = {
          symbol: symbol,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          current_price: data.usd || 0,
          price_change_percentage_24h: data.usd_24h_change || 0,
          market_cap: data.usd_market_cap || 0
        };
      }
      
      return prices;
    } catch (error) {
      console.warn('Failed to fetch crypto prices:', error.message);
      return {};
    }
  });
}

// Dashboard endpoints'''

# Replace the marker
content = content.replace(marker, new_endpoint)

# Write back
with open('server-real-v3.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added getCryptoPrices function")
