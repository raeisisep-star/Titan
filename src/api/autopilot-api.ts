import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Enhanced Autopilot API with integrated AI and target-based trading
const app = new Hono()

// Enable CORS
app.use('/api/autopilot/*', cors())

// Types for Autopilot System
interface AutopilotConfig {
  enabled: boolean;
  mode: 'conservative' | 'moderate' | 'aggressive';
  budget: number;
  targetAmount: number;
  maxConcurrentTrades: number;
  strategies: AutopilotStrategy[];
  riskLevel: number; // 1-10
  stopLoss: boolean;
  takeProfit: boolean;
  emergencyStop: boolean;
  aiProviders: string[]; // ['chatgpt', 'gemini', 'claude']
  artemisIntegration: boolean;
}

interface AutopilotStrategy {
  id: string;
  name: string;
  enabled: boolean;
  confidence: number;
  profitPotential: number;
  riskScore: number;
  aiAgent: number; // Which of 15 AI agents
  description: string;
}

interface TargetBasedTrade {
  id: string;
  initialAmount: number;
  targetAmount: number;
  currentAmount: number;
  progress: number; // percentage
  estimatedTimeToTarget: string;
  strategy: string;
  aiDecisions: AIDecision[];
  status: 'active' | 'completed' | 'paused' | 'failed';
}

interface AIDecision {
  timestamp: string;
  provider: string; // 'chatgpt' | 'gemini' | 'claude' | 'artemis' | 'agent_1-15'
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  pair: string;
  amount: number;
  expectedProfit: number;
}

// Global state management
interface GlobalState {
  autopilotConfig: AutopilotConfig;
  targetTrade: TargetBasedTrade | null;
  activeTrades: Map<string, any>;
  performanceHistory: any[];
  aiConnectionStatus: Map<string, boolean>;
  realTimeSignals: any[];
}

const globalState: GlobalState = {
  autopilotConfig: null as any,
  targetTrade: null,
  activeTrades: new Map(),
  performanceHistory: [],
  aiConnectionStatus: new Map([
    ['artemis', true],
    ['chatgpt', true], 
    ['gemini', true],
    ['claude', true]
  ]),
  realTimeSignals: []
};

// Initialize default configuration
function initializeDefaultConfig(): AutopilotConfig {
  return {
  enabled: false,
  mode: 'moderate',
  budget: 50000,
  targetAmount: 250000,
  maxConcurrentTrades: 8,
  strategies: [
    {
      id: 'momentum',
      name: 'معاملات Momentum',
      enabled: true,
      confidence: 82.3,
      profitPotential: 85.7,
      riskScore: 4.2,
      aiAgent: 8,
      description: 'خرید در روند صعودی قوی'
    },
    {
      id: 'breakout',
      name: 'پایکانی به مقاومت',
      enabled: true,
      confidence: 87.8,
      profitPotential: 62.1,
      riskScore: 3.1,
      aiAgent: 2,
      description: 'استراتژی breakout'
    },
    {
      id: 'arbitrage',
      name: 'آربیتراژ',
      enabled: true,
      confidence: 95.2,
      profitPotential: 45.8,
      riskScore: 1.8,
      aiAgent: 6,
      description: 'سود از اختلاف قیمت بین صرافی‌ها'
    },
    {
      id: 'scalping',
      name: 'اسکلپینگ',
      enabled: true,
      confidence: 78.9,
      profitPotential: 34.2,
      riskScore: 2.7,
      aiAgent: 11,
      description: 'معاملات کوتاه‌مدت با سود کم'
    },
    {
      id: 'ai_prediction',
      name: 'پیش‌بینی هوشمند',
      enabled: true,
      confidence: 91.4,
      profitPotential: 127.3,
      riskScore: 6.8,
      aiAgent: 1,
      description: 'بر اساس پیش‌بینی هوش مصنوعی'
    },
    {
      id: 'news_sentiment',
      name: 'تحلیل احساسات',
      enabled: true,
      confidence: 76.8,
      profitPotential: 89.1,
      riskScore: 5.4,
      aiAgent: 12,
      description: 'خرید و فروش بر اساس اخبار'
    },
    {
      id: 'technical_analysis',
      name: 'تحلیل تکنیکال',
      enabled: true,
      confidence: 83.7,
      profitPotential: 71.5,
      riskScore: 4.1,
      aiAgent: 3,
      description: 'بر اساس شاخص‌های فنی'
    },
    {
      id: 'swing_trading',
      name: 'سوئینگ تریدینگ',
      enabled: false,
      confidence: 69.2,
      profitPotential: 108.4,
      riskScore: 7.3,
      aiAgent: 9,
      description: 'معاملات میان‌مدت'
    }
  ],
  riskLevel: 5,
  stopLoss: true,
  takeProfit: true,
  emergencyStop: false,
  aiProviders: ['chatgpt', 'gemini', 'claude'],
  artemisIntegration: true
  };
}

// Initialize global state
globalState.autopilotConfig = initializeDefaultConfig();

