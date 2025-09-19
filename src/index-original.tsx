import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Env } from './types/cloudflare'

// Import modules
import { authRoutes } from './modules/auth/routes'
import { dashboardRoutes } from './modules/dashboard/routes'
import { tradingRoutes } from './modules/trading/routes'
import { portfolioRoutes } from './modules/portfolio/routes'
import { walletRoutes } from './modules/wallet/routes'
import { analyticsRoutes } from './modules/analytics/routes'
import { newsRoutes } from './modules/news/routes'
import { chatRoutes } from './modules/chat/routes'
import { settingsRoutes } from './modules/settings/routes'
import { systemRoutes } from './modules/system/routes'
import { notificationRoutes } from './modules/notifications/routes'

// Import exchange API
import exchangeApiRoutes from './modules/trading/exchange-api'
// Import new Real Exchange API
import realExchangeApiRoutes from './routes/exchange-api'
// Import Exchange Management Routes
import exchangeRoutes from './routes/exchange-routes'
// Import Notification Management Routes
import notificationRoutes from './routes/notification-routes'
// Import Error Handling & Validation Routes
import errorValidationRoutes from './routes/error-validation-routes'
// Import notification API
import notificationApiRoutes from './modules/notifications/notification-api'
// Import system API
import systemApiRoutes from './api/system-api'
// Import AI API
import aiApiRoutes from './api/ai-api'
// Import AI Routes
import aiRoutes from './routes/ai-routes'
// Import Advanced AI Routes
import advancedAIRoutes from './routes/advanced-ai-routes'
// Import Phase 7 Routes
import phase7Routes from './routes/phase7-routes'
// Import Phase 8 Routes  
import phase8Routes from './routes/phase8-routes'
// Import Database Routes
import databaseRoutes from './routes/database-routes'
// Import Database API
import databaseApiRoutes from './api/database-api'
// Import Watchlist API
import watchlistApiRoutes from './api/watchlist-api'
// Import Enhanced Autopilot API
import autopilotApiRoutes from './api/autopilot-api'
// Import Market API
import marketApiRoutes from './api/market-api'
// Import Chart API
import chartApiRoutes from './api/chart-api'
// Import Performance API
import performanceApiRoutes from './api/performance-api'
// Import Alerts API
import alertsApiRoutes from './api/alerts-api'
// Import Widgets API
import widgetsApiRoutes from './api/widgets-api'
// Import Mode API
import modeApiRoutes from './api/mode-api'
// Import Profile API
import profileApiRoutes from './api/profile-api'
// Import Admin Users API
import adminUsersApiRoutes from './api/admin-users-api'
// Import AI Analytics API
import aiAnalyticsApiRoutes from './api/ai-analytics-api'
// Import Portfolio API
import portfolioRoutes from './api/portfolio'
// Import Trading Advanced API
import tradingAdvancedRoutes from './api/trading-advanced'
// Import Artemis Advanced API
import artemisAdvancedRoutes from './api/artemis-advanced'
// Import Monitoring API
import monitoringApiRoutes from './api/monitoring-api'
// Import Chatbot API
import chatbotApiRoutes from './api/chatbot-api'
// Import Advanced AI API
import advancedAIApiRoutes from './api/advanced-ai-api'
// Import AI Config API
import aiConfigApiRoutes from './api/ai-config-api'
// Import Configuration Test API
import configTestRoutes from './modules/system/config-test'
// Import Database API
import databaseApiRoutes from './modules/database/database-api'
// Import Performance Routes
import performanceRoutes from './routes/performance-routes'
// Import Test Routes  
import testRoutes from './routes/test-routes'
// Import Integration Routes - commented out for Cloudflare deployment
// import integrationRoutes from './routes/integration-routes'

// Import AI modules
import { artemisRoutes } from './ai/artemis/routes'
import { agentRoutes } from './ai/agents/routes'
import { predictionRoutes } from './ai/prediction/routes'

const app = new Hono<{ Bindings: Env }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files with no-cache for modules
app.use('/static/modules/*', async (c, next) => {
  // Add strong no-cache headers for development
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  c.header('Pragma', 'no-cache') 
  c.header('Expires', '0')
  c.header('Last-Modified', new Date().toUTCString())
  c.header('ETag', Date.now().toString())
  await next()
}, serveStatic())

// Serve app.js with no-cache
app.use('/static/app.js', async (c, next) => {
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  c.header('Pragma', 'no-cache')
  c.header('Expires', '0')
  c.header('Last-Modified', new Date().toUTCString())
  await next()
}, serveStatic())

// Serve other static files normally
app.use('/static/*', serveStatic())

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/trading', tradingRoutes)
app.route('/api/trading/exchange', exchangeApiRoutes)
// Real Exchange Integration API
app.route('/api/exchange', realExchangeApiRoutes)
// Exchange Management Routes
app.route('/api/exchanges', exchangeRoutes)
// Notification Management Routes
app.route('/api/notifications', notificationRoutes)
// Error Handling & Validation Routes
app.route('/api/system', errorValidationRoutes)
app.route('/api/trading/advanced', tradingAdvancedRoutes)
app.route('/api/notifications', notificationApiRoutes)
app.route('/api/system', systemApiRoutes)
app.route('/api/ai', aiApiRoutes)
// New AI Services Routes
app.route('/api/ai-services', aiRoutes)
// Advanced AI Features Routes
app.route('/api/advanced-ai', advancedAIRoutes)
// Phase 7 Portfolio Intelligence & News Analysis Routes
app.route('/api/phase7', phase7Routes)
// Phase 8 Advanced Trading Intelligence & Backtesting Routes
app.route('/api/phase8', phase8Routes)
// Database Service Routes
app.route('/api', databaseRoutes)
app.route('/api/database', databaseApiRoutes)
app.route('/api/watchlist', watchlistApiRoutes)
app.route('/api/autopilot', autopilotApiRoutes)
app.route('/api/market', marketApiRoutes)
app.route('/api/chart', chartApiRoutes)
app.route('/api/performance', performanceApiRoutes)
app.route('/api/alerts', alertsApiRoutes)
app.route('/api/widgets', widgetsApiRoutes)
app.route('/api/mode', modeApiRoutes)
app.route('/api/profile', profileApiRoutes)
app.route('/api/admin/users', adminUsersApiRoutes)
app.route('/api/ai-analytics', aiAnalyticsApiRoutes)
app.route('/api/portfolio', portfolioRoutes)
app.route('/api/wallet', walletRoutes)
app.route('/api/analytics', analyticsRoutes)
app.route('/api/news', newsRoutes)
app.route('/api/chat', chatRoutes)
app.route('/api/settings', settingsRoutes)
app.route('/api/system', systemRoutes)
app.route('/api/monitoring', monitoringApiRoutes)
app.route('/api/notifications', notificationRoutes)
app.route('/api/chatbot', chatbotApiRoutes)

