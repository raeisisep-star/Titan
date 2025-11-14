# 🔍 Safe Mode Diagnostic Guide - Version D

## ⚡ CRITICAL UPDATE: Version Sync Fixed

All dashboard scripts are now synced to **version `20251113d`** with consistent cache-busting:
- ✅ `safe-mode.js?v=20251113d`
- ✅ `widget-diagnostic.js?v=20251113d` (NEW)
- ✅ `widgets-integration.js?v=20251113d`
- ✅ `widgets-integration-loader.js?v=20251113d`
- ✅ `legacy-annotator.js?v=20251113d`
- ✅ `dashboard-widgets-loader.js?v=20251113d`

## 🎯 Expected Result After Hard Refresh

```javascript
document.querySelectorAll('[data-widget]').length
// → 4

// Widget types should be:
['monitor', 'overview', 'portfolio', 'chart']
```

## 📋 Verification Steps

### Step 1: Hard Refresh
**IMPORTANT:** Perform a hard refresh to bypass browser cache:
- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`
- **Alternative:** Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### Step 2: Run Full Diagnostic
Open browser console (F12) and run:

```javascript
TitanDiag.full()
```

This comprehensive diagnostic will show you:
1. ✅ Annotated widgets count and visibility
2. 📦 Total cards vs annotated cards
3. 📄 All headings (potential widgets)
4. 🔧 Module status (Safe Mode, Annotator, API)
5. 📜 Script versions loaded
6. 📊 Summary with problem detection

### Step 3: Quick Widget Count
For a fast check:

```javascript
TitanDiag.quick()
```

Output example:
```
🔍 Quick Check:
   Total widgets: 4
   Visible: 4
   Types: monitor, overview, portfolio, chart
```

### Step 4: Manual Re-scan (if needed)
If widget count is incorrect:

```javascript
TitanDiag.rescan()
```

This will:
- Force a new annotation scan
- Show before/after widget counts
- Display quick check results

## 🛠️ Alternative Diagnostic Commands

### Browser-Compatible Widget List
If you're using an older browser without spread operator support:

```javascript
// Count widgets
document.querySelectorAll('[data-widget]').length

// List widget types (compatible)
Array.prototype.map.call(
  document.querySelectorAll('[data-widget]'), 
  function(w) { return w.getAttribute('data-widget'); }
)

// Check visibility (compatible)
Array.prototype.map.call(
  document.querySelectorAll('[data-widget]'), 
  function(w) { 
    return {
      type: w.getAttribute('data-widget'),
      visible: w.style.display !== 'none'
    };
  }
)
```

### Check for Hidden Widgets

```javascript
// Find hidden widgets
Array.prototype.filter.call(
  document.querySelectorAll('[data-widget]'),
  function(w) { return w.style.display === 'none'; }
).length
```

### Inspect Card Titles

```javascript
TitanLegacy.inspectWidgets()
```

This shows:
- All cards found on the page
- Their heading texts
- Whether they're annotated with `data-widget`

## 🎨 Safe Mode Checks

### Check Safe Mode Status

```javascript
TitanSafeMode.diagnose()
```

Shows:
- Is Safe Mode active?
- Which widgets are allowed/blocked
- How many widgets are visible/hidden

### Verify Safe Mode Configuration

```javascript
TitanSafeMode.config
```

Should show:
```javascript
{
  enabled: true,
  allowedWidgets: ['monitor', 'overview', 'portfolio', 'chart'],
  blockedWidgets: [...] // 15 experimental widgets
}
```

## 🔍 Troubleshooting by Symptom

### Symptom 1: `document.querySelectorAll('[data-widget]').length` returns less than 4

**Diagnosis:**
```javascript
TitanDiag.full()
```

**Look for:**
- Are all 4 script versions showing `v=20251113d`?
- Is Legacy Annotator loaded and last scan recent?
- Are there unannotated cards?

**Fix:**
```javascript
// Force a re-scan
TitanDiag.rescan()

