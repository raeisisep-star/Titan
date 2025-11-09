// AI Tab Integration Module
// This file overrides AI Tab methods to use centralized TITAN_AI_API and TITAN_AI_ADAPTERS
//
// Purpose: Fix 404 errors and TypeError issues by:
// 1. Using fetchAgentBlock() instead of direct fetch calls
// 2. Applying adapters to normalize data
// 3. Handling unavailable agents gracefully
//
// Date: 2025-01-11

(function() {
    'use strict';
    
    console.log('🔧 Applying AI Tab Integration Patches...');
    
    // Wait for aiTabInstance to be available
    const checkAndPatch = setInterval(() => {
        if (!window.aiTabInstance) {
            return;
        }
        
        if (!window.TITAN_AI_API || !window.TITAN_AI_ADAPTERS) {
            console.warn('⚠️  TITAN_AI_API or TITAN_AI_ADAPTERS not loaded yet');
            return;
        }
        
        clearInterval(checkAndPatch);
        applyPatches();
    }, 100);
    
    function applyPatches() {
        const instance = window.aiTabInstance;
        
        // Helper: Show "Not Available" modal
        instance.showAgentNotAvailable = function(agentId, agentName) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                    <div class="text-center">
                        <div class="text-6xl mb-4">🚧</div>
                        <h3 class="text-2xl font-bold text-white mb-4">${agentName}</h3>
                        <p class="text-gray-400 mb-6">این ایجنت هنوز نصب نشده یا در حال توسعه است.</p>
                        <p class="text-gray-500 text-sm mb-6">لطفاً منتظر آپدیت‌های آینده باشید.</p>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            متوجه شدم
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        };
        
        // ============================================================================
        // AGENT 01: Technical Analysis Agent
        // ============================================================================
        instance.showAgent01Details = async function() {
            try {
                const block = await window.TITAN_AI_API.fetchAgentBlock(1);
                
                if (!block.available) {
                    this.showAgentNotAvailable(1, 'ایجنت تحلیل تکنیکال (01)');
                    return;
                }
                
                const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(1, block.status);
                const config = window.TITAN_AI_ADAPTERS.adaptAgentConfig(1, block.config);
                const { safeRender, safeFormatNumber } = window.TITAN_AI_ADAPTERS;
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-white">ایجنت تحلیل تکنیکال (01)</h3>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">وضعیت فعلی</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">دقت:</span>
                                        <span class="text-blue-400">${safeRender(status.accuracy, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">اعتماد:</span>
                                        <span class="text-yellow-400">${safeRender(status.confidence, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">وضعیت:</span>
                                        <span class="text-green-400">${safeRender(status.status, 'نامشخص')}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">شاخص‌های فعلی</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">RSI:</span>
                                        <span class="text-cyan-400">${safeFormatNumber(status.indicators?.rsi, 2, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">MACD:</span>
                                        <span class="text-green-400">${safeFormatNumber(status.indicators?.macd, 3, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Bollinger:</span>
                                        <span class="text-yellow-400">${safeRender(status.indicators?.bollinger, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Volume:</span>
                                        <span class="text-pink-400">${safeRender(status.indicators?.volume, 'N/A')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-700 rounded-lg p-4 mb-6">
                            <h4 class="text-lg font-semibold text-white mb-3">سیگنال‌های اخیر</h4>
                            <div class="space-y-2">
                                ${(status.signals && status.signals.length > 0) ? 
                                    status.signals.slice(0, 5).map(sig => `
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-300">${safeRender(sig.type, 'Signal')}</span>
                                            <span class="text-blue-400">${safeRender(sig.value, 'N/A')}</span>
                                        </div>
                                    `).join('') : 
                                    '<p class="text-gray-400 text-sm">هیچ سیگنالی موجود نیست</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="flex justify-end">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                بستن
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            } catch (error) {
                console.error('❌ Error in showAgent01Details:', error);
                window.app?.showAlert('خطا در بارگذاری اطلاعات ایجنت', 'error');
            }
        };
        
        // ============================================================================
        // AGENT 02: Portfolio Risk Management Agent
        // ============================================================================
        instance.showAgent02Details = async function() {
            try {
                const block = await window.TITAN_AI_API.fetchAgentBlock(2);
                
                if (!block.available) {
                    this.showAgentNotAvailable(2, 'ایجنت مدیریت ریسک پرتفولیو (02)');
                    return;
                }
                
                const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(2, block.status);
                const { safeRender, safeFormatNumber, safeFormatPercent } = window.TITAN_AI_ADAPTERS;
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-white">ایجنت مدیریت ریسک پرتفولیو (02)</h3>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">ریسک پرتفولیو</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Value at Risk:</span>
                                        <span class="text-red-400">${safeFormatPercent(status.portfolioRisk?.valueAtRisk, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Exposure:</span>
                                        <span class="text-orange-400">${safeFormatPercent(status.portfolioRisk?.exposure, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">شارپ ریشیو:</span>
                                        <span class="text-blue-400">${safeFormatNumber(status.portfolioRisk?.sharpeRatio, 2, 'N/A')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">توصیه‌های بهینه‌سازی</h4>
                                <div class="space-y-2 text-sm">
                                    ${(status.recommendations && status.recommendations.length > 0) ? 
                                        status.recommendations.slice(0, 3).map(rec => `
                                            <div class="p-2 bg-gray-600 rounded">
                                                <span class="text-gray-200">${safeRender(rec, 'توصیه‌ای موجود نیست')}</span>
                                            </div>
                                        `).join('') : 
                                        '<p class="text-gray-400">هیچ توصیه‌ای موجود نیست</p>'
                                    }
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                بستن
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            } catch (error) {
                console.error('❌ Error in showAgent02Details:', error);
                window.app?.showAlert('خطا در بارگذاری اطلاعات ایجنت', 'error');
            }
        };
        
        // ============================================================================
        // AGENT 03: Market Sentiment Agent
        // ============================================================================
        instance.showAgent03Details = async function() {
            try {
                const block = await window.TITAN_AI_API.fetchAgentBlock(3);
                
                if (!block.available) {
                    this.showAgentNotAvailable(3, 'ایجنت تحلیل احساسات بازار (03)');
                    return;
                }
                
                const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(3, block.status);
                const { safeRender, safeFormatNumber } = window.TITAN_AI_ADAPTERS;
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-white">ایجنت تحلیل احساسات بازار (03)</h3>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">وضعیت کلی بازار</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">امتیاز احساسات:</span>
                                        <span class="text-blue-400">${safeFormatNumber(status.overallMarket?.score, 2, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">روند:</span>
                                        <span class="text-green-400">${safeRender(status.overallMarket?.trend, 'نامشخص')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">منابع احساسات</h4>
                                <div class="space-y-2 text-sm">
                                    ${(status.sources && status.sources.length > 0) ? 
                                        status.sources.slice(0, 3).map(source => `
                                            <div class="flex justify-between">
                                                <span class="text-gray-300">${safeRender(source.name, 'منبع')}</span>
                                                <span class="text-blue-400">${safeFormatNumber(source.score, 2, 'N/A')}</span>
                                            </div>
                                        `).join('') : 
                                        '<p class="text-gray-400">هیچ منبعی موجود نیست</p>'
                                    }
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                بستن
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            } catch (error) {
                console.error('❌ Error in showAgent03Details:', error);
                window.app?.showAlert('خطا در بارگذاری اطلاعات ایجنت', 'error');
            }
        };
        
        // ============================================================================
        // AGENT 04: Portfolio Optimization Agent
        // ============================================================================
        instance.showAgent04Details = async function() {
            try {
                const block = await window.TITAN_AI_API.fetchAgentBlock(4);
                
                if (!block.available) {
                    this.showAgentNotAvailable(4, 'ایجنت بهینه‌سازی پرتفولیو (04)');
                    return;
                }
                
                const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(4, block.status);
                const { safeRender, safeFormatNumber } = window.TITAN_AI_ADAPTERS;
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-white">ایجنت بهینه‌سازی پرتفولیو (04)</h3>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">اطلاعات پرتفولیو</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">ارزش کل:</span>
                                        <span class="text-green-400">$${safeFormatNumber(status.totals?.totalValue, 2, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">تعداد پوزیشن‌ها:</span>
                                        <span class="text-blue-400">${safeRender(status.totals?.positions, 'N/A')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">توصیه‌های بهینه‌سازی</h4>
                                <div class="space-y-2 text-sm">
                                    ${(status.recommendations && status.recommendations.length > 0) ? 
                                        status.recommendations.slice(0, 3).map(rec => `
                                            <div class="p-2 bg-gray-600 rounded">
                                                <span class="text-gray-200">${safeRender(rec, 'توصیه')}</span>
                                            </div>
                                        `).join('') : 
                                        '<p class="text-gray-400">هیچ توصیه‌ای موجود نیست</p>'
                                    }
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                بستن
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            } catch (error) {
                console.error('❌ Error in showAgent04Details:', error);
                window.app?.showAlert('خطا در بارگذاری اطلاعات ایجنت', 'error');
            }
        };
        
        // ============================================================================
        // AGENT 11: Advanced Portfolio Optimization Agent
        // ============================================================================
        instance.showAgent11Details = async function() {
            try {
                const block = await window.TITAN_AI_API.fetchAgentBlock(11);
                
                if (!block.available) {
                    this.showAgentNotAvailable(11, 'ایجنت بهینه‌سازی پیشرفته پرتفولیو (11)');
                    return;
                }
                
                const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(11, block.status);
                const { safeRender, safeFormatNumber } = window.TITAN_AI_ADAPTERS;
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-white">ایجنت بهینه‌سازی پیشرفته (11)</h3>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">Black-Litterman</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Tau:</span>
                                        <span class="text-blue-400">${safeFormatNumber(status.blackLitterman?.tau, 3, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Views:</span>
                                        <span class="text-green-400">${safeRender(status.blackLitterman?.views, 'N/A')}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">بهینه شده:</span>
                                        <span class="text-purple-400">${status.blackLitterman?.optimized ? 'بله' : 'خیر'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">وضعیت بهینه‌سازی</h4>
                                <div class="space-y-2 text-sm">
                                    <p class="text-gray-300">
                                        ${safeRender(status.optimizationStatus, 'اطلاعات موجود نیست')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                بستن
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            } catch (error) {
                console.error('❌ Error in showAgent11Details:', error);
                window.app?.showAlert('خطا در بارگذاری اطلاعات ایجنت', 'error');
            }
        };
        
        // ============================================================================
        // AGENTS 5-10: Show "Not Available" message
        // ============================================================================
        for (let i = 5; i <= 10; i++) {
            const methodName = `showAgent${i.toString().padStart(2, '0')}Details`;
            instance[methodName] = async function() {
                try {
                    const block = await window.TITAN_AI_API.fetchAgentBlock(i);
                    
                    if (!block.available) {
                        this.showAgentNotAvailable(i, `ایجنت ${i}`);
                        return;
                    }
                    
                    // If available, show basic info
                    const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(i, block.status);
                    const { safeRender } = window.TITAN_AI_ADAPTERS;
                    
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    modal.innerHTML = `
                        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-2xl font-bold text-white">ایجنت ${i}</h3>
                                <button onclick="this.closest('.fixed').remove()" 
                                        class="text-gray-400 hover:text-white text-2xl">×</button>
                            </div>
                            
                            <div class="bg-gray-700 rounded-lg p-4 mb-6">
                                <h4 class="text-lg font-semibold text-white mb-3">وضعیت</h4>
                                <p class="text-gray-300">${safeRender(status.status, 'فعال')}</p>
                            </div>
                            
                            <div class="flex justify-end">
                                <button onclick="this.closest('.fixed').remove()" 
                                        class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                    بستن
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) modal.remove();
                    });
                } catch (error) {
                    console.error(`❌ Error in ${methodName}:`, error);
                    window.app?.showAlert('خطا در بارگذاری اطلاعات ایجنت', 'error');
                }
            };
        }
        
        console.log('✅ AI Tab Integration Patches Applied Successfully');
    }
})();
