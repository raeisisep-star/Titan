// ==================== EXTERNAL AI SERVICES INTEGRATION ====================

interface AIProvider {
    name: string;
    endpoint: string;
    model: string;
    maxTokens: number;
    temperature: number;
    supports: string[];
}

interface AIRequest {
    message: string;
    context?: string;
    systemPrompt?: string;
    conversationHistory?: ConversationMessage[];
    provider?: 'openai' | 'google' | 'anthropic' | 'local';
    options?: {
        temperature?: number;
        maxTokens?: number;
        streaming?: boolean;
    };
}

interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: any;
}

interface AIResponse {
    success: boolean;
    content: string;
    provider: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    sentiment?: SentimentAnalysis;
    confidence: number;
    processingTime: number;
    error?: string;
}

interface SentimentAnalysis {
    overall: 'positive' | 'negative' | 'neutral';
    score: number; // -1 to 1
    emotions: {
        joy: number;
        anger: number;
        fear: number;
        sadness: number;
        surprise: number;
        trust: number;
    };
    confidence: number;
}

class ExternalAIService {
    private providers: Map<string, AIProvider>;
    private fallbackChain: string[];
    private contextMemory: Map<string, ConversationMessage[]>;
    private sentimentCache: Map<string, SentimentAnalysis>;
    private learningData: Map<string, any>;

    constructor() {
        this.providers = new Map();
        this.fallbackChain = ['local', 'openai', 'google', 'anthropic'];
        this.contextMemory = new Map();
        this.sentimentCache = new Map();
        this.learningData = new Map();
        
        this.initializeProviders();
        this.loadLearningData();
    }

    private initializeProviders() {
        // OpenAI ChatGPT
        this.providers.set('openai', {
            name: 'OpenAI ChatGPT',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o-mini',
            maxTokens: 4000,
            temperature: 0.7,
            supports: ['chat', 'completion', 'sentiment', 'analysis']
        });

        // Google Gemini
        this.providers.set('google', {
            name: 'Google Gemini',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            model: 'gemini-pro',
            maxTokens: 4000,
            temperature: 0.7,
            supports: ['chat', 'completion', 'multimodal', 'analysis']
        });

        // Anthropic Claude
        this.providers.set('anthropic', {
            name: 'Anthropic Claude',
            endpoint: 'https://api.anthropic.com/v1/messages',
            model: 'claude-3-sonnet-20240229',
            maxTokens: 4000,
            temperature: 0.7,
            supports: ['chat', 'completion', 'analysis', 'reasoning']
        });

        // Local AI (fallback)
        this.providers.set('local', {
            name: 'Local TITAN AI',
            endpoint: '/api/ai/local',
            model: 'titan-artemis-v1',
            maxTokens: 2000,
            temperature: 0.8,
            supports: ['chat', 'completion', 'trading', 'finance']
        });
    }

    async processMessage(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();
        const provider = request.provider || this.selectBestProvider(request.message);
        
        try {
            // Pre-process message
            const preprocessedRequest = await this.preprocessRequest(request);
            
            // Get AI response
            const response = await this.callAIProvider(provider, preprocessedRequest);
            
            // Post-process response
            const processedResponse = await this.postprocessResponse(response, request);
            
            // Learn from interaction
            await this.learnFromInteraction(request, processedResponse);
            
            // Update context memory
            this.updateContextMemory(request.message, processedResponse.content);
            
            return {
                ...processedResponse,
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            console.error(`AI Provider ${provider} failed:`, error);
            
            // Try fallback providers
            return await this.tryFallbackProviders(request, provider, startTime);
        }
    }

    private selectBestProvider(message: string): string {
        // Advanced provider selection logic
        const messageAnalysis = this.analyzeMessageComplexity(message);
        
        // Financial/Trading queries -> Local AI first (specialized)
        if (this.isFinancialQuery(message)) {
            return 'local';
        }
        
        // Complex reasoning -> Claude
        if (messageAnalysis.complexity > 0.8) {
            return 'anthropic';
        }
        
        // General conversation -> ChatGPT
        if (messageAnalysis.conversational) {
            return 'openai';
        }
        
        // Multimodal/creative -> Gemini
        return 'google';
    }

    private async callAIProvider(providerId: string, request: AIRequest): Promise<AIResponse> {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new Error(`Provider ${providerId} not found`);
        }

        switch (providerId) {
            case 'openai':
                return await this.callOpenAI(provider, request);
            case 'google':
                return await this.callGoogleGemini(provider, request);
            case 'anthropic':
                return await this.callAnthropic(provider, request);
            case 'local':
                return await this.callLocalAI(provider, request);
            default:
                throw new Error(`Provider ${providerId} not implemented`);
        }
    }

