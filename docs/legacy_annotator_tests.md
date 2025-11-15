# Legacy Annotator Browser Console Tests
**Date**: 2025-11-12  
**Commit**: cb3aa35  
**Feature**: Auto-Annotation of Legacy Widgets by Persian Titles  

---

## 🎯 What Is Legacy Annotator?

The **Legacy Annotator** is an intelligent system that:
1. **Scans** the dashboard for existing widgets by their Persian/English titles
2. **Detects** legacy containers automatically (no manual configuration needed)
3. **Injects** `data-widget` and `data-field` attributes WITHOUT rewriting HTML
4. **Enables** smart data binding so old widgets receive live data

**Key Benefit**: Your existing green widgets work immediately without any code changes!

---

## 🧪 Browser Console Tests (Copy/Paste)

Open your browser, navigate to the dashboard, open DevTools Console (F12), and run these tests:

### Test 1: Check if Annotator Loaded
```javascript
// Should show the TitanLegacy object with annotation results
window.TitanLegacy
```

**Expected Output**:
```javascript
{
  annotated: true,
  result: {
    overview: HTMLDivElement,  // or null if not found
    movers: HTMLDivElement,     // or null if not found
    portfolio: HTMLDivElement,  // or null if not found
    monitor: HTMLDivElement,    // or null if not found
    chart: HTMLDivElement       // or null if not found
  },
  timestamp: 1699876543210
}
```

**✅ PASS**: If object exists with `annotated: true`  
**❌ FAIL**: If undefined or `annotated: false`

---

### Test 2: Count Annotated Widgets
```javascript
// Count widgets with data-widget attribute
document.querySelectorAll('[data-widget]').length
```

**Expected Output**: `1` to `5` (depending on how many widgets have matching titles)

**Interpretation**:
- `0`: No widgets found (need to update TITLES array with exact dashboard titles)
- `1-5`: Widgets successfully detected and annotated
- `>5`: Something wrong (should only be 5 widget types)

**✅ PASS**: If count > 0  
**⚠️ WARNING**: If count = 0 (need title adjustment)

---

### Test 3: Count Data-Field Elements
```javascript
// Count all data-field binding points
document.querySelectorAll('[data-field]').length
```

**Expected Output**: `15` to `50` (depending on widgets found)

