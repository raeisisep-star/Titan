/**
 * 📈 Active Trades Adapter
 * 
 * آداپتر برای دریافت معاملات فعال
 * Endpoint: GET /api/trades/active
 */

import { httpGet, HTTPError } from '../../lib/http.js';
import { USE_MOCK } from '../../lib/flags.js';

/**
 * Mock data برای fallback
 */
const MOCK_TRADES_DATA = {
    activeTrades: 8,
    todayTrades: 15,
    pendingOrders: 5,
    totalVolume24h: 85000,
    successfulTrades: 12,
    failedTrades: 3,
    avgTradeProfit: 3.2,
    trades: [
        {
            id: '1',
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            price: 43250,
            amount: 0.5,
            filled: 0.3,
            status: 'PARTIALLY_FILLED',
            timestamp: Date.now() - 3600000
        },
        {
            id: '2',
            symbol: 'ETHUSDT',
            side: 'SELL',
            type: 'MARKET',
            price: 2680,
            amount: 2.0,
            filled: 2.0,
            status: 'FILLED',
            timestamp: Date.now() - 7200000
        }
    ]
};

/**
 * دریافت معاملات فعال
 * 
 * @returns {Promise<object>} داده معاملات استاندارد شده
 */
export async function getActiveTrades() {
    // اگر USE_MOCK فعال است
    if (USE_MOCK) {
        console.log('📈 [Active Trades Adapter] Using MOCK data');
        return MOCK_TRADES_DATA;
    }
    
    try {
        console.log('📈 [Active Trades Adapter] Fetching from API...');
        
        // فراخوانی API واقعی
        const response = await httpGet('/api/trades/active');
        
        // اگر API ساختار استاندارد {success, data} دارد
        if (response.success && response.data) {
            return normalizeTradesData(response.data);
        }
        
        // اگر مستقیماً داده برگردانده شده
        if (response.activeTrades !== undefined || response.trades) {
            return normalizeTradesData(response);
        }
        
        // ساختار ناشناخته
        console.warn('📈 [Active Trades Adapter] Unknown response structure');
        return normalizeTradesData(response);
        
    } catch (error) {
        console.error('📈 [Active Trades Adapter] API error:', error);
        
        // Fallback به mock
        console.log('📈 [Active Trades Adapter] Falling back to MOCK data');
        return MOCK_TRADES_DATA;
    }
}

/**
 * دریافت آمار معاملات
 */
export async function getTradesStats() {
    if (USE_MOCK) {
        return {
            activeTrades: 8,
            todayTrades: 15,
            successRate: 80,
            totalPnL: 12500
        };
    }
    
    try {
        const response = await httpGet('/api/trades/stats');
        
        if (response.success && response.data) {
            return response.data;
        }
        
        return response;
        
    } catch (error) {
        console.error('📈 [Active Trades Adapter] Stats API error:', error);
        return {
            activeTrades: 0,
            todayTrades: 0,
            successRate: 0,
            totalPnL: 0
        };
    }
}

/**
 * Normalize کردن داده‌های trades
 */
function normalizeTradesData(rawData) {
    // اگر آرایه‌ای از trades بوده
    if (Array.isArray(rawData)) {
        return {
            activeTrades: rawData.filter(t => t.status === 'OPEN' || t.status === 'PARTIALLY_FILLED').length,
            todayTrades: rawData.filter(t => isToday(t.timestamp || t.time)).length,
            pendingOrders: rawData.filter(t => t.status === 'PENDING' || t.status === 'NEW').length,
            totalVolume24h: rawData.reduce((sum, t) => sum + ((t.price || 0) * (t.filled || t.executedQty || 0)), 0),
            successfulTrades: rawData.filter(t => t.status === 'FILLED').length,
            failedTrades: rawData.filter(t => t.status === 'CANCELED' || t.status === 'REJECTED').length,
            avgTradeProfit: 0,
            trades: rawData.map(normalizeTrade)
        };
    }
    
    // ساختار با فیلدهای جداگانه
    return {
        activeTrades: rawData.activeTrades || rawData.active || rawData.openTrades || 0,
        todayTrades: rawData.todayTrades || rawData.today || rawData.trades24h || 0,
        pendingOrders: rawData.pendingOrders || rawData.pending || rawData.openOrders || 0,
        totalVolume24h: rawData.totalVolume24h || rawData.volume24h || rawData.volume || 0,
        successfulTrades: rawData.successfulTrades || rawData.successful || rawData.filled || 0,
        failedTrades: rawData.failedTrades || rawData.failed || rawData.canceled || 0,
        avgTradeProfit: rawData.avgTradeProfit || rawData.avgProfit || 0,
        trades: Array.isArray(rawData.trades) ? rawData.trades.map(normalizeTrade) : []
    };
}

/**
 * Normalize کردن یک trade
 */
function normalizeTrade(trade) {
    return {
        id: trade.id || trade.orderId || trade.tradeId,
        symbol: trade.symbol || trade.pair,
        side: (trade.side || trade.type || 'BUY').toUpperCase(),
        type: (trade.orderType || trade.type || 'LIMIT').toUpperCase(),
        price: parseFloat(trade.price || trade.orderPrice || 0),
        amount: parseFloat(trade.amount || trade.quantity || trade.origQty || 0),
        filled: parseFloat(trade.filled || trade.executedQty || 0),
        status: (trade.status || 'UNKNOWN').toUpperCase(),
        timestamp: trade.timestamp || trade.time || trade.createdAt || Date.now()
    };
}

/**
 * بررسی اینکه آیا timestamp امروز است
 */
function isToday(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

/**
 * Export برای استفاده راحت
 */
export default {
    getActiveTrades,
    getTradesStats,
    MOCK_TRADES_DATA
};
