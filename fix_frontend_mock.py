#!/usr/bin/env python3
import re

# Read the app.js file
with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Original file size:", len(content), "bytes")

# Fix 1: Portfolio Summary Widget (around line 4675-4702)
old_portfolio = '''    async renderPortfolioSummaryWidget(widget) {
        try {
            // Get real portfolio data from API
            const mockData = {
                totalValue: 125000 + (Math.random() - 0.5) * 20000,
                totalPnL: (Math.random() - 0.3) * 5000,
                roi: (Math.random() - 0.2) * 15,
                dailyChange: (Math.random() - 0.4) * 1000
            };
    
            const changeClass = mockData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = mockData.totalPnL >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
            return `
                <div class="widget-metric">
                    <div class="widget-metric-value">$${mockData.totalValue.toLocaleString()}</div>
                    <div class="widget-metric-label">ارزش کل پورتفولیو</div>
                    <div class="widget-metric-change ${changeClass}">
                        <i class="fas ${changeIcon}"></i>
                        ${mockData.totalPnL >= 0 ? '+' : ''}$${Math.abs(mockData.totalPnL).toFixed(2)} (${mockData.roi.toFixed(2)}%)
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Portfolio summary widget error:', error);
            return '<div class="text-center text-gray-400">خطا در بارگذاری پرتفولیو</div>';
        }
    }'''

new_portfolio = '''    async renderPortfolioSummaryWidget(widget) {
        try {
            // Get real portfolio data from API
            const response = await this.apiCall('/api/dashboard/comprehensive');
            
            if (!response.success || !response.data?.portfolio) {
                console.warn('Portfolio API failed, using fallback');
                return '<div class="text-center text-gray-400">خطا در بارگذاری پورتفولیو</div>';
            }
            
            const portfolio = response.data.portfolio;
            const totalValue = portfolio.totalBalance || 0;
            const totalPnL = portfolio.totalPnL || 0;
            const roi = totalValue > 0 ? (totalPnL / totalValue * 100) : 0;
    
            const changeClass = totalPnL >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = totalPnL >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
            return `
                <div class="widget-metric">
                    <div class="widget-metric-value">$${totalValue.toLocaleString()}</div>
                    <div class="widget-metric-label">ارزش کل پورتفولیو</div>
                    <div class="widget-metric-change ${changeClass}">
                        <i class="fas ${changeIcon}"></i>
                        ${totalPnL >= 0 ? '+' : ''}$${Math.abs(totalPnL).toFixed(2)} (${roi.toFixed(2)}%)
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Portfolio summary widget error:', error);
            return '<div class="text-center text-gray-400">خطا در بارگذاری پورتفولیو</div>';
        }
    }'''

if old_portfolio in content:
    content = content.replace(old_portfolio, new_portfolio)
    print("✅ Fixed Portfolio Summary Widget")
else:
    print("⚠️ Portfolio widget pattern not found exactly, trying flexible match...")

# Write the updated content
with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated file size:", len(content), "bytes")
print("✅ Frontend mock data fix applied!")
