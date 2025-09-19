# 🤖 راهنمای راه‌اندازی Chat ID تلگرام

## ✅ مرحله ۱: اطلاعات ربات
Bot تلگرام شما با موفقیت پیکربندی شده:
- **نام ربات**: GoldDollarPrediction
- **نام کاربری**: @GoldDollarPrediction_bot
- **توکن**: 7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA (پیکربندی شده)

## 📱 مرحله ۲: دریافت Chat ID

### روش ۱: استفاده از تلگرام
1. در تلگرام جستجو کنید: `@GoldDollarPrediction_bot`
2. روی ربات کلیک کنید و گفتگو را شروع کنید
3. یک پیام ارسال کنید (مثلاً "سلام" یا "تست")
4. در ترمینال اجرا کنید:
   ```bash
   cd /home/user/webapp && node get_chat_id.js
   ```

### روش ۲: استفاده از مرورگر
1. ابتدا با ربات پیام رد و بدل کنید
2. به آدرس زیر بروید:
   ```
   https://api.telegram.org/bot7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA/getUpdates
   ```
3. در نتایج JSON، عدد `chat.id` را پیدا کنید

## ⚙️  مرحله ۳: پیکربندی Chat ID

بعد از دریافت Chat ID، آن را در فایل `.dev.vars` قرار دهید:

```bash
# باز کردن فایل تنظیمات
nano /home/user/webapp/.dev.vars

# تغییر خط TELEGRAM_CHAT_ID
TELEGRAM_CHAT_ID="YOUR_CHAT_ID_HERE"
```

مثال:
```bash
TELEGRAM_CHAT_ID="123456789"
```

## 🔄 مرحله ۴: راه‌اندازی مجدد سرویس

```bash
cd /home/user/webapp
pm2 restart titan-trading
```

## 🧪 مرحله ۵: تست نهایی

```bash
cd /home/user/webapp && node test_notifications.js
```

این script:
- ✅ وارد سیستم می‌شود
- ✅ تنظیمات notification را بررسی می‌کند  
- ✅ پیام تست به تلگرام ارسال می‌کند
- ✅ یک alert نمونه ایجاد می‌کند

## 🎯 مثال خروجی موفق

```
🚀 TITAN Alerts & Notifications Test

==================================
🔐 Logging in to TITAN system...
✅ Login successful!
   User: testuser

📋 Checking notification settings...
✅ Current notification settings:
   Telegram enabled: true
   Email enabled: false
   SMS enabled: false
   Telegram Chat ID: 123456789

⚙️  Updating notification settings...
✅ Settings updated successfully!

🧪 Testing Telegram notification...
✅ Telegram test successful!

📈 Creating test price alert...
✅ Test alert created successfully!
   Alert ID: 1
   Symbol: XAUUSD
   Target Price: $2000

📋 Listing current alerts...
✅ Found 1 alerts:
   1. تست هشدار قیمت طلا (XAUUSD)
      Target: $2000 | Active: ✅

🎉 Test completed! Check your Telegram for notifications.
```

## 🛠 عیب‌یابی

### مشکل: Chat ID پیدا نشد
- مطمئن شوید پیام به ربات ارسال کرده‌اید
- چند دقیقه صبر کنید و دوباره تست کنید
- بررسی کنید ربات block نباشد

### مشکل: پیام ارسال نشد  
- Chat ID را دوباره بررسی کنید
- مطمئن شوید فایل `.dev.vars` ذخیره شده
- سرویس را restart کنید

### مشکل: Authentication Error
- مطمئن شوید سرویس در حال اجرا است: `pm2 list`
- بررسی کنید port 3000 آزاد باشد: `curl http://127.0.0.1:3000`

## 📞 شماره تلفن هدف
شماره تلفن شما: **+989384556010**

این شماره باید Chat ID متناظر با همین شماره را از ربات دریافت کند.