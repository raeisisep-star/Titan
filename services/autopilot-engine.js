/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 AUTOPILOT ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * موتور خودکار معاملاتی
 * - معامله خودکار بر اساس هدف
 * - هماهنگی با 15 AI Agent
 * - اجرای استراتژی‌های چندگانه
 * - مدیریت خودکار ریسک
 */

const { getTradingExecutionService } = require('./trading-execution');
const { getRiskManagementService } = require('./risk-management');
const { getAIProvidersService } = require('./ai-providers');

class AutopilotEngine {
  constructor(pool) {
    this.pool = pool;
    this.tradingService = getTradingExecutionService(pool);
    this.riskService = getRiskManagementService(pool);
    this.aiService = getAIProvidersService();
    
    // Autopilot modes
    this.modes = {
      CONSERVATIVE: {
        riskPerTrade: 0.01, // 1% risk per trade
        maxDailyTrades: 5,
        preferredAssets: ['BTC', 'ETH'],
        aiConfidenceThreshold: 0.80
      },
      MODERATE: {
        riskPerTrade: 0.02, // 2% risk per trade
        maxDailyTrades: 10,
        preferredAssets: ['BTC', 'ETH', 'BNB', 'SOL'],
        aiConfidenceThreshold: 0.70
      },
      AGGRESSIVE: {
        riskPerTrade: 0.03, // 3% risk per trade
        maxDailyTrades: 20,
        preferredAssets: ['ALL'],
        aiConfidenceThreshold: 0.60
      }
    };
    
    // Active sessions
    this.activeSessions = new Map();
    
    console.log('🤖 Autopilot Engine initialized');
    console.log('   Modes: Conservative, Moderate, Aggressive');
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * SESSION MANAGEMENT
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Start autopilot session
   */
  async startSession(userId, params) {
    const {
      targetAmount,       // Target profit (e.g., turn $100 into $5000)
      initialBalance,     // Starting balance
      mode,              // CONSERVATIVE, MODERATE, AGGRESSIVE
      strategies,        // List of strategies to use
      maxDuration        // Maximum duration in hours
    } = params;
    
    try {
      console.log(`🚀 Starting Autopilot for user ${userId}`);
      console.log(`   Initial: $${initialBalance} → Target: $${targetAmount}`);
      console.log(`   Mode: ${mode}`);
      
      // Validate parameters
      if (targetAmount <= initialBalance) {
        return {
          success: false,
          error: 'Target must be greater than initial balance'
        };
      }
      
      // Check if user already has active session
      const existing = await this.pool.query(`
        SELECT id FROM autopilot_sessions 
        WHERE user_id = $1 AND status = 'running'
      `, [userId]);
      
      if (existing.rows.length > 0) {
        return {
          success: false,
          error: 'User already has an active autopilot session'
        };
      }
      
      // Create session
      const session = await this.pool.query(`
        INSERT INTO autopilot_sessions (
          user_id, status, mode, initial_balance, 
          target_amount, current_balance, strategies,
          started_at, max_duration_hours
        ) VALUES ($1, 'running', $2, $3, $4, $3, $5, NOW(), $6)
        RETURNING *
      `, [
        userId, mode, initialBalance, targetAmount, 
        JSON.stringify(strategies), maxDuration || 24
      ]);
      
      const sessionData = session.rows[0];
      
      // Store in active sessions
      this.activeSessions.set(userId, {
        id: sessionData.id,
        mode,
        targetAmount,
        currentBalance: initialBalance,
        strategies,
        startedAt: new Date()
      });
      
      // Start monitoring loop
      this.monitorSession(userId, sessionData.id);
      
      // Get initial AI recommendations
      const recommendations = await this.getAIRecommendations(userId, mode);
      
      return {
        success: true,
        session: sessionData,
        recommendations,
        message: 'Autopilot session started successfully'
      };
      
    } catch (error) {
      console.error('❌ Failed to start autopilot:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Stop autopilot session
   */
  async stopSession(userId, reason = 'USER_STOPPED') {
    try {
      const session = this.activeSessions.get(userId);
      if (!session) {
        return {
          success: false,
          error: 'No active session found'
        };
      }
      
      // Update session status
      const result = await this.pool.query(`
        UPDATE autopilot_sessions
        SET 
          status = 'stopped',
          stopped_at = NOW(),
          stop_reason = $2
        WHERE id = $1
        RETURNING *
      `, [session.id, reason]);
      
      // Remove from active sessions
      this.activeSessions.delete(userId);
      
      // Get final performance
      const performance = await this.getSessionPerformance(session.id);
      
      console.log(`⏹️ Autopilot stopped for user ${userId}`);
      console.log(`   Reason: ${reason}`);
      console.log(`   Final balance: $${performance.finalBalance}`);
      
      return {
        success: true,
        session: result.rows[0],
        performance,
        message: 'Autopilot session stopped'
      };
      
    } catch (error) {
      console.error('❌ Failed to stop autopilot:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Monitor active session
   */
  async monitorSession(userId, sessionId) {
    const checkInterval = 60000; // Check every minute
    
    const monitor = async () => {
      try {
        const session = this.activeSessions.get(userId);
        if (!session) {
          return; // Session ended
        }
        
        // Check if target reached
        const currentBalance = await this.getCurrentBalance(userId);
        if (currentBalance >= session.targetAmount) {
          await this.stopSession(userId, 'TARGET_REACHED');
          console.log(`🎯 Target reached for user ${userId}!`);
          return;
        }
        
        // Check for emergency stop
        const emergencyCheck = await this.riskService.shouldEmergencyStop(userId);
        if (emergencyCheck.emergencyStop) {
          await this.stopSession(userId, 'EMERGENCY_STOP');
          console.log(`🛑 Emergency stop triggered for user ${userId}`);
          return;
        }
        
        // Execute trading cycle
        await this.executeTradingCycle(userId, sessionId);
        
        // Schedule next check
        setTimeout(monitor, checkInterval);
        
      } catch (error) {
        console.error(`❌ Monitor error for user ${userId}:`, error.message);
        // Continue monitoring despite error
        setTimeout(monitor, checkInterval);
      }
    };
    
    // Start monitoring
    setTimeout(monitor, checkInterval);
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * TRADING CYCLE
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Execute one trading cycle
   */
  async executeTradingCycle(userId, sessionId) {
    console.log(`🔄 Executing trading cycle for user ${userId}`);
    
    try {
      // Step 1: Get AI analysis from all agents
      const aiAnalysis = await this.consultAIAgents(userId);
      
      // Step 2: Filter opportunities based on confidence
      const session = this.activeSessions.get(userId);
      const modeConfig = this.modes[session.mode];
      
      const opportunities = aiAnalysis.opportunities.filter(opp => 
        opp.confidence >= modeConfig.aiConfidenceThreshold
      );
      
      if (opportunities.length === 0) {
        console.log('   No high-confidence opportunities found');
        return;
      }
      
      // Step 3: Sort by confidence and expected return
      opportunities.sort((a, b) => {
        const scoreA = a.confidence * a.expectedReturn;
        const scoreB = b.confidence * b.expectedReturn;
        return scoreB - scoreA;
      });
      
      // Step 4: Execute top opportunities
      const maxTrades = modeConfig.maxDailyTrades;
      const todayTrades = await this.getTodayTradeCount(userId);
      const remainingTrades = maxTrades - todayTrades;
      
      if (remainingTrades <= 0) {
        console.log('   Daily trade limit reached');
        return;
      }
      
      // Execute up to 3 trades per cycle
      const tradesToExecute = Math.min(3, remainingTrades, opportunities.length);
      
      for (let i = 0; i < tradesToExecute; i++) {
        const opportunity = opportunities[i];
        await this.executeOpportunity(userId, sessionId, opportunity);
      }
      
      // Step 5: Check and update protection orders
      await this.tradingService.checkProtectionOrders(userId);
      
      // Step 6: Update session performance
      await this.updateSessionPerformance(sessionId);
      
    } catch (error) {
      console.error('❌ Trading cycle error:', error.message);
    }
  }
  
  /**
   * Execute a trading opportunity
   */
  async executeOpportunity(userId, sessionId, opportunity) {
    const {
      symbol,
      side,
      entryPrice,
      stopLoss,
      takeProfit,
      confidence,
      agentId
    } = opportunity;
    
    try {
      console.log(`   Executing: ${side} ${symbol} (confidence: ${(confidence * 100).toFixed(1)}%)`);
      
      // Calculate position size
      const session = this.activeSessions.get(userId);
      const modeConfig = this.modes[session.mode];
      
      const positionCalc = await this.riskService.calculatePositionSize(userId, {
        symbol,
        entryPrice,
        stopLoss,
        riskPerTrade: modeConfig.riskPerTrade
      });
      
      if (!positionCalc.recommended) {
        console.log(`   ⚠️ Position not recommended: ${positionCalc.reason}`);
        return;
      }
      
      // Execute trade
      const result = await this.tradingService.executeTrade(userId, {
        symbol,
        side,
        quantity: positionCalc.positionSize,
        price: entryPrice,
        orderType: 'MARKET',
        stopLoss,
        takeProfit,
        exchange: 'simulated',
        strategy: 'AUTOPILOT',
        agentId
      });
      
      if (result.success) {
        // Record in autopilot_trades
        await this.pool.query(`
          INSERT INTO autopilot_trades (
            session_id, trade_id, symbol, side, quantity, 
            entry_price, stop_loss, take_profit, ai_confidence, agent_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          sessionId, result.trade.id, symbol, side, positionCalc.positionSize,
          entryPrice, stopLoss, takeProfit, confidence, agentId
        ]);
        
        console.log(`   ✅ Trade executed: ${result.trade.id}`);
      } else {
        console.log(`   ❌ Trade failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Opportunity execution error:`, error.message);
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * AI INTEGRATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Consult all 15 AI agents
   */
  async consultAIAgents(userId) {
    // Get all active AI agents
    const agentsResult = await this.pool.query(`
      SELECT * FROM ai_agents WHERE status = 'active' ORDER BY agent_id
    `);
    
    const agents = agentsResult.rows;
    const opportunities = [];
    
    // Get portfolio and market data
    const portfolio = await this.riskService.getPortfolioData(userId);
    const marketData = await this.getMarketData();
    
    // Consult each agent
    for (const agent of agents) {
      try {
        const recommendation = await this.getAgentRecommendation(
          agent,
          portfolio,
          marketData
        );
        
        if (recommendation && recommendation.action !== 'HOLD') {
          opportunities.push({
            ...recommendation,
            agentId: agent.agent_id,
            agentName: agent.name
          });
        }
      } catch (error) {
        console.error(`   ⚠️ Agent ${agent.agent_id} error:`, error.message);
      }
    }
    
    return {
      consultedAgents: agents.length,
      opportunities,
      timestamp: new Date()
    };
  }
  
  /**
   * Get recommendation from single agent
   */
  async getAgentRecommendation(agent, portfolio, marketData) {
    // Use AI provider to get recommendation
    const prompt = this.buildAgentPrompt(agent, portfolio, marketData);
    
    try {
      const aiResponse = await this.aiService.chat(prompt, {
        context: {
          systemPrompt: `You are ${agent.name}, a specialized trading AI agent. Analyze the data and provide a specific trading recommendation.`,
          maxTokens: 300
        },
        fallback: true
      });
      
      // Parse AI response to extract recommendation
      const recommendation = this.parseAIRecommendation(aiResponse.response);
      
      // Record AI decision
      await this.pool.query(`
        INSERT INTO ai_decisions (
          agent_id, decision_type, confidence, reasoning, recommendation
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        agent.agent_id,
        recommendation.action,
        recommendation.confidence,
        aiResponse.response,
        JSON.stringify(recommendation)
      ]);
      
      return recommendation;
      
    } catch (error) {
      // Return mock recommendation on error
      return this.getMockRecommendation(agent.type);
    }
  }
  
  /**
   * Build prompt for AI agent
   */
  buildAgentPrompt(agent, portfolio, marketData) {
    return `
As ${agent.name} (${agent.type}), analyze the current situation:

Portfolio:
- Total Value: $${portfolio.totalValue.toFixed(2)}
- Cash: $${portfolio.cash.toFixed(2)}
- Positions: ${portfolio.symbolCount}

Market Conditions:
${JSON.stringify(marketData.top5, null, 2)}

Based on your expertise in ${agent.description}, provide:
1. Recommended action (BUY/SELL/HOLD)
2. Symbol (if BUY/SELL)
3. Entry price
4. Stop loss level
5. Take profit level
6. Confidence (0-1)
7. Brief reasoning

Format: ACTION|SYMBOL|ENTRY|STOP|TARGET|CONFIDENCE|REASON
Example: BUY|BTCUSDT|45000|43500|48000|0.85|Strong bullish momentum
`;
  }
  
  /**
   * Parse AI recommendation from response
   */
  parseAIRecommendation(aiResponse) {
    try {
      // Try to extract structured data from response
      const lines = aiResponse.split('\n');
      const dataLine = lines.find(line => 
        line.includes('|') && (line.includes('BUY') || line.includes('SELL') || line.includes('HOLD'))
      );
      
      if (dataLine) {
        const parts = dataLine.split('|').map(p => p.trim());
        return {
          action: parts[0],
          symbol: parts[1],
          entryPrice: parseFloat(parts[2]),
          stopLoss: parseFloat(parts[3]),
          takeProfit: parseFloat(parts[4]),
          confidence: parseFloat(parts[5]),
          reasoning: parts[6]
        };
      }
    } catch (error) {
      // Fallback parsing failed
    }
    
    // Return default HOLD if parsing failed
    return {
      action: 'HOLD',
      confidence: 0.5,
      reasoning: 'Unable to parse recommendation'
    };
  }
  
  /**
   * Get mock recommendation for testing
   */
  getMockRecommendation(agentType) {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const action = Math.random() > 0.3 ? 'BUY' : 'HOLD';
    
    if (action === 'HOLD') {
      return { action, confidence: 0.6 };
    }
    
    const entryPrice = 45000 + Math.random() * 5000;
    
    return {
      action,
      symbol,
      entryPrice,
      stopLoss: entryPrice * 0.95,
      takeProfit: entryPrice * 1.10,
      confidence: 0.65 + Math.random() * 0.25,
      reasoning: `Mock recommendation from ${agentType} agent`
    };
  }
  
  /**
   * Get AI recommendations (legacy method)
   */
  async getAIRecommendations(userId, mode) {
    const analysis = await this.consultAIAgents(userId);
    return {
      totalOpportunities: analysis.opportunities.length,
      highConfidence: analysis.opportunities.filter(o => o.confidence >= 0.80).length,
      mediumConfidence: analysis.opportunities.filter(o => o.confidence >= 0.70 && o.confidence < 0.80).length,
      recommendations: analysis.opportunities.slice(0, 5)
    };
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PERFORMANCE TRACKING
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Update session performance
   */
  async updateSessionPerformance(sessionId) {
    const result = await this.pool.query(`
      SELECT 
        s.*,
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.side = 'SELL' AND t.price > t.entry_price THEN 1 ELSE 0 END) as winning_trades,
        AVG(CASE 
          WHEN t.side = 'SELL' THEN (t.price - t.entry_price) / t.entry_price * 100
          ELSE 0 
        END) as avg_return
      FROM autopilot_sessions s
      LEFT JOIN autopilot_trades at ON s.id = at.session_id
      LEFT JOIN trades t ON at.trade_id = t.id
      WHERE s.id = $1
      GROUP BY s.id
    `, [sessionId]);
    
    const session = result.rows[0];
    const currentBalance = await this.getCurrentBalance(session.user_id);
    const progress = ((currentBalance - session.initial_balance) / (session.target_amount - session.initial_balance)) * 100;
    
    await this.pool.query(`
      UPDATE autopilot_sessions
      SET 
        current_balance = $2,
        total_trades = $3,
        winning_trades = $4,
        progress_percent = $5,
        updated_at = NOW()
      WHERE id = $1
    `, [
      sessionId,
      currentBalance,
      session.total_trades || 0,
      session.winning_trades || 0,
      Math.min(100, progress)
    ]);
  }
  
  /**
   * Get session performance
   */
  async getSessionPerformance(sessionId) {
    const result = await this.pool.query(`
      SELECT 
        s.*,
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.side = 'SELL' AND t.price > t.entry_price THEN 1 ELSE 0 END) as winning_trades,
        u.balance as current_balance
      FROM autopilot_sessions s
      LEFT JOIN autopilot_trades at ON s.id = at.session_id
      LEFT JOIN trades t ON at.trade_id = t.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
      GROUP BY s.id, u.balance
    `, [sessionId]);
    
    const data = result.rows[0];
    
    return {
      sessionId,
      initialBalance: parseFloat(data.initial_balance),
      currentBalance: parseFloat(data.current_balance),
      targetAmount: parseFloat(data.target_amount),
      profit: parseFloat(data.current_balance) - parseFloat(data.initial_balance),
      profitPercent: ((parseFloat(data.current_balance) - parseFloat(data.initial_balance)) / parseFloat(data.initial_balance)) * 100,
      progress: data.progress_percent,
      totalTrades: parseInt(data.total_trades || 0),
      winningTrades: parseInt(data.winning_trades || 0),
      winRate: data.total_trades > 0 ? (data.winning_trades / data.total_trades * 100) : 0,
      duration: data.stopped_at 
        ? (new Date(data.stopped_at) - new Date(data.started_at)) / 1000 / 60 / 60 // hours
        : (new Date() - new Date(data.started_at)) / 1000 / 60 / 60
    };
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * HELPER METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  async getCurrentBalance(userId) {
    const result = await this.pool.query(`
      SELECT balance FROM users WHERE id = $1
    `, [userId]);
    return parseFloat(result.rows[0]?.balance || 0);
  }
  
  async getTodayTradeCount(userId) {
    const result = await this.pool.query(`
      SELECT COUNT(*) as count
      FROM trades
      WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE
    `, [userId]);
    return parseInt(result.rows[0]?.count || 0);
  }
  
  async getMarketData() {
    // Get top 5 symbols by volume
    const result = await this.pool.query(`
      SELECT symbol, price, volume, change_24h
      FROM market_prices
      ORDER BY volume DESC
      LIMIT 5
    `);
    
    return {
      top5: result.rows,
      timestamp: new Date()
    };
  }
}

// Singleton instance
let autopilotEngine;

function getAutopilotEngine(pool) {
  if (!autopilotEngine) {
    autopilotEngine = new AutopilotEngine(pool);
  }
  return autopilotEngine;
}

module.exports = { AutopilotEngine, getAutopilotEngine };
