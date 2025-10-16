#!/usr/bin/env python3

with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Original file size:", len(content), "bytes")

# Fix 2: Market Overview Widget
old_market = '''    async renderMarketOverviewWidget(widget) {
        try {
            // Mock market overview data
            const mockData = {
                total_market_cap: (2.5 + Math.random() * 0.5) * 1e12,
                total_volume_24h: (50 + Math.random() * 30) * 1e9,
                market_cap_change_24h: (Math.random() - 0.4) * 8,
                btc_dominance: 45 + Math.random() * 10
            };
    
            const changeClass = mockData.market_cap_change_24h >= 0 ? 'text-green-400' : 'text-red-400';'''

new_market = '''    async renderMarketOverviewWidget(widget) {
        try {
            // Get real market data from API
            const response = await this.apiCall('/api/dashboard/comprehensive');
            const marketData = response.data?.market || {
                total_market_cap: 0,
                total_volume_24h: 0,
                market_cap_change_24h: 0,
                btc_dominance: 0
            };
    
            const changeClass = marketData.market_cap_change_24h >= 0 ? 'text-green-400' : 'text-red-400';'''

if old_market in content:
    content = content.replace(old_market, new_market)
    print("✅ Fixed Market Overview Widget")
    
    # Also replace mockData references with marketData
    content = content.replace('mockData.total_market_cap', 'marketData.total_market_cap')
    content = content.replace('mockData.total_volume_24h', 'marketData.total_volume_24h')
    content = content.replace('mockData.market_cap_change_24h', 'marketData.market_cap_change_24h')
    content = content.replace('mockData.btc_dominance', 'marketData.btc_dominance')
    print("✅ Replaced all mockData references with marketData")
else:
    print("⚠️ Market widget pattern not found")

with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated file size:", len(content), "bytes")
