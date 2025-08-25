// Dashboard Module - Extracted from monolithic app.js
// Maintains 100% compatibility with existing functionality

class DashboardModule {
    constructor() {
        this.currentTimeframe = '1D';
        this.widgets = [];
        this.isInitialized = false;
    }

    /**
     * Get dashboard content HTML
     * Extracted from original getDashboardContent() method
     */
    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Dashboard Toolbar -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
                <!-- Desktop Header -->
                <div class="hidden sm:flex items-center justify-between p-4">
                    <div class="flex items-center gap-4">
                        <h1 class="text-xl font-bold text-white">داشبورد شخصی</h1>
                        <span class="text-sm text-gray-400">آخرین بروزرسانی: <span id="last-update">در حال بارگذاری...</span></span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="dashboardModule.showWidgetLibrary()" 
                                class="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center text-lg hover:scale-105 transition-all"
                                title="افزودن ویجت">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button onclick="app.refreshDashboard()" 
                                class="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="بروزرسانی">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <div class="hidden md:flex items-center gap-2">
                            <span class="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                                <i class="fas fa-arrows-alt mr-1"></i>
                                کشیدن برای جابجایی
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Header -->
                <div class="sm:hidden p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h1 class="text-lg font-bold text-white">داشبورد</h1>
                        <div class="flex items-center gap-2">
                            <button onclick="dashboardModule.showWidgetLibrary()" 
                                    class="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center text-lg active:scale-95 transition-all"
                                    title="افزودن ویجت">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button onclick="app.refreshDashboard()" 
                                    class="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center active:scale-95 transition-all"
                                    title="بروزرسانی">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-xs text-gray-400 bg-gray-700/30 px-3 py-2 rounded-lg text-center">
                        <i class="fas fa-hand-paper mr-1"></i>
                        لمس و کشیدن برای جابجایی ویجت‌ها
                    </div>
                </div>
            </div>

            <!-- Dashboard Widgets Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-widgets-container">
                <!-- Total Balance Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">موجودی کل</p>
                            <p id="total-balance-card" class="text-2xl font-bold text-white">$125,000</p>
                            <p id="balance-change" class="text-green-400 text-sm">+2.3% امروز</p>
                        </div>
                        <div class="text-green-400 text-3xl">💰</div>
                    </div>
                </div>

                <!-- Active Trades Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">معاملات فعال</p>
                            <p id="active-trades-card" class="text-2xl font-bold text-white">8</p>
                            <p class="text-blue-400 text-sm">نرخ موفقیت: 75%</p>
                        </div>
                        <div class="text-blue-400 text-3xl">📈</div>
                    </div>
                </div>

                <!-- Artemis Status Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">وضعیت آرتمیس</p>
                            <p class="text-2xl font-bold text-white">85%</p>
                            <p class="text-purple-400 text-sm">اعتماد بالا</p>
                        </div>
                        <div class="text-purple-400 text-3xl">🧠</div>
                    </div>
                </div>

                <!-- AI Analytics Widget -->
                <div class="dashboard-widget bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-700 shadow-lg hover:border-purple-600 transition-all duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <p class="text-purple-200 text-sm">هوش مصنوعی TITAN</p>
                            <p class="text-2xl font-bold text-white" id="ai-agents-count">15 Agent</p>
                            <p class="text-purple-300 text-sm" id="ai-performance-summary">میانگین عملکرد: 87%</p>
                        </div>
                        <div class="text-purple-300 text-3xl">🤖</div>
                    </div>
                    
                    <!-- Quick AI Stats -->
                    <div class="grid grid-cols-3 gap-2 mb-3">
                        <div class="text-center">
                            <div class="text-sm font-bold text-green-400" id="ai-active-count">12</div>
                            <div class="text-xs text-purple-200">فعال</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm font-bold text-yellow-400" id="ai-training-count">2</div>
                            <div class="text-xs text-purple-200">آموزش</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm font-bold text-red-400" id="ai-standby-count">1</div>
                            <div class="text-xs text-purple-200">آماده باش</div>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <button onclick="dashboardModule.openAIManagement()" 
                            class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-brain mr-2"></i>مدیریت AI
                    </button>
                </div>
            </div>

