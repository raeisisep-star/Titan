# راهنمای سریع راه‌اندازی CI/CD

این راهنما شما را **قدم به قدم** از صفر تا راه‌اندازی کامل CI/CD می‌برد.

## ✅ وضعیت فعلی

- ✅ PR #42 ساخته شد و CI در حال اجراست
- ✅ فایل‌های workflow آماده هستند
- ✅ مستندات کامل است

## 🎯 کارهای باقی‌مانده (ترتیب اجرا)

### قدم 1: Merge کردن PR #42 ⏳

**لینک**: https://github.com/raeisisep-star/Titan/pull/42

**کار شما:**
1. وارد PR شوید
2. اگر CI چک‌ها fail شدند (طبیعیه - تست‌ها نوشته نشده):
   - دکمه "Merge pull request" کلیک کنید
   - اگر دکمه غیرفعال است، روی "Merge without waiting for requirements" کلیک کنید
3. "Squash and merge" را انتخاب کنید
4. Confirm کنید

**چرا CI fail میشه؟**
- تست‌های واقعی هنوز نوشته نشدند
- این فقط infrastructure است
- در PR بعدی تست‌ها اضافه می‌شوند

---

### قدم 2: تنظیم GitHub Environments 🔧

**مسیر**: https://github.com/raeisisep-star/Titan/settings/environments

#### 2.1. ساخت Staging Environment

1. کلیک روی "New environment"
2. نام: `staging` (دقیقاً همین اسم)
3. کلیک "Configure environment"
4. **Deployment branches**: "Selected branches" → Add rule → Pattern: `main`
5. **Environment protection rules**: همه رو خاموش بذار (No reviewers, No wait timer)
6. "Save protection rules"

#### 2.2. ساخت Production Environment

1. کلیک روی "New environment" دوباره
2. نام: `production` (دقیقاً همین اسم)
3. کلیک "Configure environment"
4. **Deployment branches**: "Selected branches"
   - Add rule → Pattern: `main`
   - Add rule → Pattern: `v*.*.*` (برای tags)
5. **Environment protection rules**:
   - ✅ **Required reviewers**: خودتون رو اضافه کنید
   - Wait timer: 0 (فعلاً نیازی نیست)
6. "Save protection rules"

**تأیید موفقیت:**
```bash
gh api repos/raeisisep-star/Titan/environments | jq -r '.environments[].name'
# باید staging و production رو نشون بده
```

---

### قدم 3: تولید SSH Keys 🔑

**روی کامپیوتر لوکال خودتون:**

```bash
# برای Staging
ssh-keygen -t rsa -b 4096 -f ~/.ssh/titan_staging -N ""

# برای Production (حتماً جدا!)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/titan_production -N ""
```

**کپی کردن به سرور:**
```bash
# Staging
ssh-copy-id -i ~/.ssh/titan_staging.pub ubuntu@188.40.209.82

# Production
ssh-copy-id -i ~/.ssh/titan_production.pub ubuntu@188.40.209.82
```

**تست:**
```bash
ssh -i ~/.ssh/titan_staging ubuntu@188.40.209.82 "echo 'Staging OK'"
ssh -i ~/.ssh/titan_production ubuntu@188.40.209.82 "echo 'Production OK'"
```

---

### قدم 4: تنظیم Environment Secrets 🔐

**مسیر**: https://github.com/raeisisep-star/Titan/settings/environments

#### 4.1. Staging Secrets

کلیک روی `staging` → "Add secret"

برای هر secret زیر، "New environment secret" بزنید:

| Name | Value |
|------|-------|
| `STAGING_SSH_HOST` | `188.40.209.82` |
| `STAGING_SSH_USER` | `ubuntu` |
| `STAGING_SSH_KEY` | محتوای فایل `~/.ssh/titan_staging` (کل فایل با BEGIN/END) |
| `STAGING_PROJECT_DIR` | `/home/ubuntu/Titan-staging` |
| `STAGING_NODE_ENV` | `staging` |

**مهم**: برای `STAGING_SSH_KEY`:
```bash
cat ~/.ssh/titan_staging
# کپی کن کل output رو (از -----BEGIN تا -----END)
```

#### 4.2. Production Secrets

کلیک روی `production` → "Add secret"

