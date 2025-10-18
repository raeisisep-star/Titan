#!/bin/bash

echo "========================================="
echo "🔄 Reloading TITAN Services"
echo "========================================="
echo ""

# Step 1: Restart PM2 backend
echo "🔄 Step 1: Restarting PM2 backend..."
pm2 restart titan-backend
echo "✅ PM2 restarted"
echo ""

# Step 2: Show PM2 status
echo "📊 Step 2: PM2 Status..."
pm2 status
echo ""

# Step 3: Verify backend is responding
echo "🧪 Step 3: Testing backend health..."
sleep 2
curl -s http://localhost:5000/api/dashboard/comprehensive-real | head -c 200
echo ""
echo ""

# Step 4: Try to reload nginx (will ask for password if needed)
echo "🔄 Step 4: Attempting to reload nginx..."
echo "   (This might require sudo password)"
sudo systemctl reload nginx 2>&1 || echo "⚠️  Could not reload nginx (might need password)"
echo ""

echo "========================================="
echo "✅ Services reload completed!"
echo "========================================="
echo ""
echo "📝 Next steps:"
echo "1. Open browser in incognito/private mode"
echo "2. Visit https://zala.ir/test-debug-dashboard.html"
echo "3. Or do hard refresh (Ctrl+Shift+R) on main site"
echo ""