            <!-- Charts and Analytics Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Portfolio Chart -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">نمودار پورتفولیو</h3>
                        <button onclick="this.expandChart('portfolio')" class="text-gray-400 hover:text-white text-sm">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                    <div class="h-64">
                        <canvas id="portfolioChart" width="400" height="200"></canvas>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">فعالیت‌های اخیر</h3>
                        <button onclick="app.loadModule('trading')" class="text-gray-400 hover:text-white text-sm">
                            مشاهده همه
                        </button>
                    </div>
                    <div id="recent-activities" class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div class="flex items-center">
                                <div class="text-green-400 text-lg ml-3">📈</div>
                                <div>
                                    <p class="text-white text-sm font-medium">خرید BTC</p>
                                    <p class="text-gray-400 text-xs">2 دقیقه پیش</p>
                                </div>
                            </div>
                            <div class="text-green-400 text-sm font-medium">+$1,250</div>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div class="flex items-center">
                                <div class="text-red-400 text-lg ml-3">📉</div>
                                <div>
                                    <p class="text-white text-sm font-medium">فروش ETH</p>
                                    <p class="text-gray-400 text-xs">5 دقیقه پیش</p>
                                </div>
                            </div>
                            <div class="text-red-400 text-sm font-medium">-$890</div>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div class="flex items-center">
                                <div class="text-blue-400 text-lg ml-3">🔄</div>
                                <div>
                                    <p class="text-white text-sm font-medium">تبدیل USDT</p>
                                    <p class="text-gray-400 text-xs">8 دقیقه پیش</p>
                                </div>
                            </div>
                            <div class="text-blue-400 text-sm font-medium">$500</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Initialize dashboard functionality
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize charts if available
            await this.initializeCharts();
            
            // Setup drag and drop
            this.setupDragAndDrop();
            
