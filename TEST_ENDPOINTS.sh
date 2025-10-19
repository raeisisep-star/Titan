#!/bin/bash
# Test all 6 dashboard endpoints
# Run: bash TEST_ENDPOINTS.sh

echo "══════════════════════════════════════════"
echo "  Testing Dashboard Real-Data Endpoints"
echo "══════════════════════════════════════════"
echo

BASE_URL="http://localhost:5000"

endpoints=(
  "portfolio-real"
  "agents-real"
  "trading-real"
  "activities-real"
  "charts-real"
  "comprehensive-real"
)

for endpoint in "${endpoints[@]}"; do
  echo "📍 GET /api/dashboard/$endpoint"
  response=$(curl -s "$BASE_URL/api/dashboard/$endpoint")
  source=$(echo "$response" | jq -r '.meta.source // "ERROR"')
  success=$(echo "$response" | jq -r '.success // false')
  
  if [ "$success" = "true" ] && [ "$source" = "real" ]; then
    echo "✅ SUCCESS - source: $source"
  else
    echo "❌ FAILED - success: $success, source: $source"
  fi
  echo
done

echo "══════════════════════════════════════════"
echo "  Test Complete"
echo "══════════════════════════════════════════"
