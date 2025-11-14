# Cache-Busting Fix Implementation

## 🎯 Problem Identified

The system was serving **old cached versions** of JavaScript files, preventing the new persistent observer code from loading. Evidence:

- Initial page load showed old line numbers: `legacy-annotator.js:228` (old code)
- Manual cache-bust script showed new line numbers: `legacy-annotator.js?v=1763026485640:342` (new code)
- Old Vite dev server (started Oct 18) was still running from `/tmp/webapp/Titan`

## ✅ Solution Implemented

### 1. **Added Cache-Busting Parameters to Script Tags**
**File:** `public/index.html` (lines 295-302)

```html
<!-- Phase C: Widget Integration Layer -->
<script src="/static/modules/dashboard/widgets-integration.js?v=20251113" defer></script>
<!-- Fallback Loader (ensures integration loads even with race conditions) -->
<script src="/static/modules/dashboard/widgets-integration-loader.js?v=20251113" defer></script>
<!-- Legacy Widget Auto-Annotation (CRITICAL: with persistent observer) -->
<script src="/static/modules/dashboard/legacy-annotator.js?v=20251113" defer></script>
<!-- Task 3.3: Dashboard Widgets Loader (disabled via flag) -->
<script src="/static/modules/dashboard/dashboard-widgets-loader.js?v=20251113" defer></script>
```

**Impact:** Forces browsers to fetch fresh versions of these critical files.

### 2. **Killed Old Vite Dev Server**
```bash
kill -9 3630743 3630755 3630766  # Old Vite processes from Oct 18
```

**Impact:** Removed competing server that was serving stale files from `/tmp/webapp/Titan`.

### 3. **Reloaded PM2 Backend**
```bash
pm2 reload ecosystem.config.js
```

**Impact:** Backend now serves the updated `index.html` with cache-busting parameters.

### 4. **Committed and Pushed Changes**
```bash
git add public/index.html
git commit -m "fix: add cache-busting parameters to widget integration scripts"
git push origin genspark_ai_developer
```

**Commit:** `d7ead12`

## 🧪 How to Verify Fix

### Method 1: Browser Console Verification Script

Open the dashboard in your browser and paste this into the console:

```javascript
// Quick verification
console.log('Scripts with cache-bust:', 
  Array.from(document.querySelectorAll('script[src*="dashboard"]'))
    .filter(s => s.src.includes('?v=')).length
);

console.log('Persistent observer available?', 
  typeof window.TitanLegacy?.startPersistentAnnotation === 'function'
);

console.log('Annotated widgets:', 
  document.querySelectorAll('[data-widget]').length
);
```

### Method 2: Use Verification Script

Copy the contents of `verify-cache-bust.js` and paste into browser console for comprehensive diagnostics.

### Method 3: Check Network Tab

1. Open DevTools → Network tab
2. Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
3. Filter by "dashboard"
4. Verify all widget integration scripts load with `?v=20251113` parameter
5. Check status codes (should be 200, not 304 "Not Modified")

## 🔍 Expected Behavior After Fix

### Initial Page Load
```
✅ [Legacy Annotator] Module loaded
🔍 [Legacy Annotator] Starting annotation scan...
✅ [Legacy Annotator] Annotation complete: 3/5 widgets found and annotated
👁️ [Legacy Annotator] Starting persistent annotation observer...
✅ [Legacy Annotator] Persistent observer started
```

### Console Verification
```javascript
// These should all return TRUE
window.TitanLegacy?.startPersistentAnnotation !== undefined  // ✅
window.TitanAPI !== undefined  // ✅
window.TitanDiag !== undefined  // ✅

// Should return > 0
document.querySelectorAll('[data-widget]').length  // ✅ 3-4 widgets

// Run diagnostics
TitanDiag()  // Should show all widgets with API/bind/ready status
```

### Widget Persistence
- When SPA re-renders and removes widgets from DOM
- Persistent observer detects missing widgets
- Automatically re-runs annotation scan
- Widgets remain functional after navigation

