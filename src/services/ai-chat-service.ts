/**
 * AI Chat Service - Cloudflare Workers Compatible
 * Simplified version using fetch API instead of external SDKs
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice' | 'command';
  metadata?: {
    market_data?: any;
    trading_context?: any;
    confidence?: number;
  };
}

export interface ConversationContext {
  userId: string;
  conversationId: string;
  provider?: 'openai' | 'anthropic';
  model?: string;
  timestamp: string;
  userProfile: {
    username: string;
    preferences: {
      language: 'fa' | 'en';
      tradingExperience?: string;
    };
  };
}

export interface AIResponse {
  id: string;
  message: string;
  confidence: number;
  provider: string;
  model: string;
  timestamp: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  conversationId: string;
  suggestedActions?: Array<{
    action: string;
    description: string;
    risk_level: 'low' | 'medium' | 'high';
  }>;
  marketAnalysis?: {
    symbol: string;
    trend: 'bullish' | 'bearish' | 'neutral';
    recommendation: 'buy' | 'sell' | 'hold';
    reasoning: string;
  };
}

export class AIChatService {
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 30000;

  constructor() {
    // No initialization needed - all done via environment variables
  }

  /**
   * Process chat message and generate AI response
   */
  async processMessage(message: string, context: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!message?.trim()) {
        throw new Error('پیام نمی‌تواند خالی باشد');
      }

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Get conversation history
      const history = await this.getConversationHistory(context.conversationId, context.userId);
      
      // Build messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-8).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message.trim() }
      ];

      // Choose provider and process
      const provider = context.provider || 'openai';
      let response: AIResponse;

      if (provider === 'openai') {
        response = await this.processWithOpenAI(messages, context, startTime);
      } else if (provider === 'anthropic') {
        response = await this.processWithAnthropic(messages, context, startTime);
      } else {
        response = this.generateMockResponse(message, context, startTime);
      }

      // Save messages to database
      await this.saveMessage(context.conversationId, context.userId, 'user', message);
      await this.saveMessage(context.conversationId, context.userId, 'assistant', response.message, {
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        processingTimeMs: response.processingTimeMs,
        confidence: response.confidence
      });

      return response;

    } catch (error) {
      console.error('AI Chat Error:', error);
      return this.generateErrorResponse(message, context, startTime);
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const ispersian = context.userProfile.preferences.language === 'fa';
    
    const prompts = {
      fa: `شما آرتمیس هستید، دستیار هوش مصنوعی پیشرفته سیستم معاملاتی تایتان.

ویژگی‌های کلیدی:
- به فارسی پاسخ دهید
- متخصص بازارهای ارز دیجیتال و مالی
- مشاوره معاملاتی عملی بر اساس تحلیل تکنیکال ارائه دهید
- همیشه مدیریت ریسک را در نظر بگیرید  
- مختصر اما مفید باشید
- سطح اعتماد تحلیل‌هایتان را مشخص کنید

راهنمای پاسخ:
- همیشه ارزیابی ریسک پیشنهادات ارائه دهید
- اقدامات مشخص پیشنهاد دهید
- توضیح کوتاهی از دلایل ارائه دهید
- اگر درباره قیمت‌ها سؤال شد، یادآوری کنید که داده‌های لحظه‌ای بررسی شود`,

      en: `You are Artemis, an advanced AI trading assistant for the TITAN Trading System.

Key characteristics:
- Respond in English
- Expert in cryptocurrency and financial markets
- Provide actionable trading advice based on technical analysis
- Always consider risk management
- Be concise but informative
- Include confidence levels for your analysis

Response guidelines:
- Always provide risk assessment for suggestions
- Suggest specific actions when appropriate
- Explain your reasoning briefly
- If asked about prices, remind to check real-time data`
    };

    return prompts[ispersian ? 'fa' : 'en'];
  }

  private async processWithOpenAI(messages: any[], context: ConversationContext, startTime: number): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestBody = {
      model: context.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      user: context.userId
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const usage = data.usage;

    if (!choice?.message?.content) {
      throw new Error('No response content from OpenAI');
    }

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      message: choice.message.content.trim(),
      confidence: 0.85,
      provider: 'openai',
      model: data.model || context.model || 'gpt-3.5-turbo',
      timestamp: new Date().toISOString(),
      tokensUsed: usage?.total_tokens || 0,
      processingTimeMs: Date.now() - startTime,
      conversationId: context.conversationId,
      suggestedActions: this.extractSuggestedActions(choice.message.content)
    };
  }

  private async processWithAnthropic(messages: any[], context: ConversationContext, startTime: number): Promise<AIResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const requestBody = {
      model: context.model || 'claude-3-haiku-20240307',
      system: systemMessage,
      messages: conversationMessages,
      max_tokens: 800,
      temperature: 0.7
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0];

    if (!content?.text) {
      throw new Error('No response content from Anthropic');
    }

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      message: content.text.trim(),
      confidence: 0.88,
      provider: 'anthropic',
      model: data.model || context.model || 'claude-3-haiku-20240307',
      timestamp: new Date().toISOString(),
      tokensUsed: data.usage?.output_tokens || 0,
      processingTimeMs: Date.now() - startTime,
      conversationId: context.conversationId,
      suggestedActions: this.extractSuggestedActions(content.text)
    };
  }

  private generateMockResponse(message: string, context: ConversationContext, startTime: number): AIResponse {
    const ispersian = context.userProfile.preferences.language === 'fa';
    
    const responses = {
      fa: [
        'سلام! من آرتمیس هستم، دستیار هوش مصنوعی سیستم تایتان. چطور می‌تونم کمکتون کنم؟',
        'بازار امروز متغیر است. بهتر است استراتژی محافظه‌کارانه داشته باشید.',
        'برای تحلیل دقیق‌تر، لطفاً نماد مورد نظرتان را مشخص کنید.',
        'ریسک‌پذیری در معاملات بسیار مهم است. همیشه حد ضرر تعین کنید.',
        'سیستم در حال به‌روزرسانی داده‌هاست. لطفاً کمی صبر کنید...'
      ],
      en: [
        'Hello! I\'m Artemis, your AI trading assistant. How can I help you today?',
        'Market conditions are volatile today. Consider a conservative approach.',
        'For detailed analysis, please specify the symbol you\'re interested in.',
        'Risk management is crucial in trading. Always set stop-loss orders.',
        'System is updating market data. Please wait a moment...'
      ]
    };

    const langResponses = responses[ispersian ? 'fa' : 'en'];
    const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      message: randomResponse,
      confidence: 0.6,
      provider: 'mock',
      model: 'titan-mock-v1',
      timestamp: new Date().toISOString(),
      tokensUsed: 0,
      processingTimeMs: Date.now() - startTime,
      conversationId: context.conversationId,
      suggestedActions: [{
        action: 'check_portfolio',
        description: ispersian ? 'بررسی پورتفولیو' : 'Check portfolio',
        risk_level: 'low' as const
      }]
    };
  }

  private generateErrorResponse(message: string, context: ConversationContext, startTime: number): AIResponse {
    const isPersian = context.userProfile.preferences.language === 'fa';
    
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      message: isPersian 
        ? 'متاسفم، خطایی در پردازش پیام شما رخ داده است. لطفاً دوباره تلاش کنید.'
        : 'Sorry, there was an error processing your message. Please try again.',
      confidence: 0,
      provider: 'error',
      model: 'error',
      timestamp: new Date().toISOString(),
      tokensUsed: 0,
      processingTimeMs: Date.now() - startTime,
      conversationId: context.conversationId,
      suggestedActions: [{
        action: 'retry',
        description: isPersian ? 'تلاش مجدد' : 'Retry',
        risk_level: 'low' as const
      }]
    };
  }

  private extractSuggestedActions(content: string): Array<{action: string, description: string, risk_level: 'low' | 'medium' | 'high'}> {
    // Simple extraction - can be enhanced with more sophisticated parsing
    const actions = [];
    
    if (content.includes('buy') || content.includes('خرید')) {
      actions.push({
        action: 'consider_buy',
        description: 'Consider buying opportunity',
        risk_level: 'medium' as const
      });
    }
    
    if (content.includes('sell') || content.includes('فروش')) {
      actions.push({
        action: 'consider_sell', 
        description: 'Consider selling position',
        risk_level: 'medium' as const
      });
    }

    if (content.includes('portfolio') || content.includes('پورتفولیو')) {
      actions.push({
        action: 'check_portfolio',
        description: 'Review your portfolio',
        risk_level: 'low' as const
      });
    }

    return actions;
  }

  /**
   * Database integration methods - simplified for Cloudflare Workers
   */
  async getConversationHistory(conversationId: string, userId: string): Promise<ChatMessage[]> {
    // Mock implementation - replace with actual database queries
    try {
      // This would query your database for conversation messages
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  async saveMessage(conversationId: string, userId: string, role: string, content: string, metadata?: any): Promise<void> {
    try {
      // Mock implementation - replace with actual database insert
      console.log(`Saving message for conversation ${conversationId}: ${role} - ${content.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async getUserConversations(userId: string): Promise<any[]> {
    try {
      // Mock implementation - replace with actual database query
      return [];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  }

  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      // Mock implementation - replace with actual database delete
      console.log(`Deleting conversation ${conversationId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  async getServiceStatus(): Promise<any> {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

    return {
      status: 'operational',
      providers: {
        openai: {
          available: hasOpenAI,
          models: hasOpenAI ? ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'] : []
        },
        anthropic: {
          available: hasAnthropic,
          models: hasAnthropic ? ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'] : []
        },
        mock: {
          available: true,
          models: ['titan-mock-v1']
        }
      },
      features: {
        chatHistory: true,
        marketAnalysis: true,
        voiceProcessing: false,
        multiLanguage: true
      }
    };
  }
}