// Real-time calculation functions
function calculateProgress(initial: number, current: number, target: number): number {
  if (target <= initial) return 0;
  const progress = ((current - initial) / (target - initial)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

function estimateTimeToTarget(initial: number, current: number, target: number, dailyGrowthRate: number = 0.025): string {
  if (current <= initial || dailyGrowthRate <= 0) return 'نامحدود';
  
  const remaining = target - current;
  const currentGrowth = current - initial;
  const averageDailyGrowth = currentGrowth * dailyGrowthRate;
  
  if (averageDailyGrowth <= 0) return 'نامحدود';
  
  const daysRemaining = Math.ceil(remaining / averageDailyGrowth);
  
  if (daysRemaining <= 1) return 'کمتر از 1 روز';
  if (daysRemaining <= 7) return `${daysRemaining} روز`;
  if (daysRemaining <= 30) return `${Math.ceil(daysRemaining / 7)} هفته`;
  if (daysRemaining <= 365) return `${Math.ceil(daysRemaining / 30)} ماه`;
  return 'بیش از 1 سال';
}

function updateTargetTradeProgress() {
  if (!globalState.targetTrade) return;
  
  const target = globalState.targetTrade;
  target.progress = calculateProgress(target.initialAmount, target.currentAmount, target.targetAmount);
  target.estimatedTimeToTarget = estimateTimeToTarget(target.initialAmount, target.currentAmount, target.targetAmount);
}

// Simulate real-time updates
function simulateMarketUpdates() {
  if (!globalState.targetTrade || globalState.targetTrade.status !== 'active') return;
  
  // Simulate small market movements
  const growthFactor = 1 + (Math.random() - 0.45) * 0.001; // -0.45% to +0.55% range
  const newAmount = globalState.targetTrade.currentAmount * growthFactor;
  
  // Ensure we don't go below initial amount significantly
  if (newAmount >= globalState.targetTrade.initialAmount * 0.95) {
    globalState.targetTrade.currentAmount = newAmount;
    updateTargetTradeProgress();
    
    // Add AI decision if significant change
    if (Math.abs(growthFactor - 1) > 0.002) {
      addAIDecision({
        timestamp: new Date().toISOString(),
        provider: ['artemis', 'chatgpt', 'gemini', 'claude'][Math.floor(Math.random() * 4)],
        action: growthFactor > 1 ? 'buy' : 'sell',
        confidence: Math.random() * 30 + 70,
        reasoning: growthFactor > 1 ? 'موقعیت خرید مناسب تشخیص داده شد' : 'تصحیح موقت بازار',
        pair: ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'][Math.floor(Math.random() * 3)],
        amount: Math.random() * 1000 + 100,
        expectedProfit: Math.random() * 5 + 1
      });
    }
  }
}

function addAIDecision(decision: AIDecision) {
  if (!globalState.targetTrade) return;
  
  globalState.targetTrade.aiDecisions.unshift(decision);
  
  // Keep only last 50 decisions
  if (globalState.targetTrade.aiDecisions.length > 50) {
    globalState.targetTrade.aiDecisions = globalState.targetTrade.aiDecisions.slice(0, 50);
  }
}

// Real-time simulation functions (called from handlers, not global scope)
// These will be called via API endpoints instead of global setInterval

function updateRealTimeSignals() {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT', 'DOT/USDT'];
  const actions = ['BUY', 'SELL', 'HOLD'];
  const providers = ['artemis', 'chatgpt', 'gemini', 'claude'];
  const strategies = ['momentum', 'breakout', 'arbitrage', 'ai_prediction', 'technical_analysis'];
  
  globalState.realTimeSignals = pairs.slice(0, 3).map(pair => ({
    pair,
    action: actions[Math.floor(Math.random() * actions.length)],
    confidence: Math.floor(Math.random() * 30 + 70),
    aiProvider: providers[Math.floor(Math.random() * providers.length)],
    strategy: strategies[Math.floor(Math.random() * strategies.length)],
    expectedProfit: Math.random() * 5 + 0.5,
    reasoning: generateReasoningText()
  }));
}

function generateReasoningText(): string {
  const reasons = [
    'شکست سطح مقاومت با حجم بالا',
    'الگوی صعودی در تایم‌فریم 4 ساعته',
    'RSI در ناحیه اشباع فروش',
    'تحلیل احساسات مثبت از اخبار',
    'پیش‌بینی AI صعود قیمت',
    'حمایت قوی در سطح فعلی',
    'بریکاوت از کانال نزولی',
    'افزایش حجم معاملات'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// Initialize default target trade
globalState.targetTrade = {
  id: 'target_001',
  initialAmount: 100,
  targetAmount: 5000,
  currentAmount: 2847,
  progress: 56.9,
  estimatedTimeToTarget: '18 ساعت',
  strategy: 'Multi-Strategy AI',
  aiDecisions: [
    {
      timestamp: new Date().toISOString(),
      provider: 'artemis',
      action: 'buy',
      confidence: 87.2,
      reasoning: 'قیمت BTC در حال شکست سطح مقاومت $43,500',
      pair: 'BTC/USDT',
      amount: 500,
      expectedProfit: 3.2
    },
    {
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      provider: 'chatgpt',
      action: 'sell',
      confidence: 92.1,
      reasoning: 'RSI اشباع خرید در ETH، احتمال اصلاح',
      pair: 'ETH/USDT',
      amount: 300,
      expectedProfit: 2.8
    }
  ],
  status: 'active'
};

// Update trading statistics dynamically
function getTradingStats() {
  const stats = {
    totalTrades: 156 + Math.floor(Math.random() * 10),
    successfulTrades: 122 + Math.floor(Math.random() * 8),
    dailyProfit: globalState.targetTrade ? (globalState.targetTrade.currentAmount - globalState.targetTrade.initialAmount) : 2847,
    activeStrategies: globalState.autopilotConfig?.strategies?.filter(s => s.enabled).length || 6,
    activeAIAgents: 15,
    marketCoverage: '400+ coins'
  };
  
  stats.successRate = stats.totalTrades > 0 ? (stats.successfulTrades / stats.totalTrades) * 100 : 0;
  return stats;
};

// API Endpoints

// Get autopilot configuration
app.get('/config', (c) => {
  try {
    // Trigger updates when config is requested (instead of global setInterval)
    simulateMarketUpdates();
    updateRealTimeSignals();
    
    return c.json({
      success: true,
      config: globalState.autopilotConfig,
      systemStatus: getTradingStats()
    });
  } catch (error) {
    console.error('Error in config endpoint:', error);
    return c.json({
      success: false,
      message: 'Error retrieving config',
      error: error.message
    }, 500);
  }
});

// Update autopilot configuration
app.post('/config', async (c) => {
  try {
    const updates = await c.req.json();
    globalState.autopilotConfig = { ...globalState.autopilotConfig, ...updates };
    
    // If budget updated, recalculate strategies
    if (updates.budget) {
      console.log(`💰 Budget updated to $${updates.budget.toLocaleString()}`);
    }
    
    // If risk level updated, adjust strategy parameters
    if (updates.riskLevel) {
      console.log(`⚠️ Risk level updated to ${updates.riskLevel}/10`);
    }
    
    return c.json({
      success: true,
      message: 'تنظیمات اتوپایلوت بروزرسانی شد',
      config: globalState.autopilotConfig
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در بروزرسانی تنظیمات'
    }, 500);
  }
});

// Start/Stop autopilot
app.post('/toggle', async (c) => {
  try {
    const { action } = await c.req.json();
    
    if (action === 'start') {
      globalState.autopilotConfig.enabled = true;
      globalState.autopilotConfig.emergencyStop = false;
      
      // Start target trade if exists
      if (globalState.targetTrade) {
        globalState.targetTrade.status = 'active';
      }
      
      console.log('🚀 Autopilot started successfully');
      
      return c.json({
        success: true,
        message: 'اتوپایلوت شروع شد 🚀',
        status: 'running',
        config: globalState.autopilotConfig,
        activeStrategies: globalState.autopilotConfig.strategies.filter(s => s.enabled).length
      });
    } else if (action === 'stop') {
      globalState.autopilotConfig.enabled = false;
      
      // Pause target trade if exists
      if (globalState.targetTrade) {
        globalState.targetTrade.status = 'paused';
      }
      
      console.log('⏸️ Autopilot stopped');
      
      return c.json({
        success: true,
        message: 'اتوپایلوت متوقف شد ⏸️',
        status: 'stopped',
        config: globalState.autopilotConfig
      });
    } else if (action === 'emergency') {
      globalState.autopilotConfig.enabled = false;
      globalState.autopilotConfig.emergencyStop = true;
      
      // Emergency stop target trade
      if (globalState.targetTrade) {
        globalState.targetTrade.status = 'paused';
      }
      
      console.log('🛑 Emergency stop executed');
      
      return c.json({
        success: true,
        message: 'توقف اضطراری اجرا شد 🛑',
        status: 'emergency_stopped',
        config: globalState.autopilotConfig
      });
    }
    
    return c.json({
      success: false,
      message: 'عمل نامعتبر'
    }, 400);
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در تغییر وضعیت اتوپایلوت'
    }, 500);
  }
});

// Get target-based trading status
app.get('/target-trade', (c) => {
  // Update market data when target trade is requested
  simulateMarketUpdates();
  
  if (!globalState.targetTrade) {
    return c.json({
      success: false,
      message: 'هیچ هدف فعالی تنظیم نشده است'
    });
  }
  
  const target = globalState.targetTrade;
  const profitMade = target.currentAmount - target.initialAmount;
  const profitPercentage = ((profitMade / target.initialAmount) * 100);
  
  return c.json({
    success: true,
    targetTrade: target,
    progress: {
      percentage: target.progress,
      remaining: target.targetAmount - target.currentAmount,
      profitMade: profitMade,
      profitPercentage: profitPercentage,
      isProfit: profitMade > 0
    },
    recentDecisions: target.aiDecisions.slice(0, 5) // Last 5 decisions
  });
});

// Create new target-based trade
app.post('/target-trade', async (c) => {
  try {
    const { initialAmount, targetAmount, strategy } = await c.req.json();
    
    if (!initialAmount || !targetAmount || targetAmount <= initialAmount) {
      return c.json({
        success: false,
        message: 'مقادیر وارد شده نامعتبر است'
      }, 400);
    }
    
    globalState.targetTrade = {
      id: `target_${Date.now()}`,
      initialAmount,
      targetAmount,
      currentAmount: initialAmount,
      progress: 0,
      estimatedTimeToTarget: estimateTimeToTarget(initialAmount, initialAmount, targetAmount),
      strategy: strategy || 'Multi-Strategy AI',
      aiDecisions: [],
      status: globalState.autopilotConfig.enabled ? 'active' : 'paused'
    };
    
    // Add initial AI decision
    addAIDecision({
      timestamp: new Date().toISOString(),
      provider: 'artemis',
      action: 'buy',
      confidence: 85,
      reasoning: `هدف جدید تنظیم شد: $${initialAmount.toLocaleString()} به $${targetAmount.toLocaleString()}`,
      pair: 'Multi-Asset',
      amount: initialAmount,
      expectedProfit: ((targetAmount - initialAmount) / initialAmount) * 100
    });
    
    console.log(`🎯 New target created: $${initialAmount} → $${targetAmount}`);
    
    return c.json({
      success: true,
      message: `هدف جدید تنظیم شد: $${initialAmount.toLocaleString()} → $${targetAmount.toLocaleString()}`,
      targetTrade: globalState.targetTrade,
      expectedReturn: ((targetAmount - initialAmount) / initialAmount * 100).toFixed(1) + '%'
    });
    
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در ایجاد هدف جدید'
    }, 500);
  }
});

