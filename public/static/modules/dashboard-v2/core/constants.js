/**
 * Dashboard Constants & Configuration
 * 🎯 TITAN Platform - Professional Dashboard Rewrite
 * Version: 2.0.0
 * Last Updated: 2024-11-15
 */

export const DASHBOARD_CONFIG = {
    // API Configuration
    API: {
        ENDPOINT: '/api/dashboard/comprehensive-real',
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },
    
    // Refresh Configuration
    REFRESH: {
        INTERVAL: 30000, // 30 seconds auto-refresh
        MANUAL_COOLDOWN: 2000 // 2 seconds cooldown for manual refresh
    },
    
    // Widget Configuration
    WIDGETS: {
        PORTFOLIO: {
            id: 'portfolio-widget',
            title: 'پورتفولیو',
            icon: '💼',
            order: 1
        },
        MARKET: {
            id: 'market-widget',
            title: 'بازار',
            icon: '📊',
            order: 2
        },
        SYSTEM: {
            id: 'system-widget',
            title: 'وضعیت سیستم',
            icon: '🖥️',
            order: 3
        },
        CHART: {
            id: 'chart-widget',
            title: 'نمودار',
            icon: '📈',
            order: 4
        }
    },
    
    // AI Agents Configuration
    AI_AGENTS: {
        TOTAL_COUNT: 15,
        STATUS_COLORS: {
            active: '#10b981',
            inactive: '#6b7280',
            warning: '#f59e0b',
            error: '#ef4444'
        },
        STATUS_LABELS: {
            active: 'فعال',
            inactive: 'غیرفعال',
            warning: 'هشدار',
            error: 'خطا'
        }
    },
    
    // Chart Configuration
    CHART: {
        DEFAULT_TIMEFRAME: '1D',
        TIMEFRAMES: ['1H', '4H', '1D', '1W', '1M'],
        COLORS: {
            primary: '#3b82f6',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            grid: '#e5e7eb'
        }
    },
    
    // Format Configuration
    FORMAT: {
        CURRENCY: {
            locale: 'en-US',
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        NUMBER: {
            locale: 'en-US',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        },
        PERCENTAGE: {
            locale: 'en-US',
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        DATE: {
            locale: 'fa-IR',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    },
    
    // Error Messages (Persian)
    ERRORS: {
        LOAD_FAILED: 'خطا در بارگذاری داده‌های داشبورد',
        API_TIMEOUT: 'زمان انتظار برای دریافت داده به پایان رسید',
        NETWORK_ERROR: 'خطای ارتباط با سرور',
        INVALID_DATA: 'داده‌های دریافتی نامعتبر هستند',
        REFRESH_FAILED: 'خطا در به‌روزرسانی داده‌ها'
    },
    
    // Success Messages (Persian)
    SUCCESS: {
        DATA_LOADED: 'داده‌ها با موفقیت بارگذاری شد',
        REFRESHED: 'داشبورد به‌روزرسانی شد'
    },
    
    // Loading Messages (Persian)
    LOADING: {
        INITIAL: 'در حال بارگذاری داشبورد...',
        REFRESH: 'در حال به‌روزرسانی...',
        WIDGET: 'در حال بارگذاری...'
    }
};

/**
 * API Response Structure (TypeScript-like documentation)
 * 
 * ComprehensiveResponse {
 *   success: boolean
 *   data: {
 *     portfolio: {
 *       totalBalance: number
 *       availableBalance: number
 *       lockedBalance: number
 *       dailyChange: number
 *       dailyChangePercent: number
 *       weeklyChange: number
 *       monthlyChange: number
 *     }
 *     market: {
 *       btcPrice: number
 *       btcChange24h: number
 *       ethPrice: number
 *       ethChange24h: number
 *       fearGreedIndex: number
 *       fearGreedLabel: string
 *       btcDominance: number
 *     }
 *     system: {
 *       status: string
 *       uptime: number
 *       activeConnections: number
 *       apiHealth: boolean
 *       redisHealth: boolean
 *       dbHealth: boolean
 *     }
 *     chartData: {
 *       labels: string[]
 *       datasets: Array<{
 *         label: string
 *         data: number[]
 *         borderColor: string
 *         backgroundColor: string
 *       }>
 *     }
 *     aiAgents: Array<{
 *       id: number
 *       name: string
 *       status: string
 *       accuracy: number
 *       totalTrades: number
 *       successRate: number
 *       lastActive: string
 *     }>
 *     trades: Array<{
 *       id: number
 *       symbol: string
 *       side: string
 *       price: number
 *       quantity: number
 *       timestamp: string
 *     }>
 *   }
 *   timestamp: string
 * }
 */

export const API_STRUCTURE = {
    REQUIRED_FIELDS: [
        'portfolio',
        'market',
        'system',
        'chartData',
        'aiAgents',
        'trades'
    ],
    PORTFOLIO_FIELDS: [
        'totalBalance',
        'dailyChange'
    ],
    MARKET_FIELDS: [
        'btcPrice',
        'ethPrice'
    ],
    AI_AGENT_FIELDS: [
        'id',
        'name',
        'status'
    ]
};

/**
 * DOM Element IDs
 */
export const DOM_IDS = {
    DASHBOARD_CONTAINER: 'dashboard-container',
    WIDGETS_GRID: 'widgets-grid',
    AI_AGENTS_SECTION: 'ai-agents-section',
    LAST_UPDATE: 'last-update-time',
    REFRESH_BUTTON: 'refresh-dashboard',
    LOADING_OVERLAY: 'loading-overlay'
};

/**
 * CSS Classes
 */
export const CSS_CLASSES = {
    WIDGET: 'dashboard-widget',
    WIDGET_ACTIVE: 'widget-active',
    WIDGET_ERROR: 'widget-error',
    WIDGET_LOADING: 'widget-loading',
    POSITIVE_CHANGE: 'change-positive',
    NEGATIVE_CHANGE: 'change-negative',
    AGENT_CARD: 'agent-card',
    AGENT_ACTIVE: 'agent-active',
    AGENT_INACTIVE: 'agent-inactive'
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
    WIDGET_CONFIG: 'titan_dashboard_widget_config',
    LAST_REFRESH: 'titan_dashboard_last_refresh',
    USER_PREFERENCES: 'titan_dashboard_preferences'
};

export default DASHBOARD_CONFIG;
