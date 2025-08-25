// 15 Specialized AI Agents for TITAN Trading System

export interface AIAgent {
  id: number;
  name: string;
  specialty: string;
  description: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  accuracy: number;
  confidence: number;
  current_task: string;
  last_prediction: string;
  performance_metrics: {
    trades_executed: number;
    profit_contribution: number;
    success_rate: number;
    learning_rate: number;
    model_version: string;
  };
}

export const SPECIALIZED_AI_AGENTS: AIAgent[] = [
  {
    id: 1,
    name: 'Market Scanner',
    specialty: 'تحلیل بازار و شناسایی فرصت‌ها',
    description: 'اسکن مداوم 400+ کوین و سهام برای یافتن فرصت‌های معاملاتی',
    status: 'active',
    accuracy: 87.5,
    confidence: 92,
    current_task: 'اسکن 400 کوین برای فرصت‌های آربیتراژ',
    last_prediction: 'BTC صعود 2.1% در 4 ساعت آینده',
    performance_metrics: {
      trades_executed: 23,
      profit_contribution: 1240.75,
      success_rate: 87.5,
      learning_rate: 0.003,
      model_version: '2.4.1'
    }
  },
  {
    id: 2,
    name: 'Technical Analyst',
    specialty: 'تحلیل تکنیکال پیشرفته',
    description: 'شناسایی الگوهای تکنیکال، نقاط حمایت و مقاومت',
    status: 'active',
    accuracy: 91.2,
    confidence: 89,
    current_task: 'تحلیل الگوی Head & Shoulders در ETH',
    last_prediction: 'شکست مقاومت کلیدی ADA/USDT',
    performance_metrics: {
      trades_executed: 18,
      profit_contribution: 890.30,
      success_rate: 91.2,
      learning_rate: 0.0025,
      model_version: '3.1.0'
    }
  },
  {
    id: 3,
    name: 'Fundamental Analyzer',
    specialty: 'تحلیل فاندامنتال و ارزش ذاتی',
    description: 'بررسی عوامل بنیادی پروژه‌ها و ارزیابی ارزش واقعی',
    status: 'active',
    accuracy: 84.6,
    confidence: 82,
    current_task: 'ارزیابی فاندامنتال پروژه‌های DeFi',
    last_prediction: 'ارزش ذاتی SOL بیش از قیمت فعلی',
    performance_metrics: {
      trades_executed: 12,
      profit_contribution: 654.20,
      success_rate: 84.6,
      learning_rate: 0.0035,
      model_version: '1.9.3'
    }
  },
  {
    id: 4,
    name: 'News Analyzer',
    specialty: 'تحلیل اخبار و تأثیر بر بازار',
    description: 'تحلیل اخبار، اعتبارسنجی و پیش‌بینی تأثیر بر قیمت‌ها',
    status: 'active',
    accuracy: 82.7,
    confidence: 78,
    current_task: 'بررسی تأثیر اخبار Fed بر کریپتو',
    last_prediction: 'اخبار مثبت تأثیر 1.5% صعود در BTC',
    performance_metrics: {
      trades_executed: 15,
      profit_contribution: 567.20,
      success_rate: 82.7,
      learning_rate: 0.004,
      model_version: '1.8.2'
    }
  },
  {
    id: 5,
    name: 'Risk Manager',
    specialty: 'مدیریت ریسک و حفاظت سرمایه',
    description: 'محاسبه ریسک، تعیین حد ضرر و مدیریت اندازه معاملات',
    status: 'active',
    accuracy: 95.8,
    confidence: 96,
    current_task: 'محاسبه ریسک پورتفولیو فعلی',
    last_prediction: 'کاهش اندازه معامله ETH به 50%',
    performance_metrics: {
      trades_executed: 31,
      profit_contribution: 2340.85, // Loss prevention
      success_rate: 95.8,
      learning_rate: 0.002,
      model_version: '4.0.3'
    }
  },
  {
    id: 6,
    name: 'Arbitrage Hunter',
    specialty: 'یافتن فرصت‌های آربیتراژ',
    description: 'شناسایی اختلاف قیمت بین صرافی‌های مختلف',
    status: 'active',
    accuracy: 94.3,
    confidence: 91,
    current_task: 'مقایسه قیمت BTC در 8 صرافی',
    last_prediction: 'فرصت آربیتراژ 0.3% در BNB',
    performance_metrics: {
      trades_executed: 45,
      profit_contribution: 445.60,
      success_rate: 94.3,
      learning_rate: 0.0035,
      model_version: '2.7.1'
    }
  },
  {
    id: 7,
    name: 'Sentiment Analyzer',
    specialty: 'تحلیل احساسات بازار',
    description: 'بررسی احساسات شبکه‌های اجتماعی و اجتماع کریپتو',
    status: 'active',
    accuracy: 79.4,
    confidence: 75,
    current_task: 'تحلیل احساسات Twitter درباره BTC',
    last_prediction: 'احساسات مثبت قوی در 24 ساعت آینده',
    performance_metrics: {
      trades_executed: 8,
      profit_contribution: 234.50,
      success_rate: 79.4,
      learning_rate: 0.0045,
      model_version: '1.5.7'
    }
  },
  {
    id: 8,
    name: 'Momentum Trader',
    specialty: 'معاملات مومنتومی',
    description: 'شناسایی و سوار شدن بر روندهای قیمتی قوی',
    status: 'active',
    accuracy: 88.1,
    confidence: 85,
    current_task: 'شناسایی مومنتوم صعودی در آلت‌کوین‌ها',
    last_prediction: 'شروع مومنتوم قوی در MATIC',
    performance_metrics: {
      trades_executed: 27,
      profit_contribution: 892.40,
      success_rate: 88.1,
      learning_rate: 0.003,
      model_version: '2.3.4'
    }
  },
  {
    id: 9,
    name: 'Scalp Master',
    specialty: 'اسکلپ ترید و معاملات کوتاه‌مدت',
    description: 'معاملات سریع با سود کم اما فرکانس بالا',
    status: 'active',
    accuracy: 85.7,
    confidence: 88,
    current_task: 'اسکلپ ترید BTC/USDT',
    last_prediction: 'فرصت اسکلپ 0.15% در 5 دقیقه',
    performance_metrics: {
      trades_executed: 156,
      profit_contribution: 567.80,
      success_rate: 85.7,
      learning_rate: 0.0025,
      model_version: '3.2.1'
    }
  },
  {
    id: 10,
    name: 'Swing Trader',
    specialty: 'معاملات میان‌مدت',
    description: 'شناسایی روندهای میان‌مدت و نقاط ورود/خروج',
    status: 'active',
    accuracy: 90.3,
    confidence: 87,
    current_task: 'تحلیل سوینگ ETH برای هفته آینده',
    last_prediction: 'فرصت سوینگ 5% در SOL',
    performance_metrics: {
      trades_executed: 14,
      profit_contribution: 1234.60,
      success_rate: 90.3,
      learning_rate: 0.002,
      model_version: '2.8.9'
    }
  },
  {
    id: 11,
    name: 'Options Strategist', 
    specialty: 'استراتژی‌های پیچیده معاملاتی',
    description: 'طراحی استراتژی‌های پیچیده برای شرایط مختلف بازار',
    status: 'active',
    accuracy: 87.9,
    confidence: 83,
    current_task: 'طراحی استراتژی برای بازار خنثی',
    last_prediction: 'استراتژی Straddle برای BTC مناسب است',
    performance_metrics: {
      trades_executed: 9,
      profit_contribution: 445.30,
      success_rate: 87.9,
      learning_rate: 0.0015,
      model_version: '1.4.6'
    }
  },
  {
    id: 12,
    name: 'Volume Analyzer',
    specialty: 'تحلیل حجم معاملات',
    description: 'بررسی الگوهای حجم و تشخیص حرکات قیمتی واقعی',
    status: 'active',
    accuracy: 89.5,
    confidence: 86,
    current_task: 'تحلیل حجم غیرعادی در DOT',
    last_prediction: 'حجم بالا نشان‌دهنده شکست مقاومت',
    performance_metrics: {
      trades_executed: 22,
      profit_contribution: 678.90,
      success_rate: 89.5,
      learning_rate: 0.0028,
      model_version: '2.1.8'
    }
  },
  {
    id: 13,
    name: 'Correlation Detective',
    specialty: 'تحلیل همبستگی بازارها',
    description: 'شناسایی روابط بین دارایی‌های مختلف و پیش‌بینی حرکات',
    status: 'active',
    accuracy: 86.2,
    confidence: 81,
    current_task: 'بررسی همبستگی کریپتو با بازار سهام',
    last_prediction: 'همبستگی منفی موقت با طلا',
    performance_metrics: {
      trades_executed: 11,
      profit_contribution: 389.70,
      success_rate: 86.2,
      learning_rate: 0.0032,
      model_version: '1.7.4'
    }
  },
  {
    id: 14,
    name: 'Economic Calendar',
    specialty: 'تقویم اقتصادی و رویدادها',
    description: 'پیگیری رویدادهای اقتصادی مهم و تأثیر آن‌ها بر بازار',
    status: 'active',
    accuracy: 83.4,
    confidence: 79,
    current_task: 'آمادگی برای اعلام نرخ تورم آمریکا',
    last_prediction: 'تورم بالاتر از انتظار تأثیر منفی دارد',
    performance_metrics: {
      trades_executed: 7,
      profit_contribution: 289.40,
      success_rate: 83.4,
      learning_rate: 0.004,
      model_version: '1.3.2'
    }
  },
  {
    id: 15,
    name: 'ML Learning Coordinator',
    specialty: 'هماهنگی یادگیری و بهبود مدل‌ها',
    description: 'مدیریت فرآیند یادگیری سایر عامل‌ها و بهینه‌سازی عملکرد',
    status: 'active',
    accuracy: 94.7,
    confidence: 95,
    current_task: 'بهینه‌سازی مدل تحلیل احساسات',
    last_prediction: 'ترکیب 3 مدل دقت را 2.3% بهبود می‌دهد',
    performance_metrics: {
      trades_executed: 0, // Coordinator doesn't trade directly
      profit_contribution: 1567.80, // Through optimization
      success_rate: 94.7,
      learning_rate: 0.001,
      model_version: '5.0.1'
    }
  }
];

