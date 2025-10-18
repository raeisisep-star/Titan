#!/bin/bash

# 🚀 Deploy Token Management System to Production
# این اسکریپت فایل‌های جدید و به‌روز شده را به سرور منتقل می‌کند

echo "🚀 Starting Token Management System Deployment..."
echo ""

# رنگ‌ها برای output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# مسیر سرور
SERVER="root@zala.ir"
REMOTE_PATH="/tmp/webapp/Titan/public"

# بررسی اتصال SSH
echo "🔍 Checking SSH connection..."
if ! ssh -o ConnectTimeout=5 "$SERVER" "echo 'Connected'" &>/dev/null; then
    echo -e "${RED}❌ Cannot connect to server via SSH${NC}"
    echo "Please check your SSH configuration and try again"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# آپلود فایل‌های جدید
echo "📦 Uploading NEW files..."

echo "  → token-manager.js"
scp public/static/lib/token-manager.js "$SERVER:$REMOTE_PATH/static/lib/" || {
    echo -e "${RED}❌ Failed to upload token-manager.js${NC}"
    exit 1
}

echo "  → auth-wrapper.js"
scp public/static/lib/auth-wrapper.js "$SERVER:$REMOTE_PATH/static/lib/" || {
    echo -e "${RED}❌ Failed to upload auth-wrapper.js${NC}"
    exit 1
}

echo "  → test-token-flow.html"
scp public/test-token-flow.html "$SERVER:$REMOTE_PATH/" || {
    echo -e "${RED}❌ Failed to upload test-token-flow.html${NC}"
    exit 1
}

echo ""
echo "📝 Uploading UPDATED files..."

echo "  → index.html"
scp public/index.html "$SERVER:$REMOTE_PATH/" || {
    echo -e "${RED}❌ Failed to upload index.html${NC}"
    exit 1
}

echo "  → http.js"
scp public/static/lib/http.js "$SERVER:$REMOTE_PATH/static/lib/" || {
    echo -e "${RED}❌ Failed to upload http.js${NC}"
    exit 1
}

echo "  → comprehensive.adapter.js"
scp public/static/data/dashboard/comprehensive.adapter.js "$SERVER:$REMOTE_PATH/static/data/dashboard/" || {
    echo -e "${RED}❌ Failed to upload comprehensive.adapter.js${NC}"
    exit 1
}

echo ""
echo "🔧 Setting file permissions..."
ssh "$SERVER" "chmod 644 $REMOTE_PATH/static/lib/token-manager.js"
ssh "$SERVER" "chmod 644 $REMOTE_PATH/static/lib/auth-wrapper.js"
ssh "$SERVER" "chmod 644 $REMOTE_PATH/static/lib/http.js"
ssh "$SERVER" "chmod 644 $REMOTE_PATH/index.html"
ssh "$SERVER" "chmod 644 $REMOTE_PATH/test-token-flow.html"

echo -e "${GREEN}✅ File permissions set${NC}"
echo ""

# Restart services
echo "🔄 Restarting services..."

echo "  → PM2 (backend)"
ssh "$SERVER" "cd /tmp/webapp/Titan && pm2 restart all" || {
    echo -e "${YELLOW}⚠️  PM2 restart failed (may need manual restart)${NC}"
}

echo "  → Nginx (web server)"
ssh "$SERVER" "sudo systemctl reload nginx" || {
    echo -e "${YELLOW}⚠️  Nginx reload failed, trying restart...${NC}"
    ssh "$SERVER" "sudo systemctl restart nginx" || {
        echo -e "${RED}❌ Nginx restart failed (may need manual restart with sudo)${NC}"
    }
}

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Visit: https://zala.ir/test-token-flow.html"
echo "2. Follow the step-by-step testing"
echo "3. Check browser console (F12) for logs"
echo ""
echo "📊 Expected Console Logs:"
echo "  🔐 [TokenManager] Initialized"
echo "  ✅ Token Manager module loaded"
echo "  ✅ Auth Wrapper loaded"
echo "  🔐 [App] Token saved successfully"
echo ""
echo "🎯 Success Indicators:"
echo "  ✓ Login works smoothly"
echo "  ✓ Token appears in console logs"
echo "  ✓ Dashboard shows real data"
echo "  ✓ No 401 errors"
echo ""
echo "If you encounter issues, check:"
echo "  - Browser console for error messages"
echo "  - Network tab (F12) for failed requests"
echo "  - test-token-flow.html for systematic debugging"
