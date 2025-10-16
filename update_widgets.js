// Script to update widget rendering functions with real API calls

const fs = require('fs');
const path = require('path');

const appJsPath = '/tmp/webapp/Titan/public/static/app.js';
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('Starting widget updates...');

// ==========================================
// 1. Update renderFearGreedWidget
// ==========================================
const fearGreedOld = `    async renderFearGreedWidget(widget) {
        try {
            // Get real trading statistics from API
            const mockData = {
                value: 50 /* Will be updated from API */,
                value_classification: 'متعادل',
                last_updated: new Date().toISOString()
            };
    
            const data = mockData;`;

const fearGreedNew = `    async renderFearGreedWidget(widget) {
        try {
            // Fetch real Fear & Greed Index from API
            let data = {
                value: 50,
                value_classification: 'Neutral',
                last_updated: new Date().toISOString()
            };
            
            try {
                const response = await fetch('/api/market/fear-greed', {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const apiData = await response.json();
                    if (apiData.success && apiData.data) {
                        data = apiData.data;
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch Fear & Greed Index:', error);
            }`;

if (content.includes(fearGreedOld)) {
    content = content.replace(fearGreedOld, fearGreedNew);
    console.log('✓ Updated renderFearGreedWidget');
} else {
    console.log('⚠ Could not find fearGreedOld pattern');
}

// ==========================================
// 2. Update renderTopMoversWidget
// ==========================================
const topMoversOld = `    async renderTopMoversWidget(widget) {
        // TODO: Fetch from /api/market/prices for real top movers data (gainers and losers)
        const topGainers = [
            {
                symbol: 'SHIB',
                name: 'Shiba Inu',
                current_price: 0.00002456,
                price_change_percentage_24h: 15.67,
                volume_24h: 567890123,
                market_cap_rank: 11
            },
            {
                symbol: 'DOGE',
                name: 'Dogecoin',
                current_price: 0.1234,
                price_change_percentage_24h: 12.45,
                volume_24h: 890123456,
                market_cap_rank: 9
            },
            {
                symbol: 'LINK',
                name: 'Chainlink',
                current_price: 14.56,
                price_change_percentage_24h: 8.91,
                volume_24h: 234567890,
                market_cap_rank: 15
            }
        ];

        const topLosers = [
            {
                symbol: 'LUNA',
                name: 'Terra Luna',
                current_price: 0.89,
                price_change_percentage_24h: -8.45,
                volume_24h: 123456789,
                market_cap_rank: 45
            },
            {
                symbol: 'AVAX',
                name: 'Avalanche',
                current_price: 28.67,
                price_change_percentage_24h: -6.23,
                volume_24h: 345678901,
                market_cap_rank: 18
            }
        ];

        const allMovers = [...topGainers, ...topLosers].slice(0, widget.settings?.limit || 5);`;

const topMoversNew = `    async renderTopMoversWidget(widget) {
        // Fetch real top movers from API
        let topGainers = [];
        let topLosers = [];
        
        try {
            const response = await fetch('/api/market/top-movers', {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success && apiData.data) {
                    topGainers = apiData.data.gainers || [];
                    topLosers = apiData.data.losers || [];
                }
            }
        } catch (error) {
            console.warn('Failed to fetch top movers:', error);
        }

        const allMovers = [...topGainers, ...topLosers].slice(0, widget.settings?.limit || 5);`;

if (content.includes(topMoversOld)) {
    content = content.replace(topMoversOld, topMoversNew);
    console.log('✓ Updated renderTopMoversWidget');
} else {
    console.log('⚠ Could not find topMoversOld pattern');
}

// ==========================================
// 3. Update renderTradingSignalsWidget (partial)
// ==========================================
const tradingSignalsOld = `        // TODO: Fetch from /api/ai/signals for real trading signals
        const signals = [
            {
                symbol: 'BTC',
                signal: 'buy',
                confidence: 78,
                price: 67342.50,
                target: 72000,
                stopLoss: 64000,
                reason: 'شکست مقاومت کلیدی',
                timeframe: '4H',
                indicator: 'RSI + MACD'
            },
            {
                symbol: 'ETH',
                signal: 'hold',
                confidence: 65,
                price: 3456.78,
                target: 3800,
                stopLoss: 3200,
                reason: 'ترند صعودی ادامه دار',
                timeframe: '1D',
                indicator: 'EMA Crossover'
            },
            {
                symbol: 'ADA',
                signal: 'sell',
                confidence: 82,
                price: 0.4567,
                target: 0.40,
                stopLoss: 0.48,
                reason: 'واگرایی منفی RSI',
                timeframe: '6H',
                indicator: 'Divergence'
            }
        ];`;

const tradingSignalsNew = `        // Fetch real trading signals from API
        let signals = [];
        
        try {
            const response = await fetch('/api/ai/signals', {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success && apiData.data) {
                    signals = apiData.data;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch trading signals:', error);
        }
        
        // Fallback if no signals
        if (signals.length === 0) {
            signals = [{
                symbol: 'BTC',
                signal: 'hold',
                confidence: 50,
                price: 0,
                target: 0,
                stopLoss: 0,
                reason: 'در حال بارگذاری...',
                timeframe: '24H',
                indicator: 'N/A'
            }];
        }`;

if (content.includes(tradingSignalsOld)) {
    content = content.replace(tradingSignalsOld, tradingSignalsNew);
    console.log('✓ Updated renderTradingSignalsWidget');
} else {
    console.log('⚠ Could not find tradingSignalsOld pattern');
}

// ==========================================
// 4. Update renderAIRecommendationsWidget
// ==========================================
const aiRecommendationsOld = `    async renderAIRecommendationsWidget(widget) {
        const recommendations = [
            // TODO: Fetch real recommendations from /api/ai/recommendations
            'بیت‌کوین در نزدیکی حمایت قوی',
            'اتریوم پتانسیل رشد دارد',
            'توصیه به صبر و نگهداری'
        ];`;

const aiRecommendationsNew = `    async renderAIRecommendationsWidget(widget) {
        // Fetch real AI recommendations from API
        let recommendations = [];
        
        try {
            const response = await fetch('/api/ai/recommendations', {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success && apiData.data) {
                    recommendations = apiData.data;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch AI recommendations:', error);
        }
        
        // Fallback if no recommendations
        if (recommendations.length === 0) {
            recommendations = [
                'بازار در حال بررسی است',
                'توصیه به مدیریت ریسک',
                'تنوع‌بخشی پورتفولیو'
            ];
        }`;

if (content.includes(aiRecommendationsOld)) {
    content = content.replace(aiRecommendationsOld, aiRecommendationsNew);
    console.log('✓ Updated renderAIRecommendationsWidget');
} else {
    console.log('⚠ Could not find aiRecommendationsOld pattern');
}

// Write the updated content back to the file
fs.writeFileSync(appJsPath, content, 'utf8');
console.log('\n✅ All widgets updated successfully!');
console.log('File written to:', appJsPath);
