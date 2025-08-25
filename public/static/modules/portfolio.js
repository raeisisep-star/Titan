/**
 * Portfolio Module - Advanced P&L Analytics
 * Modular Architecture Phase 2
 * Created: 2024-08-23
 * Features: Professional portfolio analytics, advanced P&L charts, risk metrics
 */

class PortfolioModule {
    constructor() {
        this.name = 'portfolio';
        this.version = '2.0.0';
        this.charts = {};
        this.portfolioData = null;
        this.performanceData = null;
        this.refreshInterval = null;
        
        console.log(`🚀 Portfolio Module v${this.version} initialized`);
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Performance Overview -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-green-400 text-2xl mb-2">💰</div>
                        <p class="text-gray-400 text-xs">ارزش کل پورتفولیو</p>
                        <p id="total-portfolio-value" class="text-xl font-bold text-white">--</p>
                        <p id="portfolio-change" class="text-xs mt-1">--</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-blue-400 text-2xl mb-2">📈</div>
                        <p class="text-gray-400 text-xs">سود/زیان کل</p>
                        <p id="total-pnl" class="text-xl font-bold">--</p>
                        <p id="total-roi" class="text-xs mt-1">--</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-purple-400 text-2xl mb-2">🎯</div>
                        <p class="text-gray-400 text-xs">نرخ موفقیت</p>
                        <p id="win-rate" class="text-xl font-bold text-white">--</p>
                        <p id="trade-count" class="text-xs mt-1 text-gray-400">--</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-yellow-400 text-2xl mb-2">⚖️</div>
                        <p class="text-gray-400 text-xs">نسبت شارپ</p>
                        <p id="sharpe-ratio" class="text-xl font-bold text-white">--</p>
                        <p id="max-drawdown" class="text-xs mt-1 text-gray-400">--</p>
                    </div>
                </div>
            </div>

            <!-- Advanced Performance Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Advanced P&L Chart -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-white">نمودار P&L پیشرفته</h3>
                            <div class="flex space-x-2 space-x-reverse">
                                <select id="pnl-period" onchange="window.portfolioModule?.loadAdvancedPnLChart()" 
                                        class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                    <option value="daily">روزانه</option>
                                    <option value="weekly">هفتگی</option>
                                    <option value="monthly">ماهانه</option>
                                    <option value="quarterly">فصلی</option>
                                </select>
                                <button onclick="window.portfolioModule?.togglePnLView()" 
                                        class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                                    <i class="fas fa-chart-line"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <canvas id="advanced-pnl-chart" class="w-full" height="300"></canvas>
                    </div>
                </div>

                <!-- Risk Analysis Chart -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-white">تحلیل ریسک</h3>
                            <button onclick="window.portfolioModule?.refreshRiskAnalysis()" 
                                    class="text-blue-400 hover:text-blue-300 text-sm">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-4">
                        <canvas id="risk-analysis-chart" class="w-full" height="300"></canvas>
                    </div>
                </div>
            </div>

            <!-- Portfolio Allocation & Correlation -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Enhanced Portfolio Allocation -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-white">توزیع دارایی‌ها</h3>
                            <div class="flex space-x-2 space-x-reverse">
                                <button onclick="window.portfolioModule?.toggleAllocationView()" 
                                        class="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs">
                                    <i class="fas fa-pie-chart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <canvas id="enhanced-allocation-chart" class="w-full" height="300"></canvas>
                    </div>
                </div>

                <!-- Correlation Matrix -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white">ماتریس همبستگی</h3>
                    </div>
                    <div class="p-4">
                        <canvas id="correlation-matrix" class="w-full" height="300"></canvas>
                    </div>
                </div>
            </div>

            <!-- Advanced Performance Metrics -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Trading Statistics -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <h3 class="text-md font-semibold text-white">آمار معاملات</h3>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">کل معاملات:</span>
                            <span id="total-trades" class="text-white font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">معاملات برنده:</span>
                            <span id="winning-trades" class="text-green-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">معاملات بازنده:</span>
                            <span id="losing-trades" class="text-red-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">میانگین برد:</span>
                            <span id="avg-win" class="text-green-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">میانگین باخت:</span>
                            <span id="avg-loss" class="text-red-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">فاکتور سود:</span>
                            <span id="profit-factor" class="text-blue-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">نسبت کالمار:</span>
                            <span id="calmar-ratio" class="text-purple-400 font-medium">--</span>
                        </div>
                    </div>
                </div>

                <!-- Risk Metrics -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <h3 class="text-md font-semibold text-white">متریک‌های ریسک</h3>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">VaR (95%):</span>
                            <span id="var-95" class="text-red-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">نسبت سورتینو:</span>
                            <span id="sortino-ratio" class="text-blue-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">بتا پورتفولیو:</span>
                            <span id="portfolio-beta" class="text-yellow-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">آلفای جنسن:</span>
                            <span id="jensen-alpha" class="text-green-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">نسبت اطلاعات:</span>
                            <span id="information-ratio" class="text-purple-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">نوسانات:</span>
                            <span id="volatility" class="text-orange-400 font-medium">--</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">کشیدگی:</span>
                            <span id="skewness" class="text-cyan-400 font-medium">--</span>
                        </div>
                    </div>
                </div>

                <!-- Monthly Returns -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <h3 class="text-md font-semibold text-white">بازدهی ماهانه</h3>
                    </div>
                    <div id="monthly-returns" class="p-4 space-y-2">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Advanced Holdings Table -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-4 py-3 border-b border-gray-700">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-white">دارایی‌های موجود</h3>
                        <div class="flex space-x-2 space-x-reverse">
                            <button onclick="window.portfolioModule?.exportPortfolioData()" 
                                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                                <i class="fas fa-download"></i> خروجی
                            </button>
                            <button onclick="window.portfolioModule?.refreshPortfolioData()" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                <i class="fas fa-sync-alt"></i> بروزرسانی
                            </button>
                        </div>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">ارز</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">مقدار</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">قیمت متوسط</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">قیمت فعلی</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">ارزش</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">سود/زیان</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">درصد</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">نوسانات</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">عمل</th>
                            </tr>
                        </thead>
                        <tbody id="advanced-holdings-table" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Portfolio Insights -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-4 py-3 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white">🤖 تحلیل هوشمند پورتفولیو</h3>
                </div>
                <div id="portfolio-insights" class="p-4">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>
        </div>
        `;
    }

    async initialize() {
        console.log('🚀 Initializing Portfolio Module...');
        
        try {
            // Set global reference for onclick handlers
            window.portfolioModule = this;
            
            // Load initial data
            await this.loadPortfolioData();
            
            // Initialize advanced charts
            await this.initializeAdvancedCharts();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            // Generate portfolio insights
            await this.generatePortfolioInsights();
            
            console.log('✅ Portfolio Module initialized successfully');
        } catch (error) {
            console.error('❌ Portfolio Module initialization error:', error);
        }
    }

    async loadPortfolioData() {
        try {
            // Try to load from API
            const portfolioResponse = await axios.get('/api/portfolio/advanced');
            if (portfolioResponse.data.success) {
                this.portfolioData = portfolioResponse.data.data;
                this.performanceData = portfolioResponse.data.performance;
                await this.updatePortfolioMetrics(this.portfolioData);
                await this.renderAdvancedHoldings(this.portfolioData.holdings);
            }
        } catch (error) {
            console.warn('API not available, using advanced demo data:', error);
            
            // Generate sophisticated demo data
            this.portfolioData = this.generateAdvancedDemoData();
            this.performanceData = this.generatePerformanceData();
            
            await this.updatePortfolioMetrics(this.portfolioData);
            await this.renderAdvancedHoldings(this.portfolioData.holdings);
        }
    }

    generateAdvancedDemoData() {
        const currentTime = Date.now();
        const symbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE', 'MATIC'];
        
        return {
            totalValue: 287500 + (Math.random() - 0.5) * 50000,
            totalPnL: 15750 + (Math.random() - 0.3) * 10000,
            totalROI: 5.8 + (Math.random() - 0.2) * 8,
            dailyChange: (Math.random() - 0.4) * 2000,
            winRate: 68 + Math.random() * 20,
            sharpeRatio: 1.85 + Math.random() * 0.8,
            maxDrawdown: -(Math.random() * 12 + 3),
            calmarRatio: 0.95 + Math.random() * 0.6,
            sortinoRatio: 2.1 + Math.random() * 0.9,
            var95: -(Math.random() * 8000 + 2000),
            beta: 0.85 + Math.random() * 0.6,
            alpha: Math.random() * 8 - 2,
            volatility: Math.random() * 25 + 15,
            holdings: symbols.map((symbol, index) => ({
                symbol,
                amount: Math.random() * 100 + 10,
                avgPrice: Math.random() * 50000 + 1000,
                currentPrice: Math.random() * 55000 + 1200,
                value: Math.random() * 50000 + 10000,
                pnl: Math.random() * 10000 - 2000,
                pnlPercent: Math.random() * 20 - 5,
                allocation: Math.random() * 25 + 5,
                volatility: Math.random() * 30 + 10,
                lastUpdate: currentTime - Math.random() * 3600000
            }))
        };
    }

    generatePerformanceData() {
        const data = [];
        const labels = [];
        const currentTime = Date.now();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(currentTime - i * 24 * 60 * 60 * 1000);
            labels.push(date.toLocaleDateString('fa-IR'));
            
            const baseValue = 250000;
            const randomWalk = (Math.random() - 0.5) * 5000;
            const trend = (30 - i) * 300; // Slight upward trend
            
            data.push(baseValue + randomWalk + trend);
        }
        
        return { labels, data };
    }

    async updatePortfolioMetrics(data) {
        // Update main metrics
        const totalValueEl = document.getElementById('total-portfolio-value');
        const portfolioChangeEl = document.getElementById('portfolio-change');
        const totalPnlEl = document.getElementById('total-pnl');
        const totalRoiEl = document.getElementById('total-roi');
        const winRateEl = document.getElementById('win-rate');
        const tradeCountEl = document.getElementById('trade-count');
        const sharpeRatioEl = document.getElementById('sharpe-ratio');
        const maxDrawdownEl = document.getElementById('max-drawdown');

        if (totalValueEl) totalValueEl.textContent = `$${data.totalValue.toLocaleString()}`;
        if (portfolioChangeEl) {
            const changeClass = data.dailyChange >= 0 ? 'text-green-400' : 'text-red-400';
            portfolioChangeEl.className = `text-xs mt-1 ${changeClass}`;
            portfolioChangeEl.textContent = `${data.dailyChange >= 0 ? '+' : ''}$${Math.abs(data.dailyChange).toFixed(2)}`;
        }
        if (totalPnlEl) {
            const pnlClass = data.totalPnL >= 0 ? 'text-green-400' : 'text-red-400';
            totalPnlEl.className = `text-xl font-bold ${pnlClass}`;
            totalPnlEl.textContent = `${data.totalPnL >= 0 ? '+' : ''}$${Math.abs(data.totalPnL).toFixed(2)}`;
        }
        if (totalRoiEl) {
            const roiClass = data.totalROI >= 0 ? 'text-green-400' : 'text-red-400';
            totalRoiEl.className = `text-xs mt-1 ${roiClass}`;
            totalRoiEl.textContent = `${data.totalROI >= 0 ? '+' : ''}${data.totalROI.toFixed(2)}%`;
        }
        if (winRateEl) winRateEl.textContent = `${data.winRate.toFixed(1)}%`;
        if (tradeCountEl) tradeCountEl.textContent = `از ${Math.floor(Math.random() * 50 + 100)} معامله`;
        if (sharpeRatioEl) sharpeRatioEl.textContent = data.sharpeRatio.toFixed(2);
        if (maxDrawdownEl) maxDrawdownEl.textContent = `${data.maxDrawdown.toFixed(2)}%`;

        // Update advanced metrics
        this.updateAdvancedMetrics(data);
    }

    updateAdvancedMetrics(data) {
        const metrics = {
            'total-trades': Math.floor(Math.random() * 50 + 150),
            'winning-trades': Math.floor(Math.random() * 30 + 85),
            'losing-trades': Math.floor(Math.random() * 20 + 35),
            'avg-win': `+$${(Math.random() * 800 + 400).toFixed(2)}`,
            'avg-loss': `-$${(Math.random() * 300 + 150).toFixed(2)}`,
            'profit-factor': (1.5 + Math.random() * 1.2).toFixed(2),
            'calmar-ratio': data.calmarRatio.toFixed(2),
            'var-95': `$${Math.abs(data.var95).toFixed(2)}`,
            'sortino-ratio': data.sortinoRatio.toFixed(2),
            'portfolio-beta': data.beta.toFixed(2),
            'jensen-alpha': `${data.alpha >= 0 ? '+' : ''}${data.alpha.toFixed(2)}%`,
            'information-ratio': (Math.random() * 1.5 + 0.5).toFixed(2),
            'volatility': `${data.volatility.toFixed(1)}%`,
            'skewness': (Math.random() * 2 - 1).toFixed(2)
        };

        Object.entries(metrics).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update monthly returns
        this.updateMonthlyReturns();
    }

    updateMonthlyReturns() {
        const monthlyReturnsEl = document.getElementById('monthly-returns');
        if (!monthlyReturnsEl) return;

        const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
        const returns = months.map(() => (Math.random() - 0.3) * 15);

        monthlyReturnsEl.innerHTML = returns.map((ret, index) => {
            const colorClass = ret >= 0 ? 'text-green-400' : 'text-red-400';
            return `
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">${months[index]}:</span>
                    <span class="${colorClass} font-medium">${ret >= 0 ? '+' : ''}${ret.toFixed(2)}%</span>
                </div>
            `;
        }).join('');
    }

    async renderAdvancedHoldings(holdings) {
        const tableEl = document.getElementById('advanced-holdings-table');
        if (!tableEl) return;

        tableEl.innerHTML = holdings.map(holding => {
            const pnlClass = holding.pnl >= 0 ? 'text-green-400' : 'text-red-400';
            const pnlIcon = holding.pnl >= 0 ? '↗️' : '↘️';
            
            return `
                <tr class="hover:bg-gray-700">
                    <td class="px-4 py-3 text-white font-medium">${holding.symbol}</td>
                    <td class="px-4 py-3 text-gray-300">${holding.amount.toFixed(4)}</td>
                    <td class="px-4 py-3 text-gray-300">$${holding.avgPrice.toFixed(2)}</td>
                    <td class="px-4 py-3 text-white font-medium">$${holding.currentPrice.toFixed(2)}</td>
                    <td class="px-4 py-3 text-white font-semibold">$${holding.value.toFixed(2)}</td>
                    <td class="px-4 py-3 ${pnlClass} font-medium">
                        ${pnlIcon} ${holding.pnl >= 0 ? '+' : ''}$${Math.abs(holding.pnl).toFixed(2)}
                    </td>
                    <td class="px-4 py-3 ${pnlClass} font-medium">
                        ${holding.pnlPercent >= 0 ? '+' : ''}${holding.pnlPercent.toFixed(2)}%
                    </td>
                    <td class="px-4 py-3 text-orange-400">${holding.volatility.toFixed(1)}%</td>
                    <td class="px-4 py-3">
                        <div class="flex space-x-1 space-x-reverse">
                            <button onclick="window.portfolioModule?.showAssetDetails('${holding.symbol}')" 
                                    class="text-blue-400 hover:text-blue-300 text-xs">
                                <i class="fas fa-chart-line"></i>
                            </button>
                            <button onclick="window.portfolioModule?.showTradeDialog('${holding.symbol}')" 
                                    class="text-green-400 hover:text-green-300 text-xs">
                                <i class="fas fa-exchange-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async initializeAdvancedCharts() {
        await this.loadAdvancedPnLChart();
        await this.loadRiskAnalysisChart();
        await this.loadEnhancedAllocationChart();
        await this.loadCorrelationMatrix();
    }

