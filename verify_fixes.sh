#!/bin/bash

echo "🔍 بررسی تغییرات اعمال شده..."
echo ""

# Check 1: Auto-login removed
if ! grep -q "demo_token" public/static/app.js; then
  echo "✅ 1. Auto-login حذف شده"
else
  echo "❌ 1. Auto-login هنوز وجود دارد!"
fi

# Check 2: Login response fix
if grep -q "response\.data\.data\.token" public/static/app.js; then
  echo "✅ 2. Login response structure اصلاح شده"
else
  echo "❌ 2. Login response structure هنوز اشتباه است!"
fi

# Check 3: Verify response fix
if grep -q "verifyToken" public/static/app.js && grep -A 10 "verifyToken" public/static/app.js | grep -q "response\.data\.data\.user"; then
  echo "✅ 3. Verify response structure اصلاح شده"
else
  echo "❌ 3. Verify response structure هنوز اشتباه است!"
fi

# Check 4: File size
SIZE=$(wc -c < public/static/app.js)
if [ "$SIZE" -lt 445000 ]; then
  echo "✅ 4. File size صحیح است ($SIZE bytes)"
else
  echo "❌ 4. File size زیاد است ($SIZE bytes)"
fi

# Check 5: Backend running
if pm2 list | grep -q "titan-backend.*online"; then
  echo "✅ 5. Backend در حال اجرا است"
else
  echo "❌ 5. Backend offline است!"
fi

echo ""
echo "📊 خلاصه:"
echo "   - app.js: $(wc -c < public/static/app.js) bytes"
echo "   - app.js.backup: $(wc -c < public/static/app.js.backup) bytes"
echo "   - تفاوت: $(( $(wc -c < public/static/app.js.backup) - $(wc -c < public/static/app.js) )) bytes کمتر"
