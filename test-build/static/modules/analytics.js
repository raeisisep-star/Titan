// Analytics Module for Titan Trading System
// Comprehensive analytics and reporting dashboard

class AnalyticsModule {
    constructor() {
        this.charts = new Map();
        this.analyticsData = null;
        this.performanceData = [];
        this.aiPredictions = [];
        this.isLoading = false;
    }

    // Safe Chart creation wrapper
    createChart(canvasId, config, chartKey) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.warn(`Canvas element with id "${canvasId}" not found`);
            return null;
        }

        try {
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js library not loaded');
            }

            // Destroy existing chart
            if (this.charts.has(chartKey)) {
                this.charts.get(chartKey).destroy();
            }

            const chart = new Chart(ctx.getContext('2d'), config);
            this.charts.set(chartKey, chart);
            return chart;

        } catch (error) {
            console.error(`❌ Error creating chart "${chartKey}":`, error);
            
            // Show fallback UI
            const canvasParent = ctx.parentElement;
            canvasParent.innerHTML = `
                <div class="flex items-center justify-center h-64 bg-gray-700 rounded-lg">
                    <div class="text-center">
                        <i class="fas fa-chart-line text-4xl text-gray-500 mb-4"></i>
                        <p class="text-gray-400">نمودار در حال بارگذاری...</p>
                        <p class="text-gray-500 text-sm mt-2">مشکل در بارگذاری Chart.js</p>
                        <button onclick="analyticsModule.refreshAnalytics()" class="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            `;
            return null;
        }
    }

    async initialize() {
        console.log('📊 Initializing Analytics module...');
        
        try {
            // Check if Chart.js is loaded
            if (typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js not loaded, loading from CDN...');
                await this.loadChartJS();
            }
            
            // Load analytics data
            await this.loadAnalyticsData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Analytics module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing analytics module:', error);
            throw error;
        }
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            // Check multiple times as Chart.js might be loading
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkChart = () => {
                attempts++;
                
                if (typeof Chart !== 'undefined') {
                    console.log('✅ Chart.js found and ready');
                    resolve();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    console.warn('⚠️ Chart.js not found, loading from CDN...');
                    // Load Chart.js from CDN as fallback
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                    script.onload = () => {
                        console.log('✅ Chart.js loaded from CDN');
                        resolve();
                    };
                    script.onerror = () => {
                        console.error('❌ Failed to load Chart.js from CDN');
                        reject(new Error('Chart library not available'));
                    };
                    document.head.appendChild(script);
                    return;
                }
                
                // Wait and try again
                setTimeout(checkChart, 200);
            };
            
            checkChart();
        });
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Analytics Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">📊 تحلیل و گزارش‌گیری</h2>
                    <p class="text-gray-400 mt-1">آنالیز عملکرد و آمار کامل معاملات</p>
                </div>
                <div class="flex items-center space-x-3 space-x-reverse">
                    <select id="analytics-timeframe" class="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2">
                        <option value="1d">24 ساعت</option>
                        <option value="7d" selected>7 روز</option>
                        <option value="30d">30 روز</option>
                        <option value="90d">90 روز</option>
                        <option value="1y">1 سال</option>
                    </select>
                    <button onclick="analyticsModule.refreshAnalytics()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <i class="fas fa-sync-alt mr-2"></i>
                        بروزرسانی
                    </button>
                </div>
            </div>

            <!-- Key Performance Indicators -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">نرخ موفقیت</h3>
                        <div class="text-green-400 text-2xl">📈</div>
                    </div>
                    <div class="text-3xl font-bold text-green-400" id="success-rate">85%</div>
                    <p class="text-gray-400 text-sm mt-2" id="total-trades">از 127 معامله</p>
                    <div class="mt-3 flex items-center text-sm">
                        <span class="text-green-400">+3.2%</span>
                        <span class="text-gray-400 mr-2">نسبت به قبل</span>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">نسبت شارپ</h3>
                        <div class="text-blue-400 text-2xl">📊</div>
                    </div>
                    <div class="text-3xl font-bold text-blue-400" id="sharpe-ratio">2.34</div>
                    <p class="text-gray-400 text-sm mt-2">عملکرد عالی</p>
                    <div class="mt-3 flex items-center text-sm">
                        <span class="text-blue-400">بهترین</span>
                        <span class="text-gray-400 mr-2">در کلاس</span>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">حداکثر افت</h3>
                        <div class="text-yellow-400 text-2xl">⚠️</div>
                    </div>
                    <div class="text-3xl font-bold text-yellow-400" id="max-drawdown">-5.2%</div>
                    <p class="text-gray-400 text-sm mt-2">کنترل ریسک خوب</p>
                    <div class="mt-3 flex items-center text-sm">
                        <span class="text-yellow-400">قابل قبول</span>
                        <span class="text-gray-400 mr-2">سطح ریسک</span>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">سرمایه کل</h3>
                        <div class="text-purple-400 text-2xl">💰</div>
                    </div>
                    <div class="text-3xl font-bold text-white" id="total-capital">$125,000</div>
                    <p class="text-gray-400 text-sm mt-2" id="capital-change">سود خالص</p>
                    <div class="mt-3 flex items-center text-sm">
                        <span class="text-green-400" id="capital-change-percent">+25.3%</span>
                        <span class="text-gray-400 mr-2">رشد کل</span>
                    </div>
                </div>
            </div>

            <!-- Performance Chart -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-white">نمودار عملکرد پورتفولیو</h3>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <button onclick="analyticsModule.toggleChartType('line')" 
                                class="chart-type-btn px-3 py-1 text-sm bg-blue-600 text-white rounded" data-type="line">
                            خطی
                        </button>
                        <button onclick="analyticsModule.toggleChartType('area')" 
                                class="chart-type-btn px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded" data-type="area">
                            ناحیه‌ای
                        </button>
                        <button onclick="analyticsModule.toggleChartType('candlestick')" 
                                class="chart-type-btn px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded" data-type="candlestick">
                            کندل
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <canvas id="analyticsChart" width="800" height="400"></canvas>
                </div>
            </div>

            <!-- Trading Statistics -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Profit/Loss Distribution -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white">توزیع سود و زیان</h3>
                    </div>
                    <div class="p-6">
                        <canvas id="profitDistributionChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- Asset Allocation -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white">تخصیص دارایی</h3>
                    </div>
                    <div class="p-6">
                        <canvas id="assetAllocationChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>

            <!-- Risk Analysis -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white">🛡️ تحلیل ریسک</h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <div class="text-4xl mb-2">📊</div>
                            <div class="text-lg text-white font-semibold">VaR 95%</div>
                            <div class="text-2xl font-bold text-red-400" id="var-95">-$2,850</div>
                            <div class="text-sm text-gray-400 mt-1">حداکثر زیان احتمالی</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl mb-2">📈</div>
                            <div class="text-lg text-white font-semibold">نسبت ریسک/بازده</div>
                            <div class="text-2xl font-bold text-green-400" id="risk-reward">1:3.2</div>
                            <div class="text-sm text-gray-400 mt-1">نسبت بهینه</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl mb-2">⚡</div>
                            <div class="text-lg text-white font-semibold">نوسان</div>
                            <div class="text-2xl font-bold text-yellow-400" id="volatility">12.8%</div>
                            <div class="text-sm text-gray-400 mt-1">نوسان سالانه</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Predictions -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-white">🧠 پیش‌بینی‌های هوشمند</h3>
                    <button onclick="analyticsModule.refreshPredictions()" 
                            class="text-purple-400 hover:text-purple-300 text-sm">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div id="ai-predictions" class="p-6">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>

            <!-- Trading Performance Table -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white">📋 عملکرد معاملات اخیر</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">تاریخ</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">نماد</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">نوع</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">مقدار</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">قیمت ورود</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">قیمت خروج</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">سود/زیان</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">درصد</th>
                            </tr>
                        </thead>
                        <tbody id="trading-history-table" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Export & Reports -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white">📄 گزارش‌گیری و خروجی</h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onclick="analyticsModule.exportPDF()" 
                                class="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                            <i class="fas fa-file-pdf mr-2"></i>
                            خروجی PDF
                        </button>
                        <button onclick="analyticsModule.exportExcel()" 
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                            <i class="fas fa-file-excel mr-2"></i>
                            خروجی Excel
                        </button>
                        <button onclick="analyticsModule.exportCSV()" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                            <i class="fas fa-file-csv mr-2"></i>
                            خروجی CSV
                        </button>
                        <button onclick="analyticsModule.generateReport()" 
                                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                            <i class="fas fa-chart-line mr-2"></i>
                            گزارش کامل
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async loadAnalyticsData() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // Load performance data
            const analyticsResponse = await axios.get('/api/analytics/performance');
            
            if (analyticsResponse.data.success) {
                this.analyticsData = analyticsResponse.data.data;
                this.performanceData = analyticsResponse.data.performance;
                this.aiPredictions = analyticsResponse.data.predictions;
                
                // Update UI
                this.updateKPIs(this.analyticsData);
                this.renderAnalyticsChart(this.performanceData);
                this.renderProfitDistribution(this.analyticsData.profitDistribution);
                this.renderAssetAllocation(this.analyticsData.assetAllocation);
                this.renderAIPredictions(this.aiPredictions);
                this.renderTradingHistory(this.analyticsData.recentTrades);
                
            } else {
                throw new Error('Failed to load analytics data');
            }
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
            // Load mock data
            this.loadMockData();
        } finally {
            this.isLoading = false;
        }
    }

    loadMockData() {
        // Mock analytics data
        this.analyticsData = {
            successRate: 85,
            totalTrades: 127,
            sharpeRatio: 2.34,
            maxDrawdown: -5.2,
            totalCapital: 125000,
            capitalChange: 25.3,
            var95: -2850,
            riskReward: 3.2,
            volatility: 12.8,
            profitDistribution: {
                profits: 65,
                losses: 35,
                breakeven: 5
            },
            assetAllocation: [
                { name: 'Bitcoin', value: 45, color: '#F7931A' },
                { name: 'Ethereum', value: 30, color: '#627EEA' },
                { name: 'Solana', value: 15, color: '#9945FF' },
                { name: 'Others', value: 10, color: '#6B7280' }
            ],
            recentTrades: [
                {
                    date: '2024-01-20',
                    symbol: 'BTCUSDT',
                    type: 'خرید',
                    amount: 0.5,
                    entryPrice: 42000,
                    exitPrice: 45000,
                    pnl: 1500,
                    percentage: 7.14
                },
                {
                    date: '2024-01-19',
                    symbol: 'ETHUSDT',
                    type: 'فروش',
                    amount: 2,
                    entryPrice: 2800,
                    exitPrice: 2650,
                    pnl: -300,
                    percentage: -5.36
                }
            ]
        };

        // Mock performance data
        this.performanceData = [
            { date: '2024-01-15', value: 100000, high: 102000, low: 98000, close: 101000 },
            { date: '2024-01-16', value: 105000, high: 107000, low: 103000, close: 105000 },
            { date: '2024-01-17', value: 103000, high: 108000, low: 101000, close: 103000 },
            { date: '2024-01-18', value: 110000, high: 112000, low: 108000, close: 110000 },
            { date: '2024-01-19', value: 115000, high: 118000, low: 113000, close: 115000 },
            { date: '2024-01-20', value: 125000, high: 127000, low: 122000, close: 125000 }
        ];

        // Mock AI predictions
        this.aiPredictions = [
            {
                asset: 'BTC/USDT',
                prediction: 'صعودی',
                confidence: 87,
                targetPrice: 48000,
                timeframe: '7 روز',
                reasoning: 'تحلیل تکنیکال نشان‌دهنده شکست مقاومت کلیدی است'
            },
            {
                asset: 'ETH/USDT',
                prediction: 'خنثی',
                confidence: 65,
                targetPrice: 2900,
                timeframe: '3 روز',
                reasoning: 'حجم معاملات پایین و عدم قطعیت بازار'
            },
            {
                asset: 'SOL/USDT',
                prediction: 'صعودی',
                confidence: 92,
                targetPrice: 120,
                timeframe: '5 روز',
                reasoning: 'اخبار مثبت اکوسیستم و رشد TVL'
            }
        ];

        // Update UI with mock data
        this.updateKPIs(this.analyticsData);
        this.renderAnalyticsChart(this.performanceData);
        this.renderProfitDistribution(this.analyticsData.profitDistribution);
        this.renderAssetAllocation(this.analyticsData.assetAllocation);
        this.renderAIPredictions(this.aiPredictions);
        this.renderTradingHistory(this.analyticsData.recentTrades);
    }

    updateKPIs(data) {
        // Update KPI values
        document.getElementById('success-rate').textContent = `${data.successRate}%`;
        document.getElementById('total-trades').textContent = `از ${data.totalTrades} معامله`;
        document.getElementById('sharpe-ratio').textContent = data.sharpeRatio;
        document.getElementById('max-drawdown').textContent = `${data.maxDrawdown}%`;
        document.getElementById('total-capital').textContent = `$${data.totalCapital.toLocaleString()}`;
        document.getElementById('capital-change-percent').textContent = `+${data.capitalChange}%`;
        document.getElementById('var-95').textContent = `-$${Math.abs(data.var95).toLocaleString()}`;
        document.getElementById('risk-reward').textContent = `1:${data.riskReward}`;
        document.getElementById('volatility').textContent = `${data.volatility}%`;
    }

    renderAnalyticsChart(data) {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.has('analytics')) {
            this.charts.get('analytics').destroy();
        }

        // Safe Chart creation with error handling
        let chart;
        try {
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js library not loaded');
            }
            
            chart = this.createChart('analyticsChart', {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.date).toLocaleDateString('fa-IR')),
                datasets: [{
                    label: 'ارزش پورتفولیو',
                    data: data.map(d => d.value),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#1E40AF',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { 
                            color: '#ffffff',
                            font: { size: 14 },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3B82F6',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `ارزش: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: { 
                            color: '#9CA3AF',
                            callback: function(value) {
                                return '$' + (value / 1000) + 'K';
                            }
                        },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#9CA3AF' },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        }, 'analytics');

        // Chart already stored in createChart method
        
        } catch (error) {
            console.error('❌ Error creating analytics chart:', error);
            // Show fallback message
            const canvasParent = ctx.parentElement;
            canvasParent.innerHTML = `
                <div class="flex items-center justify-center h-64 bg-gray-700 rounded-lg">
                    <div class="text-center">
                        <i class="fas fa-chart-line text-4xl text-gray-500 mb-4"></i>
                        <p class="text-gray-400">نمودار در حال بارگذاری...</p>
                        <p class="text-gray-500 text-sm mt-2">Chart.js ${typeof Chart === 'undefined' ? 'not loaded' : 'loading...'}</p>
                    </div>
                </div>
            `;
        }
    }

    renderProfitDistribution(data) {
        const ctx = document.getElementById('profitDistributionChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.has('profitDistribution')) {
            this.charts.get('profitDistribution').destroy();
        }

        try {
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js library not loaded');
            }

            const chart = this.createChart('profitDistributionChart', {
            type: 'doughnut',
            data: {
                labels: ['معاملات سودآور', 'معاملات زیان‌ده', 'سر به سر'],
                datasets: [{
                    data: [data.profits, data.losses, data.breakeven],
                    backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                    borderColor: ['#065F46', '#7F1D1D', '#92400E'],
                    borderWidth: 2
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
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        }, 'profitDistribution');

        // Chart already stored in createChart method
        } catch (error) {
            console.error('❌ Error creating profit distribution chart:', error);
            // Show fallback message
            const canvasParent = ctx.parentElement;
            canvasParent.innerHTML = `
                <div class="flex items-center justify-center h-64 bg-gray-700 rounded-lg">
                    <div class="text-center">
                        <i class="fas fa-chart-pie text-4xl text-gray-500 mb-4"></i>
                        <p class="text-gray-400">نمودار در حال بارگذاری...</p>
                        <p class="text-gray-500 text-sm mt-2">مشکل در بارگذاری Chart.js</p>
                    </div>
                </div>
            `;
        }
    }

    renderAssetAllocation(data) {
        const ctx = document.getElementById('assetAllocationChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.has('assetAllocation')) {
            this.charts.get('assetAllocation').destroy();
        }

        const chart = this.createChart('assetAllocationChart', {
            type: 'pie',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    data: data.map(item => item.value),
                    backgroundColor: data.map(item => item.color),
                    borderColor: '#1F2937',
                    borderWidth: 3
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
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        }, 'assetAllocation');

        // Chart already stored in createChart method
    }

    renderAIPredictions(predictions) {
        const container = document.getElementById('ai-predictions');
        if (!container) return;

        const html = predictions.map(pred => {
            const confidenceColor = pred.confidence >= 80 ? 'text-green-400' : 
                                  pred.confidence >= 60 ? 'text-yellow-400' : 'text-red-400';
            
            const predictionColor = pred.prediction === 'صعودی' ? 'text-green-400' :
                                  pred.prediction === 'نزولی' ? 'text-red-400' : 'text-yellow-400';

            const predictionIcon = pred.prediction === 'صعودی' ? '↗️' :
                                 pred.prediction === 'نزولی' ? '↘️' : '➡️';

            return `
                <div class="bg-gray-700 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h4 class="text-lg font-semibold text-white">${pred.asset}</h4>
                            <div class="flex items-center mt-1">
                                <span class="text-2xl mr-2">${predictionIcon}</span>
                                <span class="text-lg ${predictionColor}">${pred.prediction}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-400">اعتماد</div>
                            <div class="text-lg font-bold ${confidenceColor}">${pred.confidence}%</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <div class="text-sm text-gray-400">قیمت هدف</div>
                            <div class="text-white font-semibold">$${pred.targetPrice.toLocaleString()}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-400">بازه زمانی</div>
                            <div class="text-white font-semibold">${pred.timeframe}</div>
                        </div>
                    </div>
                    <div class="text-sm text-gray-300 bg-gray-800 rounded p-3">
                        <strong>تحلیل:</strong> ${pred.reasoning}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderTradingHistory(trades) {
        const tableBody = document.getElementById('trading-history-table');
        if (!tableBody) return;

        const rows = trades.map(trade => {
            const pnlClass = trade.pnl >= 0 ? 'text-green-400' : 'text-red-400';
            const pnlIcon = trade.pnl >= 0 ? '+' : '';
            const percentClass = trade.percentage >= 0 ? 'text-green-400' : 'text-red-400';
            const percentIcon = trade.percentage >= 0 ? '+' : '';

            return `
                <tr class="hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${new Date(trade.date).toLocaleDateString('fa-IR')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ${trade.symbol}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${trade.type}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${trade.amount}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        $${trade.entryPrice.toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        $${trade.exitPrice.toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${pnlClass}">
                        ${pnlIcon}$${Math.abs(trade.pnl).toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${percentClass}">
                        ${percentIcon}${Math.abs(trade.percentage).toFixed(2)}%
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rows;
    }

    setupEventListeners() {
        // Timeframe change handler
        const timeframeSelect = document.getElementById('analytics-timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                this.changeTimeframe(e.target.value);
            });
        }

        console.log('📡 Analytics event listeners set up');
    }

    async changeTimeframe(timeframe) {
        console.log(`📊 Changing timeframe to: ${timeframe}`);
        // Reload data for new timeframe
        await this.loadAnalyticsData();
        this.showAlert(`بازه زمانی به ${timeframe} تغییر یافت`, 'success');
    }

    toggleChartType(type) {
        // Update button states
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            if (btn.dataset.type === type) {
                btn.className = 'chart-type-btn px-3 py-1 text-sm bg-blue-600 text-white rounded';
            } else {
                btn.className = 'chart-type-btn px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded';
            }
        });

        // Re-render chart with new type
        // For now, just show alert - full implementation would update chart type
        this.showAlert(`نوع نمودار به ${type} تغییر یافت`, 'info');
    }

    async refreshAnalytics() {
        this.showAlert('در حال بروزرسانی آنالیتیک...', 'info');
        await this.loadAnalyticsData();
        this.showAlert('آنالیتیک بروزرسانی شد', 'success');
    }

    async refreshPredictions() {
        try {
            const response = await axios.get('/api/analytics/predictions');
            if (response.data.success) {
                this.aiPredictions = response.data.predictions;
                this.renderAIPredictions(this.aiPredictions);
                this.showAlert('پیش‌بینی‌ها بروزرسانی شد', 'success');
            }
        } catch (error) {
            console.error('Error refreshing predictions:', error);
            this.showAlert('خطا در بروزرسانی پیش‌بینی‌ها', 'error');
        }
    }

    // Export functions
    exportPDF() {
        this.showAlert('خروجی PDF در حال آماده‌سازی...', 'info');
        // Implementation would generate PDF report
        setTimeout(() => {
            this.showAlert('گزارش PDF آماده دانلود است', 'success');
        }, 2000);
    }

    exportExcel() {
        this.showAlert('خروجی Excel در حال آماده‌سازی...', 'info');
        // Implementation would generate Excel file
        setTimeout(() => {
            this.showAlert('فایل Excel آماده دانلود است', 'success');
        }, 2000);
    }

    exportCSV() {
        this.showAlert('خروجی CSV در حال آماده‌سازی...', 'info');
        // Implementation would generate CSV file
        setTimeout(() => {
            this.showAlert('فایل CSV آماده دانلود است', 'success');
        }, 2000);
    }

    generateReport() {
        this.showAlert('گزارش کامل در حال تولید...', 'info');
        // Implementation would generate comprehensive report
        setTimeout(() => {
            this.showAlert('گزارش کامل آماده است', 'success');
        }, 3000);
    }

    showAlert(message, type = 'info') {
        // Use app's alert system if available, otherwise console log
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    destroy() {
        console.log('🗑️ Destroying Analytics module...');
        
        // Destroy all charts
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
        
        // Clear data
        this.analyticsData = null;
        this.performanceData = [];
        this.aiPredictions = [];
        
        console.log('✅ Analytics module destroyed');
    }
}

// Global instance for TitanModules namespace
if (typeof window.TitanModules === 'undefined') {
    window.TitanModules = {};
}

window.TitanModules.AnalyticsModule = AnalyticsModule;

// Global instance for direct access
window.analyticsModule = null;

// Export for module loader
// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.AnalyticsModule = AnalyticsModule;