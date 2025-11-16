/**
 * Theme Manager
 * 🎯 TITAN Platform - Dark/Light Mode Switcher
 * Version: 2.0.0
 * 
 * Manages theme switching between dark and light modes
 * with localStorage persistence
 */

const THEME_KEY = 'titan-dashboard-theme';
const THEMES = {
    DARK: 'dark',
    LIGHT: 'light'
};

/**
 * Theme Manager Class
 */
class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }
    
    /**
     * Initialize theme manager
     */
    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        this.watchSystemTheme();
        
        console.log(`🎨 [ThemeManager] Initialized with theme: ${this.currentTheme}`);
    }
    
    /**
     * Load theme from localStorage or use system preference
     * @returns {string} Theme name
     */
    loadTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
            return savedTheme;
        }
        
        // Fall back to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return THEMES.LIGHT;
        }
        
        // Default to dark
        return THEMES.DARK;
    }
    
    /**
     * Save theme to localStorage
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
    
    /**
     * Apply theme to document
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === THEMES.LIGHT) {
            html.classList.add('light-theme');
            html.classList.remove('dark-theme');
        } else {
            html.classList.add('dark-theme');
            html.classList.remove('light-theme');
        }
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        this.currentTheme = theme;
    }
    
    /**
     * Toggle between dark and light themes
     * @returns {string} New theme name
     */
    toggle() {
        const newTheme = this.currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        this.switchTheme(newTheme);
        return newTheme;
    }
    
    /**
     * Switch to a specific theme
     * @param {string} theme - Theme name
     */
    switchTheme(theme) {
        if (!Object.values(THEMES).includes(theme)) {
            console.error(`❌ [ThemeManager] Invalid theme: ${theme}`);
            return;
        }
        
        this.applyTheme(theme);
        this.saveTheme(theme);
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('theme-changed', {
            detail: { theme }
        }));
        
        console.log(`✅ [ThemeManager] Switched to ${theme} theme`);
    }
    
    /**
     * Get current theme
     * @returns {string} Current theme name
     */
    getTheme() {
        return this.currentTheme;
    }
    
    /**
     * Check if current theme is dark
     * @returns {boolean} True if dark theme
     */
    isDark() {
        return this.currentTheme === THEMES.DARK;
    }
    
    /**
     * Check if current theme is light
     * @returns {boolean} True if light theme
     */
    isLight() {
        return this.currentTheme === THEMES.LIGHT;
    }
    
    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        if (!window.matchMedia) return;
        
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        darkModeQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            const hasSavedTheme = localStorage.getItem(THEME_KEY);
            if (!hasSavedTheme) {
                const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
                this.applyTheme(newTheme);
                console.log(`🔄 [ThemeManager] Auto-switched to ${newTheme} (system preference)`);
            }
        });
    }
    
    /**
     * Update meta theme-color for mobile browsers
     * @param {string} theme - Theme name
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // Set color based on theme
        const color = theme === THEMES.DARK ? '#1f2937' : '#ffffff';
        metaThemeColor.content = color;
    }
    
    /**
     * Create theme toggle button HTML
     * @returns {string} HTML string for toggle button
     */
    renderToggleButton() {
        const icon = this.isDark() ? '☀️' : '🌙';
        const label = this.isDark() ? 'حالت روز' : 'حالت شب';
        
        return `
            <button 
                class="theme-toggle-btn" 
                onclick="window.themeManager?.toggle()"
                title="${label}"
                aria-label="${label}"
            >
                <span class="theme-icon">${icon}</span>
            </button>
        `;
    }
}

// Create singleton instance
const themeManager = new ThemeManager();

// Export for global access
if (typeof window !== 'undefined') {
    window.themeManager = themeManager;
}

export default themeManager;
export { THEMES };
