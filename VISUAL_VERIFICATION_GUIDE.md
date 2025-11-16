# 🎨 Visual Verification Guide - Version F

## Quick Visual Checklist

After hard refresh (`Ctrl+Shift+R`), your dashboard should look like this:

---

### ✅ CORRECT Layout (What You Should See)

```
┌─────────────────────────────────────────────────────────────┐
│  Titan Dashboard Header                                     │
├─────────────────────┬───────────────────┬───────────────────┤
│                     │                   │                   │
│  خلاصه پرتفولیو      │   وضعیت سیستم      │   نمودار عملکرد    │
│  (Portfolio)        │   (Monitor)       │   (Chart)         │
│                     │                   │                   │
│  ✅ Real equity     │   ✅ System OK    │   ✅ Chart graph  │
│  ✅ Real PnL        │   ✅ Uptime       │                   │
│  ✅ Real balance    │   ✅ Cache rate   │                   │
│                     │                   │                   │
├─────────────────────┴───────────────────┴───────────────────┤
│                                                             │
│  بازار رمزارز / ریپاب قیمت                                  │
│  (Overview / Market Prices)                                 │
│                                                             │
│  ✅ BTC: $XX,XXX.XX  (+X.XX%)                               │
│  ✅ ETH: $X,XXX.XX   (+X.XX%)                               │
│  ✅ BNB: $XXX.XX     (+X.XX%)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Points**:
- ✅ **4 cards total** (no more, no less)
- ✅ **Persian titles** matching original design
- ✅ **Real numbers** (not "—" or "0.00")
- ✅ **No "Test", "Mock", "Demo"** labels anywhere
- ✅ **No extra widgets** (Artemis, AI agents, etc.)

---

### ❌ INCORRECT Layout (What You Should NOT See)

```
❌ Extra cards like:
   - "پیشنهادهای آرتیمیس" (Artemis Recommendations)
   - "Agent Logs" or "AI Agent Status"
   - "Test Widget" or "ویجت آزمایشی"
   - "Mock Data" indicators
   
❌ Wrong numbers:
   - All zeros: $0.00
   - Dashes: —
   - "MOCK" or "TEST" labels
   
❌ Multiple duplicate cards:
   - Two "وضعیت سیستم" cards
   - Two "خلاصه پرتفولیو" cards
   
❌ Wrong layout:
   - Cards in wrong positions
   - Broken styling (overlapping, missing borders)
   - Injected HTML breaking the grid
```

---

## 🔍 Quick Console Check

Open browser console (`F12`) and run:

```javascript
// Should return: 4
document.querySelectorAll('[data-widget]').length
```

If you see anything **other than 4**, something is wrong.

---

## 📸 Screenshot Request

If the layout looks wrong, please:

1. Take a screenshot of the full dashboard
2. Open console (`F12`)
3. Run: `TitanLegacy.inspectWidgets()`
4. Screenshot the console output
5. Share both screenshots

This will help me diagnose the exact issue.

---

## ✅ Success Criteria

**Version F is SUCCESSFUL if**:
- [ ] Dashboard shows exactly 4 cards
- [ ] All card titles are in Persian and match original design
- [ ] All numbers are real live data (not mock/test)
- [ ] No experimental/AI widgets visible
- [ ] Layout is clean and matches original theme
- [ ] Console shows: `4` widgets annotated

**Version F FAILED if**:
- [ ] More or less than 4 cards visible
- [ ] Mock/test data still showing
- [ ] Extra Artemis/AI widgets present
- [ ] Layout is broken or inconsistent
- [ ] Console shows wrong widget count

---

## 🆘 If Something's Wrong

Run these commands in console and share the output:

```javascript
// 1. Widget count
console.log('Widget count:', document.querySelectorAll('[data-widget]').length);

// 2. Widget types
var widgets = document.querySelectorAll('[data-widget]');
for (var i = 0; i < widgets.length; i++) {
  console.log('Widget', i+1, ':', widgets[i].getAttribute('data-widget'));
}

// 3. Detailed inspection
TitanLegacy.inspectWidgets()

// 4. Safe Mode status
TitanSafeMode.diagnose()
```

Copy the full console output and share it.

---

**Expected Time**: Visual verification should take < 2 minutes  
**Action Required**: Hard refresh → Visual check → Console check → Report back
