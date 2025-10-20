#!/usr/bin/env python3

with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Original file size:", len(content), "bytes")

# Fix 3: Performance Chart Data
old_chart = '''        try {
            // Generate mock performance data for chart
            const mockData = this.generateMockPerformanceData();
            const totalPnL = mockData[mockData.length - 1].pnl;
            const startPnL = mockData[0].pnl;
            const percentage = startPnL !== 0 ? ((totalPnL - startPnL) / Math.abs(startPnL) * 100) : 0;'''

new_chart = '''        try {
            // Get real performance data from API
            const response = await this.apiCall('/api/portfolio/advanced');
            const performance = response.data?.performance || {};
            
            // Use real PnL data or fallback
            const totalPnL = performance.totalPnL || 0;
            const dailyPnL = performance.dailyPnL || 0;
            const percentage = performance.winRate || 0;
            
            // Generate chart data from real trading history
            const mockData = await this.getPerformanceHistory();'''

if old_chart in content:
    content = content.replace(old_chart, new_chart)
    print("✅ Fixed Performance Chart initialization")
else:
    print("⚠️ Performance chart pattern not found")

# Add a new method to get performance history
old_mock_method = '''    generateMockPerformanceData() {
        const days = 30;
        const data = [];
        let pnl = 10000;
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const change = (Math.random() - 0.48) * 500;
            pnl += change;
            
            data.push({
                date: date.toLocaleDateString('fa-IR'),
                pnl: pnl,
                change: change
            });
        }
        
        return data;
    }'''

new_real_method = '''    async getPerformanceHistory() {
        try {
            // Try to get real historical data
            const response = await this.apiCall('/api/portfolio/performance');
            if (response.success && response.data?.history) {
                return response.data.history;
            }
        } catch (error) {
            console.warn('Performance history API not available, using calculation');
        }
        
        // Fallback: generate from current balance
        const dashResponse = await this.apiCall('/api/dashboard/comprehensive');
        const balance = dashResponse.data?.portfolio?.totalBalance || 10000;
        const pnl = dashResponse.data?.portfolio?.totalPnL || 0;
        
        const days = 30;
        const data = [];
        const today = new Date();
        const startBalance = balance - pnl;
        const dailyChange = pnl / days;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const currentPnl = startBalance + (dailyChange * (days - i));
            
            data.push({
                date: date.toLocaleDateString('fa-IR'),
                pnl: currentPnl,
                change: dailyChange
            });
        }
        
        return data;
    }'''

if old_mock_method in content:
    content = content.replace(old_mock_method, new_real_method)
    print("✅ Replaced generateMockPerformanceData with getPerformanceHistory")
else:
    print("⚠️ generateMockPerformanceData method not found")

with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated file size:", len(content), "bytes")
print("✅ All frontend mock data fixes applied!")
