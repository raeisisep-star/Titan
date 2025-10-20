/**
 * 📊 Market Adapter
 * 
 * آداپتر برای دریافت قیمت‌های بازار
 * Endpoint: GET /api/market/prices?symbols=BTCUSDT,ETHUSDT
 */

import { httpGet, HTTPError } from '../../lib/http.js';
import { USE_MOCK } from '../../lib/flags.js';

/**
 * Mock data برای fallback
 */
const MOCK_MARKET_DATA = {
    btcPrice: 43250.50,
    btcChange24h: 2.35,
    ethPrice: 2680.75,
    ethChange24h: 3.12,
    fearGreedIndex: 65,
    fearGreedStatus: 'طمع',
    btcDominance: 51.2,
    totalMarketCap: 1750000000000,
    total24hVolume: 85000000000
};

/**
 * دریافت قیمت‌های بازار
 * 
 * @param {string[]} symbols - لیست نمادها (مثل ['BTCUSDT', 'ETHUSDT'])
 * @returns {Promise<object>} داده بازار استاندارد شده
 */
export async function getMarketPrices(symbols = ['BTCUSDT', 'ETHUSDT']) {
    // اگر USE_MOCK فعال است
    if (USE_MOCK) {
        console.log('📊 [Market Adapter] Using MOCK data');
        return MOCK_MARKET_DATA;
    }
    
    try {
        console.log('📊 [Market Adapter] Fetching from API...', symbols);
        
        // فراخوانی API واقعی
        const response = await httpGet('/api/market/prices', {
            params: {
                symbols: symbols.join(',')
            }
        });
        
        // اگر API ساختار استاندارد {success, data} دارد
        if (response.success && response.data) {
            return normalizeMarketData(response.data);
        }
        
        // اگر مستقیماً داده برگردانده شده
        if (response.btcPrice !== undefined || response.prices) {
            return normalizeMarketData(response);
        }
        
        // ساختار ناشناخته
        console.warn('📊 [Market Adapter] Unknown response structure');
        return normalizeMarketData(response);
        
    } catch (error) {
        console.error('📊 [Market Adapter] API error:', error);
        
        // Fallback به mock
        console.log('📊 [Market Adapter] Falling back to MOCK data');
        return MOCK_MARKET_DATA;
    }
}

/**
 * دریافت Fear & Greed Index
 */
export async function getFearGreedIndex() {
    if (USE_MOCK) {
        return {
            value: 65,
            status: 'طمع',
            classification: 'Greed'
        };
    }
    
    try {
        const response = await httpGet('/api/market/fear-greed');
        
        if (response.success && response.data) {
            return normalizeFearGreedData(response.data);
        }
        
        return normalizeFearGreedData(response);
        
    } catch (error) {
        console.error('📊 [Market Adapter] Fear & Greed API error:', error);
        return {
            value: 50,
            status: 'خنثی',
            classification: 'Neutral'
        };
    }
}

/**
 * Normalize کردن داده‌های market
 */
function normalizeMarketData(rawData) {
    // اگر به صورت آرایه prices داشته باشد
    if (rawData.prices && Array.isArray(rawData.prices)) {
        const btcData = rawData.prices.find(p => p.symbol === 'BTCUSDT' || p.symbol === 'BTC');
        const ethData = rawData.prices.find(p => p.symbol === 'ETHUSDT' || p.symbol === 'ETH');
        
        return {
            btcPrice: btcData?.price || btcData?.lastPrice || 0,
            btcChange24h: btcData?.priceChangePercent || btcData?.change24h || 0,
            ethPrice: ethData?.price || ethData?.lastPrice || 0,
            ethChange24h: ethData?.priceChangePercent || ethData?.change24h || 0,
            fearGreedIndex: rawData.fearGreedIndex || rawData.fear_greed_index || 50,
            fearGreedStatus: rawData.fearGreedStatus || getStatusFromIndex(rawData.fearGreedIndex || 50),
            btcDominance: rawData.btcDominance || rawData.btc_dominance || 51,
            totalMarketCap: rawData.totalMarketCap || rawData.total_market_cap || 0,
            total24hVolume: rawData.total24hVolume || rawData.total_volume_24h || 0
        };
    }
    
    // ساختار مستقیم
    return {
        btcPrice: rawData.btcPrice || rawData.BTC || rawData['BTCUSDT']?.price || 0,
        btcChange24h: rawData.btcChange24h || rawData['BTCUSDT']?.change || 0,
        ethPrice: rawData.ethPrice || rawData.ETH || rawData['ETHUSDT']?.price || 0,
        ethChange24h: rawData.ethChange24h || rawData['ETHUSDT']?.change || 0,
        fearGreedIndex: rawData.fearGreedIndex || rawData.fear_greed_index || 50,
        fearGreedStatus: rawData.fearGreedStatus || getStatusFromIndex(rawData.fearGreedIndex || 50),
        btcDominance: rawData.btcDominance || rawData.dominance || 51,
        totalMarketCap: rawData.totalMarketCap || rawData.marketCap || 0,
        total24hVolume: rawData.total24hVolume || rawData.volume24h || 0
    };
}

/**
 * Normalize کردن Fear & Greed data
 */
function normalizeFearGreedData(rawData) {
    const value = rawData.value || rawData.index || 50;
    
    return {
        value,
        status: rawData.status || getStatusFromIndex(value),
        classification: rawData.classification || getClassificationFromIndex(value)
    };
}

/**
 * گرفتن وضعیت از مقدار index
 */
function getStatusFromIndex(value) {
    if (value > 75) return 'طمع شدید';
    if (value > 50) return 'طمع';
    if (value > 25) return 'خنثی';
    return 'ترس';
}

/**
 * گرفتن classification از مقدار index
 */
function getClassificationFromIndex(value) {
    if (value > 75) return 'Extreme Greed';
    if (value > 50) return 'Greed';
    if (value > 25) return 'Neutral';
    return 'Fear';
}

/**
 * Export برای استفاده راحت
 */
export default {
    getMarketPrices,
    getFearGreedIndex,
    MOCK_MARKET_DATA
};
