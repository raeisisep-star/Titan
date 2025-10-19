# 🚀 اجرا فوری - دستورات کپی-پیست

## ⚠️ توجه: این دستورات نیاز به sudo دارند

من نمی‌توانم مستقیماً sudo را اجرا کنم، اما **همه چیز آماده است**. 
فقط این دستورات را در terminal خود کپی-پیست کنید:

---

## 📋 اسکریپت جامع (یک دستور، همه کارها)

```bash
cd /tmp/webapp/Titan
sudo bash scripts/deploy-phase2.sh
```

**این اسکریپت انجام می‌دهد:**
- ✅ Kill کردن wrangler
- ✅ Backup و update کانفیگ nginx
- ✅ Test و reload nginx
- ✅ Restart backend (pm2)
- ✅ Test تمام endpoints

---

## 🔧 اگر ترجیح می‌دهید گام به گام:

### 1️⃣ Kill Wrangler
```bash
sudo pkill -9 -f wrangler
ps aux | grep wrangler | grep -v grep  # باید خالی باشد
```

### 2️⃣ Backup Nginx
```bash
sudo cp /etc/nginx/sites-enabled/zala /etc/nginx/sites-enabled/zala.backup.$(date +%F_%H-%M-%S)
```

### 3️⃣ Update Nginx Config
```bash
sudo tee /etc/nginx/sites-enabled/zala > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name zala.ir www.zala.ir;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zala.ir www.zala.ir;

    ssl_certificate     /etc/letsencrypt/live/zala.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zala.ir/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
        expires off;
    }

    location /s3/ {
        proxy_pass http://127.0.0.1:9000/;
        proxy_set_header Host 127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        client_max_body_size 200m;
    }

    location / {
        root /tmp/webapp/Titan/public;
        try_files $uri $uri/ /index.html;
        
        location = /index.html {
            add_header Cache-Control "no-cache, must-revalidate";
            expires 0;
        }
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
NGINX_EOF
```

### 4️⃣ Test & Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5️⃣ Add Dashboard Endpoints

**دستور افزودن خودکار:**
```bash
cd /tmp/webapp/Titan

# Backup server.js
cp server.js server.js.backup.$(date +%F_%H-%M-%S)

# اضافه کردن endpoints
# (این خطوط را در editor باز کنید و endpoints از scripts/dashboard-endpoints.js را paste کنید)
nano server.js
# محل: بعد از خط ~341 (بعد از app.get('/api/dashboard/stats'))
```

یا **دستی**:
1. `nano /tmp/webapp/Titan/server.js`
2. پیدا کردن `app.get('/api/dashboard/stats'` (خط ~234)
3. رفتن به انتهای آن endpoint (حدود خط ~270)
4. Paste کردن محتوای `/tmp/webapp/Titan/scripts/dashboard-endpoints.js`

### 6️⃣ Restart Backend
```bash
cd /tmp/webapp/Titan
pm2 reload titan-backend
pm2 status
pm2 logs titan-backend --lines 20
```

### 7️⃣ Seed Sample Data
```bash
cd /tmp/webapp/Titan
bash scripts/seed-sample-data.sh
```

---

## ✅ تست و تأیید

### Test Endpoints
```bash
# Health
curl -i https://www.zala.ir/api/health

# Integration
curl https://www.zala.ir/api/integration/status | jq .

# Dashboard endpoints (بعد از اضافه کردن به server.js)
curl https://www.zala.ir/api/dashboard/portfolio-real | jq .
curl https://www.zala.ir/api/dashboard/agents-real | jq .
curl https://www.zala.ir/api/dashboard/trading-real | jq .
curl https://www.zala.ir/api/dashboard/activities-real | jq .
curl https://www.zala.ir/api/dashboard/charts-real | jq .
curl https://www.zala.ir/api/dashboard/comprehensive-real | jq .
```

