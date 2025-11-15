/**
 * Verification Script for Cache-Busting Fix
 * 
 * This script can be pasted into the browser console to verify:
 * 1. New code with cache-busting parameters is loading
 * 2. Persistent observer is active
 * 3. Widgets are being annotated correctly
 */

console.log('🔍 === CACHE BUST VERIFICATION START ===\n');

// Check 1: Verify script tags have cache-busting parameters
const scriptTags = Array.from(document.querySelectorAll('script[src*="dashboard"]'));
console.log('📜 Widget Integration Scripts:');
scriptTags.forEach(script => {
  const src = script.src;
  const hasVersion = src.includes('?v=');
  const status = hasVersion ? '✅' : '❌';
  console.log(`${status} ${src.split('/').pop()}`);
});

console.log('\n');

// Check 2: Verify persistent observer function exists
const hasPersistentObserver = typeof window.TitanLegacy?.startPersistentAnnotation === 'function';
console.log(`🔍 Persistent Observer Available: ${hasPersistentObserver ? '✅ YES' : '❌ NO'}`);

if (hasPersistentObserver) {
  console.log('   Function signature:', window.TitanLegacy.startPersistentAnnotation.toString().substring(0, 100) + '...');
}

console.log('\n');

// Check 3: Count annotated widgets
const widgets = document.querySelectorAll('[data-widget]');
console.log(`📊 Annotated Widgets in DOM: ${widgets.length}`);

if (widgets.length > 0) {
  console.log('   Widget Types:');
  widgets.forEach(w => {
    const type = w.getAttribute('data-widget');
    const fields = w.querySelectorAll('[data-field]').length;
    console.log(`   - ${type}: ${fields} fields`);
  });
}

console.log('\n');

// Check 4: Verify TitanLegacy state
if (window.TitanLegacy) {
  console.log('📦 TitanLegacy State:');
  console.log(`   - annotated: ${window.TitanLegacy.annotated}`);
  console.log(`   - result:`, window.TitanLegacy.result);
  console.log(`   - timestamp: ${window.TitanLegacy.timestamp ? new Date(window.TitanLegacy.timestamp).toLocaleString('fa-IR') : 'N/A'}`);
}

console.log('\n');

// Check 5: Verify TitanAPI is available
console.log(`🔌 TitanAPI Available: ${typeof window.TitanAPI === 'object' ? '✅ YES' : '❌ NO'}`);

if (window.TitanAPI) {
  console.log('   Methods:', Object.keys(window.TitanAPI).join(', '));
}

console.log('\n');

// Check 6: Run TitanDiag if available
if (typeof window.TitanDiag === 'function') {
  console.log('📊 Running TitanDiag()...');
  window.TitanDiag();
} else {
  console.log('⚠️ TitanDiag() not available');
}

console.log('\n🔍 === CACHE BUST VERIFICATION END ===\n');

// Return summary object
const summary = {
  scriptsWithCacheBust: scriptTags.filter(s => s.src.includes('?v=')).length,
  totalScripts: scriptTags.length,
  persistentObserverAvailable: hasPersistentObserver,
  annotatedWidgets: widgets.length,
  titanAPIAvailable: typeof window.TitanAPI === 'object',
  titanDiagAvailable: typeof window.TitanDiag === 'function'
};

console.log('📋 Summary:', summary);

// Provide recommendation
console.log('\n💡 Recommendations:');
if (summary.scriptsWithCacheBust < summary.totalScripts) {
  console.log('⚠️ Not all scripts have cache-busting parameters. Hard refresh (Ctrl+Shift+R) required.');
}
if (!summary.persistentObserverAvailable) {
  console.log('⚠️ Persistent observer not available. Old code is still cached. Clear cache and hard refresh.');
}
if (summary.annotatedWidgets === 0) {
  console.log('⚠️ No widgets annotated. Try running: window.TitanLegacy.scan()');
}
if (summary.persistentObserverAvailable && summary.annotatedWidgets > 0 && summary.titanAPIAvailable) {
  console.log('✅ Everything looks good! Widgets should be working correctly.');
}

console.log('\n');
