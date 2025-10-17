/**
 * 🌐 HTTP Client for Titan Trading System
 * 
 * مدیریت مرکزی تمام فراخوانی‌های HTTP
 * - Timeout با AbortController
 * - Retry logic برای 502/503
 * - خطاهای یکپارچه
 * - Credentials management
 */

import { API_TIMEOUT, ENABLE_RETRY, MAX_RETRIES, DEBUG_MODE } from './flags.js';

// Base URL از window.ENV یا پیش‌فرض
const BASE_URL = window.ENV?.API_URL || '';

/**
 * خطای HTTP سفارشی
 */
class HTTPError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'HTTPError';
        this.status = status;
        this.data = data;
    }
}

/**
 * درخواست HTTP با timeout و retry
 * 
 * @param {string} path - مسیر endpoint (مثل /api/dashboard/comprehensive)
 * @param {object} options - گزینه‌های درخواست
 * @param {object} options.params - پارامترهای query string
 * @param {object} options.headers - هدرهای سفارشی
 * @param {number} options.timeout - timeout به میلی‌ثانیه (پیش‌فرض: 8000)
 * @param {string} options.method - متد HTTP (GET, POST, PUT, DELETE)
 * @param {any} options.body - بدنه درخواست (برای POST/PUT)
 * @param {boolean} options.credentials - ارسال credentials (پیش‌فرض: true)
 * @param {number} options._retryCount - تعداد تلاش مجدد (استفاده داخلی)
 * @returns {Promise<any>} پاسخ JSON
 */
async function httpRequest(path, options = {}) {
    const {
        params = {},
        headers = {},
        timeout = API_TIMEOUT,
        method = 'GET',
        body = null,
        credentials = true,
        _retryCount = 0
    } = options;
    
    // ساخت URL کامل با query params
    const url = new URL(path, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });
    
    // ساخت AbortController برای timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // ساخت headers با token اگر موجود باشد
    const finalHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };
    
    const token = localStorage.getItem('titan_auth_token');
    if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // گزینه‌های fetch
    const fetchOptions = {
        method,
        headers: finalHeaders,
        signal: controller.signal,
        credentials: credentials ? 'include' : 'same-origin'
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    if (DEBUG_MODE) {
        console.log(`🌐 HTTP ${method} ${url.pathname}${url.search}`);
    }
    
    try {
        const response = await fetch(url.toString(), fetchOptions);
        clearTimeout(timeoutId);
        
        // بررسی وضعیت پاسخ
        if (!response.ok) {
            // برای 502/503 اگر retry فعال باشد
            if (ENABLE_RETRY && (response.status === 502 || response.status === 503) && _retryCount < MAX_RETRIES) {
                console.warn(`⚠️ HTTP ${response.status}, retrying (${_retryCount + 1}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (_retryCount + 1)));
                return httpRequest(path, { ...options, _retryCount: _retryCount + 1 });
            }
            
            // خطاهای دیگر
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }
            
            throw new HTTPError(
                errorData.message || `HTTP Error ${response.status}`,
                response.status,
                errorData
            );
        }
        
        // Parse کردن JSON
        const data = await response.json();
        
        if (DEBUG_MODE) {
            console.log(`✅ HTTP ${method} ${url.pathname} - Success`);
        }
        
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new HTTPError(
                `Request timeout after ${timeout}ms`,
                408,
                { timeout: true }
            );
        }
        
        // اگر HTTPError است، دوباره throw کن
        if (error instanceof HTTPError) {
            throw error;
        }
        
        // سایر خطاهای شبکه
        throw new HTTPError(
            error.message || 'Network error',
            0,
            { originalError: error }
        );
    }
}

/**
 * درخواست GET
 */
export async function httpGet(path, options = {}) {
    return httpRequest(path, { ...options, method: 'GET' });
}

/**
 * درخواست POST
 */
export async function httpPost(path, body, options = {}) {
    return httpRequest(path, { ...options, method: 'POST', body });
}

/**
 * درخواست PUT
 */
export async function httpPut(path, body, options = {}) {
    return httpRequest(path, { ...options, method: 'PUT', body });
}

/**
 * درخواست DELETE
 */
export async function httpDelete(path, options = {}) {
    return httpRequest(path, { ...options, method: 'DELETE' });
}

/**
 * Export کردن HTTPError برای استفاده در adapters
 */
export { HTTPError };

// Make available globally for console debugging
window.TITAN_HTTP = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    delete: httpDelete,
    HTTPError
};

if (DEBUG_MODE) {
    console.log('🌐 HTTP Client initialized');
    console.log('   Base URL:', BASE_URL || 'same-origin');
    console.log('   Timeout:', API_TIMEOUT, 'ms');
}
