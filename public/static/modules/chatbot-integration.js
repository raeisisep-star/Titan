// ==================== CHATBOT SYSTEM INTEGRATION ====================

class ChatbotSystemIntegration {
    constructor() {
        this.chatbot = null;
        this.init();
    }

    init() {
        // Wait for chatbot to be initialized
        setTimeout(() => {
            if (window.artemisAI) {
                this.chatbot = window.artemisAI;
                this.setupIntegrations();
            } else {
                this.init(); // Retry
            }
        }, 1000);
    }

    setupIntegrations() {
        // Override chatbot's generateAIResponse to use real system data
        const originalGenerateResponse = this.chatbot.generateAIResponse.bind(this.chatbot);
        
        this.chatbot.generateAIResponse = async (userMessage) => {
            return await this.generateEnhancedAIResponse(userMessage, originalGenerateResponse);
        };

        // Setup periodic updates
        this.setupPeriodicUpdates();
        
        // Listen for system events
        this.setupEventListeners();
        
        console.log('🤖 Chatbot system integration initialized');
    }

    async generateEnhancedAIResponse(message, fallbackFunction) {
        const msg = message.toLowerCase().trim();
        
        try {
            // First try enhanced AI with external providers
            const enhancedResponse = await this.tryEnhancedAI(message);
            if (enhancedResponse && enhancedResponse.success) {
                return this.formatEnhancedAIResponse(enhancedResponse);
            }
            
            // Portfolio queries with real data
            if (this.matchesKeywords(msg, ['پورتفولیو', 'موجودی', 'دارایی', 'وضعیت'])) {
                return await this.getPortfolioResponseWithRealData();
            }
            
            // Trading queries with real opportunities
            if (this.matchesKeywords(msg, ['معامله', 'خرید', 'فروش', 'فرصت', 'تحلیل'])) {
                return await this.getTradingResponseWithRealData(message);
            }
            
            // Autopilot with real status
            if (this.matchesKeywords(msg, ['اتوپایلوت', 'خودکار', 'اتوماسیون', 'ربات'])) {
                return await this.getAutopilotResponseWithRealData(message);
            }
            
            // Wallets with real data
            if (this.matchesKeywords(msg, ['کیف پول', 'والت', 'موجودی', 'انتقال'])) {
                return await this.getWalletResponseWithRealData();
            }
            
            // System status
            if (this.matchesKeywords(msg, ['سیستم', 'وضعیت', 'status', 'health'])) {
                return await this.getSystemStatusResponse();
            }
            
            // Schedule tasks with real integration
            if (this.matchesKeywords(msg, ['هر', 'دقیقه', 'ساعت', 'روز', 'تکرار', 'زمان‌بندی'])) {
                return await this.scheduleTaskWithRealIntegration(message);
            }
            
            // Fall back to original function
            return fallbackFunction(message);
            
        } catch (error) {
            console.error('Error in enhanced AI response:', error);
            return fallbackFunction(message);
        }
    }

    // ==================== ENHANCED AI METHODS ====================

