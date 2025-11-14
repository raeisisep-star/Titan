/**
 * WIDGET DIAGNOSTIC TOOL
 * =====================
 * Comprehensive diagnostic for debugging widget annotation and visibility issues
 * Usage: Run TitanDiag.full() in browser console
 */

(function(global) {
  'use strict';
  
  // ========================================================================
  // DIAGNOSTIC FUNCTIONS
  // ========================================================================
  
  function countWidgets() {
    const widgets = document.querySelectorAll('[data-widget]');
    return {
      total: widgets.length,
      list: Array.from(widgets).map(w => ({
        type: w.getAttribute('data-widget'),
        visible: w.style.display !== 'none' && !w.hasAttribute('data-safe-mode'),
        display: w.style.display || 'default',
        safeMode: w.getAttribute('data-safe-mode') || 'none',
        hasFields: w.querySelectorAll('[data-field]').length
      }))
    };
  }
  
  function countCards() {
    const cards = document.querySelectorAll('.card');
    return {
      total: cards.length,
      annotated: Array.from(cards).filter(c => c.hasAttribute('data-widget')).length,
      unannotated: Array.from(cards).filter(c => !c.hasAttribute('data-widget')).length
    };
  }
  
  function checkHeadings() {
    const headings = document.querySelectorAll('h2, h3, h4, .widget-title, .card-title');
    return {
      total: headings.length,
      list: Array.from(headings).map(h => ({
        text: h.textContent.trim(),
        tag: h.tagName.toLowerCase(),
        hasCard: !!h.closest('.card'),
        cardAnnotated: !!h.closest('[data-widget]')
      }))
    };
  }
  
  function checkModules() {
    return {
      safeMode: {
        loaded: typeof global.TitanSafeMode !== 'undefined',
        enabled: global.TitanSafeMode?.config?.enabled || false,
        allowedWidgets: global.TitanSafeMode?.config?.allowedWidgets || [],
        blockedWidgets: (global.TitanSafeMode?.config?.blockedWidgets || []).length
      },
      annotator: {
        loaded: typeof global.TitanLegacy !== 'undefined',
        annotated: global.TitanLegacy?.annotated || false,
        lastScan: global.TitanLegacy?.timestamp ? 
          new Date(global.TitanLegacy.timestamp).toLocaleTimeString('fa-IR') : 
          'never'
      },
      integration: {
        loaded: typeof global.TitanAPI !== 'undefined',
        useMockData: global.TitanAPI?.config?.useMockData || false
      }
    };
  }
  
  function checkScriptVersions() {
    const scripts = document.querySelectorAll('script[src*="modules/dashboard"]');
    return Array.from(scripts).map(s => {
      const src = s.getAttribute('src');
      const match = src.match(/\/([\w-]+\.js)\?v=(\w+)/);
      return {
        file: match ? match[1] : src.split('/').pop(),
        version: match ? match[2] : 'no version',
        loaded: s.hasAttribute('data-loaded') || 'unknown'
      };
    });
  }
  
  // ========================================================================
  // FULL DIAGNOSTIC REPORT
  // ========================================================================
  
  function fullDiagnostic() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 TITAN DASHBOARD DIAGNOSTIC REPORT');
    console.log('='.repeat(60) + '\n');
    
    // 1. Widgets
    const widgets = countWidgets();
    console.log('1️⃣ ANNOTATED WIDGETS:');
    console.log('   Total: ' + widgets.total);
    if (widgets.list.length > 0) {
      widgets.list.forEach((w, i) => {
        const visIcon = w.visible ? '✅' : '❌';
        console.log('   ' + (i+1) + '. ' + visIcon + ' ' + w.type + 
                    ' (display: ' + w.display + 
                    ', safe-mode: ' + w.safeMode + 
                    ', fields: ' + w.hasFields + ')');
      });
    } else {
      console.log('   ⚠️ NO WIDGETS FOUND');
    }
    
    // 2. Cards
    const cards = countCards();
    console.log('\n2️⃣ CARD CONTAINERS:');
    console.log('   Total cards: ' + cards.total);
    console.log('   Annotated: ' + cards.annotated);
    console.log('   Unannotated: ' + cards.unannotated);
    
    // 3. Headings
    const headings = checkHeadings();
    console.log('\n3️⃣ HEADINGS (potential widgets):');
    console.log('   Total headings: ' + headings.total);
    if (headings.list.length > 0) {
      headings.list.forEach((h, i) => {
        const cardIcon = h.hasCard ? '📦' : '❓';
        const annotIcon = h.cardAnnotated ? '✅' : '❌';
        console.log('   ' + (i+1) + '. ' + cardIcon + annotIcon + ' "' + 
                    h.text.substring(0, 40) + '"');
      });
    }
    
    // 4. Modules
    const modules = checkModules();
    console.log('\n4️⃣ MODULE STATUS:');
    console.log('   Safe Mode:');
    console.log('     Loaded: ' + (modules.safeMode.loaded ? '✅' : '❌'));
    console.log('     Enabled: ' + (modules.safeMode.enabled ? '🟢 YES' : '🔴 NO'));
    console.log('     Allowed: ' + modules.safeMode.allowedWidgets.join(', '));
    console.log('     Blocked: ' + modules.safeMode.blockedWidgets + ' types');
    console.log('   Legacy Annotator:');
    console.log('     Loaded: ' + (modules.annotator.loaded ? '✅' : '❌'));
    console.log('     Annotated: ' + (modules.annotator.annotated ? '✅' : '❌'));
    console.log('     Last scan: ' + modules.annotator.lastScan);
    console.log('   API Integration:');
    console.log('     Loaded: ' + (modules.integration.loaded ? '✅' : '❌'));
    console.log('     Mock data: ' + (modules.integration.useMockData ? '⚠️ YES' : '✅ NO'));
    
    // 5. Script versions
    const scripts = checkScriptVersions();
    console.log('\n5️⃣ SCRIPT VERSIONS:');
    scripts.forEach(s => {
      console.log('   ' + s.file.padEnd(35) + ' → v=' + s.version);
    });
    
    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    
    const expected = 4;
    const actual = widgets.list.filter(w => w.visible).length;
    const status = actual === expected ? '✅ GOOD' : '⚠️ ISSUE';
    
    console.log('Expected widgets: ' + expected);
    console.log('Visible widgets: ' + actual + ' ' + status);
    console.log('Unannotated cards: ' + cards.unannotated);
    
    if (actual < expected) {
      console.log('\n⚠️ PROBLEM DETECTED:');
      if (widgets.total === 0) {
        console.log('   • NO widgets annotated at all');
        console.log('   • Possible causes:');
        console.log('     - Annotator not running');
        console.log('     - Headings not matching TITLES patterns');
        console.log('     - DOM not ready when annotator ran');
      } else if (widgets.total < expected) {
        console.log('   • PARTIAL annotation (' + widgets.total + '/' + expected + ')');
        console.log('   • Possible causes:');
        console.log('     - Some card headings not matching TITLES patterns');
        console.log('     - Cards not having correct structure');
      } else if (widgets.total === expected) {
        const hidden = widgets.list.filter(w => !w.visible).length;
        console.log('   • Widgets HIDDEN (' + hidden + ' hidden)');
        console.log('   • Possible causes:');
        console.log('     - Safe Mode hiding widgets');
        console.log('     - CSS display:none applied');
      }
      console.log('\n💡 SUGGESTED ACTIONS:');
      console.log('   1. Run TitanLegacy.inspectWidgets() to see card titles');
      console.log('   2. Run TitanLegacy.scan() to force re-annotation');
      console.log('   3. Run TitanSafeMode.diagnose() for Safe Mode details');
      console.log('   4. Check console for errors during page load');
    } else {
      console.log('\n✅ All systems operational!');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    return {
      widgets: widgets,
      cards: cards,
      headings: headings,
      modules: modules,
      scripts: scripts,
      summary: {
        expected: expected,
        actual: actual,
        status: status,
        unannotated: cards.unannotated
      }
    };
  }
  
  // ========================================================================
  // QUICK CHECKS
  // ========================================================================
  
  function quickCheck() {
    const widgets = document.querySelectorAll('[data-widget]');
    const visible = Array.from(widgets).filter(w => 
      w.style.display !== 'none' && !w.hasAttribute('data-safe-mode')
    );
    
    console.log('🔍 Quick Check:');
    console.log('   Total widgets: ' + widgets.length);
    console.log('   Visible: ' + visible.length);
    console.log('   Types: ' + Array.from(visible).map(w => w.getAttribute('data-widget')).join(', '));
    
    return {
      total: widgets.length,
      visible: visible.length,
      types: Array.from(visible).map(w => w.getAttribute('data-widget'))
    };
  }
  
  function forceRescan() {
    console.log('🔄 Forcing widget re-scan...');
    
    if (typeof global.TitanLegacy === 'undefined') {
      console.error('❌ TitanLegacy not loaded');
      return null;
    }
    
    const before = document.querySelectorAll('[data-widget]').length;
    console.log('   Before: ' + before + ' widgets');
    
    const result = global.TitanLegacy.scan();
    
    setTimeout(function() {
      const after = document.querySelectorAll('[data-widget]').length;
      console.log('   After: ' + after + ' widgets');
      
      if (after > before) {
        console.log('✅ Re-scan successful! Added ' + (after - before) + ' widgets');
      } else if (after === before) {
        console.log('ℹ️ No change in widget count');
      } else {
        console.log('⚠️ Widget count decreased!');
      }
      
      quickCheck();
    }, 500);
    
    return result;
  }
  
  // ========================================================================
  // EXPOSE GLOBALLY
  // ========================================================================
  
  global.TitanDiag = {
    full: fullDiagnostic,
    quick: quickCheck,
    rescan: forceRescan,
    widgets: countWidgets,
    cards: countCards,
    headings: checkHeadings,
    modules: checkModules,
    scripts: checkScriptVersions
  };
  
  console.log('✅ [Diagnostic] Module loaded - use TitanDiag.full() for complete report');
  
})(window);