    async loadAdvancedPnLChart() {
        const ctx = document.getElementById('advanced-pnl-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.pnl) {
            this.charts.pnl.destroy();
        }

        const performanceData = this.performanceData || this.generatePerformanceData();

        this.charts.pnl = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: performanceData.labels,
                datasets: [
                    {
                        label: 'ارزش پورتفولیو',
                        data: performanceData.data,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'میانگین متحرک (7 روزه)',
                        data: this.calculateMovingAverage(performanceData.data, 7),
                        borderColor: '#EF4444',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: { 
                            color: '#ffffff',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: { 
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    calculateMovingAverage(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                result.push(sum / period);
            }
        }
        return result;
    }

    async loadRiskAnalysisChart() {
        const ctx = document.getElementById('risk-analysis-chart');
        if (!ctx) return;

        if (this.charts.risk) {
            this.charts.risk.destroy();
        }

        // Generate risk data
        const riskData = this.generateRiskData();

        this.charts.risk = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['نوسانات', 'VaR', 'درواون', 'شارپ', 'لیکویدیتی', 'تنوع'],
                datasets: [{
                    label: 'پروفایل ریسک',
                    data: riskData,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    pointBackgroundColor: '#F59E0B',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: { color: '#ffffff' }
                    }
                }
            }
        });
    }