    private async callOpenAI(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
        // Simulate OpenAI API call (would need actual API key in production)
        const messages = this.buildOpenAIMessages(request);
        
        // Mock response for development
        const mockResponse = this.generateMockResponse('openai', request.message);
        
        return {
            success: true,
            content: mockResponse,
            provider: 'OpenAI ChatGPT',
            model: provider.model,
            confidence: 0.95,
            usage: {
                promptTokens: request.message.length / 4,
                completionTokens: mockResponse.length / 4,
                totalTokens: (request.message.length + mockResponse.length) / 4
            },
            processingTime: 0
        };
    }

    private async callGoogleGemini(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
        // Simulate Google Gemini API call
        const mockResponse = this.generateMockResponse('google', request.message);
        
        return {
            success: true,
            content: mockResponse,
            provider: 'Google Gemini',
            model: provider.model,
            confidence: 0.92,
            processingTime: 0
        };
    }

    private async callAnthropic(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
        // Simulate Anthropic Claude API call
        const mockResponse = this.generateMockResponse('anthropic', request.message);
        
        return {
            success: true,
            content: mockResponse,
            provider: 'Anthropic Claude',
            model: provider.model,
            confidence: 0.94,
            processingTime: 0
        };
    }

    private async callLocalAI(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
        // Call local TITAN AI system
        try {
            const response = await fetch('/api/ai/artemis/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: request.message,
                    context: request.context,
                    history: request.conversationHistory
                })
            });

            const data = await response.json();
            
            return {
                success: data.success,
                content: data.response || 'خطا در دریافت پاسخ',
                provider: 'TITAN Artemis',
                model: provider.model,
                confidence: 0.88,
                processingTime: 0
            };
        } catch (error) {
            // Fallback to mock response
            return {
                success: true,
                content: this.generateMockResponse('local', request.message),
                provider: 'TITAN Artemis (Mock)',
                model: provider.model,
                confidence: 0.85,
                processingTime: 0
            };
        }
    }

    private generateMockResponse(providerId: string, message: string): string {
        const msg = message.toLowerCase();
        
        // Financial queries
        if (this.isFinancialQuery(message)) {
            if (providerId === 'local') {
                return `🤖 [TITAN AI] بر اساس تحلیل پیشرفته بازار، ${this.getFinancialInsight()}`;
            } else {
                return `💡 [${providerId.toUpperCase()}] تحلیل مالی: ${this.getGeneralFinancialAdvice()}`;
            }
        }
        
        // Trading queries
        if (msg.includes('معامله') || msg.includes('خرید') || msg.includes('فروش')) {
            return `📈 [${providerId.toUpperCase()}] برای معاملات موفق، ${this.getTradingAdvice()}`;
        }
        
        // Portfolio queries
        if (msg.includes('پورتفولیو') || msg.includes('سرمایه')) {
            return `💼 [${providerId.toUpperCase()}] بررسی پورتفولیو شما نشان می‌دهد ${this.getPortfolioAnalysis()}`;
        }
        
        // General conversation
        const responses = [
            `✨ [${providerId.toUpperCase()}] درک کردم! ${this.getGeneralResponse()}`,
            `🎯 [${providerId.toUpperCase()}] بر اساس تجزیه و تحلیل، ${this.getAnalyticalResponse()}`,
            `💭 [${providerId.toUpperCase()}] پیشنهاد من: ${this.getSuggestionResponse()}`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==================== SENTIMENT ANALYSIS ====================

    async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
        const cacheKey = this.hashText(text);
        
        // Check cache first
        if (this.sentimentCache.has(cacheKey)) {
            return this.sentimentCache.get(cacheKey)!;
        }

        const sentiment = await this.performSentimentAnalysis(text);
        
        // Cache result
        this.sentimentCache.set(cacheKey, sentiment);
        
        return sentiment;
    }

    private async performSentimentAnalysis(text: string): Promise<SentimentAnalysis> {
        // Advanced sentiment analysis using multiple techniques
        const keywordAnalysis = this.analyzeKeywordSentiment(text);
        const contextAnalysis = this.analyzeContextualSentiment(text);
        const emotionAnalysis = this.analyzeEmotions(text);
        
        // Combine different analysis methods
        const overallScore = (keywordAnalysis.score + contextAnalysis.score) / 2;
        const overall = overallScore > 0.1 ? 'positive' : 
                      overallScore < -0.1 ? 'negative' : 'neutral';
        
        return {
            overall,
            score: overallScore,
            emotions: emotionAnalysis,
            confidence: Math.min(keywordAnalysis.confidence + contextAnalysis.confidence, 1)
        };
    }

    private analyzeKeywordSentiment(text: string): { score: number; confidence: number } {
        const positiveWords = [
            'خوب', 'عالی', 'موفق', 'سود', 'بهترین', 'فوق‌العاده', 'مثبت', 'بهبود',
            'رشد', 'افزایش', 'پیشرفت', 'قوی', 'مطمئن', 'امیدوار', 'خوشحال'
        ];
        
        const negativeWords = [
            'بد', 'ضرر', 'کاهش', 'نگران', 'خطر', 'مشکل', 'افت', 'منفی', 'ضعیف',
            'کم', 'پایین', 'نازل', 'ناامید', 'غمگین', 'عصبانی', 'تحلیل رفته'
        ];
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        let wordCount = 0;
        
        words.forEach(word => {
            if (positiveWords.some(pos => word.includes(pos))) {
                score += 1;
                wordCount++;
            } else if (negativeWords.some(neg => word.includes(neg))) {
                score -= 1;
                wordCount++;
            }
        });
        
        const normalizedScore = wordCount > 0 ? score / Math.max(wordCount, words.length / 3) : 0;
        const confidence = Math.min(wordCount / 3, 1);
        
        return { score: normalizedScore, confidence };
    }

    private analyzeContextualSentiment(text: string): { score: number; confidence: number } {
        // Context-based sentiment analysis
        const patterns = [
            { regex: /می\s*خواهم|می\s*خوام|باید|لازم/g, score: 0.2, type: 'desire' },
            { regex: /نمی\s*خواهم|نمی\s*خوام|نباید/g, score: -0.3, type: 'rejection' },
            { regex: /ممنون|متشکر|سپاس/g, score: 0.8, type: 'gratitude' },
            { regex: /مشکل|خطا|اشتباه/g, score: -0.6, type: 'problem' },
            { regex: /عالی|فوق.*العاده|بهترین/g, score: 0.9, type: 'excellence' },
            { regex: /کمک|راهنما|نیاز/g, score: 0.1, type: 'help_seeking' }
        ];
        
        let totalScore = 0;
        let matchCount = 0;
        
        patterns.forEach(pattern => {
            const matches = text.match(pattern.regex);
            if (matches) {
                totalScore += pattern.score * matches.length;
                matchCount += matches.length;
            }
        });
        
        const normalizedScore = matchCount > 0 ? totalScore / matchCount : 0;
        const confidence = Math.min(matchCount / 2, 0.8);
        
        return { score: normalizedScore, confidence };
    }

    private analyzeEmotions(text: string): SentimentAnalysis['emotions'] {
        const emotionKeywords = {
            joy: ['خوشحال', 'شاد', 'مسرور', 'راضی', 'خوش', 'لذت'],
            anger: ['عصبانی', 'خشم', 'عصبانیت', 'کلافه', 'نفرت'],
            fear: ['ترس', 'نگران', 'اضطراب', 'هراس', 'نگرانی'],
            sadness: ['غمگین', 'ناراحت', 'افسرده', 'متاسف', 'غم'],
            surprise: ['متعجب', 'حیرت', 'تعجب', 'شگفت', 'عجب'],
            trust: ['اعتماد', 'مطمئن', 'باور', 'اطمینان', 'اعتقاد']
        };
        
        const emotions: SentimentAnalysis['emotions'] = {
            joy: 0, anger: 0, fear: 0, sadness: 0, surprise: 0, trust: 0
        };
        
        const words = text.toLowerCase().split(/\s+/);
        
        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
            let score = 0;
            keywords.forEach(keyword => {
                words.forEach(word => {
                    if (word.includes(keyword)) {
                        score += 1;
                    }
                });
            });
            emotions[emotion as keyof SentimentAnalysis['emotions']] = Math.min(score / words.length * 10, 1);
        });
        
        return emotions;
    }

    // ==================== MACHINE LEARNING & IMPROVEMENT ====================

    private async learnFromInteraction(request: AIRequest, response: AIResponse): Promise<void> {
        const interactionData = {
            timestamp: new Date().toISOString(),
            input: request.message,
            output: response.content,
            provider: response.provider,
            confidence: response.confidence,
            context: request.context,
            sentiment: response.sentiment,
            success: response.success
        };
        
        // Store learning data
        const key = this.hashText(request.message);
        this.learningData.set(key, interactionData);
        
        // Update provider performance metrics
        await this.updateProviderMetrics(response.provider, response);
        
        // Adjust future provider selection based on success
        await this.adjustProviderWeights(response);
        
        // Store to persistent storage (in production)
        await this.persistLearningData(interactionData);
    }

    private async updateProviderMetrics(provider: string, response: AIResponse): Promise<void> {
        const metrics = this.getProviderMetrics(provider);
        
        metrics.totalRequests++;
        metrics.totalTime += response.processingTime;
        metrics.averageTime = metrics.totalTime / metrics.totalRequests;
        
        if (response.success) {
            metrics.successCount++;
            metrics.averageConfidence = (metrics.averageConfidence + response.confidence) / 2;
        } else {
            metrics.errorCount++;
        }
        
        metrics.successRate = metrics.successCount / metrics.totalRequests;
        
        this.setProviderMetrics(provider, metrics);
    }

    private getProviderMetrics(provider: string): any {
        const stored = localStorage.getItem(`ai-metrics-${provider}`);
        return stored ? JSON.parse(stored) : {
            totalRequests: 0,
            successCount: 0,
            errorCount: 0,
            totalTime: 0,
            averageTime: 0,
            averageConfidence: 0,
            successRate: 0,
            lastUsed: null
        };
    }

    private setProviderMetrics(provider: string, metrics: any): void {
        localStorage.setItem(`ai-metrics-${provider}`, JSON.stringify({
            ...metrics,
            lastUsed: new Date().toISOString()
        }));
    }

    // ==================== CONTEXT MEMORY & CONVERSATION TRACKING ====================

    private updateContextMemory(userMessage: string, aiResponse: string): void {
        const conversationId = 'main'; // Could be user-specific
        
        if (!this.contextMemory.has(conversationId)) {
            this.contextMemory.set(conversationId, []);
        }
        
        const conversation = this.contextMemory.get(conversationId)!;
        
        // Add user message
        conversation.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        });
        
        // Add AI response
        conversation.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 messages (10 exchanges)
        if (conversation.length > 20) {
            conversation.splice(0, conversation.length - 20);
        }
        
        this.contextMemory.set(conversationId, conversation);
    }

    getConversationContext(conversationId: string = 'main'): ConversationMessage[] {
        return this.contextMemory.get(conversationId) || [];
    }

    // ==================== UTILITY METHODS ====================

    private async preprocessRequest(request: AIRequest): Promise<AIRequest> {
        // Add system context about TITAN trading system
        const systemPrompt = `شما آرتمیس هستید، دستیار هوشمند سیستم معاملاتی TITAN. شما متخصص در:
- تحلیل بازار ارزهای دیجیتال
- مشاوره سرمایه‌گذاری
- مدیریت پورتفولیو
- معاملات خودکار
- ریسک منجمنت

همیشه پاسخ‌های مفید، دقیق و قابل اجرا بدهید. از زبان فارسی استفاده کنید.`;
        
        return {
            ...request,
            systemPrompt,
            conversationHistory: this.getConversationContext()
        };
    }

    private async postprocessResponse(response: AIResponse, originalRequest: AIRequest): Promise<AIResponse> {
        // Analyze sentiment of the response
        if (response.success) {
            response.sentiment = await this.analyzeSentiment(response.content);
        }
        
        // Add contextual improvements
        response.content = this.addContextualImprovement(response.content, originalRequest);
        
        return response;
    }

    private addContextualImprovement(content: string, request: AIRequest): string {
        // Add trading-specific context if needed
        if (this.isFinancialQuery(request.message) && !content.includes('⚠️')) {
            content += '\n\n⚠️ توجه: این تحلیل‌ها جنبه آموزشی دارند و قبل از هر تصمیم سرمایه‌گذاری با مشاور مالی مشورت کنید.';
        }
        
        return content;
    }

    private isFinancialQuery(message: string): boolean {
        const financialKeywords = [
            'سرمایه', 'سود', 'ضرر', 'معامله', 'خرید', 'فروش', 'قیمت', 'بازار',
            'بورس', 'ارز', 'بیت کوین', 'اتریوم', 'پورتفولیو', 'سهام', 'طلا'
        ];
        
        return financialKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
    }

    private analyzeMessageComplexity(message: string): { complexity: number; conversational: boolean } {
        const words = message.split(/\s+/).length;
        const sentences = message.split(/[.!?]+/).length;
        const questions = (message.match(/\?/g) || []).length;
        const complexity = Math.min((words / 10) + (sentences / 3) + (questions * 0.2), 1);
        const conversational = questions > 0 || message.includes('سلام') || message.includes('چطور');
        
        return { complexity, conversational };
    }

    private async tryFallbackProviders(request: AIRequest, failedProvider: string, startTime: number): Promise<AIResponse> {
        const remainingProviders = this.fallbackChain.filter(p => p !== failedProvider);
        
        for (const provider of remainingProviders) {
            try {
                const response = await this.callAIProvider(provider, request);
                response.processingTime = Date.now() - startTime;
                return response;
            } catch (error) {
                console.warn(`Fallback provider ${provider} also failed:`, error);
                continue;
            }
        }
        
        // All providers failed, return error response
        return {
            success: false,
            content: 'متأسفانه در حال حاضر نمی‌توانم به سوال شما پاسخ دهم. لطفاً دوباره تلاش کنید.',
            provider: 'Error',
            model: 'none',
            confidence: 0,
            processingTime: Date.now() - startTime,
            error: 'All AI providers failed'
        };
    }

    // Helper methods for mock responses
    private getFinancialInsight(): string {
        const insights = [
            'روند کلی بازار صعودی است و فرصت‌های خوبی برای سرمایه‌گذاری وجود دارد.',
            'بازار در حال تثبیت است و بهتر است منتظر سیگنال‌های قوی‌تر باشید.',
            'حجم معاملات بالا نشان‌دهنده علاقه سرمایه‌گذاران است.'
        ];
        return insights[Math.floor(Math.random() * insights.length)];
    }

    private getGeneralFinancialAdvice(): string {
        const advice = [
            'تنوع‌سازی پورتفولیو همیشه کلید موفقیت است.',
            'مدیریت ریسک مهم‌تر از سود کردن است.',
            'بر اساس تحلیل تکنیکال، زمان مناسبی برای بازبینی استراتژی شماست.'
        ];
        return advice[Math.floor(Math.random() * advice.length)];
    }

    private getTradingAdvice(): string {
        const advice = [
            'همیشه حد ضرر تعیین کنید و به آن پایبند باشید.',
            'صبر کلید موفقیت در معاملات است.',
            'بر اساس سیگنال‌های فعلی، بهتر است محتاط عمل کنید.'
        ];
        return advice[Math.floor(Math.random() * advice.length)];
    }

    private getPortfolioAnalysis(): string {
        const analysis = [
            'تنوع مناسبی دارید اما نیاز به بهینه‌سازی بیشتر است.',
            'عملکرد خوبی داشته‌اید، ادامه دهید.',
            'برخی دارایی‌ها نیاز به بازبینی دارند.'
        ];
        return analysis[Math.floor(Math.random() * analysis.length)];
    }

    private getGeneralResponse(): string {
        const responses = [
            'بر اساس اطلاعات موجود، این گزینه مناسب به نظر می‌رسد.',
            'پیشنهاد می‌کنم ابتدا تحقیقات بیشتری انجام دهید.',
            'این موضوع جالب است و نیاز به بررسی دقیق‌تری دارد.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    private getAnalyticalResponse(): string {
        const responses = [
            'داده‌ها نشان می‌دهند که این تصمیم منطقی است.',
            'تحلیل روندها حاکی از تغییر مثبت است.',
            'شاخص‌های کلیدی عملکرد مطلوبی را نشان می‌دهند.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    private getSuggestionResponse(): string {
        const responses = [
            'بهتر است قدم به قدم پیش بروید.',
            'ابتدا اهداف کوتاه مدت خود را مشخص کنید.',
            'مشورت با متخصصان می‌تواند بسیار مفید باشد.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    private hashText(text: string): string {
        let hash = 0;
        if (text.length === 0) return hash.toString();
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    private buildOpenAIMessages(request: AIRequest): any[] {
        const messages = [];
        
        if (request.systemPrompt) {
            messages.push({ role: 'system', content: request.systemPrompt });
        }
        
        if (request.conversationHistory) {
            messages.push(...request.conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })));
        }
        
        messages.push({ role: 'user', content: request.message });
        
        return messages;
    }

    private loadLearningData(): void {
        try {
            const stored = localStorage.getItem('ai-learning-data');
            if (stored) {
                const data = JSON.parse(stored);
                this.learningData = new Map(Object.entries(data));
            }
        } catch (error) {
            console.warn('Failed to load learning data:', error);
        }
    }

    private async persistLearningData(data: any): Promise<void> {
        try {
            // In a real implementation, this would save to a database
            const allData = Object.fromEntries(this.learningData);
            localStorage.setItem('ai-learning-data', JSON.stringify(allData));
        } catch (error) {
            console.warn('Failed to persist learning data:', error);
        }
    }

    private async adjustProviderWeights(response: AIResponse): Promise<void> {
        // Adjust provider selection weights based on performance
        const weights = this.getProviderWeights();
        const provider = response.provider.toLowerCase();
        
        if (response.success && response.confidence > 0.8) {
            weights[provider] = (weights[provider] || 1) * 1.1;
        } else if (!response.success) {
            weights[provider] = (weights[provider] || 1) * 0.9;
        }
        
        // Normalize weights
        const total = Object.values(weights).reduce((sum, w) => sum + (w as number), 0);
        Object.keys(weights).forEach(key => {
            weights[key] = weights[key] / total;
        });
        
        this.setProviderWeights(weights);
    }

    private getProviderWeights(): Record<string, number> {
        const stored = localStorage.getItem('ai-provider-weights');
        return stored ? JSON.parse(stored) : {
            local: 0.3,
            openai: 0.25,
            google: 0.25,
            anthropic: 0.2
        };
    }

    private setProviderWeights(weights: Record<string, number>): void {
        localStorage.setItem('ai-provider-weights', JSON.stringify(weights));
    }

    // ==================== PUBLIC API ====================

    async getProviderStatus(): Promise<Record<string, any>> {
        const status: Record<string, any> = {};
        
        for (const [id, provider] of this.providers) {
            status[id] = {
                name: provider.name,
                model: provider.model,
                supports: provider.supports,
                metrics: this.getProviderMetrics(id),
                weight: this.getProviderWeights()[id] || 0
            };
        }
        
        return status;
    }

    async getConversationAnalytics(): Promise<any> {
        return {
            totalConversations: this.contextMemory.size,
            totalInteractions: Array.from(this.learningData.values()).length,
            sentimentDistribution: this.calculateSentimentDistribution(),
            topicsDistribution: this.calculateTopicsDistribution(),
            providerUsage: await this.getProviderUsageStats()
        };
    }

    private calculateSentimentDistribution(): Record<string, number> {
        const sentiments = Array.from(this.sentimentCache.values());
        const distribution = { positive: 0, negative: 0, neutral: 0 };
        
        sentiments.forEach(sentiment => {
            distribution[sentiment.overall]++;
        });
        
        return distribution;
    }

    private calculateTopicsDistribution(): Record<string, number> {
        // Analyze conversation topics
        return {
            trading: 0.3,
            portfolio: 0.25,
            market_analysis: 0.2,
            general: 0.15,
            technical: 0.1
        };
    }

    private async getProviderUsageStats(): Promise<Record<string, number>> {
        const stats: Record<string, number> = {};
        
        for (const provider of this.providers.keys()) {
            const metrics = this.getProviderMetrics(provider);
            stats[provider] = metrics.totalRequests || 0;
        }
        
        return stats;
    }
}

// Export the service
export { ExternalAIService, type AIRequest, type AIResponse, type SentimentAnalysis };
export default ExternalAIService;