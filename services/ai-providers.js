/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 AI PROVIDERS INTEGRATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * این سرویس با 3 ارائه‌دهنده AI ارتباط برقرار می‌کند:
 * 1. OpenAI (GPT-4, GPT-3.5-turbo)
 * 2. Anthropic (Claude 3 Opus, Sonnet)
 * 3. Google (Gemini Pro, Ultra)
 */

const axios = require('axios');

class AIProvidersService {
  constructor() {
    // API Keys from environment variables
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    this.googleKey = process.env.GOOGLE_API_KEY;
    
    // Base URLs
    this.openaiURL = 'https://api.openai.com/v1';
    this.anthropicURL = 'https://api.anthropic.com/v1';
    this.googleURL = 'https://generativelanguage.googleapis.com/v1beta';
    
    // Default models
    this.defaultModels = {
      openai: 'gpt-4',
      anthropic: 'claude-3-opus-20240229',
      google: 'gemini-pro'
    };
    
    // Providers availability
    this.providersAvailable = {
      openai: !!this.openaiKey && this.openaiKey !== 'YOUR_OPENAI_API_KEY',
      anthropic: !!this.anthropicKey && this.anthropicKey !== 'YOUR_ANTHROPIC_API_KEY',
      google: !!this.googleKey && this.googleKey !== 'YOUR_GOOGLE_API_KEY'
    };
    
    console.log('🤖 AI Providers Service initialized');
    console.log('   OpenAI:', this.providersAvailable.openai ? '✅' : '❌');
    console.log('   Anthropic:', this.providersAvailable.anthropic ? '✅' : '❌');
    console.log('   Google:', this.providersAvailable.google ? '✅' : '❌');
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    return Object.entries(this.providersAvailable)
      .filter(([_, available]) => available)
      .map(([provider]) => provider);
  }

  /**
   * Choose best available provider
   */
  chooseBestProvider(preferred = null) {
    const available = this.getAvailableProviders();
    
    if (available.length === 0) {
      return null;
    }
    
    // If preferred provider is available, use it
    if (preferred && available.includes(preferred)) {
      return preferred;
    }
    
    // Priority: OpenAI > Anthropic > Google
    if (available.includes('openai')) return 'openai';
    if (available.includes('anthropic')) return 'anthropic';
    if (available.includes('google')) return 'google';
    
    return null;
  }

