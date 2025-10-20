# TITAN RBAC Testing Guide

## Phase 4: Role-Based Access Control (RBAC)

This directory contains tests for validating the RBAC middleware implementation.

---

## 📋 Prerequisites

### 1. Seed Test Users

Before running tests, you need to seed the database with test users:

```bash
# Navigate to database seeds directory
cd /tmp/webapp/Titan/database/seeds

# Apply seed data to PostgreSQL
psql -h localhost -p 5433 -U titan_user -d titan_trading -f test_users.sql
```

**Test Users Created:**
- **Admin User**
  - Username: `admin`
  - Password: `admin123`
  - Role: `admin`
  
- **Regular User**
  - Username: `user`
  - Password: `user123`
  - Role: `user`

---

## 🧪 Running Tests

### Option 1: Run Automated Test Suite

```bash
cd /tmp/webapp/Titan

# Run all RBAC middleware tests
node tests/rbac-middleware.test.js
```

**Expected Output:**
```
================================================================================
TITAN RBAC Middleware Tests
================================================================================
API Base URL: https://www.zala.ir
Timestamp: 2025-10-20T10:30:00.000Z
================================================================================

✅ Test 1: Admin → /api/admin/users
   Endpoint: /api/admin/users
   Expected: 200, Got: 200

✅ Test 2: User → /api/admin/users
   Endpoint: /api/admin/users
   Expected: 403, Got: 403

✅ Test 3: Admin → /api/user/profile
   Endpoint: /api/user/profile
   Expected: 200, Got: 200

✅ Test 4: User → /api/user/profile
   Endpoint: /api/user/profile
   Expected: 200, Got: 200

✅ Test 5: No Role → /api/admin/stats
   Endpoint: /api/admin/stats
   Expected: 403, Got: 403

✅ Test 6: User → /api/admin/stats
   Endpoint: /api/admin/stats
   Expected: 403, Got: 403

================================================================================
Test Summary
================================================================================
Passed: 6/6
Failed: 0/6
Success Rate: 100.00%
================================================================================
```

---

### Option 2: Manual Testing with cURL

#### Test 1: Admin → /api/admin/users (Expect 200)

```bash
# Get admin token
ADMIN_TOKEN=$(curl -sS -X POST https://www.zala.ir/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# Test admin endpoint
curl -sS -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://www.zala.ir/api/admin/users | jq '{success, meta}'
```

**Expected Response:**
```json
{
  "success": true,
  "meta": {
    "source": "real",
    "requiredRole": "admin",
    "userRole": "admin"
  }
}
```

---

#### Test 2: User → /api/admin/users (Expect 403)

```bash
# Get user token
USER_TOKEN=$(curl -sS -X POST https://www.zala.ir/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"user","password":"user123"}' | jq -r '.data.token')

# Attempt to access admin endpoint
curl -sS -H "Authorization: Bearer $USER_TOKEN" \
  https://www.zala.ir/api/admin/users | jq '.'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Forbidden - Requires one of: admin. Your role: user"
}
```

---

#### Test 3: Admin → /api/user/profile (Expect 200)

```bash
curl -sS -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://www.zala.ir/api/user/profile | jq '.success'
```

**Expected Response:**
```json
true
```

---

## 📊 Test Coverage

### Middleware Tests
- ✅ Admin role accessing admin-only endpoint → 200 OK
- ✅ User role accessing admin-only endpoint → 403 Forbidden
- ✅ Admin role accessing user endpoint → 200 OK
- ✅ User role accessing user endpoint → 200 OK
- ✅ Token without role accessing admin endpoint → 403 Forbidden
- ✅ User role accessing admin stats endpoint → 403 Forbidden

### Endpoints Tested
- `/api/admin/users` - Admin only
- `/api/admin/stats` - Admin only
- `/api/user/profile` - Any authenticated user

---

## 🔒 Security Validation

### Token Security
- JWT tokens include role payload
- Role extracted from token, not user input
- Invalid/missing role → 403 Forbidden
- Clear error messages without exposing sensitive data

### Middleware Chain
```
Request → authMiddleware → requireRole('admin') → Handler
          ↓                ↓
          Sets userId      Validates role
          Sets userRole    Returns 403 if unauthorized
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused"
**Solution:** Ensure backend is running on port 5000:
```bash
pm2 status
pm2 restart backend
```

### Issue: "Invalid token"
**Solution:** Regenerate tokens using login endpoint:
```bash
curl -X POST https://www.zala.ir/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

### Issue: "User not found"
**Solution:** Re-apply seed data:
```bash
psql -h localhost -p 5433 -U titan_user -d titan_trading \
  -f /tmp/webapp/Titan/database/seeds/test_users.sql
```

---

## 📝 Notes

- Tests use production API endpoint: `https://www.zala.ir`
- JWT_SECRET must match backend configuration
- Tokens are valid for 24 hours
- All tests should pass before merging to main

---

## 🚀 Next Steps

After RBAC validation:
1. ✅ Create PR for phase4-rbac
2. ✅ Merge to main after review
3. 🔜 Phase 4 Task 2: SSL Full (strict) mode
4. 🔜 Install Cloudflare Origin Certificate