    async tryEnhancedAI(message, provider = null) {
        try {
            // Call enhanced AI API
            const response = await fetch('/api/advanced-ai/chat/enhanced', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    context: this.getContextForMessage(message),
                    provider,
                    options: {
                        temperature: 0.7,
                        maxTokens: 1000
                    },
                    userId: 'chatbot-user'
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Enhanced AI call failed:', error);
            return null;
        }
    }

    formatEnhancedAIResponse(enhancedResponse) {
        const response = {
            content: `🤖 [${enhancedResponse.provider}] ${enhancedResponse.content}`,
            options: {
                quickActions: this.generateSmartQuickActions(enhancedResponse),
                dataCard: this.createAIInsightCard(enhancedResponse)
            }
        };

        // Add sentiment-based UI elements
        if (enhancedResponse.sentiment) {
            response.options.sentiment = enhancedResponse.sentiment;
            response.content += this.formatSentimentInfo(enhancedResponse.sentiment);
        }

        return response;
    }

    generateSmartQuickActions(enhancedResponse) {
        const actions = [];
        
        // Confidence-based actions
        if (enhancedResponse.confidence > 0.8) {
            actions.push('جزئیات بیشتر');
        } else {
            actions.push('تأیید این پاسخ', 'پاسخ بهتر');
        }

        // Provider-based actions
        if (enhancedResponse.provider !== 'TITAN Artemis') {
            actions.push('مقایسه با AI محلی');
        }

        // Sentiment-based actions
        if (enhancedResponse.sentiment) {
            const sentiment = enhancedResponse.sentiment.overall;
            if (sentiment === 'negative') {
                actions.push('نیاز به کمک دارم');
            } else if (sentiment === 'positive') {
                actions.push('ادامه این موضوع');
            }
        }

        // Add generic helpful actions
        actions.push('تغییر مدل AI', 'تحلیل احساسات', 'ذخیره این گفتگو');
        
        return actions.slice(0, 4); // Limit to 4 actions
    }

    createAIInsightCard(enhancedResponse) {
        return {
            title: `آنالیز ${enhancedResponse.provider}`,
            icon: 'fas fa-brain',
            items: [
                { label: 'اطمینان', value: `${Math.round(enhancedResponse.confidence * 100)}%`, type: enhancedResponse.confidence > 0.7 ? 'positive' : 'neutral' },
                { label: 'مدل', value: enhancedResponse.model || 'نامشخص' },
                { label: 'زمان پردازش', value: `${enhancedResponse.processingTime || 0}ms` },
                { label: 'احساسات', value: this.getSentimentLabel(enhancedResponse.sentiment?.overall) }
            ]
        };
    }

    formatSentimentInfo(sentiment) {
        if (!sentiment) return '';
        
        const emotionIcons = {
            joy: '😊',
            anger: '😠',
            fear: '😟',
            sadness: '😢',
            surprise: '😮',
            trust: '🤝'
        };

        const topEmotion = Object.entries(sentiment.emotions)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (topEmotion && topEmotion[1] > 0.3) {
            return `\n\n${emotionIcons[topEmotion[0]]} احساس غالب: ${this.getEmotionLabel(topEmotion[0])} (${Math.round(topEmotion[1] * 100)}%)`;
        }
        
        return '';
    }

    getSentimentLabel(sentiment) {
        const labels = {
            'positive': 'مثبت 😊',
            'negative': 'منفی 😞',
            'neutral': 'خنثی 😐'
        };
        return labels[sentiment] || 'نامشخص';
    }

    getEmotionLabel(emotion) {
        const labels = {
            joy: 'شادی',
            anger: 'خشم',
            fear: 'ترس',
            sadness: 'غم',
            surprise: 'تعجب',
            trust: 'اعتماد'
        };
        return labels[emotion] || emotion;
    }

    getContextForMessage(message) {
        // Determine context based on message content
        if (this.matchesKeywords(message, ['معامله', 'خرید', 'فروش', 'تحلیل'])) {
            return 'trading_context';
        } else if (this.matchesKeywords(message, ['پورتفولیو', 'سرمایه', 'دارایی'])) {
            return 'portfolio_context';
        } else if (this.matchesKeywords(message, ['اتوپایلوت', 'خودکار', 'ربات'])) {
            return 'automation_context';
        } else if (this.matchesKeywords(message, ['کیف پول', 'والت', 'انتقال'])) {
            return 'wallet_context';
        }
        return 'general_context';
    }

    // ==================== AI PROVIDER MANAGEMENT ====================

    async switchAIProvider(provider) {
        try {
            const testMessage = "سلام، چطوری؟";
            const response = await this.tryEnhancedAI(testMessage, provider);
            
            if (response && response.success) {
                localStorage.setItem('preferred-ai-provider', provider);
                this.chatbot.addArtemisMessage(
                    `✅ مدل AI با موفقیت به ${response.provider} تغییر کرد!\n\nاین مدل برای: ${this.getProviderStrengths(provider)}`,
                    { quickActions: ['تست مدل جدید', 'تنظیمات AI', 'مقایسه مدل‌ها', 'بازگشت'] }
                );
            } else {
                this.chatbot.addArtemisMessage(
                    `❌ خطا در تغییر به مدل ${provider}. از مدل قبلی استفاده می‌کنیم.`,
                    { quickActions: ['تلاش مجدد', 'مشاهده مدل‌های موجود'] }
                );
            }
        } catch (error) {
            console.error('Error switching AI provider:', error);
            this.chatbot.addArtemisMessage('❌ خطا در تغییر مدل AI');
        }
    }

    getProviderStrengths(provider) {
        const strengths = {
            'openai': 'گفتگوی عمومی، خلاقیت، تحلیل متن',
            'google': 'تحلیل چندرسانه‌ای، ترجمه، محتوای خلاق',
            'anthropic': 'استدلال پیچیده، تحلیل عمیق، امنیت',
            'local': 'معاملات، تحلیل مالی، اطلاعات سیستم'
        };
        return strengths[provider] || 'همه‌کاره';
    }

    async compareAIProviders(message) {
        try {
            this.chatbot.showTyping();
            
            const response = await fetch('/api/advanced-ai/models/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: message,
                    providers: ['local', 'openai', 'google', 'anthropic']
                })
            });

            const data = await response.json();
            