| Name | Value |
|------|-------|
| `PROD_SSH_HOST` | `188.40.209.82` |
| `PROD_SSH_USER` | `ubuntu` |
| `PROD_SSH_KEY` | محتوای فایل `~/.ssh/titan_production` (کل فایل با BEGIN/END) |
| `PROD_PROJECT_DIR` | `/home/ubuntu/Titan` |
| `PROD_NODE_ENV` | `production` |

#### 4.3. (اختیاری) Telegram Alerts

اگر می‌خواید notification داشته باشید:

**هر دو environment (staging و production)**:
| Name | Value |
|------|-------|
| `TELEGRAM_ALERT_TOKEN` | توکن ربات تلگرام |
| `TELEGRAM_CHAT_ID` | شناسه چت |

**تأیید:**
```bash
gh api repos/raeisisep-star/Titan/environments/staging/secrets | jq -r '.secrets[].name'
# باید لیست secret ها رو نشون بده
```

---

### قدم 5: آماده‌سازی سرور 🖥️

**SSH به سرور:**
```bash
ssh ubuntu@188.40.209.82
```

#### 5.1. نصب Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential git
node --version  # باید v20.x.x باشه
```

#### 5.2. نصب PM2

```bash
sudo npm install -g pm2
pm2 --version

# راه‌اندازی خودکار PM2
pm2 startup systemd
# دستوری که output میده رو اجرا کن
pm2 save
```

#### 5.3. نصب PostgreSQL Client

```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
pg_dump --version
```

#### 5.4. ساخت دایرکتوری‌ها

```bash
# Staging
mkdir -p /home/ubuntu/Titan-staging
mkdir -p /home/ubuntu/backups/staging

# Production
mkdir -p /home/ubuntu/Titan
mkdir -p /home/ubuntu/backups/database