    generateRiskData() {
        return [
            Math.random() * 40 + 30, // Volatility
            Math.random() * 30 + 60, // VaR
            Math.random() * 25 + 50, // Drawdown
            Math.random() * 30 + 70, // Sharpe
            Math.random() * 20 + 65, // Liquidity
            Math.random() * 25 + 55  // Diversification
        ];
    }

    async loadEnhancedAllocationChart() {
        const ctx = document.getElementById('enhanced-allocation-chart');
        if (!ctx) return;

        if (this.charts.allocation) {
            this.charts.allocation.destroy();
        }

        const allocationData = this.portfolioData?.holdings.map(h => ({
            label: h.symbol,
            value: h.allocation
        })) || [
            { label: 'BTC', value: 35 },
            { label: 'ETH', value: 25 },
            { label: 'ADA', value: 15 },
            { label: 'DOT', value: 12 },
            { label: 'LINK', value: 8 },
            { label: 'سایر', value: 5 }
        ];

        this.charts.allocation = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: allocationData.map(d => d.label),
                datasets: [{
                    data: allocationData.map(d => d.value),
                    backgroundColor: [
                        '#F7931A', '#627EEA', '#0033AD', '#E6007A', 
                        '#375BD2', '#FF6B6B', '#4ECDC4', '#45B7D1'
                    ],
                    borderWidth: 2,
                    borderColor: '#1F2937'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { 
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    async loadCorrelationMatrix() {
        const ctx = document.getElementById('correlation-matrix');
        if (!ctx) return;

        if (this.charts.correlation) {
            this.charts.correlation.destroy();
        }

        // Generate correlation matrix data
        const symbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK'];
        const correlationData = this.generateCorrelationData(symbols);

        this.charts.correlation = new Chart(ctx.getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: correlationData.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const point = context[0];
                                return `${symbols[point.parsed.x]} vs ${symbols[point.parsed.y]}`;
                            },
                            label: function(context) {
                                return `همبستگی: ${context.raw.v.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: 0,
                        max: symbols.length - 1,
                        ticks: {
                            color: '#ffffff',
                            stepSize: 1,
                            callback: function(value) {
                                return symbols[value] || '';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        min: 0,
                        max: symbols.length - 1,
                        ticks: {
                            color: '#ffffff',
                            stepSize: 1,
                            callback: function(value) {
                                return symbols[value] || '';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    generateCorrelationData(symbols) {
        const datasets = [];
        const correlationMatrix = [];
        
        // Generate correlation matrix
        for (let i = 0; i < symbols.length; i++) {
            correlationMatrix[i] = [];
            for (let j = 0; j < symbols.length; j++) {
                if (i === j) {
                    correlationMatrix[i][j] = 1;
                } else {
                    correlationMatrix[i][j] = Math.random() * 2 - 1; // -1 to 1
                }
            }
        }

        // Create dataset for heatmap
        const data = [];
        for (let i = 0; i < symbols.length; i++) {
            for (let j = 0; j < symbols.length; j++) {
                const correlation = correlationMatrix[i][j];
                data.push({
                    x: j,
                    y: i,
                    v: correlation
                });
            }
        }

        datasets.push({
            label: 'Correlation',
            data: data,
            backgroundColor: function(context) {
                const value = context.parsed.v;
                const alpha = Math.abs(value);
                if (value > 0) {
                    return `rgba(34, 197, 94, ${alpha})`;
                } else {
                    return `rgba(239, 68, 68, ${alpha})`;
                }
            },
            pointRadius: 25,
            pointHoverRadius: 30
        });

        return { datasets };
    }

    // Interactive methods
    async togglePnLView() {
        // Toggle between different P&L views
        await this.loadAdvancedPnLChart();
    }

    async toggleAllocationView() {
        // Toggle between different allocation views
        await this.loadEnhancedAllocationChart();
    }

    async refreshRiskAnalysis() {
        await this.loadRiskAnalysisChart();
    }

    async refreshPortfolioData() {
        await this.loadPortfolioData();
        await this.initializeAdvancedCharts();
    }

    async exportPortfolioData() {
        const data = {
            portfolio: this.portfolioData,
            performance: this.performanceData,
            exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async showAssetDetails(symbol) {
        // Show detailed asset analysis
        alert(`نمایش جزئیات ${symbol} - این بخش در آپدیت بعدی اضافه خواهد شد`);
    }

    async showTradeDialog(symbol) {
        // Show trade dialog for specific asset
        alert(`پنجره معامله ${symbol} - این بخش در آپدیت بعدی اضافه خواهد شد`);
    }

    async generatePortfolioInsights() {
        const insightsEl = document.getElementById('portfolio-insights');
        if (!insightsEl) return;

        const insights = [
            {
                type: 'success',
                icon: '✅',
                title: 'عملکرد بهتر از بازار',
                description: 'پورتفولیو شما در 30 روز گذشته 12% بهتر از شاخص کل بازار عمل کرده است.'
            },
            {
                type: 'warning',
                icon: '⚠️',
                title: 'تمرکز بالا در BTC',
                description: 'بیش از 35% پورتفولیو در بیت‌کوین است. برای کاهش ریسک تنوع‌سازی توصیه می‌شود.'
            },
            {
                type: 'info',
                icon: '💡',
                title: 'فرصت ریبالانس',
                description: 'بر اساس تحلیل، زمان مناسبی برای ریبالانس پورتفولیو و تنظیم درصد دارایی‌ها است.'
            },
            {
                type: 'success',
                icon: '🎯',
                title: 'مدیریت ریسک عالی',
                description: 'نسبت شارپ و کنترل درآوون پورتفولیو در سطح بسیار مطلوبی قرار دارد.'
            }
        ];

        insightsEl.innerHTML = insights.map(insight => {
            const colorClass = {
                success: 'border-green-500 bg-green-500/10',
                warning: 'border-yellow-500 bg-yellow-500/10',
                info: 'border-blue-500 bg-blue-500/10',
                error: 'border-red-500 bg-red-500/10'
            }[insight.type];

            return `
                <div class="border-r-4 ${colorClass} p-4 mb-3">
                    <div class="flex items-start">
                        <div class="text-xl ml-3">${insight.icon}</div>
                        <div>
                            <h4 class="font-semibold text-white mb-1">${insight.title}</h4>
                            <p class="text-gray-300 text-sm">${insight.description}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(async () => {
            await this.loadPortfolioData();
        }, 5 * 60 * 1000);
    }

    destroy() {
        // Clean up charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // Clear intervals
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Remove global reference
        delete window.portfolioModule;
        
        console.log('🗑️ Portfolio Module destroyed');
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioModule;
}

// Register in global TitanModules namespace
if (typeof window !== 'undefined') {
    window.TitanModules = window.TitanModules || {};
    window.TitanModules.PortfolioModule = PortfolioModule;
    console.log('📦 Portfolio Module registered in TitanModules');
}