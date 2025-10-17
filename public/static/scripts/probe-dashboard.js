/**
 * 🔍 Dashboard API Probe Script
 * 
 * این اسکریپت تمام endpoints مورد استفاده Dashboard را تست می‌کند
 * و وضعیت آن‌ها را در جدول نمایش می‌دهد
 */

(async function probeDashboardAPIs() {
    console.log('🔍 Starting Dashboard API Probe...\n');
    
    const results = [];
    const token = localStorage.getItem('titan_auth_token');
    
    // Define all endpoints used by Dashboard module
    const endpoints = [
        {
            path: '/api/dashboard/comprehensive-real',
            method: 'GET',
            authRequired: false,
            description: 'جامع بدون احراز هویت'
        },
        {
            path: '/api/dashboard/comprehensive',
            method: 'GET',
            authRequired: true,
            description: 'جامع با احراز هویت'
        },
        {
            path: '/api/dashboard/comprehensive-dev',
            method: 'GET',
            authRequired: false,
            description: 'نسخه توسعه'
        },
        {
            path: '/api/dashboard/overview',
            method: 'GET',
            authRequired: true,
            description: 'نمای کلی'
        },
        {
            path: '/api/ai-analytics/agents',
            method: 'GET',
            authRequired: true,
            description: 'لیست ایجنت‌های AI'
        },
        // Potential individual endpoints for adapters
        {
            path: '/api/user/balance',
            method: 'GET',
            authRequired: true,
            description: 'موجودی کاربر'
        },
        {
            path: '/api/market/prices',
            method: 'GET',
            authRequired: false,
            description: 'قیمت‌های بازار',
            params: { symbols: 'BTCUSDT,ETHUSDT' }
        },
        {
            path: '/api/trades/active',
            method: 'GET',
            authRequired: true,
            description: 'معاملات فعال'
        },
        {
            path: '/api/portfolio/stats',
            method: 'GET',
            authRequired: true,
            description: 'آمار پورتفولیو'
        },
        {
            path: '/api/alerts/active',
            method: 'GET',
            authRequired: true,
            description: 'هشدارهای فعال'
        }
    ];
    
    // Probe each endpoint
    for (const endpoint of endpoints) {
        const result = {
            path: endpoint.path,
            method: endpoint.method,
            description: endpoint.description,
            authRequired: endpoint.authRequired ? 'بله' : 'خیر',
            status: null,
            contentType: null,
            responseKeys: null,
            error: null,
            note: null
        };
        
        try {
            const url = new URL(endpoint.path, window.location.origin);
            if (endpoint.params) {
                Object.keys(endpoint.params).forEach(key => {
                    url.searchParams.append(key, endpoint.params[key]);
                });
            }
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (endpoint.authRequired && token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(url.toString(), {
                method: endpoint.method,
                headers: headers,
                credentials: 'include'
            });
            
            result.status = response.status;
            result.contentType = response.headers.get('Content-Type');
            
            if (response.ok) {
                try {
                    const data = await response.json();
                    result.responseKeys = Object.keys(data).join(', ');
                    
                    // Check if response has expected structure
                    if (data.success !== undefined) {
                        result.note = data.success ? '✅ موفق' : '❌ خطا در پاسخ';
                        if (data.data) {
                            result.responseKeys += ' → data: ' + Object.keys(data.data).slice(0, 5).join(', ');
                        }
                    } else {
                        result.note = '⚠️ ساختار غیراستاندارد';
                    }
                } catch (parseError) {
                    result.note = '❌ JSON نامعتبر';
                    result.error = parseError.message;
                }
            } else {
                result.note = `❌ خطای ${response.status}`;
                try {
                    const errorData = await response.text();
                    result.error = errorData.substring(0, 100);
                } catch (e) {
                    result.error = 'نمی‌تواند متن خطا را خواند';
                }
            }
            
        } catch (error) {
            result.status = 'ERR';
            result.error = error.message;
            result.note = '❌ خطای شبکه';
        }
        
        results.push(result);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Display results in console.table
    console.log('\n📊 نتایج کشف API Dashboard:\n');
    console.table(results.map(r => ({
        'مسیر': r.path,
        'متد': r.method,
        'احراز هویت': r.authRequired,
        'وضعیت': r.status,
        'نوع محتوا': r.contentType || 'N/A',
        'نتیجه': r.note
    })));
    
    // Detailed view
    console.log('\n📋 جزئیات کامل:\n');
    results.forEach(r => {
        console.log(`\n🔹 ${r.path}`);
        console.log(`   توضیح: ${r.description}`);
        console.log(`   وضعیت: ${r.status} - ${r.note}`);
        if (r.responseKeys) {
            console.log(`   کلیدهای پاسخ: ${r.responseKeys}`);
        }
        if (r.error) {
            console.log(`   خطا: ${r.error}`);
        }
    });
    
    // Generate compatibility matrix data
    const matrixData = results.map(r => ({
        'FE Module': 'dashboard.js',
        'Endpoint': r.path,
        'Status': r.status,
        'Content-Type': r.contentType || 'N/A',
        'Keys': r.responseKeys || 'N/A',
        'Auth': r.authRequired,
        'Result': r.note
    }));
    
    console.log('\n📄 داده برای compatibility-matrix-dashboard.md:');
    console.log(JSON.stringify(matrixData, null, 2));
    
    // Summary
    const successful = results.filter(r => r.status === 200).length;
    const authErrors = results.filter(r => r.status === 401 || r.status === 403).length;
    const notFound = results.filter(r => r.status === 404).length;
    const serverErrors = results.filter(r => r.status >= 500).length;
    const networkErrors = results.filter(r => r.status === 'ERR').length;
    
    console.log('\n📈 خلاصه:');
    console.log(`   ✅ موفق: ${successful}/${results.length}`);
    console.log(`   🔒 خطای احراز هویت: ${authErrors}`);
    console.log(`   🚫 یافت نشد: ${notFound}`);
    console.log(`   💥 خطای سرور: ${serverErrors}`);
    console.log(`   ⚠️  خطای شبکه: ${networkErrors}`);
    
    console.log('\n✅ Probe completed!\n');
    
    return matrixData;
})();
