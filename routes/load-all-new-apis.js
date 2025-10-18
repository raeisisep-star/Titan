/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚀 LOAD ALL NEW MISSING APIs
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * این فایل تمام APIهای جدید را load می‌کند
 */

function loadAllNewAPIs(app, pool, redisClient) {
  console.log('');
  console.log('🔄 Loading all new missing APIs...');
  
  try {
    // Load Part 1: AI, Artemis, Autopilot, Notifications, News
    const part1 = require('./all-missing-apis');
    part1(app, pool, redisClient);
    console.log('✅ Part 1 loaded: AI, Artemis, Autopilot, Notifications, News');
    
    // Load Part 2: Watchlist, Trading, Portfolio, Market, Monitoring
    const part2 = require('./all-missing-apis-part2');
    part2(app, pool, redisClient);
    console.log('✅ Part 2 loaded: Watchlist, Trading, Portfolio, Market, Monitoring');
    
    // Load Part 3: Real AI Chatbot (OpenAI, Anthropic, Google)
    const aiChatbotReal = require('./ai-chatbot-real');
    aiChatbotReal(app, pool, redisClient);
    console.log('✅ Part 3 loaded: Real AI Chatbot (OpenAI, Claude, Gemini)');
    
    // Load Part 4: Real Autopilot System (Trading Engine)
    const autopilotReal = require('./autopilot-real');
    autopilotReal(app, pool, redisClient);
    console.log('✅ Part 4 loaded: Real Autopilot System (Trading Engine)');
    
    // Load Part 5: Real Market Data (Binance, MEXC)
    const marketDataReal = require('./market-data-real');
    marketDataReal(app, pool, redisClient);
    console.log('✅ Part 5 loaded: Real Market Data (Binance, MEXC)');
    
    // Load Part 6: Real Analytics & Monitoring
    const analyticsReal = require('./analytics-real');
    analyticsReal(app, pool, redisClient);
    console.log('✅ Part 6 loaded: Real Analytics & Monitoring (Performance Tracking)');
    
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL NEW APIs LOADED SUCCESSFULLY                                     ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 New API Summary:');
    console.log('   🤖 AI & Artemis APIs: 15+ endpoints');
    console.log('   🧠 Real AI Chatbot APIs: 8+ endpoints (OpenAI, Claude, Gemini)');
    console.log('   🤖 Real Autopilot APIs: 13 endpoints (Trading Engine)');
    console.log('   📊 Real Market Data APIs: 12 endpoints (Binance, MEXC)');
    console.log('   📊 Real Analytics APIs: 13 endpoints (Performance Tracking)');
    console.log('   🚀 Autopilot Mock APIs: 10+ endpoints');
    console.log('   🔔 Notifications & Alerts: 12+ endpoints');
    console.log('   📰 News APIs: 5+ endpoints');
    console.log('   👀 Watchlist APIs: 4 endpoints');
    console.log('   💹 Trading APIs (Extended): 8+ endpoints');
    console.log('   💼 Portfolio APIs (Extended): 6+ endpoints');
    console.log('   📈 Market APIs (Extended): 3+ endpoints');
    console.log('   📊 Monitoring & System: 8+ endpoints');
    console.log('   📊 Analytics: 4+ endpoints');
    console.log('   🎮 Mode APIs: 4 endpoints');
    console.log('');
    console.log('   📈 Total New Endpoints: 126+');
    console.log('   🤖 Real AI Integration: OpenAI GPT-4, Anthropic Claude 3, Google Gemini');
    console.log('   💹 Real Trading: Binance, MEXC (with Risk Management)');
    console.log('   📊 Real Market Data: Binance & MEXC APIs, WebSocket Support');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error loading new APIs:', error.message);
    console.error(error.stack);
  }
}

module.exports = { loadAllNewAPIs };