// Get AI decisions and reasoning
app.get('/ai-decisions', (c) => {
  if (!globalState.targetTrade) {
    return c.json({
      success: false,
      message: 'هیچ معامله هدف‌مند فعالی وجود ندارد'
    });
  }
  
  const decisions = globalState.targetTrade.aiDecisions;
  const recentDecisions = decisions.slice(0, 20); // Last 20 decisions
  
  const summary = {
    totalDecisions: decisions.length,
    buyActions: decisions.filter(d => d.action === 'buy').length,
    sellActions: decisions.filter(d => d.action === 'sell').length,
    holdActions: decisions.filter(d => d.action === 'hold').length,
    averageConfidence: decisions.length > 0 ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length : 0,
    providerBreakdown: {
      artemis: decisions.filter(d => d.provider === 'artemis').length,
      chatgpt: decisions.filter(d => d.provider === 'chatgpt').length,
      gemini: decisions.filter(d => d.provider === 'gemini').length,
      claude: decisions.filter(d => d.provider === 'claude').length
    },
    last24h: decisions.filter(d => 
      new Date(d.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
  };
  
  return c.json({
    success: true,
    decisions: recentDecisions,
    summary,
    timestamp: new Date().toISOString()
  });
});

// Get strategy performance
app.get('/strategies/performance', (c) => {
  const strategyPerformance = globalState.autopilotConfig.strategies.map(strategy => {
    const basePerformance = {
      totalTrades: Math.floor(Math.random() * 50) + 10,
      successRate: Math.random() * 30 + 70, // 70-100%
      avgProfit: Math.random() * 5 + 1, // 1-6%
      currentPnL: (Math.random() - 0.3) * 1000, // Can be negative
      last24h: {
        trades: Math.floor(Math.random() * 10) + 1,
        profit: (Math.random() - 0.2) * 500,
        winRate: Math.random() * 40 + 60
      }
    };
    
    // Adjust performance based on confidence and risk
    if (strategy.confidence > 90) {
      basePerformance.successRate = Math.min(basePerformance.successRate + 10, 95);
    }
    
    if (strategy.riskScore > 7) {
      basePerformance.avgProfit += 1;
      basePerformance.currentPnL *= 1.5;
    }
    
    return {
      ...strategy,
      performance: basePerformance,
      lastUpdate: new Date().toISOString()
    };
  });
  
  return c.json({
    success: true,
    strategies: strategyPerformance,
    summary: {
      totalActiveStrategies: strategyPerformance.filter(s => s.enabled).length,
      averageSuccessRate: strategyPerformance.reduce((sum, s) => sum + s.performance.successRate, 0) / strategyPerformance.length,
      totalPnL: strategyPerformance.reduce((sum, s) => sum + s.performance.currentPnL, 0)
    }
  });
});

// Update strategy status
app.post('/strategies/:id/toggle', async (c) => {
  try {
    const strategyId = c.req.param('id');
    const strategy = globalState.autopilotConfig.strategies.find(s => s.id === strategyId);
    
    if (!strategy) {
      return c.json({
        success: false,
        message: 'استراتژی پیدا نشد'
      }, 404);
    }
    
    const wasEnabled = strategy.enabled;
    strategy.enabled = !strategy.enabled;
    
    // Log the change
    const action = strategy.enabled ? 'فعال' : 'غیرفعال';
    console.log(`🔄 Strategy ${strategy.name} (Agent ${strategy.aiAgent}) ${action}`);
    
    // Add AI decision about strategy change
    if (globalState.targetTrade) {
      addAIDecision({
        timestamp: new Date().toISOString(),
        provider: 'artemis',
        action: 'hold',
        confidence: 75,
        reasoning: `استراتژی ${strategy.name} ${action} شد`,
        pair: 'System',
        amount: 0,
        expectedProfit: 0
      });
    }
    
    return c.json({
      success: true,
      message: `استراتژی ${strategy.name} ${action} شد`,
      strategy,
      activeStrategiesCount: globalState.autopilotConfig.strategies.filter(s => s.enabled).length
    });
    
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در تغییر وضعیت استراتژی'
    }, 500);
  }
});