// Or manually
TitanLegacy.scan()
```

### Symptom 2: Widgets exist but are hidden

**Diagnosis:**
```javascript
// Check for hidden widgets
Array.prototype.forEach.call(
  document.querySelectorAll('[data-widget]'), 
  function(w) {
    if (w.style.display === 'none') {
      console.log('Hidden:', w.getAttribute('data-widget'));
    }
  }
)
```

**Check Safe Mode:**
```javascript
TitanSafeMode.diagnose()
```

**Fix:**
Safe Mode might be incorrectly hiding allowed widgets. Check the console for Safe Mode logs.

### Symptom 3: Script version mismatch

**Diagnosis:**
```javascript
TitanDiag.scripts()
```

**Expected output:**
All scripts should show `version: '20251113d'`

**Fix:**
If versions are mismatched, perform a **hard refresh** (Ctrl+Shift+R).

### Symptom 4: "TitanDiag is not defined" error

**Cause:** The diagnostic script didn't load.

**Fix:**
1. Hard refresh the page
2. Check that `widget-diagnostic.js?v=20251113d` is loaded in DevTools → Network tab
3. If still not loaded, check console for script errors

## 📊 Understanding the Diagnostic Report

When you run `TitanDiag.full()`, here's what each section means:

### 1️⃣ ANNOTATED WIDGETS
- Shows each widget with:
  - ✅ = visible and working
  - ❌ = hidden or not working
  - `display` = CSS display property
  - `safe-mode` = whether Safe Mode marked it
  - `fields` = number of data fields found

### 2️⃣ CARD CONTAINERS
- `Total cards` = All `.card` elements on page
- `Annotated` = Cards with `data-widget` attribute
- `Unannotated` = Cards missing `data-widget`

**Ideal:** `Annotated = 4`, `Unannotated = 0`

### 3️⃣ HEADINGS
- Lists all potential widget titles found
- 📦 = heading is inside a card
- ✅ = card is annotated
- ❌ = card is NOT annotated

### 4️⃣ MODULE STATUS
- Shows which JavaScript modules loaded
- Check that all show "Loaded: ✅"

### 5️⃣ SCRIPT VERSIONS
- All should show `v=20251113d`
- Mismatched versions indicate caching issue

### 📊 SUMMARY
- `Expected: 4` (core widgets)
- `Visible: X` (should match expected)
- Status:
  - ✅ GOOD = all working
  - ⚠️ ISSUE = needs attention

## 🎯 Success Criteria

✅ **Dashboard is correct when:**
1. `TitanDiag.quick()` shows `visible: 4`
2. Widget types are: `['monitor', 'overview', 'portfolio', 'chart']`
3. No widgets have `display: 'none'`
4. All scripts show version `20251113d`
5. Safe Mode shows `visible: 4 / expected: 4`
6. No console errors about missing widgets or bindings

## 🚨 Common Issues & Solutions

### Issue: "Widget count keeps changing"
**Cause:** SPA framework re-rendering without re-annotation
**Solution:** The MutationObserver should catch this. Run `TitanDiag.full()` to verify observer is active.

### Issue: "Only 1 widget shows instead of 4"
**Cause:** Timing issue - manual query ran before re-scan completed
**Solution:** Wait 2 seconds after page load, then run `TitanDiag.quick()`

### Issue: "Scripts still showing old version (v=20251113b or c)"
**Cause:** Browser cache not cleared
**Solution:** 
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Check `TitanDiag.scripts()` again

### Issue: "TitanLegacy.scan() doesn't increase widget count"
**Cause:** Card headings don't match TITLES patterns
**Solution:** Run `TitanLegacy.inspectWidgets()` to see what headings were found

## 📞 Support Information

If issues persist after following this guide:

1. **Capture full diagnostic:**
   ```javascript
   const report = TitanDiag.full();
   console.log(JSON.stringify(report, null, 2));
   ```

2. **Copy the output** and share it

3. **Include:**
   - Browser version (Chrome, Firefox, etc.)
   - Any console errors (red text)
   - Screenshot of the dashboard

---

## 🎓 Technical Notes

### Why Version D?
- Version A (`20251113`): Initial deployment
- Version B (`20251113b`): Observer improvements
- Version C (`20251113c`): Safe Mode addition
- Version D (`20251113d`): **Version sync fix + Diagnostic tool**

### Script Load Order
1. `safe-mode.js` (first - blocks experimental widgets)
2. `widget-diagnostic.js` (diagnostic tool)
3. `widgets-integration.js` (API binding layer)
4. `widgets-integration-loader.js` (fallback loader)
5. `legacy-annotator.js` (DOM annotation + observer)
6. `dashboard-widgets-loader.js` (disabled by Safe Mode)

### Cache-Busting Strategy
- Query parameter `?v=YYYYMMDD[letter]` forces browser to fetch new version
- Server sends `Cache-Control: no-cache` for JS files
- PM2 cluster mode enables zero-downtime reloads

---

**Last Updated:** 2025-11-13 Version D
**Status:** ✅ Ready for deployment verification