## 📊 Technical Details

### Server Cache-Control Headers
Already configured in `server.js` (lines 64-76):

```javascript
// No caching for non-hash static files
app.use("/static/modules/*.js", async (c, next) => {
  const url = c.req.url;
  // Skip if already has hash (handled above)
  if (/\.[a-f0-9]{8}\.js/.test(url)) {
    await next();
    return;
  }
  await next();
  c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");
});
```

### PM2 Status
```
┌────┬──────────────────────┬─────────┬──────────┬────────┐
│ id │ name                 │ mode    │ pid      │ uptime │
├────┼──────────────────────┼─────────┼──────────┼────────┤
│ 17 │ titan-backend        │ cluster │ 1834221  │ 7s     │
│ 18 │ titan-backend        │ cluster │ 1834346  │ 7s     │
└────┴──────────────────────┴─────────┴──────────┴────────┘
```

Both workers reloaded successfully with fresh code.

## 🚨 If Problems Persist

### Step 1: Clear Browser Cache
```
Chrome/Edge: Ctrl+Shift+Delete → Clear all time
Firefox: Ctrl+Shift+Delete → Everything
Safari: Cmd+Option+E
```

### Step 2: Hard Refresh
```
Windows/Linux: Ctrl+Shift+R
Mac: Cmd+Shift+R
```

### Step 3: Disable Browser Cache (DevTools)
1. Open DevTools (F12)
2. Network tab
3. Check "Disable cache"
4. Keep DevTools open while testing

### Step 4: Manual Script Reload (Emergency)
If still loading old code, paste this in console:

```javascript
// Force reload with cache-bust
const scripts = [
  '/static/modules/dashboard/widgets-integration.js',
  '/static/modules/dashboard/widgets-integration-loader.js',
  '/static/modules/dashboard/legacy-annotator.js'
];

scripts.forEach(src => {
  const script = document.createElement('script');
  script.src = src + '?v=' + Date.now();
  script.defer = true;
  document.body.appendChild(script);
});

console.log('✅ Scripts reloaded with fresh cache-bust parameters');
```

### Step 5: Verify PM2 is Running Updated Code
```bash
cd /home/ubuntu/Titan
pm2 logs titan-backend --lines 50 | grep "Widget\|Annotator"
```

Look for recent logs showing persistent observer starting.

## 📝 Related Files

- **Modified:** `public/index.html` (script tags with cache-bust)
- **Unchanged but critical:**
  - `public/static/modules/dashboard/legacy-annotator.js` (has persistent observer)
  - `public/static/modules/dashboard/widgets-integration-loader.js` (orchestration)
  - `public/static/modules/dashboard/widgets-integration.js` (data binding)

## 🔗 Git Information

- **Branch:** `genspark_ai_developer`
- **Latest Commit:** `d7ead12` - "fix: add cache-busting parameters to widget integration scripts"
- **Previous Commit:** `8ca5c43` - "fix(widgets): complete integration with persistent annotation system"
- **Remote:** Up to date with `origin/genspark_ai_developer`

## 🎉 Success Criteria

✅ All widget integration scripts load with `?v=20251113` parameter  
✅ `window.TitanLegacy.startPersistentAnnotation` is a function  
✅ Console shows "Starting persistent annotation observer..."  
✅ `document.querySelectorAll('[data-widget]').length` returns 3-4  
✅ `TitanDiag()` shows all widgets with `api: true, bind: true, ready: true`  
✅ Widgets remain annotated after SPA navigation  

## 💡 Next Steps

1. **User Action Required:** Hard refresh the dashboard (Ctrl+Shift+R)
2. **Run Verification:** Paste verification script in console
3. **Check Widgets:** Verify all widgets are displaying live MEXC data
4. **Test Navigation:** Navigate between pages and confirm widgets persist
5. **Report Results:** Share console output for any remaining issues

---

**Date:** 2025-11-13  
**Commit:** d7ead12  
**Status:** ✅ Fix deployed, awaiting user verification
