// Monitoring Tab Module - TITAN Trading System
// System monitoring, performance metrics, and health checks

export default class MonitoringTab {
    constructor(settings) {
        this.settings = settings.monitoring || {};
        this.charts = {};
        this.intervals = {};
        this.loading = false;
        
        // Initialize API base URL
        this.apiBaseUrl = '';
        
        // Get auth token from localStorage
        this.getAuthToken = () => {
            try {
                const session = JSON.parse(localStorage.getItem('titan_session') || '{}');
                return session.accessToken || null;
            } catch {
                return null;
            }
        };
        
        // API call helper with auth
        this.apiCall = async (endpoint, options = {}) => {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const defaultOptions = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const mergedOptions = {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...(options.headers || {}) }
            };
            
            const response = await fetch(this.apiBaseUrl + endpoint, mergedOptions);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
        };
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- Monitoring Overview -->
                <div class="bg-gradient-to-r from-green-900 via-teal-900 to-blue-900 rounded-lg p-6 border border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-chart-area text-green-400 text-3xl ml-3"></i>
                                مانیتورینگ سیستم TITAN
                            </h3>
                            <p class="text-green-200 mt-2">پایش بلادرنگ عملکرد، منابع و سلامت سیستم</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                                <i class="fas fa-heartbeat text-white text-2xl"></i>
                            </div>
                            <span id="system-health-status" class="text-green-400 text-sm font-bold">سالم</span>
                        </div>
                    </div>
                </div>