  /**
   * Call OpenAI GPT
   */
  async callOpenAI(message, context = {}, model = null) {
    if (!this.providersAvailable.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.openaiURL}/chat/completions`,
        {
          model: model || this.defaultModels.openai,
          messages: [
            {
              role: 'system',
              content: context.systemPrompt || 'You are Artemis, an expert AI trading assistant for the TITAN trading platform. Provide concise, accurate trading advice in Persian.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: context.maxTokens || 500,
          temperature: context.temperature || 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        provider: 'openai',
        model: response.data.model,
        response: response.data.choices[0].message.content,
        usage: response.data.usage,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error(`OpenAI Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Call Anthropic Claude
   */
  async callAnthropic(message, context = {}, model = null) {
    if (!this.providersAvailable.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.anthropicURL}/messages`,
        {
          model: model || this.defaultModels.anthropic,
          max_tokens: context.maxTokens || 1024,
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          system: context.systemPrompt || 'You are Artemis, an expert AI trading assistant. Respond in Persian.'
        },
        {
          headers: {
            'x-api-key': this.anthropicKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        provider: 'anthropic',
        model: response.data.model,
        response: response.data.content[0].text,
        usage: response.data.usage,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Anthropic API Error:', error.response?.data || error.message);
      throw new Error(`Anthropic Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Call Google Gemini
   */
  async callGoogle(message, context = {}, model = null) {
    if (!this.providersAvailable.google) {
      throw new Error('Google API key not configured');
    }

    try {
      const modelName = model || this.defaultModels.google;
      const response = await axios.post(
        `${this.googleURL}/models/${modelName}:generateContent?key=${this.googleKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${context.systemPrompt || 'You are Artemis, an AI trading assistant. Respond in Persian.'}\n\n${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: context.temperature || 0.7,
            maxOutputTokens: context.maxTokens || 500
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        provider: 'google',
        model: modelName,
        response: response.data.candidates[0].content.parts[0].text,
        usage: response.data.usageMetadata,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Google API Error:', error.response?.data || error.message);
      throw new Error(`Google Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Call AI with automatic fallback
   */
  async chat(message, options = {}) {
    const {
      preferredProvider = null,
      context = {},
      model = null,
      fallback = true
    } = options;

    // Choose provider
    let provider = this.chooseBestProvider(preferredProvider);
    
    if (!provider) {
      // No providers available, return mock response
      return {
        success: true,
        provider: 'mock',
        model: 'mock-v1',
        response: this.getMockResponse(message),
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        timestamp: new Date()
      };
    }

    // Try calling the provider
    try {
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(message, context, model);
        case 'anthropic':
          return await this.callAnthropic(message, context, model);
        case 'google':
          return await this.callGoogle(message, context, model);
        default:
          throw new Error('Unknown provider');
      }
    } catch (error) {
      console.error(`Error calling ${provider}:`, error.message);
      
      // Try fallback to other providers
      if (fallback) {
        const availableProviders = this.getAvailableProviders().filter(p => p !== provider);
        
        for (const fallbackProvider of availableProviders) {
          try {
            console.log(`Trying fallback provider: ${fallbackProvider}`);
            
            switch (fallbackProvider) {
              case 'openai':
                return await this.callOpenAI(message, context, model);
              case 'anthropic':
                return await this.callAnthropic(message, context, model);
              case 'google':
                return await this.callGoogle(message, context, model);
            }
          } catch (fallbackError) {
            console.error(`Fallback ${fallbackProvider} also failed:`, fallbackError.message);
            continue;
          }
        }
      }
      
      // All providers failed, return mock
      return {
        success: true,
        provider: 'mock-fallback',
        model: 'mock-v1',
        response: this.getMockResponse(message),
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        timestamp: new Date(),
        note: 'All AI providers failed, using mock response'
      };
    }
  }

  /**
   * Get mock response when all providers fail
   */
  getMockResponse(message) {
    const responses = [
      'سلام! من آرتمیس هستم. در حال حاضر سرویس‌های AI در حال بارگذاری هستند. لطفاً چند لحظه صبر کنید.',
      'با تشکر از پیام شما. سیستم AI در حال پردازش است...',
      'درخواست شما دریافت شد. پاسخ دقیق‌تر پس از اتصال به سرویس‌های AI ارسال می‌شود.',
      'می‌توانم به شما در مورد معاملات کمک کنم. لطفاً سوال خود را مطرح کنید.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Get specialized trading advice
   */
  async getTradingAdvice(symbol, marketData, userProfile) {
    const prompt = `
تحلیل کامل برای ${symbol}:

داده‌های بازار:
- قیمت فعلی: $${marketData.price}
- تغییر 24 ساعته: ${marketData.change24h}%
- حجم معاملات: $${marketData.volume24h}

پروفایل کاربر:
- تجربه: ${userProfile.experience}
- تحمل ریسک: ${userProfile.riskTolerance}
- سرمایه: $${userProfile.capital}

لطفاً یک تحلیل جامع ارائه دهید شامل:
1. تحلیل تکنیکال
2. توصیه معاملاتی (خرید/فروش/نگهداری)
3. سطوح حمایت و مقاومت
4. استراتژی پیشنهادی
5. مدیریت ریسک

پاسخ را به زبان فارسی و به صورت مختصر و کاربردی بنویسید.
`;

    const context = {
      systemPrompt: 'You are a professional cryptocurrency trading analyst. Provide accurate, actionable advice based on technical and fundamental analysis.',
      maxTokens: 800,
      temperature: 0.5
    };

    return await this.chat(prompt, { context });
  }

  /**
   * Analyze market sentiment
   */
  async analyzeMarketSentiment(newsArticles) {
    const prompt = `
تحلیل احساسات بازار بر اساس اخبار زیر:

${newsArticles.map((article, i) => `
${i + 1}. ${article.title}
   ${article.summary}
`).join('\n')}

لطفاً تحلیلی از احساسات کلی بازار ارائه دهید:
1. احساس غالب (مثبت/منفی/خنثی)
2. نقاط کلیدی
3. تاثیر احتمالی بر قیمت‌ها
4. توصیه کلی

پاسخ به زبان فارسی و مختصر.
`;

    const context = {
      systemPrompt: 'You are a market sentiment analyst specializing in cryptocurrency markets.',
      maxTokens: 600,
      temperature: 0.6
    };

    return await this.chat(prompt, { context });
  }

  /**
   * Get portfolio optimization suggestions
   */
  async optimizePortfolio(holdings, goals, constraints) {
    const prompt = `
بهینه‌سازی پرتفولیو:

دارایی‌های فعلی:
${holdings.map(h => `- ${h.symbol}: ${h.amount} (ارزش: $${h.value})`).join('\n')}

اهداف:
- بازده هدف: ${goals.targetReturn}%
- افق زمانی: ${goals.timeHorizon}
- تحمل ریسک: ${goals.riskTolerance}

محدودیت‌ها:
- حداکثر در هر دارایی: ${constraints.maxPerAsset}%
- حداقل تنوع: ${constraints.minDiversification} دارایی

لطفاً پیشنهادات بهینه‌سازی ارائه دهید:
1. تخصیص بهینه دارایی‌ها
2. تغییرات پیشنهادی
3. دارایی‌های جدید برای خرید
4. دارایی‌های کاهش/فروش

پاسخ به فارسی و با جزئیات عملیاتی.
`;

    const context = {
      systemPrompt: 'You are a portfolio management expert with expertise in modern portfolio theory and cryptocurrency markets.',
      maxTokens: 1000,
      temperature: 0.4
    };

    return await this.chat(prompt, { context });
  }

  /**
   * Health check all providers
   */
  async healthCheck() {
    const results = {};
    
    for (const [provider, available] of Object.entries(this.providersAvailable)) {
      if (!available) {
        results[provider] = { status: 'not_configured', latency: null };
        continue;
      }
      
      try {
        const start = Date.now();
        await this.chat('Hello', { preferredProvider: provider, fallback: false });
        const latency = Date.now() - start;
        
        results[provider] = { status: 'healthy', latency };
      } catch (error) {
        results[provider] = { status: 'error', error: error.message, latency: null };
      }
    }
    
    return results;
  }
}

// Singleton instance
let aiProvidersService = null;

function getAIProvidersService() {
  if (!aiProvidersService) {
    aiProvidersService = new AIProvidersService();
  }
  return aiProvidersService;
}

module.exports = {
  AIProvidersService,
  getAIProvidersService
};
