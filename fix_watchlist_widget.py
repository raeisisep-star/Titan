import re

# Read the file
with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the watchlist widget rendering function
# We need to find the entire function from "async renderWatchlistWidget" to the end of the function

old_pattern = r'async renderWatchlistWidget\(widget\) \{[\s\S]*?// Generate realistic watchlist data[\s\S]*?const watchlistCoins = \[[\s\S]*?\];[\s\S]*?const coins = watchlistCoins\.slice\(0, widget\.settings\?\.limit \|\| 5\);'

new_code = '''async renderWatchlistWidget(widget) {
        // Fetch real-time cryptocurrency prices from API
        let coins = [];
        try {
            const response = await this.apiCall('/api/market/prices?symbols=BTC,ETH,ADA,DOT,LINK');
            if (response.success && response.data) {
                // Transform API data to coins array
                coins = Object.values(response.data).map((coin, idx) => ({
                    symbol: coin.symbol,
                    name: coin.name,
                    current_price: coin.current_price,
                    price_change_percentage_24h: coin.price_change_percentage_24h,
                    market_cap_rank: idx + 1,
                    favorite: true
                }));
            }
        } catch (error) {
            console.warn('Failed to fetch watchlist prices:', error);
            // Fallback to empty array if API fails
            coins = [];
        }
        
        // Limit coins based on widget settings
        coins = coins.slice(0, widget.settings?.limit || 5);'''

# Replace the pattern
new_content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)

if new_content != content:
    # Write back
    with open('public/static/app.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✅ Watchlist widget updated to use real API data")
else:
    print("❌ Pattern not found, trying alternative approach...")