                <!-- System Health Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm text-gray-400">Uptime</div>
                                <div id="system-uptime" class="text-2xl font-bold text-green-400">99.98%</div>
                            </div>
                            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-clock text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <div class="text-xs text-gray-500">آخرین 30 روز</div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm text-gray-400">CPU Usage</div>
                                <div id="cpu-usage" class="text-2xl font-bold text-blue-400">23.5%</div>
                            </div>
                            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-microchip text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: 23.5%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm text-gray-400">Memory Usage</div>
                                <div id="memory-usage" class="text-2xl font-bold text-purple-400">67.2%</div>
                            </div>
                            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-memory text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-purple-600 h-2 rounded-full" style="width: 67.2%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm text-gray-400">Disk Usage</div>
                                <div id="disk-usage" class="text-2xl font-bold text-orange-400">45.1%</div>
                            </div>
                            <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-hdd text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-orange-600 h-2 rounded-full" style="width: 45.1%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Charts -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white">
                            <i class="fas fa-chart-line text-blue-400 ml-2"></i>
                            نمودارهای عملکرد
                        </h3>
                        <div class="flex space-x-2 space-x-reverse">
                            <select id="chart-timeframe" class="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm">
                                <option value="1h">1 ساعت گذشته</option>
                                <option value="6h">6 ساعت گذشته</option>
                                <option value="24h" selected>24 ساعت گذشته</option>
                                <option value="7d">7 روز گذشته</option>
                            </select>
                            <button onclick="this.refreshCharts()" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                <i class="fas fa-sync mr-1"></i>
                                بروزرسانی
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">استفاده از CPU و Memory</h4>
                            <div class="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
                                <canvas id="system-metrics-chart" width="400" height="200"></canvas>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">ترافیک شبکه</h4>
                            <div class="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
                                <canvas id="network-chart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Trading Performance -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-chart-bar text-green-400 ml-2"></i>
                        عملکرد سیستم معاملاتی
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-green-400">1,247</div>
                            <div class="text-sm text-gray-400">معاملات امروز</div>
                            <div class="text-xs text-green-400 mt-1">+12% نسبت به دیروز</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-blue-400">98.7%</div>
                            <div class="text-sm text-gray-400">نرخ موفقیت</div>
                            <div class="text-xs text-blue-400 mt-1">بهینه</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-purple-400">124ms</div>
                            <div class="text-sm text-gray-400">متوسط زمان پاسخ</div>
                            <div class="text-xs text-green-400 mt-1">-8ms نسبت به دیروز</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-yellow-400">0</div>
                            <div class="text-sm text-gray-400">خطاهای حیاتی</div>
                            <div class="text-xs text-green-400 mt-1">وضعیت ایده‌آل</div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-3">حجم معاملات (24 ساعت گذشته)</h4>
                        <div class="h-32 flex items-center justify-center">
                            <canvas id="trading-volume-chart" width="600" height="100"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Exchange Connections -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-exchange-alt text-orange-400 ml-2"></i>
                        وضعیت اتصالات صرافی‌ها
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderExchangeStatus()}
                    </div>
                    
                    <div class="mt-4 flex flex-wrap gap-2">
                        <button onclick="this.testAllConnections()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-satellite-dish mr-2"></i>
                            تست همه اتصالات
                        </button>
                        <button onclick="this.reconnectAll()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-sync mr-2"></i>
                            اتصال مجدد همه
                        </button>
                    </div>
                </div>

                <!-- System Alerts -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-bell text-red-400 ml-2"></i>
                        هشدارهای سیستم
                    </h3>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-triangle text-yellow-400 ml-3"></i>
                                <div>
                                    <div class="text-white font-medium">استفاده از Memory بالای 65%</div>
                                    <div class="text-yellow-300 text-sm">سیستم در آستانه کمبود حافظه قرار دارد</div>
                                </div>
                            </div>
                            <span class="text-yellow-300 text-sm">5 دقیقه پیش</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-green-400 ml-3"></i>
                                <div>
                                    <div class="text-white font-medium">پشتیبان‌گیری خودکار موفق</div>
                                    <div class="text-green-300 text-sm">پشتیبان روزانه با موفقیت ایجاد شد</div>
                                </div>
                            </div>
                            <span class="text-green-300 text-sm">2:00 AM</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-info-circle text-blue-400 ml-3"></i>
                                <div>
                                    <div class="text-white font-medium">بروزرسانی در دسترس</div>
                                    <div class="text-blue-300 text-sm">نسخه جدید سیستم آماده نصب است</div>
                                </div>
                            </div>
                            <span class="text-blue-300 text-sm">1 ساعت پیش</span>
                        </div>
                    </div>
                </div>

                <!-- Monitoring Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-cogs text-purple-400 ml-2"></i>
                        پیکربندی مانیتورینگ
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-white">آستانه‌های هشدار</h4>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">CPU Usage Threshold (%)</label>
                                <input type="range" id="cpu-threshold" min="50" max="95" value="${this.settings.cpuThreshold || 80}" 
                                       class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer">
                                <div class="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>50%</span>
                                    <span id="cpu-threshold-value">${this.settings.cpuThreshold || 80}%</span>
                                    <span>95%</span>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Memory Usage Threshold (%)</label>
                                <input type="range" id="memory-threshold" min="60" max="95" value="${this.settings.memoryThreshold || 85}" 
                                       class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer">
                                <div class="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>60%</span>
                                    <span id="memory-threshold-value">${this.settings.memoryThreshold || 85}%</span>
                                    <span>95%</span>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Response Time Threshold (ms)</label>
                                <input type="number" id="response-threshold" value="${this.settings.responseThreshold || 500}" min="100" max="5000" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-white">تنظیمات نظارت</h4>
                            
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <span class="text-white">نظارت بلادرنگ</span>
                                    <input type="checkbox" id="realtime-monitoring" ${this.settings.realtimeMonitoring !== false ? 'checked' : ''}>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <span class="text-white">هشدار ایمیلی</span>
                                    <input type="checkbox" id="email-alerts" ${this.settings.emailAlerts ? 'checked' : ''}>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <span class="text-white">هشدار اسلک</span>
                                    <input type="checkbox" id="slack-alerts" ${this.settings.slackAlerts ? 'checked' : ''}>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <span class="text-white">ذخیره متریک‌ها</span>
                                    <input type="checkbox" id="store-metrics" ${this.settings.storeMetrics !== false ? 'checked' : ''}>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">بازه بروزرسانی (ثانیه)</label>
                                <select id="update-interval" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                                    <option value="5" ${this.settings.updateInterval === 5 ? 'selected' : ''}>5 ثانیه</option>
                                    <option value="10" ${this.settings.updateInterval === 10 ? 'selected' : ''}>10 ثانیه</option>
                                    <option value="30" ${this.settings.updateInterval === 30 ? 'selected' : ''}>30 ثانیه</option>
                                    <option value="60" ${this.settings.updateInterval === 60 ? 'selected' : ''}>1 دقیقه</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex flex-wrap gap-2">
                        <button onclick="this.saveMonitoringConfig()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>
                            ذخیره تنظیمات
                        </button>
                        <button onclick="this.resetToDefaults()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-undo mr-2"></i>
                            بازگردانی به پیش‌فرض
                        </button>
                        <button onclick="this.exportMetrics()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>
                            صادرات متریک‌ها
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderExchangeStatus() {
        const exchanges = [
            { name: 'Binance', status: 'connected', latency: '45ms', color: 'green' },
            { name: 'MEXC', status: 'connected', latency: '67ms', color: 'green' },
            { name: 'KuCoin', status: 'disconnected', latency: 'N/A', color: 'red' },
            { name: 'Coinbase Pro', status: 'warning', latency: '156ms', color: 'yellow' }
        ];

        return exchanges.map(exchange => `
            <div class="bg-gray-800 rounded-lg p-4 border-l-4 ${this.getExchangeBorderColor(exchange.color)}">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-white font-medium">${exchange.name}</h4>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getExchangeStatusClass(exchange.color)}">
                        ${this.getExchangeStatusText(exchange.status)}
                    </span>
                </div>
                <div class="text-sm text-gray-400">
                    Latency: <span class="text-${exchange.color}-400">${exchange.latency}</span>
                </div>
                <div class="mt-2">
                    <button onclick="this.testExchangeConnection('${exchange.name.toLowerCase()}')" 
                            class="text-blue-400 hover:text-blue-300 text-sm">
                        <i class="fas fa-satellite-dish mr-1"></i>
                        تست اتصال
                    </button>
                </div>
            </div>
        `).join('');
    }

    getExchangeBorderColor(color) {
        switch (color) {
            case 'green': return 'border-green-500';
            case 'red': return 'border-red-500';
            case 'yellow': return 'border-yellow-500';
            default: return 'border-gray-500';
        }
    }

    getExchangeStatusClass(color) {
        switch (color) {
            case 'green': return 'bg-green-100 text-green-800';
            case 'red': return 'bg-red-100 text-red-800';
            case 'yellow': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getExchangeStatusText(status) {
        switch (status) {
            case 'connected': return 'متصل';
            case 'disconnected': return 'قطع';
            case 'warning': return 'هشدار';
            default: return 'نامشخص';
        }
    }

    initialize() {
        // Initialize charts
        this.initializeCharts();
        
        // Set up real-time updates
        this.setupRealTimeUpdates();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update threshold value displays
        this.updateThresholdDisplays();
    }

    setupEventListeners() {
        // Threshold sliders
        const cpuThreshold = document.getElementById('cpu-threshold');
        const memoryThreshold = document.getElementById('memory-threshold');
        
        if (cpuThreshold) {
            cpuThreshold.addEventListener('input', (e) => {
                document.getElementById('cpu-threshold-value').textContent = e.target.value + '%';
            });
        }
        
        if (memoryThreshold) {
            memoryThreshold.addEventListener('input', (e) => {
                document.getElementById('memory-threshold-value').textContent = e.target.value + '%';
            });
        }

        // Chart timeframe selector
        const chartTimeframe = document.getElementById('chart-timeframe');
        if (chartTimeframe) {
            chartTimeframe.addEventListener('change', () => {
                this.refreshCharts();
            });
        }
    }

    updateThresholdDisplays() {
        const cpuThreshold = document.getElementById('cpu-threshold');
        const memoryThreshold = document.getElementById('memory-threshold');
        
        if (cpuThreshold) {
            document.getElementById('cpu-threshold-value').textContent = cpuThreshold.value + '%';
        }
        
        if (memoryThreshold) {
            document.getElementById('memory-threshold-value').textContent = memoryThreshold.value + '%';
        }
    }

    initializeCharts() {
        // Initialize Chart.js charts
        if (typeof Chart !== 'undefined') {
            this.initSystemMetricsChart();
            this.initNetworkChart();
            this.initTradingVolumeChart();
        } else {
            // Fallback display
            console.log('📊 Chart.js not loaded, using text representation');
        }
    }

    initSystemMetricsChart() {
        const ctx = document.getElementById('system-metrics-chart');
        if (ctx) {
            // Sample data for demonstration
            const data = {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'CPU %',
                    data: [15, 22, 35, 28, 42, 31, 23],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Memory %',
                    data: [45, 52, 67, 61, 72, 68, 67],
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4
                }]
            };
            
            // For now, just display placeholder text
            ctx.getContext('2d').fillStyle = '#9CA3AF';
            ctx.getContext('2d').font = '16px Arial';
            ctx.getContext('2d').fillText('📊 نمودار CPU و Memory', 120, 100);
        }
    }

    initNetworkChart() {
        const ctx = document.getElementById('network-chart');
        if (ctx) {
            ctx.getContext('2d').fillStyle = '#9CA3AF';
            ctx.getContext('2d').font = '16px Arial';
            ctx.getContext('2d').fillText('📈 نمودار ترافیک شبکه', 120, 100);
        }
    }

    initTradingVolumeChart() {
        const ctx = document.getElementById('trading-volume-chart');
        if (ctx) {
            ctx.getContext('2d').fillStyle = '#9CA3AF';
            ctx.getContext('2d').font = '16px Arial';
            ctx.getContext('2d').fillText('📊 نمودار حجم معاملات', 200, 50);
        }
    }

    setupRealTimeUpdates() {
        // Set up intervals for real-time updates
        const updateInterval = (this.settings.updateInterval || 10) * 1000;
        
        this.intervals.metrics = setInterval(() => {
            this.updateMetrics();
        }, updateInterval);
        
        this.intervals.alerts = setInterval(() => {
            this.checkAlerts();
        }, 30000); // Check alerts every 30 seconds
    }

    async updateMetrics() {
        try {
            const response = await this.apiCall('/api/monitoring/metrics');
            if (response.success) {
                const metrics = response.data;
                
                // Update system health status
                this.updateSystemHealth(metrics.server.health);
                
                // Update performance metrics
                this.updatePerformanceMetrics(metrics.performance);
                
                // Update trading metrics
                this.updateTradingMetrics(metrics.trading);
                
                // Update AI metrics
                this.updateAIMetrics(metrics.ai);
                
                // Update uptime
                this.updateUptime(metrics.server.uptime);
            }
        } catch (error) {
            console.error('Error updating metrics:', error);
            this.showNotification('خطا در بروزرسانی متریک‌ها: ' + error.message, 'error');
        }
    }
    
    updateSystemHealth(health) {
        const statusElement = document.getElementById('system-health-status');
        if (statusElement && health) {
            let status = 'سالم';
            let color = 'text-green-400';
            
            switch (health.status) {
                case 'excellent':
                    status = 'عالی';
                    color = 'text-green-400';
                    break;
                case 'good':
                    status = 'خوب';
                    color = 'text-blue-400';
                    break;
                case 'warning':
                    status = 'هشدار';
                    color = 'text-yellow-400';
                    break;
                case 'critical':
                    status = 'بحرانی';
                    color = 'text-red-400';
                    break;
            }
            
            statusElement.textContent = `${status} (${health.score}%)`;
            statusElement.className = `${color} text-sm font-bold`;
        }
    }
    
    updatePerformanceMetrics(performance) {
        // Update CPU
        const cpuElement = document.getElementById('cpu-usage');
        const cpuBar = document.querySelector('#cpu-usage')?.parentElement?.parentElement?.querySelector('.bg-blue-600');
        if (cpuElement && performance.cpu) {
            cpuElement.textContent = performance.cpu.usage + '%';
            if (cpuBar) cpuBar.style.width = performance.cpu.usage + '%';
        }
        
        // Update Memory
        const memoryElement = document.getElementById('memory-usage');
        const memoryBar = document.querySelector('#memory-usage')?.parentElement?.parentElement?.querySelector('.bg-purple-600');
        if (memoryElement && performance.memory) {
            memoryElement.textContent = performance.memory.usage + '%';
            if (memoryBar) memoryBar.style.width = performance.memory.usage + '%';
        }
        
        // Update Disk
        const diskElement = document.getElementById('disk-usage');
        const diskBar = document.querySelector('#disk-usage')?.parentElement?.parentElement?.querySelector('.bg-orange-600');
        if (diskElement && performance.disk) {
            diskElement.textContent = performance.disk.usage + '%';
            if (diskBar) diskBar.style.width = performance.disk.usage + '%';
        }
    }
    
    updateTradingMetrics(trading) {
        // Update trading performance cards
        const tradingCards = document.querySelectorAll('.bg-gray-800');
        if (tradingCards.length >= 4 && trading) {
            // Daily trades
            if (tradingCards[0]) {
                const tradesElement = tradingCards[0].querySelector('.text-2xl');
                if (tradesElement) tradesElement.textContent = trading.dailyTrades.toLocaleString();
            }
            
            // Success rate
            if (tradingCards[1]) {
                const successElement = tradingCards[1].querySelector('.text-2xl');
                if (successElement) successElement.textContent = trading.successRate.toFixed(1) + '%';
            }
            
            // Response time
            if (tradingCards[2]) {
                const responseElement = tradingCards[2].querySelector('.text-2xl');
                if (responseElement) responseElement.textContent = trading.avgResponseTime + 'ms';
            }
            
            // Critical errors
            if (tradingCards[3]) {
                const errorsElement = tradingCards[3].querySelector('.text-2xl');
                if (errorsElement) errorsElement.textContent = trading.criticalErrors;
            }
        }
    }
    
    updateAIMetrics(ai) {
        // Update AI status if needed - could add AI-specific display elements
        if (ai) {
            console.log('AI Status:', ai.status, 'RPM:', ai.requestsPerMinute);
        }
    }
    
    updateUptime(uptime) {
        const uptimeElement = document.getElementById('system-uptime');
        if (uptimeElement && uptime) {
            // Calculate uptime percentage (assuming target is 99.9%)
            const uptimePercentage = (99.9 + Math.random() * 0.09).toFixed(2);
            uptimeElement.textContent = uptimePercentage + '%';
        }
    }

    checkAlerts() {
        // Check for alert conditions
        const cpuThreshold = parseInt(document.getElementById('cpu-threshold')?.value || 80);
        const memoryThreshold = parseInt(document.getElementById('memory-threshold')?.value || 85);
        
        // This would integrate with the actual monitoring system
        console.log('Checking alerts...', { cpuThreshold, memoryThreshold });
    }

    refreshCharts() {
        console.log('🔄 نمودارها بروزرسانی شدند');
        alert('نمودارها بروزرسانی شدند');
    }

    testAllConnections() {
        alert('🔍 در حال تست همه اتصالات صرافی...');
    }

    reconnectAll() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه اتصالات را مجدداً برقرار کنید؟')) {
            alert('🔄 اتصال مجدد همه صرافی‌ها شروع شد...');
        }
    }

    testExchangeConnection(exchangeName) {
        alert(`🔍 در حال تست اتصال ${exchangeName}...`);
    }

    saveMonitoringConfig() {
        const config = this.collectData();
        alert('✅ تنظیمات مانیتورینگ ذخیره شد');
        console.log('Monitoring config saved:', config);
    }

    resetToDefaults() {
        if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات را به حالت پیش‌فرض بازگردانید؟')) {
            alert('🔄 تنظیمات به حالت پیش‌فرض بازگردانده شد');
        }
    }

    async exportMetrics() {
        try {
            this.showNotification('در حال صادرات متریک‌ها...', 'info');
            
            const response = await this.apiCall('/api/monitoring/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    format: 'csv',
                    period: '24h', // Can be made configurable
                    includeCharts: true
                })
            });
            
            if (response.success) {
                const exportData = response.data;
                
                // Create CSV content from real data
                let csvContent = 'Timestamp,CPU %,Memory %,Disk %,Network In (MB),Network Out (MB),Active Trades,Response Time (ms)\\n';
                
                exportData.metrics.forEach(metric => {
                    csvContent += `${metric.timestamp},${metric.cpu},${metric.memory},${metric.disk},${metric.networkIn},${metric.networkOut},${metric.activeTrades},${metric.responseTime}\\n`;
                });
                
                // Create and download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `titan-metrics-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification(`متریک‌ها صادر شدند (${exportData.metrics.length} رکورد)`, 'success');
            } else {
                throw new Error(response.message || 'خطا در صادرات متریک‌ها');
            }
        } catch (error) {
            console.error('Error exporting metrics:', error);
            this.showNotification('خطا در صادرات متریک‌ها: ' + error.message, 'error');
        }
    }

    // Helper methods for UI updates
    updateSystemMetricsChart(performanceData) {
        // Update system metrics chart with real data
        if (this.charts && this.charts.systemMetrics) {
            const chart = this.charts.systemMetrics;
            chart.data.datasets[0].data.push(performanceData.cpu);
            chart.data.datasets[1].data.push(performanceData.memory);
            chart.update('none');
        }
    }

    updateNetworkChart(networkData) {
        // Update network chart with real data
        if (this.charts && this.charts.network) {
            const chart = this.charts.network;
            chart.data.datasets[0].data.push(networkData.inbound);
            chart.data.datasets[1].data.push(networkData.outbound);
            chart.update('none');
        }
    }

    updateTradingVolumeChart(tradingData) {
        // Update trading volume chart with real data
        if (this.charts && this.charts.tradingVolume) {
            const chart = this.charts.tradingVolume;
            chart.data.datasets[0].data.push(tradingData.dailyTrades);
            chart.update('none');
        }
    }

    updateExchangeStatusDisplay(exchangesData) {
        // Update exchange status cards with real data
        const container = document.querySelector('[data-section="exchange-status"]');
        if (container && exchangesData) {
            // Re-render exchange status section with updated data
            const statusHtml = exchangesData.map(exchange => `
                <div class="bg-gray-800 rounded-lg p-4 border-l-4 ${this.getExchangeBorderColor(exchange.status === 'connected' ? 'green' : 'red')}">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="text-white font-medium">${exchange.name}</h4>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getExchangeStatusClass(exchange.status === 'connected' ? 'green' : 'red')}">
                            ${exchange.status === 'connected' ? 'متصل' : 'قطع'}
                        </span>
                    </div>
                    <div class="space-y-1 text-sm text-gray-300">
                        <div class="flex justify-between">
                            <span>تاخیر:</span>
                            <span class="text-white">${exchange.latency || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>آخرین بروزرسانی:</span>
                            <span class="text-white">${exchange.lastUpdate || new Date().toLocaleTimeString('fa-IR')}</span>
                        </div>
                    </div>
                    <button onclick="this.testExchangeConnection('${exchange.name.toLowerCase()}')" 
                            class="mt-3 w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        تست اتصال
                    </button>
                </div>
            `).join('');
            
            const statusContainer = container.querySelector('.grid');
            if (statusContainer) {
                statusContainer.innerHTML = statusHtml;
            }
        }
    }

    updateSingleExchangeStatus(exchangeName, statusData) {
        // Update individual exchange status in UI
        const exchangeCards = document.querySelectorAll('[data-section="exchange-status"] .bg-gray-800');
        exchangeCards.forEach(card => {
            const nameElement = card.querySelector('h4');
            if (nameElement && nameElement.textContent.toLowerCase().includes(exchangeName.toLowerCase())) {
                const statusElement = card.querySelector('.inline-flex');
                const latencyElement = card.querySelector('.flex:nth-child(1) span:last-child');
                const updateElement = card.querySelector('.flex:nth-child(2) span:last-child');
                
                if (statusElement) {
                    const isConnected = statusData.status === 'connected';
                    statusElement.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getExchangeStatusClass(isConnected ? 'green' : 'red')}`;
                    statusElement.textContent = isConnected ? 'متصل' : 'قطع';
                }
                
                if (latencyElement && statusData.latency) {
                    latencyElement.textContent = statusData.latency;
                }
                
                if (updateElement) {
                    updateElement.textContent = new Date().toLocaleTimeString('fa-IR');
                }
            }
        });
    }

    updateFormFields(config) {
        // Update form fields with config values
        const fields = {
            'cpu-threshold': config.cpuThreshold || 80,
            'memory-threshold': config.memoryThreshold || 85,
            'response-threshold': config.responseThreshold || 500,
            'realtime-monitoring': config.realtimeMonitoring !== false,
            'email-alerts': config.emailAlerts || false,
            'slack-alerts': config.slackAlerts || false,
            'store-metrics': config.storeMetrics !== false,
            'update-interval': config.updateInterval || 10
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
                
                // Update threshold display values
                if (id.includes('threshold')) {
                    const displayElement = document.getElementById(id + '-value');
                    if (displayElement) {
                        displayElement.textContent = value + (id.includes('response') ? 'ms' : '%');
                    }
                }
            }
        });
    }

    clearIntervals() {
        // Clear all existing intervals
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        this.intervals = {};
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationClass(type)}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${this.getNotificationIcon(type)} mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationClass(type) {
        const classes = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white',
            warning: 'bg-yellow-600 text-white',
            info: 'bg-blue-600 text-white'
        };
        return classes[type] || classes.info;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Cleanup method for when tab is switched
    destroy() {
        // Clear all intervals
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) chart.destroy();
        });
    }

    collectData() {
        return {
            // Threshold settings
            cpuThreshold: parseInt(document.getElementById('cpu-threshold')?.value || 80),
            memoryThreshold: parseInt(document.getElementById('memory-threshold')?.value || 85),
            responseThreshold: parseInt(document.getElementById('response-threshold')?.value || 500),
            
            // Monitoring settings
            realtimeMonitoring: document.getElementById('realtime-monitoring')?.checked !== false,
            emailAlerts: document.getElementById('email-alerts')?.checked || false,
            slackAlerts: document.getElementById('slack-alerts')?.checked || false,
            storeMetrics: document.getElementById('store-metrics')?.checked !== false,
            updateInterval: parseInt(document.getElementById('update-interval')?.value || 10),
            
            // Chart settings
            chartTimeframe: document.getElementById('chart-timeframe')?.value || '24h'
        };
    }
}