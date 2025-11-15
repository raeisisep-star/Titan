# 🔍 Safe Mode Verification Guide

## Current Situation
Your console shows that the Legacy Annotator successfully found **4 widgets**, but manual verification shows only **1 widget** is visible. This discrepancy needs investigation.

## Step 1: Browser-Compatible Verification Commands

### Count Widgets (works in all browsers)
```javascript
document.querySelectorAll('[data-widget]').length
```

### List Widget Types (browser-compatible)
```javascript
Array.prototype.map.call(document.querySelectorAll('[data-widget]'), function(w) { 
  return w.getAttribute('data-widget'); 
})
```

### Check Widget Visibility
```javascript
Array.prototype.map.call(document.querySelectorAll('[data-widget]'), function(w) { 
  return {
    type: w.getAttribute('data-widget'),
    visible: w.style.display !== 'none',
    display: w.style.display
  };
})
```

## Step 2: Run Safe Mode Diagnostic

```javascript
TitanSafeMode.diagnose()
```

This will show:
- Safe Mode status
- Total widgets found
- Visible vs hidden widgets
- Which widgets are allowed/blocked

## Step 3: Inspect Widget Details

```javascript
TitanLegacy.inspectWidgets()
```

This will show:
- All cards on the page
- Which cards have headings
- Which cards are annotated with `data-widget`

## Step 4: Deep Diagnostic

Run this comprehensive check:

```javascript
(function() {
  console.log('\n🔍 COMPREHENSIVE WIDGET DIAGNOSTIC');
  console.log('===================================\n');
  
  // 1. Count annotated widgets
  var widgets = document.querySelectorAll('[data-widget]');
  console.log('1️⃣ Annotated Widgets: ' + widgets.length);
  
  // 2. List each widget
  Array.prototype.forEach.call(widgets, function(w, i) {
    var type = w.getAttribute('data-widget');
    var display = w.style.display;
    var hidden = w.getAttribute('data-safe-mode');
    var visible = display !== 'none' && !hidden;
    
    console.log('   Widget ' + (i+1) + ':');
    console.log('     Type: ' + type);
    console.log('     Visible: ' + (visible ? '✅ YES' : '❌ NO'));
    console.log('     Display: ' + (display || 'default'));
    console.log('     Safe Mode: ' + (hidden || 'none'));
  });
  
  // 3. Count cards
  var cards = document.querySelectorAll('.card');
  console.log('\n2️⃣ Total Cards: ' + cards.length);
  
  // 4. Check for headings
  var headings = document.querySelectorAll('h2, h3, h4, .widget-title, .card-title');
  console.log('3️⃣ Total Headings: ' + headings.length);
  
  // 5. Safe Mode status
  console.log('\n4️⃣ Safe Mode:');
  console.log('   Enabled: ' + (window.TitanSafeMode?.config?.enabled || false));
  console.log('   Allowed: ' + (window.TitanSafeMode?.config?.allowedWidgets?.join(', ') || 'unknown'));
  
  // 6. Annotator status
  console.log('\n5️⃣ Legacy Annotator:');
  console.log('   Loaded: ' + (typeof window.TitanLegacy !== 'undefined'));
  console.log('   Last scan: ' + (window.TitanLegacy?.timestamp ? new Date(window.TitanLegacy.timestamp).toLocaleTimeString('fa-IR') : 'never'));
  
  console.log('\n===================================\n');
  
  return {
    widgets: widgets.length,
    cards: cards.length,
    headings: headings.length,
    safeMode: window.TitanSafeMode?.config?.enabled,
    annotatorReady: typeof window.TitanLegacy !== 'undefined'
  };
})()
```

## Expected Results for Safe Mode

After hard refresh, you should see:

✅ **Correct State:**
- `document.querySelectorAll('[data-widget]').length` → **4**
- Widget types: `['monitor', 'overview', 'portfolio', 'chart']`
- All 4 widgets should be visible (not hidden by Safe Mode)
- No blocked widgets (movers, watchlist, etc.) should appear

❌ **Problem Indicators:**
- Widget count is less than 4
- Widgets are hidden (`style.display === 'none'`)
- Blocked widgets are visible
- Headings are found but not annotated

## Troubleshooting

### If widget count is 1 (your current issue):

This suggests the SPA framework is re-rendering and removing annotations. The MutationObserver should catch this, but there may be a timing issue.

**Try this manual re-scan:**
```javascript
// Force a new scan
TitanLegacy.scan()

// Wait 1 second, then check again
setTimeout(function() {
  console.log('Widgets after manual scan:', document.querySelectorAll('[data-widget]').length);
}, 1000)
```

### If widgets are hidden by Safe Mode:

```javascript
// Check which widgets are hidden
Array.prototype.forEach.call(document.querySelectorAll('[data-widget]'), function(w) {
  if (w.style.display === 'none') {
    console.log('Hidden:', w.getAttribute('data-widget'));
  }
});
```

### If no headings are found:

```javascript
// Check what headings exist
document.querySelectorAll('h2, h3, h4').forEach(function(h) {
  console.log('Heading text:', h.textContent.trim());
});
```

## Next Steps

1. **Run Step 4 (Deep Diagnostic)** - This will give us complete visibility
2. **Share the output** - Copy the entire console output
3. **Try manual re-scan** - See if forcing a new scan fixes the count
4. **Check timing** - The discrepancy might be a race condition

---

**Note:** The spread operator (`...`) doesn't work in all browsers. Use `Array.prototype.map.call()` instead for compatibility.
