# 📊 TITAN Logging System

**مستندات کامل سیستم لاگینگ ساخت‌یافته TITAN**

---

## Table of Contents

1. [معماری](#معماری)
2. [استفاده](#استفاده)
3. [سطوح Log](#سطوح-log)
4. [Log Rotation](#log-rotation)
5. [Error Monitoring](#error-monitoring)
6. [Troubleshooting](#troubleshooting)

---

## معماری

### ساختار فایل‌ها

```
TITAN/
├── logs/
│   ├── titan.log              # لاگ اصلی (JSON structured)
│   ├── titan.log-20251101.gz  # لاگ فشرده‌شده روز قبل
│   ├── error-alerts.log       # هشدارهای خطا
│   ├── backend-error.log      # PM2 error logs
│   └── backend-out.log        # PM2 output logs
├── src/utils/
│   ├── logger.ts              # Logger اصلی (TypeScript/ESM)
│   └── logger.js              # Logger wrapper (CommonJS)
└── scripts/
    └── error-watch.sh         # نظارتگر خطا
```

### کتابخانه‌های استفاده شده

- **pino**: Fast and low overhead Node.js logger
- **pino-pretty**: Pretty printing برای development
- **logrotate**: چرخش خودکار لاگ‌ها (نصب شده روی سیستم)

---

## استفاده

### 1. در کد JavaScript (server.js)

Logger به‌صورت خودکار `console.log`, `console.error`, `console.warn` را override می‌کند:

```javascript
// Logger automatically loaded in server.js
const logger = require('./src/utils/logger.js');

// Use console as normal - it's now structured logging!
console.log('Server started on port 5000');
console.error('Database connection failed', error);
console.warn('High memory usage detected');
```

### 2. در کد TypeScript

```typescript
import { logger, createChildLogger, logHttpRequest } from './utils/logger';

// Basic logging
logger.info('User logged in', { userId: 123, ip: '1.2.3.4' });
logger.error({ err: error }, 'Failed to process payment');
logger.warn('API rate limit approaching', { remaining: 10 });

// Child logger with context
const requestLogger = createChildLogger({ requestId: 'abc-123' });
requestLogger.info('Processing request');
requestLogger.error({ err }, 'Request failed');

// HTTP request logging
logHttpRequest(req, res, 234); // 234ms duration

// Business event logging
logBusinessEvent('order_placed', { orderId: 456, amount: 1000 });

// Security event logging
logSecurityEvent('failed_login_attempt', { username: 'admin', ip: '1.2.3.4' });

// Performance metrics
logPerformanceMetric('db_query_time', 123, 'ms');
```

---

## سطوح Log

Pino از سیستم سطح‌بندی زیر استفاده می‌کند:

| Level | Value | Method | کاربرد |
|-------|-------|--------|--------|
| trace | 10 | `logger.trace()` | اطلاعات بسیار جزئی (معمولاً غیرفعال) |
| debug | 20 | `logger.debug()` | اطلاعات دیباگ (فقط development) |
| **info** | 30 | `logger.info()` | اطلاعات عمومی (پیش‌فرض production) |
| warn | 40 | `logger.warn()` | هشدارها |
| error | 50 | `logger.error()` | خطاها |
| fatal | 60 | `logger.fatal()` | خطاهای بحرانی |

### تنظیم سطح Log

```bash
# در .env
LOG_LEVEL=info  # Options: trace, debug, info, warn, error, fatal

# موقت برای یک اجرا
LOG_LEVEL=debug npm start

# تغییر در production
echo "LOG_LEVEL=debug" >> /etc/titan/.env.prod
pm2 reload titan-backend
```

---

## Log Rotation

### پیکربندی

فایل: `/etc/logrotate.d/titan`

```
/home/ubuntu/Titan/logs/*.log {
  daily          # چرخش روزانه
  rotate 7       # نگهداری 7 روز
  compress       # فشرده‌سازی فایل‌های قدیمی
  delaycompress  # فشرده‌سازی فایل قبلی (نه فایل جاری)
  missingok      # اگر فایل وجود نداشت، خطا ندهد
  notifempty     # فایل‌های خالی را rotate نکن
  copytruncate   # کپی + truncate (بهتر از rename برای PM2)
  create 0640 ubuntu ubuntu
  dateext        # اضافه کردن تاریخ به نام فایل
  dateformat -%Y%m%d
  
  postrotate
    /usr/bin/pm2 reloadLogs > /dev/null 2>&1 || true
  endscript
}
```

### تست دستی

```bash
# Dry run (شبیه‌سازی)
sudo logrotate -d /etc/logrotate.d/titan

# اجرای واقعی (force)
sudo logrotate -f /etc/logrotate.d/titan

# بررسی نتیجه
ls -lh /home/ubuntu/Titan/logs/
```

### زمان‌بندی اتوماتیک

logrotate توسط cron اجرا می‌شود (معمولاً روزانه ساعت 00:00):

```bash
# بررسی cron job
cat /etc/cron.daily/logrotate

# بررسی log آخرین اجرا
cat /var/lib/logrotate/status
```

---

## Error Monitoring

### error-watch Service

سرویس `titan-error-watch` به‌صورت مداوم لاگ‌ها را نظارت می‌کند و برای خطاها هشدار می‌دهد.

**وضعیت:**
```bash
pm2 status titan-error-watch
```

**لاگ‌ها:**
```bash
# لاگ‌های real-time
pm2 logs titan-error-watch

# هشدارهای ثبت‌شده
tail -f /home/ubuntu/Titan/logs/error-alerts.log

# جستجوی هشدارهای امروز
grep $(date +%Y-%m-%d) logs/error-alerts.log
```

**Restart:**
```bash
pm2 restart titan-error-watch
```

### تست Error Alert

ایجاد یک error مصنوعی برای تست:

```bash
# Method 1: با curl
curl -X POST https://www.zala.ir/api/nonexistent-endpoint

# Method 2: ارسال log مستقیم
node -e "const logger = require('./src/utils/logger.js'); logger.error({err: new Error('Test error')}, 'This is a test error');"

# بررسی alert
tail -10 logs/error-alerts.log
```

---

## npm Scripts

```json
{
  "scripts": {
    "logs:view": "tail -f logs/titan.log",
    "logs:error": "grep -i error logs/titan.log",
    "logs:json": "tail -20 logs/titan.log | jq .",
    "logs:today": "grep $(date +%Y-%m-%d) logs/titan.log"
  }
}
```

**استفاده:**
```bash
# مشاهده لاگ‌های real-time
npm run logs:view

# جستجوی خطاها
npm run logs:error

# نمایش لاگ‌های JSON با format خوانا
npm run logs:json

# لاگ‌های امروز
npm run logs:today
```

---

## Troubleshooting

### مشکل 1: لاگ فایل ایجاد نمی‌شود

**علت**: مسیر `logs/` وجود ندارد یا permission ندارد

**راه‌حل:**
```bash
cd /home/ubuntu/Titan
mkdir -p logs
chmod 755 logs
pm2 restart titan-backend
```

### مشکل 2: لاگ‌ها rotate نمی‌شوند

**علت**: logrotate config اشتباه یا cron کار نمی‌کند

**راه‌حل:**
```bash
# تست config
sudo logrotate -d /etc/logrotate.d/titan

# اجرای دستی
sudo logrotate -f /etc/logrotate.d/titan

# بررسی cron
sudo systemctl status cron
```

### مشکل 3: error-watch هشدار نمی‌دهد

**علت**: Service متوقف است یا regex اشتباه است

**راه‌حل:**
```bash
# بررسی وضعیت
pm2 status titan-error-watch

# بررسی لاگ‌ها
pm2 logs titan-error-watch --lines 50

# Restart
pm2 restart titan-error-watch

# تست دستی با error مصنوعی
node -e "const logger = require('./src/utils/logger.js'); logger.error('Test error');"
tail -5 logs/error-alerts.log
```

### مشکل 4: لاگ‌ها خیلی بزرگ شدند

**راه‌حل:**
```bash
# بررسی حجم
du -sh logs/

# پاک‌سازی لاگ‌های قدیمی (بیش از 7 روز)
find logs/ -name "*.log-*" -mtime +7 -delete

# Truncate کردن لاگ فعلی (خطرناک!)
# : > logs/titan.log  # NOT RECOMMENDED while service is running

# بهتر: Force rotation
sudo logrotate -f /etc/logrotate.d/titan
```

---

## Performance Considerations

### پیکربندی بهینه برای Production

1. **Log Level**: از `info` استفاده کنید، نه `debug` یا `trace`
2. **Async Logging**: pino به‌صورت async می‌نویسد (بدون blocking)
3. **Rotation**: روزانه rotate کنید، نه hourly (overhead کمتر)
4. **Compression**: لاگ‌های قدیمی را compress کنید (80% کاهش فضا)
5. **Retention**: حداکثر 7 روز نگه دارید (یا بیشتر در صورت نیاز)

### مانیتورینگ فضای Disk

```bash
# حجم پوشه logs
du -sh /home/ubuntu/Titan/logs

# حجم هر فایل
ls -lh /home/ubuntu/Titan/logs/

# بررسی فضای disk
df -h /home/ubuntu

# Alert اگر disk بیش از 80% پر شد
DISK_USAGE=$(df /home/ubuntu | awk 'NR==2 {print $5}' | tr -d '%')
if [ $DISK_USAGE -gt 80 ]; then
  echo "⚠️ Disk usage high: ${DISK_USAGE}%"
fi
```

---

## Best Practices

### 1. استفاده از Structured Data

```javascript
// ❌ Bad
logger.info('User 123 logged in from 1.2.3.4');

// ✅ Good
logger.info({ userId: 123, ip: '1.2.3.4' }, 'User logged in');
```

### 2. Context در Child Loggers

```typescript
// برای هر request، یک child logger با requestId
const requestLogger = createChildLogger({ requestId: req.id });
requestLogger.info('Processing payment');
requestLogger.error({ err }, 'Payment failed');
```

### 3. هرگز Secrets را Log نکنید

```javascript
// ❌ NEVER
logger.info({ password: 'secret123' }, 'User created');

// ✅ Logger automatically redacts these fields:
// password, authorization, JWT_SECRET, DATABASE_URL, *.token
```

### 4. Error Objects

```javascript
// ❌ Bad
logger.error('Error: ' + error.message);

// ✅ Good
logger.error({ err: error }, 'Operation failed');
// Pino serializes error stack trace automatically
```

---

## Related Documentation

- [RUNBOOK_Secrets_Local.md](./RUNBOOK_Secrets_Local.md) - مدیریت سکرت‌ها
- [NGINX_Health_Route.md](./NGINX_Health_Route.md) - پیکربندی health endpoint
- [DEPLOYMENT.md](./DEPLOYMENT.md) - مستندات deployment
- [MONITORING_AND_SAFETY.md](./MONITORING_AND_SAFETY.md) - سیستم‌های نظارت

---

**آخرین به‌روزرسانی**: 2025-11-02  
**نسخه**: 1.0.0  
**نگهدارنده**: TITAN DevOps Team