# Logs
mkdir -p /home/ubuntu/logs/deployments
```

#### 5.5. Clone برای Staging (فقط یکبار)

```bash
cd /home/ubuntu
git clone https://github.com/raeisisep-star/Titan.git Titan-staging
cd Titan-staging
git checkout main
```

**نکته**: Production رو workflow خودش clone می‌کنه، نیازی به clone دستی نیست.

---

### قدم 6: تنظیم DNS 🌐

**در پنل DNS (Cloudflare یا هر provider دیگه):**

| Record | Type | Name | Value | Proxy |
|--------|------|------|-------|-------|
| 1 | A | `staging.zala.ir` | `188.40.209.82` | On |
| 2 | A | `www.zala.ir` | `188.40.209.82` | On |

**تأیید:**
```bash
dig +short staging.zala.ir
dig +short www.zala.ir
# هردو باید 188.40.209.82 رو برگردونند (یا IP های Cloudflare)
```

---

### قدم 7: نصب و تنظیم Nginx 🔧

**روی سرور:**

#### 7.1. نصب Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 7.2. Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### 7.3. Config برای Staging

```bash
sudo nano /etc/nginx/sites-available/staging.zala.ir
```

محتوا:
```nginx
upstream titan_staging {
    server 127.0.0.1:5001 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

server {
    listen 80;
    server_name staging.zala.ir;
    
    # Cloudflare Real IP
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    real_ip_header X-Forwarded-For;
    
    location /api/ {
        proxy_pass http://titan_staging/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
    
    location /health {
        proxy_pass http://titan_staging;
        access_log off;
    }
    
    location / {
        root /var/www/staging-frontend/dist;
        try_files $uri /index.html;
    }
}
```

فعال‌سازی:
```bash
sudo ln -s /etc/nginx/sites-available/staging.zala.ir /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

SSL:
```bash
sudo certbot --nginx -d staging.zala.ir
```

#### 7.4. Config برای Production

```bash
sudo nano /etc/nginx/sites-available/www.zala.ir
```

محتوا (مشابه staging اما با تغییرات):
```nginx
upstream titan_production {
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

server {
    listen 80;
    server_name www.zala.ir;
    
    # Cloudflare Real IP (مثل staging)
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    real_ip_header X-Forwarded-For;
    
    location /api/ {
        proxy_pass http://titan_production/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
    
    location /health {
        proxy_pass http://titan_production;
        access_log off;
    }
    
    location / {
        root /var/www/zala-frontend/dist;
        try_files $uri /index.html;
    }
}
```

فعال‌سازی:
```bash
sudo ln -s /etc/nginx/sites-available/www.zala.ir /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d www.zala.ir
```

---

### قدم 8: ساخت .env برای Staging 📝

**روی سرور:**
```bash
cd /home/ubuntu/Titan-staging
nano .env
```

محتوای پایه:
```env
NODE_ENV=staging
PORT=5001

# Database (از دیتابیس جدا برای staging استفاده کنید)
DATABASE_URL=postgresql://user:password@localhost:5432/titan_staging

# Redis (database 1 برای staging)
REDIS_URL=redis://localhost:6379/1

# JWT (متفاوت از production!)
JWT_SECRET=your_staging_jwt_secret_min_32_chars

# Exchange
EXCHANGE_NAME=paper

# لاگ
LOG_LEVEL=debug
```

---

### قدم 9: تست اولیه Staging به صورت دستی 🧪

```bash
cd /home/ubuntu/Titan-staging
npm ci
pm2 start ecosystem.config.js --env staging
pm2 logs
```

تست endpoint:
```bash
curl http://localhost:5001/health
```

اگر کار کرد، خاموشش کن:
```bash
pm2 stop all
pm2 delete all
```

---

### قدم 10: تست Auto-Deployment Staging 🚀

**روی لوکال:**
```bash
git checkout main
git pull origin main
git commit --allow-empty -m "test: trigger staging deployment"
git push origin main
```

**چک کردن:**
1. برو به: https://github.com/raeisisep-star/Titan/actions
2. workflow "Deploy to Staging" رو باز کن
3. ببین همه stepها سبز میشن

**تست سایت:**
```bash
curl https://staging.zala.ir/health
# Expected: {"status":"ok","environment":"staging"}
```

---

### قدم 11: تست Production Deployment 🎯

**ساخت Tag:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

**در GitHub:**
1. برو به Actions → "Deploy to Production"
2. باید منتظر approval بمونه
3. کلیک روی "Review deployments"
4. محیط production رو انتخاب کن
5. "Approve and deploy" بزن

**تست:**
```bash
curl https://www.zala.ir/health
# Expected: {"status":"ok","environment":"production"}
```

---

## ✅ Done Criteria

همه چیز درست کار می‌کنه وقتی که:

- [ ] PR #42 merge شده
- [ ] Environments ساخته شدن و secrets تنظیم شدن
- [ ] DNS تنظیم شده (staging.zala.ir و www.zala.ir)
- [ ] سرور آماده است (Node, PM2, Nginx, SSL)
- [ ] `https://staging.zala.ir/health` → 200 OK
- [ ] هر push به main → staging auto-deploy میشه
- [ ] `https://www.zala.ir/health` → 200 OK (بعد از tag deployment)
- [ ] Production deployment نیاز به approval داره

---

## 🆘 اگر مشکلی پیش اومد

### مشکل: CI fail شد
**حل**: عادیه، تست‌ها هنوز نوشته نشدن. مرحله "Merge without waiting" رو انتخاب کن.

### مشکل: Deployment fail شد
**چک کن**:
1. Secrets درست تنظیم شدن؟ (`gh api repos/raeisisep-star/Titan/environments/staging/secrets`)
2. SSH key کار می‌کنه؟ (`ssh -i ~/.ssh/titan_staging ubuntu@188.40.209.82`)
3. دایرکتوری وجود داره؟ (`ssh ubuntu@188.40.209.82 "ls -la /home/ubuntu/Titan-staging"`)

### مشکل: 502 Bad Gateway
**حل**: Backend هنوز start نشده. چک کن:
```bash
ssh ubuntu@188.40.209.82
pm2 list
pm2 logs
```

### مشکل: SSL نمیگیره
**حل**: صبر کن تا DNS propagate بشه (تا 24 ساعت، معمولاً کمتر)

---

## 📞 پشتیبانی

- مستندات کامل: `docs/SETUP_*.md`
- Issues: https://github.com/raeisisep-star/Titan/issues
- Check workflows: https://github.com/raeisisep-star/Titan/actions

---

**موفق باشید! 🎉**
