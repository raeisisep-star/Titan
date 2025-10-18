/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 REAL AI CHATBOT APIs with OpenAI, Claude, Gemini
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { getAIProvidersService } = require('../services/ai-providers');

module.exports = function(app, pool, redisClient) {

const aiService = getAIProvidersService();

// Auth middleware
const authMiddleware = async (c, next) => {
  try {
    const authorization = c.req.header('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    const token = authorization.substring(7);
    const result = await pool.query(
      'SELECT user_id FROM user_sessions WHERE session_token = $1 AND expires_at > NOW() AND is_active = true',
      [token]
    );
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }
    c.set('userId', result.rows[0].user_id);
    await next();
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CHATBOT API (with real AI)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/ai/chat/real', authMiddleware, async (c) => {
  try {
    const { message, context, preferredProvider } = await c.req.json();
    const userId = c.get('userId');
    
    if (!message || message.trim().length === 0) {
      return c.json({ success: false, error: 'پیام خالی است' }, 400);
    }

    // Prepare context for AI
    const aiContext = {
      systemPrompt: context?.systemPrompt || `You are Artemis, the mother AI of TITAN trading platform. You coordinate 15 specialized AI agents and help users with:
- Market analysis and trading strategies
- Portfolio management and optimization  
- Risk management and position sizing
- Technical and fundamental analysis
- Real-time market insights

Respond in Persian language. Be concise, accurate, and actionable. Use data-driven insights.`,
      maxTokens: context?.maxTokens || 600,
      temperature: context?.temperature || 0.7
    };

    // Call AI service
    const startTime = Date.now();
    const aiResponse = await aiService.chat(message, {
      preferredProvider,
      context: aiContext,
      fallback: true
    });
    const processingTime = Date.now() - startTime;

    // Save conversation to database
    const dbResult = await pool.query(`
      INSERT INTO ai_conversations 
      (user_id, message, response, provider, model, tokens_used, processing_time, context, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, created_at
    `, [
      userId,
      message,
      aiResponse.response,
      aiResponse.provider,
      aiResponse.model,
      aiResponse.usage?.total_tokens || 0,
      processingTime,
      JSON.stringify(context || {})
    ]);

    return c.json({
      success: true,
      conversationId: dbResult.rows[0].id,
      message,
      response: aiResponse.response,
      provider: aiResponse.provider,
      model: aiResponse.model,
      processingTime,
      usage: aiResponse.usage,
      timestamp: dbResult.rows[0].created_at
    });

  } catch (error) {
    console.error('Real AI Chat Error:', error);
    
    // Fallback to mock
    try {
      const userId = c.get('userId');
      const { message } = await c.req.json();
      
      const mockResponse = `سلام! من آرتمیس هستم. شما پرسیدید: "${message}". 
      
در حال حاضر سیستم AI در حال اتصال است. این یک پاسخ موقت است. برای دریافت پاسخ‌های دقیق‌تر لطفاً کلیدهای API را در تنظیمات تنظیم کنید.`;

      const dbResult = await pool.query(`
        INSERT INTO ai_conversations 
        (user_id, message, response, provider, model, created_at)
        VALUES ($1, $2, $3, 'mock', 'fallback-v1', NOW())
        RETURNING id, created_at
      `, [userId, message, mockResponse]);

      return c.json({
        success: true,
        conversationId: dbResult.rows[0].id,
        response: mockResponse,
        provider: 'mock-fallback',
        note: 'AI providers not available, using fallback response',
        error: error.message
      });
    } catch (dbError) {
      return c.json({ 
        success: false, 
        error: 'Chat service temporarily unavailable',
        details: error.message 
      }, 500);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED AI FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Get Trading Advice
app.post('/api/ai/trading-advice', authMiddleware, async (c) => {
  try {
    const { symbol, marketData, userProfile } = await c.req.json();
    const userId = c.get('userId');

    const result = await aiService.getTradingAdvice(
      symbol,
      marketData || {},
      userProfile || {}
    );

    // Save to database
    await pool.query(`
      INSERT INTO ai_decisions 
      (agent_id, user_id, decision_type, symbol, reasoning, data, created_at)
      VALUES ('agent_01', $1, 'analysis', $2, $3, $4, NOW())
    `, [
      userId,
      symbol,
      result.response,
      JSON.stringify({ marketData, provider: result.provider })
    ]);

    return c.json({
      success: true,
      advice: result.response,
      provider: result.provider,
      model: result.model,
      symbol
    });

  } catch (error) {
    console.error('Trading Advice Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Analyze Market Sentiment
app.post('/api/ai/market-sentiment', authMiddleware, async (c) => {
  try {
    const { newsArticles } = await c.req.json();

    const result = await aiService.analyzeMarketSentiment(newsArticles || []);

    return c.json({
      success: true,
      sentiment: result.response,
      provider: result.provider,
      model: result.model,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Market Sentiment Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Portfolio Optimization
app.post('/api/ai/portfolio-optimize', authMiddleware, async (c) => {
  try {
    const { holdings, goals, constraints } = await c.req.json();
    const userId = c.get('userId');

    const result = await aiService.optimizePortfolio(
      holdings || [],
      goals || {},
      constraints || {}
    );

    // Save recommendation
    await pool.query(`
      INSERT INTO ai_decisions 
      (agent_id, user_id, decision_type, reasoning, data, created_at)
      VALUES ('agent_04', $1, 'portfolio_optimization', $2, $3, NOW())
    `, [
      userId,
      result.response,
      JSON.stringify({ holdings, goals, constraints })
    ]);

    return c.json({
      success: true,
      optimization: result.response,
      provider: result.provider,
      model: result.model
    });

  } catch (error) {
    console.error('Portfolio Optimize Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// AI PROVIDERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// Get Available Providers
app.get('/api/ai/providers', authMiddleware, async (c) => {
  const available = aiService.getAvailableProviders();
  const allProviders = ['openai', 'anthropic', 'google'];
  
  return c.json({
    success: true,
    providers: allProviders.map(p => ({
      name: p,
      available: available.includes(p),
      models: p === 'openai' ? ['gpt-4', 'gpt-3.5-turbo'] :
              p === 'anthropic' ? ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] :
              p === 'google' ? ['gemini-pro', 'gemini-ultra'] : []
    })),
    default: aiService.chooseBestProvider()
  });
});

// Health Check AI Providers
app.get('/api/ai/providers/health', authMiddleware, async (c) => {
  try {
    const health = await aiService.healthCheck();
    
    return c.json({
      success: true,
      providers: health,
      timestamp: new Date()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ARTEMIS ORCHESTRATION (Mother AI)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/artemis/orchestrate', authMiddleware, async (c) => {
  try {
    const { task, agents, data } = await c.req.json();
    const userId = c.get('userId');

    // Artemis coordinates multiple agents for complex tasks
    const orchestrationPrompt = `
You are Artemis, the mother AI orchestrating ${agents?.length || 'multiple'} specialized AI agents.

Task: ${task}
Agents involved: ${agents?.join(', ') || 'auto-select'}
Data: ${JSON.stringify(data || {})}

Coordinate the agents and provide:
1. Analysis from each relevant agent
2. Synthesized recommendation
3. Action plan
4. Risk assessment

Respond in Persian with structured output.
`;

    const result = await aiService.chat(orchestrationPrompt, {
      context: {
        systemPrompt: 'You are Artemis, the master AI coordinator.',
        maxTokens: 1200,
        temperature: 0.6
      }
    });

    // Log orchestration
    await pool.query(`
      INSERT INTO ai_decisions 
      (agent_id, user_id, decision_type, reasoning, data, created_at)
      VALUES ('artemis', $1, 'orchestration', $2, $3, NOW())
    `, [
      userId,
      result.response,
      JSON.stringify({ task, agents, data })
    ]);

    return c.json({
      success: true,
      orchestration: result.response,
      provider: result.provider,
      model: result.model,
      task
    });

  } catch (error) {
    console.error('Artemis Orchestration Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

console.log('✅ Real AI Chatbot APIs loaded');

}; // End of module.exports