**Interpretation**:
- `0`: No fields created (annotator didn't run or no widgets found)
- `15-50`: Normal range (each widget has ~5-10 fields)
- `>50`: Many widgets found (good!)

**✅ PASS**: If count > 0  
**⚠️ WARNING**: If count = 0

---

### Test 4: List All Annotated Widgets
```javascript
// Show which widgets were found
Array.from(document.querySelectorAll('[data-widget]')).map(el => ({
  type: el.getAttribute('data-widget'),
  className: el.className,
  fields: el.querySelectorAll('[data-field]').length
}))
```

**Expected Output**:
```javascript
[
  { type: "overview", className: "card shadow rounded", fields: 8 },
  { type: "movers", className: "widget-container", fields: 6 },
  { type: "portfolio", className: "card", fields: 7 },
  { type: "monitor", className: "panel", fields: 6 }
]
```

**✅ PASS**: If shows array of annotated widgets  
**ℹ️ INFO**: Use this to verify which widgets were detected

---

### Test 5: Check Persian Timestamp Function
```javascript
// Test Persian date/time formatter
TitanDT.formatDateTimeFA(Date.now())
```

**Expected Output**: `"۱۴۰۴/۰۸/۲۰ — ۱۵:۴۵:۳۰"` (current Persian date/time)

**✅ PASS**: If returns Persian numerals and date format  
**❌ FAIL**: If undefined or returns English numbers

---

### Test 6: Check MoversAdapter Structure
```javascript
// Test MoversAdapter returns unified structure
MoversAdapter.getMovers(5).then(data => {
  console.log('✅ Gainers:', data.gainers?.length || 0);
  console.log('✅ Losers:', data.losers?.length || 0);
  console.log('✅ Structure:', data);
  return data;
})
```

**Expected Output**:
```
✅ Gainers: 5
✅ Losers: 5
✅ Structure: {
  gainers: [{symbol: "UNIUSDT", change24h: 5.2, ...}, ...],
  losers: [{symbol: "DOTUSDT", change24h: -2.1, ...}, ...],
  timestamp: 1699876543210
}
```

**✅ PASS**: If shows both gainers and losers arrays  
**❌ FAIL**: If TypeError or missing gainers/losers

---

### Test 7: Check Feature Flag
```javascript
// Verify legacy widgets preference is enabled
window.TitanFlags.preferLegacyWidgets
```

**Expected Output**: `true`

**✅ PASS**: If `true`  
**❌ FAIL**: If `false` or `undefined`

---

### Test 8: Test Data Binding (Manual)
```javascript
// Manually test binding to a field (if widget exists)
const overviewWidget = document.querySelector('[data-widget="overview"]');
if (overviewWidget) {
  const field = overviewWidget.querySelector('[data-field="btc-price"]');
  if (field) {
    field.textContent = '$TEST_89234.56';
    console.log('✅ Field updated:', field.textContent);
  } else {
    console.log('⚠️ btc-price field not found');
  }
} else {
  console.log('⚠️ Overview widget not found');
}
```

**Expected Output**: `✅ Field updated: $TEST_89234.56`

**Verification**: Check if the widget visually shows the test price

**✅ PASS**: If field updates visually  
**⚠️ WARNING**: If field not found

---

### Test 9: Check Console Logs (Look Back)
```javascript
// Filter console for Legacy Annotator messages
// Scroll up in console to see these messages:
```

**Expected Console Messages**:
```
✅ [Legacy Annotator] Module loaded
🔍 [Legacy Annotator] Starting annotation scan...
✅ [Legacy Annotator] Found card for "نمای کلی بازار" via heading: "نمای کلی بازار"
✅ [Legacy Annotator] Overview widget annotated
✅ [Legacy Annotator] Found card for "بازیگران بازار" via heading: "Top Movers"
✅ [Legacy Annotator] Movers widget annotated
✅ [Legacy Annotator] Annotation complete: 4/5 widgets found and annotated
```

**✅ PASS**: If see annotation messages  
**⚠️ WARNING**: If see "No card found for titles" messages

---

### Test 10: Inspect Widget HTML (Optional)
```javascript
// Show HTML structure of an annotated widget
const widget = document.querySelector('[data-widget="overview"]');
if (widget) {
  console.log('Widget HTML:', widget.outerHTML.substring(0, 500) + '...');
  console.log('Data fields:', Array.from(widget.querySelectorAll('[data-field]')).map(el => el.getAttribute('data-field')));
} else {
  console.log('⚠️ Widget not found');
}
```

**Expected Output**:
```
Widget HTML: <div class="card shadow rounded" data-widget="overview">...
Data fields: ["last-updated", "btc-price", "btc-change", "eth-price", ...]
```

**✅ PASS**: If shows widget HTML with data-field attributes  
**ℹ️ INFO**: Use this to debug field names

---

## 🔧 Troubleshooting

### Issue 1: No Widgets Found (Test 2 returns 0)

**Cause**: Widget titles don't match TITLES array in legacy-annotator.js

**Solution**: Find exact widget titles in your dashboard

**How to Find Titles**:
```javascript
// List all h2, h3, h4 headings in the page
Array.from(document.querySelectorAll('h2,h3,h4')).map(h => h.textContent.trim())
```

**Example Output**:
```javascript
[
  "نمای کلی بازار",
  "گزارش معاملات",
  "پورتفولیوی من",
  "سلامت سیستم"
]
```

**Next Step**: Copy these exact titles and add them to `legacy-annotator.js`:

```javascript
const TITLES = {
  overview:  ['نمای کلی بازار'],  // ← Add your exact title here
  movers:    ['گزارش معاملات'],   // ← Add your exact title here
  portfolio: ['پورتفولیوی من'],   // ← Add your exact title here
  monitor:   ['سلامت سیستم'],      // ← Add your exact title here
  chart:     ['نمودار'],           // ← Add your exact title here
};
```

---

### Issue 2: Some Fields Not Updating

**Cause**: Widget loader not using `TitanBind.renderInto()`

**Check**:
```javascript
// Verify TitanBind exists
window.TitanBind
```

**Expected**: Object with `renderInto`, `bindOverviewData`, etc.

**If undefined**: widgets-integration.js didn't load properly

---

### Issue 3: TypeError in MoversAdapter

**Cause**: MoversAdapter returning old structure

**Check**:
```javascript
// This should NOT throw error
MoversAdapter.getMovers(5).then(data => {
  console.log(data.gainers, data.losers);
})
```

**If error**: movers.adapter.js needs to be updated to return `{gainers, losers}`

---

### Issue 4: Duplicate Widgets Showing

**Cause**: Both legacy and new widgets visible

**Check**:
```javascript
// Count hidden fallback widgets
document.querySelectorAll('.legacy-fallback.hidden').length
```

**Expected**: `4` (if 4 new widgets are hidden)

**If 0**: CSS rule not applied, check index.html for:
```css
.legacy-fallback.hidden { display: none !important; }
```

---

## 📊 Test Results Summary Template

Copy this template and fill in your results:

```
=== Legacy Annotator Test Results ===
Date: [Your Date]
Dashboard URL: http://188.40.209.82:5000

Test 1 (TitanLegacy exists): [ ] PASS [ ] FAIL
Test 2 (Widget count): ____ widgets found
Test 3 (Field count): ____ fields created
Test 4 (Widget list):
  - [ ] overview
  - [ ] movers
  - [ ] portfolio
  - [ ] monitor
  - [ ] chart

Test 5 (Persian timestamp): [ ] PASS [ ] FAIL
Test 6 (MoversAdapter structure): [ ] PASS [ ] FAIL
Test 7 (Feature flag): [ ] PASS [ ] FAIL
Test 8 (Data binding): [ ] PASS [ ] FAIL
Test 9 (Console logs): [ ] PASS [ ] FAIL

Overall Status: [ ] ALL PASS [ ] NEEDS FIXES

Notes:
_______________________________________________
_______________________________________________
```

---

## 🎯 Success Criteria

For the Legacy Annotator to be considered **fully functional**, you need:

- ✅ Test 1-7: All PASS
- ✅ Test 2: At least 1 widget found (ideally 3-5)
- ✅ Test 3: At least 15 fields created
- ✅ Test 6: MoversAdapter returns {gainers, losers}
- ✅ No console errors about TitanBind, MoversAdapter, or undefined

---

## 🚀 Quick Verification Script (All-in-One)

Run this single command to get a full report:

```javascript
(function() {
  console.log('=== LEGACY ANNOTATOR TEST REPORT ===\n');
  
  // Test 1
  const legacy = window.TitanLegacy;
  console.log('1. TitanLegacy exists:', legacy ? '✅ PASS' : '❌ FAIL');
  console.log('   Annotated:', legacy?.annotated || false);
  
  // Test 2
  const widgetCount = document.querySelectorAll('[data-widget]').length;
  console.log('\n2. Widget count:', widgetCount, widgetCount > 0 ? '✅ PASS' : '⚠️ WARNING');
  
  // Test 3
  const fieldCount = document.querySelectorAll('[data-field]').length;
  console.log('\n3. Field count:', fieldCount, fieldCount > 0 ? '✅ PASS' : '⚠️ WARNING');
  
  // Test 4
  console.log('\n4. Widget list:');
  Array.from(document.querySelectorAll('[data-widget]')).forEach(el => {
    console.log('   -', el.getAttribute('data-widget'), `(${el.querySelectorAll('[data-field]').length} fields)`);
  });
  
  // Test 5
  const timestamp = window.TitanDT?.formatDateTimeFA(Date.now());
  console.log('\n5. Persian timestamp:', timestamp ? '✅ PASS' : '❌ FAIL');
  console.log('   Example:', timestamp);
  
  // Test 6
  console.log('\n6. MoversAdapter: Testing...');
  if (window.MoversAdapter) {
    window.MoversAdapter.getMovers(3).then(data => {
      console.log('   Gainers:', data.gainers?.length || 0, '✅');
      console.log('   Losers:', data.losers?.length || 0, '✅');
    }).catch(err => {
      console.log('   ❌ ERROR:', err.message);
    });
  } else {
    console.log('   ❌ MoversAdapter not found');
  }
  
  // Test 7
  const flag = window.TitanFlags?.preferLegacyWidgets;
  console.log('\n7. Feature flag:', flag ? '✅ PASS' : '❌ FAIL');
  console.log('   Value:', flag);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log('Widgets found:', widgetCount);
  console.log('Fields created:', fieldCount);
  console.log('Status:', widgetCount > 0 && fieldCount > 0 ? '✅ WORKING' : '⚠️ NEEDS ATTENTION');
  
  console.log('\n=== END REPORT ===\n');
})();
```

**Usage**: Copy the entire script above and paste into console. It will run all tests and show a formatted report.

---

## 📝 What To Send Me If Issues

If annotation isn't working, send me this info:

```javascript
// Run this and copy the output
{
  widgetCount: document.querySelectorAll('[data-widget]').length,
  fieldCount: document.querySelectorAll('[data-field]').length,
  titles: Array.from(document.querySelectorAll('h2,h3,h4')).map(h => h.textContent.trim()),
  titanLegacy: window.TitanLegacy,
  errors: 'Copy any red errors from console here'
}
```

I'll use this to update the TITLES array with your exact dashboard titles!

---

**Created**: 2025-11-12  
**Commit**: cb3aa35  
**Status**: ✅ Ready for Testing
