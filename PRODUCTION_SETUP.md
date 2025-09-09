# 🚀 TITAN Trading System - Production Setup Guide

این راهنما جامع برای تنظیم و استقرار سیستم TITAN در محیط Production است.

## 📋 پیش‌نیازها

### 1. ابزارهای مورد نیاز
```bash
# Wrangler CLI
npm install -g wrangler

# وارد حساب Cloudflare شوید
wrangler login

# تأیید authentication
wrangler whoami
```

### 2. حساب‌های خارجی مورد نیاز
- **Cloudflare Account** - برای hosting و secrets management
- **OpenAI Account** - برای ChatGPT API (اختیاری)
- **Anthropic Account** - برای Claude API (اختیاری)  
- **Google AI Account** - برای Gemini API (اختیاری)
- **Exchange Accounts** - Binance, Coinbase Pro, KuCoin (برای live trading)
- **Notification Services** - Gmail, Telegram, Kavenegar SMS (اختیاری)

## 🏗️ مراحل نصب Production

### مرحله 1: تنظیم Environment
```bash
# کلون پروژه
git clone <repository-url>
cd webapp

# نصب dependencies
npm install

# کپی کردن template های environment
cp .env.example .env
cp .dev.vars.example .dev.vars

# ویرایش فایل‌های environment با API keys واقعی
nano .env
nano .dev.vars
```

### مرحله 2: تنظیم Cloudflare
```bash
# بیلد پروژه
npm run build

# تنظیم Cloudflare Pages
wrangler pages project create titan-trading --production-branch main

# تنظیم secrets (از اسکریپت آماده استفاده کنید)
./scripts/setup-secrets.sh
```

### مرحله 3: Database Setup
```bash
# ایجاد D1 Database
wrangler d1 create titan-production

# بروزرسانی wrangler.jsonc با database ID
# (ID را از خروجی دستور بالا کپی کنید)

# اجرای migrations
wrangler d1 migrations apply titan-production

# بررسی database
wrangler d1 execute titan-production --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### مرحله 4: KV Storage Setup
```bash
# ایجاد KV Namespace
wrangler kv:namespace create TITAN_CACHE

# بروزرسانی wrangler.jsonc با KV ID
# (ID را از خروجی دستور بالا کپی کنید)
```

### مرحله 5: Deploy
```bash
# Deploy اولیه
npm run deploy

# تست deployment
./scripts/validate-deployment.sh https://your-domain.pages.dev
```

## 🔑 راهنمای API Keys

### AI Services

#### OpenAI (ChatGPT)
1. برو به [OpenAI Platform](https://platform.openai.com/)
2. ساخت API Key جدید
3. اعتبار حساب را شارژ کن ($5 کافی برای شروع)
4. محدودیت‌های استفاده تنظیم کن

```bash
# تنظیم OpenAI
echo "YOUR_OPENAI_KEY" | wrangler pages secret put OPENAI_API_KEY --project-name titan-trading
```

#### Anthropic (Claude)
1. برو به [Anthropic Console](https://console.anthropic.com/)
2. ساخت API Key
3. شارژ حساب

```bash
# تنظیم Anthropic
echo "YOUR_ANTHROPIC_KEY" | wrangler pages secret put ANTHROPIC_API_KEY --project-name titan-trading
```

#### Google AI (Gemini)
1. برو به [Google AI Studio](https://aistudio.google.com/)
2. ساخت API Key
3. فعال‌سازی Gemini API

```bash
# تنظیم Google AI
echo "YOUR_GOOGLE_KEY" | wrangler pages secret put GOOGLE_API_KEY --project-name titan-trading
```

### Exchange APIs

#### Binance
1. برو به [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. ساخت API Key جدید
3. فعال‌سازی Spot & Margin Trading
4. تنظیم IP Restrictions (امنیت)

```bash
# تنظیم Binance (Production)
echo "YOUR_BINANCE_KEY" | wrangler pages secret put BINANCE_API_KEY --project-name titan-trading
echo "YOUR_BINANCE_SECRET" | wrangler pages secret put BINANCE_SECRET_KEY --project-name titan-trading
echo "false" | wrangler pages secret put BINANCE_TESTNET --project-name titan-trading
```

#### Coinbase Pro
1. برو به [Coinbase Pro API](https://pro.coinbase.com/profile/api)
2. ساخت API Key با دسترسی‌های view, trade
3. ذخیره passphrase

```bash
# تنظیم Coinbase Pro
echo "YOUR_COINBASE_KEY" | wrangler pages secret put COINBASE_API_KEY --project-name titan-trading
echo "YOUR_COINBASE_SECRET" | wrangler pages secret put COINBASE_SECRET --project-name titan-trading
echo "YOUR_COINBASE_PASSPHRASE" | wrangler pages secret put COINBASE_PASSPHRASE --project-name titan-trading
echo "false" | wrangler pages secret put COINBASE_SANDBOX --project-name titan-trading
```

### Notification Services

#### Email (Gmail)
1. فعال‌سازی 2-Factor Authentication در Gmail
2. ساخت App Password
3. استفاده از App Password به جای رمز اصلی

```bash
# تنظیم SMTP
echo "your-email@gmail.com" | wrangler pages secret put SMTP_USER --project-name titan-trading
echo "YOUR_APP_PASSWORD" | wrangler pages secret put SMTP_PASS --project-name titan-trading
```

#### Telegram Bot
1. پیام به [@BotFather](https://t.me/BotFather) در تلگرام
2. دستور `/newbot` و ایجاد بات جدید
3. دریافت Bot Token
4. پیدا کردن Chat ID خودت با [@userinfobot](https://t.me/userinfobot)

```bash
# تنظیم Telegram
echo "YOUR_BOT_TOKEN" | wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name titan-trading
echo "YOUR_CHAT_ID" | wrangler pages secret put TELEGRAM_CHAT_ID --project-name titan-trading
```

#### SMS (Kavenegar - Iran)
1. ثبت‌نام در [Kavenegar](https://kavenegar.com/)
2. تأیید حساب و شارژ
3. دریافت API Key

```bash
# تنظیم SMS
echo "YOUR_KAVENEGAR_KEY" | wrangler pages secret put KAVENEGAR_API_KEY --project-name titan-trading
echo "YOUR_SENDER_NUMBER" | wrangler pages secret put KAVENEGAR_SENDER --project-name titan-trading
```

## ⚙️ تنظیمات Production

### Environment Variables
```bash
# تنظیم محیط production
echo "production" | wrangler pages secret put NODE_ENV --project-name titan-trading
echo "false" | wrangler pages secret put DEBUG_MODE --project-name titan-trading