// Get autopilot signals (for real-time updates)
app.get('/signals', (c) => {
  // Update signals when requested
  updateRealTimeSignals();
  
  return c.json({
    success: true,
    signals: globalState.realTimeSignals,
    timestamp: new Date().toISOString(),
    activeStrategies: globalState.autopilotConfig.strategies.filter(s => s.enabled).length,
    aiConnectionStatus: Object.fromEntries(globalState.aiConnectionStatus)
  });
});

// Emergency stop all operations
app.post('/emergency-stop', async (c) => {
  try {
    globalState.autopilotConfig.enabled = false;
    globalState.autopilotConfig.emergencyStop = true;
    
    if (globalState.targetTrade) {
      globalState.targetTrade.status = 'paused';
      
      // Add emergency stop decision
      addAIDecision({
        timestamp: new Date().toISOString(),
        provider: 'system',
        action: 'hold',
        confidence: 100,
        reasoning: '🚨 توقف اضطراری سیستم',
        pair: 'All Markets',
        amount: 0,
        expectedProfit: 0
      });
    }
    
    console.log('🚨 EMERGENCY STOP executed');
    
    return c.json({
      success: true,
      message: '🚨 توقف اضطراری انجام شد. تمام عملیات متوقف شدند.',
      timestamp: new Date().toISOString(),
      affectedSystems: {
        autopilot: 'stopped',
        targetTrade: globalState.targetTrade ? 'paused' : 'none',
        strategies: 'all_disabled'
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در توقف اضطراری'
    }, 500);
  }
});

// Reset autopilot to default settings
app.post('/reset', async (c) => {
  try {
    // Reset to default configuration
    globalState.autopilotConfig = initializeDefaultConfig();
    
    // Reset target trade
    globalState.targetTrade = null;
    
    // Clear performance history
    globalState.performanceHistory = [];
    
    // Reset AI connection status
    globalState.aiConnectionStatus.forEach((_, key) => {
      globalState.aiConnectionStatus.set(key, true);
    });
    
    console.log('🔄 Autopilot system reset to defaults');
    
    return c.json({
      success: true,
      message: 'سیستم اتوپایلوت به حالت پیش‌فرض بازگردانده شد',
      config: globalState.autopilotConfig,
      resetItems: {
        configuration: true,
        targetTrade: true,
        performanceHistory: true,
        aiConnections: true
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در بازنشانی تنظیمات'
    }, 500);
  }
});

// Get system status for AI providers
app.get('/system/status', (c) => {
  const systemStatus = {
    overall: globalState.autopilotConfig.enabled ? 'active' : 'inactive',
    aiProviders: Object.fromEntries(globalState.aiConnectionStatus),
    strategies: {
      total: globalState.autopilotConfig.strategies.length,
      active: globalState.autopilotConfig.strategies.filter(s => s.enabled).length,
      list: globalState.autopilotConfig.strategies.map(s => ({
        id: s.id,
        name: s.name,
        enabled: s.enabled,
        confidence: s.confidence
      }))
    },
    targetTrade: globalState.targetTrade ? {
      active: true,
      progress: globalState.targetTrade.progress,
      status: globalState.targetTrade.status
    } : { active: false },
    performance: getTradingStats(),
    lastUpdate: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    status: systemStatus
  });
});

// Update individual strategy parameters
app.post('/strategies/:id/update', async (c) => {
  try {
    const strategyId = c.req.param('id');
    const updates = await c.req.json();
    const strategy = globalState.autopilotConfig.strategies.find(s => s.id === strategyId);
    
    if (!strategy) {
      return c.json({
        success: false,
        message: 'استراتژی پیدا نشد'
      }, 404);
    }
    
    // Update allowed parameters
    if (updates.confidence !== undefined) strategy.confidence = Math.max(0, Math.min(100, updates.confidence));
    if (updates.riskScore !== undefined) strategy.riskScore = Math.max(0, Math.min(10, updates.riskScore));
    if (updates.profitPotential !== undefined) strategy.profitPotential = Math.max(0, updates.profitPotential);
    
    return c.json({
      success: true,
      message: `استراتژی ${strategy.name} بروزرسانی شد`,
      strategy
    });
    
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در بروزرسانی استراتژی'
    }, 500);
  }
});

