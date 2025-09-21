// Dashboard Module - Extracted from monolithic app.js
// Maintains 100% compatibility with existing functionality

class DashboardModule {
    constructor() {
        this.currentTimeframe = '1D';
        this.widgets = [];
        this.isInitialized = false;
        this.dashboardData = null;
    }

    /**
     * Initialize dashboard module with real API data - similar to alerts.js pattern
     */
    async initialize() {
        console.log('🎯 Initializing Dashboard module...');
        
        try {
            // Set global reference for onclick handlers
            window.dashboardModule = this;
            
            // Load dashboard data from our API
            await this.loadDashboardData();
            
            // Update last update time
            this.updateLastUpdateTime();
            
            // Initialize charts if Chart.js is available
            if (typeof Chart !== 'undefined') {
                this.initializeCharts();
            } else {
                console.log('⏳ Chart.js not yet available, will initialize later');
            }
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            // Load saved widget configuration
            setTimeout(() => {
                this.loadWidgetConfiguration();
            }, 500); // Wait for DOM to be ready
            
            this.isInitialized = true;
            console.log('✅ Dashboard module initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing dashboard module:', error);
            // Set global reference even on error
            window.dashboardModule = this;
            // Use fallback data
            this.setFallbackData();
            this.isInitialized = true;
        }
    }

    /**
     * Load dashboard data from API - similar to alerts.js pattern
     */
    async loadDashboardData() {
        try {
            console.log('📊 Loading real dashboard data from API...');
            const token = localStorage.getItem('titan_auth_token');
            const response = await axios.get('/api/dashboard/overview', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                this.dashboardData = response.data.data;
                this.updateDashboardUI();
                console.log('✅ Real dashboard data loaded:', this.dashboardData);
            } else {
                throw new Error('API returned success: false');
            }
        } catch (error) {
            console.warn('❌ Dashboard API error, using fallback data:', error);
            // Provide fallback data instead of failing completely
            this.dashboardData = {
                user: { name: 'کاربر', email: '' },
                portfolio: { totalBalance: 125000, dailyChange: 2.3, portfolioCount: 1 },
                market: null,
                mexcAccount: null,
                activities: []
            };
            this.updateDashboardUI();
        }
    }

    /**
     * Update dashboard UI with loaded data - enhanced for real API data
     */
    updateDashboardUI() {
        if (!this.dashboardData) return;

        const data = this.dashboardData;

        try {
            // Update total balance
            const totalBalanceCard = document.getElementById('total-balance-card');
            const balanceChange = document.getElementById('balance-change');
            
            if (totalBalanceCard && data.portfolio) {
                const balance = data.portfolio.totalBalance || 0;
                totalBalanceCard.textContent = `$${balance.toLocaleString()}`;
            }
            
            if (balanceChange && data.portfolio) {
                const change = data.portfolio.dailyChange || 0;
                const changeClass = change >= 0 ? 'text-green-400' : 'text-red-400';
                const changeSymbol = change >= 0 ? '+' : '';
                balanceChange.textContent = `${changeSymbol}${Math.abs(change).toFixed(1)}% امروز`;
                balanceChange.className = `${changeClass} text-sm`;
            }

            // Update portfolio count or active trades 
            const activeTradesCard = document.getElementById('active-trades-card');
            if (activeTradesCard) {
                // Use portfolio count from API data or default
                const activeCount = data.portfolio?.portfolioCount || data.trading?.activeTrades || 0;
                activeTradesCard.textContent = activeCount.toString();
            }

            // Update user info if available
            if (data.user) {
                console.log(`👤 Dashboard loaded for user: ${data.user.name || 'Unknown'}`);
            }

            // Update MEXC account info if available
            if (data.mexcAccount) {
                console.log(`💱 MEXC account balance: $${data.mexcAccount.totalBalanceUSDT || 0}`);
            }

            // Update recent activities
            if (data.activities && data.activities.length > 0) {
                this.updateRecentActivities(data.activities);
            }

            // Update AI stats if available
            if (data.aiInsights) {
                this.updateAIStats();
            }

        } catch (error) {
            console.error('Error updating dashboard UI:', error);
        }
    }

