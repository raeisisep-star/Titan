# Read the file
with open('server-real-v3.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line after comprehensive dashboard endpoints
insert_line = None
for i, line in enumerate(lines):
    if 'app.get(\'/api/dashboard/comprehensive' in line:
        # Find the end of this route (after the });)
        for j in range(i, min(i+30, len(lines))):
            if '});' in lines[j]:
                insert_line = j + 1
                break
        if insert_line:
            break

if insert_line:
    # New API endpoint
    new_api = '''\n// ═══════════════════════════════════════════════════════════════════════════
// 💹 MARKET DATA API - Real-time Cryptocurrency Prices
// ═══════════════════════════════════════════════════════════════════════════

// Get real-time crypto prices for watchlist
app.get('/api/market/prices', optionalAuthMiddleware, async (c) => {
  try {
    const symbols = c.req.query('symbols');
    const cryptoIds = symbols 
      ? symbols.split(',').map(s => {
          const map = {
            'BTC': 'bitcoin', 'ETH': 'ethereum', 'ADA': 'cardano',
            'DOT': 'polkadot', 'LINK': 'chainlink', 'XRP': 'ripple',
            'SOL': 'solana', 'AVAX': 'avalanche-2'
          };
          return map[s.toUpperCase()] || s.toLowerCase();
        })
      : ['bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink'];
    
    const prices = await getCryptoPrices(cryptoIds);
    
    return c.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market prices error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get comprehensive market overview
app.get('/api/market/overview', optionalAuthMiddleware, async (c) => {
  try {
    const marketData = await getMarketOverview();
    
    return c.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market overview error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

'''
    
    lines.insert(insert_line, new_api)
    
    # Write back
    with open('server-real-v3.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"✅ Added market prices API endpoints at line {insert_line}")
else:
    print("❌ Could not find insertion point")
