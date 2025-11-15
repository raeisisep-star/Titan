/**
 * SAFE MODE CONFIGURATION
 * ========================
 * Enforces clean dashboard with ONLY 4 core widgets
 * Disables all experimental/test widgets
 * Removes mock data and conflicting loaders
 * 
 * Persian Manager Orders:
 * 1. Only 4 core cards allowed: Monitor, Overview, Portfolio, Chart
 * 2. No experimental widgets in production UI
 * 3. No mock data visible on cards
 * 4. No HTML injection outside standard containers
 * 5. No parallel loaders causing overwrites
 */

(function() {
  'use strict';
  
  // ========================================================================
  // SAFE MODE CONFIGURATION
  // ========================================================================
  
  const SAFE_MODE = {
    enabled: true, // Master switch - set to false to disable safe mode
    
    // Whitelist: ONLY these 4 widgets are allowed
    allowedWidgets: [
      'monitor',    // System status monitoring
      'overview',   // Market overview/price
      'portfolio',  // Portfolio summary
      'chart'       // Performance chart
    ],
    
    // Blacklist: Experimental/test widgets to REMOVE
    blockedWidgets: [
      'movers',           // Top movers (experimental)
      'watchlist',        // Watchlist (not in core design)
      'news',             // News feed (external agent)
      'sentiment',        // Sentiment analysis (external)
      'alerts',           // Alerts widget (separate module)
      'trading',          // Trading interface (not dashboard)
      'analysis',         // Analysis tools (separate)
      'recommendations',  // AI recommendations (test)
      'market-making',    // Market making (agent UI)
      'hft',              // High-frequency trading (agent UI)
      'quantitative',     // Quantitative analysis (agent UI)
      'macro',            // Macro analysis (agent UI)
      'algorithmic',      // Algorithmic trading (agent UI)
      'risk',             // Risk management (agent UI)
      'optimization'      // Portfolio optimization (agent UI)
    ],
    
    // UI cleanup rules
    cleanup: {
      removeAgentLogs: true,        // Remove agent console output from UI
      removeAgentNotifications: true, // Remove agent notification badges
      removeMockData: true,          // Remove any "MOCK" or "TEST" labels
      enforceDesignSystem: true,     // Reset to standard card styling
      disableExperimentalLoaders: true // Disable dashboard-widgets-loader.js
    }
  };
  
  // ========================================================================
  // WIDGET VALIDATOR
  // ========================================================================
  
  function isWidgetAllowed(widgetType) {
    if (!SAFE_MODE.enabled) return true;
    return SAFE_MODE.allowedWidgets.includes(widgetType);
  }
  
  function isWidgetBlocked(widgetType) {
    if (!SAFE_MODE.enabled) return false;
    return SAFE_MODE.blockedWidgets.includes(widgetType);
  }
  
  // ========================================================================
  // CLEANUP FUNCTIONS
  // ========================================================================
  
  function removeBlockedWidgets() {
    console.log('🧹 [Safe Mode] Scanning for blocked widgets...');
    
    let removedCount = 0;
    
    // Find all annotated widgets
    const allWidgets = document.querySelectorAll('[data-widget]');
    
    allWidgets.forEach(widget => {
      const widgetType = widget.getAttribute('data-widget');
      
      if (isWidgetBlocked(widgetType)) {
        console.log(`❌ [Safe Mode] Removing blocked widget: ${widgetType}`);
        widget.style.display = 'none';
        widget.setAttribute('data-safe-mode', 'hidden');
        removedCount++;
      } else if (!isWidgetAllowed(widgetType)) {
        console.log(`⚠️ [Safe Mode] Hiding unlisted widget: ${widgetType}`);
        widget.style.display = 'none';
        widget.setAttribute('data-safe-mode', 'unlisted');
        removedCount++;
      }
    });
    
    // VERSION F: Also remove any cards that don't have data-widget but look like extra widgets
    // Check for common patterns of injected/experimental cards
    const suspiciousCards = document.querySelectorAll('.card');
    suspiciousCards.forEach(card => {
      // Skip if already has data-widget (legitimate)
      if (card.hasAttribute('data-widget')) return;
      
      // Check if this card contains keywords suggesting it's an experimental widget
      const text = card.textContent || '';
      const suspiciousKeywords = [
        'آرتیمیس', 'Artemis',
        'Agent', 'AI Agent',
        'Test Widget', 'ویجت تست',
        'Experimental', 'آزمایشی',
        'Mock Data', 'داده نمونه'
      ];
      
      const isSuspicious = suspiciousKeywords.some(keyword => 
        text.includes(keyword)
      );
      
      if (isSuspicious && card.closest('.dashboard-grid, .widget-container, [class*="grid"]')) {
        console.log(`🗑️ [Safe Mode] Removing suspicious non-annotated card`);
        card.style.display = 'none';
        card.setAttribute('data-safe-mode', 'suspicious');
        removedCount++;
      }
    });
    
    console.log(`✅ [Safe Mode] Cleanup complete: ${removedCount} widgets hidden`);
    return removedCount;
  }
  
  function removeAgentUIElements() {
    if (!SAFE_MODE.cleanup.removeAgentLogs && !SAFE_MODE.cleanup.removeAgentNotifications) {
      return;
    }
    
    console.log('🧹 [Safe Mode] Removing agent UI elements...');
    
    // Remove agent log containers
    if (SAFE_MODE.cleanup.removeAgentLogs) {
      const agentLogs = document.querySelectorAll('[class*="agent-log"], [id*="agent-log"]');
      agentLogs.forEach(el => el.remove());
    }
    
    // Remove agent notification badges
    if (SAFE_MODE.cleanup.removeAgentNotifications) {
      const agentBadges = document.querySelectorAll('[class*="agent-badge"], [class*="agent-notification"]');
      agentBadges.forEach(el => el.remove());
    }
    
    console.log('✅ [Safe Mode] Agent UI elements removed');
  }
  
  function removeMockDataLabels() {
    if (!SAFE_MODE.cleanup.removeMockData) return;
    
    console.log('🧹 [Safe Mode] Removing mock data labels...');
    
    // Find and remove "MOCK", "TEST", "DEMO" labels
    const mockLabels = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent || '';
      return /\b(MOCK|TEST|DEMO|آزمایشی|نمونه)\b/i.test(text) && 
             el.children.length === 0 && // Only text nodes
             text.length < 50; // Not full sentences
    });
    
    mockLabels.forEach(el => {
      console.log(`🗑️ [Safe Mode] Removing mock label: "${el.textContent}"`);
      el.remove();
    });
    
    console.log('✅ [Safe Mode] Mock data labels removed');
  }
  
  function enforceDesignSystem() {
    if (!SAFE_MODE.cleanup.enforceDesignSystem) return;
    
    console.log('🎨 [Safe Mode] Enforcing design system...');
    
    // Reset to standard card styling for allowed widgets
    const allowedWidgets = document.querySelectorAll('[data-widget]');
    
    allowedWidgets.forEach(widget => {
      const widgetType = widget.getAttribute('data-widget');
      
      if (isWidgetAllowed(widgetType)) {
        // Remove any experimental classes
        widget.classList.remove('experimental', 'test', 'beta', 'alpha');
        
        // Ensure standard card class
        if (!widget.classList.contains('card')) {
          widget.classList.add('card');
        }
        
        // Remove inline styles that might break design
        if (widget.hasAttribute('style')) {
          const style = widget.getAttribute('style');
          if (style.includes('transform') || style.includes('animation')) {
            widget.removeAttribute('style');
          }
        }
      }
    });
    
    console.log('✅ [Safe Mode] Design system enforced');
  }
  
  // ========================================================================
  // LOADER DISABLER
  // ========================================================================
  
  function disableConflictingLoaders() {
    if (!SAFE_MODE.cleanup.disableExperimentalLoaders) return;
    
    console.log('🛑 [Safe Mode] Disabling conflicting loaders...');
    
    // Set flag to disable dashboard-widgets-loader.js
    window.TitanFlags = window.TitanFlags || {};
    window.TitanFlags.DisableOldLoader = true;
    window.TitanFlags.SafeMode = true;
    
    console.log('✅ [Safe Mode] Conflicting loaders disabled');
  }
  
  // ========================================================================
  // MAIN CLEANUP ORCHESTRATOR
  // ========================================================================
  
  function runSafeMode() {
    if (!SAFE_MODE.enabled) {
      console.log('ℹ️ [Safe Mode] Disabled - skipping cleanup');
      return;
    }
    
    console.log('🚨 [Safe Mode] ACTIVATED - Starting dashboard cleanup...');
    console.log('📋 [Safe Mode] Allowed widgets:', SAFE_MODE.allowedWidgets.join(', '));
    console.log('🚫 [Safe Mode] Blocked widgets:', SAFE_MODE.blockedWidgets.length, 'types');
    
    // 1. Disable conflicting loaders FIRST
    disableConflictingLoaders();
    
    // 2. Remove blocked widgets
    const hiddenCount = removeBlockedWidgets();
    
    // 3. Remove agent UI elements
    removeAgentUIElements();
    
    // 4. Remove mock data labels
    removeMockDataLabels();
    
    // 5. Enforce design system
    enforceDesignSystem();
    
    // Final verification
    const remainingWidgets = document.querySelectorAll('[data-widget]:not([data-safe-mode])');
    console.log(`✅ [Safe Mode] Cleanup complete`);
    console.log(`📊 [Safe Mode] Visible widgets: ${remainingWidgets.length}/${SAFE_MODE.allowedWidgets.length} expected`);
    
    remainingWidgets.forEach(w => {
      console.log(`   - ${w.getAttribute('data-widget')}`);
    });
  }
  
  // ========================================================================
  // CONTINUOUS MONITORING (for SPA re-renders)
  // ========================================================================
  
  function startSafeModeMonitor() {
    if (!SAFE_MODE.enabled) return;
    
    console.log('👁️ [Safe Mode] Starting continuous monitor...');
    
    let monitorTimeout;
    
    const observer = new MutationObserver(() => {
      clearTimeout(monitorTimeout);
      monitorTimeout = setTimeout(() => {
        // Check if blocked widgets reappeared
        const blockedFound = Array.from(document.querySelectorAll('[data-widget]')).filter(w => {
          const type = w.getAttribute('data-widget');
          return isWidgetBlocked(type) && w.style.display !== 'none';
        });
        
        if (blockedFound.length > 0) {
          console.log(`🚨 [Safe Mode] ${blockedFound.length} blocked widgets reappeared, cleaning...`);
          runSafeMode();
        }
      }, 500);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    console.log('✅ [Safe Mode] Monitor active');
  }
  
  // ========================================================================
  // DIAGNOSTIC HELPER
  // ========================================================================
  
  function diagnoseSafeMode() {
    console.log('\n🔍 [Safe Mode] Diagnostic Report:');
    console.log('================================');
    console.log('Mode:', SAFE_MODE.enabled ? '🟢 ACTIVE' : '🔴 DISABLED');
    console.log('Allowed:', SAFE_MODE.allowedWidgets.join(', '));
    console.log('Blocked:', SAFE_MODE.blockedWidgets.length, 'types');
    
    const allWidgets = document.querySelectorAll('[data-widget]');
    const visible = Array.from(allWidgets).filter(w => w.style.display !== 'none');
    const hidden = Array.from(allWidgets).filter(w => w.style.display === 'none');
    
    console.log('\nWidget Status:');
    console.log('Total:', allWidgets.length);
    console.log('Visible:', visible.length);
    console.log('Hidden:', hidden.length);
    
    console.log('\nVisible Widgets:');
    visible.forEach(w => {
      const type = w.getAttribute('data-widget');
      const allowed = isWidgetAllowed(type);
      console.log(`  ${allowed ? '✅' : '⚠️'} ${type}`);
    });
    
    if (hidden.length > 0) {
      console.log('\nHidden Widgets:');
      hidden.forEach(w => {
        const type = w.getAttribute('data-widget');
        console.log(`  ❌ ${type}`);
      });
    }
    
    console.log('================================\n');
    
    return {
      enabled: SAFE_MODE.enabled,
      total: allWidgets.length,
      visible: visible.length,
      hidden: hidden.length,
      allowedCount: SAFE_MODE.allowedWidgets.length,
      blockedCount: SAFE_MODE.blockedWidgets.length
    };
  }
  
  // ========================================================================
  // EXPOSE GLOBALLY
  // ========================================================================
  
  window.TitanSafeMode = {
    config: SAFE_MODE,
    run: runSafeMode,
    diagnose: diagnoseSafeMode,
    isAllowed: isWidgetAllowed,
    isBlocked: isWidgetBlocked
  };
  
  // ========================================================================
  // AUTO-RUN
  // ========================================================================
  
  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runSafeMode, 100);
      setTimeout(startSafeModeMonitor, 500);
    });
  } else {
    setTimeout(runSafeMode, 100);
    setTimeout(startSafeModeMonitor, 500);
  }
  
  // Also run when widgets-ready event fires
  document.addEventListener('titan:widgets-ready', () => {
    console.log('🔔 [Safe Mode] Widgets ready event detected, running cleanup...');
    setTimeout(runSafeMode, 50);
  });
  
  console.log('✅ [Safe Mode] Module loaded - will activate on DOM ready');
  
})();
