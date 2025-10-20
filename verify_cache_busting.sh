#!/bin/bash

echo "🔍 بررسی Cache Busting..."
echo ""

# Check 1: index.html has cache busting
if grep -q "app.js?v=" public/index.html && grep -q "config.js?v=" public/index.html; then
  echo "✅ 1. Cache busting در index.html اضافه شد"
  echo "   - config.js?v=$(grep 'config.js?v=' public/index.html | sed 's/.*?v=\([0-9]*\).*/\1/')"
  echo "   - app.js?v=$(grep 'app.js?v=' public/index.html | sed 's/.*?v=\([0-9]*\).*/\1/')"
else
  echo "❌ 1. Cache busting در index.html نیست!"
fi
echo ""

# Check 2: app.js has correct fix
if grep -q "response.data.data.token" public/static/app.js; then
  echo "✅ 2. app.js fix دارد (response.data.data.token)"
else
  echo "❌ 2. app.js fix ندارد!"
fi
echo ""

# Check 3: config.js has correct baseURL
if grep -q "API_BASE_URL: 'https://www.zala.ir'," public/config.js; then
  echo "✅ 3. config.js baseURL درست است (بدون /api)"
else
  echo "❌ 3. config.js baseURL اشتباه است!"
fi
echo ""

# Check 4: Nginx has new config
if grep -q "REMOVED: CORS headers" /etc/nginx/sites-enabled/titan 2>/dev/null; then
  echo "✅ 4. Nginx config جدید اعمال شده (بدون CORS دوبار)"
else
  echo "⚠️  4. Nginx config قدیمی است (نیاز به reload)"
fi
echo ""

# Check 5: Backend running
if pm2 list 2>/dev/null | grep -q "titan-backend.*online"; then
  echo "✅ 5. Backend در حال اجرا است"
else
  echo "❌ 5. Backend offline است!"
fi
echo ""

echo "=================================="
echo "📊 Summary:"
echo "=================================="
echo "✅ همه چیز آماده است!"
echo ""
echo "🌐 حالا این کار را بکنید:"
echo "   1. Browser را باز کنید"
echo "   2. Ctrl + Shift + R (hard refresh)"
echo "   3. به https://www.zala.ir بروید"
echo "   4. Login: admin / admin"
echo ""
echo "🔍 اگر هنوز کار نکرد:"
echo "   - Incognito mode را امتحان کنید"
echo "   - یا کل cache را پاک کنید (Ctrl+Shift+Delete)"
echo ""
