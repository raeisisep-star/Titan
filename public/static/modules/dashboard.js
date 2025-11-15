// Dashboard Module - Clean 4-Widget Version
// Removed ALL experimental features: AI Agents, Learning, Artemis, Widget Library
// Only contains: Portfolio, Market Overview, System Monitor, Portfolio Chart

class DashboardModule {
    constructor() {
        this.currentTimeframe = '1D';
        this.isInitialized = false;
        this.dashboardData = null;
        this.portfolioChart = null;
        this.refreshInterval = null;
    }

    /**
     * Initialize dashboard module
     */
    async initialize() {
        console.log('🎯 Initializing Dashboard module...');
        
        try {
            // Set global reference for onclick handlers
            window.dashboardModule = this;
            
            // Load dashboard data from comprehensive API
            await this.loadDashboardData();
            
            // Update last update time
            this.updateLastUpdateTime();
            
            // Initialize portfolio chart
            if (typeof Chart !== 'undefined') {
                this.initializePortfolioChart();
            } else {
                console.log('⏳ Chart.js not yet available, will initialize later');
            }
            
            // Setup auto-refresh (30 seconds)
            this.setupAutoRefresh();
            
            this.isInitialized = true;
            console.log('✅ Dashboard module initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing dashboard module:', error);
            window.dashboardModule = this;
            this.isInitialized = true;
        }
    }

    /**
     * Load comprehensive dashboard data from /api/dashboard/comprehensive-real
     */
    async loadDashboardData() {
        try {
            console.log('📊 Loading dashboard data from /api/dashboard/comprehensive-real...');
            
            const response = await axios.get('/api/dashboard/comprehensive-real');
            
            if (!response.data || !response.data.success) {
                console.error('❌ Invalid response from API');
                return;
            }
            
            this.dashboardData = response.data.data;
            console.log('✅ Dashboard data loaded successfully:', this.dashboardData.meta);
            
            // Update all dashboard sections
            this.updatePortfolioSection();
            this.updateMarketSection();
            this.updateSystemMonitorSection();
            this.updatePortfolioChart();
            
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
        }
    }

    /**
     * Update Portfolio Section (Balance, PnL, Win Rate, Sharpe Ratio)
     */
    updatePortfolioSection() {
        if (!this.dashboardData || !this.dashboardData.portfolio) {
            console.warn('⚠️ No portfolio data available');
            return;
        }
        
        const portfolio = this.dashboardData.portfolio;
        
        // Total Balance
        const balanceElement = document.getElementById('total-balance-card');
        if (balanceElement) {
            const balance = portfolio.totalBalance || 0;
            balanceElement.textContent = this.formatCurrency(balance);
            balanceElement.className = `text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`;
        }
        
        // Balance Change (24h)
        const balanceChangeElement = document.getElementById('balance-change');
        if (balanceChangeElement && portfolio.balanceChange24h !== undefined) {
            const change = portfolio.balanceChange24h;
            const changePercent = portfolio.balanceChangePercent24h || 0;
            balanceChangeElement.textContent = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
            balanceChangeElement.className = `text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`;
        }
        
        // Total PnL
        const pnlElement = document.getElementById('total-pnl-card');
        if (pnlElement) {
            const pnl = portfolio.totalPnL || 0;
            pnlElement.textContent = this.formatCurrency(pnl);
            pnlElement.className = `text-xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`;
        }
        
        // Win Rate
        const winRateElement = document.getElementById('win-rate-card');
        if (winRateElement && portfolio.winRate !== undefined) {
            winRateElement.textContent = `${portfolio.winRate.toFixed(1)}%`;
        }
        
        // Sharpe Ratio
        const sharpeElement = document.getElementById('sharpe-ratio-card');
        if (sharpeElement && portfolio.sharpeRatio !== undefined) {
            sharpeElement.textContent = portfolio.sharpeRatio.toFixed(2);
        }
        
        console.log('✅ Portfolio section updated');
    }