// Advanced AI API Routes
app.route('/api/ai/advanced', advancedAIApiRoutes)
app.route('/api/ai/config', aiConfigApiRoutes)

// Configuration Test API Routes
app.route('/api/system/config', configTestRoutes)

// Database API Routes
app.route('/api/database', databaseApiRoutes)

// Performance Optimization Routes
app.route('/api/performance', performanceRoutes)

// Testing & Quality Assurance Routes
app.route('/api/tests', testRoutes)

// System Integration Routes - commented out for Cloudflare deployment
// app.route('/api/integration', integrationRoutes)

// AI API Routes
app.route('/api/ai/artemis', artemisRoutes)
app.route('/api/ai/agents', agentRoutes)
app.route('/api/ai/prediction', predictionRoutes)

// Artemis Advanced API Routes
app.route('/api/artemis', artemisAdvancedRoutes)

// Favicon route (to prevent 500 errors)
app.get('/favicon.ico', (c) => {
  // Return a simple 204 No Content response for favicon requests
  return new Response(null, { status: 204 })
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    system: 'TITAN Trading System',
    ai: 'ARTEMIS AI Mother',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Complete AI Management Dashboard (Test + Settings)
app.get('/ai-test', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>داشبورد مدیریت AI - TITAN</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
</head>
<body class="bg-gray-900 text-white" dir="rtl">
    <!-- Navigation Header -->
    <nav class="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                    <i class="fas fa-robot text-blue-400 text-2xl mr-3"></i>
                    <span class="text-xl font-bold">داشبورد مدیریت AI - TITAN</span>
                </div>
                <div class="flex items-center space-x-4 space-x-reverse">
                    <button onclick="switchMainView('ai-management')" id="nav-ai-btn" class="nav-btn active px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i class="fas fa-brain mr-2"></i>
                        مدیریت AI
                    </button>
                    <button onclick="switchMainView('settings')" id="nav-settings-btn" class="nav-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i class="fas fa-cog mr-2"></i>
                        تنظیمات
                    </button>
                    <button onclick="switchMainView('console')" id="nav-console-btn" class="nav-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i class="fas fa-terminal mr-2"></i>
                        Console
                    </button>
                    <a href="/" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                        <i class="fas fa-home mr-2"></i>
                        صفحه اصلی
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- AI Management View -->
        <div id="ai-management-view" class="main-view">
            <div class="mb-6">
                <h1 class="text-3xl font-bold flex items-center">
                    <i class="fas fa-brain text-purple-400 mr-3"></i>
                    مدیریت هوش مصنوعی TITAN
                </h1>
                <p class="text-gray-400 mt-2">کنترل و مدیریت 15 ایجنت AI و سیستم آرتمیس</p>
            </div>
            
            <div id="ai-container" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-center">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p class="text-gray-300">در حال بارگذاری داشبورد مدیریت AI...</p>
                    <button onclick="loadAIModule()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        🔄 بارگذاری مجدد
                    </button>
                </div>
            </div>
        </div>

        <!-- Settings View -->
        <div id="settings-view" class="main-view hidden">
            <div class="mb-6">
                <h1 class="text-3xl font-bold flex items-center">
                    <i class="fas fa-cog text-blue-400 mr-3"></i>
                    تنظیمات سیستم
                </h1>
                <p class="text-gray-400 mt-2">پیکربندی و تنظیمات سیستم TITAN</p>
            </div>
            
            <div id="settings-container">
                <div class="text-center bg-gray-800 rounded-lg p-6">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p class="text-gray-300">در حال بارگذاری تنظیمات...</p>
                </div>
            </div>
        </div>

        <!-- Console View -->
        <div id="console-view" class="main-view hidden">
            <div class="mb-6">
                <h1 class="text-3xl font-bold flex items-center">
                    <i class="fas fa-terminal text-green-400 mr-3"></i>
                    Console & Debug
                </h1>
                <p class="text-gray-400 mt-2">مانیتورینگ و دیباگ سیستم</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- API Tests -->
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-flask text-yellow-400 mr-2"></i>
                        تست‌های API
                    </h2>
                    <div class="space-y-2">
                        <button onclick="testAPI()" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                            <i class="fas fa-play mr-2"></i>
                            تست API Endpoints
                        </button>
                        <button onclick="testAgents()" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                            <i class="fas fa-users mr-2"></i>
                            تست 15 ایجنت AI
                        </button>
                        <button onclick="testArtemis()" class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                            <i class="fas fa-brain mr-2"></i>
                            تست آرتمیس Mother AI
                        </button>
                    </div>
                </div>

                <!-- System Status -->
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-heartbeat text-red-400 mr-2"></i>
                        وضعیت سیستم
                    </h2>
                    <div id="system-status" class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>وضعیت سرور:</span>
                            <span class="text-green-400">✅ آنلاین</span>
                        </div>
                        <div class="flex justify-between">
                            <span>API Backend:</span>
                            <span class="text-yellow-400">🔍 در حال بررسی</span>
                        </div>
                        <div class="flex justify-between">
                            <span>ایجنت‌های AI:</span>
                            <span class="text-yellow-400">🔍 در حال بررسی</span>
                        </div>
                        <div class="flex justify-between">
                            <span>داده‌های Real-time:</span>
                            <span class="text-yellow-400">🔍 در حال بررسی</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Console Output -->
            <div class="mt-6 bg-black rounded-lg p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-green-400 flex items-center">
                        <i class="fas fa-terminal mr-2"></i>
                        Console Output
                    </h2>
                    <button onclick="clearConsole()" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        پاک کردن
                    </button>
                </div>
                <div id="console-output" class="text-green-400 font-mono text-sm max-h-80 overflow-y-auto space-y-1">
                    <div class="text-yellow-400">📟 System Console Ready</div>
                </div>
            </div>
        </div>
    </div>

    <style>
        .nav-btn {
            color: #9CA3AF;
            background: transparent;
        }
        .nav-btn:hover {
            color: #E5E7EB;
            background: #374151;
        }
        .nav-btn.active {
            color: #FFFFFF;
            background: #3B82F6;
        }
        .main-view {
            display: block;
        }
        .main-view.hidden {
            display: none;
        }
    </style>

    <script>
        let currentView = 'ai-management';

        function log(message, type = 'info') {
            const output = document.getElementById('console-output');
            const timestamp = new Date().toLocaleTimeString('fa-IR');
            const colors = {
                info: 'text-green-400',
                success: 'text-blue-400', 
                error: 'text-red-400',
                warning: 'text-yellow-400'
            };
            const color = colors[type] || 'text-green-400';
            output.innerHTML += \`<div class="\${color}">[\${timestamp}] \${message}</div>\`;
            output.scrollTop = output.scrollHeight;
        }

        function switchMainView(viewName) {
            // Hide all views
            document.querySelectorAll('.main-view').forEach(view => {
                view.classList.add('hidden');
            });
            
            // Show selected view
            document.getElementById(viewName + '-view').classList.remove('hidden');
            
            // Update navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById('nav-' + viewName.replace('-', '') + '-btn').classList.add('active');
            
            currentView = viewName;
            
            // Load content if needed
            if (viewName === 'settings') {
                loadSettingsModule();
            }
        }
        
        function clearConsole() {
            document.getElementById('console-output').innerHTML = '<div class="text-yellow-400">📟 Console Cleared</div>';
        }
        
        async function loadAIModule() {
            log('🔄 شروع بارگذاری ماژول AI Management...', 'info');
            
            const container = document.getElementById('ai-container');
            container.innerHTML = \`
                <div class="text-center">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p class="text-gray-300">در حال بارگذاری ماژول...</p>
                </div>
            \`;
            
            try {
                const script = document.createElement('script');
                script.src = '/static/modules/ai-management.js?v=' + Date.now();
                
                script.onload = function() {
                    log('✅ فایل JavaScript بارگذاری شد', 'success');
                    
                    setTimeout(() => {
                        if (window.TitanModules && window.TitanModules.AIManagement) {
                            log('✅ ماژول AI Management یافت شد', 'success');
                            
                            try {
                                container.innerHTML = window.TitanModules.AIManagement.render();
                                window.TitanModules.AIManagement.init();
                                log('🎉 داشبورد AI Management بارگذاری شد!', 'success');
                            } catch (error) {
                                log('❌ خطا در رندر: ' + error.message, 'error');
                            }
                        } else {
                            log('❌ ماژول AI Management یافت نشد', 'error');
                        }
                    }, 200);
                };
                
                script.onerror = function() {
                    log('❌ خطا در بارگذاری فایل JavaScript', 'error');
                };
                
                document.head.appendChild(script);
            } catch (error) {
                log('❌ خطا در loadAIModule: ' + error.message, 'error');
            }
        }

        async function loadSettingsModule() {
            log('🔄 بارگذاری سیستم تنظیمات مدولار جدید...', 'info');
            
            const container = document.getElementById('settings-container');
            
            try {
                // Load the new modular settings loader
                const script = document.createElement('script');
                script.src = '/static/modules/settings/settings-loader.js?v=' + Date.now();
                
                script.onload = function() {
                    log('✅ Settings Loader بارگذاری شد', 'success');
                    
                    setTimeout(async () => {
                        if (window.TitanModules && window.TitanModules.SettingsModule) {
                            try {
                                log('✅ ایجاد instance از SettingsModule جدید...', 'info');
                                
                                // Create instance of new modular SettingsModule
                                const settingsInstance = new window.TitanModules.SettingsModule();
                                
                                // Set global instance for onclick handlers
                                window.settingsModule = settingsInstance;
                                
                                log('✅ در حال دریافت محتوای تنظیمات مدولار...', 'info');
                                
                                // Get the settings content (async method)
                                const content = await settingsInstance.getContent();
                                container.innerHTML = content;
                                
                                // Initialize the settings
                                await settingsInstance.initialize();
                                
                                log('🎉 سیستم تنظیمات مدولار راه‌اندازی شد!', 'success');
                                log('📦 تب‌های Trading و System حالا با Module System کار می‌کنند', 'success');
                                log('🚀 MEXC Exchange اضافه شد - No KYC required!', 'success');
                                
                            } catch (error) {
                                log('❌ خطا در راه‌اندازی تنظیمات مدولار: ' + error.message, 'error');
                                container.innerHTML = \`
                                    <div class="bg-red-900 rounded-lg p-6 text-center">
                                        <p class="text-red-400 mb-4">خطا در بارگذاری سیستم تنظیمات: \${error.message}</p>
                                        <button onclick="switchMainView('settings')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                            🔄 تلاش مجدد
                                        </button>
                                    </div>
                                \`;
                            }
                        } else {
                            log('❌ ماژول SettingsModule جدید یافت نشد', 'error');
                            container.innerHTML = \`
                                <div class="bg-red-900 rounded-lg p-6 text-center">
                                    <p class="text-red-400 mb-4">سیستم تنظیمات مدولار یافت نشد</p>
                                    <button onclick="switchMainView('settings')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        🔄 تلاش مجدد
                                    </button>
                                </div>
                            \`;
                        }
                    }, 300);
                };
                
                script.onerror = function() {
                    log('❌ خطا در بارگذاری فایل settings-optimized.js', 'error');
                    container.innerHTML = \`
                        <div class="bg-red-900 rounded-lg p-6 text-center">
                            <p class="text-red-400 mb-4">خطا در بارگذاری فایل تنظیمات</p>
                            <button onclick="switchMainView('settings')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                🔄 تلاش مجدد
                            </button>
                        </div>
                    \`;
                };
                
                document.head.appendChild(script);
            } catch (error) {
                log('❌ خطا در loadSettingsModule: ' + error.message, 'error');
            }
        }
        
        async function testAPI() {
            log('🔍 تست API endpoints...', 'info');
            updateSystemStatus('API Backend', 'testing');
            
            try {
                const response = await axios.get('/api/ai-analytics/agents');
                if (response.data && response.data.agents) {
                    log(\`✅ API موفق: \${response.data.agents.length} ایجنت بارگذاری شد\`, 'success');
                    updateSystemStatus('API Backend', 'success');
                } else {
                    log('⚠️ API پاسخ داد اما ساختار نامعلوم', 'warning');
                    updateSystemStatus('API Backend', 'warning');
                }
            } catch (error) {
                log('❌ خطای API: ' + error.message, 'error');
                updateSystemStatus('API Backend', 'error');
            }
        }

        async function testAgents() {
            log('🔍 تست 15 ایجنت AI...', 'info');
            updateSystemStatus('ایجنت‌های AI', 'testing');
            
            try {
                const response = await axios.get('/api/ai-analytics/agents');
                const agents = response.data.agents;
                
                if (agents && agents.length === 15) {
                    const activeAgents = agents.filter(a => a.status === 'active').length;
                    log(\`✅ تست ایجنت‌ها موفق: \${activeAgents}/15 ایجنت فعال\`, 'success');
                    updateSystemStatus('ایجنت‌های AI', 'success');
                } else {
                    log(\`⚠️ تعداد ایجنت‌ها نامعلوم: \${agents ? agents.length : 0}\`, 'warning');
                    updateSystemStatus('ایجنت‌های AI', 'warning');
                }
            } catch (error) {
                log('❌ خطا در تست ایجنت‌ها: ' + error.message, 'error');
                updateSystemStatus('ایجنت‌های AI', 'error');
            }
        }

        async function testArtemis() {
            log('🔍 تست آرتمیس Mother AI...', 'info');
            updateSystemStatus('داده‌های Real-time', 'testing');
            
            try {
                const response = await axios.get('/api/ai-analytics/system/overview');
                if (response.data.success && response.data.data.artemis) {
                    const artemis = response.data.data.artemis;
                    log(\`✅ آرتمیس فعال - وضعیت: \${artemis.status}\`, 'success');
                    updateSystemStatus('داده‌های Real-time', 'success');
                } else {
                    log('⚠️ آرتمیس پاسخ داد اما ساختار نامعلوم', 'warning');
                    updateSystemStatus('داده‌های Real-time', 'warning');
                }
            } catch (error) {
                log('❌ خطا در تست آرتمیس: ' + error.message, 'error');
                updateSystemStatus('داده‌های Real-time', 'error');
            }
        }

        function updateSystemStatus(component, status) {
            const statusElement = document.getElementById('system-status');
            const components = {
                'API Backend': 'API Backend:',
                'ایجنت‌های AI': 'ایجنت‌های AI:',
                'داده‌های Real-time': 'داده‌های Real-time:'
            };
            
            const statusIcons = {
                'success': '✅ فعال',
                'error': '❌ خطا',
                'warning': '⚠️ هشدار', 
                'testing': '🔍 در حال تست'
            };
            
            const statusColors = {
                'success': 'text-green-400',
                'error': 'text-red-400', 
                'warning': 'text-yellow-400',
                'testing': 'text-blue-400'
            };
            
            // Update the specific component status
            const rows = statusElement.querySelectorAll('div');
            rows.forEach(row => {
                const text = row.querySelector('span').textContent;
                if (components[component] && text.includes(components[component])) {
                    const statusSpan = row.querySelector('span:last-child');
                    statusSpan.textContent = statusIcons[status] || status;
                    statusSpan.className = statusColors[status] || 'text-gray-400';
                }
            });
        }
        
        // Auto-load AI module on page load
        document.addEventListener('DOMContentLoaded', function() {
            log('🚀 سیستم آماده - شروع بارگذاری خودکار', 'info');
            setTimeout(loadAIModule, 1000);
            
            // Auto-test APIs after a delay
            setTimeout(() => {
                testAPI();
                setTimeout(testAgents, 2000);
                setTimeout(testArtemis, 4000);
            }, 3000);
        });
    </script>
</body>
</html>`)
})

// Clear cache utility page
app.get('/clear-cache', (c) => {
  return c.html(`<!DOCTYPE html>
<html>
<head>
    <title>Clear Cache - TITAN</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; background: #2a2a2a; padding: 30px; border-radius: 10px; }
        button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin: 10px; }
        button:hover { background: #2563eb; }
        .success { color: #10b981; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 TITAN Cache Manager</h1>
        <p>برای مشاهده آخرین تغییرات، کش مرورگر را پاک کنید</p>
        
        <div>
            <button onclick="clearAllCache()">🗑️ پاک کردن کامل کش</button>
            <button onclick="hardRefresh()">🔄 Refresh سخت</button>
            <button onclick="reloadModules()">📦 بارگذاری مجدد ماژول‌ها</button>
        </div>
        
        <div id="status"></div>
        
        <div style="margin-top: 30px;">
            <a href="/" style="text-decoration: none;">
                <button>🏠 بازگشت به صفحه اصلی</button>
            </a>
        </div>
    </div>

    <script>
        function showStatus(message, isSuccess = true) {
            const status = document.getElementById('status');
            status.innerHTML = \`<div class="\${isSuccess ? 'success' : 'error'}">\${message}</div>\`;
            setTimeout(() => status.innerHTML = '', 3000);
        }

        async function clearAllCache() {
            try {
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                }
                localStorage.clear();
                sessionStorage.clear();
                showStatus('✅ کش با موفقیت پاک شد!');
                setTimeout(() => window.location.href = '/', 2000);
            } catch (error) {
                showStatus('❌ خطا: ' + error.message, false);
            }
        }

        function hardRefresh() {
            showStatus('🔄 در حال انجام Hard Refresh...');
            setTimeout(() => window.location.reload(true), 1000);
        }

        async function reloadModules() {
            showStatus('📦 در حال بارگذاری مجدد ماژول‌ها...');
            const timestamp = Date.now();
            const moduleFiles = ['/static/modules/module-loader.js', '/static/modules/alerts.js', '/static/modules/multi-exchange.js', '/static/modules/rbac.js', '/static/modules/backup-automation.js', '/static/modules/advanced-security.js', '/static/modules/settings-optimized.js', '/static/app.js'];
            
            for (const file of moduleFiles) {
                const script = document.createElement('script');
                script.src = file + '?v=' + timestamp;
                document.head.appendChild(script);
            }
            
            setTimeout(() => {
                showStatus('✅ ماژول‌ها بارگذاری مجدد شدند!');
                setTimeout(() => window.location.href = '/', 2000);
            }, 1500);
        }
    </script>
</body>
</html>`)
})

// Direct Artemis access route
app.get('/artemis.html', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>آرتمیس AI - سیستم هوش مصنوعی</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet">
        <style>
            body { font-family: 'Vazir', sans-serif; }
            .scrollbar-thin::-webkit-scrollbar { width: 4px; }
            .scrollbar-thin::-webkit-scrollbar-track { background: #374151; }
            .scrollbar-thin::-webkit-scrollbar-thumb { background: #6b7280; border-radius: 2px; }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            .agent-card { transition: all 0.3s ease; }
            .agent-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
            .typing-indicator { animation: pulse 1.5s infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        </style>
    </head>
    <body class="bg-gray-900 text-white min-h-screen" dir="rtl">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="flex items-center justify-center mb-4">
                    <i class="fas fa-brain text-6xl text-purple-500 ml-4"></i>
                    <h1 class="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        آرتمیس AI
                    </h1>
                </div>
                <p class="text-gray-400 text-lg">سیستم هوش مصنوعی پیشرفته برای تحلیل و پیش‌بینی بازار</p>
                <div id="ai-status" class="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-green-900 text-green-300">
                    <div class="w-2 h-2 bg-green-400 rounded-full ml-2 typing-indicator"></div>
                    <span>آرتمیس آنلاین است</span>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-robot text-3xl text-blue-500 mb-3"></i>
                    <h3 class="text-xl font-bold">۵ ایجنت فعال</h3>
                    <p class="text-gray-400">سیستم چند-ایجنته</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-chart-line text-3xl text-green-500 mb-3"></i>
                    <h3 class="text-xl font-bold">پیش‌بینی فعال</h3>
                    <p class="text-gray-400">تحلیل در حال انجام</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-comments text-3xl text-yellow-500 mb-3"></i>
                    <h3 class="text-xl font-bold">چت هوشمند</h3>
                    <p class="text-gray-400">مکالمه با AI</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-shield-alt text-3xl text-purple-500 mb-3"></i>
                    <h3 class="text-xl font-bold">سیستم ایمن</h3>
                    <p class="text-gray-400">حفاظت شده</p>
                </div>
            </div>

            <!-- AI Agents Grid -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold mb-6 text-center">ایجنت‌های هوش مصنوعی</h2>
                <div id="agents-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>

            <!-- Chat Interface -->
            <div class="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 class="text-2xl font-bold mb-4 flex items-center">
                    <i class="fas fa-comments ml-2 text-blue-500"></i>
                    چت با آرتمیس
                </h2>
                <div id="chat-messages" class="bg-gray-900 rounded-lg p-4 h-64 mb-4 overflow-y-auto scrollbar-thin">
                    <div class="text-gray-400 text-center py-8">
                        <i class="fas fa-robot text-4xl mb-2"></i>
                        <p>سلام! من آرتمیس هستم. چطور می‌تونم کمکتون کنم؟</p>
                    </div>
                </div>
                <div class="flex">
                    <input type="text" id="chat-input" placeholder="پیام خود را بنویسید..." 
                           class="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-r-lg text-white focus:ring-2 focus:ring-blue-500">
                    <button id="send-chat" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-l-lg transition">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            <!-- Market Predictions -->
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-4 flex items-center">
                    <i class="fas fa-crystal-ball ml-2 text-purple-500"></i>
                    پیش‌بینی‌های بازار
                </h2>
                <div id="predictions-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>

            <!-- Back to Main App -->
            <div class="text-center mt-8">
                <a href="/" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition">
                    <i class="fas fa-arrow-right ml-2"></i>
                    بازگشت به صفحه اصلی
                </a>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Load AI Agents
            async function loadAgents() {
                try {
                    const response = await axios.get('/api/artemis/agents');
                    const agents = response.data.agents;
                    
                    const agentsGrid = document.getElementById('agents-grid');
                    agentsGrid.innerHTML = agents.map(agent => \`
                        <div class="agent-card bg-gray-700 rounded-lg p-6">
                            <div class="flex items-center mb-4">
                                <i class="fas \${agent.icon} text-2xl \${agent.color} ml-3"></i>
                                <h3 class="text-lg font-bold">\${agent.name}</h3>
                            </div>
                            <p class="text-gray-300 text-sm mb-4">\${agent.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="px-2 py-1 bg-\${agent.statusColor}-900 text-\${agent.statusColor}-300 rounded text-xs">
                                    \${agent.status}
                                </span>
                                <span class="text-xs text-gray-400">\${agent.performance}% کارایی</span>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading agents:', error);
                }
            }

            // Load Market Predictions
            async function loadPredictions() {
                try {
                    const response = await axios.get('/api/artemis/predictions');
                    const predictions = response.data.predictions;
                    
                    const predictionsGrid = document.getElementById('predictions-grid');
                    predictionsGrid.innerHTML = predictions.map(pred => \`
                        <div class="bg-gray-700 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold">\${pred.symbol}</span>
                                <span class="text-\${pred.trend === 'صعودی' ? 'green' : pred.trend === 'نزولی' ? 'red' : 'yellow'}-400">
                                    \${pred.trend}
                                </span>
                            </div>
                            <p class="text-sm text-gray-300 mb-2">\${pred.analysis}</p>
                            <div class="flex justify-between text-xs text-gray-400">
                                <span>اعتماد: \${pred.confidence}%</span>
                                <span>\${pred.timeframe}</span>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading predictions:', error);
                }
            }

            // Chat functionality
            let chatHistory = [];
            
            async function sendMessage() {
                const input = document.getElementById('chat-input');
                const message = input.value.trim();
                if (!message) return;
                
                // Add user message
                addChatMessage(message, 'user');
                input.value = '';
                
                try {
                    const response = await axios.post('/api/artemis/chat', {
                        message: message,
                        history: chatHistory
                    });
                    
                    // Add AI response
                    addChatMessage(response.data.response, 'ai');
                    chatHistory.push({ user: message, ai: response.data.response });
                } catch (error) {
                    addChatMessage('متأسفم، در حال حاضر مشکلی در ارتباط وجود دارد.', 'ai');
                }
            }
            
            function addChatMessage(message, sender) {
                const chatMessages = document.getElementById('chat-messages');
                const messageDiv = document.createElement('div');
                messageDiv.className = \`mb-3 \${sender === 'user' ? 'text-left' : 'text-right'}\`;
                messageDiv.innerHTML = \`
                    <div class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg \${
                        sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-100'
                    }">
                        \${message}
                    </div>
                \`;
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Event listeners
            document.getElementById('send-chat').addEventListener('click', sendMessage);
            document.getElementById('chat-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            
            // Initialize
            document.addEventListener('DOMContentLoaded', () => {
                loadAgents();
                loadPredictions();
                
                // Refresh data every 30 seconds
                setInterval(() => {
                    loadAgents();
                    loadPredictions();
                }, 30000);
            });
        </script>
    </body>
    </html>
  `)
})

// Main application
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تایتان - سیستم معاملات خودکار</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <link href="/static/chatbot.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  'vazir': ['Vazir', 'sans-serif'],
                }
              }
            }
          }
        </script>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet">
    </head>
    <body class="bg-gray-900 text-white font-vazir" dir="rtl">
        <!-- Login Screen -->
        <div id="loginScreen" class="min-h-screen flex items-center justify-center">
            <div class="bg-gray-800 p-8 rounded-lg shadow-2xl w-96">
                <div class="text-center mb-8">
                    <div class="text-6xl mb-4">🚀</div>
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        تایتان
                    </h1>
                    <p class="text-gray-400 mt-2">سیستم معاملات خودکار</p>
                    <p class="text-sm text-blue-400 mt-1">مجهز به هوش مصنوعی آرتمیس</p>
                </div>
                
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری</label>
                        <input type="text" id="username" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
                        <input type="password" id="password" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <button type="submit" class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition duration-300">
                        ورود به سیستم
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-500 text-xs">
                        برای دسترسی به سیستم، ابتدا وارد شوید
                    </p>
                </div>
            </div>
        </div>

        <!-- Main Application (Hidden by default) -->
        <div id="mainApp" class="hidden">
            <div id="app" class="min-h-screen bg-gray-900">
                <!-- Navigation will be loaded here -->
            </div>
        </div>
        
        <!-- Loading indicator for modules -->
        <div id="module-loading-indicator" style="display: none; position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 9999;">
            Loading module...
        </div>
        
        <!-- Loading Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        
        <!-- Module Loader (Non-breaking addition) -->
        <script src="/static/modules/module-loader.js?v=${Date.now()}"></script>
        
        <!-- Main Application (Existing - unchanged) -->
        <script src="/static/app.js?v=${Date.now()}"></script>
        
        <!-- Floating Sidebar Icons -->
        <div id="floating-sidebar" style="display: none;">
            <!-- System Status Icon -->
            <div id="system-status-icon" class="fixed top-1/2 right-4 transform -translate-y-1/2 z-50" onclick="showSystemStatus()">
                <div class="bg-gray-800 rounded-full p-3 shadow-lg border border-gray-700 hover:bg-gray-700 transition-all cursor-pointer group">
                    <div class="relative">
                        <i class="fas fa-heartbeat text-green-400 text-lg"></i>
                        <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <!-- Tooltip -->
                    <div class="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        وضعیت سیستم: آنلاین
                        <div class="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </div>
            </div>

            <!-- Chatbot Icon -->
            <div id="chatbot-toggle-icon" class="fixed bottom-20 right-4 z-50" onclick="toggleChatbotSafely()">
                <div class="bg-purple-600 rounded-full p-4 shadow-lg hover:bg-purple-700 transition-all cursor-pointer group animate-bounce">
                    <i class="fas fa-robot text-white text-xl"></i>
                    <!-- Message indicator -->
                    <div id="chatbot-notification" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold hidden">
                        !
                    </div>
                    <!-- Tooltip -->
                    <div class="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        چت با آرتمیس AI
                        <div class="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Artemis AI Chatbot -->
        <script src="/static/modules/chatbot.js?v=${Date.now()}"></script>
        <script src="/static/modules/chatbot-integration.js?v=${Date.now()}"></script>
        
        <!-- Floating Icons Script -->
        <script>
            // Show floating icons only when logged in
            function showFloatingSidebar() {
                const sidebar = document.getElementById('floating-sidebar');
                if (sidebar) {
                    sidebar.style.display = 'block';
                }
            }
            
            function hideFloatingSidebar() {
                const sidebar = document.getElementById('floating-sidebar');
                if (sidebar) {
                    sidebar.style.display = 'none';
                }
            }
            
            // Safe chatbot toggle function
            function toggleChatbotSafely() {
                console.log('🤖 Chatbot toggle clicked');
                
                // Try multiple methods to toggle chatbot
                if (window.artemisAI && typeof window.artemisAI.toggleChatbot === 'function') {
                    window.artemisAI.toggleChatbot();
                    console.log('✅ Chatbot toggled via artemisAI');
                } else if (window.ArtemisAIChatbot) {
                    // Initialize if not exists
                    if (!window.artemisAI) {
                        window.artemisAI = new window.ArtemisAIChatbot();
                        console.log('🔄 Chatbot initialized');
                    }
                    if (window.artemisAI.toggleChatbot) {
                        window.artemisAI.toggleChatbot();
                        console.log('✅ Chatbot toggled after initialization');
                    }
                } else {
                    // Fallback: show alert or try to load module
                    console.warn('⚠️ Chatbot not ready, attempting to initialize...');
                    showChatbotFallback();
                }
            }
            
            // Fallback chatbot display
            function showChatbotFallback() {
                // Create a simple modal if chatbot is not available
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = \`
                    <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-robot text-purple-400 text-2xl mr-3"></i>
                            <h3 class="text-xl font-bold text-white">آرتمیس AI</h3>
                        </div>
                        <p class="text-gray-300 mb-4">دستیار هوش مصنوعی در حال بارگذاری است...</p>
                        <div class="flex justify-end gap-3">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                                بستن
                            </button>
                            <button onclick="retryLoadChatbot()" 
                                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
                                تلاش مجدد
                            </button>
                        </div>
                    </div>
                \`;
                document.body.appendChild(modal);
            }
            
            // Retry loading chatbot
            function retryLoadChatbot() {
                document.querySelector('.fixed.inset-0')?.remove();
                
                // Force reload chatbot scripts
                const script1 = document.createElement('script');
                script1.src = '/static/modules/chatbot.js?v=' + Date.now();
                script1.onload = () => {
                    const script2 = document.createElement('script');
                    script2.src = '/static/modules/chatbot-integration.js?v=' + Date.now();
                    script2.onload = () => {
                        setTimeout(() => {
                            if (window.artemisAI) {
                                window.artemisAI.toggleChatbot();
                            }
                        }, 1000);
                    };
                    document.head.appendChild(script2);
                };
                document.head.appendChild(script1);
            }
            
            // Enhanced system status modal
            async function showSystemStatus() {
                console.log('💻 System status clicked');
                
                // Create loading modal first
                const loadingModal = document.createElement('div');
                loadingModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                loadingModal.innerHTML = \`
                    <div class="bg-gray-800 rounded-lg p-6 max-w-lg mx-4">
                        <div class="flex items-center justify-center">
                            <i class="fas fa-spinner fa-spin text-blue-400 text-2xl mr-3"></i>
                            <span class="text-white">در حال بارگذاری اطلاعات سیستم...</span>
                        </div>
                    </div>
                \`;
                document.body.appendChild(loadingModal);
                
                try {
                    // Fetch enhanced system status
                    const response = await axios.get('/api/autopilot/system/enhanced-status');
                    const data = response.data.data;
                    
                    // Remove loading modal
                    loadingModal.remove();
                    
                    // Create enhanced system status modal  
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
                    
                    // System health status icon and color
                    const healthIcons = {
                        good: { icon: 'fa-check-circle', color: 'green' },
                        warning: { icon: 'fa-exclamation-triangle', color: 'yellow' },
                        critical: { icon: 'fa-times-circle', color: 'red' }
                    };
                    
                    const healthStatus = healthIcons[data.systemHealth.overall] || healthIcons.good;
                    
                    // Format uptime
                    const uptime = data.systemMetrics.uptime;
                    const uptimeText = \`\${uptime.days} روز، \${uptime.hours} ساعت، \${uptime.minutes} دقیقه\`;
                    
                    modal.innerHTML = \`
                        <div class="bg-gray-800 rounded-lg max-w-4xl mx-4 my-8 max-h-screen overflow-y-auto">
                            <!-- Header -->
                            <div class="flex items-center justify-between p-6 border-b border-gray-700">
                                <div class="flex items-center">
                                    <i class="fas \${healthStatus.icon} text-\${healthStatus.color}-400 text-2xl mr-3"></i>
                                    <h3 class="text-xl font-bold text-white">وضعیت سیستم TITAN</h3>
                                </div>
                                <button onclick="this.closest('.fixed').remove()" 
                                        class="text-gray-400 hover:text-white text-xl">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <!-- System Health Overview -->
                            <div class="p-6 border-b border-gray-700">
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div class="bg-gray-700 rounded p-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-gray-400">سرور</span>
                                            <div class="flex items-center">
                                                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                <span class="text-green-400">آنلاین</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-gray-700 rounded p-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-gray-400">API</span>
                                            <div class="flex items-center">
                                                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                <span class="text-green-400">فعال</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-gray-700 rounded p-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-gray-400">آرتمیس AI</span>
                                            <div class="flex items-center">
                                                <div class="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                                                <span class="text-purple-400">آماده</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-gray-700 rounded p-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-gray-400">دیتابیس</span>
                                            <div class="flex items-center">
                                                <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                                                <span class="text-blue-400">متصل</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Current Activities -->
                            <div class="p-6 border-b border-gray-700">
                                <h4 class="text-lg font-bold text-white mb-4 flex items-center">
                                    <i class="fas fa-chart-line text-blue-400 mr-2"></i>
                                    فعالیت‌های جاری سیستم
                                </h4>
                                <div class="space-y-2 max-h-48 overflow-y-auto">
                                    \${data.currentActivities.slice(0, 8).map(activity => {
                                        const priorityColors = {
                                            high: 'red',
                                            medium: 'yellow', 
                                            low: 'gray'
                                        };
                                        const color = priorityColors[activity.priority] || 'gray';
                                        const typeIcons = {
                                            trading_opportunity: 'fa-coins',
                                            ai_performance: 'fa-brain',
                                            price_update: 'fa-chart-line',
                                            strategy_activity: 'fa-cogs'
                                        };
                                        const icon = typeIcons[activity.type] || 'fa-info-circle';
                                        
                                        return \`
                                            <div class="bg-gray-700 rounded p-3 text-sm">
                                                <div class="flex items-start">
                                                    <i class="fas \${icon} text-\${color}-400 mt-1 mr-2"></i>
                                                    <div class="flex-1">
                                                        <div class="text-white">\${activity.message}</div>
                                                        <div class="text-gray-400 text-xs mt-1">
                                                            \${new Date(activity.timestamp).toLocaleTimeString('fa-IR')}
                                                        </div>
                                                    </div>
                                                    <span class="px-2 py-1 bg-\${color}-900 text-\${color}-300 rounded text-xs">
                                                        \${activity.priority === 'high' ? 'مهم' : activity.priority === 'medium' ? 'متوسط' : 'عادی'}
                                                    </span>
                                                </div>
                                            </div>
                                        \`;
                                    }).join('')}
                                </div>
                            </div>
                            
                            <!-- System Metrics -->
                            <div class="p-6 border-b border-gray-700">
                                <h4 class="text-lg font-bold text-white mb-4 flex items-center">
                                    <i class="fas fa-tachometer-alt text-green-400 mr-2"></i>
                                    متریک‌های سیستم
                                </h4>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <!-- CPU Usage -->
                                    <div class="bg-gray-700 rounded p-4">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-gray-400 text-sm">CPU</span>
                                            <span class="text-white font-bold">\${data.systemMetrics.cpu.usage}%</span>
                                        </div>
                                        <div class="w-full bg-gray-600 rounded-full h-2 mb-2">
                                            <div class="bg-\${data.systemMetrics.cpu.usage > 70 ? 'red' : data.systemMetrics.cpu.usage > 50 ? 'yellow' : 'green'}-400 h-2 rounded-full" 
                                                 style="width: \${data.systemMetrics.cpu.usage}%"></div>
                                        </div>
                                        <div class="text-xs text-gray-400">
                                            \${data.systemMetrics.cpu.cores} هسته | \${data.systemMetrics.cpu.frequency}
                                        </div>
                                    </div>
                                    
                                    <!-- Memory Usage -->
                                    <div class="bg-gray-700 rounded p-4">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-gray-400 text-sm">RAM</span>
                                            <span class="text-white font-bold">\${data.systemMetrics.memory.usagePercentage}%</span>
                                        </div>
                                        <div class="w-full bg-gray-600 rounded-full h-2 mb-2">
                                            <div class="bg-\${data.systemMetrics.memory.usagePercentage > 80 ? 'red' : data.systemMetrics.memory.usagePercentage > 60 ? 'yellow' : 'green'}-400 h-2 rounded-full" 
                                                 style="width: \${data.systemMetrics.memory.usagePercentage}%"></div>
                                        </div>
                                        <div class="text-xs text-gray-400">
                                            \${Math.round(data.systemMetrics.memory.used / 1024)} GB / \${Math.round(data.systemMetrics.memory.total / 1024)} GB
                                        </div>
                                    </div>
                                    
                                    <!-- Disk Usage -->
                                    <div class="bg-gray-700 rounded p-4">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-gray-400 text-sm">دیسک</span>
                                            <span class="text-white font-bold">\${data.systemMetrics.disk.usagePercentage}%</span>
                                        </div>
                                        <div class="w-full bg-gray-600 rounded-full h-2 mb-2">
                                            <div class="bg-\${data.systemMetrics.disk.usagePercentage > 80 ? 'red' : data.systemMetrics.disk.usagePercentage > 60 ? 'yellow' : 'green'}-400 h-2 rounded-full" 
                                                 style="width: \${data.systemMetrics.disk.usagePercentage}%"></div>
                                        </div>
                                        <div class="text-xs text-gray-400">
                                            \${Math.round(data.systemMetrics.disk.used / 1024)} GB / \${Math.round(data.systemMetrics.disk.total / 1024)} GB
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Trading Statistics -->
                            <div class="p-6 border-b border-gray-700">
                                <h4 class="text-lg font-bold text-white mb-4 flex items-center">
                                    <i class="fas fa-chart-bar text-purple-400 mr-2"></i>
                                    آمار معاملات
                                </h4>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div class="bg-gray-700 rounded p-3 text-center">
                                        <div class="text-2xl font-bold text-green-400">\${data.tradingStats.totalTrades}</div>
                                        <div class="text-gray-400">کل معاملات</div>
                                    </div>
                                    <div class="bg-gray-700 rounded p-3 text-center">
                                        <div class="text-2xl font-bold text-blue-400">\${data.tradingStats.successRate.toFixed(1)}%</div>
                                        <div class="text-gray-400">نرخ موفقیت</div>
                                    </div>
                                    <div class="bg-gray-700 rounded p-3 text-center">
                                        <div class="text-2xl font-bold text-yellow-400">\${data.tradingStats.activeStrategies}</div>
                                        <div class="text-gray-400">استراتژی فعال</div>
                                    </div>
                                    <div class="bg-gray-700 rounded p-3 text-center">
                                        <div class="text-2xl font-bold text-purple-400">\${data.tradingStats.activeAIAgents}</div>
                                        <div class="text-gray-400">ایجنت AI</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- System Info -->
                            <div class="p-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="bg-gray-700 rounded p-3">
                                        <div class="text-xs text-gray-400 mb-2">آپتایم سیستم</div>
                                        <div class="text-white font-mono">\${uptimeText}</div>
                                    </div>
                                    <div class="bg-gray-700 rounded p-3">
                                        <div class="text-xs text-gray-400 mb-2">آخرین بروزرسانی</div>
                                        <div class="text-white font-mono">\${new Date(data.lastUpdate).toLocaleString('fa-IR')}</div>
                                    </div>
                                </div>
                                
                                <div class="flex justify-between items-center mt-6">
                                    <div class="flex items-center text-sm text-gray-400">
                                        <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                        <span>سیستم در حال بروزرسانی خودکار...</span>
                                    </div>
                                    <button onclick="this.closest('.fixed').remove()" 
                                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                                        بستن
                                    </button>
                                </div>
                            </div>
                        </div>
                    \`;
                    
                    document.body.appendChild(modal);
                    
                    // Auto-refresh every 10 seconds
                    const autoRefreshInterval = setInterval(async () => {
                        if (!document.body.contains(modal)) {
                            clearInterval(autoRefreshInterval);
                            return;
                        }
                        
                        try {
                            const refreshResponse = await axios.get('/api/autopilot/system/enhanced-status');
                            const refreshData = refreshResponse.data.data;
                            
                            // Update activities
                            const activitiesContainer = modal.querySelector('.space-y-2');
                            if (activitiesContainer) {
                                activitiesContainer.innerHTML = refreshData.currentActivities.slice(0, 8).map(activity => {
                                    const priorityColors = { high: 'red', medium: 'yellow', low: 'gray' };
                                    const color = priorityColors[activity.priority] || 'gray';
                                    const typeIcons = {
                                        trading_opportunity: 'fa-coins',
                                        ai_performance: 'fa-brain',
                                        price_update: 'fa-chart-line',
                                        strategy_activity: 'fa-cogs'
                                    };
                                    const icon = typeIcons[activity.type] || 'fa-info-circle';
                                    
                                    return \`
                                        <div class="bg-gray-700 rounded p-3 text-sm">
                                            <div class="flex items-start">
                                                <i class="fas \${icon} text-\${color}-400 mt-1 mr-2"></i>
                                                <div class="flex-1">
                                                    <div class="text-white">\${activity.message}</div>
                                                    <div class="text-gray-400 text-xs mt-1">
                                                        \${new Date(activity.timestamp).toLocaleTimeString('fa-IR')}
                                                    </div>
                                                </div>
                                                <span class="px-2 py-1 bg-\${color}-900 text-\${color}-300 rounded text-xs">
                                                    \${activity.priority === 'high' ? 'مهم' : activity.priority === 'medium' ? 'متوسط' : 'عادی'}
                                                </span>
                                            </div>
                                        </div>
                                    \`;
                                }).join('');
                            }
                            
                            console.log('🔄 System status auto-refreshed');
                        } catch (error) {
                            console.error('❌ Error refreshing system status:', error);
                        }
                    }, 10000);
                    
                } catch (error) {
                    console.error('❌ Error loading system status:', error);
                    loadingModal.remove();
                    
                    // Show error modal
                    const errorModal = document.createElement('div');
                    errorModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    errorModal.innerHTML = \`
                        <div class="bg-gray-800 rounded-lg p-6 max-w-lg mx-4">
                            <div class="flex items-center mb-4">
                                <i class="fas fa-exclamation-triangle text-red-400 text-2xl mr-3"></i>
                                <h3 class="text-xl font-bold text-white">خطا در بارگذاری</h3>
                            </div>
                            <p class="text-gray-300 mb-4">متاسفانه قادر به دریافت اطلاعات سیستم نیستیم. لطفاً دوباره تلاش کنید.</p>
                            <div class="flex justify-end space-x-2">
                                <button onclick="this.closest('.fixed').remove(); showSystemStatus();" 
                                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mr-2">
                                    تلاش مجدد
                                </button>
                                <button onclick="this.closest('.fixed').remove()" 
                                        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                                    بستن
                                </button>
                            </div>
                        </div>
                    \`;
                    document.body.appendChild(errorModal);
                }
            }
                document.body.appendChild(modal);
                
                // Update real system status
                updateSystemStatusInModal();
            }
            
            // Update real system status in modal
            async function updateSystemStatusInModal() {
                try {
                    const response = await axios.get('/api/health');
                    console.log('✅ System status updated:', response.data);
                } catch (error) {
                    console.warn('⚠️ Could not fetch system status:', error);
                }
            }
            
            // Update system status
            async function updateSystemStatus() {
                try {
                    const response = await axios.get('/api/health');
                    const statusIcon = document.querySelector('#system-status-icon i');
                    const tooltip = document.querySelector('#system-status-icon .group-hover\\:opacity-100');
                    
                    if (response.data.status === 'healthy') {
                        statusIcon.className = 'fas fa-heartbeat text-green-400 text-lg';
                        if (tooltip) {
                            tooltip.innerHTML = 'وضعیت سیستم: آنلاین<div class="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>';
                        }
                    } else {
                        statusIcon.className = 'fas fa-exclamation-triangle text-red-400 text-lg';
                        if (tooltip) {
                            tooltip.innerHTML = 'وضعیت سیستم: خطا<div class="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>';
                        }
                    }
                } catch (error) {
                    const statusIcon = document.querySelector('#system-status-icon i');
                    statusIcon.className = 'fas fa-wifi text-red-400 text-lg';
                }
            }
            
            // Initialize floating sidebar when app loads
            window.addEventListener('DOMContentLoaded', function() {
                // Check if user is logged in and show sidebar
                setTimeout(() => {
                    const mainApp = document.getElementById('mainApp');
                    if (mainApp && !mainApp.classList.contains('hidden')) {
                        showFloatingSidebar();
                        updateSystemStatus();
                        // Update status every 30 seconds
                        setInterval(updateSystemStatus, 30000);
                    }
                }, 2000);
            });
            
            // Listen for login/logout events
            document.addEventListener('user-logged-in', function() {
                showFloatingSidebar();
                updateSystemStatus();
                setInterval(updateSystemStatus, 30000);
            });
            
            document.addEventListener('user-logged-out', function() {
                hideFloatingSidebar();
            });
        </script>
    </body>
    </html>
  `)
})

export default app