    /**
     * Update recent activities section
     */
    updateRecentActivities(activities) {
        const container = document.getElementById('recent-activities');
        if (!container || !activities || activities.length === 0) return;

        const activitiesHtml = activities.slice(0, 5).map(activity => `
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div class="flex items-center">
                    <div class="text-${activity.amount >= 0 ? 'green' : 'red'}-400 text-lg ml-3">${activity.amount >= 0 ? '📈' : '📉'}</div>
                    <div>
                        <p class="text-white text-sm font-medium">${activity.description}</p>
                        <p class="text-gray-400 text-xs">${this.formatTimeAgo(activity.timestamp)}</p>
                    </div>
                </div>
                <div class="text-${activity.amount >= 0 ? 'green' : 'red'}-400 text-sm font-medium">
                    ${activity.amount >= 0 ? '+' : ''}$${Math.abs(activity.amount).toLocaleString()}
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHtml;
    }

    /**
     * Format timestamp to relative time
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diff = now - activityTime;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'همین الان';
        if (minutes < 60) return `${minutes} دقیقه پیش`;
        if (hours < 24) return `${hours} ساعت پیش`;
        return `${days} روز پیش`;
    }

    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            const now = new Date();
            lastUpdateElement.textContent = now.toLocaleTimeString('fa-IR');
        }
    }

    /**
     * Set fallback data when API fails
     */
    setFallbackData() {
        console.log('⚠️ Using fallback dashboard data');
        
        const totalBalanceCard = document.getElementById('total-balance-card');
        const balanceChange = document.getElementById('balance-change');
        const activeTradesCard = document.getElementById('active-trades-card');
        
        if (totalBalanceCard) totalBalanceCard.textContent = '$125,000';
        if (balanceChange) balanceChange.textContent = '+2.3% امروز';
        if (activeTradesCard) activeTradesCard.textContent = '8';
        
        this.updateLastUpdateTime();
    }

    /**
     * Setup auto-refresh for dashboard data
     */
    setupAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            if (this.isInitialized) {
                this.loadDashboardData();
            }
        }, 30000);
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        // Initialize portfolio chart if canvas exists
        const portfolioCanvas = document.getElementById('portfolioChart');
        if (portfolioCanvas && this.dashboardData?.portfolio?.allocation) {
            this.renderPortfolioChart(this.dashboardData.portfolio.allocation);
        }
    }

    /**
     * Render portfolio chart
     */
    renderPortfolioChart(allocation) {
        const canvas = document.getElementById('portfolioChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear existing chart
        if (window.portfolioChart) {
            window.portfolioChart.destroy();
        }

        const labels = allocation.map(item => item.symbol || item.name);
        const data = allocation.map(item => item.percentage || item.value);
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        window.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
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
                            padding: 10
                        }
                    }
                }
            }
        });
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
                        <button onclick="window.dashboardModule.showWidgetLibrary()" 
                                class="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center text-lg hover:scale-105 transition-all"
                                title="افزودن ویجت">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button onclick="window.dashboardModule.refreshData()" 
                                class="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="بروزرسانی">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button onclick="window.dashboardModule.clearAllWidgets()" 
                                class="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="پاک کردن همه ویجت‌ها">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="window.dashboardModule.resetToDefault()" 
                                class="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="بازنشانی پیش‌فرض">
                            <i class="fas fa-undo"></i>
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
                            <button onclick="window.dashboardModule.showWidgetLibrary()" 
                                    class="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center text-lg active:scale-95 transition-all"
                                    title="افزودن ویجت">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button onclick="window.dashboardModule.refreshData()" 
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
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
            console.log('💾 Widget configuration saved:', config);
        } catch (error) {
            console.error('Error saving widget configuration:', error);
        }
    }

    /**
     * Remove widget from dashboard
     */
    removeWidget(widgetElement) {
        try {
            if (widgetElement) {
                widgetElement.remove();
                // Save configuration after removal
                this.saveWidgetConfiguration();
                console.log('🗑️ Widget removed and configuration saved');
                
                // Show success message
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('ویجت حذف شد', 'info');
                }
            }
        } catch (error) {
            console.error('Error removing widget:', error);
        }
    }

    /**
     * Load saved widget configuration
     */
    loadWidgetConfiguration() {
        try {
            const saved = localStorage.getItem('dashboard_widgets');
            if (!saved) {
                console.log('📋 No saved widget configuration found');
                return;
            }

            const config = JSON.parse(saved);
            console.log('📋 Loading saved widget configuration:', config);
            
            // Get dashboard grid container
            const container = document.getElementById('dashboard-grid');
            if (!container) {
                console.warn('Dashboard grid container not found');
                return;
            }

            // Clear existing widgets except default ones if any
            const existingWidgets = container.querySelectorAll('[data-widget-type]');
            existingWidgets.forEach(widget => {
                if (!widget.hasAttribute('data-default')) {
                    widget.remove();
                }
            });

            // Add widgets from saved configuration
            config.forEach(widgetConfig => {
                if (widgetConfig.type) {
                    this.addWidget(widgetConfig.type);
                }
            });
            
            console.log('✅ Widget configuration loaded successfully');
        } catch (error) {
            console.error('Error loading widget configuration:', error);
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
            // Fetch AI data from API with authentication
            const token = localStorage.getItem('titan_auth_token');
            const response = await fetch('/api/ai-analytics/agents', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
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

    /**
     * Refresh dashboard data - called by UI buttons
     */
    async refreshData() {
        console.log('🔄 Refreshing dashboard data...');
        try {
            await this.loadDashboardData();
            this.updateLastUpdateTime();
            console.log('✅ Dashboard data refreshed');
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
        }
    }

    /**
     * Show widget library with all available widgets
     */
    showWidgetLibrary() {
        console.log('📦 Opening widget library...');
        
        // Define available widgets with descriptions
        const availableWidgets = [
            {
                type: 'price-tracker',
                name: 'ردیاب قیمت',
                description: 'نمایش قیمت‌های لحظه‌ای ارزهای دیجیتال',
                icon: 'fas fa-chart-line'
            },
            {
                type: 'portfolio-summary', 
                name: 'خلاصه پورتفولیو',
                description: 'اطلاعات کلی و عملکرد پورتفولیو شما',
                icon: 'fas fa-wallet'
            },
            {
                type: 'trading-signals',
                name: 'سیگنال‌های معاملاتی', 
                description: 'سیگنال‌های خرید و فروش بر اساس تحلیل تکنیکال',
                icon: 'fas fa-bullseye'
            },
            {
                type: 'market-news',
                name: 'اخبار بازار',
                description: 'آخرین اخبار و تحلیل‌های بازار ارز دیجیتال',
                icon: 'fas fa-newspaper'
            },
            {
                type: 'performance-chart',
                name: 'نمودار عملکرد',
                description: 'نمودار عملکرد پورتفولیو در بازه‌های زمانی مختلف',
                icon: 'fas fa-chart-area'
            },
            {
                type: 'active-trades',
                name: 'معاملات فعال',
                description: 'لیست معاملات باز و در حال انجام',
                icon: 'fas fa-exchange-alt'
            },
            {
                type: 'ai-insights',
                name: 'بینش‌های آرتمیس',
                description: 'تحلیل‌ها و پیشنهادات هوش مصنوعی آرتمیس',
                icon: 'fas fa-robot'
            },
            {
                type: 'alerts-summary',
                name: 'خلاصه هشدارها',
                description: 'وضعیت هشدارهای قیمت و نوتیفیکیشن‌ها',
                icon: 'fas fa-bell'
            }
        ];

        // Create modal HTML
        const modalHTML = `
            <div id="widget-library-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b border-gray-700">
                        <h2 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-th-large text-blue-400"></i>
                            کتابخانه ویجت‌ها
                        </h2>
                        <button onclick="document.getElementById('widget-library-modal').remove()" 
                                class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6 overflow-y-auto max-h-96">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${availableWidgets.map(widget => `
                                <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600 hover:border-blue-500"
                                     onclick="window.dashboardModule.addWidgetFromLibrary('${widget.type}'); document.getElementById('widget-library-modal').remove();">
                                    <div class="flex items-center gap-3 mb-3">
                                        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <i class="${widget.icon} text-white"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">${widget.name}</h3>
                                        </div>
                                    </div>
                                    <p class="text-gray-300 text-sm leading-relaxed">${widget.description}</p>
                                    <div class="mt-3 flex justify-end">
                                        <span class="text-blue-400 text-sm font-medium hover:text-blue-300">
                                            <i class="fas fa-plus mr-1"></i>
                                            افزودن
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-750">
                        <div class="text-gray-400 text-sm">
                            <i class="fas fa-info-circle mr-1"></i>
                            ${availableWidgets.length} ویجت موجود
                        </div>
                        <button onclick="document.getElementById('widget-library-modal').remove()" 
                                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                            بستن
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add click outside to close
        setTimeout(() => {
            const modal = document.getElementById('widget-library-modal');
            const modalContent = modal.querySelector('.bg-gray-800');
            modal.addEventListener('click', (e) => {
                if (!modalContent.contains(e.target)) {
                    modal.remove();
                }
            });
        }, 100);
    }

    /**
     * Add widget from library (called from modal)
     */
    addWidgetFromLibrary(widgetType) {
        console.log(`📦 Adding widget from library: ${widgetType}`);
        this.addWidget(widgetType);
    }

    /**
     * Clear all custom widgets
     */
    clearAllWidgets() {
        try {
            const container = document.getElementById('dashboard-widgets-container');
            if (!container) return;

            // Confirm before clearing
            if (!confirm('آیا مطمئن هستید که می‌خواهید تمام ویجت‌های اضافه شده را حذف کنید؟')) {
                return;
            }

            // Remove all custom widgets (keep only default ones)
            const customWidgets = container.querySelectorAll('[data-widget-type]:not([data-default])');
            customWidgets.forEach(widget => widget.remove());

            // Clear saved configuration
            localStorage.removeItem('dashboard_widgets');
            
            console.log('🗑️ All custom widgets cleared');
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('تمام ویجت‌ها پاک شدند', 'info');
            }
        } catch (error) {
            console.error('Error clearing widgets:', error);
        }
    }

    /**
     * Reset dashboard to default layout
     */
    resetToDefault() {
        try {
            // Confirm before resetting
            if (!confirm('آیا مطمئن هستید که می‌خواهید داشبورد را به حالت پیش‌فرض برگردانید؟')) {
                return;
            }

            // Clear all widgets
            this.clearAllWidgets();

            // Add default widgets
            const defaultWidgets = ['portfolio-summary', 'price-tracker', 'trading-signals'];
            
            setTimeout(() => {
                defaultWidgets.forEach(widgetType => {
                    this.addWidget(widgetType);
                });
                console.log('🔄 Dashboard reset to default layout');
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('داشبورد به حالت پیش‌فرض بازنشانی شد', 'success');
                }
            }, 100);

        } catch (error) {
            console.error('Error resetting dashboard:', error);
        }
    }
}

// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.DashboardModule = DashboardModule;

// Create global instance for easy access
window.dashboardModule = null;