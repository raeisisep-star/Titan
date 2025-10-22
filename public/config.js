// TITAN Trading System - Production Configuration

// Environment variables for feature flags
window.ENV = {
  FORCE_REAL: 'true',      // 🔴 Production safety - ALWAYS use real data
  USE_MOCK: 'false',       // ❌ Mock data disabled
  DEBUG: 'false',          // Disable debug mode in production
  API_TIMEOUT: '8000',
  ENABLE_RETRY: 'true',
  MAX_RETRIES: '1'
};

window.TITAN_CONFIG = {
  // Backend API URLs - Local Development
  API_BASE_URL: '',  // Empty means same-origin (relative URLs)
  API_BASE_URL_ALT: '',
  
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
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh'
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
