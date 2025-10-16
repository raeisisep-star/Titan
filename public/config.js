// TITAN Trading System - Production Configuration
window.TITAN_CONFIG = {
  // Backend API URLs - سرور شخصی (HTTPS)
  API_BASE_URL: 'https://www.zala.ir',
  API_BASE_URL_ALT: 'https://www.zala.ir',
  
  // Environment
  ENVIRONMENT: 'production',
  VERSION: '1.0.0',
  
  // Features
  FEATURES: {
    REAL_TRADING: true,
    AI_AGENTS: true,
    NOTIFICATIONS: true,
    TELEGRAM_BOT: true,
    PORTFOLIO: true,
    ANALYTICS: true
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh'
    },
    TRADING: {
      LIST: '/trades',
      CREATE: '/trades/create',
      CANCEL: '/trades/cancel',
      HISTORY: '/trades/history'
    },
    PORTFOLIO: {
      SUMMARY: '/portfolio',
      ASSETS: '/portfolio/assets',
      PERFORMANCE: '/portfolio/performance'
    },
    DASHBOARD: {
      STATS: '/dashboard/stats',
      CHARTS: '/dashboard/charts',
      ACTIVITIES: '/dashboard/activities'
    },
    HEALTH: '/health'
  },
  
  // Timeouts
  TIMEOUTS: {
    API_REQUEST: 30000,
    WEBSOCKET_RECONNECT: 5000
  }
};

console.log('✅ TITAN Config loaded for:', window.TITAN_CONFIG.ENVIRONMENT);
console.log('📡 API Base:', window.TITAN_CONFIG.API_BASE_URL);
