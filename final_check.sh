#!/bin/bash

echo "🔍 بررسی نهایی همه فایل‌ها..."
echo ""

# Check 1: config.js exists
if [ -f "public/config.js" ]; then
  echo "✅ 1. config.js موجود است"
else
  echo "❌ 1. config.js موجود نیست!"
fi

# Check 2: index.html has config.js load
if grep -q "config.js" public/index.html; then
  echo "✅ 2. index.html config.js را load می‌کند"
else
  echo "❌ 2. index.html config.js را load نمی‌کند!"
fi

# Check 3: index.html has axios configuration
if grep -q "axios.defaults.baseURL" public/index.html; then
  echo "✅ 3. index.html axios را configure می‌کند"
else
  echo "❌ 3. index.html axios را configure نمی‌کند!"
fi

# Check 4: app.js has login fix
if grep -q "response.data.data.token" public/static/app.js; then
  echo "✅ 4. app.js login fix دارد"
else
  echo "❌ 4. app.js login fix ندارد!"
fi

# Check 5: app.js has verify fix
if grep -A 10 "verifyToken" public/static/app.js | grep -q "response.data.data.user"; then
  echo "✅ 5. app.js verify fix دارد"
else
  echo "❌ 5. app.js verify fix ندارد!"
fi

# Check 6: Backend running
if pm2 list | grep -q "titan-backend.*online"; then
  echo "✅ 6. Backend در حال اجرا است"
else
  echo "❌ 6. Backend offline است!"
fi

echo ""
echo "📊 URLs:"
echo "   - Frontend: https://www.zala.ir"
echo "   - Backend: http://localhost:5000"
echo "   - API: https://www.zala.ir/api"

echo ""
echo "🔑 Test Credentials:"
echo "   - Username: admin"
echo "   - Password: admin"
