# 🚀 دستورالعمل Push و ایجاد Pull Request

## وضعیت فعلی
✅ تمام تغییرات commit شده و آماده push است
✅ Backend روی پورت 5000 در حال اجرا است
✅ Database connection سالم است (healthy)
✅ تمام تست‌ها موفقیت‌آمیز بودند

## 📝 خلاصه تغییرات در این Branch

### 🔒 SSL Full (strict)
- گواهی Cloudflare Origin CA نصب شد
- OCSP stapling فعال شد
- Cloudflare روی Full (strict) تنظیم و تست شد

### 🔐 رفع مشکل Backend
- نام database اصلاح شد: `titan_db` → `titan_trading`
- پورت database اصلاح شد: `5432` → `5433`
- رمز عبور صحیح: `***REDACTED***`

### 🔧 بهبودهای Nginx
- مشکل header inheritance برطرف شد
- پورت backend: `4000` → `5000`
- Security headers در همه location blocks

### 🏥 بهبود Health Check UI
- مودال زیبا با آیکون‌های فارسی
- Endpoint جدید: `/api/health/full`
- نمایش وضعیت تمام سرویس‌ها

## 🎯 دستورات لازم برای Push

```bash
cd /home/ubuntu/Titan

# 1. بررسی وضعیت
git status
git log --oneline -1

# 2. Push به GitHub (نیاز به authentication)
git push -f origin feature/phase4-ssl-full-strict
```

## 🔑 اگر نیاز به Authentication دارید

### روش 1: GitHub Personal Access Token
```bash
# ایجاد token از: https://github.com/settings/tokens
# سپس:
git push https://<TOKEN>@github.com/raeisisep-star/Titan.git feature/phase4-ssl-full-strict
```

### روش 2: GitHub CLI
```bash
# نصب gh CLI و login
gh auth login
git push origin feature/phase4-ssl-full-strict
```

## 📋 ایجاد Pull Request

بعد از push موفق:

1. برو به: https://github.com/raeisisep-star/Titan
2. روی دکمه "Compare & pull request" کلیک کن
3. عنوان: `feat(phase4): Complete SSL Full (strict) implementation with backend fixes`
4. Description از فایل `PR_TEMPLATE.md` کپی کن
5. Reviewers و Labels مناسب اضافه کن
6. Create Pull Request

## ✅ تست‌های نهایی قبل از Merge

```bash
# تست health check
curl -s https://www.zala.ir/api/health/full | jq '.data.overallStatus'
# باید بگه: "healthy"

# تست login endpoint  
curl -sS https://www.zala.ir/api/auth/login -X POST \
  -H 'Content-Type: application/json' \
  -d '{"username":"test","password":"test"}' | jq '.success'
# باید response بده (false برای invalid credentials)
```

## 📊 Commit که Push می‌شود

```
commit 5ff0cbf
feat(phase4): Complete SSL Full (strict) implementation with backend fixes

شامل:
- 33 فایل تغییر یافته
- 8473 خط اضافه شده
- 55 خط حذف شده
```

## 🔗 URLs مهم

- Frontend: https://www.zala.ir
- Backend API: https://www.zala.ir/api/*
- Health Check: https://www.zala.ir/api/health/full
- Repository: https://github.com/raeisisep-star/Titan

## 📞 در صورت مشکل

اگر موقع push با خطا مواجه شدی:

1. بررسی کن که GitHub credentials صحیح است
2. مطمئن شو که دسترسی write به repository داری
3. اگر branch قبلاً push شده، از `-f` استفاده کن
4. در صورت نیاز من رو صدا بزن تا کمک کنم

---
تاریخ ایجاد: $(date)
Branch: feature/phase4-ssl-full-strict
Commit: 5ff0cbf
