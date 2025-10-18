/**
 * 🎯 Comprehensive Dashboard Adapter
 * 
 * آداپتر اصلی برای دریافت تمام داده‌های Dashboard
 * Endpoint: GET /api/dashboard/comprehensive-real
 */

import { httpGet, HTTPError } from '../../lib/http.js';
import { USE_MOCK } from '../../lib/flags.js';
import { getBalance } from './balance.adapter.js';
import { getMarketPrices } from './market.adapter.js';
import { getActiveTrades } from './activeTrades.adapter.js';

/**
 * Mock data کامل برای fallback
 */
const MOCK_COMPREHENSIVE_DATA = {
    portfolio: {
        totalBalance: 125000,
        dailyChange: 2.3,
        weeklyChange: 8.5,
        monthlyChange: 15.2,
        totalPnL: 12500,
        totalTrades: 145,
        winRate: 68,
        sharpeRatio: 1.42
    },
    aiAgents: [
        { id: 1, name: 'Scalping Master', status: 'active', performance: 12.3, trades: 45, uptime: 98.5 },
        { id: 2, name: 'Trend Follower', status: 'active', performance: 8.7, trades: 23, uptime: 99.2 },
        { id: 3, name: 'Grid Trading Pro', status: 'paused', performance: 15.4, trades: 67, uptime: 95.1 },
        { id: 4, name: 'Arbitrage Hunter', status: 'active', performance: 6.2, trades: 12, uptime: 97.8 },
        { id: 5, name: 'Mean Reversion', status: 'active', performance: 9.8, trades: 34, uptime: 98.9 }
    ],
    market: {
        btcPrice: 43250,
        ethPrice: 2680,
        fear_greed_index: 65,
        dominance: 51.2
    },
    trading: {
        activeTrades: 8,
        todayTrades: 15,
        pendingOrders: 5,
        totalVolume24h: 85000,
        successfulTrades: 12,
        failedTrades: 3
    },
    risk: {
        totalExposure: 75,
        maxRiskPerTrade: 2.5,
        currentDrawdown: -4.2,
        riskScore: 55
    },
    learning: {
        totalSessions: 125,
        completedCourses: 8,
        currentLevel: 5,
        weeklyProgress: 85
    },
    activities: [
        { id: 1, type: 'trade', description: 'BTC/USDT Long Position', amount: 2340, timestamp: Date.now() - 300000, agent: 'Trend Follower' },
        { id: 2, type: 'profit', description: 'ETH/USDT Trade Closed', amount: 450, timestamp: Date.now() - 900000, agent: 'Scalping Master' }
    ],
    summary: {
        activeAgents: 4,
        totalAgents: 5,
        avgPerformance: 10.5,
        systemHealth: 98.2
    },
    charts: {
        performance: {
            labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
            datasets: [{
                label: 'سود',
                data: [100, 150, 120, 200, 250, 280],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
        },
        agents: {
            labels: ['Scalping', 'Trend', 'Grid', 'Arbitrage', 'Mean Rev'],
            datasets: [{
                label: 'عملکرد %',
                data: [12.3, 8.7, 15.4, 6.2, 9.8],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        volume: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'حجم معاملات',
                data: [12000, 15000, 13000, 18000, 22000, 19000, 25000],
                backgroundColor: '#3b82f6'
            }]
        }
    }
};

/**
 * دریافت داده‌های جامع Dashboard
 * 
 * Strategy:
 * 1. سعی می‌کند از /api/dashboard/comprehensive-real بگیرد
 * 2. اگر ناموفق بود، از individual adapters استفاده می‌کند
 * 3. در نهایت به MOCK fallback می‌کند
 * 
 * @returns {Promise<object>} داده جامع dashboard
 */
export async function getComprehensiveDashboard() {
    console.log('🎯 [Comprehensive Adapter] Starting data fetch...');
    console.log('   USE_MOCK:', USE_MOCK);
    
    // Check token via TokenManager if available
    const token = window.TokenManager?.getToken() || localStorage.getItem('titan_auth_token');
    console.log('   Token:', token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing');
    
    if (window.TokenManager) {
        window.TokenManager.debug();
    }
    
    // اگر USE_MOCK فعال است
    if (USE_MOCK) {
        console.log('🎯 [Comprehensive Adapter] Using MOCK data (USE_MOCK=true)');
        return MOCK_COMPREHENSIVE_DATA;
    }
    
    // Strategy 1: تلاش برای دریافت از comprehensive endpoint
    try {
        console.log('🎯 [Comprehensive Adapter] Strategy 1: Trying /api/dashboard/comprehensive-real...');
        
        const response = await httpGet('/api/dashboard/comprehensive-real', {
            timeout: 10000  // timeout بیشتر برای comprehensive
        });
        
        console.log('📦 [Comprehensive Adapter] Response received:', {
            success: response?.success,
            hasData: !!response?.data,
            hasPortfolio: !!response?.portfolio,
            hasMarket: !!response?.market,
            keys: Object.keys(response || {})
        });
        
        if (response.success && response.data) {
            console.log('✅ [Comprehensive Adapter] Got data from comprehensive endpoint');
            return normalizeComprehensiveData(response.data);
        }
        
        if (response.portfolio || response.market || response.trading) {
            console.log('✅ [Comprehensive Adapter] Got partial data from comprehensive endpoint');
            return normalizeComprehensiveData(response);
        }
        
        console.warn('⚠️ [Comprehensive Adapter] Response format unexpected:', response);
        
    } catch (error) {
        console.error('❌ [Comprehensive Adapter] Strategy 1 failed:', {
            message: error.message,
            status: error.status,
            data: error.data,
            stack: error.stack
        });
    }
    
    // Strategy 2: تلاش با auth-required endpoint
    try {
        console.log('🎯 [Comprehensive Adapter] Strategy 2: Trying /api/dashboard/comprehensive...');
        
        const response = await httpGet('/api/dashboard/comprehensive');
        
        console.log('📦 [Comprehensive Adapter] Auth endpoint response:', {
            success: response?.success,
            hasData: !!response?.data,
            keys: Object.keys(response || {})
        });
        
        if (response.success && response.data) {
            console.log('✅ [Comprehensive Adapter] Got data from auth endpoint');
            return normalizeComprehensiveData(response.data);
        }
        
    } catch (error) {
        console.error('❌ [Comprehensive Adapter] Strategy 2 failed:', {
            message: error.message,
            status: error.status,
            data: error.data
        });
    }
    
    // Strategy 3: ساخت داده از individual adapters
    try {
        console.log('🎯 [Comprehensive Adapter] Strategy 3: Building from individual adapters...');
        
        const [balance, market, trades] = await Promise.allSettled([
            getBalance(),
            getMarketPrices(),
            getActiveTrades()
        ]);
        
        console.log('📦 [Comprehensive Adapter] Individual adapter results:', {
            balance: balance.status,
            market: market.status,
            trades: trades.status
        });
        
        const comprehensiveData = {
            portfolio: balance.status === 'fulfilled' ? {
                totalBalance: balance.value.totalBalance,
                dailyChange: balance.value.dailyChange,
                weeklyChange: balance.value.weeklyChange,
                monthlyChange: balance.value.monthlyChange,
                totalPnL: 0,
                totalTrades: 0,
                winRate: 0,
                sharpeRatio: 0
            } : MOCK_COMPREHENSIVE_DATA.portfolio,
            
            market: market.status === 'fulfilled' ? {
                btcPrice: market.value.btcPrice,
                ethPrice: market.value.ethPrice,
                fear_greed_index: market.value.fearGreedIndex,
                dominance: market.value.btcDominance
            } : MOCK_COMPREHENSIVE_DATA.market,
            
            trading: trades.status === 'fulfilled' ? {
                activeTrades: trades.value.activeTrades,
                todayTrades: trades.value.todayTrades,
                pendingOrders: trades.value.pendingOrders,
                totalVolume24h: trades.value.totalVolume24h,
                successfulTrades: trades.value.successfulTrades,
                failedTrades: trades.value.failedTrades
            } : MOCK_COMPREHENSIVE_DATA.trading,
            
            // Mock data برای بخش‌های باقی‌مانده
            aiAgents: MOCK_COMPREHENSIVE_DATA.aiAgents,
            risk: MOCK_COMPREHENSIVE_DATA.risk,
            learning: MOCK_COMPREHENSIVE_DATA.learning,
            activities: MOCK_COMPREHENSIVE_DATA.activities,
            summary: MOCK_COMPREHENSIVE_DATA.summary,
            charts: MOCK_COMPREHENSIVE_DATA.charts
        };
        
        console.log('✅ [Comprehensive Adapter] Built from individual adapters');
        return comprehensiveData;
        
    } catch (error) {
        console.error('❌ [Comprehensive Adapter] Strategy 3 failed:', {
            message: error.message,
            stack: error.stack
        });
    }
    
    // Strategy 4: Complete fallback به mock
    console.warn('⚠️ [Comprehensive Adapter] ALL STRATEGIES FAILED - Falling back to complete MOCK data');
    console.warn('   This should NOT happen in production with FORCE_REAL=true');
    return MOCK_COMPREHENSIVE_DATA;
}

/**
 * Normalize کردن داده‌های comprehensive
 */
function normalizeComprehensiveData(rawData) {
    // 🔒 CRITICAL: Preserve meta object from backend
    const normalized = {
        portfolio: rawData.portfolio || MOCK_COMPREHENSIVE_DATA.portfolio,
        aiAgents: rawData.aiAgents || rawData.ai_agents || MOCK_COMPREHENSIVE_DATA.aiAgents,
        market: rawData.market || MOCK_COMPREHENSIVE_DATA.market,
        trading: rawData.trading || MOCK_COMPREHENSIVE_DATA.trading,
        risk: rawData.risk || MOCK_COMPREHENSIVE_DATA.risk,
        learning: rawData.learning || MOCK_COMPREHENSIVE_DATA.learning,
        activities: rawData.activities || rawData.recentActivities || MOCK_COMPREHENSIVE_DATA.activities,
        summary: rawData.summary || MOCK_COMPREHENSIVE_DATA.summary,
        charts: rawData.charts || MOCK_COMPREHENSIVE_DATA.charts
    };
    
    // 🔑 CRITICAL: Preserve meta from backend response
    if (rawData.meta) {
        normalized.meta = rawData.meta;
        console.log('✅ [Adapter] Preserved meta from backend:', rawData.meta);
    } else {
        // Create default meta if missing
        normalized.meta = {
            source: 'fallback',
            ts: Date.now(),
            ttlMs: 30000,
            stale: false
        };
        console.warn('⚠️ [Adapter] No meta in response, created default meta');
    }
    
    return normalized;
}

/**
 * Export برای استفاده راحت
 */
export default {
    getComprehensiveDashboard,
    MOCK_COMPREHENSIVE_DATA
};
