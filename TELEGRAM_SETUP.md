# 🤖 راهنمای راه‌اندازی ربات تلگرام برای سیستم هشدارها

## 📋 مراحل راه‌اندازی:

### 1️⃣ **ایجاد ربات تلگرام:**

1. به ربات [BotFather](https://t.me/BotFather) در تلگرام پیام دهید
2. دستور `/start` را ارسال کنید
3. دستور `/newbot` را ارسال کنید
4. نام ربات را انتخاب کنید (مثال: `TITAN Trading Bot`)
5. نام کاربری ربات را انتخاب کنید (باید به `bot` ختم شود، مثال: `titan_trading_bot`)
6. توکن ربات را کپی کنید (مثال: `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`)

### 2️⃣ **دریافت Chat ID:**

**روش 1 - دریافت Chat ID شخصی:**
1. به ربات خودتان پیام دهید (هر متنی)
2. این لینک را در مرورگر باز کنید:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. در پاسخ، به دنبال `"chat":{"id": CHAT_ID}` بگردید
4. این عدد، Chat ID شماست

**روش 2 - ایجاد کانال (توصیه می‌شود):**
1. کانال جدیدی در تلگرام ایجاد کنید
2. ربات را به عنوان ادمین کانال اضافه کنید
3. پیامی در کانال ارسال کنید
4. از لینک بالا برای دریافت Chat ID کانال استفاده کنید
5. Chat ID کانال‌ها با `-` شروع می‌شوند (مثال: `-1001234567890`)

### 3️⃣ **تنظیم متغیرهای محیطی:**

فایل `.env` را ایجاد کرده و مقادیر را وارد کنید:

```bash
# Telegram Configuration
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
TELEGRAM_CHAT_ID="123456789"  # یا Chat ID کانال
ENABLE_TELEGRAM="true"
```

### 4️⃣ **تنظیمات Cloudflare Workers (برای Production):**

```bash
# Set secrets in Cloudflare Workers
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
```

### 5️⃣ **تست عملکرد:**

1. وارد سیستم شوید
2. به بخش "هشدارها" بروید
3. روی "تنظیمات" کلیک کنید
4. گزینه "اعلان‌های تلگرام" را فعال کنید
5. روی "تست اطلاع‌رسانی" کلیک کنید

## 🔧 **نمونه کدهای تست:**

### تست مستقیم API:

```bash
# Test Telegram notification
curl -X POST "http://localhost:3000/api/alerts/test-notification" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notificationType": "telegram"}'
```

### تست وضعیت سرویس:

```bash
# Check notification service status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/alerts/notification-status"
```

## 🚀 **نمونه پیام هشدار:**

```
🚀 تایتان - سیستم معاملات

🚨 هشدار فعال شد: Bitcoin $45,000

هشدار BTC در قیمت $45,250 فعال شد.

💰 نماد: BTC
💲 قیمت فعلی: $45,250
🎯 قیمت هدف: $45,000
📈 تغییر: +2.5%

⏰ 1403/06/22، 18:30:45
```

## 🔐 **نکات امنیتی:**

1. **هرگز توکن ربات را عمومی نکنید**
2. **از کانال خصوصی برای هشدارها استفاده کنید**
3. **دسترسی ربات را محدود کنید**
4. **Token را به صورت secret در Cloudflare ذخیره کنید**

## ⚙️ **تنظیمات پیشرفته:**

### کانال عمومی برای اعضا:
```bash
# Channel ID for public notifications
TELEGRAM_CHANNEL_ID="-1001234567890"

# Private chat for admin alerts
TELEGRAM_ADMIN_CHAT_ID="123456789"
```

### فرمت پیام سفارشی:
در فایل `notification-service.ts` می‌توانید فرمت پیام‌ها را تغییر دهید.

## 🆘 **عیب‌یابی رایج:**

### خطای "Chat not found":
- Chat ID اشتباه است
- ربات را به کانال اضافه نکرده‌اید
- پیام اول را به ربات نفرستاده‌اید

### خطای "Bot token invalid":
- توکن اشتباه یا منقضی است
- از BotFather دوباره توکن بگیرید

### پیام ارسال نمی‌شود:
- بررسی کنید که `ENABLE_TELEGRAM=true` باشد
- لاگ‌های سرور را بررسی کنید
- تست مستقیم API را امتحان کنید

## 📞 **پشتیبانی:**

اگر مشکلی داشتید، لاگ‌های سرور را بررسی کنید:
```bash
pm2 logs titan-trading --nostream
```

یا از طریق API وضعیت سرویس را بررسی کنید:
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/alerts/notification-status"
```