// News Module for Titan Trading System
// Real-time market news and economic calendar

class NewsModule {
    constructor() {
        this.newsData = [];
        this.economicEvents = [];
        this.filters = {
            category: 'all',
            source: 'all',
            timeframe: '24h'
        };
        this.isLoading = false;
    }

    async initialize() {
        console.log('📰 Initializing News module...');
        
        try {
            // Load news data
            await this.loadNewsData();
            
            // Load economic calendar
            await this.loadEconomicCalendar();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ News module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing news module:', error);
            throw error;
        }
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- News Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">📰 اخبار بازار</h2>
                    <p class="text-gray-400 mt-1">آخرین اخبار کریپتو، بورس و اقتصاد جهانی</p>
                </div>
                <div class="flex items-center space-x-3 space-x-reverse">
                    <select id="news-category" class="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2">
                        <option value="all">همه اخبار</option>
                        <option value="crypto">کریپتو</option>
                        <option value="stocks">بورس</option>
                        <option value="forex">فارکس</option>
                        <option value="economy">اقتصاد</option>
                    </select>
                    <button onclick="newsModule.refreshNews()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <i class="fas fa-sync-alt mr-2"></i>
                        بروزرسانی
                    </button>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-green-400 text-2xl mb-1">📈</div>
                        <p class="text-gray-400 text-xs">اخبار مثبت</p>
                        <p id="positive-news-count" class="text-lg font-bold text-green-400">12</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-red-400 text-2xl mb-1">📉</div>
                        <p class="text-gray-400 text-xs">اخبار منفی</p>
                        <p id="negative-news-count" class="text-lg font-bold text-red-400">5</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-yellow-400 text-2xl mb-1">📊</div>
                        <p class="text-gray-400 text-xs">رویدادهای مهم</p>
                        <p id="important-events-count" class="text-lg font-bold text-yellow-400">3</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-blue-400 text-2xl mb-1">🔔</div>
                        <p class="text-gray-400 text-xs">کل اخبار</p>
                        <p id="total-news-count" class="text-lg font-bold text-white">24</p>
                    </div>
                </div>
            </div>

            <!-- Breaking News -->
            <div class="bg-red-900 border-l-4 border-red-500 rounded-lg p-4" id="breaking-news">
                <div class="flex items-center">
                    <div class="text-red-400 text-xl mr-3">🚨</div>
                    <div>
                        <h3 class="text-red-300 font-semibold">خبر فوری</h3>
                        <p class="text-red-200 text-sm mt-1">بیت‌کوین مرز 47,000 دلار را شکست</p>
                    </div>
                    <div class="mr-auto text-red-300 text-xs">5 دقیقه پیش</div>
                </div>
            </div>

            <!-- News Feed -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Main News -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-white">اخبار اصلی</h3>
                        <div class="text-sm text-gray-400" id="last-news-update">بروزرسانی شده</div>
                    </div>
                    <div id="main-news-list" class="divide-y divide-gray-700">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Market Sentiment -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white">💭 احساسات بازار</h3>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-300">BTC Sentiment</span>
                                <div class="flex items-center">
                                    <div class="w-20 bg-gray-700 rounded-full h-2 mr-3">
                                        <div class="bg-green-400 h-2 rounded-full" style="width: 75%"></div>
                                    </div>
                                    <span class="text-green-400 text-sm">75% صعودی</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-300">ETH Sentiment</span>
                                <div class="flex items-center">
                                    <div class="w-20 bg-gray-700 rounded-full h-2 mr-3">
                                        <div class="bg-yellow-400 h-2 rounded-full" style="width: 60%"></div>
                                    </div>
                                    <span class="text-yellow-400 text-sm">60% خنثی</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-300">Market Fear</span>
                                <div class="flex items-center">
                                    <div class="w-20 bg-gray-700 rounded-full h-2 mr-3">
                                        <div class="bg-red-400 h-2 rounded-full" style="width: 35%"></div>
                                    </div>
                                    <span class="text-red-400 text-sm">35% ترس</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Economic Calendar -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white">📅 تقویم اقتصادی</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">زمان</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">کشور</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">رویداد</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">اهمیت</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">قبلی</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">پیش‌بینی</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">واقعی</th>
                            </tr>
                        </thead>
                        <tbody id="economic-calendar-table" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Trending Topics -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white">🔥 موضوعات ترند</h3>
                </div>
                <div id="trending-topics" class="p-6">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>
        </div>
        `;
    }

    async loadNewsData() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const response = await axios.get('/api/news/latest', {
                params: this.filters
            });
            
            if (response.data.success) {
                this.newsData = response.data.news;
                this.renderNewsList(this.newsData);
                this.updateNewsStats(this.newsData);
            } else {
                throw new Error('Failed to load news data');
            }
            
        } catch (error) {
            console.error('Error loading news data:', error);
            // Load mock data
            this.loadMockNewsData();
        } finally {
            this.isLoading = false;
        }
    }

    loadMockNewsData() {
        this.newsData = [
            {
                id: 1,
                title: 'بیت‌کوین به بالای 47,000 دلار رسید',
                summary: 'قیمت بیت‌کوین با شکست مقاومت کلیدی به بالای 47 هزار دلار رسیده است',
                category: 'crypto',
                source: 'CoinDesk',
                sentiment: 'positive',
                time: '10 دقیقه پیش',
                impact: 'high'
            },
            {
                id: 2,
                title: 'اتریوم آپدیت جدید خود را منتشر کرد',
                summary: 'آپدیت London fork اتریوم با هدف کاهش کارمزدها راه‌اندازی شد',
                category: 'crypto',
                source: 'Ethereum Foundation',
                sentiment: 'positive',
                time: '1 ساعت پیش',
                impact: 'medium'
            },
            {
                id: 3,
                title: 'بانک مرکزی آمریکا نرخ بهره را ثابت نگه داشت',
                summary: 'فدرال رزرو تصمیم گرفت نرخ بهره را در سطح فعلی حفظ کند',
                category: 'economy',
                source: 'Reuters',
                sentiment: 'neutral',
                time: '2 ساعت پیش',
                impact: 'high'
            },
            {
                id: 4,
                title: 'شرکت تسلا بیت‌کوین بیشتری خرید',
                summary: 'ایلان ماسک اعلام کرد تسلا 500 میلیون دلار بیت‌کوین دیگر خریداری کرده',
                category: 'crypto',
                source: 'Tesla Inc',
                sentiment: 'positive',
                time: '3 ساعت پیش',
                impact: 'high'
            },
            {
                id: 5,
                title: 'قیمت طلا افت کرد',
                summary: 'قیمت طلا در پی تقویت دلار 2 درصد کاهش یافت',
                category: 'commodities',
                source: 'Bloomberg',
                sentiment: 'negative',
                time: '4 ساعت پیش',
                impact: 'medium'
            }
        ];

        this.renderNewsList(this.newsData);
        this.updateNewsStats(this.newsData);
    }

    renderNewsList(newsData) {
        const container = document.getElementById('main-news-list');
        if (!container) return;

        const html = newsData.map(news => {
            const sentimentColor = news.sentiment === 'positive' ? 'text-green-400' :
                                 news.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400';
            
            const sentimentIcon = news.sentiment === 'positive' ? '📈' :
                                news.sentiment === 'negative' ? '📉' : '➡️';

            const impactBadge = news.impact === 'high' ? 'bg-red-600 text-red-100' :
                              news.impact === 'medium' ? 'bg-yellow-600 text-yellow-100' : 'bg-gray-600 text-gray-100';

            return `
                <div class="p-4 hover:bg-gray-700 transition-colors cursor-pointer" onclick="newsModule.showNewsDetail(${news.id})">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <span class="text-lg mr-2">${sentimentIcon}</span>
                                <h4 class="text-white font-semibold text-sm">${news.title}</h4>
                            </div>
                            <p class="text-gray-300 text-xs mb-3 line-clamp-2">${news.summary}</p>
                            <div class="flex items-center justify-between text-xs">
                                <div class="flex items-center space-x-3 space-x-reverse">
                                    <span class="text-gray-400">${news.source}</span>
                                    <span class="px-2 py-1 ${impactBadge} rounded text-xs">${news.impact}</span>
                                </div>
                                <span class="text-gray-500">${news.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    updateNewsStats(newsData) {
        const positive = newsData.filter(n => n.sentiment === 'positive').length;
        const negative = newsData.filter(n => n.sentiment === 'negative').length;
        const important = newsData.filter(n => n.impact === 'high').length;
        const total = newsData.length;

        document.getElementById('positive-news-count').textContent = positive;
        document.getElementById('negative-news-count').textContent = negative;
        document.getElementById('important-events-count').textContent = important;
        document.getElementById('total-news-count').textContent = total;
    }

    async loadEconomicCalendar() {
        try {
            const response = await axios.get('/api/news/economic-calendar');
            
            if (response.data.success) {
                this.economicEvents = response.data.events;
                this.renderEconomicCalendar(this.economicEvents);
            }
        } catch (error) {
            console.error('Error loading economic calendar:', error);
            this.loadMockEconomicCalendar();
        }
    }

    loadMockEconomicCalendar() {
        this.economicEvents = [
            {
                time: '09:00',
                country: 'US',
                event: 'CPI Data',
                importance: 'high',
                previous: '3.2%',
                forecast: '3.1%',
                actual: '3.0%'
            },
            {
                time: '14:30',
                country: 'EU',
                event: 'ECB Interest Rate',
                importance: 'high', 
                previous: '4.5%',
                forecast: '4.5%',
                actual: '-'
            },
            {
                time: '16:00',
                country: 'UK',
                event: 'GDP Growth',
                importance: 'medium',
                previous: '0.2%',
                forecast: '0.3%',
                actual: '-'
            }
        ];

        this.renderEconomicCalendar(this.economicEvents);
    }

    renderEconomicCalendar(events) {
        const tableBody = document.getElementById('economic-calendar-table');
        if (!tableBody) return;

        const rows = events.map(event => {
            const importanceColor = event.importance === 'high' ? 'text-red-400' :
                                  event.importance === 'medium' ? 'text-yellow-400' : 'text-gray-400';
            
            const importanceIcon = event.importance === 'high' ? '🔴' :
                                 event.importance === 'medium' ? '🟡' : '⚪';

            return `
                <tr class="hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${event.time}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${event.country}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-white">${event.event}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${importanceColor}">
                        ${importanceIcon} ${event.importance}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${event.previous}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${event.forecast}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">${event.actual}</td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rows;
    }

    setupEventListeners() {
        // Category filter
        const categorySelect = document.getElementById('news-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.loadNewsData();
            });
        }

        console.log('📡 News event listeners set up');
    }

    showNewsDetail(newsId) {
        const news = this.newsData.find(n => n.id === newsId);
        if (news) {
            // Show detailed news modal or navigate to detail page
            alert(`جزئیات خبر: ${news.title}\n\n${news.summary}`);
        }
    }

    async refreshNews() {
        this.showAlert('در حال بروزرسانی اخبار...', 'info');
        await this.loadNewsData();
        await this.loadEconomicCalendar();
        this.showAlert('اخبار بروزرسانی شد', 'success');
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
        console.log('🗑️ Destroying News module...');
        
        // Clear data
        this.newsData = [];
        this.economicEvents = [];
        
        console.log('✅ News module destroyed');
    }
}

// Global instance for TitanModules namespace
if (typeof window.TitanModules === 'undefined') {
    window.TitanModules = {};
}

window.TitanModules.NewsModule = NewsModule;

// Global instance for direct access
window.newsModule = null;

// Export for module loader
// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.NewsModule = NewsModule;