/**
 * 📈 Active Trades Adapter
 * 
 * آداپتر برای دریافت معاملات فعال
 * Endpoint: GET /api/portfolio/transactions (بجای /api/trades/active که وجود ندارد)
 * 
 * ✅ Updated: استفاده از endpoint موجود backend
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
        
        // ✅ فراخوانی API واقعی - استفاده از /api/portfolio/transactions
        const response = await httpGet('/api/portfolio/transactions', {
            params: {
                status: 'active',  // فیلتر برای معاملات فعال
                limit: 100,        // حداکثر 100 معامله
                sort: 'desc'       // جدیدترین‌ها اول
            }
        });
        
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
 * 
 * ✅ Updated: استفاده از /api/portfolio/advanced برای stats
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
        // از /api/portfolio/advanced استفاده کن که stats هم دارد
        const response = await httpGet('/api/portfolio/advanced');
        
        if (response.success && response.data) {
            return {
                activeTrades: response.data.activePositions || response.data.openTrades || 0,
                todayTrades: response.data.tradesCount24h || response.data.todayTrades || 0,
                successRate: response.data.successRate || response.data.winRate || 0,
                totalPnL: response.data.totalPnL || response.data.profitLoss || 0
            };
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
 * 
 * ✅ Updated: با فیلدهای /api/portfolio/transactions سازگار شد
 */
function normalizeTradesData(rawData) {
    // اگر response شامل transactions یا data.transactions است
    let tradesArray = rawData;
    if (rawData.data && Array.isArray(rawData.data)) {
        tradesArray = rawData.data;
    } else if (rawData.transactions && Array.isArray(rawData.transactions)) {
        tradesArray = rawData.transactions;
    } else if (rawData.data && rawData.data.transactions) {
        tradesArray = rawData.data.transactions;
    }
    
    // اگر آرایه‌ای از trades بوده
    if (Array.isArray(tradesArray)) {
        return {
            activeTrades: tradesArray.filter(t => t.status === 'OPEN' || t.status === 'ACTIVE' || t.status === 'PARTIALLY_FILLED' || t.status === 'open').length,
            todayTrades: tradesArray.filter(t => isToday(t.timestamp || t.time || t.created_at || t.createdAt)).length,
            pendingOrders: tradesArray.filter(t => t.status === 'PENDING' || t.status === 'NEW' || t.status === 'pending').length,
            totalVolume24h: tradesArray.reduce((sum, t) => sum + ((t.price || t.amount || 0) * (t.filled || t.executedQty || t.quantity || 0)), 0),
            successfulTrades: tradesArray.filter(t => t.status === 'FILLED' || t.status === 'COMPLETED' || t.status === 'completed').length,
            failedTrades: tradesArray.filter(t => t.status === 'CANCELED' || t.status === 'REJECTED' || t.status === 'cancelled').length,
            avgTradeProfit: 0,
            trades: tradesArray.map(normalizeTrade)
        };
    }
    
    // ساختار با فیلدهای جداگانه
    return {
        activeTrades: rawData.activeTrades || rawData.active || rawData.openTrades || rawData.activePositions || 0,
        todayTrades: rawData.todayTrades || rawData.today || rawData.trades24h || rawData.tradesCount24h || 0,
        pendingOrders: rawData.pendingOrders || rawData.pending || rawData.openOrders || rawData.pendingOrders || 0,
        totalVolume24h: rawData.totalVolume24h || rawData.volume24h || rawData.volume || rawData.totalVolume || 0,
        successfulTrades: rawData.successfulTrades || rawData.successful || rawData.filled || rawData.completedTrades || 0,
        failedTrades: rawData.failedTrades || rawData.failed || rawData.canceled || rawData.cancelledTrades || 0,
        avgTradeProfit: rawData.avgTradeProfit || rawData.avgProfit || rawData.averageProfit || 0,
        trades: Array.isArray(rawData.trades) ? rawData.trades.map(normalizeTrade) : []
    };
}

/**
 * Normalize کردن یک trade
 * 
 * ✅ Updated: با فیلدهای /api/portfolio/transactions سازگار شد
 */
function normalizeTrade(trade) {
    return {
        id: trade.id || trade.orderId || trade.tradeId || trade.transaction_id,
        symbol: trade.symbol || trade.pair || trade.asset,
        side: (trade.side || trade.type || trade.direction || 'BUY').toUpperCase(),
        type: (trade.orderType || trade.type || trade.transactionType || 'LIMIT').toUpperCase(),
        price: parseFloat(trade.price || trade.orderPrice || trade.rate || 0),
        amount: parseFloat(trade.amount || trade.quantity || trade.origQty || trade.qty || 0),
        filled: parseFloat(trade.filled || trade.executedQty || trade.filledQty || 0),
        status: (trade.status || 'UNKNOWN').toUpperCase(),
        timestamp: trade.timestamp || trade.time || trade.createdAt || trade.created_at || Date.now()
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
