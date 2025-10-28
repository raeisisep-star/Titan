// config/rateLimit.js
module.exports = {
  // سیاست‌های نمونه؛ می‌تونید تغییر بدید
  policies: {
    // مسیرهای حساس (لاگین/توکن)
    auth: { points: 5, duration: 5, blockMs: 0 }, // 5 req / 5s

    // سفارش‌گذاری و ترید
    trading: { points: 10, duration: 10, blockMs: 0 }, // 10 req / 10s

    // عمومی (GET ها)
    public: { 
      points: parseInt(process.env.RATE_LIMIT_DEFAULT_POINTS || 60, 10),
      duration: parseInt(process.env.RATE_LIMIT_DEFAULT_DURATION || 60, 10),
      blockMs: parseInt(process.env.RATE_LIMIT_DEFAULT_BLOCK_MS || 0, 10) 
    },

    // Burst کوچک برای جلوگیری از اسپایک
    burst: { 
      points: parseInt(process.env.RATE_LIMIT_BURST_POINTS || 10, 10),
      duration: parseInt(process.env.RATE_LIMIT_BURST_DURATION || 5, 10) 
    },
  },

  // نگاشت مسیر → سیاست
  detectPolicy: (req) => {
    const p = req.path || '';
    if (p.startsWith('/api/auth')) return 'auth';
    if (p.startsWith('/api/manual-trading')) return 'trading';
    return 'public';
  },

  // کلید یکتا برای کاربر/آی‌پی
  makeKey: (req) => {
    // اگر JWT دارید و userId می‌گیرید، همان را استفاده کنید
    const userId = req.user?.id;
    if (userId) return `u:${userId}`;
    const ip = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '').toString();
    return `ip:${ip}`;
  },
};