// Test AI provider connection
app.post('/ai/:provider/test', async (c) => {
  try {
    const provider = c.req.param('provider');
    
    if (!['artemis', 'chatgpt', 'gemini', 'claude'].includes(provider)) {
      return c.json({
        success: false,
        message: 'ارائه‌دهنده AI نامعتبر'
      }, 400);
    }
    
    // Simulate connection test
    const isConnected = Math.random() > 0.2; // 80% success rate
    globalState.aiConnectionStatus.set(provider, isConnected);
    
    console.log(`🔌 AI Provider ${provider} test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    
    return c.json({
      success: true,
      provider,
      connected: isConnected,
      message: isConnected ? `اتصال ${provider} موفق` : `خطا در اتصال ${provider}`,
      latency: Math.floor(Math.random() * 200) + 50 // 50-250ms
    });
    
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در تست اتصال'
    }, 500);
  }
});

// Get performance analytics
app.get('/analytics/performance', (c) => {
  const stats = getTradingStats();
  const targetTrade = globalState.targetTrade;
  
  const analytics = {
    overview: {
      totalTrades: stats.totalTrades,
      successRate: stats.successRate,
      dailyProfit: stats.dailyProfit,
      profitGrowth: targetTrade ? ((targetTrade.currentAmount - targetTrade.initialAmount) / targetTrade.initialAmount * 100) : 0
    },
    targetProgress: targetTrade ? {
      initialAmount: targetTrade.initialAmount,
      currentAmount: targetTrade.currentAmount,
      targetAmount: targetTrade.targetAmount,
      progress: targetTrade.progress,
      estimatedTime: targetTrade.estimatedTimeToTarget,
      roi: ((targetTrade.currentAmount - targetTrade.initialAmount) / targetTrade.initialAmount * 100)
    } : null,
    strategyBreakdown: globalState.autopilotConfig.strategies.map(s => ({
      name: s.name,
      enabled: s.enabled,
      confidence: s.confidence,
      profitPotential: s.profitPotential,
      riskScore: s.riskScore
    })),
    aiProviderStatus: Object.fromEntries(globalState.aiConnectionStatus),
    lastUpdate: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    analytics
  });
});

// Global strategies state for cross-tab synchronization
const globalStrategiesState = {
  strategies: new Map(),
  lastUpdate: Date.now(),
  subscribers: new Set()
};

// Initialize global strategies sync
function initializeGlobalStrategiesSync() {
  if (globalStrategiesState.strategies.size === 0) {
    globalState.autopilotConfig.strategies.forEach(strategy => {
      globalStrategiesState.strategies.set(strategy.id, {
        ...strategy,
        performance: {
          roi: parseFloat((Math.random() * 50 - 10).toFixed(2)),
          winRate: parseFloat((Math.random() * 30 + 60).toFixed(1)),
          trades: Math.floor(Math.random() * 200) + 50,
          sharpeRatio: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          maxDrawdown: parseFloat((Math.random() * -10).toFixed(2)),
          totalVolume: Math.floor(Math.random() * 1000000) + 100000,
          avgHoldTime: `${Math.floor(Math.random() * 48) + 1}h ${Math.floor(Math.random() * 60)}m`
        },
        settings: {
          takeProfit: parseFloat((Math.random() * 5 + 1.5).toFixed(1)),
          stopLoss: parseFloat((Math.random() * 3 + 1).toFixed(1)),
          maxInvestment: Math.floor(Math.random() * 20) + 10,
          riskScore: Math.floor(Math.random() * 10) + 1
        },
        status: strategy.enabled ? 'active' : 'inactive',
        type: getStrategyType(strategy.id),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdate: new Date().toISOString(),
        aiGenerated: false
      });
    });
  }
}

// Sync strategy across all tabs and autopilot
function syncStrategyGlobally(strategyUpdate) {
  initializeGlobalStrategiesSync();
  
  if (strategyUpdate.id) {
    globalStrategiesState.strategies.set(strategyUpdate.id, {
      ...globalStrategiesState.strategies.get(strategyUpdate.id),
      ...strategyUpdate,
      lastUpdate: new Date().toISOString()
    });
    
    // Update autopilot config
    const autopilotStrategyIndex = globalState.autopilotConfig.strategies.findIndex(s => s.id === strategyUpdate.id);
    if (autopilotStrategyIndex !== -1) {
      globalState.autopilotConfig.strategies[autopilotStrategyIndex] = {
        ...globalState.autopilotConfig.strategies[autopilotStrategyIndex],
        enabled: strategyUpdate.status === 'active',
        confidence: strategyUpdate.performance?.winRate || globalState.autopilotConfig.strategies[autopilotStrategyIndex].confidence
      };
    } else if (strategyUpdate.aiGenerated) {
      // Add new AI-generated strategy to autopilot
      globalState.autopilotConfig.strategies.push({
        id: strategyUpdate.id,
        name: strategyUpdate.name,
        enabled: strategyUpdate.status === 'active',
        confidence: strategyUpdate.performance?.winRate || 75,
        profitPotential: strategyUpdate.performance?.roi || 25,
        riskScore: strategyUpdate.settings?.riskScore || 5,
        aiAgent: strategyUpdate.aiAgent || Math.floor(Math.random() * 15) + 1,
        description: strategyUpdate.description || 'AI Generated Strategy'
      });
    }
    
    globalStrategiesState.lastUpdate = Date.now();
  }
}

// Get strategy type helper
function getStrategyType(strategyId) {
  const types = {
    'scalping': 'scalping',
    'momentum': 'trend',
    'breakout': 'swing', 
    'arbitrage': 'arbitrage',
    'ai_prediction': 'ai',
    'news_sentiment': 'ai',
    'technical_analysis': 'trend',
    'swing_trading': 'swing'
  };
  return types[strategyId] || (strategyId.includes('ai_generated') ? 'ai' : 'trend');
}

// Add new strategy with cross-tab sync
app.post('/strategies/add', async (c) => {
  try {
    const strategyData = await c.req.json();
    
    const newStrategy = {
      id: strategyData.id || `strategy_${Date.now()}`,
      ...strategyData,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
    
    // Sync globally
    syncStrategyGlobally(newStrategy);
    
    return c.json({
      success: true,
      data: newStrategy,
      message: 'Strategy added and synced across all tabs'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to add strategy',
      details: error.message
    }, 500);
  }
});

// Update strategy with cross-tab sync
app.put('/strategies/:id', async (c) => {
  try {
    const strategyId = c.req.param('id');
    const updates = await c.req.json();
    
    initializeGlobalStrategiesSync();
    const existingStrategy = globalStrategiesState.strategies.get(strategyId);
    
    if (!existingStrategy) {
      return c.json({
        success: false,
        error: 'Strategy not found'
      }, 404);
    }
    
    const strategyUpdate = {
      ...existingStrategy,
      ...updates,
      id: strategyId,
      lastUpdate: new Date().toISOString()
    };
    
    // Sync globally
    syncStrategyGlobally(strategyUpdate);
    
    return c.json({
      success: true,
      data: strategyUpdate,
      message: 'Strategy updated and synced across all tabs'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update strategy',
      details: error.message
    }, 500);
  }
});

// Toggle strategy status with cross-tab sync
app.post('/strategies/:id/toggle', async (c) => {
  try {
    const strategyId = c.req.param('id');
    initializeGlobalStrategiesSync();
    
    const strategy = globalStrategiesState.strategies.get(strategyId);
    if (!strategy) {
      return c.json({
        success: false,
        error: 'Strategy not found'
      }, 404);
    }
    
    const newStatus = strategy.status === 'active' ? 'inactive' : 'active';
    
    syncStrategyGlobally({
      ...strategy,
      status: newStatus
    });
    
    return c.json({
      success: true,
      data: {
        id: strategyId,
        status: newStatus,
        message: `Strategy ${newStatus === 'active' ? 'activated' : 'deactivated'} and synced across all tabs`
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to toggle strategy',
      details: error.message
    }, 500);
  }
});

// Get synchronized strategies across all tabs
app.get('/strategies/sync', async (c) => {
  try {
    initializeGlobalStrategiesSync();
    
    const strategies = Array.from(globalStrategiesState.strategies.values());
    
    return c.json({
      success: true,
      data: {
        strategies,
        summary: {
          total: strategies.length,
          active: strategies.filter(s => s.status === 'active').length,
          totalROI: strategies.reduce((sum, s) => sum + (s.performance?.roi || 0), 0),
          avgWinRate: strategies.reduce((sum, s) => sum + (s.performance?.winRate || 0), 0) / strategies.length,
          totalTrades: strategies.reduce((sum, s) => sum + (s.performance?.trades || 0), 0)
        },
        lastUpdate: globalStrategiesState.lastUpdate
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch synchronized strategies',
      details: error.message
    }, 500);
  }
});

// Get detailed strategy performance for strategies tab
app.get('/strategies/detailed-performance', (c) => {
  const detailedStrategies = globalState.autopilotConfig.strategies.map(strategy => ({
    ...strategy,
    type: getStrategyType(strategy.id),
    performance: {
      roi: (Math.random() * 50 - 10).toFixed(2), // -10% to +40%
      winRate: (Math.random() * 30 + 60).toFixed(1), // 60-90%
      trades: Math.floor(Math.random() * 200) + 50,
      sharpeRatio: (Math.random() * 2 + 0.5).toFixed(2),
      maxDrawdown: (Math.random() * -10).toFixed(2),
      totalVolume: Math.floor(Math.random() * 1000000) + 100000,
      avgHoldTime: `${Math.floor(Math.random() * 48) + 1}h ${Math.floor(Math.random() * 60)}m`
    },
    status: strategy.enabled ? 'active' : 'inactive',
    lastUpdate: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    marketConditions: {
      suitability: Math.random() > 0.3 ? 'high' : 'medium',
      volatilityImpact: (Math.random() * 2 - 1).toFixed(2), // -1 to +1
      trendAlignment: Math.random() > 0.4 ? 'positive' : 'neutral'
    }
  }));

  function getStrategyType(strategyId) {
    const types = {
      'scalping': 'scalping',
      'momentum': 'trend',
      'breakout': 'swing', 
      'arbitrage': 'arbitrage',
      'ai_prediction': 'ai',
      'news_sentiment': 'ai',
      'technical_analysis': 'trend',
      'swing_trading': 'swing'
    };
    return types[strategyId] || 'trend';
  }

  const performanceOverview = {
    totalROI: 127.3,
    winRate: 78.4,
    sharpeRatio: 2.47,
    maxDrawdown: -5.2,
    totalTrades: 1247,
    activePeriod: 30,
    totalVolume: 15600000,
    activeStrategies: detailedStrategies.filter(s => s.enabled).length
  };

  const marketConditions = {
    trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
    volatility: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    volume: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    sentiment: ['negative', 'neutral', 'positive'][Math.floor(Math.random() * 3)],
    aiRecommendation: 'شرایط فعلی برای استراتژی‌های روندی مناسب است'
  };

  return c.json({
    success: true,
    strategies: detailedStrategies,
    performanceOverview,
    marketConditions,
    timestamp: new Date().toISOString()
  });
});

// Enhanced System Status API with current activities and system metrics
app.get('/system/enhanced-status', (c) => {
  // Update real-time signals and market data
  updateRealTimeSignals();
  simulateMarketUpdates();
  
  const currentActivities = [];
  
  // Trading opportunities (current signals)
  globalState.realTimeSignals.forEach(signal => {
    currentActivities.push({
      type: 'trading_opportunity',
      message: `${signal.action} فرصت ${signal.pair} - اعتماد: ${signal.confidence}%`,
      details: {
        pair: signal.pair,
        action: signal.action,
        confidence: signal.confidence,
        strategy: signal.strategy,
        aiProvider: signal.aiProvider,
        expectedProfit: signal.expectedProfit,
        reasoning: signal.reasoning
      },
      timestamp: new Date().toISOString(),
      priority: signal.confidence > 85 ? 'high' : signal.confidence > 70 ? 'medium' : 'low'
    });
  });
  
  // AI Performance updates
  const aiProviders = ['artemis', 'chatgpt', 'gemini', 'claude'];
  aiProviders.forEach(provider => {
    const isActive = globalState.aiConnectionStatus.get(provider);
    const performance = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    if (isActive) {
      currentActivities.push({
        type: 'ai_performance',
        message: `هوش مصنوعی ${provider.toUpperCase()} - عملکرد: ${performance}%`,
        details: {
          provider: provider,
          status: 'active',
          performance: performance,
          latency: Math.floor(Math.random() * 150) + 50, // 50-200ms
          requests: Math.floor(Math.random() * 100) + 50,
          accuracy: Math.floor(Math.random() * 20) + 80 // 80-100%
        },
        timestamp: new Date().toISOString(),
        priority: performance > 90 ? 'high' : performance > 75 ? 'medium' : 'low'
      });
    }
  });
  
  // Price updates
  const pairs = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'];
  pairs.forEach(pair => {
    const change = (Math.random() - 0.5) * 10; // -5% to +5%
    currentActivities.push({
      type: 'price_update',
      message: `${pair} آپدیت قیمت: ${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
      details: {
        pair: pair,
        change: change,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
        volume: Math.floor(Math.random() * 1000000) + 100000,
        lastPrice: change > 0 ? Math.floor(Math.random() * 50000) + 40000 : Math.floor(Math.random() * 45000) + 35000
      },
      timestamp: new Date().toISOString(),
      priority: Math.abs(change) > 3 ? 'high' : Math.abs(change) > 1.5 ? 'medium' : 'low'
    });
  });
  
  // Strategy activities
  const activeStrategies = globalState.autopilotConfig.strategies.filter(s => s.enabled);
  activeStrategies.slice(0, 3).forEach(strategy => {
    const action = ['تحلیل بازار', 'بررسی فرصت', 'اجرای معامله', 'مدیریت ریسک'][Math.floor(Math.random() * 4)];
    currentActivities.push({
      type: 'strategy_activity',
      message: `استراتژی ${strategy.name} - ${action}`,
      details: {
        strategyId: strategy.id,
        strategyName: strategy.name,
        action: action,
        confidence: strategy.confidence,
        aiAgent: strategy.aiAgent,
        riskScore: strategy.riskScore
      },
      timestamp: new Date().toISOString(),
      priority: strategy.confidence > 85 ? 'high' : 'medium'
    });
  });
  
  // System metrics simulation
  const systemMetrics = {
    cpu: {
      usage: Math.floor(Math.random() * 40) + 15, // 15-55%
      cores: 8,
      frequency: '3.2 GHz',
      temperature: Math.floor(Math.random() * 20) + 45, // 45-65°C
      load1m: (Math.random() * 2 + 0.5).toFixed(2),
      load5m: (Math.random() * 1.5 + 0.3).toFixed(2),
      load15m: (Math.random() * 1.2 + 0.2).toFixed(2)
    },
    memory: {
      total: 32768, // 32GB in MB
      used: Math.floor(Math.random() * 16384) + 8192, // 8-24GB used
      free: 0, // Will be calculated
      cached: Math.floor(Math.random() * 4096) + 1024, // 1-5GB cached
      available: 0, // Will be calculated
      usagePercentage: 0 // Will be calculated
    },
    disk: {
      total: 1024000, // 1TB in MB
      used: Math.floor(Math.random() * 512000) + 256000, // 256-768GB used
      free: 0, // Will be calculated
      usagePercentage: 0 // Will be calculated
    },
    network: {
      bytesIn: Math.floor(Math.random() * 1000000) + 500000,
      bytesOut: Math.floor(Math.random() * 800000) + 400000,
      packetsIn: Math.floor(Math.random() * 50000) + 25000,
      packetsOut: Math.floor(Math.random() * 40000) + 20000,
      connections: Math.floor(Math.random() * 100) + 50
    },
    processes: {
      total: Math.floor(Math.random() * 50) + 200,
      running: Math.floor(Math.random() * 20) + 10,
      sleeping: Math.floor(Math.random() * 150) + 150,
      zombie: Math.floor(Math.random() * 5)
    },
    uptime: {
      days: Math.floor(Math.random() * 30) + 1,
      hours: Math.floor(Math.random() * 24),
      minutes: Math.floor(Math.random() * 60)
    }
  };
  
  // Calculate derived values
  systemMetrics.memory.free = systemMetrics.memory.total - systemMetrics.memory.used;
  systemMetrics.memory.available = systemMetrics.memory.free + systemMetrics.memory.cached;
  systemMetrics.memory.usagePercentage = Math.round((systemMetrics.memory.used / systemMetrics.memory.total) * 100);
  
  systemMetrics.disk.free = systemMetrics.disk.total - systemMetrics.disk.used;
  systemMetrics.disk.usagePercentage = Math.round((systemMetrics.disk.used / systemMetrics.disk.total) * 100);
  
  // Sort activities by priority and timestamp
  currentActivities.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // System health calculation
  const cpuHealth = systemMetrics.cpu.usage < 70 ? 'good' : systemMetrics.cpu.usage < 85 ? 'warning' : 'critical';
  const memoryHealth = systemMetrics.memory.usagePercentage < 80 ? 'good' : systemMetrics.memory.usagePercentage < 90 ? 'warning' : 'critical';
  const diskHealth = systemMetrics.disk.usagePercentage < 80 ? 'good' : systemMetrics.disk.usagePercentage < 90 ? 'warning' : 'critical';
  
  const overallHealth = [cpuHealth, memoryHealth, diskHealth].includes('critical') ? 'critical' :
                       [cpuHealth, memoryHealth, diskHealth].includes('warning') ? 'warning' : 'good';
  
  return c.json({
    success: true,
    data: {
      currentActivities: currentActivities.slice(0, 15), // Limit to 15 most recent/important
      systemMetrics,
      systemHealth: {
        overall: overallHealth,
        cpu: cpuHealth,
        memory: memoryHealth,
        disk: diskHealth,
        services: globalState.autopilotConfig.enabled ? 'running' : 'stopped'
      },
      tradingStats: getTradingStats(),
      aiStatus: Object.fromEntries(globalState.aiConnectionStatus),
      lastUpdate: new Date().toISOString()
    }
  });
});

// Real-time updates will be triggered by API calls, not global scope
// updateRealTimeSignals(); // Removed from global scope

export default app;