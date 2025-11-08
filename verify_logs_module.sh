#!/bin/bash

echo "🔍 Verifying Logs Dashboard Setup..."
echo ""

# 1. Check if logs.js exists and has correct registration
echo "1️⃣ Checking logs.js file..."
if grep -q "window.TitanModules.LogsModule = LogsModule" public/static/modules/logs.js; then
    echo "   ✅ LogsModule registered in TitanModules namespace"
else
    echo "   ❌ LogsModule registration not found!"
fi

# 2. Check if app.js has exactly ONE logs case
echo ""
echo "2️⃣ Checking app.js logs case..."
LOGS_CASE_COUNT=$(grep -c "case 'logs':" public/static/app.js)
if [ "$LOGS_CASE_COUNT" -eq 1 ]; then
    echo "   ✅ Exactly 1 logs case found (correct)"
    grep -n "case 'logs':" public/static/app.js | head -1
else
    echo "   ❌ Found $LOGS_CASE_COUNT logs cases (should be 1)"
fi

# 3. Check index.html version
echo ""
echo "3️⃣ Checking index.html versions..."
grep "app.js?v=" public/index.html | grep -v "<!--"
grep "logs.js?v=" public/index.html | grep -v "<!--"

# 4. Check logs file
echo ""
echo "4️⃣ Checking titan.log..."
LOG_COUNT=$(wc -l < logs/titan.log)
echo "   📊 Total logs: $LOG_COUNT lines"
echo "   Last 3 logs:"
tail -3 logs/titan.log | while IFS= read -r line; do
    MSG=$(echo "$line" | python3 -c "import sys, json; print(json.load(sys.stdin).get('msg', 'N/A'))" 2>/dev/null || echo "Parse error")
    echo "      - $MSG"
done

# 5. Test API endpoint
echo ""
echo "5️⃣ Testing logs API endpoint..."
RESPONSE=$(curl -s "http://localhost:5000/api/logs/recent?limit=3&level=all")
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ API endpoint working"
    LOG_API_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']['logs']))" 2>/dev/null || echo "0")
    echo "   📊 API returned $LOG_API_COUNT logs"
else
    echo "   ❌ API endpoint error"
fi

# 6. Check Nginx configuration
echo ""
echo "6️⃣ Checking Nginx status..."
if sudo systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx is running"
else
    echo "   ❌ Nginx is not running!"
fi

# 7. Check PM2 backend
echo ""
echo "7️⃣ Checking PM2 backend status..."
if pm2 list | grep -q "titan-backend.*online"; then
    echo "   ✅ Backend is running"
else
    echo "   ⚠️ Backend may not be running"
fi

echo ""
echo "✅ Verification complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Navigate to Settings → System tab"
echo "   3. Click 'مشاهده کامل' button"
echo "   4. Should load full logs dashboard (no error)"
