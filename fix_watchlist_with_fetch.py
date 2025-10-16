import re

# Read the file
with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the watchlist widget
old_code = r'''    async renderWatchlistWidget\(widget\) \{
        // Fetch real-time cryptocurrency prices from API
        let coins = \[\];
        try \{
            const response = await this\.apiCall\('/api/market/prices\?symbols=BTC,ETH,ADA,DOT,LINK'\);
            if \(response\.success && response\.data\) \{
                // Transform API data to coins array
                coins = Object\.values\(response\.data\)\.map\(\(coin, idx\) => \(\{
                    symbol: coin\.symbol,
                    name: coin\.name,
                    current_price: coin\.current_price,
                    price_change_percentage_24h: coin\.price_change_percentage_24h,
                    market_cap_rank: idx \+ 1,
                    favorite: true
                \}\)\);
            \}
        \} catch \(error\) \{
            console\.warn\('Failed to fetch watchlist prices:', error\);
            // Fallback to empty array if API fails
            coins = \[\];
        \}
        
        // Limit coins based on widget settings
        coins = coins\.slice\(0, widget\.settings\?\.limit \|\| 5\);'''

new_code = '''    async renderWatchlistWidget(widget) {
        // Fetch real-time cryptocurrency prices from API
        let coins = [];
        try {
            const response = await fetch('/api/market/prices?symbols=BTC,ETH,ADA,DOT,LINK', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // Transform API data to coins array
                    coins = Object.values(data.data).map((coin, idx) => ({
                        symbol: coin.symbol,
                        name: coin.name,
                        current_price: coin.current_price,
                        price_change_percentage_24h: coin.price_change_percentage_24h,
                        market_cap_rank: idx + 1,
                        favorite: true
                    }));
                }
            }
        } catch (error) {
            console.warn('Failed to fetch watchlist prices:', error);
            // Fallback to empty array if API fails
            coins = [];
        }
        
        // Limit coins based on widget settings
        coins = coins.slice(0, widget.settings?.limit || 5);'''

# Replace
new_content = re.sub(old_code, new_code, content, flags=re.DOTALL)

if new_content != content:
    with open('public/static/app.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✅ Watchlist widget fixed with proper fetch()")
else:
    print("❌ Pattern not found")