    /**
     * Update Market Overview Section (BTC, ETH, Fear & Greed, BTC Dominance)
     */
    updateMarketSection() {
        if (!this.dashboardData || !this.dashboardData.market) {
            console.warn('⚠️ No market data available');
            return;
        }
        
        const market = this.dashboardData.market;
        
        // BTC Price
        const btcElement = document.getElementById('btc-price-card');
        if (btcElement && market.btcPrice) {
            btcElement.textContent = `$${market.btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        // ETH Price
        const ethElement = document.getElementById('eth-price-card');
        if (ethElement && market.ethPrice) {
            ethElement.textContent = `$${market.ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        // Fear & Greed Index
        const fgElement = document.getElementById('fear-greed-card');
        if (fgElement && market.fearGreedIndex !== undefined) {
            const fgi = market.fearGreedIndex;
            let classification = '';
            if (fgi <= 20) classification = 'ترس شدید';
            else if (fgi <= 40) classification = 'ترس';
            else if (fgi <= 60) classification = 'خنثی';
            else if (fgi <= 80) classification = 'طمع';
            else classification = 'طمع شدید';
            
            fgElement.textContent = `${fgi} (${classification})`;
        }
        
        // BTC Dominance
        const btcDomElement = document.getElementById('btc-dominance-card');
        if (btcDomElement && market.btcDominance) {
            btcDomElement.textContent = `${market.btcDominance.toFixed(2)}%`;
        }
        
        console.log('✅ Market section updated');
    }

    /**
     * Update System Monitor Section (Trading Activity + Risk Management)
     */
    updateSystemMonitorSection() {
        if (!this.dashboardData) {
            console.warn('⚠️ No monitor data available');
            return;
        }
        
        const trading = this.dashboardData.trading || {};
        const risk = this.dashboardData.risk || {};
        const system = this.dashboardData.system || {};
        
        // System Health
        const healthElement = document.getElementById('system-health-card');
        if (healthElement) {
            const health = system.health || 'نامشخص';
            healthElement.textContent = health;
            healthElement.className = `text-xl font-bold ${health === 'عالی' ? 'text-green-400' : 'text-yellow-400'}`;
        }
        
        // Today Trades
        const tradesElement = document.getElementById('today-trades-card');
        if (tradesElement && trading.todayTrades !== undefined) {
            tradesElement.textContent = trading.todayTrades.toString();
        }
        
        // Pending Orders
        const pendingElement = document.getElementById('pending-orders-card');
        if (pendingElement && trading.pendingOrders !== undefined) {
            pendingElement.textContent = trading.pendingOrders.toString();
        }
        
        // 24h Volume
        const volumeElement = document.getElementById('volume-24h-card');
        if (volumeElement && trading.volume24h !== undefined) {
            volumeElement.textContent = this.formatCurrency(trading.volume24h);
        }
        
        // Total Exposure
        const exposureElement = document.getElementById('total-exposure-card');
        if (exposureElement && risk.totalExposure !== undefined) {
            exposureElement.textContent = this.formatCurrency(risk.totalExposure);
        }
        
        // Risk Score
        const riskScoreElement = document.getElementById('risk-score-card');
        if (riskScoreElement && risk.riskScore !== undefined) {
            riskScoreElement.textContent = `${risk.riskScore}/100`;
        }
        
        // Current Drawdown
        const drawdownElement = document.getElementById('current-drawdown-card');
        if (drawdownElement && risk.currentDrawdown !== undefined) {
            const drawdown = risk.currentDrawdown;
            drawdownElement.textContent = `${drawdown.toFixed(2)}%`;
            drawdownElement.className = `text-xl font-bold ${Math.abs(drawdown) > 10 ? 'text-red-400' : 'text-orange-400'}`;
        }
        
        console.log('✅ Monitor section updated');
    }

    /**
     * Initialize/Update Portfolio Performance Chart
     */
    initializePortfolioChart() {
        const ctx = document.getElementById('portfolio-chart');
        if (!ctx) {
            console.warn('⚠️ Portfolio chart canvas not found');
            return;
        }
        
        // Hide loading indicator
        const loadingElement = document.getElementById('portfolio-chart-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Destroy existing chart
        if (this.portfolioChart) {
            this.portfolioChart.destroy();
        }
        
        // Get chart data from dashboardData
        let labels = [];
        let dataPoints = [];
        
        if (this.dashboardData && this.dashboardData.chart) {
            labels = this.dashboardData.chart.labels || [];
            dataPoints = this.dashboardData.chart.data || [];
        } else {
            // Default empty chart
            labels = ['روز 1', 'روز 2', 'روز 3', 'روز 4', 'روز 5', 'روز 6', 'روز 7'];
            dataPoints = [0, 0, 0, 0, 0, 0, 0];
        }
        
        // Create chart
        this.portfolioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ارزش پورتفولیو',
                    data: dataPoints,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.9)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(75, 85, 99, 0.5)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return 'ارزش: $' + context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(75, 85, 99, 0.2)'
                        },
                        ticks: {
                            color: 'rgb(156, 163, 175)',
                            callback: function(value) {
                                return '$' + value.toLocaleString('en-US');
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.2)'
                        },
                        ticks: {
                            color: 'rgb(156, 163, 175)'
                        }
                    }
                }
            }
        });
        
        console.log('✅ Portfolio chart initialized');
    }

    /**
     * Update portfolio chart data
     */
    updatePortfolioChart() {
        if (!this.portfolioChart) {
            this.initializePortfolioChart();
            return;
        }
        
        if (this.dashboardData && this.dashboardData.chart) {
            this.portfolioChart.data.labels = this.dashboardData.chart.labels || [];
            this.portfolioChart.data.datasets[0].data = this.dashboardData.chart.data || [];
            this.portfolioChart.update('none'); // Update without animation
            console.log('✅ Portfolio chart updated');
        }
    }

    /**
     * Setup auto-refresh every 30 seconds
     */
    setupAutoRefresh() {
        // Clear any existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Set new interval
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard data...');
            this.loadDashboardData();
        }, 30000); // 30 seconds
        
        console.log('✅ Auto-refresh enabled (30 seconds)');
    }

    /**
     * Manual refresh data
     */
    async refreshData() {
        console.log('🔄 Manual refresh triggered');
        
        // Show loading indicator on refresh button
        const refreshButton = event?.target?.closest('button');
        if (refreshButton) {
            const icon = refreshButton.querySelector('i');
            if (icon) {
                icon.classList.add('fa-spin');
                setTimeout(() => icon.classList.remove('fa-spin'), 1000);
            }
        }
        
        await this.loadDashboardData();
    }

    /**
     * Update last update timestamp
     */
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            const now = new Date();
            const persianTime = now.toLocaleString('fa-IR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            lastUpdateElement.textContent = persianTime;
        }
    }

    /**
     * Format currency value
     */
    formatCurrency(value) {
        if (value === null || value === undefined) return '—';
        return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /**
     * Get dashboard HTML content (4 core widgets only)
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
                        <button onclick="window.dashboardModule.refreshData()" 
                                class="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="بروزرسانی">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Mobile Header -->
                <div class="sm:hidden p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h1 class="text-lg font-bold text-white">داشبورد</h1>
                        <div class="flex items-center gap-2">
                            <button onclick="window.dashboardModule.refreshData()" 
                                    class="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center active:scale-95 transition-all"
                                    title="بروزرسانی">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dashboard Widgets Grid (CORE 4 WIDGETS ONLY) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-widgets-container">
                <!-- Portfolio: Total Balance Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300" data-widget="portfolio">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">موجودی کل</p>
                            <p id="total-balance-card" class="text-2xl font-bold text-white">در حال بارگذاری...</p>
                            <p id="balance-change" class="text-gray-400 text-sm">—</p>
                        </div>
                        <div class="text-green-400 text-3xl">💰</div>
                    </div>
                </div>
            </div>

            <!-- Portfolio Stats Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-widget="portfolio">
                <!-- Total PnL Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">سود و زیان کل</p>
                            <p id="total-pnl-card" class="text-xl font-bold text-gray-400">—</p>
                        </div>
                        <div class="text-green-400 text-2xl">💹</div>
                    </div>
                </div>

                <!-- Win Rate Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">نرخ موفقیت</p>
                            <p id="win-rate-card" class="text-xl font-bold text-white">—</p>
                        </div>
                        <div class="text-blue-400 text-2xl">🎯</div>
                    </div>
                </div>

                <!-- Sharpe Ratio Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">نسبت شارپ</p>
                            <p id="sharpe-ratio-card" class="text-xl font-bold text-white">—</p>
                        </div>
                        <div class="text-purple-400 text-2xl">📊</div>
                    </div>
                </div>

                <!-- System Health Card (Monitor Widget) -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg" data-widget="monitor">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">سلامت سیستم</p>
                            <p id="system-health-card" class="text-xl font-bold text-gray-400">—</p>
                        </div>
                        <div class="text-green-400 text-2xl">💚</div>
                    </div>
                </div>
            </div>

            <!-- Market Overview, Trading & Risk Management (CORE WIDGETS) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Market Overview (Price Overview Widget) -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg" data-widget="overview">
                    <h3 class="text-lg font-semibold text-white mb-4">بازار رمزارز</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">قیمت BTC:</span>
                            <span id="btc-price-card" class="text-orange-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">قیمت ETH:</span>
                            <span id="eth-price-card" class="text-blue-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">شاخص ترس و طمع:</span>
                            <span id="fear-greed-card" class="text-yellow-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">تسلط BTC:</span>
                            <span id="btc-dominance-card" class="text-orange-400 font-bold">—</span>
                        </div>
                    </div>
                </div>

                <!-- Trading Activity (Part of Overview/Monitor) -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg" data-widget="monitor">
                    <h3 class="text-lg font-semibold text-white mb-4">فعالیت معاملاتی</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">معاملات امروز:</span>
                            <span id="today-trades-card" class="text-blue-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">سفارشات در انتظار:</span>
                            <span id="pending-orders-card" class="text-yellow-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">حجم 24 ساعته:</span>
                            <span id="volume-24h-card" class="text-green-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">معاملات موفق:</span>
                            <span class="text-green-400 font-bold">—</span>
                        </div>
                    </div>
                </div>

                <!-- Risk Management (Part of Monitor) -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg" data-widget="monitor">
                    <h3 class="text-lg font-semibold text-white mb-4">مدیریت ریسک</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">کل اکسپوژر:</span>
                            <span id="total-exposure-card" class="text-yellow-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">درجه ریسک:</span>
                            <span id="risk-score-card" class="text-orange-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">کل افت:</span>
                            <span id="current-drawdown-card" class="text-red-400 font-bold">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">ریسک هر معامله:</span>
                            <span class="text-blue-400 font-bold">—</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Portfolio Performance Chart (CORE CHART WIDGET) -->
            <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg" data-widget="chart">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">📈 نمودار پورتفولیو</h3>
                </div>
                <div class="h-64 flex items-center justify-center relative">
                    <canvas id="portfolio-chart" class="w-full h-full"></canvas>
                    <div id="portfolio-chart-loading" class="absolute inset-0 flex items-center justify-center text-gray-400 text-center bg-gray-800">
                        <div>
                            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                            <div>بارگذاری نمودار...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

// Export for module loader
if (typeof window !== 'undefined') {
    window.DashboardModule = DashboardModule;
    
    // Also register in TitanModules for module loader
    if (!window.TitanModules) {
        window.TitanModules = {};
    }
    window.TitanModules.DashboardModule = DashboardModule;
}