export class AgentManager {
  private static instance: AgentManager;
  private agents: AIAgent[];

  private constructor() {
    this.agents = [...SPECIALIZED_AI_AGENTS];
  }

  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  public getAllAgents(): AIAgent[] {
    return [...this.agents];
  }

  public getActiveAgents(): AIAgent[] {
    return this.agents.filter(agent => agent.status === 'active');
  }

  public getAgent(id: number): AIAgent | undefined {
    return this.agents.find(agent => agent.id === id);
  }

  public updateAgentStatus(id: number, status: AIAgent['status']): boolean {
    const agent = this.getAgent(id);
    if (agent) {
      agent.status = status;
      return true;
    }
    return false;
  }

  public updateAgentTask(id: number, task: string): boolean {
    const agent = this.getAgent(id);
    if (agent) {
      agent.current_task = task;
      return true;
    }
    return false;
  }

  public getSystemStats() {
    const activeAgents = this.getActiveAgents();
    const totalTrades = activeAgents.reduce((sum, agent) => sum + agent.performance_metrics.trades_executed, 0);
    const totalProfit = activeAgents.reduce((sum, agent) => sum + agent.performance_metrics.profit_contribution, 0);
    const avgAccuracy = activeAgents.reduce((sum, agent) => sum + agent.accuracy, 0) / activeAgents.length;

    return {
      total_agents: this.agents.length,
      active_agents: activeAgents.length,
      inactive_agents: this.agents.filter(a => a.status !== 'active').length,
      total_trades: totalTrades,
      total_profit: totalProfit,
      average_accuracy: Number(avgAccuracy.toFixed(1)),
      top_performer: activeAgents.reduce((top, agent) => 
        agent.accuracy > top.accuracy ? agent : top, activeAgents[0])
    };
  }
}