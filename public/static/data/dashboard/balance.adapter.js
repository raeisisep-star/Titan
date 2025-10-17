/**
 * 💰 Balance Adapter
 * 
 * آداپتر برای دریافت موجودی کاربر
 * Endpoint: GET /api/user/balance
 */

import { httpGet, HTTPError } from '../../lib/http.js';
import { USE_MOCK } from '../../lib/flags.js';

/**
 * Mock data برای fallback
 */
const MOCK_BALANCE_DATA = {
    totalBalance: 125000,
    availableBalance: 120000,
    lockedBalance: 5000,
    dailyChange: 2.3,
    dailyChangeAmount: 2875,
    weeklyChange: 8.5,
    monthlyChange: 15.2,
    currency: 'USDT'
};

/**
 * دریافت موجودی کاربر
 * 
 * @returns {Promise<object>} داده موجودی استاندارد شده
 */
export async function getBalance() {
    // اگر USE_MOCK فعال است، مستقیماً mock برگردان
    if (USE_MOCK) {
        console.log('💰 [Balance Adapter] Using MOCK data');
        return MOCK_BALANCE_DATA;
    }
    
    try {
        console.log('💰 [Balance Adapter] Fetching from API...');
        
        // فراخوانی API واقعی
        const response = await httpGet('/api/user/balance');
        
        // اگر API ساختار استاندارد {success, data} دارد
        if (response.success && response.data) {
            return normalizeBalanceData(response.data);
        }
        
        // اگر مستقیماً داده برگردانده شده
        if (response.totalBalance !== undefined) {
            return normalizeBalanceData(response);
        }
        
        // اگر ساختار ناشناخته بود، سعی کن map کنی
        console.warn('💰 [Balance Adapter] Unknown response structure, attempting to map');
        return normalizeBalanceData(response);
        
    } catch (error) {
        console.error('💰 [Balance Adapter] API error:', error);
        
        // در صورت خطا، fallback به mock
        console.log('💰 [Balance Adapter] Falling back to MOCK data');
        return MOCK_BALANCE_DATA;
    }
}

/**
 * Normalize کردن داده‌های balance به فرمت استاندارد UI
 * 
 * @param {object} rawData - داده خام از API
 * @returns {object} داده استاندارد شده
 */
function normalizeBalanceData(rawData) {
    // Map کردن نام‌های مختلف فیلدها
    return {
        totalBalance: rawData.totalBalance || rawData.total || rawData.balance || 0,
        availableBalance: rawData.availableBalance || rawData.available || rawData.free || 0,
        lockedBalance: rawData.lockedBalance || rawData.locked || rawData.frozen || 0,
        dailyChange: rawData.dailyChange || rawData.daily_change || rawData.changePercent24h || 0,
        dailyChangeAmount: rawData.dailyChangeAmount || rawData.daily_change_amount || rawData.change24h || 0,
        weeklyChange: rawData.weeklyChange || rawData.weekly_change || rawData.changePercent7d || 0,
        monthlyChange: rawData.monthlyChange || rawData.monthly_change || rawData.changePercent30d || 0,
        currency: rawData.currency || rawData.asset || 'USDT'
    };
}

/**
 * Export برای استفاده راحت
 */
export default {
    getBalance,
    MOCK_BALANCE_DATA
};