            // Load dashboard data
            await this.loadData();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            this.isInitialized = true;
            console.log('✅ Dashboard module initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
        }
    }

    /**
     * Initialize charts
     */
    async initializeCharts() {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded yet, will initialize charts later');
            return;
        }

        const canvas = document.getElementById('portfolioChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Bitcoin', 'Ethereum', 'Others'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6'],
                    borderWidth: 2,
                    borderColor: '#374151'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.dashboard-widget');
        
        widgets.forEach(widget => {
            widget.draggable = true;
            
            widget.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', widget.id || 'widget');
                widget.classList.add('opacity-50');
            });
            
            widget.addEventListener('dragend', (e) => {
                widget.classList.remove('opacity-50');
            });
        });
    }

    /**
     * Load dashboard data
     */
    async loadData() {
        try {
            // Simulate API calls - replace with real API endpoints
            await this.updateStats();
            await this.updateActivities();
            
            // Update last update time
            const lastUpdate = document.getElementById('last-update');
            if (lastUpdate) {
                lastUpdate.textContent = new Date().toLocaleTimeString('fa-IR');
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    /**
     * Update dashboard statistics
     */
    async updateStats() {
        // Simulate real data updates
        const totalBalance = document.getElementById('total-balance-card');
        const balanceChange = document.getElementById('balance-change');
        const activeTrades = document.getElementById('active-trades-card');

        if (totalBalance) {
            // Add animation for number changes
            this.animateNumber(totalBalance, 125000, '$');
        }

        // Update AI Analytics Widget
        await this.updateAIStats();
    }

    /**
     * Update recent activities
     */
    async updateActivities() {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        // Activities already rendered in HTML, could be made dynamic here
    }

    /**
     * Setup auto-refresh
     */
    setupAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            this.loadData();
        }, 30000);
    }

    /**
     * Animate number changes
     */
    animateNumber(element, targetValue, prefix = '') {
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            element.textContent = prefix + currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Expand chart to full view
     */
    expandChart(chartType) {
        // This could load the advanced portfolio module
        if (window.moduleLoader) {
            window.moduleLoader.loadModule('portfolio');
        }
    }

    /**
     * Refresh dashboard
     */
    async refresh() {
        await this.loadData();
        if (this.portfolioChart) {
            this.portfolioChart.update();
        }
    }

    /**
     * Show widget library modal
     */
    showWidgetLibrary() {
        try {
            // Create modal if it doesn't exist
            let modal = document.getElementById('widget-library-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'widget-library-modal';
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center p-4';
                document.body.appendChild(modal);
            }

            const availableWidgets = [
                {
                    id: 'price-tracker',
                    name: 'ردیاب قیمت',
                    description: 'نمایش قیمت لحظه‌ای ارزهای مختلف',
                    icon: 'fa-chart-line',
                    category: 'market'
                },
                {
                    id: 'portfolio-summary',
                    name: 'خلاصه پورتفولیو',
                    description: 'نمایش کلی دارایی‌ها و سود/زیان',
                    icon: 'fa-wallet',
                    category: 'portfolio'
                },
                {
                    id: 'trading-signals',
                    name: 'سیگنال‌های معاملاتی',
                    description: 'آخرین سیگنال‌های هوش مصنوعی',
                    icon: 'fa-bullseye',
                    category: 'trading'
                },
                {
                    id: 'market-news',
                    name: 'اخبار بازار',
                    description: 'آخرین اخبار و تحلیل‌ها',
                    icon: 'fa-newspaper',
                    category: 'news'
                },
                {
                    id: 'performance-chart',
                    name: 'نمودار عملکرد',
                    description: 'نمودار عملکرد پورتفولیو در دوره‌های مختلف',
                    icon: 'fa-chart-area',
                    category: 'analytics'
                },
                {
                    id: 'active-trades',
                    name: 'معاملات فعال',
                    description: 'لیست معاملات در حال انجام',
                    icon: 'fa-exchange-alt',
                    category: 'trading'
                },
                {
                    id: 'ai-insights',
                    name: 'بینش‌های هوش مصنوعی',
                    description: 'توصیه‌ها و تحلیل‌های آرتمیس',
                    icon: 'fa-robot',
                    category: 'ai'
                },
                {
                    id: 'alerts-summary',
                    name: 'خلاصه هشدارها',
                    description: 'آخرین هشدارها و اعلان‌ها',
                    icon: 'fa-bell',
                    category: 'alerts'
                }
            ];

            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-white">🧩 کتابخانه ویجت‌ها</h3>
                        <button onclick="dashboardModule.hideWidgetLibrary()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto">
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${availableWidgets.map(widget => `
                                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all cursor-pointer"
                                         onclick="dashboardModule.addWidget('${widget.id}')">
                                        <div class="flex items-center gap-3 mb-2">
                                            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <i class="fas ${widget.icon} text-white"></i>
                                            </div>
                                            <div>
                                                <h4 class="text-white font-medium">${widget.name}</h4>
                                                <span class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">${widget.category}</span>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-400">${widget.description}</p>
                                        <div class="mt-3 flex justify-end">
                                            <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm">
                                                <i class="fas fa-plus mr-1"></i>افزودن
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
        } catch (error) {
            console.error('Widget library error:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در بارگذاری کتابخانه ویجت‌ها', 'error');
            }
        }
    }

    /**
     * Hide widget library modal
     */
    hideWidgetLibrary() {
        const modal = document.getElementById('widget-library-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    /**
     * Add widget to dashboard
     */
    async addWidget(widgetType) {
        try {
            console.log(`Adding widget: ${widgetType}`);
            
            // Get widget container
            const container = document.getElementById('dashboard-widgets-container');
            if (!container) {
                throw new Error('Dashboard container not found');
            }

            // Create widget element
            const widgetElement = document.createElement('div');
            widgetElement.className = 'dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300';
            widgetElement.dataset.widgetType = widgetType;
            
            // Generate widget content based on type
            const widgetContent = this.generateWidgetContent(widgetType);
            widgetElement.innerHTML = widgetContent;
            
            // Add to dashboard
            container.appendChild(widgetElement);
            
            // Close modal
            this.hideWidgetLibrary();
            
            // Show success message
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('ویجت با موفقیت اضافه شد', 'success');
            }
            
            // Save widget configuration
            this.saveWidgetConfiguration();
            
        } catch (error) {
            console.error('Error adding widget:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در افزودن ویجت', 'error');
            }
        }
    }

    /**
     * Generate widget content based on type
     */
    generateWidgetContent(widgetType) {
        const widgets = {
            'price-tracker': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">ردیاب قیمت</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <img src="https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/btc.png" class="w-6 h-6">
                            <span class="text-white">BTC/USDT</span>
                        </div>
                        <div class="text-right">
                            <div class="text-white font-semibold">$43,250</div>
                            <div class="text-green-400 text-sm">+2.34%</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <img src="https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/eth.png" class="w-6 h-6">
                            <span class="text-white">ETH/USDT</span>
                        </div>
                        <div class="text-right">
                            <div class="text-white font-semibold">$2,680</div>
                            <div class="text-red-400 text-sm">-1.23%</div>
                        </div>
                    </div>
                </div>
            `,
            'portfolio-summary': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">خلاصه پورتفولیو</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-white mb-2">$125,430</div>
                    <div class="text-green-400 text-sm mb-4">+5.67% این هفته</div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="bg-gray-700 rounded p-2">
                            <div class="text-gray-400">سود کل</div>
                            <div class="text-green-400 font-semibold">+$6,750</div>
                        </div>
                        <div class="bg-gray-700 rounded p-2">
                            <div class="text-gray-400">دارایی‌ها</div>
                            <div class="text-white font-semibold">8</div>
                        </div>
                    </div>
                </div>
            `,
            'trading-signals': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">سیگنال‌های معاملاتی</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="bg-green-900/30 border border-green-500/30 rounded p-3">
                        <div class="flex items-center justify-between">
                            <span class="text-green-400 font-semibold">خرید BTC</span>
                            <span class="text-green-400 text-sm">قوی</span>
                        </div>
                        <div class="text-gray-400 text-sm mt-1">RSI: 32, MACD: صعودی</div>
                    </div>
                    <div class="bg-yellow-900/30 border border-yellow-500/30 rounded p-3">
                        <div class="flex items-center justify-between">
                            <span class="text-yellow-400 font-semibold">نگهداری ETH</span>
                            <span class="text-yellow-400 text-sm">متوسط</span>
                        </div>
                        <div class="text-gray-400 text-sm mt-1">RSI: 58, حجم: کم</div>
                    </div>
                </div>
            `,
            'market-news': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">اخبار بازار</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="border-l-2 border-blue-500 pl-3">
                        <h4 class="text-white text-sm font-medium">بیت‌کوین به سطح مقاومت مهم رسید</h4>
                        <p class="text-gray-400 text-xs mt-1">تحلیلگران پیش‌بینی می‌کنند...</p>
                        <div class="text-gray-500 text-xs mt-1">2 ساعت پیش</div>
                    </div>
                    <div class="border-l-2 border-green-500 pl-3">
                        <h4 class="text-white text-sm font-medium">اتریوم بروزرسانی جدید دریافت کرد</h4>
                        <p class="text-gray-400 text-xs mt-1">بهبود عملکرد و کاهش هزینه...</p>
                        <div class="text-gray-500 text-xs mt-1">4 ساعت پیش</div>
                    </div>
                </div>
            `,
            'performance-chart': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">نمودار عملکرد</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="h-32 bg-gray-700 rounded flex items-center justify-center">
                    <div class="text-gray-400 text-center">
                        <i class="fas fa-chart-line text-2xl mb-2"></i>
                        <div class="text-sm">نمودار عملکرد</div>
                        <div class="text-xs">Chart.js در حال بارگذاری...</div>
                    </div>
                </div>
            `,
            'active-trades': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">معاملات فعال</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-2">
                    <div class="bg-gray-700 rounded p-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-green-400">خرید BTC</span>
                            <span class="text-white">+2.3%</span>
                        </div>
                        <div class="text-gray-400 text-xs">0.5 BTC @ $42,000</div>
                    </div>
                    <div class="bg-gray-700 rounded p-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-red-400">فروش ETH</span>  
                            <span class="text-white">-0.8%</span>
                        </div>
                        <div class="text-gray-400 text-xs">10 ETH @ $2,700</div>
                    </div>
                </div>
            `,
            'ai-insights': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">بینش‌های آرتمیس</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="bg-blue-900/30 border border-blue-500/30 rounded p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-robot text-blue-400"></i>
                            <span class="text-blue-400 font-semibold">توصیه آرتمیس</span>
                        </div>
                        <p class="text-gray-300 text-sm">بازار در حال تجمیع است. زمان مناسب برای خرید DCA.</p>
                        <div class="text-gray-500 text-xs mt-2">اطمینان: 87%</div>
                    </div>
                </div>
            `,
            'alerts-summary': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">خلاصه هشدارها</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400 text-sm">هشدارهای فعال</span>
                        <span class="text-white font-semibold">3</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400 text-sm">امروز فعال شده</span>
                        <span class="text-green-400 font-semibold">2</span>
                    </div>
                    <div class="bg-yellow-900/30 border border-yellow-500/30 rounded p-2 mt-3">
                        <div class="text-yellow-400 text-sm font-medium">BTC > $44,000</div>
                        <div class="text-gray-400 text-xs">30 دقیقه پیش</div>
                    </div>
                </div>
            `
        };

        return widgets[widgetType] || `
            <div class="text-center text-gray-400">
                <i class="fas fa-puzzle-piece text-2xl mb-2"></i>
                <div>ویجت ${widgetType}</div>
                <div class="text-xs">در دست توسعه</div>
            </div>
        `;
    }

    /**
     * Save widget configuration
     */
    saveWidgetConfiguration() {
        try {
            const widgets = document.querySelectorAll('[data-widget-type]');
            const config = Array.from(widgets).map(widget => ({
                type: widget.dataset.widgetType,
                position: Array.from(widget.parentElement.children).indexOf(widget)
            }));
            
            localStorage.setItem('dashboard_widgets', JSON.stringify(config));
        } catch (error) {
            console.error('Error saving widget configuration:', error);
        }
    }

    /**
     * Open AI Management from dashboard widget
     */
    openAIManagement() {
        try {
            // Switch to settings tab and then to AI Management
            if (typeof app !== 'undefined' && app.loadModule) {
                app.loadModule('settings').then(() => {
                    // Wait for settings to load, then switch to AI Management tab
                    setTimeout(() => {
                        if (typeof settingsModule !== 'undefined' && settingsModule.switchTab) {
                            settingsModule.switchTab('ai-management');
                        }
                    }, 100);
                });
            } else {
                console.warn('App module loader not available');
            }
        } catch (error) {
            console.error('Error opening AI Management:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در باز کردن مدیریت AI', 'error');
            }
        }
    }

    /**
     * Update AI Analytics Widget with real-time data
     */
    async updateAIStats() {
        try {
            // Fetch AI data from API
            const response = await fetch('/api/ai-analytics/agents');
            if (response.ok) {
                const data = await response.json();
                
                // Update main stats
                const agentsCount = document.getElementById('ai-agents-count');
                const performanceSummary = document.getElementById('ai-performance-summary');
                const activeCount = document.getElementById('ai-active-count');
                const trainingCount = document.getElementById('ai-training-count');
                const standbyCount = document.getElementById('ai-standby-count');

                if (agentsCount) {
                    agentsCount.textContent = `${data.agents.length} Agent`;
                }

                if (performanceSummary) {
                    const avgPerformance = data.agents.reduce((sum, agent) => sum + agent.performance, 0) / data.agents.length;
                    performanceSummary.textContent = `میانگین عملکرد: ${Math.round(avgPerformance)}%`;
                }

                if (activeCount) {
                    const active = data.agents.filter(agent => agent.status === 'active').length;
                    activeCount.textContent = active;
                }

                if (trainingCount) {
                    const training = data.agents.filter(agent => agent.status === 'training').length;
                    trainingCount.textContent = training;
                }

                if (standbyCount) {
                    const standby = data.agents.filter(agent => agent.status === 'standby').length;
                    standbyCount.textContent = standby;
                }

            } else {
                console.warn('Failed to fetch AI analytics data');
            }
        } catch (error) {
            console.error('Error updating AI stats:', error);
            // Fallback to mock data if API fails
            this.setMockAIData();
        }
    }

    /**
     * Set mock AI data for development/fallback
     */
    setMockAIData() {
        const agentsCount = document.getElementById('ai-agents-count');
        const performanceSummary = document.getElementById('ai-performance-summary');
        const activeCount = document.getElementById('ai-active-count');
        const trainingCount = document.getElementById('ai-training-count');
        const standbyCount = document.getElementById('ai-standby-count');

        if (agentsCount) agentsCount.textContent = '15 Agent';
        if (performanceSummary) performanceSummary.textContent = 'میانگین عملکرد: 87%';
        if (activeCount) activeCount.textContent = '12';
        if (trainingCount) trainingCount.textContent = '2';
        if (standbyCount) standbyCount.textContent = '1';
    }
}

// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.DashboardModule = DashboardModule;

// Create global instance for easy access
window.dashboardModule = null;