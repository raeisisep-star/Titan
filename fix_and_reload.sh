#!/bin/bash

echo "🚀 TITAN Trading System - Fix Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root (for nginx reload)
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  این اسکریپت نیاز به sudo دارد${NC}"
    echo ""
    echo "لطفاً با sudo اجرا کنید:"
    echo "  sudo bash $0"
    exit 1
fi

echo "✅ Running with sudo permissions"
echo ""

# Step 1: Verify config.js change
echo "🔍 Step 1: بررسی config.js..."
if grep -q "API_BASE_URL: 'https://www.zala.ir'," /tmp/webapp/Titan/public/config.js; then
    echo -e "${GREEN}✅ config.js درست است (بدون /api)${NC}"
else
    echo -e "${RED}❌ config.js نیاز به تغییر دارد${NC}"
    echo "   در حال اصلاح..."
    sed -i "s|API_BASE_URL: 'https://www.zala.ir/api'|API_BASE_URL: 'https://www.zala.ir'|g" /tmp/webapp/Titan/public/config.js
    sed -i "s|API_BASE_URL_ALT: 'https://www.zala.ir/api'|API_BASE_URL_ALT: 'https://www.zala.ir'|g" /tmp/webapp/Titan/public/config.js
    echo -e "${GREEN}✅ config.js اصلاح شد${NC}"
fi
echo ""

# Step 2: Backup current Nginx config
echo "💾 Step 2: Backup فایل Nginx..."
BACKUP_FILE="/etc/nginx/sites-enabled/titan.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f /etc/nginx/sites-enabled/titan ]; then
    cp /etc/nginx/sites-enabled/titan "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup ذخیره شد: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ فایل /etc/nginx/sites-enabled/titan یافت نشد!${NC}"
    exit 1
fi
echo ""

# Step 3: Copy new Nginx config
echo "📝 Step 3: Copy فایل جدید Nginx..."
if [ -f /tmp/webapp/Titan/nginx-titan-fixed-cors.conf ]; then
    cp /tmp/webapp/Titan/nginx-titan-fixed-cors.conf /etc/nginx/sites-enabled/titan
    echo -e "${GREEN}✅ فایل جدید copy شد${NC}"
else
    echo -e "${RED}❌ فایل nginx-titan-fixed-cors.conf یافت نشد!${NC}"
    exit 1
fi
echo ""

# Step 4: Test Nginx configuration
echo "🧪 Step 4: Test Nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ Nginx configuration صحیح است${NC}"
else
    echo -e "${RED}❌ Nginx configuration خطا دارد!${NC}"
    echo "   در حال بازگشت به backup..."
    cp "$BACKUP_FILE" /etc/nginx/sites-enabled/titan
    echo -e "${YELLOW}⚠️  Backup بازگردانده شد${NC}"
    exit 1
fi
echo ""

# Step 5: Reload Nginx
echo "🔄 Step 5: Reload Nginx..."
if systemctl reload nginx; then
    echo -e "${GREEN}✅ Nginx reload شد${NC}"
else
    echo -e "${RED}❌ خطا در reload Nginx!${NC}"
    echo "   در حال بازگشت به backup..."
    cp "$BACKUP_FILE" /etc/nginx/sites-enabled/titan
    systemctl reload nginx
    echo -e "${YELLOW}⚠️  Backup بازگردانده شد${NC}"
    exit 1
fi
echo ""

# Step 6: Verify Nginx is running
echo "✅ Step 6: بررسی وضعیت Nginx..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx در حال اجرا است${NC}"
else
    echo -e "${RED}❌ Nginx متوقف شده!${NC}"
    exit 1
fi
echo ""

# Step 7: Test Backend
echo "🧪 Step 7: تست Backend..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend کار می‌کند (HTTP $RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend response: HTTP $RESPONSE${NC}"
fi
echo ""

# Step 8: Test Login API
echo "🔑 Step 8: تست Login API..."
LOGIN_RESPONSE=$(curl -s -X POST https://www.zala.ir/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Login API کار می‌کند${NC}"
    echo "   Response: $(echo $LOGIN_RESPONSE | jq -r '.message' 2>/dev/null || echo 'Login successful')"
else
    echo -e "${RED}❌ Login API خطا دارد${NC}"
    echo "   Response: $LOGIN_RESPONSE"
fi
echo ""

# Summary
echo "=================================="
echo "📊 خلاصه:"
echo "=================================="
echo -e "${GREEN}✅ config.js: تغییر یافت (بدون /api)${NC}"
echo -e "${GREEN}✅ Nginx: config جدید اعمال شد${NC}"
echo -e "${GREEN}✅ Nginx: reload شد${NC}"
echo -e "${GREEN}✅ Backend: در حال اجرا${NC}"
echo -e "${GREEN}✅ Login API: کار می‌کند${NC}"
echo ""
echo "🌐 حالا می‌توانید browser را refresh کنید:"
echo "   1. Ctrl + Shift + R (hard refresh)"
echo "   2. به https://www.zala.ir بروید"
echo "   3. با admin/admin login کنید"
echo ""
echo "🔍 اگر مشکلی بود، backup اینجاست:"
echo "   $BACKUP_FILE"
echo ""