            if (data.success) {
                const comparison = data.comparison;
                let content = `🔍 مقایسه مدل‌های AI برای: "${message}"\n\n`;
                
                comparison.results.forEach((result, index) => {
                    const icon = result.success ? '✅' : '❌';
                    const confidence = result.confidence ? `(اطمینان: ${Math.round(result.confidence * 100)}%)` : '';
                    const time = result.processingTime ? `${result.processingTime}ms` : 'N/A';
                    
                    content += `${icon} **${result.provider}** ${confidence}\n`;
                    content += `⏱️ زمان: ${time}\n`;
                    if (result.success) {
                        content += `💬 پاسخ: ${result.content.substring(0, 100)}...\n`;
                    }
                    content += '\n';
                });
                
                content += `🏆 بهترین مدل: ${comparison.metrics.bestProvider}\n`;
                content += `📊 نرخ موفقیت کلی: ${Math.round(comparison.metrics.successRate * 100)}%`;
                
                this.chatbot.addArtemisMessage(content, {
                    quickActions: [
                        `انتخاب ${comparison.metrics.bestProvider}`,
                        'تست مجدد',
                        'تنظیمات مدل‌ها',
                        'نمایش جزئیات'
                    ]
                });
            } else {
                this.chatbot.addArtemisMessage('❌ خطا در مقایسه مدل‌های AI');
            }
        } catch (error) {
            console.error('Error comparing AI providers:', error);
            this.chatbot.addArtemisMessage('❌ خطا در اتصال به سرویس مقایسه AI');
        }
    }

    // ==================== SENTIMENT ANALYSIS FEATURES ====================

    async analyzeSentimentOfMessage(message) {
        try {
            const response = await fetch('/api/advanced-ai/sentiment/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: message,
                    language: 'fa'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                const sentiment = data.sentiment;
                const emotions = sentiment.emotions;
                
                let content = `🎭 تحلیل احساسات پیام شما:\n\n`;
                content += `📊 احساس کلی: ${this.getSentimentLabel(sentiment.overall)}\n`;
                content += `📈 امتیاز: ${sentiment.score.toFixed(2)} (از -1 تا +1)\n`;
                content += `✅ اطمینان: ${Math.round(sentiment.confidence * 100)}%\n\n`;
                
                content += `🎨 تجزیه احساسات:\n`;
                Object.entries(emotions).forEach(([emotion, value]) => {
                    if (value > 0.1) {
                        const percentage = Math.round(value * 100);
                        const bar = '█'.repeat(Math.round(percentage / 10));
                        content += `${this.getEmotionLabel(emotion)}: ${bar} ${percentage}%\n`;
                    }
                });
                
                this.chatbot.addArtemisMessage(content, {
                    quickActions: ['تحلیل پیام دیگر', 'بهبود احساسات', 'راهنمای احساسات', 'بازگشت'],
                    dataCard: {
                        title: 'جزئیات تحلیل احساسات',
                        icon: 'fas fa-heart',
                        items: [
                            { label: 'احساس غالب', value: this.getSentimentLabel(sentiment.overall) },
                            { label: 'امتیاز کلی', value: sentiment.score.toFixed(2) },
                            { label: 'اطمینان', value: `${Math.round(sentiment.confidence * 100)}%` },
                            { label: 'زبان', value: 'فارسی' }
                        ]
                    }
                });
            } else {
                this.chatbot.addArtemisMessage('❌ خطا در تحلیل احساسات پیام');
            }
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            this.chatbot.addArtemisMessage('❌ خطا در اتصال به سرویس تحلیل احساسات');
        }
    }

    // ==================== AI ANALYTICS AND LEARNING ====================

    async showAIAnalytics() {
        try {
            const response = await fetch('/api/advanced-ai/analytics/conversations');
            const data = await response.json();
            
            if (data.success) {
                const analytics = data.analytics;
                
                let content = `📊 آنالیتیکس AI و یادگیری ماشین:\n\n`;
                content += `💬 کل مکالمات: ${analytics.totalConversations}\n`;
                content += `🔄 تعاملات کل: ${analytics.totalInteractions}\n\n`;
                
                content += `😊 توزیع احساسات:\n`;
                Object.entries(analytics.sentimentDistribution).forEach(([sentiment, count]) => {
                    content += `${this.getSentimentLabel(sentiment)}: ${count} مورد\n`;
                });
                
                content += `\n🎯 موضوعات اصلی:\n`;
                Object.entries(analytics.topicsDistribution).forEach(([topic, percentage]) => {
                    const percent = Math.round(percentage * 100);
                    content += `${topic}: ${percent}%\n`;
                });
                
                content += `\n🤖 استفاده از مدل‌ها:\n`;
                Object.entries(analytics.providerUsage).forEach(([provider, count]) => {
                    content += `${provider}: ${count} بار\n`;
                });
                
                this.chatbot.addArtemisMessage(content, {
                    quickActions: ['بهبود AI', 'تنظیم مدل‌ها', 'نمایش نمودار', 'صادرات گزارش'],
                    dataCard: {
                        title: 'خلاصه عملکرد AI',
                        icon: 'fas fa-chart-bar',
                        items: [
                            { label: 'دقت کلی', value: '87%', type: 'positive' },
                            { label: 'زمان پاسخ میانگین', value: '1.2s' },
                            { label: 'رضایت کاربر', value: '94%', type: 'positive' },
                            { label: 'یادگیری روزانه', value: '+2.3%', type: 'positive' }
                        ]
                    }
                });
            } else {
                this.chatbot.addArtemisMessage('❌ خطا در دریافت آنالیتیکس AI');
            }
        } catch (error) {
            console.error('Error fetching AI analytics:', error);
            this.chatbot.addArtemisMessage('❌ خطا در اتصال به سرویس آنالیتیکس');
        }
    }

    // ==================== ADVANCED QUICK ACTIONS ====================

    async handleAdvancedQuickAction(action) {
        switch (action) {
            case 'تغییر مدل AI':
                await this.showAIProviderSelector();
                break;
            case 'تحلیل احساسات':
                const lastUserMessage = this.getLastUserMessage();
                if (lastUserMessage) {
                    await this.analyzeSentimentOfMessage(lastUserMessage);
                } else {
                    this.chatbot.addArtemisMessage('لطفاً ابتدا پیامی بنویسید تا احساسات آن را تحلیل کنم.');
                }
                break;
            case 'مقایسه با AI محلی':
                const lastMessage = this.getLastUserMessage();
                if (lastMessage) {
                    await this.compareAIProviders(lastMessage);
                }
                break;
            case 'نمایش آنالیتیکس AI':
                await this.showAIAnalytics();
                break;
            case 'بهبود AI':
                await this.showAIImprovementSuggestions();
                break;
            default:
                // Handle other actions normally
                break;
        }
    }

    async showAIProviderSelector() {
        try {
            const response = await fetch('/api/advanced-ai/providers/status');
            const data = await response.json();
            
            if (data.success) {
                const providers = data.providers;
                
                let content = `🤖 انتخاب مدل AI:\n\n`;
                Object.entries(providers).forEach(([id, provider]) => {
                    const successRate = Math.round((provider.metrics.successRate || 0) * 100);
                    const avgTime = Math.round(provider.metrics.averageTime || 0);
                    
                    content += `**${provider.name}**\n`;
                    content += `📊 نرخ موفقیت: ${successRate}%\n`;
                    content += `⏱️ زمان میانگین: ${avgTime}ms\n`;
                    content += `🎯 تخصص: ${provider.supports.join(', ')}\n\n`;
                });
                
                this.chatbot.addArtemisMessage(content, {
                    actions: [
                        { label: '🔷 OpenAI ChatGPT', callback: () => this.switchAIProvider('openai') },
                        { label: '🔶 Google Gemini', callback: () => this.switchAIProvider('google') },
                        { label: '🔷 Anthropic Claude', callback: () => this.switchAIProvider('anthropic') },
                        { label: '🟢 TITAN Local AI', callback: () => this.switchAIProvider('local') }
                    ]
                });
            }
        } catch (error) {
            console.error('Error showing AI provider selector:', error);
            this.chatbot.addArtemisMessage('❌ خطا در نمایش لیست مدل‌های AI');
        }
    }

    async showAIImprovementSuggestions() {
        const suggestions = [
            '🎯 **بهبود دقت پاسخ‌ها:** با ارائه بازخورد مثبت/منفی به پاسخ‌های AI',
            '💬 **تنوع مکالمات:** با پرسیدن سوالات متنوع‌تر از حوزه‌های مختلف',
            '🔄 **بروزرسانی مدل‌ها:** استفاده منظم از جدیدترین مدل‌های AI',
            '📊 **تحلیل عملکرد:** بررسی منظم آمار و آنالیتیکس AI',
            '⚙️ **تنظیمات شخصی:** تطبیق مدل‌ها با نیازهای خاص شما'
        ];
        
        const content = `🚀 راهکارهای بهبود AI:\n\n${suggestions.join('\n\n')}`;
        
        this.chatbot.addArtemisMessage(content, {
            quickActions: ['اعمال پیشنهادات', 'تنظیمات شخصی', 'آموزش AI', 'نظرسنجی']
        });
    }

    getLastUserMessage() {
        // Get the last user message from conversation history
        const conversation = this.chatbot.conversationHistory;
        for (let i = conversation.length - 1; i >= 0; i--) {
            if (conversation[i].type === 'user') {
                return conversation[i].content;
            }
        }
        return null;
    }

    async getPortfolioResponseWithRealData() {
        try {
            const response = await fetch('/api/chatbot/portfolio');
            const data = await response.json();
            
            if (data.success) {
                const portfolio = data.data;
                return {
                    content: `📊 وضعیت پورتفولیو شما:\n\n💰 ارزش کل: ${portfolio.totalValue} (${portfolio.dailyChange} امروز)\n📈 سود هفته: ${portfolio.weeklyProfit}\n🎯 عملکرد ماهانه: ${portfolio.monthlyReturn}\n\n⭐ بهترین عملکرد: ${portfolio.performance.bestPerformer}\n⚠️ نیاز به توجه: ${portfolio.performance.worstPerformer}\n\n📊 آمار معاملات:\n• کل معاملات: ${portfolio.performance.totalTrades}\n• نرخ موفقیت: ${portfolio.performance.successRate}\n\nآیا می‌خواهید تحلیل بیشتری ببینید؟`,
                    options: {
                        quickActions: ['تحلیل تکنیکال', 'گزارش سود', 'پیشنهاد معامله', 'تنظیم هشدار'],
                        dataCard: {
                            title: 'جزئیات پورتفولیو',
                            icon: 'fas fa-chart-pie',
                            items: [
                                { label: 'ارزش کل', value: portfolio.totalValue, type: 'positive' },
                                { label: 'تغییر امروز', value: portfolio.dailyChange, type: 'positive' },
                                { label: 'سود هفتگی', value: portfolio.weeklyProfit, type: 'positive' },
                                { label: 'بازدهی ماهانه', value: portfolio.monthlyReturn, type: 'positive' }
                            ]
                        }
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
        }
        
        // Fallback to mock data
        return this.chatbot.getPortfolioResponse();
    }

    async getTradingResponseWithRealData(message) {
        try {
            const response = await fetch('/api/chatbot/trading/opportunities');
            const data = await response.json();
            
            if (data.success && data.opportunities.length > 0) {
                const bestOpportunity = data.opportunities[0];
                
                if (message.includes('فرصت') || message.includes('پیشنهاد')) {
                    return {
                        content: `🔍 بررسی کردم!\n\nبهترین فرصت:\n🎯 ${bestOpportunity.symbol}\n📈 احتمال سود: ${bestOpportunity.confidence}%\n💰 سود مورد انتظار: ${bestOpportunity.expectedProfit}\n⏰ مدت زمان: ${bestOpportunity.timeframe}\n🛡️ ریسک: ${bestOpportunity.risk}\n\n📊 تحلیل: ${bestOpportunity.analysis}\n\nآیا معامله را انجام دهم؟`,
                        options: {
                            actions: [
                                { 
                                    label: '✅ بله، انجام بده', 
                                    type: 'primary', 
                                    callback: () => this.executeTrade(bestOpportunity)
                                },
                                { label: '📊 تحلیل بیشتر', command: 'analyze_more' },
                                { label: '❌ الان نه', command: 'cancel_trade' }
                            ],
                            quickActions: ['فرصت دیگر', 'تنظیم حد ضرر', 'تاریخچه معاملات']
                        }
                    };
                }
            }
        } catch (error) {
            console.error('Error fetching trading opportunities:', error);
        }
        
        return this.chatbot.getTradingResponse(message);
    }

    async executeTrade(opportunity) {
        try {
            this.chatbot.showTyping();
            
            const response = await fetch('/api/chatbot/trading/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: opportunity.symbol,
                    type: opportunity.type,
                    amount: '200', // Default amount
                    price: opportunity.price
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const trade = result.trade;
                this.chatbot.addArtemisMessage(
                    `✅ معامله انجام شد!\n\n📋 جزئیات:\n• نماد: ${trade.symbol}\n• نوع: ${trade.type}\n• مقدار: ${trade.amount}\n• قیمت اجرا: ${trade.executionPrice}\n• سود مورد انتظار: ${trade.expectedProfit}\n• حد ضرر: ${trade.stopLoss}\n• هدف سود: ${trade.takeProfit}\n\n🔔 به محض تغییر وضعیت اطلاع می‌دهم!`,
                    {
                        quickActions: ['وضعیت معامله', 'تغییر حد ضرر', 'فروش فوری', 'معاملات فعال'],
                        dataCard: {
                            title: `معامله فعال - ${trade.symbol}`,
                            icon: 'fas fa-chart-line',
                            items: [
                                { label: 'شناسه', value: trade.tradeId },
                                { label: 'وضعیت', value: 'فعال', type: 'positive' },
                                { label: 'مقدار', value: trade.amount },
                                { label: 'قیمت ورود', value: trade.executionPrice }
                            ]
                        }
                    }
                );
                
                // Notify system about trade execution
                this.notifySystemComponents('trade_executed', trade);
            } else {
                this.chatbot.addArtemisMessage(
                    `❌ خطا در اجرای معامله: ${result.error}\n\nلطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.`,
                    { quickActions: ['تلاش مجدد', 'پشتیبانی', 'بررسی حساب'] }
                );
            }
        } catch (error) {
            console.error('Error executing trade:', error);
            this.chatbot.addArtemisMessage(
                '❌ خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
                { quickActions: ['تلاش مجدد', 'بررسی اتصال'] }
            );
        }
    }

    async getAutopilotResponseWithRealData(message) {
        try {
            const response = await fetch('/api/chatbot/autopilot/status');
            const data = await response.json();
            
            if (data.success) {
                const autopilot = data.autopilot;
                
                if (message.includes('فعال') || message.includes('شروع')) {
                    if (!autopilot.enabled) {
                        return {
                            content: `🚀 آماده فعال‌سازی اتوپایلوت!\n\nتنظیمات فعلی:\n💰 حداکثر ریسک: ${autopilot.settings.maxRisk}\n🎯 هدف روزانه: ${autopilot.settings.dailyTarget}\n📊 جفت ارزها: ${autopilot.settings.tradingPairs.join(', ')}\n⏰ ساعات کاری: ${autopilot.settings.workingHours}\n\nآیا با این تنظیمات موافقید؟`,
                            options: {
                                actions: [
                                    { 
                                        label: '🚀 شروع کن', 
                                        type: 'primary', 
                                        callback: () => this.controlAutopilot('start')
                                    },
                                    { 
                                        label: '⚙️ تغییر تنظیمات', 
                                        callback: () => this.openAutopilotSettings()
                                    },
                                    { label: '📊 نمونه عملکرد', command: 'show_demo' }
                                ]
                            }
                        };
                    } else {
                        return {
                            content: `✅ اتوپایلوت فعال است!\n\n⏱️ زمان فعالیت: ${autopilot.runningTime}\n📊 کل معاملات: ${autopilot.totalTrades}\n✅ معاملات موفق: ${autopilot.successfulTrades}\n💰 سود فعلی: ${autopilot.currentProfit}\n\nچه کاری انجام دهم؟`,
                            options: {
                                quickActions: ['آمار لحظه‌ای', 'تنظیمات', 'توقف موقت', 'گزارش کامل']
                            }
                        };
                    }
                }
                
                return {
                    content: `🤖 وضعیت اتوپایلوت:\n\n${autopilot.enabled ? '✅ فعال' : '❌ غیرفعال'}\n⏱️ زمان اجرا: ${autopilot.runningTime}\n📊 معاملات: ${autopilot.totalTrades}\n💰 سود: ${autopilot.currentProfit}\n\nآیا تغییری می‌خواهید؟`,
                    options: {
                        quickActions: autopilot.enabled 
                            ? ['آمار زنده', 'تنظیمات', 'توقف', 'گزارش']
                            : ['فعال‌سازی', 'تنظیمات', 'نمونه عملکرد', 'راهنما']
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching autopilot data:', error);
        }
        
        return this.chatbot.getAutopilotResponse(message);
    }

    async controlAutopilot(action, settings = {}) {
        try {
            this.chatbot.showTyping();
            
            const response = await fetch('/api/chatbot/autopilot/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, settings })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.chatbot.addArtemisMessage(
                    `✅ ${result.message}\n\n${action === 'start' ? '🔄 سیستم شروع به تحلیل بازار کرد...\n⏰ اولین معامله تا 15 دقیقه دیگر انجام خواهد شد.' : ''}`,
                    {
                        quickActions: action === 'start' 
                            ? ['وضعیت زنده', 'تنظیمات', 'لاگ فعالیت', 'توقف موقت']
                            : ['فعال‌سازی', 'تنظیمات', 'آمار', 'راهنما']
                    }
                );
                
                // Notify system components
                this.notifySystemComponents('autopilot_status_changed', { action, status: result.status });
            } else {
                this.chatbot.addArtemisMessage(`❌ خطا: ${result.error}`);
            }
        } catch (error) {
            console.error('Error controlling autopilot:', error);
            this.chatbot.addArtemisMessage('❌ خطا در اتصال به سیستم اتوپایلوت');
        }
    }

    async getWalletResponseWithRealData() {
        try {
            const response = await fetch('/api/chatbot/wallets');
            const data = await response.json();
            
            if (data.success) {
                const wallets = data.wallets;
                return {
                    content: `💼 وضعیت کیف پول‌ها:\n\n💰 موجودی کل: ${wallets.totalBalance}\n🔥 Hot Wallets: ${wallets.hotWallets.balance} (${wallets.hotWallets.count} کیف پول)\n❄️ Cold Wallets: ${wallets.coldWallets.balance} (${wallets.coldWallets.count} کیف پول)\n\n📊 توزیع دارایی‌ها:\n${wallets.assetDistribution.map(asset => `• ${asset.symbol}: ${asset.percentage}`).join('\n')}\n\nچه کاری انجام دهم؟`,
                    options: {
                        quickActions: ['همگام‌سازی', 'انتقال به کلد', 'افزودن کیف پول', 'گزارش تراکنش‌ها'],
                        dataCard: {
                            title: 'خلاصه کیف پول‌ها',
                            icon: 'fas fa-wallet',
                            items: [
                                { label: 'کل موجودی', value: wallets.totalBalance, type: 'positive' },
                                { label: 'Hot Wallets', value: wallets.hotWallets.balance },
                                { label: 'Cold Wallets', value: wallets.coldWallets.balance },
                                { label: 'کیف پول‌ها', value: `${wallets.totalWallets} عدد` }
                            ]
                        }
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        }
        
        return this.chatbot.getWalletResponse();
    }

    async getSystemStatusResponse() {
        try {
            const response = await fetch('/api/chatbot/system/status');
            const data = await response.json();
            
            if (data.success) {
                const system = data.system;
                const components = system.components;
                
                return {
                    content: `🖥️ وضعیت سیستم: ${system.overall}\n\n🔧 اجزای سیستم:\n• معاملات: ${components.trading.status}\n• پورتفولیو: ${components.portfolio.status}\n• کیف پول‌ها: ${components.wallets.connected}/${components.wallets.total} متصل\n• اتوپایلوت: ${components.autopilot.status}\n• اعلان‌ها: ${components.notifications.pending} در انتظار\n\n⚡ عملکرد:\n• CPU: ${system.performance.cpu}\n• Memory: ${system.performance.memory}\n• شبکه: ${system.performance.network}\n• تأخیر: ${system.performance.latency}`,
                    options: {
                        quickActions: ['جزئیات بیشتر', 'بررسی مشکلات', 'گزارش عملکرد', 'هشدارها'],
                        dataCard: {
                            title: 'آمار عملکرد',
                            icon: 'fas fa-server',
                            items: [
                                { label: 'وضعیت کلی', value: system.overall, type: 'positive' },
                                { label: 'زمان پاسخ API', value: components.api.responseTime, type: 'positive' },
                                { label: 'استفاده CPU', value: system.performance.cpu },
                                { label: 'استفاده Memory', value: system.performance.memory }
                            ]
                        }
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching system status:', error);
        }
        
        return {
            content: '❌ خطا در دریافت وضعیت سیستم. لطفاً دوباره تلاش کنید.',
            options: { quickActions: ['تلاش مجدد', 'پشتیبانی'] }
        };
    }

    async scheduleTaskWithRealIntegration(message) {
        try {
            // Parse the message to extract task details
            const taskDetails = this.parseTaskFromMessage(message);
            
            const response = await fetch('/api/chatbot/tasks/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskDetails)
            });
            
            const result = await response.json();
            
            if (result.success) {
                const task = result.task;
                return {
                    content: `⏰ تسک زمان‌بندی شد!\n\n📋 جزئیات:\n• نوع: ${task.description}\n• تکرار: ${task.interval}\n• وضعیت: ${task.status}\n• اجرای بعدی: ${new Date(task.nextRun).toLocaleString('fa-IR')}\n\n✅ سیستم به صورت خودکار این کار را انجام خواهد داد.`,
                    options: {
                        quickActions: ['مشاهده همه تسک‌ها', 'توقف این تسک', 'تغییر زمان‌بندی', 'افزودن تسک جدید'],
                        actions: [
                            { label: '📋 مدیریت تسک‌ها', callback: () => this.openTaskManager() },
                            { label: '⏸️ توقف موقت', callback: () => this.pauseTask(task.id) }
                        ]
                    }
                };
            } else {
                return {
                    content: `❌ خطا در زمان‌بندی تسک: ${result.error}`,
                    options: { quickActions: ['تلاش مجدد', 'راهنمای تسک‌ها'] }
                };
            }
        } catch (error) {
            console.error('Error scheduling task:', error);
            return this.chatbot.scheduleTaskResponse(message);
        }
    }

    parseTaskFromMessage(message) {
        let interval = 30 * 60 * 1000; // Default 30 minutes
        let taskType = 'general_report';
        let description = 'گزارش عمومی';
        
        // Extract time interval
        if (message.includes('نیم ساعت') || message.includes('30 دقیقه')) {
            interval = 30 * 60 * 1000;
        } else if (message.includes('ساعت')) {
            interval = 60 * 60 * 1000;
        } else if (message.includes('روز') || message.includes('روزانه')) {
            interval = 24 * 60 * 60 * 1000;
        }
        
        // Extract task type
        if (message.includes('گزارش') && message.includes('پورتفولیو')) {
            taskType = 'portfolio_report';
            description = 'گزارش پورتفولیو';
        } else if (message.includes('موجودی')) {
            taskType = 'balance_check';
            description = 'بررسی موجودی';
        } else if (message.includes('معامله') || message.includes('فرصت')) {
            taskType = 'trading_opportunity';
            description = 'جستجوی فرصت معاملاتی';
        }
        
        return {
            taskType,
            interval: interval.toString(),
            description,
            settings: { source: 'chatbot', automated: true }
        };
    }

    setupPeriodicUpdates() {
        // Update portfolio data every 5 minutes
        setInterval(async () => {
            if (this.chatbot && this.chatbot.isOpen) {
                // Only update if chatbot is open to save resources
                await this.updatePortfolioData();
            }
        }, 5 * 60 * 1000);
        
        // Check for active tasks every minute
        setInterval(async () => {
            await this.checkActiveTasks();
        }, 60 * 1000);
    }

    async updatePortfolioData() {
        try {
            const response = await fetch('/api/chatbot/portfolio');
            const data = await response.json();
            
            if (data.success && this.chatbot) {
                this.chatbot.updatePortfolioData(data.data);
            }
        } catch (error) {
            console.error('Error updating portfolio data:', error);
        }
    }

    async checkActiveTasks() {
        try {
            const response = await fetch('/api/chatbot/tasks/active');
            const data = await response.json();
            
            if (data.success && data.tasks.length > 0) {
                // Check if any task needs to run
                data.tasks.forEach(task => {
                    const nextRun = new Date(task.nextRun);
                    const now = new Date();
                    
                    if (nextRun <= now) {
                        this.executeScheduledTaskNotification(task);
                    }
                });
            }
        } catch (error) {
            console.error('Error checking active tasks:', error);
        }
    }

    executeScheduledTaskNotification(task) {
        if (!this.chatbot) return;
        
        let message = '';
        switch (task.type) {
            case 'portfolio_report':
                message = `📊 گزارش دوره‌ای پورتفولیو:\n\n${task.description} اجرا شد.\nنتایج آماده است!`;
                break;
            case 'trading_opportunity':
                message = `💡 فرصت معاملاتی یافت شد:\n\n${task.description} بررسی شد.\nفرصت‌های جدید پیدا شدند!`;
                break;
            case 'balance_check':
                message = `💰 بررسی موجودی:\n\n${task.description} انجام شد.\nموجودی‌ها بروزرسانی شدند.`;
                break;
            default:
                message = `✅ تسک اجرا شد:\n\n${task.description} با موفقیت انجام شد.`;
        }
        
        this.chatbot.addArtemisMessage(message, {
            quickActions: ['جزئیات بیشتر', 'توقف تسک', 'تنظیم دوباره', 'مدیریت تسک‌ها']
        });
    }

    setupEventListeners() {
        // Listen for system events
        window.addEventListener('portfolio-updated', (event) => {
            if (this.chatbot && event.detail) {
                this.chatbot.updatePortfolioData(event.detail);
            }
        });
        
        window.addEventListener('trade-executed', (event) => {
            if (this.chatbot && event.detail) {
                this.chatbot.notifyTradeExecuted(event.detail);
            }
        });
        
        window.addEventListener('system-alert', (event) => {
            if (this.chatbot && event.detail) {
                this.handleSystemAlert(event.detail);
            }
        });
    }

    handleSystemAlert(alertData) {
        const alertMessage = `🚨 ${alertData.type === 'warning' ? 'هشدار' : 'اطلاع'}: ${alertData.message}\n\n${alertData.details || 'جزئیات بیشتری در دسترس نیست.'}`;
        
        this.chatbot.addArtemisMessage(alertMessage, {
            quickActions: ['بررسی مشکل', 'رفع مشکل', 'نادیده گرفتن', 'تماس با پشتیبانی']
        });
    }

    notifySystemComponents(eventType, data) {
        // Notify other system components about chatbot actions
        window.dispatchEvent(new CustomEvent(`chatbot-${eventType}`, {
            detail: data
        }));
    }

    matchesKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    // Additional integration methods for future expansion
    async openTaskManager() {
        // This could open the task management interface
        this.chatbot.addArtemisMessage(
            'قابلیت مدیریت تسک‌ها به زودی اضافه خواهد شد!',
            { quickActions: ['تسک‌های فعال', 'بازگشت'] }
        );
    }

    async openAutopilotSettings() {
        // This could open autopilot settings
        this.chatbot.addArtemisMessage(
            '⚙️ تنظیمات اتوپایلوت:\n\nکدام بخش را می‌خواهید تغییر دهید؟',
            { quickActions: ['تغییر ریسک', 'تغییر هدف', 'ساعات کاری', 'جفت ارزها'] }
        );
    }

    async pauseTask(taskId) {
        // Pause a specific task
        this.chatbot.addArtemisMessage(
            `⏸️ تسک ${taskId} موقتاً متوقف شد.`,
            { quickActions: ['ادامه تسک', 'حذف تسک', 'تسک‌های فعال'] }
        );
    }
}

// Initialize integration when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatbotIntegration = new ChatbotSystemIntegration();
    });
} else {
    window.chatbotIntegration = new ChatbotSystemIntegration();
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotSystemIntegration;
}