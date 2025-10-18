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
                            <div class="flex justify-between items-center" data-sentiment="btc">
                                <span class="text-gray-300">BTC Sentiment</span>
                                <div class="flex items-center">
                                    <div class="w-20 bg-gray-700 rounded-full h-2 mr-3">
                                        <div class="sentiment-bar bg-green-400 h-2 rounded-full" style="width: 75%"></div>
                                    </div>
                                    <span class="sentiment-text text-green-400 text-sm">75% صعودی</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-center" data-sentiment="eth">
                                <span class="text-gray-300">ETH Sentiment</span>
                                <div class="flex items-center">
                                    <div class="w-20 bg-gray-700 rounded-full h-2 mr-3">
                                        <div class="sentiment-bar bg-yellow-400 h-2 rounded-full" style="width: 60%"></div>
                                    </div>
                                    <span class="sentiment-text text-yellow-400 text-sm">60% خنثی</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-center" data-sentiment="fear">
                                <span class="text-gray-300">شاخص ترس و طمع</span>
                                <div class="flex items-center">
                                    <div class="w-20 bg-gray-700 rounded-full h-2 mr-3">
                                        <div class="sentiment-bar bg-red-400 h-2 rounded-full" style="width: 35%"></div>
                                    </div>
                                    <span class="sentiment-text text-red-400 text-sm">35% ترس</span>
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
                params: this.filters,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });
            
            if (response.data.success) {
                this.newsData = response.data.data.news;
                this.sentiment = response.data.data.sentiment;
                this.renderNewsList(this.newsData);
                this.updateNewsStats(response.data.data.sentiment);
                this.updateSentimentDisplay(response.data.data.sentiment);
                
                // Update last update time
                const lastUpdateEl = document.getElementById('last-news-update');
                if (lastUpdateEl) {
                    lastUpdateEl.textContent = new Date().toLocaleTimeString('fa-IR');
                }
                
                // Load additional data
                await this.loadTrendingTopics();
                await this.loadBreakingNews();
                
                // Show success notification
                this.showAlert('اخبار با موفقیت به‌روزرسانی شد', 'success');
            } else {
                throw new Error(response.data.error || 'Failed to load news data');
            }
            
        } catch (error) {
            console.error('Error loading news data:', error);
            
            // Show error notification
            this.showAlert('خطا در دریافت اخبار از سرور. از داده‌های محلی استفاده شد.', 'warning');
            
            // Load mock data as fallback
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

        if (!newsData || newsData.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-gray-400">
                    <i class="fas fa-newspaper text-3xl mb-3"></i>
                    <p>هیچ خبری یافت نشد</p>
                </div>
            `;
            return;
        }

        const html = newsData.map(news => {
            const sentimentColor = news.sentiment === 'positive' ? 'text-green-400' :
                                 news.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400';
            
            const sentimentIcon = news.sentiment === 'positive' ? '📈' :
                                news.sentiment === 'negative' ? '📉' : '➡️';

            const impactBadge = news.impact === 'high' ? 'bg-red-600 text-red-100' :
                              news.impact === 'medium' ? 'bg-yellow-600 text-yellow-100' : 'bg-gray-600 text-gray-100';
            
            const impactText = {
                'high': 'بالا',
                'medium': 'متوسط',
                'low': 'پایین'
            }[news.impact] || news.impact;
            
            const timeDisplay = news.timeAgo || news.time || 'تازه منتشر شده';

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
                                    <span class="px-2 py-1 ${impactBadge} rounded text-xs">اهمیت ${impactText}</span>
                                    ${news.sentimentScore ? `<span class="${sentimentColor} text-xs">${Math.round(news.sentimentScore * 100)}% اطمینان</span>` : ''}
                                </div>
                                <span class="text-gray-500">${timeDisplay}</span>
                            </div>
                            ${news.tags && news.tags.length > 0 ? `
                                <div class="flex flex-wrap gap-1 mt-2">
                                    ${news.tags.slice(0, 3).map(tag => `<span class="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
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
            const response = await axios.get('/api/news/economic-calendar', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });
            
            if (response.data.success) {
                this.economicEvents = response.data.data.events;
                this.renderEconomicCalendar(this.economicEvents);
            } else {
                throw new Error(response.data.error || 'Failed to load economic calendar');
            }
        } catch (error) {
            console.error('Error loading economic calendar:', error);
            
            this.showAlert('خطا در دریافت تقویم اقتصادی. از داده‌های محلی استفاده شد.', 'warning');
            
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
            // Create detailed news modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto border border-gray-700">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-bold text-white">جزئیات خبر</h2>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-center space-x-4 space-x-reverse text-sm">
                                <span class="text-gray-400">${news.source}</span>
                                <span class="text-gray-500">${news.timeAgo || news.time}</span>
                                ${news.author ? `<span class="text-blue-400">نویسنده: ${news.author}</span>` : ''}
                            </div>
                            
                            <h1 class="text-2xl font-bold text-white leading-relaxed">${news.title}</h1>
                            
                            <div class="flex items-center space-x-3 space-x-reverse">
                                <span class="px-3 py-1 rounded text-sm ${
                                    news.sentiment === 'positive' ? 'bg-green-900/30 text-green-300' :
                                    news.sentiment === 'negative' ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'
                                }">
                                    ${
                                        news.sentiment === 'positive' ? '📈 مثبت' :
                                        news.sentiment === 'negative' ? '📉 منفی' : '➡️ خنثی'
                                    }
                                </span>
                                <span class="px-3 py-1 rounded text-sm ${
                                    news.impact === 'high' ? 'bg-red-900/30 text-red-300' :
                                    news.impact === 'medium' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-gray-900/30 text-gray-300'
                                }">
                                    اهمیت ${news.impact === 'high' ? 'بالا' : news.impact === 'medium' ? 'متوسط' : 'پایین'}
                                </span>
                                ${news.readTime ? `<span class="text-gray-400 text-sm">• ${news.readTime} مطالعه</span>` : ''}
                            </div>
                            
                            ${news.imageUrl ? `
                                <div class="rounded-lg overflow-hidden">
                                    <img src="${news.imageUrl}" alt="${news.title}" class="w-full h-64 object-cover" onerror="this.style.display='none'">
                                </div>
                            ` : ''}
                            
                            <div class="prose prose-invert max-w-none">
                                <p class="text-gray-300 leading-relaxed text-base">${news.content || news.summary}</p>
                            </div>
                            
                            ${news.tags && news.tags.length > 0 ? `
                                <div class="border-t border-gray-700 pt-4">
                                    <p class="text-sm text-gray-400 mb-2">برچسب‌ها:</p>
                                    <div class="flex flex-wrap gap-2">
                                        ${news.tags.map(tag => `<span class="bg-blue-900/30 text-blue-300 text-sm px-3 py-1 rounded-full">#${tag}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${news.url ? `
                                <div class="border-t border-gray-700 pt-4">
                                    <a href="${news.url}" target="_blank" class="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm">
                                        <i class="fas fa-external-link-alt mr-2"></i>
                                        مطالعه منبع اصلی
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    }

    async refreshNews() {
        this.showAlert('در حال بروزرسانی اخبار...', 'info');
        
        try {
            // Parallel loading for better performance
            await Promise.all([
                this.loadNewsData(),
                this.loadEconomicCalendar(),
                this.loadMarketSentiment(),
                this.loadBreakingNews()
            ]);
            
            this.showAlert('همه اخبار با موفقیت به‌روزرسانی شدند', 'success');
            
        } catch (error) {
            console.error('Refresh news error:', error);
            this.showAlert('خطا در به‌روزرسانی برخی اخبار', 'warning');
        }
    }

    showAlert(message, type = 'info') {
        // Use app's alert system if available
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(message, type);
            return;
        }
        
        // Create toast notification
        const toast = document.createElement('div');
        const bgColor = {
            'success': 'bg-green-600',
            'error': 'bg-red-600',
            'warning': 'bg-yellow-600',
            'info': 'bg-blue-600'
        }[type] || 'bg-blue-600';
        
        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm transform transition-all duration-300`;
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // New methods for additional API integration
    async loadMarketSentiment() {
        try {
            const response = await axios.get('/api/news/market-sentiment', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });
            
            if (response.data.success) {
                this.updateSentimentDisplay(response.data.data);
            }
        } catch (error) {
            console.error('Error loading market sentiment:', error);
        }
    }
    
    async loadBreakingNews() {
        try {
            const response = await axios.get('/api/news/breaking', {
                params: { limit: 3 },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });
            
            if (response.data.success && response.data.data.breakingNews.length > 0) {
                this.updateBreakingNews(response.data.data.breakingNews[0]);
            }
        } catch (error) {
            console.error('Error loading breaking news:', error);
        }
    }
    
    updateSentimentDisplay(sentimentData) {
        // Update sentiment bars for BTC, ETH, Market Fear
        const btcAsset = sentimentData.assets.find(a => a.symbol === 'BTC');
        const ethAsset = sentimentData.assets.find(a => a.symbol === 'ETH');
        
        if (btcAsset) {
            this.updateSentimentBar('BTC', btcAsset.score, btcAsset.sentiment);
        }
        
        if (ethAsset) {
            this.updateSentimentBar('ETH', ethAsset.score, ethAsset.sentiment);
        }
        
        // Update fear index
        if (sentimentData.marketMetrics.fearGreedIndex) {
            this.updateSentimentBar('Fear', sentimentData.marketMetrics.fearGreedIndex / 100 - 0.5, 'fear');
        }
    }
    
    updateSentimentBar(asset, score, sentiment) {
        // Convert score to percentage (score is between -1 and 1)
        const percentage = Math.max(0, Math.min(100, (score + 1) * 50));
        const color = sentiment === 'positive' ? 'bg-green-400' : 
                     sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400';
        const text = sentiment === 'positive' ? 'صعودی' :
                    sentiment === 'negative' ? 'نزولی' :
                    sentiment === 'fear' ? 'ترس' : 'خنثی';
        
        // Find and update the sentiment bar (this is a simplified approach)
        const sentimentBars = document.querySelectorAll('.w-20.bg-gray-700');
        if (asset === 'BTC' && sentimentBars[0]) {
            const bar = sentimentBars[0].querySelector('div');
            const label = sentimentBars[0].parentElement.querySelector('.text-sm');
            if (bar) {
                bar.className = `${color} h-2 rounded-full transition-all duration-500`;
                bar.style.width = `${percentage}%`;
            }
            if (label) {
                label.textContent = `${Math.round(percentage)}% ${text}`;
                label.className = `${color.replace('bg-', 'text-')} text-sm`;
            }
        }
    }
    
    updateBreakingNews(breakingNews) {
        const breakingEl = document.getElementById('breaking-news');
        if (breakingEl && breakingNews) {
            breakingEl.innerHTML = `
                <div class="flex items-center">
                    <div class="text-red-400 text-xl mr-3">🚨</div>
                    <div class="flex-1">
                        <h3 class="text-red-300 font-semibold">خبر فوری</h3>
                        <p class="text-red-200 text-sm mt-1">${breakingNews.title.replace(/^🚨\s*/, '')}</p>
                    </div>
                    <div class="mr-auto text-red-300 text-xs">${breakingNews.timeAgo}</div>
                </div>
            `;
        }
    }
    
    async loadTrendingTopics() {
        try {
            const response = await axios.get('/api/news/trending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });
            
            if (response.data.success) {
                this.renderTrendingTopics(response.data.data.topics);
            }
        } catch (error) {
            console.error('Error loading trending topics:', error);
        }
    }

    async loadBreakingNews() {
        try {
            const response = await axios.get('/api/news/breaking', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });
            
            if (response.data.success && response.data.data.news.length > 0) {
                this.renderBreakingNews(response.data.data.news[0]);
            }
        } catch (error) {
            console.error('Error loading breaking news:', error);
        }
    }

    updateSentimentDisplay(sentiment) {
        // Update sentiment statistics in the UI
        const positiveEl = document.getElementById('positive-news-count');
        const negativeEl = document.getElementById('negative-news-count');
        const totalEl = document.getElementById('total-news-count');
        const importantEl = document.getElementById('important-events-count');
        
        if (positiveEl) positiveEl.textContent = sentiment.positive_count;
        if (negativeEl) negativeEl.textContent = sentiment.negative_count;
        if (totalEl) totalEl.textContent = sentiment.total_count;
        if (importantEl) importantEl.textContent = Math.floor(sentiment.total_count * 0.3);

        // Update BTC sentiment
        const btcSentimentElements = document.querySelectorAll('[data-sentiment="btc"]');
        btcSentimentElements.forEach(el => {
            const bar = el.querySelector('.sentiment-bar');
            const text = el.querySelector('.sentiment-text');
            if (bar && text) {
                bar.style.width = `${sentiment.btc}%`;
                bar.className = `h-2 rounded-full ${sentiment.btc > 60 ? 'bg-green-400' : sentiment.btc > 40 ? 'bg-yellow-400' : 'bg-red-400'}`;
                text.textContent = `${sentiment.btc}% ${sentiment.btc > 60 ? 'صعودی' : sentiment.btc > 40 ? 'خنثی' : 'نزولی'}`;
                text.className = `text-sm ${sentiment.btc > 60 ? 'text-green-400' : sentiment.btc > 40 ? 'text-yellow-400' : 'text-red-400'}`;
            }
        });

        // Update ETH sentiment
        const ethSentimentElements = document.querySelectorAll('[data-sentiment="eth"]');
        ethSentimentElements.forEach(el => {
            const bar = el.querySelector('.sentiment-bar');
            const text = el.querySelector('.sentiment-text');
            if (bar && text) {
                bar.style.width = `${sentiment.eth}%`;
                bar.className = `h-2 rounded-full ${sentiment.eth > 60 ? 'bg-green-400' : sentiment.eth > 40 ? 'bg-yellow-400' : 'bg-red-400'}`;
                text.textContent = `${sentiment.eth}% ${sentiment.eth > 60 ? 'صعودی' : sentiment.eth > 40 ? 'خنثی' : 'نزولی'}`;
                text.className = `text-sm ${sentiment.eth > 60 ? 'text-green-400' : sentiment.eth > 40 ? 'text-yellow-400' : 'text-red-400'}`;
            }
        });

        // Update Market Fear
        const fearSentimentElements = document.querySelectorAll('[data-sentiment="fear"]');
        fearSentimentElements.forEach(el => {
            const bar = el.querySelector('.sentiment-bar');
            const text = el.querySelector('.sentiment-text');
            if (bar && text) {
                bar.style.width = `${sentiment.market_fear}%`;
                bar.className = `h-2 rounded-full ${sentiment.market_fear < 40 ? 'bg-green-400' : sentiment.market_fear < 70 ? 'bg-yellow-400' : 'bg-red-400'}`;
                text.textContent = `${sentiment.market_fear}% ${sentiment.market_fear < 40 ? 'طمع' : sentiment.market_fear < 70 ? 'خنثی' : 'ترس'}`;
                text.className = `text-sm ${sentiment.market_fear < 40 ? 'text-green-400' : sentiment.market_fear < 70 ? 'text-yellow-400' : 'text-red-400'}`;
            }
        });
    }

    renderTrendingTopics(topics) {
        const container = document.getElementById('trending-topics');
        if (!container) return;

        container.innerHTML = topics.map(topic => `
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-3 hover:bg-gray-600 transition-colors">
                <div class="flex items-center">
                    <span class="text-lg mr-3">${topic.category === 'crypto' ? '₿' : '📊'}</span>
                    <div>
                        <h4 class="text-white font-medium text-sm">${topic.keyword}</h4>
                        <p class="text-gray-400 text-xs">${topic.mentions} ذکر در 24 ساعت</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-semibold ${topic.change24h > 0 ? 'text-green-400' : topic.change24h < 0 ? 'text-red-400' : 'text-yellow-400'}">
                        ${topic.change24h > 0 ? '+' : ''}${topic.change24h.toFixed(1)}%
                    </div>
                    <div class="text-xs text-gray-500">تغییرات</div>
                </div>
            </div>
        `).join('');
    }

    renderBreakingNews(breakingNews) {
        const container = document.getElementById('breaking-news');
        if (!container) return;

        container.innerHTML = `
            <div class="flex items-center cursor-pointer hover:bg-red-800/20 p-2 rounded transition-colors">
                <div class="text-red-400 text-xl mr-3 animate-pulse">🚨</div>
                <div class="flex-1">
                    <h3 class="text-red-300 font-semibold">خبر فوری</h3>
                    <p class="text-red-200 text-sm mt-1">${breakingNews.summary}</p>
                </div>
                <div class="mr-auto">
                    <div class="text-red-300 text-xs">${breakingNews.timeAgo}</div>
                    <div class="text-red-400 text-xs font-semibold">${breakingNews.severity.toUpperCase()}</div>
                </div>
            </div>
        `;

        // Add click handler to show full news
        container.addEventListener('click', () => {
            this.showNewsDetails(breakingNews);
        });
    }

    showNewsDetails(newsItem) {
        // Create a modal to show full news details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-white">${newsItem.title || newsItem.summary}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center space-x-4 space-x-reverse text-sm text-gray-300">
                        <span class="bg-gray-700 px-2 py-1 rounded">${newsItem.source}</span>
                        <span>${newsItem.timeAgo}</span>
                        <span class="capitalize ${newsItem.impact === 'high' ? 'text-red-400' : newsItem.impact === 'medium' ? 'text-yellow-400' : 'text-green-400'}">
                            ${newsItem.impact === 'high' ? 'تأثیر بالا' : newsItem.impact === 'medium' ? 'تأثیر متوسط' : 'تأثیر کم'}
                        </span>
                    </div>
                    <p class="text-gray-300 leading-relaxed">${newsItem.content || newsItem.summary}</p>
                    ${newsItem.tags ? `
                        <div class="flex flex-wrap gap-2 mt-4">
                            ${newsItem.tags.map(tag => `<span class="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async analyzeSentiment(text) {
        try {
            const response = await axios.post('/api/news/sentiment-analysis', {
                text: text
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                return response.data.data.analysis;
            }
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
        }
        return null;
    }

    destroy() {
        console.log('🗑️ Destroying News module...');
        
        // Clear data
        this.newsData = [];
        this.economicEvents = [];
        
        // Remove any created modals or toasts
        document.querySelectorAll('.fixed.inset-0, .fixed.top-4').forEach(el => {
            if (el.innerHTML.includes('خبر') || el.innerHTML.includes('toast')) {
                el.remove();
            }
        });
        
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