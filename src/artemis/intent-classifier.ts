/**
 * Artemis Intent Classifier
 * Task-9: Rule-based NLU for chatbot intents (no external LLM)
 */

export interface Intent {
  name: string;
  confidence: number;
  parameters?: Record<string, any>;
}

export interface ClassificationResult {
  intent: string;
  confidence: number;
  actions: string[];
  response: string;
  requires_confirmation?: boolean;
  parameters?: Record<string, any>;
}

/**
 * Intent patterns and keywords
 */
const INTENT_PATTERNS = {
  start_autopilot: {
    keywords: ['start', 'begin', 'launch', 'activate', 'autopilot', 'auto', 'bot', 'trading'],
    phrases: [
      'start autopilot',
      'begin auto trading',
      'launch bot',
      'activate trading bot',
      'turn on autopilot',
      'enable auto mode'
    ],
    requires_confirmation: false
  },
  
  set_target: {
    keywords: ['set', 'target', 'goal', 'profit', 'aim', 'objective'],
    phrases: [
      'set target',
      'set profit goal',
      'change target',
      'update goal',
      'my target is'
    ],
    requires_confirmation: false,
    extract_params: (text: string) => {
      // Extract percentage or dollar amount
      const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
      const dollarMatch = text.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
      
      return {
        target_percent: percentMatch ? parseFloat(percentMatch[1]) : null,
        target_amount: dollarMatch ? parseFloat(dollarMatch[1].replace(/,/g, '')) : null
      };
    }
  },
  
  status: {
    keywords: ['status', 'how', 'what', 'show', 'check', 'balance', 'performance', 'portfolio'],
    phrases: [
      'show status',
      'how am i doing',
      'what\'s my balance',
      'check performance',
      'portfolio status',
      'current status'
    ],
    requires_confirmation: false
  },
  
  emergency_stop: {
    keywords: ['stop', 'pause', 'halt', 'emergency', 'cancel', 'abort', 'disable'],
    phrases: [
      'emergency stop',
      'stop trading',
      'halt all',
      'pause autopilot',
      'stop everything',
      'cancel orders',
      'disable bot'
    ],
    requires_confirmation: true // CRITICAL ACTION
  },
  
  link_wallet: {
    keywords: ['link', 'connect', 'wallet', 'exchange', 'api', 'key', 'mexc'],
    phrases: [
      'link wallet',
      'connect exchange',
      'add api key',
      'link mexc',
      'connect my wallet'
    ],
    requires_confirmation: true // SENSITIVE ACTION
  }
};

/**
 * Rule-based intent classifier
 */
export class IntentClassifier {
  /**
   * Classify user text into intent
   */
  classify(text: string): ClassificationResult {
    const normalizedText = text.toLowerCase().trim();
    
    // Score each intent
    const scores: Record<string, number> = {};
    const params: Record<string, any> = {};
    
    for (const [intentName, pattern] of Object.entries(INTENT_PATTERNS)) {
      let score = 0;
      
      // Check exact phrases (high confidence)
      for (const phrase of pattern.phrases) {
        if (normalizedText.includes(phrase.toLowerCase())) {
          score += 0.8;
          break;
        }
      }
      
      // Check keywords (lower confidence)
      const keywordMatches = pattern.keywords.filter(keyword => 
        normalizedText.includes(keyword.toLowerCase())
      );
      
      score += keywordMatches.length * 0.2;
      
      // Bonus for multiple keyword matches
      if (keywordMatches.length >= 2) {
        score += 0.2;
      }
      
      // Normalize score to [0, 1]
      scores[intentName] = Math.min(score, 1);
      
      // Extract parameters if function exists
      if (pattern.extract_params) {
        params[intentName] = pattern.extract_params(text);
      }
    }
    
    // Find intent with highest score
    let bestIntent = 'unknown';
    let maxScore = 0.3; // Minimum confidence threshold
    
    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }
    
    // Build classification result
    if (bestIntent === 'unknown') {
      return {
        intent: 'unknown',
        confidence: 0,
        actions: [],
        response: 'I\'m not sure what you mean. Try commands like "start autopilot", "show status", or "emergency stop".'
      };
    }
    
    const pattern = INTENT_PATTERNS[bestIntent as keyof typeof INTENT_PATTERNS];
    const result: ClassificationResult = {
      intent: bestIntent,
      confidence: maxScore,
      actions: this.getActionsForIntent(bestIntent),
      response: this.getResponseForIntent(bestIntent, params[bestIntent]),
      requires_confirmation: pattern.requires_confirmation
    };
    
    if (params[bestIntent]) {
      result.parameters = params[bestIntent];
    }
    
    return result;
  }
  
  /**
   * Get actions for an intent
   */
  private getActionsForIntent(intent: string): string[] {
    const actionMap: Record<string, string[]> = {
      start_autopilot: ['check_balance', 'verify_api_keys', 'start_trading_engine'],
      set_target: ['validate_target', 'update_user_settings', 'recalculate_strategy'],
      status: ['fetch_portfolio', 'fetch_recent_trades', 'calculate_pnl'],
      emergency_stop: ['pause_autopilot', 'cancel_open_orders', 'notify_user'],
      link_wallet: ['validate_api_keys', 'test_connection', 'save_credentials']
    };
    
    return actionMap[intent] || [];
  }
  
  /**
   * Generate response for an intent
   */
  private getResponseForIntent(intent: string, params?: any): string {
    const responses: Record<string, string> = {
      start_autopilot: 'Starting autopilot... I\'ll monitor the market and execute trades based on your strategy.',
      set_target: params?.target_percent 
        ? `Target set to ${params.target_percent}% profit. I\'ll adjust the strategy accordingly.`
        : `Target updated. I'll work towards your goal.`,
      status: 'Here\'s your current status: fetching portfolio data...',
      emergency_stop: '⚠️ **Emergency Stop Initiated** - All trading will be halted. Please confirm this action.',
      link_wallet: '🔐 **Link Wallet** - I\'ll need your MEXC API keys. This is a sensitive operation. Please confirm to proceed.'
    };
    
    return responses[intent] || 'Processing your request...';
  }
}

/**
 * Few-shot learning examples (for future improvements)
 */
export const FEW_SHOT_EXAMPLES = [
  { text: 'can you start the trading bot for me?', intent: 'start_autopilot' },
  { text: 'i want to aim for 15% profit', intent: 'set_target' },
  { text: 'how\'s my portfolio doing?', intent: 'status' },
  { text: 'STOP EVERYTHING NOW', intent: 'emergency_stop' },
  { text: 'i need to connect my mexc account', intent: 'link_wallet' }
];