# تنظیم feature flags
echo "true" | wrangler pages secret put ENABLE_LIVE_TRADING --project-name titan-trading
echo "true" | wrangler pages secret put ENABLE_AI_PREDICTIONS --project-name titan-trading
echo "true" | wrangler pages secret put ENABLE_NOTIFICATIONS --project-name titan-trading
```

### Security Settings
```bash
# تولید JWT Secret امن
JWT_SECRET=$(openssl rand -base64 64)
echo "$JWT_SECRET" | wrangler pages secret put JWT_SECRET --project-name titan-trading

# تولید Session Secret امن
SESSION_SECRET=$(openssl rand -base64 64)
echo "$SESSION_SECRET" | wrangler pages secret put SESSION_SECRET --project-name titan-trading
```

## 🧪 تست و Validation

### تست محلی
```bash
# بیلد و شروع محلی
npm run build
npm run dev:sandbox

# تست configuration
curl http://localhost:3000/api/system/config/health

# تست endpoints
./scripts/validate-deployment.sh
```

### تست Production
```bash
# بعد از deploy
./scripts/validate-deployment.sh https://your-domain.pages.dev

# بررسی logs
wrangler pages deployment tail --project-name titan-trading

# تست API های خاص
curl https://your-domain.pages.dev/api/health
curl https://your-domain.pages.dev/api/system/config/summary
```

## 📊 Monitoring و Maintenance

### Log Monitoring
```bash
# مشاهده real-time logs
wrangler pages deployment tail --project-name titan-trading

# لیست deployments اخیر
wrangler pages deployment list --project-name titan-trading
```

### Performance Monitoring
- بررسی CPU usage در Cloudflare Dashboard
- مانیتورینگ request count و response times
- نظارت بر memory usage و errors

### Security Monitoring  
- بررسی منظم audit logs
- مانیتورینگ unusual API usage
- بررسی failed authentication attempts
- بروزرسانی منظم API keys

## 🔒 نکات امنیتی

### API Keys Security
- **هرگز** API keys را در کد commit نکنید
- از IP restrictions استفاده کنید (Binance, Coinbase)
- محدودیت‌های دسترسی تنظیم کنید (فقط ضروریات)
- API keys را منظماً rotate کنید

### Trading Security
- با مبالغ کم شروع کنید
- Stop-loss حتماً تنظیم کنید
- معاملات را منظماً مانیتور کنید
- از testnet/sandbox برای تست استفاده کنید

### Infrastructure Security
- HTTPS همیشه فعال باشد
- Rate limiting فعال باشد
- Log monitoring تنظیم کنید
- Regular security updates

## 🚨 Troubleshooting

### مشکلات متداول

#### "Environment variable not set" Error
```bash
# بررسی secrets تنظیم شده
wrangler pages secret list --project-name titan-trading

# تنظیم مجدد secret
echo "NEW_VALUE" | wrangler pages secret put SECRET_NAME --project-name titan-trading
```

#### "API connection failed" Error
- بررسی API keys و permissions
- تست connectivity با curl
- چک کردن IP restrictions
- بررسی rate limits

#### "Database error" Error
```bash
# بررسی database structure
wrangler d1 execute titan-production --command="SELECT name FROM sqlite_master WHERE type='table'"

# اجرای مجدد migrations
wrangler d1 migrations apply titan-production
```

#### Performance Issues
- بررسی Cloudflare Analytics
- مانیتورینگ API response times
- بهینه‌سازی database queries
- کاهش external API calls

## 📞 پشتیبانی

### منابع مفید
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Hono Framework Docs](https://hono.dev/)

### لاگ‌ها و Debugging
```bash
# دیدن اطلاعات deployment
wrangler pages deployment list --project-name titan-trading

# مشاهده logs در real-time
wrangler pages deployment tail --project-name titan-trading

# تست configuration
curl https://your-domain.pages.dev/api/system/config/test
```

---

## ✅ Checklist نهایی

- [ ] تمام API keys تنظیم شده‌اند
- [ ] Database ایجاد و migrate شده
- [ ] KV Storage تنظیم شده
- [ ] Secrets امنیت‌سنجی شده‌اند
- [ ] Production deployment موفق بوده
- [ ] تست‌های validation گذرانده شده‌اند
- [ ] Monitoring تنظیم شده
- [ ] Security measures فعال‌اند
- [ ] Backup strategy تعریف شده

🎉 **تبریک! سیستم TITAN آماده production است!**