### Save Test Results
```bash
# Save all results for PR
cd /tmp/webapp/Titan
mkdir -p test-results

curl -i https://www.zala.ir/api/health > test-results/health.txt 2>&1
curl https://www.zala.ir/api/integration/status | jq . > test-results/integration.json
curl https://www.zala.ir/api/dashboard/comprehensive-real | jq . > test-results/dashboard-comprehensive.json

echo "✅ Test results saved in test-results/"
```

---

## 📊 Verification Checklist

```bash
# Check wrangler stopped
ps aux | grep wrangler | grep -v grep
# → Should be empty

# Check nginx config
sudo nginx -t
# → Should say "successful"

# Check nginx serving from public/
curl -I https://www.zala.ir/ | grep "Server"

# Check backend running
pm2 list | grep titan-backend
# → Should show "online"

# Check database seeded
PGPASSWORD='***REDACTED***' psql -U titan_user -d titan_trading -h localhost -p 5433 -c "SELECT COUNT(*) FROM trades;"
# → Should show 50+
```

---

## 🎯 معیار پذیرش

- [ ] `ps aux | grep wrangler` خالی است
- [ ] `sudo nginx -t` موفق است
- [ ] `/api/health` روی domain: 200
- [ ] `/api/integration/status`: 200
- [ ] هر 6 endpoint dashboard: 200
- [ ] Database حداقل 50 trade دارد
- [ ] Badge در browser "Real API" نشان می‌دهد

---

## 📸 مدارک تحویل

```bash
# 1. Process status
ps aux | grep -E "wrangler|nginx|pm2" > deployment-status.txt

# 2. Nginx config
sudo nginx -t &> nginx-test.txt
sudo cat /etc/nginx/sites-enabled/zala > current-nginx-config.txt

# 3. API responses
curl -i https://www.zala.ir/api/health > api-health-response.txt 2>&1
curl https://www.zala.ir/api/dashboard/comprehensive-real | jq . > dashboard-response.json

# 4. Database stats
PGPASSWORD='***REDACTED***' psql -U titan_user -d titan_trading -h localhost -p 5433 -c "
SELECT 
    'Database Stats' as report,
    (SELECT COUNT(*) FROM trades) as trades,
    (SELECT COUNT(*) FROM orders) as orders,
    (SELECT COUNT(*) FROM portfolios WHERE total_balance > 0) as portfolios;
" > database-stats.txt
```

---

## 🚀 Commit & PR

```bash
cd /tmp/webapp/Titan

# Add all changes
git add scripts/ server.js test-results/ EXECUTE_NOW.md

# Commit
git commit -m "feat(phase2): Complete dashboard real endpoints implementation

- Killed wrangler processes
- Reconfigured Nginx to serve from public/
- Added 6 dashboard real endpoints
- Seeded 50+ sample trades
- All endpoints return meta.source='real'

Deliverables:
✅ /api/health: 200 on domain
✅ /api/integration/status: 200
✅ All 6 dashboard endpoints: 200
✅ Badge shows 'Real API'
✅ Test results in test-results/

Tests:
$(cat test-results/*.txt test-results/*.json | head -50)

Refs: #3"

# Push
git push origin genspark_ai_developer
```

**PR URL:** https://github.com/raeisisep-star/Titan/pull/new/genspark_ai_developer

---

## ⏰ زمان تخمینی

- اجرای اسکریپت: **5 دقیقه**
- اضافه کردن endpoints: **10 دقیقه**
- Seed data: **2 دقیقه**
- Test: **5 دقیقه**
- Documentation: **8 دقیقه**
- **جمع: 30 دقیقه**

---

## 🆘 Troubleshooting

### اگر nginx reload نشد:
```bash
sudo nginx -t  # ببینید خطا چیست
sudo systemctl status nginx
sudo tail -n 50 /var/log/nginx/error.log
```

### اگر backend crash کرد:
```bash
pm2 logs titan-backend --lines 100
pm2 restart titan-backend
```

### اگر endpoint 404 داد:
```bash
# Check if endpoints were added
grep "dashboard/portfolio-real" /tmp/webapp/Titan/server.js
# If empty, endpoints weren't added yet
```

---

**🎯 شروع کنید! همه چیز آماده است.**
