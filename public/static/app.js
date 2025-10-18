// Titan Trading System - Frontend Application
// مجهز به هوش مصنوعی آرتمیس

class TitanApp {
    constructor() {
        this.currentUser = null;
        this.currentLanguage = 'fa';
        this.isDemo = true;
        // Module loader will be initialized in init()
        this.moduleLoader = null;
        this.init();
    }

    async init() {
        // Initialize module loader first
        await this.initializeModuleLoader();

        // Check for existing session
        let token = localStorage.getItem('titan_auth_token');


        if (token) {
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await this.verifyToken(token);
        } else {
            this.showLoginScreen();
        }

        // Setup event listeners with a delay to ensure DOM is ready
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);

        this.loadSavedTheme();
    }

    async initializeModuleLoader() {
        try {
            // Wait for moduleLoader to be available
            if (typeof window.ModuleLoader !== 'undefined') {
                this.moduleLoader = new window.ModuleLoader();
                console.log('✅ Module loader initialized successfully');
            } else {
                console.warn('⚠️ ModuleLoader not found, modules will not work');
                this.moduleLoader = null;
            }
        } catch (error) {
            console.error('❌ Failed to initialize module loader:', error);
            this.moduleLoader = null;
        }
    }
    
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('themeSettings');
            if (savedTheme) {
                const themeData = JSON.parse(savedTheme);
                this.applyTheme(themeData);
            }
        } catch (error) {
            console.log('No saved theme found, using default');
        }
    }

    setupEventListeners() {
        // Login form - Multiple ways to ensure it works
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        
        console.log('Setting up login form listener, form found:', !!loginForm);
        console.log('Login button found:', !!loginBtn);
        
        if (loginForm) {
            // Method 1: Form submit event
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted via form event!');
                this.handleLogin(e);
            });
        }
        
        if (loginBtn) {
            // Method 2: Button click event (backup)
            loginBtn.addEventListener('click', (e) => {
                const form = document.getElementById('loginForm');
                if (form) {
                    e.preventDefault();
                    console.log('Login button clicked directly!');
                    this.handleLogin(e);
                }
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const modeSelector = document.getElementById('mode-selector');
            const modeToggle = document.getElementById('mode-toggle');
            const alertsPanel = document.getElementById('alerts-panel');
            const alertsButton = e.target.closest('button[onclick="app.toggleAlertsPanel()"]');
            const modeButton = e.target.closest('#mode-toggle');
    
            // Close mode selector if clicking outside
            if (modeSelector && !modeSelector.classList.contains('hidden') && !modeButton) {
                modeSelector.classList.add('hidden');
            }
    
            // Close alerts panel if clicking outside
            if (alertsPanel && !alertsPanel.classList.contains('hidden') && !alertsButton) {
                alertsPanel.classList.add('hidden');
            }
        });
    }

    async handleLogin(e) {
        console.log('handleLogin called with event:', e);
        e.preventDefault();

        const usernameOrEmail = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log('Login attempt:', { username: usernameOrEmail, hasPassword: !!password });

        if (!usernameOrEmail || !password) {
            this.showAlert('لطفاً نام کاربری و رمز عبور را وارد کنید', 'error');
            return;
        }

        try {
            // Check if input looks like an email
            const isEmail = usernameOrEmail.includes('@');
            const loginData = {
                password
            };
    
            // Send as email or username based on format
            if (isEmail) {
                loginData.email = usernameOrEmail;
            } else {
                loginData.username = usernameOrEmail;
            }

            const response = await axios.post('/api/auth/login', loginData);

            if (response.data.success) {
                // Fix: Use accessToken instead of token
                const token = response.data.data.token;
                localStorage.setItem('titan_auth_token', token);
        
                // Set axios default header for authenticated requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
                this.currentUser = response.data.data.user;
                this.showMainApp();
        
                this.showAlert('ورود موفقیت‌آمیز', 'success');
            } else {
                this.showAlert(response.data.error || 'خطا در ورود', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('خطا در ورود به سیستم', 'error');
        }
    }

    async verifyToken(token) {
        try {
            const response = await axios.post('/api/auth/verify', { token });
    
            if (response.data.success) {
                this.currentUser = response.data.data.user;
                this.showMainApp();
            } else {
                localStorage.removeItem('titan_auth_token');
                this.showLoginScreen();
            }
        } catch (error) {
            localStorage.removeItem('titan_auth_token');
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');

        // Dispatch logout event for floating sidebar
        document.dispatchEvent(new CustomEvent('user-logged-out'));
    }

    logout() {
        // Clear user data
        localStorage.removeItem('titan_auth_token');
        this.currentUser = null;

        // Show login screen
        this.showLoginScreen();

        // Show logout alert
        this.showAlert('خروج موفقیت‌آمیز', 'info');
    }

    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');

        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');

        // Dispatch login event for floating sidebar
        document.dispatchEvent(new CustomEvent('user-logged-in'));

        // Simplified approach: Load navigation and then trigger dashboard module
        this.loadDashboardModule();

        // Auto-click dashboard menu item to load comprehensive dashboard
        setTimeout(() => {
            const dashboardLink = document.querySelector('a[onclick*="loadModule(\'dashboard\')"]');
            if (dashboardLink) {
                console.log('🚀 Auto-clicking dashboard menu to load comprehensive dashboard...');
                dashboardLink.click();
            } else {
                console.warn('⚠️ Dashboard link not found, calling loadModule directly');
                this.loadModule('dashboard');
            }
        }, 500);

        // Floating buttons already exist in HTML, no need to create

        // Initialize in-app notifications
        this.initInAppNotifications();

        // Initialize trading mode toggle
        this.initializeModeToggle();
    }

    /**
     * Load dashboard script directly without module loader
     */
    async loadDashboardScript() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.DashboardModule) {
                console.log('✅ Dashboard module already loaded');
                resolve();
                return;
            }
    
            // Create script element
            const script = document.createElement('script');
            script.src = `/static/modules/dashboard.js?v=${Date.now()}`;
            script.async = true;
    
            script.onload = () => {
                console.log('✅ Dashboard script loaded successfully');
                // Wait a bit for class to be registered
                setTimeout(() => {
                    if (window.DashboardModule) {
                        resolve();
                    } else {
                        reject(new Error('DashboardModule class not found after script load'));
                    }
                }, 100);
            };
    
            script.onerror = () => {
                console.error('❌ Failed to load dashboard script');
                reject(new Error('Failed to load dashboard script'));
            };
    
            document.head.appendChild(script);
        });
    }

    initializeChatbotAfterLogin() {
        // Initialize chatbot and system status after successful login
        // Small delay to ensure DOM transitions are complete
        setTimeout(() => {
            if (typeof window.initializeChatbotIfNeeded === 'function') {
                const initialized = window.initializeChatbotIfNeeded();
                if (initialized) {
                    console.log('✅ Chatbot and system status initialized after login');
                } else {
                    console.log('ℹ️ Chatbot initialization not needed or already exists');
                }
            } else {
                console.warn('⚠️ Chatbot initialization function not available yet - will try direct initialization');
                // Fallback: try direct initialization
                if (typeof ArtemisAIChatbot !== 'undefined' && !window.artemisAI) {
                    window.artemisAI = new ArtemisAIChatbot();
                    console.log('✅ Chatbot initialized via fallback method');
                }
            }
        }, 1000); // Increased delay to ensure DOM is fully ready
    }

    async loadDashboardModule() {
        const app = document.getElementById('app');
        app.innerHTML = this.getDashboardHTML();

        // Wait for DOM to be ready, then load comprehensive dashboard using module loader
        setTimeout(async () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent && window.moduleLoader) {
                try {
                    // Load dashboard module properly
                    const dashboardModule = await window.moduleLoader.loadModule('dashboard');
            
                    if (dashboardModule && typeof dashboardModule.getContent === 'function') {
                        // Get comprehensive dashboard content
                        const dashboardContent = await dashboardModule.getContent();
                        mainContent.innerHTML = dashboardContent;
                
                        // Initialize the dashboard module
                        await dashboardModule.initialize();
                
                        // Set global instance for onclick handlers
                        window.dashboardModule = dashboardModule;
                
                        console.log('✅ Comprehensive Dashboard loaded and initialized successfully');
                    } else {
                        console.error('❌ Dashboard module not loaded properly');
                        mainContent.innerHTML = '<div class="text-center text-red-400 p-8">خطا در بارگذاری داشبورد</div>';
                    }
                } catch (error) {
                    console.error('❌ Error loading dashboard module:', error);
                    mainContent.innerHTML = '<div class="text-center text-red-400 p-8">خطا در بارگذاری ماژول داشبورد</div>';
                }
            } else {
                console.error('❌ Main content element or module loader not found');
            }
        }, 500); // Increased delay to ensure all modules are loaded

        this.setupDashboardEvents();
    }

        // getDashboardContent removed - using modular dashboard.js

        // getTradingContent removed - using modular trading.js

        // getPortfolioContent removed - using modular portfolio.js

        // getAnalyticsContent removed - using modular analytics.js

        // getWatchlistContent removed - using modular watchlist.js

        // getArtemisContent removed - using modular artemis.js

        // getNewsContent removed - using modular news.js

        // getAlertsContent removed - using modular alerts.js

        // getSettingsContent removed - using modular settings.js

    getDashboardHTML() {
        return `
        <!-- Navigation -->
        <nav class="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo and Brand -->
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="logo-container flex items-center space-x-2 space-x-reverse">
                                <div class="text-3xl">🚀</div>
                                <div class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                    تایتان
                                </div>
                            </div>
                        </div>
                
                        <!-- Desktop Navigation Menu -->
                        <div class="hidden lg:block">
                            <div class="mr-8 flex items-center space-x-1 space-x-reverse">
                                <a href="#" onclick="app.loadModule('dashboard')" class="nav-link active">
                                    <i class="fas fa-tachometer-alt ml-1"></i>
                                    داشبورد
                                </a>
                                <a href="#" onclick="app.loadModule('watchlist')" class="nav-link">
                                    <i class="fas fa-heart ml-1"></i>
                                    مورد علاقه
                                </a>
                                <a href="#" onclick="app.loadModule('trading')" class="nav-link">
                                    <i class="fas fa-chart-line ml-1"></i>
                                    معاملات
                                </a>
                                <a href="#" onclick="app.loadModule('portfolio')" class="nav-link">
                                    <i class="fas fa-briefcase ml-1"></i>
                                    پورتفولیو
                                </a>
                                <a href="#" onclick="app.loadModule('analytics')" class="nav-link">
                                    <i class="fas fa-chart-bar ml-1"></i>
                                    تحلیل
                                </a>
                                <a href="#" onclick="app.loadModule('artemis')" class="nav-link">
                                    <i class="fas fa-brain ml-1 text-purple-400"></i>
                                    آرتمیس AI
                                </a>

                        
                                <!-- More Menu Dropdown -->
                                <div class="relative">
                                    <button onclick="app.toggleMoreMenu()" class="nav-link flex items-center" id="more-menu-btn">
                                        <i class="fas fa-ellipsis-h ml-1"></i>
                                        بیشتر
                                        <i class="fas fa-chevron-down mr-1 text-xs"></i>
                                    </button>
                                    <div id="more-menu" class="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 hidden">
                                        <div class="py-2">

                                            <a href="#" onclick="app.loadModule('news')" class="nav-dropdown-link">
                                                <i class="fas fa-newspaper text-green-400"></i>
                                                اخبار بازار
                                            </a>
                                            <a href="#" onclick="app.loadModule('alerts')" class="nav-dropdown-link">
                                                <i class="fas fa-bell text-yellow-400"></i>
                                                هشدارها
                                            </a>
                                            <a href="#" onclick="app.loadModule('settings')" class="nav-dropdown-link">
                                                <i class="fas fa-cog text-gray-400"></i>
                                                تنظیمات
                                            </a>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                
                        <!-- Mobile Menu Button -->
                        <div class="lg:hidden mr-4">
                            <button onclick="app.toggleMobileMenu()" class="text-gray-300 hover:text-white p-2 rounded-md" id="mobile-menu-btn">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                        </div>
                    </div>
                    <!-- Right Side Items -->
                    <div class="flex items-center">
                        <div class="flex items-center space-x-3 space-x-reverse">
                            <!-- Quick Stats (Desktop Only) -->
                            <div class="hidden xl:flex items-center space-x-4 space-x-reverse bg-gray-700/50 rounded-lg px-3 py-2">
                                <div class="text-center">
                                    <div class="text-xs text-gray-400">موجودی کل</div>
                                    <div id="header-total-balance" class="text-sm font-semibold text-white">$0</div>
                                </div>
                                <div class="w-px h-8 bg-gray-600"></div>
                                <div class="text-center">
                                    <div class="text-xs text-gray-400">سود امروز</div>
                                    <div id="header-daily-profit" class="text-sm font-semibold text-green-400">+$0</div>
                                </div>
                            </div>
                    
                            <!-- Alerts Button -->
                            <div class="relative">
                                <button onclick="app.toggleAlertsPanel()" class="relative p-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 group">
                                    <i class="fas fa-bell text-lg group-hover:animate-pulse"></i>
                                    <span id="alerts-badge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden animate-bounce">0</span>
                                </button>
                        
                                <!-- Alerts Dropdown Panel -->
                                <div id="alerts-panel" class="absolute left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 hidden">
                                    <div class="px-4 py-3 border-b border-gray-700">
                                        <div class="flex items-center justify-between">
                                            <h3 class="text-sm font-semibold text-white">هشدارها و اطلاعیه‌ها</h3>
                                            <button onclick="app.markAllAlertsRead()" class="text-xs text-blue-400 hover:text-blue-300">
                                                همه را خوانده علامت بزن
                                            </button>
                                        </div>
                                    </div>
                                    <div id="alerts-list" class="max-h-96 overflow-y-auto">
                                        <!-- Alerts will be loaded here -->
                                    </div>
                                    <div class="px-4 py-3 border-t border-gray-700 text-center">
                                        <button onclick="app.loadModule('alerts')" class="text-sm text-blue-400 hover:text-blue-300">
                                            مشاهده همه هشدارها
                                        </button>
                                    </div>
                                </div>
                            </div>
                    
                            <!-- Demo/Live Mode Toggle -->
                            <div class="hidden sm:flex items-center">
                                <div id="mode-toggle" class="relative">
                                    <button onclick="app.toggleModeSelector()" 
                                            class="flex items-center px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:shadow-lg group"
                                            id="mode-toggle-btn">
                                        <span id="mode-indicator" class="w-3 h-3 rounded-full ml-2 animate-pulse"></span>
                                        <span id="mode-text" class="text-sm font-semibold">حالت دمو</span>
                                        <i class="fas fa-chevron-down mr-2 text-xs group-hover:rotate-180 transition-transform duration-200"></i>
                                    </button>
                            
                                    <!-- Mode Selector Dropdown -->
                                    <div id="mode-selector" class="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 hidden">
                                        <div class="px-4 py-3 border-b border-gray-700">
                                            <h3 class="text-sm font-semibold text-white">انتخاب حالت معاملات</h3>
                                        </div>
                                
                                        <div class="p-2">
                                            <!-- Demo Mode Option -->
                                            <button onclick="app.switchTradingMode('demo')" 
                                                    class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                                    id="demo-mode-option">
                                                <div class="flex items-center">
                                                    <div class="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                                                    <div class="text-left">
                                                        <div class="text-sm font-medium text-white">حالت دمو</div>
                                                        <div class="text-xs text-gray-400">معاملات آزمایشی با کیف پول مجازی</div>
                                                    </div>
                                                </div>
                                                <div class="text-orange-400">
                                                    <i class="fas fa-check hidden demo-selected"></i>
                                                </div>
                                            </button>
                                    
                                            <!-- Live Mode Option -->
                                            <button onclick="app.switchTradingMode('live')" 
                                                    class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                                    id="live-mode-option">
                                                <div class="flex items-center">
                                                    <div class="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                                    <div class="text-left">
                                                        <div class="text-sm font-medium text-white">حالت واقعی</div>
                                                        <div class="text-xs text-gray-400">معاملات واقعی با پول حقیقی</div>
                                                    </div>
                                                </div>
                                                <div class="text-red-500">
                                                    <i class="fas fa-check hidden live-selected"></i>
                                                </div>
                                            </button>
                                        </div>
                                
                                        <div class="px-4 py-3 border-t border-gray-700">
                                            <div class="flex items-center justify-between text-xs">
                                                <span class="text-gray-400">موجودی دمو:</span>
                                                <span class="text-orange-400" id="demo-balance">$10,000</span>
                                            </div>
                                            <button onclick="app.manageDemoWallet()" 
                                                    class="w-full mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors">
                                                مدیریت کیف پول دمو
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    
                            <!-- User Profile -->
                            <div class="relative">
                                <button onclick="app.showUserProfile()" 
                                        class="flex items-center space-x-2 space-x-reverse bg-gray-700/70 hover:bg-gray-600 px-3 py-2 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-500/30"
                                        id="user-profile-btn">
                                    <img id="user-avatar" 
                                         src="https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser?.username || 'کاربر')}&background=3B82F6&color=ffffff&size=36" 
                                         alt="Profile" 
                                         class="w-9 h-9 rounded-full border-2 border-blue-500 group-hover:border-blue-400 transition-all duration-200 group-hover:scale-105">
                                    <div class="text-right hidden sm:block">
                                        <div class="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">${this.currentUser?.username || 'کاربر'}</div>
                                        <div class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">پروفایل کاربری</div>
                                    </div>
                                    <i class="fas fa-chevron-down text-gray-400 group-hover:text-white transition-all duration-200 group-hover:rotate-180"></i>
                                </button>
                            </div>
                    
                            <!-- Logout Button -->
                            <button onclick="app.logout()" class="bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hidden sm:block">
                                <i class="fas fa-sign-out-alt ml-1"></i>
                                خروج
                            </button>
                    
                            <!-- Mobile Actions Menu -->
                            <div class="sm:hidden">
                                <button onclick="app.toggleMobileActions()" class="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
        </nav>

        <!-- Mobile Menu Overlay -->
        <div id="mobile-menu-overlay" class="mobile-menu-overlay lg:hidden"></div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="lg:hidden">
            <!-- Mobile Menu Header -->
            <div class="mobile-menu-header">
                <div class="flex items-center space-x-2 space-x-reverse">
                    <div class="text-2xl">🚀</div>
                    <div class="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        تایتان
                    </div>
                </div>
                <button onclick="app.closeMobileMenu()" class="text-gray-300 hover:text-white p-2 rounded-md">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
    
            <!-- Mobile Menu Content -->
            <div class="overflow-y-auto h-full pb-20">
                <!-- Main Navigation Links -->
                <div class="py-2">
                    <a href="#" onclick="app.loadModule('dashboard'); app.closeMobileMenu();" class="mobile-nav-link active">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>داشبورد</span>
                    </a>
                    <a href="#" onclick="app.loadModule('watchlist'); app.closeMobileMenu();" class="mobile-nav-link">
                        <i class="fas fa-heart"></i>
                        <span>مورد علاقه</span>
                    </a>
                    <a href="#" onclick="app.loadModule('trading'); app.closeMobileMenu();" class="mobile-nav-link">
                        <i class="fas fa-chart-line"></i>
                        <span>معاملات</span>
                    </a>
                    <a href="#" onclick="app.loadModule('portfolio'); app.closeMobileMenu();" class="mobile-nav-link">
                        <i class="fas fa-briefcase"></i>
                        <span>پورتفولیو</span>
                    </a>
                    <a href="#" onclick="app.loadModule('analytics'); app.closeMobileMenu();" class="mobile-nav-link">
                        <i class="fas fa-chart-bar"></i>
                        <span>تحلیل</span>
                    </a>
                </div>
        
                <!-- Secondary Links -->
                <div class="py-2">
                    <a href="#" onclick="app.loadModule('artemis'); app.closeMobileMenu();" class="mobile-nav-link">
                        <i class="fas fa-robot text-purple-400"></i>
                        <span>آرتمیس AI</span>
                    </a>
                    </a>
                    <a href="#" onclick="app.loadModule('alerts'); app.closeMobileMenu();" class="mobile-nav-link">
                        <i class="fas fa-bell text-yellow-400"></i>
                        <span>هشدارها</span>
                    </a>
                    <a href="#" onclick="app.loadModule('settings'); app.closeMobileMenu();" class="mobile-nav-link">
                        <i class="fas fa-cog text-gray-400"></i>
                        <span>تنظیمات</span>
                    </a>

                </div>
        
                <!-- Mode Toggle (Mobile) -->
                <div class="px-6 py-4 border-t border-gray-700">
                    <div class="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl backdrop-blur-sm">
                        <div class="flex items-center">
                            <span id="mobile-mode-indicator" class="w-3 h-3 rounded-full ml-3 animate-pulse bg-green-400"></span>
                            <span id="mobile-mode-text" class="text-sm font-medium text-white">حالت دمو</span>
                        </div>
                        <button onclick="app.toggleModeSelector()" class="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-400/10 transition-all">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>
                </div>
        
                <!-- Quick Stats Mobile -->
                <div class="px-6 py-2">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-700/30 rounded-lg p-3 text-center">
                            <div class="text-xs text-gray-400">موجودی کل</div>
                            <div id="mobile-total-balance" class="text-sm font-semibold text-white">$0</div>
                        </div>
                        <div class="bg-gray-700/30 rounded-lg p-3 text-center">
                            <div class="text-xs text-gray-400">سود امروز</div>
                            <div id="mobile-daily-profit" class="text-sm font-semibold text-green-400">+$0</div>
                        </div>
                    </div>
                </div>
        
                <!-- Logout (Mobile) -->
                <div class="px-6 py-4">
                    <button onclick="app.logout(); app.closeMobileMenu();" class="w-full flex items-center justify-center p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-medium transition-all transform hover:scale-105">
                        <i class="fas fa-sign-out-alt ml-2"></i>
                        خروج از حساب
                    </button>
                </div>
            </div>
        </div>
        </nav>

        <!-- Artemis Status Bar -->
        <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-2 px-4">
            <div class="max-w-7xl mx-auto">
                <!-- Desktop Status Bar -->
                <div class="hidden md:flex items-center justify-between text-white text-sm">
                    <div class="flex items-center space-x-6 space-x-reverse">
                        <div class="flex items-center bg-white/10 rounded-full px-3 py-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                            <span class="font-medium">آرتمیس فعال</span>
                        </div>
                        <div id="artemis-status" class="flex items-center">
                            <i class="fas fa-robot ml-1"></i>
                            <span>اتصال...</span>
                        </div>
                        <div id="ai-agents-status" class="flex items-center cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-all" onclick="app.openAIManagement()">
                            <i class="fas fa-brain ml-1 text-purple-300"></i>
                            <span id="header-ai-count">AI: 15</span>
                            <span class="text-xs text-purple-300 ml-1" id="header-ai-performance">(87%)</span>
                        </div>
                        <div id="active-trades" class="flex items-center">
                            <i class="fas fa-chart-line ml-1"></i>
                            <span>معاملات فعال: 0</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 space-x-reverse">
                        <div id="total-balance" class="flex items-center bg-white/10 rounded-full px-3 py-1">
                            <i class="fas fa-wallet ml-1"></i>
                            <span class="font-semibold">موجودی: $0</span>
                        </div>
                        <div id="daily-profit" class="flex items-center text-green-300 font-medium">
                            <i class="fas fa-chart-line ml-1"></i>
                            <span>سود امروز: +$0</span>
                        </div>
                    </div>
                </div>
        
                <!-- Mobile Status Bar -->
                <div class="md:hidden flex items-center justify-between text-white text-xs">
                    <div class="flex items-center space-x-3 space-x-reverse">
                        <div class="flex items-center">
                            <div class="w-1.5 h-1.5 bg-green-400 rounded-full ml-1 animate-pulse"></div>
                            <span>آرتمیس</span>
                        </div>
                        <div class="flex items-center cursor-pointer" onclick="app.openAIManagement()">
                            <i class="fas fa-brain text-purple-300 text-xs ml-1"></i>    
                            <span id="mobile-ai-count">AI:15</span>
                        </div>
                        <div id="mobile-active-trades">معاملات: 0</div>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <div id="mobile-total-balance" class="font-semibold">$0</div>
                        <div id="mobile-daily-profit" class="text-green-300">+$0</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div id="main-content" class="md:min-h-0">
                <!-- Dashboard content will be loaded here -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Total Balance Card -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm">موجودی کل</p>
                                <p id="total-balance-card" class="text-2xl font-bold text-white">$125,000</p>
                                <p id="balance-change" class="text-green-400 text-sm">+2.3% امروز</p>
                            </div>
                            <div class="text-green-400 text-3xl">💰</div>
                        </div>
                    </div>

                    <!-- Active Trades Card -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm">معاملات فعال</p>
                                <p id="active-trades-card" class="text-2xl font-bold text-white">8</p>
                                <p class="text-blue-400 text-sm">نرخ موفقیت: 75%</p>
                            </div>
                            <div class="text-blue-400 text-3xl">📈</div>
                        </div>
                    </div>

                    <!-- Artemis Status Card -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm">وضعیت آرتمیس</p>
                                <p class="text-2xl font-bold text-white">85%</p>
                                <p class="text-purple-400 text-sm">اعتماد بالا</p>
                            </div>
                            <div class="text-purple-400 text-3xl">🧠</div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Portfolio Chart -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-lg font-semibold text-white mb-4">نمودار پورتفولیو</h3>
                        <canvas id="portfolioChart" width="400" height="200"></canvas>
                    </div>

                    <!-- Recent Activities -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-lg font-semibold text-white mb-4">فعالیت‌های اخیر</h3>
                        <div id="recent-activities" class="space-y-3">
                            <!-- Activities will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Artemis AI Chatbot (Real Implementation) -->
        <div id="chat-assistant" class="fixed bottom-4 right-4 w-96 bg-gradient-to-b from-purple-600 to-blue-700 rounded-xl shadow-2xl border border-purple-500/30 hidden z-50">
            <!-- Header -->
            <div class="p-4 border-b border-white/10">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-robot text-purple-600"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-semibold">آرتمیس AI</h4>
                            <div class="flex items-center">
                                <div class="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                <span class="text-white/80 text-xs">آنلاین و آماده کمک</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="app.minimizeChat()" class="text-white/60 hover:text-white text-sm">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button onclick="app.toggleChatAssistant()" class="text-white/60 hover:text-white text-sm">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
    
            <!-- Chat Messages -->
            <div id="chat-messages" class="h-80 p-4 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
                <div class="mb-4">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div class="bg-gray-700/80 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                            <p class="text-white text-sm">سلام! من آرتمیس، دستیار هوشمند شما هستم.</p>
                            <p class="text-white/80 text-xs mt-2">
                                می‌توانم کمکتان کنم در:
                                <br>📊 مدیریت پورتفولیو
                                <br>📈 تحلیل بازار و معاملات  
                                <br>⚙️ تنظیمات سیستم
                                <br>🤖 وظایف اتوماسیون
                            </p>
                            <div class="text-xs text-white/60 mt-2">13:45</div>
                        </div>
                    </div>
                </div>
        
                <div class="mb-4">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div class="bg-gray-700/80 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                            <p class="text-white text-sm">چه کاری برایتان انجام دهم؟</p>
                            <div class="mt-2 text-xs text-white/70">
                                💡 می‌توانم کمک‌تان کنم در:
                                <br>🎯 مدیریت پورتفولیو
                                <br>🧠 تحلیل بازار و معاملات
                                <br>⚙️ تنظیمات سیستم
                                <br>🔧 اتوماسیون و تسک‌ها
                            </div>
                            <div class="text-xs text-white/60 mt-2">13:45</div>
                        </div>
                    </div>
                </div>
            </div>
    
            <!-- Quick Actions -->
            <div class="px-4 py-2 border-t border-white/10">
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <button onclick="app.artemisQuickAction('portfolio')" 
                            class="bg-gray-700/60 hover:bg-gray-600/60 text-white text-xs py-2 px-3 rounded-md transition-all">
                        وضعیت پورتفولیو
                    </button>
                    <button onclick="app.artemisQuickAction('opportunities')" 
                            class="bg-gray-700/60 hover:bg-gray-600/60 text-white text-xs py-2 px-3 rounded-md transition-all">
                        فرصت‌های معاملاتی
                    </button>
                    <button onclick="app.artemisQuickAction('automation')" 
                            class="bg-gray-700/60 hover:bg-gray-600/60 text-white text-xs py-2 px-3 rounded-md transition-all">
                        تنظیم اتوماسیون
                    </button>
                    <button onclick="app.artemisQuickAction('report')" 
                            class="bg-gray-700/60 hover:bg-gray-600/60 text-white text-xs py-2 px-3 rounded-md transition-all">
                        گزارش سود
                    </button>
                </div>
            </div>
    
            <!-- Input Area -->
            <div class="p-4 border-t border-white/10">
                <div class="flex items-center gap-2">
                    <input type="text" id="chat-input" 
                           placeholder="پیام خود را بنویسید..." 
                           class="flex-1 bg-gray-700/60 text-white text-sm px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           onkeypress="if(event.key==='Enter') app.sendArtemisMessage()">
                    <button onclick="app.toggleVoiceInput()" 
                            class="w-8 h-8 bg-gray-700/60 hover:bg-gray-600/60 text-white rounded-lg flex items-center justify-center transition-all">
                        <i class="fas fa-microphone text-sm"></i>
                    </button>
                    <button onclick="app.sendArtemisMessage()" 
                            class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center transition-all">
                        <i class="fas fa-paper-plane text-sm"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Floating Action Buttons -->
        <div id="floating-buttons" class="fixed bottom-20 right-4 flex flex-col gap-3 z-30 transition-all duration-300">
            <!-- Artemis Chatbot Button -->
            <button id="chatbot-toggle" 
                    onclick="app.toggleChatAssistant()" 
                    class="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                    title="چت با آرتمیس">
                <i class="fas fa-robot text-xl group-hover:animate-bounce"></i>
            </button>
    
            <!-- System Status Button -->
            <button id="system-status-toggle" 
                    onclick="app.toggleSystemStatus()" 
                    class="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                    title="وضعیت سیستم">
                <i class="fas fa-heartbeat text-xl group-hover:animate-pulse"></i>
            </button>
        </div>

        <!-- System Status Panel (Real Implementation) -->
        <div id="system-status-panel" class="fixed bottom-4 left-4 w-96 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-600/50 hidden z-50">
            <!-- Header -->
            <div class="p-4 border-b border-gray-700/50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="text-green-400 text-lg mr-2">🟢</div>
                        <h4 class="text-white font-semibold">وضعیت سیستم</h4>
                    </div>
                    <button onclick="app.toggleSystemStatus()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mt-2">
                    <span class="text-green-400 text-sm font-medium">وضعیت کل: آنلاین</span>
                </div>
            </div>
    
            <!-- Performance Metrics -->
            <div class="p-4 border-b border-gray-700/50">
                <h5 class="text-white text-sm font-medium mb-3">متریک‌های عملکرد:</h5>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">CPU</span>
                        <div class="flex items-center gap-2">
                            <div class="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div id="cpu-bar" class="h-full bg-blue-500 transition-all duration-300" style="width: 0%"></div>
                            </div>
                            <span id="cpu-percent" class="text-white text-xs w-8">0%</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">حافظه</span>
                        <div class="flex items-center gap-2">
                            <div class="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div id="memory-bar" class="h-full bg-green-500 transition-all duration-300" style="width: 0%"></div>
                            </div>
                            <span id="memory-percent" class="text-white text-xs w-8">0%</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">شبکه</span>
                        <div class="flex items-center gap-2">
                            <div class="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div id="network-bar" class="h-full bg-purple-500 transition-all duration-300" style="width: 0%"></div>
                            </div>
                            <span id="network-percent" class="text-white text-xs w-8">0%</span>
                        </div>
                    </div>
                </div>
            </div>
    
            <!-- Component Status -->
            <div class="p-4 border-b border-gray-700/50">
                <h5 class="text-white text-sm font-medium mb-3">وضعیت اجزاء:</h5>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">مغز AI</span>
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-green-400 text-xs">آنلاین</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">آرتمیس پیشرفته</span>
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-green-400 text-xs">آنلاین</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">موتور معاملات</span>
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-green-400 text-xs">آنلاین</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">جریان داده‌ها</span>
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-green-400 text-xs">آنلاین</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">همگام‌سازی اطلاعات</span>
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-green-400 text-xs">آنلاین</span>
                        </div>
                    </div>
                </div>
            </div>
    
            <!-- Current Activity -->
            <div class="p-4">
                <h5 class="text-white text-sm font-medium mb-3">فعالیت جاری:</h5>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-pink-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <span class="text-white text-xs font-medium">مغز AI</span>
                                <span class="text-green-400 text-xs">فعال</span>
                            </div>
                            <p class="text-gray-400 text-xs">تولید پیش‌بینی‌ها</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <span class="text-white text-xs font-medium">موتور معاملات</span>
                                <span class="text-green-400 text-xs">فعال</span>
                            </div>
                            <p class="text-gray-400 text-xs">اجرای استراتژی DCA</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <span class="text-white text-xs font-medium">جریان داده‌ها</span>
                                <span class="text-gray-400 text-xs">تکمیل</span>
                            </div>
                            <p class="text-gray-400 text-xs">آپدیت داده‌های بازار</p>
                        </div>
                    </div>
                </div>
                <div class="mt-4 pt-3 border-t border-gray-700/50">
                    <div class="text-center text-xs text-gray-400">
                        آخرین بروزرسانی: <span id="status-last-update">1403/06/30 - 14:25</span>
                    </div>
                </div>
            </div>
        </div>


        `;
    }

        // loadDashboardData removed - using modular dashboard.js

    updateDashboardStats(data) {
        // Update Artemis status bar
        document.getElementById('artemis-status').textContent = `اعتماد: ${data.artemisStatus.confidence}%`;
        document.getElementById('active-trades').textContent = `معاملات فعال: ${data.activeTrades.total}`;
        document.getElementById('total-balance').textContent = `موجودی: $${data.totalBalance.usd.toLocaleString()}`;
        document.getElementById('daily-profit').textContent = `سود امروز: +$${data.todayStats.profit_made.toLocaleString()}`;

        // Update cards
        document.getElementById('total-balance-card').textContent = `$${data.totalBalance.usd.toLocaleString()}`;
        document.getElementById('balance-change').textContent = `+${data.totalBalance.change24h}% امروز`;
        document.getElementById('active-trades-card').textContent = data.activeTrades.total;

        // Update AI status in header
        this.updateAIStatus();
    }

    renderPortfolioChart(data) {
        const ctx = document.getElementById('portfolioChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.symbol),
                datasets: [{
                    data: data.map(item => item.percentage),
                    backgroundColor: data.map(item => item.color),
                    borderWidth: 2,
                    borderColor: '#374151'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    renderRecentActivities(activities) {
        const container = document.getElementById('recent-activities');
        container.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div class="flex items-center">
                    <div class="text-lg mr-3">\${this.getActivityIcon(activity.type)}</div>
                    <div>
                        <p class="text-white text-sm font-medium">\${activity.title}</p>
                        <p class="text-gray-400 text-xs">\${activity.time}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-green-400 text-sm font-medium">\${activity.profit || activity.amount}</p>
                    ${activity.confidence ? `<p class="text-gray-400 text-xs">اعتماد: ${activity.confidence}%</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'trade_buy': '📈',
            'trade_sell': '📉', 
            'prediction': '🔮',
            'news_analysis': '📰',
            'system_update': '⚙️'
        };
        return icons[type] || '📊';
    }

    setupDashboardEvents() {
        // Setup navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Setup chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }





    /**
     * Toggle chat assistant visibility
     */
    toggleChatAssistant() {
        const chatAssistant = document.getElementById('chat-assistant');
        const systemStatus = document.getElementById('system-status-panel');
        const floatingButtons = document.getElementById('floating-buttons');

        if (chatAssistant) {
            chatAssistant.classList.toggle('hidden');
    
            // Hide system status if it's open
            if (systemStatus && !systemStatus.classList.contains('hidden')) {
                systemStatus.classList.add('hidden');
            }
    
            // Move floating buttons to avoid overlap
            if (floatingButtons) {
                if (!chatAssistant.classList.contains('hidden')) {
                    // Chat is open - move buttons to left side
                    floatingButtons.classList.remove('right-4');
                    floatingButtons.classList.add('left-4');
                } else {
                    // Chat is closed - move buttons back to right
                    floatingButtons.classList.remove('left-4');
                    floatingButtons.classList.add('right-4');
                }
            }
    
            // Focus on input when opened
            if (!chatAssistant.classList.contains('hidden')) {
                setTimeout(() => {
                    const input = document.getElementById('chat-input');
                    if (input) input.focus();
                }, 100);
            }
        }
    }

    /**
     * Toggle system status panel visibility and load real-time data
     */
    toggleSystemStatus() {
        const systemStatus = document.getElementById('system-status-panel');
        const chatAssistant = document.getElementById('chat-assistant');
        const floatingButtons = document.getElementById('floating-buttons');

        if (systemStatus) {
            systemStatus.classList.toggle('hidden');
    
            // Hide chat assistant if it's open
            if (chatAssistant && !chatAssistant.classList.contains('hidden')) {
                chatAssistant.classList.add('hidden');
                // Reset floating buttons position when closing chat
                if (floatingButtons) {
                    floatingButtons.classList.remove('left-4');
                    floatingButtons.classList.add('right-4');
                }
            }
    
            // Load real-time system data when opened
            if (!systemStatus.classList.contains('hidden')) {
                this.loadSystemMetrics();
                this.startSystemMetricsUpdate();
            } else {
                this.stopSystemMetricsUpdate();
            }
        }
    }

    /**
     * Load real-time system metrics from backend
     */
    async loadSystemMetrics() {
        try {
            const token = localStorage.getItem('titan_auth_token');
            if (!token) return;

            const response = await fetch('/api/system/metrics', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateSystemMetricsUI(data);
            } else {
                // Use simulated data if API is not available
                this.updateSystemMetricsUI(this.getSimulatedMetrics());
            }
        } catch (error) {
            console.warn('System metrics API not available, using simulated data:', error);
            this.updateSystemMetricsUI(this.getSimulatedMetrics());
        }
    }

    /**
     * Update system metrics UI
     */
    updateSystemMetricsUI(data) {
        // Update CPU
        const cpuBar = document.getElementById('cpu-bar');
        const cpuPercent = document.getElementById('cpu-percent');
        if (cpuBar && cpuPercent) {
            cpuBar.style.width = `${data.cpu}%`;
            cpuPercent.textContent = `${data.cpu}%`;
        }

        // Update Memory
        const memoryBar = document.getElementById('memory-bar');
        const memoryPercent = document.getElementById('memory-percent');
        if (memoryBar && memoryPercent) {
            memoryBar.style.width = `${data.memory}%`;
            memoryPercent.textContent = `${data.memory}%`;
        }

        // Update Network
        const networkBar = document.getElementById('network-bar');
        const networkPercent = document.getElementById('network-percent');
        if (networkBar && networkPercent) {
            networkBar.style.width = `${data.network}%`;
            networkPercent.textContent = `${data.network}%`;
        }

        // Update real-time activities
        this.updateSystemActivities(data.activities || []);

        // Update timestamp
        const statusUpdate = document.getElementById('status-last-update');
        if (statusUpdate) {
            statusUpdate.textContent = data.lastUpdate || new Date().toLocaleString('fa-IR');
        }
    }

    /**
     * Update system activities in real-time
     */
    updateSystemActivities(activities) {
        const activitiesContainer = document.querySelector('#system-status-panel .space-y-3:last-child');
        if (!activitiesContainer) return;

        // Clear existing activities
        activitiesContainer.innerHTML = '';

        // Add current activities
        activities.forEach((activity, index) => {
            const statusColors = {
                'active': 'bg-green-400',
                'processing': 'bg-yellow-400', 
                'completed': 'bg-blue-400',
                'error': 'bg-red-400'
            };

            const statusTexts = {
                'active': 'فعال',
                'processing': 'در حال پردازش',
                'completed': 'تکمیل شده',
                'error': 'خطا'
            };

            const colorClass = statusColors[activity.status] || 'bg-gray-400';
            const statusText = statusTexts[activity.status] || activity.status;

            const activityElement = document.createElement('div');
            activityElement.className = 'flex items-start gap-3';
            activityElement.innerHTML = `
                <div class="w-2 h-2 ${colorClass} rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <span class="text-white text-xs font-medium">${activity.name}</span>
                        <span class="text-green-400 text-xs">${statusText}</span>
                    </div>
                    <p class="text-gray-400 text-xs">${activity.task}</p>
                    ${activity.startTime ? `<span class="text-gray-500 text-xs">شروع: ${activity.startTime}</span>` : ''}
                </div>
            `;

            activitiesContainer.appendChild(activityElement);
        });

        // Add activity counter
        const activityCounter = document.createElement('div');
        activityCounter.className = 'mt-3 pt-2 border-t border-gray-700/50 text-center';
        activityCounter.innerHTML = `
            <span class="text-xs text-gray-400">
                📊 ${activities.length} فعالیت در حال اجرا
            </span>
        `;
        activitiesContainer.appendChild(activityCounter);
    }

    /**
     * Get simulated metrics for development
     */
    getSimulatedMetrics() {
        return {
            cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
            memory: Math.floor(Math.random() * 25) + 15, // 15-40%  
            network: Math.floor(Math.random() * 20) + 5, // 5-25%
            lastUpdate: new Date().toLocaleString('fa-IR')
        };
    }

    /**
     * Start real-time metrics update
     */
    startSystemMetricsUpdate() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }

        // Update every 3 seconds
        this.metricsInterval = setInterval(() => {
            this.loadSystemMetrics();
        }, 3000);
    }

    /**
     * Stop metrics update
     */
    stopSystemMetricsUpdate() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
    }

    /**
     * Send message to Artemis AI with backend integration
     */
    async sendArtemisMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        const messagesContainer = document.getElementById('chat-messages');

        // Add user message
        this.addChatMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.addChatMessage('artemis', 'در حال پردازش...', true);

        try {
            const token = localStorage.getItem('titan_auth_token');
            const response = await fetch('/api/artemis/chat-basic', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        currentModule: this.getCurrentModule(),
                        timestamp: new Date().toISOString(),
                        userPreferences: this.getUserPreferences()
                    }
                })
            });

            // Remove typing indicator
            this.removeChatMessage('typing');

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Add Artemis response with actions
                    this.addChatMessage('artemis', data.response, false, data.actions);
            
                    // Execute any actions returned by Artemis
                    if (data.actions && data.actions.length > 0) {
                        this.executeArtemisActions(data.actions);
                    }
                } else {
                    this.addChatMessage('artemis', data.response || 'متاسفم، نتوانستم درخواست شما را پردازش کنم.');
                }
            } else {
                // Enhanced fallback response based on message content
                this.addChatMessage('artemis', this.getEnhancedArtemisResponse(message));
            }
        } catch (error) {
            console.warn('Artemis API not available, using enhanced local response:', error);
            this.removeChatMessage('typing');
            this.addChatMessage('artemis', this.getEnhancedArtemisResponse(message));
        }
    }

    /**
     * Execute actions returned by Artemis
     */
    executeArtemisActions(actions) {
        actions.forEach(action => {
            switch (action.type) {
                case 'navigate':
                    console.log('🎯 Artemis navigation:', action.target);
                    if (action.target === 'dashboard') {
                        this.loadModule('dashboard');
                    } else if (action.target === 'portfolio') {
                        this.loadModule('portfolio');
                    } else if (action.target === 'trading') {
                        this.loadModule('trading');
                    } else if (action.target === 'trading/manual') {
                        this.loadModule('trading');
                        setTimeout(() => this.loadManualTradingTab(), 1000);
                    } else if (action.target === 'trading/autopilot') {
                        this.loadModule('trading');
                        setTimeout(() => this.loadAutopilotTab(), 1000);
                    } else if (action.target === 'trading/strategies') {
                        this.loadModule('trading');
                        setTimeout(() => this.loadStrategiesTab(), 1000);
                    } else if (action.target === 'settings') {
                        this.loadModule('settings');
                    } else if (action.target === 'alerts') {
                        this.loadModule('alerts');
                    } else if (action.target === 'news') {
                        this.loadModule('news');
                    } else if (action.target === 'watchlist') {
                        this.loadModule('watchlist');
                    } else if (action.target === 'ai-management') {
                        this.loadModule('ai-management');
                    } else if (action.target === 'analytics') {
                        this.loadModule('analytics');
                    } else if (action.target === 'wallets') {
                        this.loadModule('wallets');
                    }
                    break;
        
                case 'open_tab':
                    console.log('📂 Artemis tab opening:', action.tab);
                    // Open specific tabs in modules (will implement based on module structure)
                    break;
        
                case 'show_system_status':
                    console.log('🔍 Artemis showing system status');
                    this.toggleSystemStatus();
                    break;
        
                case 'refresh_data':
                    console.log('🔄 Artemis data refresh');
                    // Refresh current module data
                    this.refreshCurrentModuleData();
                    break;
        
                default:
                    console.log('🤖 Artemis action:', action);
            }
        });
    }

    /**
     * Enhanced Artemis response system with full system control
     */
    getEnhancedArtemisResponse(message) {
        const messageText = message.toLowerCase();

        // Navigation commands
        if (messageText.includes('dashboard') || messageText.includes('داشبورد') || messageText.includes('صفحه اصلی')) {
            this.loadModule('dashboard');
            return '🏠 در حال انتقال به داشبورد...';
        }

        if (messageText.includes('portfolio') || messageText.includes('پورتفولیو') || messageText.includes('دارایی')) {
            this.loadModule('portfolio');
            return '📊 در حال بارگذاری پورتفولیو...';
        }

        if (messageText.includes('trade') || messageText.includes('معامله')) {
            if (messageText.includes('manual') || messageText.includes('دستی')) {
                this.loadModule('trading');
                setTimeout(() => this.loadManualTradingTab(), 1000);
                return '⚡ در حال انتقال به معامله دستی...';
            } else if (messageText.includes('autopilot') || messageText.includes('اتوپایلوت')) {
                this.loadModule('trading');
                setTimeout(() => this.loadAutopilotTab(), 1000);
                return '🚀 در حال انتقال به اتوپایلوت حرفه‌ای...';
            } else {
                this.loadModule('trading');
                return '📈 در حال بارگذاری بخش معاملات...';
            }
        }

        if (messageText.includes('strategies') || messageText.includes('استراتژی')) {
            this.loadModule('trading');
            setTimeout(() => this.loadStrategiesTab(), 1000);
            return '🧠 در حال بارگذاری استراتژی‌های معاملاتی...';
        }

        if (messageText.includes('settings') || messageText.includes('تنظیمات')) {
            this.loadModule('settings');
            return '⚙️ در حال بارگذاری تنظیمات...';
        }

        if (messageText.includes('alerts') || messageText.includes('هشدار')) {
            this.loadModule('alerts');
            return '🚨 در حال بارگذاری بخش هشدارها...';
        }

        if (messageText.includes('news') || messageText.includes('اخبار')) {
            this.loadModule('news');
            return '📰 در حال بارگذاری اخبار بازار...';
        }

        if (messageText.includes('watchlist') || messageText.includes('مورد علاقه')) {
            this.loadModule('watchlist');
            return '❤️ در حال بارگذاری لیست مورد علاقه...';
        }

        if (messageText.includes('ai') || messageText.includes('هوش مصنوعی')) {
            this.loadModule('ai-management');
            return '🤖 در حال بارگذاری مدیریت AI...';
        }

        if (messageText.includes('analytics') || messageText.includes('تحلیل') || messageText.includes('گزارش')) {
            this.loadModule('analytics');
            return '📊 در حال بارگذاری آنالیز و گزارشات...';
        }

        if (messageText.includes('wallet') || messageText.includes('کیف پول')) {
            this.loadModule('wallets');
            return '💰 در حال بارگذاری مدیریت کیف‌پول...';
        }

        if (messageText.includes('status') || messageText.includes('وضعیت') || messageText.includes('سیستم')) {
            this.toggleSystemStatus();
            return '🔍 نمایش وضعیت سیستم...';
        }

        if (messageText.includes('help') || messageText.includes('کمک') || messageText.includes('راهنما')) {
            return `❓ راهنمای سیستم تایتان:

🎯 دستورات مفید:
• "نمایش پورتفولیو" - مشاهده دارایی‌ها
• "معامله دستی" - شروع معامله
• "اتوپایلوت" - معامله خودکار  
• "تنظیم هشدار" - ایجاد هشدار
• "اخبار بازار" - آخرین اخبار
• "وضعیت سیستم" - سلامت سیستم
• "تنظیمات" - پیکربندی سیستم

💡 کافیست به زبان ساده بگویید چه کاری می‌خواهید انجام دهید!`;
        }

        // Default helpful response
        return `🤖 سلام! من آرتمیس هستم، دستیار هوشمند شما.

🎯 می‌توانم کمکتان کنم در:
📊 مدیریت پورتفولیو و دارایی‌ها
📈 انجام معاملات (دستی و خودکار)
🚨 تنظیم هشدارها و اطلاع‌رسانی‌ها
📰 بررسی اخبار و تحلیل‌های بازار
⚙️ مدیریت تنظیمات سیستم
🤖 کنترل سیستم‌های هوش مصنوعی

💡 برای شروع، بگویید: "نمایش پورتفولیو" یا "کمک"`;
    }

    /**
     * Get current module for context
     */
    getCurrentModule() {
        const currentUrl = window.location.hash || '#dashboard';
        return currentUrl.replace('#', '') || 'dashboard';
    }

    /**
     * Get user preferences for Artemis context
     */
    getUserPreferences() {
        return {
            language: 'persian',
            riskTolerance: localStorage.getItem('risk_tolerance') || 'medium',
            tradingExperience: localStorage.getItem('trading_experience') || 'beginner',
            preferredNotifications: localStorage.getItem('preferred_notifications') || 'all'
        };
    }

    /**
     * Refresh current module data
     */
    refreshCurrentModuleData() {
        const currentModule = this.getCurrentModule();
        console.log(`🔄 Refreshing data for module: ${currentModule}`);

        // Trigger refresh based on current module
        switch (currentModule) {
            case 'portfolio':
                if (window.portfolioModule && window.portfolioModule.refreshData) {
                    window.portfolioModule.refreshData();
                }
                break;
            case 'trading':
                if (window.tradingModule && window.tradingModule.refreshData) {
                    window.tradingModule.refreshData();
                }
                break;
            case 'dashboard':
                // Refresh dashboard
                this.loadModule('dashboard');
                break;
            default:
                console.log('No specific refresh method for', currentModule);
        }
    }

    /**
     * Add chat message to UI
     */
    addChatMessage(sender, message, isTyping = false, actions = null) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-4 ${isTyping ? 'typing-indicator' : ''}`;

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="flex items-start gap-3 justify-end">
                    <div class="bg-purple-600 rounded-lg p-3 max-w-xs">
                        <p class="text-white text-sm">${message}</p>
                        <div class="text-xs text-purple-200 mt-1">${new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute: '2-digit'})}</div>
                    </div>
                    <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user text-white text-sm"></i>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div class="bg-gray-700/80 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                        <p class="text-white text-sm">${message}</p>
                        ${actions ? this.renderArtemisActions(actions) : ''}
                        <div class="text-xs text-gray-400 mt-2">${new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute: '2-digit'})}</div>
                    </div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Remove typing indicator
     */
    removeChatMessage(type) {
        const messagesContainer = document.getElementById('chat-messages');
        if (type === 'typing') {
            const typingIndicator = messagesContainer.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }
    }

    /**
     * Get simulated Artemis response based on user message
     */
    getArtemisResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('پورتفولیو') || lowerMessage.includes('موجودی')) {
            return 'پورتفولیو شما در حال حاضر $125,430 ارزش دارد. سود این هفته +5.67% بوده است. آیا می‌خواهید جزئیات بیشتری ببینید؟';
        }

        if (lowerMessage.includes('معامله') || lowerMessage.includes('خرید') || lowerMessage.includes('فروش')) {
            return 'برای شروع معامله، لطفاً مشخص کنید:\n• کدام ارز دیجیتال؟\n• مقدار سرمایه؟\n• استراتژی مورد نظر (DCA، Scalping، ...)؟';
        }

        if (lowerMessage.includes('آمار') || lowerMessage.includes('گزارش')) {
            return 'آمار امروز شما:\n📈 سود: +$2,340\n📊 معاملات موفق: 8/10\n⚡ نرخ موفقیت: 80%\n\nآیا گزارش تفصیلی می‌خواهید؟';
        }

        if (lowerMessage.includes('اتوپایلت') || lowerMessage.includes('خودکار')) {
            return 'اتوپایلت آرتمیس آماده فعال‌سازی است. می‌توانم:\n🤖 معاملات خودکار DCA\n📊 تحلیل تکنیکال\n⚠️ مدیریت ریسک\n\nکدام عملکرد را فعال کنم؟';
        }

        return 'متوجه شدم. در حال پردازش درخواست شما هستم. لطفاً کمی صبر کنید...';
    }

    /**
     * Handle Artemis quick actions
     */
    async artemisQuickAction(action) {
        switch (action) {
            case 'portfolio':
                this.addChatMessage('artemis', 'در حال بارگذاری وضعیت پورتفولیو...');
                setTimeout(() => {
                    this.addChatMessage('artemis', '📊 پورتفولیو شما:\n💰 ارزش کل: $125,430\n📈 سود هفتگی: +5.67%\n🔢 تعداد دارایی‌ها: 8\n⭐ عملکرد: عالی');
                }, 1000);
                break;
        
            case 'opportunities':
                this.addChatMessage('artemis', 'در حال اسکن بازار برای فرصت‌های معاملاتی...');
                setTimeout(() => {
                    this.addChatMessage('artemis', '🎯 فرصت‌های شناسایی شده:\n\n🔥 BTC/USDT: سیگنال خرید قوی\n📊 RSI: 32 (Oversold)\n💡 توصیه: خرید تدریجی DCA\n\nآیا می‌خواهید معامله را شروع کنم؟');
                }, 2000);
                break;
        
            case 'automation':
                this.addChatMessage('artemis', 'تنظیمات اتوماسیون فعلی:\n\n🤖 DCA Bot: فعال\n⚡ Scalping: غیرفعال\n🛡️ Stop Loss: 5%\n💰 حداکثر ریسک: 2%\n\nکدام تنظیم را تغییر می‌دهید؟');
                break;
        
            case 'report':
                this.addChatMessage('artemis', 'گزارش سود امروز:\n\n💰 سود خالص: +$2,340\n📈 بازدهی: +1.87%\n🎯 معاملات موفق: 8/10\n⏱️ زمان فعال: 6 ساعت\n\n🏆 عملکرد بهتر از 89% کاربران!');
                break;
        }
    }

    /**
     * Toggle voice input with real speech recognition
     */
    toggleVoiceInput() {
        if (!this.isListening) {
            this.startVoiceRecognition();
        } else {
            this.stopVoiceRecognition();
        }
    }

    /**
     * Start voice recognition
     */
    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.addChatMessage('artemis', 'متأسفم، مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند. لطفاً از Chrome یا Edge استفاده کنید.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.lang = 'fa-IR'; // Persian language
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        const voiceButton = document.querySelector('#chat-assistant button[onclick="app.toggleVoiceInput()"]');

        this.recognition.onstart = () => {
            this.isListening = true;
            if (voiceButton) {
                voiceButton.classList.add('bg-red-600');
                voiceButton.classList.remove('bg-gray-700/60');
                voiceButton.innerHTML = '<i class="fas fa-stop text-sm"></i>';
            }
            this.addChatMessage('artemis', '🎤 در حال گوش دادن... صحبت کنید', true);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = transcript;
            }
            this.removeChatMessage('typing');
            this.addChatMessage('artemis', `✅ شنیدم: "${transcript}"`);
    
            // Auto-send the recognized text
            setTimeout(() => {
                this.sendArtemisMessage();
            }, 1000);
        };

        this.recognition.onerror = (event) => {
            this.removeChatMessage('typing');
            let errorMessage = 'خطا در تشخیص صدا';
    
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'صدایی دریافت نشد. دوباره تلاش کنید.';
                    break;
                case 'audio-capture':
                    errorMessage = 'میکروفون در دسترس نیست.';
                    break;
                case 'not-allowed':
                    errorMessage = 'لطفاً اجازه استفاده از میکروفون را بدهید.';
                    break;
            }
    
            this.addChatMessage('artemis', `❌ ${errorMessage}`);
            this.stopVoiceRecognition();
        };

        this.recognition.onend = () => {
            this.stopVoiceRecognition();
        };

        try {
            this.recognition.start();
        } catch (error) {
            this.addChatMessage('artemis', 'خطا در شروع تشخیص صدا. دوباره تلاش کنید.');
        }
    }

    /**
     * Stop voice recognition
     */
    stopVoiceRecognition() {
        this.isListening = false;

        if (this.recognition) {
            this.recognition.stop();
        }

        const voiceButton = document.querySelector('#chat-assistant button[onclick="app.toggleVoiceInput()"]');
        if (voiceButton) {
            voiceButton.classList.remove('bg-red-600');
            voiceButton.classList.add('bg-gray-700/60');
            voiceButton.innerHTML = '<i class="fas fa-microphone text-sm"></i>';
        }
    }

    /**
     * Minimize chat (placeholder)
     */
    minimizeChat() {
        // Could minimize to small floating bubble
        this.toggleChatAssistant();
    }

    async loadDashboardContentModule() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="space-y-6">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-white mb-2">داشبورد تایتان</h1>
                    <p class="text-gray-400">نمای کلی از عملکرد و وضعیت حساب شما</p>
                </div>
        
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Balance Card -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center">
                            <i class="fas fa-wallet text-green-400 text-2xl mr-4"></i>
                            <div>
                                <p class="text-gray-400 text-sm">موجودی کل</p>
                                <p class="text-2xl font-bold text-white">$125,430</p>
                            </div>
                        </div>
                    </div>
            
                    <!-- Today's P&L -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center">
                            <i class="fas fa-chart-line text-blue-400 text-2xl mr-4"></i>
                            <div>
                                <p class="text-gray-400 text-sm">سود/زیان امروز</p>
                                <p class="text-2xl font-bold text-green-400">+$2,340</p>
                            </div>
                        </div>
                    </div>
            
                    <!-- Open Positions -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center">
                            <i class="fas fa-briefcase text-purple-400 text-2xl mr-4"></i>
                            <div>
                                <p class="text-gray-400 text-sm">پوزیشن‌های باز</p>
                                <p class="text-2xl font-bold text-white">7</p>
                            </div>
                        </div>
                    </div>
            
                    <!-- Win Rate -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center">
                            <i class="fas fa-target text-orange-400 text-2xl mr-4"></i>
                            <div>
                                <p class="text-gray-400 text-sm">نرخ برد</p>
                                <p class="text-2xl font-bold text-white">68%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadModule(moduleName) {
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current module if event exists, otherwise find by onclick
        if (typeof event !== 'undefined' && event.target) {
            event.target.classList.add('active');
        } else {
            // Programmatic call - find the correct nav link
            const navLink = document.querySelector(`a[onclick*="loadModule('${moduleName}')"]`);
            if (navLink) {
                navLink.classList.add('active');
            }
        }

        const mainContent = document.getElementById('main-content');

        try {
            switch (moduleName) {
                case 'dashboard':
                    try {
                        console.log('🏠 Starting Dashboard module loading...');
                
                        // Check if module loader is available
                        if (!this.moduleLoader) {
                            console.log('⚠️ Module loader not available, trying to reinitialize...');
                            await this.initializeModuleLoader();
                        }
                
                        if (this.moduleLoader) {
                            console.log('📦 Module loader available, loading dashboard');
                            const dashboardModule = await this.moduleLoader.loadModule('dashboard', {
                                showLoading: true
                            });
                    
                            if (dashboardModule) {
                                console.log('✅ Dashboard module loaded, getting content');
                                mainContent.innerHTML = await dashboardModule.getContent();
                                console.log('✅ Dashboard content loaded, initializing');
                                await dashboardModule.initialize();
                                // Set global reference for UI interactions
                                window.dashboardModule = dashboardModule;
                                console.log('✅ Dashboard module initialized successfully');
                            } else {
                                throw new Error('Dashboard module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ Dashboard loading error:', error);
                        this.showAlert('خطا در بارگذاری ماژول dashboard: ' + error.message, 'error');
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول داشبورد</div></div>';
                    }
                    break;
                case 'trading':
                    try {
                        console.log('🚀 Starting Trading module loading...');
                
                        // Try modular approach first
                        if (this.moduleLoader) {
                            console.log('📦 Module loader available, trying modular approach');
                            const tradingModule = await this.moduleLoader.loadModule('trading', {
                                showLoading: true
                            });
                    
                            if (tradingModule) {
                                console.log('✅ Trading module loaded, getting content');
                                mainContent.innerHTML = await tradingModule.getContent();
                                console.log('✅ Trading content loaded, initializing');
                                await tradingModule.initialize();
                                // Set global reference for UI interactions
                                window.tradingModule = tradingModule;
                                console.log('✅ Trading module initialized successfully');
                            } else {
                                throw new Error('Trading module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ Trading loading error:', error);
                        this.showAlert('خطا در بارگذاری ماژول trading: ' + error.message, 'error');
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول معاملات</div></div>';
                    }
                    break;
                case 'portfolio':
                    try {
                        console.log('🚀 Starting Portfolio module loading...');
                
                        // Try modular approach first
                        if (this.moduleLoader) {
                            console.log('📦 Module loader available, trying modular approach');
                            const portfolioModule = await this.moduleLoader.loadModule('portfolio', {
                                showLoading: true
                            });
                    
                            if (portfolioModule) {
                                console.log('✅ Portfolio module loaded, getting content');
                                mainContent.innerHTML = await portfolioModule.getContent();
                                console.log('✅ Portfolio content loaded, initializing');
                                await portfolioModule.initialize();
                                // Set global reference for UI interactions
                                window.portfolioModule = portfolioModule;
                                console.log('✅ Portfolio module initialized successfully');
                            } else {
                                throw new Error('Portfolio module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ Portfolio loading error:', error);
                        this.showAlert('خطا در بارگذاری ماژول portfolio: ' + error.message, 'error');
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول پورتفولیو</div></div>';
                    }
                    break;
                case 'analytics':
                    try {
                        console.log('📊 Starting Analytics module loading...');
                
                        // Try modular approach first
                        if (this.moduleLoader) {
                            console.log('📦 Module loader available, trying modular approach');
                            const analyticsModule = await this.moduleLoader.loadModule('analytics', {
                                showLoading: true
                            });
                    
                            if (analyticsModule) {
                                console.log('✅ Analytics module loaded, getting content');
                                mainContent.innerHTML = await analyticsModule.getContent();
                                console.log('✅ Analytics content loaded, initializing');
                                await analyticsModule.initialize();
                                console.log('✅ Analytics module initialized successfully');
                                // Set global reference for UI interactions
                                window.analyticsModule = analyticsModule;
                            } else {
                                throw new Error('Analytics module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ Analytics loading error:', error);
                        this.showAlert('خطا در بارگذاری ماژول analytics: ' + error.message, 'error');
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول تحلیل</div></div>';
                    }
                    break;
                case 'watchlist':
                    try {
                        console.log('🎯 Starting Watchlist module loading...');
                
                        // Try modular approach first
                        if (this.moduleLoader) {
                            console.log('📦 Module loader available, trying modular approach');
                            const watchlistModule = await this.moduleLoader.loadModule('watchlist', {
                                showLoading: true
                            });
                    
                            if (watchlistModule) {
                                console.log('✅ Watchlist module loaded, getting content');
                                mainContent.innerHTML = await watchlistModule.getContent();
                                console.log('✅ Watchlist content loaded, initializing');
                                await watchlistModule.initialize();
                                console.log('✅ Watchlist module initialized successfully');
                                // Set global reference for UI interactions
                                window.watchlistModule = watchlistModule;
                            } else {
                                throw new Error('Watchlist module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ Watchlist loading error:', error);
                        this.showAlert('خطا در بارگذاری ماژول watchlist: ' + error.message, 'error');
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول لیست مورد علاقه</div></div>';
                    }
                    break;
                case 'artemis':
                    try {
                        console.log('🧠 Starting Artemis AI module loading...');
                
                        // Try modular approach first
                        if (this.moduleLoader) {
                            console.log('📦 Module loader available, trying modular approach');
                            const artemisModule = await this.moduleLoader.loadModule('artemis', {
                                showLoading: true
                            });
                    
                            if (artemisModule) {
                                console.log('✅ Artemis module loaded, getting content');
                                mainContent.innerHTML = await artemisModule.getContent();
                                console.log('✅ Artemis content loaded, initializing');
                                await artemisModule.initialize();
                                console.log('✅ Artemis AI module initialized successfully');
                            } else {
                                throw new Error('Artemis module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ Artemis loading error:', error);
                        this.showAlert('خطا در بارگذاری ماژول artemis: ' + error.message, 'error');
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول آرتمیس</div></div>';
                    }
                    break;

// DISABLED:                 case 'ai-insights':
// DISABLED:                     try {
// DISABLED:                         console.log('🧠 Starting AI Insights Dashboard module loading...');
// DISABLED:                         
// DISABLED:                         // Load AI Insights module directly (it's self-contained)
// DISABLED:                         const script = document.createElement('script');
// DISABLED:                         script.src = `/static/modules/ai-insights.js?v=${Date.now()}`;
// DISABLED:                         
// DISABLED:                         await new Promise((resolve, reject) => {
// DISABLED:                             script.onload = resolve;
// DISABLED:                             script.onerror = reject;
// DISABLED:                             document.head.appendChild(script);
// DISABLED:                         });
// DISABLED:                         
// DISABLED:                         // Wait a moment for script to be parsed
// DISABLED:                         await new Promise(resolve => setTimeout(resolve, 100));
// DISABLED:                         
// DISABLED:                         if (typeof AIInsightsDashboard !== 'undefined') {
// DISABLED:                             console.log('✅ AI Insights Dashboard class loaded');
// DISABLED:                             
// DISABLED:                             // Create and initialize AI Insights Dashboard
// DISABLED:                             const aiInsightsDashboard = new AIInsightsDashboard();
// DISABLED:                             await aiInsightsDashboard.initialize();
// DISABLED:                             
// DISABLED:                             console.log('✅ AI Insights Dashboard initialized successfully');
// DISABLED:                         } else {
// DISABLED:                             throw new Error('AIInsightsDashboard class not found after loading');
// DISABLED:                         }
// DISABLED:                         
// DISABLED:                     } catch (error) {
// DISABLED:                         console.error('❌ AI Insights loading error:', error);
// DISABLED:                         this.showAlert('خطا در بارگذاری ماژول هوش مصنوعی: ' + error.message, 'error');
// DISABLED:                         
// DISABLED:                         // Show fallback content
// DISABLED:                         mainContent.innerHTML = `
// DISABLED:                             <div class="text-center p-8">
// DISABLED:                                 <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
// DISABLED:                                     <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
// DISABLED:                                     <h3 class="text-red-400 text-lg font-bold mb-2">خطا در بارگذاری هوش مصنوعی</h3>
// DISABLED:                                     <p class="text-gray-300 text-sm mb-4">سرویس‌های هوش مصنوعی در حال حاضر در دسترس نیستند.</p>
// DISABLED:                                     <button onclick="app.loadModule('ai-insights')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
// DISABLED:                                         <i class="fas fa-retry mr-2"></i>
// DISABLED:                                         تلاش مجدد
// DISABLED:                                     </button>
// DISABLED:                                 </div>
// DISABLED:                             </div>
// DISABLED:                         `;
// DISABLED:                     }
// DISABLED:                     break;

                case 'news':
                    try {
                        console.log('📰 Starting News module loading...');
                
                        if (this.moduleLoader) {
                            console.log('📦 Module loader available, trying modular approach');
                            const newsModule = await this.moduleLoader.loadModule('news', {
                                showLoading: true
                            });
                    
                            if (newsModule) {
                                console.log('✅ News module loaded, getting content');
                                mainContent.innerHTML = await newsModule.getContent();
                                console.log('✅ News content loaded, initializing');
                                await newsModule.initialize();
                                console.log('✅ News module initialized successfully');
                                window.newsModule = newsModule;
                            } else {
                                throw new Error('News module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ News loading error:', error);
                        this.showAlert('خطا در بارگذاری ماژول news: ' + error.message, 'error');
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول اخبار</div></div>';
                    }
                    break;
                case 'alerts':
                    try {
                        if (this.moduleLoader) {
                            const alertsModule = await this.moduleLoader.loadModule('alerts', { showLoading: true });
                            if (alertsModule) {
                                mainContent.innerHTML = await alertsModule.getContent();
                                await alertsModule.initialize();
                                window.alertsModule = alertsModule;
                            } else {
                                throw new Error('Alerts module returned null');
                            }
                        } else {
                            throw new Error('Module loader not available');
                        }
                    } catch (error) {
                        console.error('❌ Alerts loading error:', error);
                        mainContent.innerHTML = '<div class="text-center p-8"><div class="text-red-400">خطا در بارگذاری ماژول هشدارها</div></div>';
                    }
                    break;
                case 'settings':
                    try {
                        console.log('⚙️ Starting Unified Settings module loading...');
                
                        // Show loading state
                        mainContent.innerHTML = `
                            <div class="space-y-6">
                                <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
                                    <div class="text-center">
                                        <div class="animate-spin inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-6"></div>
                                        <h3 class="text-xl font-semibold text-white mb-2">در حال بارگذاری تنظیمات یکپارچه...</h3>
                                        <p class="text-gray-400">لطفاً صبر کنید تا سیستم تنظیمات راه‌اندازی شود</p>
                                    </div>
                                </div>
                            </div>
                        `;
                
                        // Load unified settings module
                        if (!window.UnifiedSettingsModule) {
                            const script = document.createElement('script');
                            script.src = '/static/modules/settings-unified.js?v=' + Date.now();
                    
                            await new Promise((resolve, reject) => {
                                script.onload = resolve;
                                script.onerror = () => reject(new Error('خطا در بارگذاری فایل settings-unified.js'));
                                document.head.appendChild(script);
                            });
                        }
                
                        // Create and initialize unified settings instance
                        window.unifiedSettings = new window.UnifiedSettingsModule();
                        await window.unifiedSettings.init();
                
                        // Render unified settings content
                        const settingsContent = await window.unifiedSettings.render();
                        mainContent.innerHTML = settingsContent;
                
                        console.log('✅ Unified Settings module loaded successfully');
                        this.showAlert('تنظیمات یکپارچه بارگذاری شد', 'success');
                
                    } catch (error) {
                        console.error('❌ Unified Settings loading error:', error);
                        this.showAlert('خطا در بارگذاری تنظیمات: ' + error.message, 'error');
                        mainContent.innerHTML = `
                            <div class="space-y-6">
                                <div class="bg-red-900/20 border border-red-600 rounded-lg p-8 text-center">
                                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                                    <h3 class="text-xl font-bold text-red-400 mb-4">خطا در بارگذاری تنظیمات یکپارچه</h3>
                                    <p class="text-gray-400 mb-6">${error.message}</p>
                                    <div class="space-x-3 space-x-reverse">
                                        <button onclick="app.loadModule('settings')" 
                                                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                                            🔄 تلاش مجدد
                                        </button>
                                        <button onclick="app.loadModule('dashboard')" 
                                                class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium">
                                            بازگشت به داشبورد
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    break;


            
                default:
                    this.showAlert(`ماژول ${moduleName} یافت نشد`, 'error');
            }
        } catch (error) {
            console.error(`Error loading module ${moduleName}:`, error);
            this.showAlert(`خطا در بارگذاری ماژول ${moduleName}`, 'error');
        }
    }

    async logout() {
        try {
            await axios.post('/api/auth/logout');
            localStorage.removeItem('titan_auth_token');
            this.currentUser = null;
            this.showLoginScreen();
            this.showAlert('خروج موفقیت‌آمیز', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Data loading functions for each module
        // loadTradingData removed - using modular trading.js

        // loadPortfolioData removed - using modular portfolio.js

        // loadAnalyticsData removed - using modular analytics.js

        // loadArtemisData removed - using modular artemis.js

        // loadNewsData removed - using modular news.js

    // Render functions for each module
    renderActiveTrades(trades) {
        const container = document.getElementById('active-trades-list');
        if (!container) return;

        container.innerHTML = trades.map(trade => `
            <div class="bg-gray-700 rounded-lg p-4 mb-3">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="text-white font-medium">${trade.symbol}</h4>
                        <p class="text-gray-400 text-sm">${trade.type} - ${trade.amount} واحد</p>
                    </div>
                    <div class="text-right">
                        <p class="text-white font-medium">$${trade.price.toLocaleString()}</p>
                        <p class="${trade.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'} text-sm">${trade.profit}</p>
                    </div>
                    <div class="px-2 py-1 rounded text-xs ${trade.status === 'فعال' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}">
                        ${trade.status}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTradingOpportunities(opportunities) {
        const container = document.getElementById('trading-opportunities');
        if (!container) return;

        container.innerHTML = opportunities.map(opp => `
            <div class="bg-gray-700 rounded-lg p-4 mb-3">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="text-white font-medium">${opp.symbol}</h4>
                        <p class="text-gray-400 text-sm">توصیه: ${opp.action}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-white">قیمت فعلی: $${opp.price}</p>
                        <p class="text-blue-400 text-sm">هدف: $${opp.target}</p>
                    </div>
                    <div class="text-center">
                        <div class="text-purple-400 font-bold">${opp.confidence}%</div>
                        <p class="text-gray-400 text-xs">اعتماد</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPortfolioHoldings(holdings) {
        const container = document.getElementById('portfolio-holdings');
        if (!container) return;

        container.innerHTML = `
            <table class="min-w-full">
                <thead class="bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">دارایی</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">مقدار</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">ارزش</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">تغییر 24ساعته</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">درصد پورتفولیو</th>
                    </tr>
                </thead>
                <tbody class="bg-gray-800 divide-y divide-gray-700">
                    ${holdings.map(holding => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-white font-medium">${holding.symbol}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-300">${holding.amount}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-white">$${holding.value.toLocaleString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap ${holding.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}">${holding.change}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-300">${holding.allocation}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderArtemisAgents(agents) {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.lg\\:grid-cols-5');
        if (!container) return;

        container.innerHTML = agents.map(agent => `
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div class="text-2xl mb-2">${agent.icon}</div>
                <p class="text-white font-medium text-sm">${agent.name}</p>
                <div class="w-2 h-2 bg-${agent.status === 'active' ? 'green' : 'red'}-400 rounded-full mx-auto mt-2"></div>
                <p class="text-xs text-gray-400 mt-1">${agent.confidence}%</p>
            </div>
        `).join('');
    }

    renderNewsList(news) {
        const container = document.getElementById('news-list');
        if (!container) return;

        container.innerHTML = news.map(item => `
            <div class="bg-gray-700 rounded-lg p-4 mb-4 border-r-4 border-${item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'yellow'}-400">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h4 class="text-white font-medium mb-2">${item.title}</h4>
                        <p class="text-gray-300 text-sm mb-2">${item.summary}</p>
                        <div class="flex items-center text-xs text-gray-400">
                            <span>${item.time}</span>
                            <span class="mx-2">•</span>
                            <span class="px-2 py-1 rounded bg-${item.impact === 'high' ? 'red' : item.impact === 'medium' ? 'yellow' : 'blue'}-600 text-white">
                                تأثیر ${item.impact === 'high' ? 'بالا' : item.impact === 'medium' ? 'متوسط' : 'کم'}
                            </span>
                        </div>
                    </div>
                    <div class="text-2xl mr-4">
                        ${item.sentiment === 'positive' ? '📈' : item.sentiment === 'negative' ? '📉' : '📊'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderEconomicCalendar(events) {
        const container = document.getElementById('economic-calendar');
        if (!container) return;

        // Show demo calendar if no events provided
        const demoEvents = events || [
            { time: '14:30', event: 'اعلام نرخ تورم آمریکا', impact: 'high' },
            { time: '16:00', event: 'نرخ بهره بانک مرکزی اروپا', impact: 'medium' },
            { time: '20:00', event: 'گزارش اشتغال غیرکشاورزی', impact: 'high' }
        ];

        container.innerHTML = `
            <div class="space-y-3">
                ${demoEvents.map(event => `
                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div class="flex items-center">
                            <div class="w-3 h-3 bg-${event.impact === 'high' ? 'red' : event.impact === 'medium' ? 'yellow' : 'blue'}-400 rounded-full mr-3"></div>
                            <div>
                                <p class="text-white font-medium">${event.event}</p>
                                <p class="text-gray-400 text-xs">ساعت ${event.time}</p>
                            </div>
                        </div>
                        <span class="px-2 py-1 rounded text-xs bg-${event.impact === 'high' ? 'red' : event.impact === 'medium' ? 'yellow' : 'blue'}-600 text-white">
                            ${event.impact === 'high' ? 'بحرانی' : event.impact === 'medium' ? 'مهم' : 'عادی'}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupSettingsEvents() {
        // Setup demo mode toggle
        const demoToggle = document.getElementById('demo-mode');
        if (demoToggle) {
            demoToggle.addEventListener('change', (e) => {
                this.isDemo = e.target.checked;
                this.showAlert(this.isDemo ? 'حالت دمو فعال شد' : 'حالت دمو غیرفعال شد', 'info');
            });
        }

        // Load exchange status when settings page loads
        this.loadExchangeStatus();
    }

    // Exchange Management Functions
    async loadExchangeStatus() {
        try {
            const response = await axios.get('/api/trading/exchange/exchanges');
    
            if (response.data.success) {
                this.renderExchangeCards(response.data.data);
            } else {
                this.showAlert('خطا در دریافت وضعیت صرافی‌ها', 'error');
            }
        } catch (error) {
            console.error('Error loading exchange status:', error);
            this.showAlert('خطا در ارتباط با سرور', 'error');
        }
    }

    renderExchangeCards(exchangeData) {
        const container = document.getElementById('exchange-status-cards');
        if (!container) return;

        container.innerHTML = '';

        for (const [exchangeId, config] of Object.entries(exchangeData)) {
            const statusClass = config.configured ? 
                (config.hasApiKey && config.hasApiSecret ? 'bg-green-600' : 'bg-red-600') : 
                'bg-gray-600';
    
            const statusText = config.configured ? 
                (config.hasApiKey && config.hasApiSecret ? 'متصل' : 'خطا') : 
                'پیکربندی نشده';

            const card = `
                <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold text-white">${config.name}</h4>
                        <div class="flex items-center">
                            <span class="w-3 h-3 ${statusClass} rounded-full mr-2"></span>
                            <span class="text-xs text-gray-300">${statusText}</span>
                        </div>
                    </div>
                    <div class="text-sm text-gray-400 space-y-1">
                        <div class="flex justify-between">
                            <span>حالت:</span>
                            <span class="${config.sandbox ? 'text-yellow-400' : 'text-green-400'}">
                                ${config.sandbox ? 'تست' : 'تولید'}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span>Rate Limit:</span>
                            <span>${config.rateLimit}/min</span>
                        </div>
                    </div>
                    <div class="mt-3 flex gap-2">
                        <button onclick="app.testSingleExchange('${exchangeId}')" 
                                class="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 rounded flex-1">
                            تست
                        </button>
                        <button onclick="app.getExchangeBalances('${exchangeId}')" 
                                class="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 rounded flex-1">
                            موجودی
                        </button>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        }
    }

    async testAllExchanges() {
        const summaryContainer = document.getElementById('exchange-test-summary');
        if (summaryContainer) {
            summaryContainer.classList.remove('hidden');
            summaryContainer.innerHTML = '<p class="text-blue-400 text-center">در حال تست...</p>';
        }

        try {
            const response = await axios.post('/api/trading/exchange/test-all');
    
            if (response.data.success) {
                const results = response.data.data.results;
                const summary = response.data.data.summary;
        
                let html = `
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h5 class="font-semibold text-white mb-3">نتایج تست صرافی‌ها:</h5>
                        <div class="grid grid-cols-4 gap-4 text-center text-sm mb-4">
                            <div>
                                <div class="text-xl font-bold text-blue-400">${summary.total}</div>
                                <div class="text-gray-400">کل</div>
                            </div>
                            <div>
                                <div class="text-xl font-bold text-green-400">${summary.successful}</div>
                                <div class="text-gray-400">موفق</div>
                            </div>
                            <div>
                                <div class="text-xl font-bold text-red-400">${summary.failed}</div>
                                <div class="text-gray-400">ناموفق</div>
                            </div>
                            <div>
                                <div class="text-xl font-bold text-yellow-400">${summary.successRate}</div>
                                <div class="text-gray-400">نرخ موفقیت</div>
                            </div>
                        </div>
                        <div class="space-y-2">
                `;
        
                for (const [exchange, result] of Object.entries(results)) {
                    const statusIcon = result.success ? '✅' : '❌';
                    html += `
                        <div class="flex items-center justify-between text-sm">
                            <span>${statusIcon} ${exchange}</span>
                            <span class="${result.success ? 'text-green-400' : 'text-red-400'}">${result.message}</span>
                        </div>
                    `;
                }
        
                html += '</div></div>';
                summaryContainer.innerHTML = html;
                this.showAlert(`تست تکمیل شد - ${summary.successful}/${summary.total} موفق`, 'success');
            }
        } catch (error) {
            console.error('Error testing exchanges:', error);
            this.showAlert('خطا در تست صرافی‌ها', 'error');
        }
    }

    async testSingleExchange(exchange) {
        try {
            const response = await axios.post('/api/trading/exchange/test-connection', {
                exchange: exchange
            });
    
            const message = response.data.success ? 
                `تست ${exchange} موفق بود` : 
                `تست ${exchange} ناموفق: ${response.data.message}`;
        
            this.showAlert(message, response.data.success ? 'success' : 'error');
        } catch (error) {
            this.showAlert(`خطا در تست ${exchange}`, 'error');
        }
    }

    async getExchangeBalances(exchange) {
        try {
            const response = await axios.get(`/api/trading/exchange/balances?exchange=${exchange}`);
    
            if (response.data.success) {
                const balances = response.data.data;
                let html = `<h4 class="font-semibold mb-3 text-white">موجودی ${exchange}:</h4>`;
        
                if (balances.length > 0) {
                    html += '<div class="space-y-2 max-h-60 overflow-y-auto">';
                    balances.forEach(balance => {
                        html += `
                            <div class="flex justify-between items-center p-2 bg-gray-600 rounded">
                                <span class="font-medium text-white">${balance.asset}</span>
                                <div class="text-right text-sm">
                                    <div class="text-green-400">آزاد: ${balance.free}</div>
                                    <div class="text-yellow-400">قفل: ${balance.locked}</div>
                                    ${balance.usdValue ? `<div class="text-gray-300">USD: $${balance.usdValue}</div>` : ''}
                                </div>
                            </div>
                        `;
                    });
                    html += '</div>';
                } else {
                    html += '<p class="text-gray-400">موجودی یافت نشد</p>';
                }
        
                this.showModal('موجودی حساب', html);
            } else {
                this.showAlert(`خطا در دریافت موجودی ${exchange}`, 'error');
            }
        } catch (error) {
            this.showAlert(`خطا در ارتباط برای ${exchange}`, 'error');
        }
    }

    openExchangeSetup() {
        window.open('/static/exchange-setup.html', '_blank');
    }

    // Notification Functions
    async testNotification(type) {
        const testMessages = {
            email: 'این یک تست ایمیل از سیستم تایتان است.',
            telegram: 'سلام! این پیام تست از ربات تایتان است 🚀',
            sms: 'تست پیامک سیستم تایتان - همه چیز عالی کار می‌کند!',
            discord: 'تست اعلان دیسکورد از سیستم معاملاتی تایتان'
        };

        try {
            const response = await axios.post('/api/notifications/test', {
                channel: type,
                message: testMessages[type],
                recipient: this.getNotificationRecipient(type)
            });

            if (response.data.success) {
                this.showAlert(`تست ${type} موفقیت‌آمیز بود`, 'success');
            } else {
                this.showAlert(`خطا در تست ${type}: ${response.data.message}`, 'error');
            }
        } catch (error) {
            console.error('Error testing notification:', error);
            this.showAlert(`خطا در تست ${type}`, 'error');
        }
    }

    getNotificationRecipient(type) {
        const elements = {
            email: 'notification-email',
            telegram: 'telegram-chat-id',
            sms: 'sms-phone',
            discord: 'discord-webhook'
        };

        const element = document.getElementById(elements[type]);
        return element ? element.value : '';
    }

    // Show modal helper
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto border border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">${title}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white text-xl">✕</button>
                </div>
                <div>${content}</div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Trading control functions
    async startAutopilot() {
        this.showAlert('سیستم خودکار فعال شد', 'success');
        console.log('Autopilot started');
    }

    async stopAutopilot() {
        this.showAlert('معاملات متوقف شد', 'warning');
        console.log('Autopilot stopped');
    }

    async emergencyStop() {
        this.showAlert('توقف اضطراری! تمام معاملات بسته شد', 'error');
        console.log('Emergency stop activated');
    }

    async sendChatMessage() {
        const input = document.querySelector('#artemis-chat #chat-input, #chat-input');
        const message = input?.value.trim();

        if (!message) return;

        const messagesContainer = document.querySelector('#artemis-chat #chat-messages, #chat-messages');

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'flex justify-end mb-2';
        userMsg.innerHTML = `<div class="bg-blue-600 text-white p-3 rounded-lg max-w-xs">${message}</div>`;
        messagesContainer.appendChild(userMsg);

        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Simulate AI response
        setTimeout(async () => {
            const responses = [
                'بازار در حال حاضر روند صعودی داشته و پیشنهاد خرید BTC را می‌دهم.',
                'تحلیل‌های تکنیکال نشان می‌دهد که ETH در محدوده مقاومتی قرار دارد.',
                'سیستم مدیریت ریسک فعال است و تمام معاملات تحت نظارت می‌باشند.',
                'احساسات بازار مثبت است و فرصت‌های خوبی برای ورود وجود دارد.'
            ];
    
            const response = responses[Math.floor(Math.random() * responses.length)];
    
            const aiMsg = document.createElement('div');
            aiMsg.className = 'flex items-start mb-2';
            aiMsg.innerHTML = `
                <div class="text-purple-400 text-xl ml-2">🧠</div>
                <div class="bg-purple-600 text-white p-3 rounded-lg max-w-xs">${response}</div>
            `;
            messagesContainer.appendChild(aiMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }

    // In-app notification management
    async initInAppNotifications() {
        // Start polling for in-app notifications
        this.notificationPollingInterval = setInterval(() => {
            this.pollInAppNotifications();
        }, 3000); // Poll every 3 seconds

        // Initialize alerts auto-refresh
        this.initAlertsAutoRefresh();

        console.log('📱 In-app notification polling started');
        console.log('🔔 Alerts auto-refresh initialized');
    }

    async pollInAppNotifications() {
        try {
            const response = await axios.get('/api/notifications/inapp');
            if (response.data.success && response.data.notifications.length > 0) {
                response.data.notifications.forEach(notification => {
                    this.displayInAppNotification(notification);
                });
            }
        } catch (error) {
            // Silently fail - don't spam console for polling errors
        }
    }

    displayInAppNotification(notification) {
        const container = document.createElement('div');
        const positions = {
            'top-right': 'fixed top-4 right-4',
            'top-left': 'fixed top-4 left-4', 
            'bottom-right': 'fixed bottom-4 right-4',
            'bottom-left': 'fixed bottom-4 left-4'
        };

        container.className = `${positions[notification.position]} bg-gray-800 border-l-4 rounded-lg shadow-2xl z-50 max-w-sm transform translate-x-full transition-all duration-300`;
        container.style.borderColor = notification.color;

        container.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="text-2xl mr-3">${notification.icon}</div>
                    <div class="flex-1">
                        <h4 class="text-white font-semibold text-sm">${notification.title}</h4>
                        <p class="text-gray-300 text-xs mt-1 leading-relaxed">${notification.message}</p>
                        <p class="text-gray-500 text-xs mt-2">${new Date(notification.timestamp).toLocaleString('fa-IR')}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="text-gray-400 hover:text-white ml-2 text-lg">×</button>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Animate in
        setTimeout(() => {
            container.classList.remove('translate-x-full');
        }, 100);

        // Auto-remove after duration
        setTimeout(() => {
            if (document.body.contains(container)) {
                container.classList.add('translate-x-full');
                setTimeout(() => {
                    if (document.body.contains(container)) {
                        document.body.removeChild(container);
                    }
                }, 300);
            }
        }, notification.duration);
    }

    // AI Services Management
    async testAIServices() {
        try {
            const response = await axios.get('/api/ai/test');
            if (response.data.success) {
                this.displayAIServiceStatus(response.data.services);
                this.showAlert('تست سرویس‌های AI تکمیل شد', 'success');
            } else {
                this.showAlert('خطا در تست سرویس‌های AI', 'error');
            }
        } catch (error) {
            console.error('Error testing AI services:', error);
            this.showAlert('خطا در ارتباط با سرویس‌های AI', 'error');
        }
    }

    displayAIServiceStatus(services) {
        const container = document.getElementById('ai-services-status');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-white font-semibold flex items-center">
                        <i class="fas fa-brain text-green-400 mr-2"></i>
                        OpenAI GPT
                    </h4>
                    <div class="flex items-center">
                        <div class="w-2 h-2 ${services.openai.available ? 'bg-green-400' : 'bg-red-400'} rounded-full mr-2"></div>
                        <span class="text-sm ${services.openai.available ? 'text-green-400' : 'text-red-400'}">${services.openai.message}</span>
                    </div>
                </div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-white font-semibold flex items-center">
                        <i class="fas fa-robot text-blue-400 mr-2"></i>
                        Anthropic Claude
                    </h4>
                    <div class="flex items-center">
                        <div class="w-2 h-2 ${services.anthropic.available ? 'bg-green-400' : 'bg-red-400'} rounded-full mr-2"></div>
                        <span class="text-sm ${services.anthropic.available ? 'text-green-400' : 'text-red-400'}">${services.anthropic.message}</span>
                    </div>
                </div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-white font-semibold flex items-center">
                        <i class="fas fa-coins text-yellow-400 mr-2"></i>
                        CoinGecko
                    </h4>
                    <div class="flex items-center">
                        <div class="w-2 h-2 ${services.coingecko.available ? 'bg-green-400' : 'bg-red-400'} rounded-full mr-2"></div>
                        <span class="text-sm ${services.coingecko.available ? 'text-green-400' : 'text-red-400'}">${services.coingecko.message}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async refreshAIStatus() {
        await this.testAIServices();
        await this.loadRecentAnalyses();
    }

    async runQuickAnalysis() {
        const symbol = document.getElementById('analysis-symbol')?.value;
        const type = document.getElementById('analysis-type')?.value;
        const resultsContainer = document.getElementById('analysis-results');

        if (!symbol || !type || !resultsContainer) return;

        // Show loading state
        resultsContainer.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                <p>آرتمیس در حال تحلیل ${symbol}...</p>
                <p class="text-sm mt-2">این کار چند ثانیه طول می‌کشد</p>
            </div>
        `;

        try {
            const response = await axios.get(`/api/ai/analysis/${symbol}?type=${type}`);
            if (response.data.success) {
                this.displayAnalysisResults(response.data.data, symbol, type);
                this.showAlert(`تحلیل ${symbol} تکمیل شد`, 'success');
        
                // Store in database
                await this.storeAnalysisInDB(response.data.data);
        
                // Refresh recent analyses
                await this.loadRecentAnalyses();
            } else {
                resultsContainer.innerHTML = `
                    <div class="text-center text-red-400 py-8">
                        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                        <p>خطا در تحلیل: ${response.data.error || 'خطای نامشخص'}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Analysis error:', error);
            resultsContainer.innerHTML = `
                <div class="text-center text-red-400 py-8">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>خطا در ارتباط با آرتمیس</p>
                </div>
            `;
            this.showAlert('خطا در تحلیل', 'error');
        }
    }

    displayAnalysisResults(analysis, symbol, type) {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;

        const typeNames = {
            'market_analysis': 'تحلیل بازار',
            'price_prediction': 'پیش‌بینی قیمت',
            'trade_signal': 'سیگنال معاملاتی'
        };

        const riskColors = {
            'low': 'text-green-400',
            'medium': 'text-yellow-400',
            'high': 'text-orange-400',
            'critical': 'text-red-400'
        };

        resultsContainer.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-gray-600 pb-2">
                    <h5 class="text-white font-semibold">${typeNames[type]} - ${symbol}</h5>
                    <div class="flex items-center">
                        <span class="text-sm text-gray-400 mr-2">اعتماد:</span>
                        <span class="text-sm font-medium text-blue-400">${analysis.analysis.confidence}%</span>
                    </div>
                </div>
        
                <div class="space-y-3">
                    <div>
                        <h6 class="text-gray-300 text-sm mb-1">خلاصه تحلیل:</h6>
                        <p class="text-white text-sm leading-relaxed">${analysis.analysis.summary}</p>
                    </div>
            
                    <div class="grid grid-cols-3 gap-3 bg-gray-800 rounded p-3">
                        <div class="text-center">
                            <div class="text-green-400 font-bold">${analysis.analysis.signals.buy}%</div>
                            <div class="text-xs text-gray-400">خرید</div>
                        </div>
                        <div class="text-center">
                            <div class="text-gray-400 font-bold">${analysis.analysis.signals.hold}%</div>
                            <div class="text-xs text-gray-400">نگهداری</div>
                        </div>
                        <div class="text-center">
                            <div class="text-red-400 font-bold">${analysis.analysis.signals.sell}%</div>
                            <div class="text-xs text-gray-400">فروش</div>
                        </div>
                    </div>
            
                    ${analysis.analysis.price_targets ? `
                    <div>
                        <h6 class="text-gray-300 text-sm mb-2">اهداف قیمتی:</h6>
                        <div class="grid grid-cols-3 gap-2 text-xs">
                            <div class="bg-gray-800 rounded p-2 text-center">
                                <div class="text-blue-400 font-medium">$${analysis.analysis.price_targets.short_term}</div>
                                <div class="text-gray-400">کوتاه‌مدت</div>
                            </div>
                            <div class="bg-gray-800 rounded p-2 text-center">
                                <div class="text-purple-400 font-medium">$${analysis.analysis.price_targets.medium_term}</div>
                                <div class="text-gray-400">میان‌مدت</div>
                            </div>
                            <div class="bg-gray-800 rounded p-2 text-center">
                                <div class="text-green-400 font-medium">$${analysis.analysis.price_targets.long_term}</div>
                                <div class="text-gray-400">بلندمدت</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
            
                    <div>
                        <h6 class="text-gray-300 text-sm mb-1">توصیه‌ها:</h6>
                        <ul class="text-sm text-gray-300 space-y-1">
                            ${analysis.analysis.recommendations.map(rec => `<li>• ${rec}</li>`).join('')}
                        </ul>
                    </div>
            
                    <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-600">
                        <div>سطح ریسک: <span class="${riskColors[analysis.analysis.risk_level]}">${analysis.analysis.risk_level}</span></div>
                        <div>مدل: ${analysis.metadata.model_used}</div>
                        <div>زمان: ${analysis.metadata.processing_time}ms</div>
                    </div>
                </div>
            </div>
        `;
    }

    async storeAnalysisInDB(analysisData) {
        try {
            await axios.post('/api/database/ai-analyses', {
                symbol: analysisData.analysis.symbol || document.getElementById('analysis-symbol')?.value,
                analysis_type: document.getElementById('analysis-type')?.value,
                ai_provider: analysisData.metadata.model_used.includes('gpt') ? 'openai' : 'anthropic',
                model_used: analysisData.metadata.model_used,
                analysis_result: analysisData.analysis,
                confidence_score: analysisData.analysis.confidence,
                risk_level: analysisData.analysis.risk_level,
                signals: analysisData.analysis.signals,
                price_targets: analysisData.analysis.price_targets,
                recommendations: analysisData.analysis.recommendations,
                processing_time_ms: analysisData.metadata.processing_time,
                tokens_used: analysisData.metadata.tokens_used
            });
        } catch (error) {
            console.log('Could not store analysis in database:', error);
        }
    }

    async loadRecentAnalyses() {
        try {
            const response = await axios.get('/api/database/ai-analyses?limit=5');
            if (response.data.success) {
                this.displayRecentAnalyses(response.data.data);
            }
        } catch (error) {
            console.log('Could not load recent analyses:', error);
        }
    }

    displayRecentAnalyses(analyses) {
        const container = document.getElementById('recent-analyses');
        if (!container || !analyses.length) return;

        const typeNames = {
            'market_analysis': 'تحلیل بازار',
            'price_prediction': 'پیش‌بینی قیمت',
            'trade_signal': 'سیگنال معاملاتی'
        };

        container.innerHTML = analyses.map(analysis => {
            const result = typeof analysis.analysis_result === 'string' 
                ? JSON.parse(analysis.analysis_result) 
                : analysis.analysis_result;
    
            return `
                <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer" 
                     onclick="app.showAnalysisDetails(${analysis.id})">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="text-white font-medium">${analysis.symbol} - ${typeNames[analysis.analysis_type]}</h4>
                        <span class="text-xs text-gray-400">${new Date(analysis.created_at).toLocaleString('fa-IR')}</span>
                    </div>
                    <p class="text-gray-300 text-sm mb-2">${result.summary?.substring(0, 100)}...</p>
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-blue-400">اعتماد: ${analysis.confidence_score}%</span>
                        <span class="text-gray-400">${analysis.ai_provider} - ${analysis.model_used}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async showAnalysisDetails(analysisId) {
        try {
            const response = await axios.get(`/api/database/ai-analyses/${analysisId}`);
            if (response.data.success) {
                const analysis = response.data.data;
                const result = typeof analysis.analysis_result === 'string' 
                    ? JSON.parse(analysis.analysis_result) 
                    : analysis.analysis_result;
        
                // Show detailed analysis in a modal or dedicated area
                console.log('Analysis details:', { analysis, result });
                this.showAlert(`جزئیات تحلیل ${analysis.symbol} نمایش داده شد`, 'info');
            }
        } catch (error) {
            console.error('Error loading analysis details:', error);
            this.showAlert('خطا در بارگذاری جزئیات تحلیل', 'error');
        }
    }

    // Enhanced chat with AI context
    async sendChatMessage() {
        const input = document.querySelector('#artemis-chat #chat-input, #chat-input');
        const message = input?.value.trim();

        if (!message) return;

        const messagesContainer = document.querySelector('#artemis-chat #chat-messages, #chat-messages');

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'flex justify-end mb-2';
        userMsg.innerHTML = `<div class="bg-blue-600 text-white p-3 rounded-lg max-w-xs">${message}</div>`;
        messagesContainer.appendChild(userMsg);

        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'flex items-start mb-2';
        typingIndicator.innerHTML = `
            <div class="text-purple-400 text-xl ml-2">🧠</div>
            <div class="bg-purple-600 text-white p-3 rounded-lg max-w-xs">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                آرتمیس در حال فکر...
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await axios.post('/api/ai/chat', {
                message: message,
                context: 'TITAN Trading System Chat'
            });

            // Remove typing indicator
            messagesContainer.removeChild(typingIndicator);

            if (response.data.success) {
                const aiMsg = document.createElement('div');
                aiMsg.className = 'flex items-start mb-2';
                aiMsg.innerHTML = `
                    <div class="text-purple-400 text-xl ml-2">🧠</div>
                    <div class="bg-purple-600 text-white p-3 rounded-lg max-w-xs">
                        ${response.data.data.message}
                        ${response.data.data.confidence ? `<div class="text-xs mt-2 opacity-75">اعتماد: ${response.data.data.confidence}%</div>` : ''}
                    </div>
                `;
                messagesContainer.appendChild(aiMsg);
            } else {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'flex items-start mb-2';
                errorMsg.innerHTML = `
                    <div class="text-red-400 text-xl ml-2">⚠️</div>
                    <div class="bg-red-600 text-white p-3 rounded-lg max-w-xs">
                        متأسفم، خطایی رخ داده است. لطفا دوباره تلاش کنید.
                    </div>
                `;
                messagesContainer.appendChild(errorMsg);
            }
        } catch (error) {
            // Remove typing indicator
            messagesContainer.removeChild(typingIndicator);
    
            const errorMsg = document.createElement('div');
            errorMsg.className = 'flex items-start mb-2';
            errorMsg.innerHTML = `
                <div class="text-red-400 text-xl ml-2">⚠️</div>
                <div class="bg-red-600 text-white p-3 rounded-lg max-w-xs">
                    خطا در ارتباط با آرتمیس. لطفا بعداً تلاش کنید.
                </div>
            `;
            messagesContainer.appendChild(errorMsg);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Environment Variables Management
    async loadEnvVars() {
        try {
            const response = await axios.get('/api/system/env-vars');
            if (response.data.success) {
                const vars = response.data.variables;
        
                // Populate all environment variable fields
                Object.keys(vars).forEach(key => {
                    const element = document.getElementById(`env-${key}`);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = vars[key] === 'true' || vars[key] === true;
                        } else {
                            element.value = vars[key] || '';
                        }
                    }
                });
        
                this.showAlert('تنظیمات بارگذاری شد', 'success');
            } else {
                this.showAlert('خطا در بارگذاری تنظیمات', 'error');
            }
        } catch (error) {
            console.error('Error loading environment variables:', error);
            this.showAlert('خطا در ارتباط با سرور', 'error');
        }
    }

    async saveEnvVars() {
        try {
            const envVars = {};
    
            // Collect all environment variables from form
            const envInputs = document.querySelectorAll('[id^="env-"]');
            envInputs.forEach(input => {
                const key = input.id.replace('env-', '');
                if (input.type === 'checkbox') {
                    envVars[key] = input.checked ? 'true' : 'false';
                } else {
                    envVars[key] = input.value.trim();
                }
            });

            const response = await axios.post('/api/system/env-vars', {
                variables: envVars
            });

            if (response.data.success) {
                this.showAlert('تنظیمات ذخیره شد', 'success');
        
                // Show status message
                const statusDiv = document.getElementById('env-vars-status');
                statusDiv.className = 'mt-4 p-4 bg-green-900/50 border border-green-600 rounded-lg';
                statusDiv.innerHTML = `
                    <div class="flex items-center text-green-400">
                        <i class="fas fa-check-circle mr-2"></i>
                        <span>تنظیمات با موفقیت ذخیره شد. برای اعمال تغییرات، سرویس‌ها را ریستارت کنید.</span>
                    </div>
                `;
                statusDiv.classList.remove('hidden');
            } else {
                this.showAlert('خطا در ذخیره تنظیمات', 'error');
            }
        } catch (error) {
            console.error('Error saving environment variables:', error);
            this.showAlert('خطا در ذخیره تنظیمات', 'error');
        }
    }

    async restartServices() {
        try {
            const statusDiv = document.getElementById('env-vars-status');
            statusDiv.className = 'mt-4 p-4 bg-blue-900/50 border border-blue-600 rounded-lg';
            statusDiv.innerHTML = `
                <div class="flex items-center text-blue-400">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    <span>در حال ریستارت سرویس‌ها...</span>
                </div>
            `;
            statusDiv.classList.remove('hidden');

            const response = await axios.post('/api/system/restart-services');

            if (response.data.success) {
                statusDiv.className = 'mt-4 p-4 bg-green-900/50 border border-green-600 rounded-lg';
                statusDiv.innerHTML = `
                    <div class="flex items-center text-green-400">
                        <i class="fas fa-check-circle mr-2"></i>
                        <span>سرویس‌ها با موفقیت ریستارت شدند. تنظیمات جدید اعمال شد.</span>
                    </div>
                `;
                this.showAlert('سرویس‌ها ریستارت شدند', 'success');
            } else {
                statusDiv.className = 'mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg';
                statusDiv.innerHTML = `
                    <div class="flex items-center text-red-400">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <span>خطا در ریستارت سرویس‌ها: ${response.data.message || 'خطای نامشخص'}</span>
                    </div>
                `;
                this.showAlert('خطا در ریستارت سرویس‌ها', 'error');
            }
        } catch (error) {
            console.error('Error restarting services:', error);
            const statusDiv = document.getElementById('env-vars-status');
            statusDiv.className = 'mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg';
            statusDiv.innerHTML = `
                <div class="flex items-center text-red-400">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span>خطا در ارتباط با سرور</span>
                </div>
            `;
            statusDiv.classList.remove('hidden');
            this.showAlert('خطا در ریستارت سرویس‌ها', 'error');
        }
    }

    showAlert(message, type = 'info') {
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600', 
            warning: 'bg-yellow-600',
            info: 'bg-blue-600'
        };

        const alert = document.createElement('div');
        alert.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-x-full`;
        alert.textContent = message;

        document.body.appendChild(alert);

        // Animate in
        setTimeout(() => {
            alert.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            alert.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 3000);
    }

    // ===========================
    // Watchlist Management 
    // ===========================

        // loadWatchlistData removed - using modular watchlist.js

    async loadUserWatchlist() {
        try {
            const userId = this.currentUser?.id || 'demo_user';
            const response = await axios.get(`/api/watchlist/list/${userId}`);
    
            if (response.data.success) {
                this.watchlistItems = response.data.data;
                this.renderWatchlistTable();
                this.updateWatchlistStats();
            }
        } catch (error) {
            console.error('Error loading user watchlist:', error);
            // Use demo data as fallback
            this.watchlistItems = [
                { id: 'w1', symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto', price_alert_high: 50000, price_alert_low: 40000 },
                { id: 'w2', symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto', price_alert_high: 3000, price_alert_low: 2000 },
                { id: 'w3', symbol: 'SOLUSDT', name: 'Solana', type: 'crypto' },
                { id: 'w4', symbol: 'ADAUSDT', name: 'Cardano', type: 'crypto' },
                { id: 'w5', symbol: 'DOTUSDT', name: 'Polkadot', type: 'crypto' }
            ];
            this.renderWatchlistTable();
        }
    }

    async refreshWatchlistPrices() {
        try {
            const userId = this.currentUser?.id || 'demo_user';
            const response = await axios.get(`/api/watchlist/prices/${userId}`);
    
            if (response.data.success) {
                this.watchlistPrices = response.data.data;
                this.renderWatchlistTable();
                this.updateWatchlistStats();
        
                // Update last update time
                document.getElementById('last-update').textContent = 
                    new Date().toLocaleTimeString('fa-IR');
            }
        } catch (error) {
            console.error('Error refreshing prices:', error);
            if (document.getElementById('last-update')) {
                document.getElementById('last-update').textContent = 'خطا در بروزرسانی';
            }
        }
    }

    renderWatchlistTable() {
        const tableBody = document.getElementById('watchlist-table');
        if (!tableBody) return;

        if (!this.watchlistItems || this.watchlistItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-400">
                        <div class="text-4xl mb-2">📋</div>
                        <p>لیست مورد علاقه خالی است</p>
                        <button onclick="app.showAddToWatchlistModal()" 
                                class="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                            اولین آیتم را اضافه کنید
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        const rows = this.watchlistItems.map(item => {
            const priceData = this.watchlistPrices?.find(p => p.symbol === item.symbol) || {};
            const price = priceData.price || 0;
            const change = priceData.change_percentage_24h || 0;
            const volume = priceData.volume_24h || 0;
    
            const changeClass = change >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = change >= 0 ? '🟢' : '🔴';
    
            const alertStatus = this.getAlertStatus(item, price);
    
            return `
                <tr class="hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="text-lg mr-2">${this.getCryptoEmoji(item.symbol)}</div>
                            <div class="text-white font-medium">${item.symbol}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-300">${item.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-white font-bold">
                        $${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap ${changeClass}">
                        <div class="flex items-center">
                            <span class="mr-1">${changeIcon}</span>
                            ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-300">
                        $${this.formatVolume(volume)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${alertStatus}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button onclick="app.editWatchlistItem('${item.id}')" 
                                    class="text-blue-400 hover:text-blue-300" title="ویرایش">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="app.removeFromWatchlist('${item.id}')" 
                                    class="text-red-400 hover:text-red-300" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button onclick="app.openTradingModal('${item.symbol}')" 
                                    class="text-green-400 hover:text-green-300" title="معامله">
                                <i class="fas fa-exchange-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rows;
    }

    updateWatchlistStats() {
        if (!this.watchlistPrices) return;

        const gainers = this.watchlistPrices.filter(p => p.change_percentage_24h > 0).length;
        const losers = this.watchlistPrices.filter(p => p.change_percentage_24h < 0).length;
        const totalItems = this.watchlistItems?.length || 0;
        const alertsCount = this.countActiveAlerts();

        if (document.getElementById('gainers-count')) {
            document.getElementById('gainers-count').textContent = gainers;
        }
        if (document.getElementById('losers-count')) {
            document.getElementById('losers-count').textContent = losers;
        }
        if (document.getElementById('total-items')) {
            document.getElementById('total-items').textContent = totalItems;
        }
        if (document.getElementById('alerts-count')) {
            document.getElementById('alerts-count').textContent = alertsCount;
        }
    }

    getCryptoEmoji(symbol) {
        const emojis = {
            'BTCUSDT': '₿',
            'ETHUSDT': 'Ξ', 
            'SOLUSDT': '◎',
            'ADAUSDT': '₳',
            'DOTUSDT': '●',
            'BNBUSDT': '🔶',
            'XRPUSDT': '◉',
            'DOGEUSDT': '🐕'
        };
        return emojis[symbol] || '💰';
    }

    formatVolume(volume) {
        if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
        if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
        if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
        return volume.toFixed(0);
    }

    getAlertStatus(item, currentPrice) {
        if (!item.price_alert_high && !item.price_alert_low) {
            return '<span class="text-gray-500">-</span>';
        }

        let alerts = [];
        if (item.price_alert_high && currentPrice >= item.price_alert_high) {
            alerts.push('<span class="text-red-400">🔴 بالا</span>');
        }
        if (item.price_alert_low && currentPrice <= item.price_alert_low) {
            alerts.push('<span class="text-red-400">🔴 پایین</span>');
        }

        if (alerts.length > 0) {
            return alerts.join('<br>');
        }

        return '<span class="text-green-400">✅ تنظیم شده</span>';
    }

    countActiveAlerts() {
        if (!this.watchlistItems || !this.watchlistPrices) return 0;

        let count = 0;
        this.watchlistItems.forEach(item => {
            const priceData = this.watchlistPrices.find(p => p.symbol === item.symbol);
            if (!priceData) return;
    
            if (item.price_alert_high && priceData.price >= item.price_alert_high) count++;
            if (item.price_alert_low && priceData.price <= item.price_alert_low) count++;
        });

        return count;
    }

    setupWatchlistAutoRefresh() {
        // Refresh prices every 30 seconds
        if (this.watchlistRefreshInterval) {
            clearInterval(this.watchlistRefreshInterval);
        }

        this.watchlistRefreshInterval = setInterval(() => {
            if (document.getElementById('watchlist-table')) {
                this.refreshWatchlistPrices();
            }
        }, 30000);

        // Refresh market data every 2 minutes
        if (this.marketRefreshInterval) {
            clearInterval(this.marketRefreshInterval);
        }

        this.marketRefreshInterval = setInterval(() => {
            if (document.getElementById('top-gainers')) {
                this.loadMarketOverview();
                this.loadMarketMovers();
                this.loadFearGreedIndex();
            }
        }, 120000);
    }

    // Modal management
    showAddToWatchlistModal() {
        document.getElementById('add-watchlist-modal').classList.remove('hidden');
        document.getElementById('add-watchlist-modal').classList.add('flex');
        document.getElementById('symbol-search').focus();
    }

    hideAddToWatchlistModal() {
        document.getElementById('add-watchlist-modal').classList.add('hidden');
        document.getElementById('add-watchlist-modal').classList.remove('flex');
        this.clearAddToWatchlistForm();
    }

    clearAddToWatchlistForm() {
        document.getElementById('symbol-search').value = '';
        document.getElementById('alert-high').value = '';
        document.getElementById('alert-low').value = '';
        document.getElementById('watchlist-notes').value = '';
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
        this.selectedCoin = null;
    }

    async addToWatchlist() {
        const symbolSearch = document.getElementById('symbol-search').value.trim();
        const alertHigh = document.getElementById('alert-high').value;
        const alertLow = document.getElementById('alert-low').value;
        const notes = document.getElementById('watchlist-notes').value;

        if (!symbolSearch) {
            this.showAlert('لطفاً نماد را وارد کنید', 'error');
            return;
        }

        try {
            let symbol, name;
    
            // If user selected from search results
            if (this.selectedCoin) {
                symbol = this.selectedCoin.symbol;
                name = this.selectedCoin.name;
            } else {
                // Manual entry
                symbol = symbolSearch.toUpperCase();
                name = symbolSearch;
            }

            const data = {
                user_id: this.currentUser?.id || 'demo_user',
                symbol: symbol,
                name: name,
                type: 'crypto',
                price_alert_high: alertHigh ? parseFloat(alertHigh) : null,
                price_alert_low: alertLow ? parseFloat(alertLow) : null,
                notes: notes
            };

            const response = await axios.post('/api/watchlist/add', data);
    
            if (response.data.success) {
                this.showAlert(`${name} (${symbol}) به watchlist اضافه شد`, 'success');
                this.hideAddToWatchlistModal();
                await this.loadUserWatchlist();
                await this.refreshWatchlistPrices();
            }
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            this.showAlert('خطا در افزودن به watchlist', 'error');
        }
    }

    async removeFromWatchlist(itemId) {
        if (!confirm('آیا از حذف این آیتم اطمینان دارید؟')) return;

        try {
            const response = await axios.delete(`/api/watchlist/remove/${itemId}`);
    
            if (response.data.success) {
                this.showAlert('آیتم از watchlist حذف شد', 'success');
                await this.loadUserWatchlist();
                await this.refreshWatchlistPrices();
            }
        } catch (error) {
            console.error('Error removing from watchlist:', error);
            this.showAlert('خطا در حذف از watchlist', 'error');
        }
    }

    // ===========================
    // Edit Watchlist Modal
    // ===========================

    editWatchlistItem(itemId) {
        const item = this.watchlistItems?.find(i => i.id === itemId);
        if (!item) {
            this.showAlert('آیتم یافت نشد', 'error');
            return;
        }

        // Populate edit form
        document.getElementById('edit-symbol').value = item.symbol;
        document.getElementById('edit-alert-high').value = item.price_alert_high || '';
        document.getElementById('edit-alert-low').value = item.price_alert_low || '';
        document.getElementById('edit-watchlist-notes').value = item.notes || '';

        // Store current item ID for update
        this.currentEditItemId = itemId;

        // Show modal
        document.getElementById('edit-watchlist-modal').classList.remove('hidden');
        document.getElementById('edit-watchlist-modal').classList.add('flex');
    }

    hideEditWatchlistModal() {
        document.getElementById('edit-watchlist-modal').classList.add('hidden');
        document.getElementById('edit-watchlist-modal').classList.remove('flex');
        this.currentEditItemId = null;
    }

    async updateWatchlistItem() {
        if (!this.currentEditItemId) return;

        const alertHigh = document.getElementById('edit-alert-high').value;
        const alertLow = document.getElementById('edit-alert-low').value;
        const notes = document.getElementById('edit-watchlist-notes').value;

        try {
            const data = {
                price_alert_high: alertHigh ? parseFloat(alertHigh) : null,
                price_alert_low: alertLow ? parseFloat(alertLow) : null,
                notes: notes
            };

            const response = await axios.put(`/api/watchlist/update/${this.currentEditItemId}`, data);
    
            if (response.data.success) {
                this.showAlert('watchlist به‌روزرسانی شد', 'success');
                this.hideEditWatchlistModal();
                await this.loadUserWatchlist();
                await this.refreshWatchlistPrices();
            }
        } catch (error) {
            console.error('Error updating watchlist:', error);
            this.showAlert('خطا در به‌روزرسانی watchlist', 'error');
        }
    }

    // ===========================
    // Trading Modal
    // ===========================

    // ===========================
    // Market Data Methods
    // ===========================

    async loadMarketOverview() {
        try {
            const response = await axios.get('/api/market/overview');
    
            if (response.data.success) {
                this.updateMarketOverview(response.data.data);
            }
        } catch (error) {
            console.error('Error loading market overview:', error);
        }
    }

    updateMarketOverview(data) {
        // Format market cap
        const marketCap = this.formatLargeNumber(data.total_market_cap);
        document.getElementById('total-market-cap').textContent = `$${marketCap}`;

        // Format volume
        const volume = this.formatLargeNumber(data.total_volume_24h);
        document.getElementById('total-volume').textContent = `$${volume}`;

        // Market cap change
        const changeElement = document.getElementById('market-cap-change');
        const change = data.market_cap_change_24h;
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        changeElement.className = change >= 0 ? 'text-sm text-green-400' : 'text-sm text-red-400';

        // Dominance
        document.getElementById('btc-dominance').textContent = `${data.btc_dominance.toFixed(1)}%`;
        document.getElementById('eth-dominance').textContent = `${data.eth_dominance.toFixed(1)}%`;
    }

    async loadMarketMovers() {
        try {
            const [gainersResponse, losersResponse] = await Promise.all([
                axios.get('/api/market/movers?type=gainers&limit=5'),
                axios.get('/api/market/movers?type=losers&limit=5')
            ]);
    
            if (gainersResponse.data.success) {
                this.renderMarketMovers('top-gainers', gainersResponse.data.data, 'gainers');
            }
    
            if (losersResponse.data.success) {
                this.renderMarketMovers('top-losers', losersResponse.data.data, 'losers');
            }
        } catch (error) {
            console.error('Error loading market movers:', error);
        }
    }

    renderMarketMovers(containerId, data, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = data.slice(0, 5).map(coin => {
            const change = coin.price_change_percentage_24h;
            const changeClass = change >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = change >= 0 ? '🟢' : '🔴';
    
            return `
                <div class="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                    <div class="flex items-center">
                        <img src="${coin.image}" alt="${coin.name}" class="w-6 h-6 rounded-full mr-2">
                        <div>
                            <div class="text-white text-sm font-medium">${coin.symbol}</div>
                            <div class="text-gray-400 text-xs">#${coin.market_cap_rank}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-white text-sm font-bold">$${coin.current_price.toFixed(coin.current_price < 1 ? 6 : 2)}</div>
                        <div class="flex items-center ${changeClass} text-xs">
                            <span class="mr-1">${changeIcon}</span>
                            ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async loadFearGreedIndex() {
        try {
            const response = await axios.get('/api/market/fear-greed');
    
            if (response.data.success) {
                this.updateFearGreedIndex(response.data.data);
            }
        } catch (error) {
            console.error('Error loading fear & greed index:', error);
        }
    }

    updateFearGreedIndex(data) {
        const value = data.value;
        const classification = data.classification;

        // Update value and status
        document.getElementById('fear-greed-value').textContent = value;
        document.getElementById('fear-greed-status').textContent = this.translateFearGreed(classification);

        // Update emoji
        const emoji = this.getFearGreedEmoji(value);
        document.getElementById('fear-greed-emoji').textContent = emoji;

        // Update progress bar
        const bar = document.getElementById('fear-greed-bar');
        bar.style.width = `${value}%`;
        bar.className = `h-3 rounded-full transition-all duration-500 ${this.getFearGreedColor(value)}`;

        // Update timestamp
        const updateTime = new Date(data.timestamp).toLocaleTimeString('fa-IR');
        document.getElementById('fear-greed-update').textContent = `آپدیت: ${updateTime}`;
    }

    getFearGreedEmoji(value) {
        if (value >= 75) return '🤑'; // Extreme Greed
        if (value >= 55) return '😎'; // Greed
        if (value >= 45) return '😐'; // Neutral
        if (value >= 25) return '😰'; // Fear
        return '😱'; // Extreme Fear
    }

    getFearGreedColor(value) {
        if (value >= 75) return 'bg-green-500';
        if (value >= 55) return 'bg-green-400';
        if (value >= 45) return 'bg-yellow-400';
        if (value >= 25) return 'bg-orange-400';
        return 'bg-red-500';
    }

    translateFearGreed(classification) {
        const translations = {
            'Extreme Greed': 'طمع شدید',
            'Greed': 'طمع',
            'Neutral': 'خنثی',
            'Fear': 'ترس',
            'Extreme Fear': 'ترس شدید'
        };
        return translations[classification] || classification;
    }

    async loadTrendingCoins() {
        try {
            const response = await axios.get('/api/market/trending');
    
            if (response.data.success) {
                this.renderTrendingCoins(response.data.data);
            }
        } catch (error) {
            console.error('Error loading trending coins:', error);
        }
    }

    renderTrendingCoins(data) {
        const container = document.getElementById('trending-coins');
        if (!container) return;

        const html = data.slice(0, 7).map((coin, index) => {
            return `
                <div class="inline-block bg-gray-700 rounded-lg p-3 mr-3 mb-3 hover:bg-gray-600 cursor-pointer transition-colors"
                     onclick="app.addCoinToWatchlist('${coin.id}', '${coin.symbol}', '${coin.name}')">
                    <div class="flex items-center">
                        <span class="text-blue-400 text-sm mr-2">#${index + 1}</span>
                        <img src="${coin.image}" alt="${coin.name}" class="w-6 h-6 rounded-full mr-2">
                        <div>
                            <div class="text-white text-sm font-medium">${coin.symbol.toUpperCase()}</div>
                            <div class="text-gray-400 text-xs">${coin.name}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    formatLargeNumber(num) {
        if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toFixed(0);
    }

    async refreshMarketData() {
        try {
            // Show loading state
            document.querySelector('#top-gainers').innerHTML = '<div class="text-center text-gray-400 py-4">در حال بارگذاری...</div>';
            document.querySelector('#top-losers').innerHTML = '<div class="text-center text-gray-400 py-4">در حال بارگذاری...</div>';
    
            // Reload all market data
            await Promise.all([
                this.loadMarketOverview(),
                this.loadMarketMovers(),
                this.loadFearGreedIndex(),
                this.loadTrendingCoins()
            ]);
    
            this.showAlert('داده‌های بازار بروزرسانی شد', 'success');
        } catch (error) {
            console.error('Error refreshing market data:', error);
            this.showAlert('خطا در بروزرسانی داده‌های بازار', 'error');
        }
    }

    async addCoinToWatchlist(coinId, symbol, name) {
        // Quick add to watchlist from trending
        try {
            const data = {
                user_id: this.currentUser?.id || 'demo_user',
                symbol: symbol.toUpperCase(),
                name: name,
                type: 'crypto'
            };

            const response = await axios.post('/api/watchlist/add', data);
    
            if (response.data.success) {
                this.showAlert(`${name} (${symbol.toUpperCase()}) به watchlist اضافه شد`, 'success');
                await this.loadUserWatchlist();
                await this.refreshWatchlistPrices();
            }
        } catch (error) {
            console.error('Error adding trending coin to watchlist:', error);
            this.showAlert('خطا در افزودن به watchlist', 'error');
        }
    }

    openTradingModal(symbol) {
        const priceData = this.watchlistPrices?.find(p => p.symbol === symbol);
        if (!priceData) {
            this.showAlert('داده قیمت یافت نشد', 'error');
            return;
        }

        // Populate trading form
        document.getElementById('trading-symbol').textContent = symbol;
        document.getElementById('trading-price').textContent = `$${priceData.price.toLocaleString()}`;

        const change = priceData.change_percentage_24h;
        const changeElement = document.getElementById('trading-change');
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        changeElement.className = change >= 0 ? 'text-green-400' : 'text-red-400';

        // Store current trading data
        this.currentTradingSymbol = symbol;
        this.currentTradingPrice = priceData.price;
        this.currentTradeType = 'buy';

        // Reset form
        document.getElementById('trade-amount').value = '100';
        this.calculateTradeQuantity();
        this.setTradeType('buy');

        // Show modal
        document.getElementById('trading-modal').classList.remove('hidden');
        document.getElementById('trading-modal').classList.add('flex');
    }

    hideTradingModal() {
        document.getElementById('trading-modal').classList.add('hidden');
        document.getElementById('trading-modal').classList.remove('flex');
        this.currentTradingSymbol = null;
        this.currentTradingPrice = null;
        this.currentTradeType = null;
    }

    setTradeType(type) {
        this.currentTradeType = type;

        // Update buttons
        document.querySelectorAll('.trade-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = type === 'buy' ? 'buy-btn' : 'sell-btn';
        document.getElementById(activeBtn).classList.add('active');

        // Update execute button
        const executeBtn = document.getElementById('execute-trade-btn');
        if (type === 'buy') {
            executeBtn.innerHTML = '<i class="fas fa-arrow-up mr-2"></i>خرید';
            executeBtn.className = 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700';
        } else {
            executeBtn.innerHTML = '<i class="fas fa-arrow-down mr-2"></i>فروش';
            executeBtn.className = 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700';
        }
    }

    calculateTradeQuantity() {
        const amount = parseFloat(document.getElementById('trade-amount').value) || 0;
        const price = this.currentTradingPrice || 1;
        const quantity = amount / price;

        document.getElementById('trade-quantity').value = quantity.toFixed(8);
    }

    async executeTrade() {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        const quantity = parseFloat(document.getElementById('trade-quantity').value);

        if (!amount || amount <= 0) {
            this.showAlert('لطفاً مقدار معتبر وارد کنید', 'error');
            return;
        }

        try {
            // Demo trade execution
            const tradeData = {
                symbol: this.currentTradingSymbol,
                type: this.currentTradeType,
                amount: amount,
                quantity: quantity,
                price: this.currentTradingPrice,
                timestamp: new Date().toISOString()
            };

            // Simulate API call (demo mode)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            const action = this.currentTradeType === 'buy' ? 'خرید' : 'فروش';
            this.showAlert(
                `${action} ${quantity.toFixed(8)} ${this.currentTradingSymbol} به مبلغ $${amount} در حالت دمو انجام شد`, 
                'success'
            );

            this.hideTradingModal();

            // Update demo portfolio (if exists)
            this.updateDemoPortfolio(tradeData);

        } catch (error) {
            console.error('Error executing trade:', error);
            this.showAlert('خطا در انجام معامله', 'error');
        }
    }

    updateDemoPortfolio(tradeData) {
        // Simple demo portfolio update
        if (!this.demoPortfolio) {
            this.demoPortfolio = {};
        }

        const symbol = tradeData.symbol;
        if (!this.demoPortfolio[symbol]) {
            this.demoPortfolio[symbol] = { quantity: 0, totalCost: 0 };
        }

        if (tradeData.type === 'buy') {
            this.demoPortfolio[symbol].quantity += tradeData.quantity;
            this.demoPortfolio[symbol].totalCost += tradeData.amount;
        } else {
            this.demoPortfolio[symbol].quantity -= tradeData.quantity;
            this.demoPortfolio[symbol].totalCost -= tradeData.amount;
        }

        console.log('Demo Portfolio Updated:', this.demoPortfolio);
    }

    // ===========================
    // Search Functionality
    // ===========================

    async searchSymbols(query) {
        if (!query || query.length < 2) {
            document.getElementById('search-results').classList.add('hidden');
            return;
        }

        try {
            const response = await axios.get(`/api/watchlist/search/${encodeURIComponent(query)}`);
    
            if (response.data.success && response.data.data.length > 0) {
                this.renderSearchResults(response.data.data);
            } else {
                this.renderSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.renderSearchResults([]);
        }
    }

    renderSearchResults(results) {
        const container = document.getElementById('search-results');

        if (results.length === 0) {
            container.innerHTML = '<div class="p-3 text-gray-400 text-center">نتیجه‌ای یافت نشد</div>';
            container.classList.remove('hidden');
            return;
        }

        const html = results.map(result => `
            <div class="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0" 
                 onclick="app.selectSearchResult('${result.symbol}', '${result.name}', '${result.id}')">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-white font-medium">${result.symbol}</div>
                        <div class="text-gray-400 text-sm">${result.name}</div>
                    </div>
                    <div class="text-xs text-gray-500">
                        ${result.market_cap_rank ? `#${result.market_cap_rank}` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
        container.classList.remove('hidden');
    }

    selectSearchResult(symbol, name, coinId) {
        document.getElementById('symbol-search').value = `${symbol} - ${name}`;
        document.getElementById('search-results').classList.add('hidden');

        // Store selected coin data
        this.selectedCoin = { symbol, name, coinId };
    }

    // Alerts and Notifications Functions
        // loadAlertsData removed - using modular alerts.js

    updateAlertsOverview(alertsData) {
        const newAlertsCount = alertsData.unreadCount;
        const todayAlerts = alertsData.data.filter(alert => {
            const today = new Date();
            const alertDate = new Date(alert.timestamp);
            return alertDate.toDateString() === today.toDateString();
        }).length;

        document.getElementById('new-alerts-count').textContent = newAlertsCount;
        document.getElementById('today-alerts-count').textContent = todayAlerts;

        // These will be updated when rules are loaded
        setTimeout(() => {
            document.getElementById('active-rules-count').textContent = '4';
            document.getElementById('rules-performance').textContent = '85%';
        }, 500);
    }

    updateAlertRulesTable(rules) {
        const tableBody = document.getElementById('alert-rules-table');
        if (!tableBody) return;

        tableBody.innerHTML = rules.map(rule => {
            const statusClass = rule.isActive ? 'text-green-400' : 'text-gray-400';
            const statusText = rule.isActive ? 'فعال' : 'غیرفعال';
    
            return `
                <tr class="hover:bg-gray-700">
                    <td class="px-4 py-3 text-sm text-white">${this.getAlertTypeText(rule.type)}</td>
                    <td class="px-4 py-3 text-sm text-gray-300">${rule.symbol || 'همه'}</td>
                    <td class="px-4 py-3 text-sm text-gray-300">${rule.condition}</td>
                    <td class="px-4 py-3 text-sm text-white">${rule.target.toLocaleString()}</td>
                    <td class="px-4 py-3">
                        <span class="text-sm ${statusClass}">${statusText}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-300">${rule.triggeredCount}</td>
                    <td class="px-4 py-3">
                        <div class="flex gap-1">
                            <button onclick="app.toggleAlertRule('${rule.id}')" 
                                    class="px-2 py-1 text-xs ${rule.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded">
                                ${rule.isActive ? 'غیرفعال' : 'فعال'}
                            </button>
                            <button onclick="app.deleteAlertRule('${rule.id}')" 
                                    class="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded">
                                حذف
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateAlertsHistory(alerts) {
        const container = document.getElementById('alerts-history-list');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400">هشداری یافت نشد</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => {
            const severityColors = {
                low: 'border-l-blue-500',
                medium: 'border-l-yellow-500',
                high: 'border-l-orange-500',
                critical: 'border-l-red-500'
            };
    
            const severityIcons = {
                low: '📘',
                medium: '⚠️',
                high: '🔥',
                critical: '🚨'
            };
    
            const timeAgo = this.getTimeAgo(alert.timestamp);
    
            return `
                <div class="bg-gray-700 rounded-lg p-4 border-l-4 ${severityColors[alert.severity]} ${alert.isRead ? 'opacity-75' : ''}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-lg">${severityIcons[alert.severity]}</span>
                                <span class="text-sm font-medium text-white">${alert.title}</span>
                                <span class="text-xs text-gray-400">${timeAgo}</span>
                                ${!alert.isRead ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
                            </div>
                            <p class="text-sm text-gray-300">${alert.message}</p>
                            ${alert.symbol ? `<span class="inline-block mt-1 px-2 py-1 bg-gray-600 text-xs rounded">${alert.symbol}</span>` : ''}
                        </div>
                        <button onclick="app.markAlertRead('${alert.id}')" 
                                class="text-xs text-blue-400 hover:text-blue-300 ml-2">
                            ${alert.isRead ? '✓' : 'علامت‌گذاری'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async toggleAlertsPanel() {
        const panel = document.getElementById('alerts-panel');
        if (!panel) return;

        if (panel.classList.contains('hidden')) {
            // Load recent alerts
            await this.loadRecentAlerts();
            panel.classList.remove('hidden');
    
            // Close on outside click
            setTimeout(() => {
                document.addEventListener('click', this.closeAlertsPanel.bind(this), { once: true });
            }, 100);
        } else {
            panel.classList.add('hidden');
        }
    }

    closeAlertsPanel(event) {
        const panel = document.getElementById('alerts-panel');
        const button = event.target.closest('button');

        if (panel && !panel.contains(event.target) && !button?.onclick?.toString().includes('toggleAlertsPanel')) {
            panel.classList.add('hidden');
        }
    }

    async loadRecentAlerts() {
        const userId = this.currentUser?.id || 'demo_user';

        try {
            const response = await axios.get(`/api/alerts/alerts/${userId}?limit=5`);
    
            if (response.data.success) {
                const alertsList = document.getElementById('alerts-list');
                if (!alertsList) return;
        
                if (response.data.data.length === 0) {
                    alertsList.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">هشداری وجود ندارد</div>';
                    return;
                }
        
                alertsList.innerHTML = response.data.data.map(alert => {
                    const timeAgo = this.getTimeAgo(alert.timestamp);
                    return `
                        <div class="p-3 hover:bg-gray-700 border-b border-gray-700 last:border-0 ${alert.isRead ? 'opacity-75' : ''}">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-white">${alert.title}</span>
                                <span class="text-xs text-gray-400">${timeAgo}</span>
                            </div>
                            <p class="text-xs text-gray-300">${alert.message}</p>
                            ${!alert.isRead ? '<div class="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>' : ''}
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Recent alerts error:', error);
        }
    }

    updateAlertsBadge(count) {
        const badge = document.getElementById('alerts-badge');
        if (!badge) return;

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    async createAlertRule() {
        const type = document.getElementById('alert-type').value;
        const symbol = document.getElementById('alert-symbol').value;
        const condition = document.getElementById('alert-condition').value;
        const target = parseFloat(document.getElementById('alert-target').value);

        if (!target || isNaN(target)) {
            this.showAlert('لطفاً مقدار هدف معتبری وارد کنید', 'error');
            return;
        }

        const userId = this.currentUser?.id || 'demo_user';

        try {
            const response = await axios.post('/api/alerts/rules', {
                userId,
                type,
                symbol,
                condition: this.getConditionText(condition),
                target,
                operator: condition
            });
    
            if (response.data.success) {
                this.showAlert('قانون هشدار با موفقیت ایجاد شد', 'success');
        
                // Clear form
                document.getElementById('alert-target').value = '';
        
                // Refresh rules
                await this.refreshAlertRules();
            }
        } catch (error) {
            console.error('Create alert rule error:', error);
            this.showAlert('خطا در ایجاد قانون هشدار', 'error');
        }
    }

    async refreshAlertRules() {
        await this.loadAlertsData();
        this.showAlert('قوانین هشدار بروزرسانی شد', 'success');
    }

    async loadAlerts(unreadOnly = false) {
        const userId = this.currentUser?.id || 'demo_user';

        try {
            const response = await axios.get(`/api/alerts/alerts/${userId}?limit=50${unreadOnly ? '&unread=true' : ''}`);
    
            if (response.data.success) {
                this.updateAlertsHistory(response.data.data);
            }
        } catch (error) {
            console.error('Load alerts error:', error);
            this.showAlert('خطا در بارگذاری هشدارها', 'error');
        }
    }

    async markAlertRead(alertId) {
        try {
            const response = await axios.patch(`/api/alerts/alerts/${alertId}/read`);
    
            if (response.data.success) {
                // Refresh alerts
                await this.loadAlerts();
                await this.loadRecentAlerts();
            }
        } catch (error) {
            console.error('Mark alert read error:', error);
        }
    }

    async markAllAlertsRead() {
        const userId = this.currentUser?.id || 'demo_user';

        try {
            // In real app, would call API to mark all as read
            this.showAlert('همه هشدارها به عنوان خوانده شده علامت‌گذاری شدند', 'success');
            this.updateAlertsBadge(0);
            await this.loadRecentAlerts();
        } catch (error) {
            console.error('Mark all read error:', error);
        }
    }

    // Helper functions for alerts
    getAlertTypeText(type) {
        const types = {
            price: 'قیمت',
            technical: 'تکنیکال',
            portfolio: 'پورتفولیو',
            news: 'اخبار'
        };
        return types[type] || type;
    }

    getConditionText(condition) {
        const conditions = {
            greater: 'بزرگتر از',
            less: 'کوچکتر از',
            crosses_above: 'عبور از بالا',
            crosses_below: 'عبور از پایین'
        };
        return conditions[condition] || condition;
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'اکنون';
        if (minutes < 60) return `${minutes} دقیقه پیش`;
        if (hours < 24) return `${hours} ساعت پیش`;
        return `${days} روز پیش`;
    }

    async toggleAlertRule(ruleId) {
        // In real app, would call API to toggle rule status
        this.showAlert('وضعیت قانون هشدار تغییر کرد', 'success');
        await this.refreshAlertRules();
    }

    async deleteAlertRule(ruleId) {
        if (!confirm('آیا از حذف این قانون هشدار مطمئن هستید؟')) {
            return;
        }

        // In real app, would call API to delete rule
        this.showAlert('قانون هشدار حذف شد', 'success');
        await this.refreshAlertRules();
    }

    // Initialize alerts auto-refresh
    initAlertsAutoRefresh() {
        // Check for new alerts every 30 seconds
        setInterval(async () => {
            if (this.currentUser) {
                const userId = this.currentUser.id || 'demo_user';
                try {
                    const response = await axios.get(`/api/alerts/alerts/${userId}?limit=1`);
                    if (response.data.success) {
                        this.updateAlertsBadge(response.data.unreadCount);
                    }
                } catch (error) {
                    // Silently ignore errors for background refresh
                }
            }
        }, 30000);
    }

    // ===== DRAG & DROP DASHBOARD SYSTEM =====
    
        // loadDashboardData removed - using modular dashboard.js

    loadFallbackDashboard() {
        try {
            const dashboardContent = document.getElementById('dashboard-content');
            if (dashboardContent) {
                dashboardContent.innerHTML = `
                    <div class="p-8 text-center">
                        <div class="bg-yellow-600 text-white p-4 rounded-lg mb-4">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            داشبورد در حالت محدود بارگذاری شد
                        </div>
                        <p class="text-gray-400 mb-4">امکان اتصال به سرور وجود ندارد. لطفاً دوباره تلاش کنید.</p>
                        <button onclick="app.loadModule('dashboard')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
                            <i class="fas fa-refresh mr-2"></i>
                            تلاش مجدد
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Fallback dashboard error:', error);
        }
    }

    async loadDashboardLayout() {
        const userId = this.currentUser?.id || 'demo_user';

        try {
            const response = await axios.get(`/api/widgets/layout/${userId}`);
    
            if (response.data.success) {
                this.dashboardLayout = response.data.data;
                this.renderDashboardGrid();
            }
        } catch (error) {
            console.error('Layout load error:', error);
            // Use default layout
            this.dashboardLayout = this.getDefaultLayout();
            this.renderDashboardGrid();
        }
    }

    renderDashboardGrid() {
        const container = document.getElementById('dashboard-grid');
        if (!container || !this.dashboardLayout) return;

        container.innerHTML = '';

        this.dashboardLayout.widgets.forEach(widget => {
            if (widget.isVisible) {
                const widgetElement = this.createWidgetElement(widget);
                container.appendChild(widgetElement);
            }
        });

        // Initialize drag & drop if in edit mode
        if (this.isEditMode) {
            this.initializeDragAndDrop();
        }
    }

    createWidgetElement(widget) {
        const element = document.createElement('div');
        element.className = `dashboard-widget widget-${widget.size.width}x${widget.size.height}`;
        element.id = widget.id;
        element.dataset.widgetType = widget.type;
        element.style.gridColumn = `${widget.position.x + 1} / span ${widget.size.width}`;
        element.style.gridRow = `${widget.position.y + 1} / span ${widget.size.height}`;

        // Add edit mode class if needed
        if (this.isEditMode) {
            element.classList.add('edit-mode');
        }

        element.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">${this.getWidgetIcon(widget.type)}</span>
                    ${widget.title}
                </div>
                <div class="widget-controls">
                    <button class="widget-control-btn widget-resize-btn" onclick="app.resizeWidget('${widget.id}')" title="تغییر اندازه">
                        <i class="fas fa-expand-arrows-alt"></i>
                    </button>
                    <button class="widget-control-btn widget-remove-btn" onclick="app.removeWidget('${widget.id}')" title="حذف">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content" id="widget-content-${widget.id}">
                <div class="flex items-center justify-center h-full text-gray-400">
                    <div class="text-center">
                        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                        <p class="text-sm">در حال بارگذاری...</p>
                    </div>
                </div>
            </div>
        `;

        return element;
    }

    getWidgetIcon(type) {
        const icons = {
            portfolio_summary: '💰',
            market_overview: '📊',
            watchlist: '🎯',
            trading_signals: '📈',
            news_feed: '📰',
            performance_chart: '📊',
            fear_greed: '😰',
            top_movers: '🚀',
            ai_recommendations: '🤖'
        };
        return icons[type] || '📊';
    }

    async loadAllWidgets() {
        if (!this.dashboardLayout) return;

        const visibleWidgets = this.dashboardLayout.widgets.filter(w => w.isVisible);

        // Load widget data in parallel
        const widgetPromises = visibleWidgets.map(widget => this.loadWidgetData(widget));
        await Promise.all(widgetPromises);
    }

    async loadWidgetData(widget) {
        const contentElement = document.getElementById(`widget-content-${widget.id}`);
        if (!contentElement) return;

        try {
            let content = '';

            switch (widget.type) {
                case 'portfolio_summary':
                    content = await this.renderPortfolioSummaryWidget(widget);
                    break;
                case 'market_overview':
                    content = await this.renderMarketOverviewWidget(widget);
                    break;
                case 'watchlist':
                    content = await this.renderWatchlistWidget(widget);
                    break;
                case 'trading_signals':
                    content = await this.renderTradingSignalsWidget(widget);
                    break;
                case 'news_feed':
                    content = await this.renderNewsFeedWidget(widget);
                    break;
                case 'performance_chart':
                    content = await this.renderPerformanceChartWidget(widget);
                    break;
                case 'fear_greed':
                    content = await this.renderFearGreedWidget(widget);
                    break;
                case 'top_movers':
                    content = await this.renderTopMoversWidget(widget);
                    break;
                case 'ai_recommendations':
                    content = await this.renderAIRecommendationsWidget(widget);
                    break;
                default:
                    content = '<div class="text-center text-gray-400">نوع ویجت ناشناخته</div>';
            }

            contentElement.innerHTML = content;

            // Initialize widget-specific functionality
            await this.initializeWidgetBehavior(widget);

        } catch (error) {
            console.error(`Widget ${widget.id} load error:`, error);
            contentElement.innerHTML = `
                <div class="text-center text-red-400">
                    <i class="fas fa-exclamation-triangle text-xl mb-2"></i>
                    <p class="text-sm">خطا در بارگذاری</p>
                </div>
            `;
        }
    }

    async renderPortfolioSummaryWidget(widget) {
        try {
            // Get real portfolio data from API
            const fetchResponse = await fetch('/api/dashboard/comprehensive', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!fetchResponse.ok) {
                console.warn('Portfolio API failed');
                return '<div class="text-center text-gray-400">خطا در بارگذاری پورتفولیو</div>';
            }
            
            const response = await fetchResponse.json();
            
            if (!response.success || !response.data?.portfolio) {
                console.warn('Portfolio API failed, using fallback');
                return '<div class="text-center text-gray-400">خطا در بارگذاری پورتفولیو</div>';
            }
            
            const portfolio = response.data.portfolio;
            const totalValue = portfolio.totalBalance || 0;
            const totalPnL = portfolio.totalPnL || 0;
            const roi = totalValue > 0 ? (totalPnL / totalValue * 100) : 0;
    
            const changeClass = totalPnL >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = totalPnL >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
            return `
                <div class="widget-metric">
                    <div class="widget-metric-value">$${totalValue.toLocaleString()}</div>
                    <div class="widget-metric-label">ارزش کل پورتفولیو</div>
                    <div class="widget-metric-change ${changeClass}">
                        <i class="fas ${changeIcon}"></i>
                        ${totalPnL >= 0 ? '+' : ''}$${Math.abs(totalPnL).toFixed(2)} (${roi.toFixed(2)}%)
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Portfolio summary widget error:', error);
            return '<div class="text-center text-gray-400">خطا در بارگذاری پورتفولیو</div>';
        }
    }

    async renderMarketOverviewWidget(widget) {
        try {
            // Get real market data from API
            const response = await fetch('/api/dashboard/comprehensive', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = response.ok ? await response.json() : {};
            const marketData = data.data?.market || {
                total_market_cap: 0,
                total_volume_24h: 0,
                market_cap_change_24h: 0,
                btc_dominance: 0
            };
    
            const changeClass = marketData.market_cap_change_24h >= 0 ? 'text-green-400' : 'text-red-400';
    
            return `
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">کل بازار:</span>
                        <span class="text-white font-semibold">$${(marketData.total_market_cap / 1e12).toFixed(2)}T</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">حجم 24ساعته:</span>
                        <span class="text-white font-semibold">$${(marketData.total_volume_24h / 1e9).toFixed(1)}B</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">تغییر 24ساعته:</span>
                        <span class="${changeClass} font-semibold">
                            ${marketData.market_cap_change_24h >= 0 ? '+' : ''}${marketData.market_cap_change_24h.toFixed(2)}%
                        </span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">غالبیت BTC:</span>
                        <span class="text-orange-400 font-semibold">${marketData.btc_dominance.toFixed(1)}%</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-700 text-center">
                        <div class="text-xs text-gray-400">آخرین بروزرسانی</div>
                        <div class="text-xs text-gray-300">${new Date().toLocaleTimeString('fa-IR')}</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Market overview widget error:', error);
            return '<div class="text-center text-gray-400">خطا در بارگذاری اطلاعات بازار</div>';
        }
    }

    async renderFearGreedWidget(widget) {
        try {
            // Fetch real Fear & Greed Index from API
            let data = {
                value: 50,
                value_classification: 'Neutral',
                last_updated: new Date().toISOString()
            };
            
            try {
                const response = await fetch('/api/market/fear-greed', {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const apiData = await response.json();
                    if (apiData.success && apiData.data) {
                        data = apiData.data;
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch Fear & Greed Index:', error);
            }
            let emotion = '😐';
            let color = 'text-gray-400';
            let status = 'خنثی';
    
            if (data.value >= 75) {
                emotion = '🤑';
                color = 'text-green-400';
                status = 'طمع شدید';
            } else if (data.value >= 50) {
                emotion = '😊';
                color = 'text-green-300'; 
                status = 'طمع';
            } else if (data.value >= 25) {
                emotion = '😐';
                color = 'text-yellow-400';
                status = 'خنثی';
            } else {
                emotion = '😨';
                color = 'text-red-400';
                status = 'ترس';
            }
    
            return `
                <div class="widget-metric">
                    <div class="text-4xl mb-2">${emotion}</div>
                    <div class="widget-metric-value ${color}">${data.value || 'N/A'}</div>
                    <div class="widget-metric-label">شاخص ترس و طمع</div>
                    <div class="widget-metric-change text-xs text-gray-400 mt-1">${status}</div>
                </div>
            `;
        } catch (error) {
            console.error('Fear greed widget error:', error);
            return `
                <div class="widget-metric">
                    <div class="text-4xl mb-2">😐</div>
                    <div class="widget-metric-value text-gray-400">--</div>
                    <div class="widget-metric-label">شاخص ترس و طمع</div>
                    <div class="widget-metric-change text-xs text-gray-400 mt-1">در دسترس نیست</div>
                </div>
            `;
        }
    }

    // Initialize dashboard auto-refresh
    initDashboardAutoRefresh() {
        // Refresh all widgets every 2 minutes
        if (this.dashboardRefreshInterval) {
            clearInterval(this.dashboardRefreshInterval);
        }

        this.dashboardRefreshInterval = setInterval(() => {
            if (this.currentModule === 'dashboard') {
                this.loadAllWidgets();
            }
        }, 2 * 60 * 1000); // 2 minutes
    }

    // Dashboard management functions
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const button = document.getElementById('edit-mode-btn');
        const overlay = document.getElementById('edit-mode-overlay');

        if (this.isEditMode) {
            button.innerHTML = '<i class="fas fa-check"></i> حالت ویرایش';
            button.className = 'px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm';
            overlay.classList.remove('hidden');
    
            // Add edit mode class to all widgets
            document.querySelectorAll('.dashboard-widget').forEach(widget => {
                widget.classList.add('edit-mode');
            });
    
            this.initializeDragAndDrop();
        } else {
            button.innerHTML = '<i class="fas fa-edit"></i> ویرایش چیدمان';
            button.className = 'px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm';
            overlay.classList.add('hidden');
    
            // Remove edit mode class
            document.querySelectorAll('.dashboard-widget').forEach(widget => {
                widget.classList.remove('edit-mode');
            });
    
            this.destroyDragAndDrop();
        }
    }

    async saveLayout() {
        const userId = this.currentUser?.id || 'demo_user';

        try {
            const response = await axios.post('/api/widgets/layout', {
                userId,
                layoutName: 'default',
                widgets: this.dashboardLayout.widgets
            });
    
            if (response.data.success) {
                this.showAlert('چیدمان داشبورد ذخیره شد', 'success');
                this.toggleEditMode();
            }
        } catch (error) {
            console.error('Save layout error:', error);
            this.showAlert('خطا در ذخیره چیدمان', 'error');
        }
    }

    cancelEditMode() {
        // Reload original layout
        this.loadDashboardLayout();
        this.toggleEditMode();
    }

    async refreshDashboard() {
        await this.loadAllWidgets();
        document.getElementById('last-update').textContent = new Date().toLocaleString('fa-IR');
        this.showAlert('داشبورد بروزرسانی شد', 'success');
    }

    // Widget rendering functions (continued)
    async renderWatchlistWidget(widget) {
        // Fetch real-time cryptocurrency prices from API
        let coins = [];
        try {
            const response = await fetch('/api/market/prices?symbols=BTC,ETH,ADA,DOT,LINK', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // Transform API data to coins array
                    coins = Object.values(data.data).map((coin, idx) => ({
                        symbol: coin.symbol,
                        name: coin.name,
                        current_price: coin.current_price,
                        price_change_percentage_24h: coin.price_change_percentage_24h,
                        market_cap_rank: idx + 1,
                        favorite: true
                    }));
                }
            }
        } catch (error) {
            console.warn('Failed to fetch watchlist prices:', error);
            // Fallback to empty array if API fails
            coins = [];
        }
        
        // Limit coins based on widget settings
        coins = coins.slice(0, widget.settings?.limit || 5);

        return `
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">لیست مورد علاقه</h3>
                    <button onclick="app.showAddToWatchlistModal()" class="text-gray-400 hover:text-white text-sm hover:bg-gray-700 rounded px-2 py-1 transition-colors">
                        <i class="fas fa-plus"></i> افزودن
                    </button>
                </div>
                <div class="space-y-3">
                    ${coins.map(coin => {
                        const changeClass = coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400';
                        const changeIcon = coin.price_change_percentage_24h >= 0 ? '▲' : '▼';
                        return `
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors cursor-pointer">
                                <div class="flex items-center space-x-3 space-x-reverse">
                                    <div class="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        ${coin.symbol.charAt(0)}
                                    </div>
                                    <div>
                                        <div class="font-medium text-white">${coin.symbol}</div>
                                        <div class="text-xs text-gray-400">${coin.name}</div>
                                    </div>
                                </div>
                                <div class="text-left">
                                    <div class="font-medium text-white">$${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                                    <div class="flex items-center ${changeClass} text-xs">
                                        <span class="mr-1">${changeIcon}</span>
                                        ${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%
                                    </div>
                                </div>
                                <button onclick="app.toggleWatchlistFavorite('${coin.symbol}')" class="text-yellow-400 hover:text-yellow-300 ml-2 p-1 rounded hover:bg-gray-600 transition-colors">
                                    <i class="fas fa-star"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="mt-4 pt-3 border-t border-gray-600">
                    <button onclick="app.showWatchlistPage()" class="w-full text-blue-400 hover:text-blue-300 text-sm font-medium hover:bg-gray-700 rounded py-2 transition-colors">
                        مشاهده همه
                    </button>
                </div>
            </div>
        `;
    }

    async renderTopMoversWidget(widget) {
        // Fetch real top movers from API
        let topGainers = [];
        let topLosers = [];
        
        try {
            const response = await fetch('/api/market/top-movers', {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success && apiData.data) {
                    topGainers = apiData.data.gainers || [];
                    topLosers = apiData.data.losers || [];
                }
            }
        } catch (error) {
            console.warn('Failed to fetch top movers:', error);
        }

        const allMovers = [...topGainers, ...topLosers].slice(0, widget.settings?.limit || 5);

        return `
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white mb-2">بالاترین تغییرات</h3>
                    <div class="flex space-x-2 space-x-reverse">
                        <button onclick="app.filterTopMovers('gainers')" id="gainers-btn-${widget.id}" class="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors cursor-pointer">صعودی</button>
                        <button onclick="app.filterTopMovers('losers')" id="losers-btn-${widget.id}" class="px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors cursor-pointer">نزولی</button>
                    </div>
                </div>
                <div class="space-y-3">
                    ${allMovers.map(coin => {
                        const isGainer = coin.price_change_percentage_24h >= 0;
                        const changeClass = isGainer ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20';
                        const changeIcon = isGainer ? '🚀' : '📉';
                        return `
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                                <div class="flex items-center space-x-3 space-x-reverse">
                                    <div class="text-lg">${changeIcon}</div>
                                    <div>
                                        <div class="font-medium text-white">${coin.symbol}</div>
                                        <div class="text-xs text-gray-400">${coin.name}</div>
                                    </div>
                                </div>
                                <div class="text-left">
                                    <div class="text-sm text-white">$${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</div>
                                    <div class="flex items-center justify-end">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium ${changeClass}">
                                            ${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-gray-600">
                    <div class="text-center">
                        <div class="text-green-400 font-bold text-lg">+12.4%</div>
                        <div class="text-xs text-gray-400">میانگین صعودی</div>
                    </div>
                    <div class="text-center">
                        <div class="text-red-400 font-bold text-lg">-7.3%</div>
                        <div class="text-xs text-gray-400">میانگین نزولی</div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderNewsFeedWidget(widget) {
        try {
            const response = await axios.get(`/api/alerts/news?limit=${widget.settings?.limit || 3}`);
    
            if (response.data.success && response.data.data.length > 0) {
                const news = response.data.data;
        
                return `
                    <div class="space-y-3">
                        ${news.map(item => `
                            <div class="widget-news-item">
                                <div class="widget-news-title">${item.title}</div>
                                <div class="widget-news-time">${this.getTimeAgo(item.publishedAt)}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('News feed widget error:', error);
        }

        return '<div class="text-center text-gray-400">داده‌ای یافت نشد</div>';
    }

    async renderTradingSignalsWidget(widget) {
        // Fetch real trading signals from API
        let signals = [];
        
        try {
            const response = await fetch('/api/ai/signals', {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success && apiData.data) {
                    signals = apiData.data;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch trading signals:', error);
        }
        
        // Fallback if no signals
        if (signals.length === 0) {
            signals = [{
                symbol: 'BTC',
                signal: 'hold',
                confidence: 50,
                price: 0,
                target: 0,
                stopLoss: 0,
                reason: 'در حال بارگذاری...',
                timeframe: '24H',
                indicator: 'N/A'
            }];
        }

        const primarySignal = signals[0];
        const signalColors = {
            'buy': { color: 'text-green-400', bg: 'bg-green-900/20', icon: '🟢', text: 'خرید' },
            'sell': { color: 'text-red-400', bg: 'bg-red-900/20', icon: '🔴', text: 'فروش' },
            'hold': { color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: '🟡', text: 'نگهداری' }
        };

        return `
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white">سیگنال‌های معاملاتی</h3>
                    <p class="text-sm text-gray-400">تحلیل تکنیکال لحظه‌ای</p>
                </div>
        
                <!-- Primary Signal -->
                <div class="${signalColors[primarySignal.signal].bg} rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <span class="text-2xl">${signalColors[primarySignal.signal].icon}</span>
                            <div>
                                <div class="font-bold text-white">${primarySignal.symbol}/USDT</div>
                                <div class="text-xs text-gray-400">${primarySignal.timeframe} • ${primarySignal.indicator}</div>
                            </div>
                        </div>
                        <div class="text-left">
                            <div class="${signalColors[primarySignal.signal].color} font-bold text-lg">
                                ${signalColors[primarySignal.signal].text}
                            </div>
                            <div class="text-xs text-gray-400">اطمینان: ${primarySignal.confidence}%</div>
                        </div>
                    </div>
            
                    <div class="grid grid-cols-3 gap-3 text-xs">
                        <div class="text-center">
                            <div class="text-gray-400">قیمت فعلی</div>
                            <div class="text-white font-medium">$${primarySignal.price.toLocaleString()}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-gray-400">هدف</div>
                            <div class="text-green-400 font-medium">$${primarySignal.target.toLocaleString()}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-gray-400">حد ضرر</div>
                            <div class="text-red-400 font-medium">$${primarySignal.stopLoss.toLocaleString()}</div>
                        </div>
                    </div>
            
                    <div class="mt-3 pt-3 border-t border-gray-600">
                        <div class="text-xs text-gray-300">
                            <i class="fas fa-info-circle mr-1"></i>
                            ${primarySignal.reason}
                        </div>
                    </div>
                </div>
        
                <!-- Other Signals -->
                <div class="space-y-2">
                    ${signals.slice(1).map(signal => `
                        <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                            <div class="flex items-center space-x-2 space-x-reverse">
                                <span>${signalColors[signal.signal].icon}</span>
                                <div>
                                    <div class="text-white text-sm font-medium">${signal.symbol}</div>
                                    <div class="text-xs text-gray-400">${signal.timeframe}</div>
                                </div>
                            </div>
                            <div class="text-left">
                                <div class="${signalColors[signal.signal].color} text-sm font-medium">
                                    ${signalColors[signal.signal].text}
                                </div>
                                <div class="text-xs text-gray-400">${signal.confidence}%</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
        
                <div class="mt-4 pt-3 border-t border-gray-600">
                    <div class="flex justify-between text-xs text-gray-400">
                        <span>آخرین بروزرسانی: ${new Date().toLocaleTimeString('fa-IR')}</span>
                        <button onclick="app.showSignalSettings()" class="text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded px-2 py-1 transition-colors">تنظیمات</button>
                    </div>
                </div>
            </div>
        `;
    }

    async renderAIRecommendationsWidget(widget) {
        // Fetch real AI recommendations from API
        let recommendations = [];
        
        try {
            const response = await fetch('/api/ai/recommendations', {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success && apiData.data) {
                    recommendations = apiData.data;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch AI recommendations:', error);
        }
        
        // Fallback if no recommendations
        if (recommendations.length === 0) {
            recommendations = [
                'بازار در حال بررسی است',
                'توصیه به مدیریت ریسک',
                'تنوع‌بخشی پورتفولیو'
            ];
        }

        return `
            <div class="space-y-2">
                ${recommendations.map(rec => `
                    <div class="text-xs text-gray-300 flex items-center">
                        <span class="text-purple-400 mr-2">🤖</span>
                        ${rec}
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderPerformanceChartWidget(widget) {
        return `
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-white">نمودار عملکرد پرتفولیو</h3>
                        <p class="text-sm text-gray-400">سود و زیان 30 روز گذشته</p>
                    </div>
                    <div class="text-right">
                        <div id="chart-total-pnl-${widget.id}" class="text-xl font-bold text-green-400">+$0</div>
                        <div id="chart-percentage-${widget.id}" class="text-sm text-gray-400">0%</div>
                    </div>
                </div>
                <div class="widget-chart-container" style="position: relative; height: 200px; width: 100%;">
                    <canvas id="widget-performance-chart-${widget.id}"></canvas>
                </div>
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div class="flex items-center space-x-4 space-x-reverse">
                        <div class="text-center">
                            <div id="chart-best-day-${widget.id}" class="text-sm font-semibold text-green-400">+$0</div>
                            <div class="text-xs text-gray-400">بهترین روز</div>
                        </div>
                        <div class="text-center">
                            <div id="chart-worst-day-${widget.id}" class="text-sm font-semibold text-red-400">-$0</div>
                            <div class="text-xs text-gray-400">بدترین روز</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">آخرین بروزرسانی:</div>
                        <div class="text-xs text-gray-300">${new Date().toLocaleString('fa-IR')}</div>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeWidgetBehavior(widget) {
        // Initialize charts for specific widgets
        if (widget.type === 'performance_chart') {
            setTimeout(() => this.initializeWidgetChart(widget), 100);
        }
    }

    async initializeWidgetChart(widget) {
        const canvas = document.getElementById(`widget-performance-chart-${widget.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        try {
            // Get real performance data from API
            const response = await fetch('/api/portfolio/advanced', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = response.ok ? await response.json() : {};
            const performance = data.data?.performance || {};
            
            // Use real PnL data or fallback
            const totalPnL = performance.totalPnL || 0;
            const dailyPnL = performance.dailyPnL || 0;
            const percentage = performance.winRate || 0;
            
            // Generate chart data from real trading history
            const mockData = await this.getPerformanceHistory();
    
            // Update summary stats
            document.getElementById(`chart-total-pnl-${widget.id}`).textContent = 
                `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`;
            document.getElementById(`chart-total-pnl-${widget.id}`).className = 
                `text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`;
        
            document.getElementById(`chart-percentage-${widget.id}`).textContent = 
                `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
    
            // Calculate best and worst days
            const dailyChanges = mockData.map((item, index) => {
                if (index === 0) return 0;
                return item.pnl - mockData[index - 1].pnl;
            });
            const bestDay = Math.max(...dailyChanges);
            const worstDay = Math.min(...dailyChanges);
    
            document.getElementById(`chart-best-day-${widget.id}`).textContent = `+$${bestDay.toFixed(2)}`;
            document.getElementById(`chart-worst-day-${widget.id}`).textContent = `$${worstDay.toFixed(2)}`;
    
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: mockData.map(item => item.date),
                    datasets: [{
                        label: 'سود/زیان تجمعی',
                        data: mockData.map(item => item.pnl),
                        borderColor: totalPnL >= 0 ? '#10B981' : '#EF4444',
                        backgroundColor: totalPnL >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#1F2937',
                        pointHoverBorderColor: totalPnL >= 0 ? '#10B981' : '#EF4444',
                        pointHoverBorderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(31, 41, 55, 0.95)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                title: function(tooltipItems) {
                                    return tooltipItems[0].label;
                                },
                                label: function(context) {
                                    const value = context.parsed.y;
                                    const sign = value >= 0 ? '+' : '';
                                    return `سود/زیان: ${sign}$${value.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { 
                            display: true,
                            grid: { 
                                display: true,
                                color: 'rgba(75, 85, 99, 0.2)'
                            },
                            ticks: {
                                color: '#9CA3AF',
                                font: { size: 10 },
                                maxTicksLimit: 6
                            }
                        },
                        y: { 
                            display: true,
                            position: 'right',
                            grid: { 
                                display: true,
                                color: 'rgba(75, 85, 99, 0.2)'
                            },
                            ticks: {
                                color: '#9CA3AF',
                                font: { size: 10 },
                                callback: function(value) {
                                    return `$${value}`;
                                }
                            }
                        }
                    },
                    elements: {
                        point: {
                            hoverRadius: 8
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Widget chart error:', error);
            // Fallback: show error message in canvas
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('خطا در بارگذاری نمودار', canvas.width / 2, canvas.height / 2);
        }
    }

    async getPerformanceHistory() {
        try {
            // Try to get real historical data from API
            const response = await fetch('/api/portfolio/performance', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = response.ok ? await response.json() : {};
            if (data.success && data.data?.history) {
                return response.data.history;
            }
        } catch (error) {
            console.warn('Performance history API not available, using calculation from current data');
        }
        
        // Fallback: calculate from current portfolio data
        const dashResponse = await fetch('/api/dashboard/comprehensive', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
        const data = dashResponse.ok ? await dashResponse.json() : {};
        const portfolio = data.data?.portfolio || {};
        const currentBalance = portfolio.totalBalance || 10000;
        const totalPnL = portfolio.totalPnL || 0;
        
        const days = 30;
        const historyData = [];
        const startDate = new Date();
        const startBalance = currentBalance - totalPnL;
        const dailyChange = totalPnL / days;
        
        // Generate historical progression
        for (let i = 29; i >= 0; i--) {
            const date = new Date(startDate);
            date.setDate(date.getDate() - i);
            const daysPassed = 29 - i;
            const currentPnL = dailyChange * daysPassed;
    
            historyData.push({
                date: date.toLocaleDateString('fa-IR'),
                pnl: parseFloat(currentPnL.toFixed(2))
            });
        }

        return historyData;
    }

    // ===== THEME CUSTOMIZATION =====
    
    async showThemeSettings() {
        const modal = document.getElementById('theme-settings-modal');
        const content = document.getElementById('theme-settings-content');

        try {
            const [themeResponse, optionsResponse] = await Promise.all([
                axios.get(`/api/widgets/theme/${this.currentUser?.id || 'demo_user'}`),
                axios.get('/api/widgets/options')
            ]);
    
            if (themeResponse.data.success && optionsResponse.data.success) {
                const currentTheme = themeResponse.data.data;
                const options = optionsResponse.data.data;
        
                content.innerHTML = this.renderThemeSettings(currentTheme, options);
            }
    
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } catch (error) {
            console.error('Theme settings error:', error);
            this.showAlert('خطا در بارگذاری تنظیمات', 'error');
        }
    }

    renderThemeSettings(currentTheme, options) {
        return `
            <!-- Theme Selection -->
            <div>
                <h3 class="text-lg font-medium text-white mb-3">تم ظاهری</h3>
                <div class="grid grid-cols-3 gap-3">
                    ${options.themes.map(theme => `
                        <div class="theme-option ${currentTheme.theme === theme.id ? 'selected' : ''}" 
                             onclick="app.selectTheme('${theme.id}')">
                            <div class="w-full h-16 rounded mb-2" style="background: ${theme.preview}"></div>
                            <div class="text-sm text-white">${theme.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Accent Color -->
            <div>
                <h3 class="text-lg font-medium text-white mb-3">رنگ اصلی</h3>
                <div class="color-palette">
                    ${options.accentColors.map(color => `
                        <div class="color-option ${currentTheme.accentColor === color.id ? 'selected' : ''}" 
                             style="background-color: ${color.color}" 
                             onclick="app.selectAccentColor('${color.id}')"
                             title="${color.name}">
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Font Size -->
            <div>
                <h3 class="text-lg font-medium text-white mb-3">اندازه فونت</h3>
                <div class="grid grid-cols-3 gap-3">
                    ${options.fontSizes.map(size => `
                        <div class="font-size-preview ${currentTheme.fontSize === size.id ? 'selected' : ''}" 
                             onclick="app.selectFontSize('${size.id}')">
                            <div style="font-size: ${size.size}">${size.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Additional Options -->
            <div>
                <h3 class="text-lg font-medium text-white mb-3">تنظیمات اضافی</h3>
                <div class="space-y-3">
                    <label class="flex items-center">
                        <input type="checkbox" id="compact-mode" ${currentTheme.compactMode ? 'checked' : ''} 
                               class="mr-2" onchange="app.toggleCompactMode()">
                        <span class="text-gray-300">حالت فشرده</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" id="animations" ${currentTheme.animations ? 'checked' : ''} 
                               class="mr-2" onchange="app.toggleAnimations()">
                        <span class="text-gray-300">انیمیشن‌ها</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" id="rtl-mode" ${currentTheme.rtlMode ? 'checked' : ''} 
                               class="mr-2" onchange="app.toggleRTLMode()">
                        <span class="text-gray-300">حالت راست به چپ</span>
                    </label>
                </div>
            </div>
        `;
    }

    hideThemeSettings() {
        const modal = document.getElementById('theme-settings-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    async saveThemeSettings() {
        const themeData = {
            userId: this.currentUser?.id || 'demo_user',
            theme: this.selectedTheme?.theme || 'dark',
            accentColor: this.selectedTheme?.accentColor || '#3B82F6',
            fontSize: this.selectedTheme?.fontSize || 'medium',
            compactMode: document.getElementById('compact-mode')?.checked || false,
            animations: document.getElementById('animations')?.checked || true,
            rtlMode: document.getElementById('rtl-mode')?.checked || true
        };

        try {
            // Save to localStorage for now (in real app, would save to backend)
            localStorage.setItem('themeSettings', JSON.stringify(themeData));
    
            this.applyTheme(themeData);
            this.hideThemeSettings();
            this.showAlert('تنظیمات ظاهری ذخیره و اعمال شد', 'success');
        } catch (error) {
            console.error('Save theme error:', error);
            this.showAlert('خطا در ذخیره تنظیمات', 'error');
        }
    }

    applyTheme(themeData) {
        const root = document.documentElement;

        // Apply accent color to various elements
        root.style.setProperty('--accent-color', themeData.accentColor);

        // Update button colors dynamically
        document.querySelectorAll('.bg-blue-600').forEach(el => {
            el.style.backgroundColor = themeData.accentColor;
        });

        document.querySelectorAll('.text-blue-400, .text-blue-500').forEach(el => {
            el.style.color = themeData.accentColor;
        });

        // Apply font size
        const fontSizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.setProperty('--base-font-size', fontSizes[themeData.fontSize]);
        document.body.style.fontSize = fontSizes[themeData.fontSize];

        // Apply theme classes
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(themeData.theme + '-theme');

        // Apply other theme settings
        document.body.classList.toggle('compact-mode', themeData.compactMode);
        document.body.classList.toggle('no-animations', !themeData.animations);

        // Apply RTL/LTR
        document.body.dir = themeData.rtlMode ? 'rtl' : 'ltr';
        document.documentElement.dir = themeData.rtlMode ? 'rtl' : 'ltr';

        // Update current theme
        this.currentTheme = themeData;
    }

    selectTheme(themeId) {
        this.selectedTheme = { ...this.selectedTheme, theme: themeId };
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.closest('.theme-option').classList.add('selected');
    }

    selectAccentColor(colorId) {
        this.selectedTheme = { ...this.selectedTheme, accentColor: colorId };
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    selectFontSize(sizeId) {
        this.selectedTheme = { ...this.selectedTheme, fontSize: sizeId };
        document.querySelectorAll('.font-size-preview').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    resetTheme() {
        const defaultTheme = {
            theme: 'dark',
            accentColor: '#3B82F6',
            fontSize: 'medium',
            compactMode: false,
            animations: true,
            rtlMode: true
        };

        this.applyTheme(defaultTheme);
        this.hideThemeSettings();
        this.showThemeSettings(); // Reload with defaults
        this.showAlert('تنظیمات به حالت پیش‌فرض بازگردانده شد', 'success');
    }

    // ===== WIDGET LIBRARY =====
    
    async showWidgetLibrary() {
        const modal = document.getElementById('widget-library-modal');
        const grid = document.getElementById('widget-library-grid');

        try {
            const response = await axios.get('/api/widgets/types');
    
            if (response.data.success) {
                const widgetTypes = response.data.data;
        
                grid.innerHTML = widgetTypes.map(widget => `
                    <div class="widget-library-item bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                         onclick="app.addWidget('${widget.id}')">
                        <div class="text-center">
                            <div class="text-3xl mb-2">${widget.icon}</div>
                            <h3 class="font-medium text-white mb-1">${widget.title}</h3>
                            <p class="text-sm text-gray-400 mb-2">${widget.description}</p>
                            <div class="text-xs text-gray-500">
                                اندازه: ${widget.defaultSize.width}×${widget.defaultSize.height}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
    
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } catch (error) {
            console.error('Widget library error:', error);
            this.showAlert('خطا در بارگذاری کتابخانه ویجت‌ها', 'error');
        }
    }

    hideWidgetLibrary() {
        const modal = document.getElementById('widget-library-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    async addWidget(widgetType) {
        try {
            const response = await axios.get('/api/widgets/types');
            if (!response.data.success) return;
    
            const widgetData = response.data.data.find(w => w.id === widgetType);
            if (!widgetData) return;
    
            // Find available position
            const position = this.findAvailablePosition(widgetData.defaultSize);
    
            const newWidget = {
                id: `${widgetType}_${Date.now()}`,
                type: widgetType,
                title: widgetData.title,
                position: position,
                size: widgetData.defaultSize,
                isVisible: true,
                settings: {}
            };
    
            // Add to layout
            this.dashboardLayout.widgets.push(newWidget);
    
            // Create and add widget element
            const widgetElement = this.createWidgetElement(newWidget);
            widgetElement.classList.add('widget-enter');
            document.getElementById('dashboard-grid').appendChild(widgetElement);
    
            // Load widget data
            await this.loadWidgetData(newWidget);
    
            this.hideWidgetLibrary();
            this.showAlert('ویجت اضافه شد', 'success');
    
        } catch (error) {
            console.error('Add widget error:', error);
            this.showAlert('خطا در افزودن ویجت', 'error');
        }
    }

    findAvailablePosition(size) {
        const gridWidth = 5;
        const gridHeight = 10;

        // Simple algorithm to find available position
        for (let y = 0; y <= gridHeight - size.height; y++) {
            for (let x = 0; x <= gridWidth - size.width; x++) {
                if (this.isPositionAvailable(x, y, size.width, size.height)) {
                    return { x, y };
                }
            }
        }

        // If no space found, place at bottom
        return { x: 0, y: gridHeight };
    }

    isPositionAvailable(x, y, width, height) {
        return !this.dashboardLayout.widgets.some(widget => {
            if (!widget.isVisible) return false;
    
            const wx = widget.position.x;
            const wy = widget.position.y;
            const ww = widget.size.width;
            const wh = widget.size.height;
    
            return !(x >= wx + ww || x + width <= wx || y >= wy + wh || y + height <= wy);
        });
    }

    removeWidget(widgetId) {
        if (!confirm('آیا از حذف این ویجت مطمئن هستید؟')) {
            return;
        }

        // Remove from layout
        this.dashboardLayout.widgets = this.dashboardLayout.widgets.filter(w => w.id !== widgetId);

        // Remove element
        const element = document.getElementById(widgetId);
        if (element) {
            element.remove();
        }

        this.showAlert('ویجت حذف شد', 'success');
    }

    resizeWidget(widgetId) {
        const widget = this.dashboardLayout.widgets.find(w => w.id === widgetId);
        if (!widget) return;

        // Cycle through common sizes
        const sizes = [
            { width: 1, height: 1 },
            { width: 2, height: 1 },
            { width: 2, height: 2 },
            { width: 3, height: 2 }
        ];

        const currentIndex = sizes.findIndex(s => s.width === widget.size.width && s.height === widget.size.height);
        const nextIndex = (currentIndex + 1) % sizes.length;

        widget.size = sizes[nextIndex];

        // Update element
        const element = document.getElementById(widgetId);
        if (element) {
            element.className = `dashboard-widget widget-${widget.size.width}x${widget.size.height} edit-mode`;
            element.style.gridColumn = `${widget.position.x + 1} / span ${widget.size.width}`;
            element.style.gridRow = `${widget.position.y + 1} / span ${widget.size.height}`;
        }

        // Reload widget data to fit new size
        this.loadWidgetData(widget);
    }

    // Drag & Drop Implementation
    initializeDragAndDrop() {
        const container = document.getElementById('dashboard-grid');
        if (!container) return;

        // Make widgets draggable
        document.querySelectorAll('.dashboard-widget').forEach(widget => {
            widget.draggable = true;
            widget.addEventListener('dragstart', this.handleDragStart.bind(this));
            widget.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        // Setup drop zones
        container.addEventListener('dragover', this.handleDragOver.bind(this));
        container.addEventListener('drop', this.handleDrop.bind(this));
    }

    destroyDragAndDrop() {
        document.querySelectorAll('.dashboard-widget').forEach(widget => {
            widget.draggable = false;
            widget.removeEventListener('dragstart', this.handleDragStart);
            widget.removeEventListener('dragend', this.handleDragEnd);
        });
    }

    handleDragStart(e) {
        this.draggedWidget = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedWidget = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault();
        if (!this.draggedWidget) return;

        // Calculate grid position from mouse coordinates
        const container = document.getElementById('dashboard-grid');
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const columnWidth = rect.width / 5;
        const rowHeight = 140; // Approximate row height

        const gridX = Math.floor(x / columnWidth);
        const gridY = Math.floor(y / rowHeight);

        // Update widget position
        const widgetId = this.draggedWidget.id;
        const widget = this.dashboardLayout.widgets.find(w => w.id === widgetId);

        if (widget) {
            widget.position.x = Math.max(0, Math.min(gridX, 5 - widget.size.width));
            widget.position.y = Math.max(0, gridY);
    
            // Update element position
            this.draggedWidget.style.gridColumn = `${widget.position.x + 1} / span ${widget.size.width}`;
            this.draggedWidget.style.gridRow = `${widget.position.y + 1} / span ${widget.size.height}`;
        }
    }

    // Default layout generator
    getDefaultLayout() {
        const userId = this.currentUser?.id || 'demo_user';

        return {
            userId,
            layoutName: 'default',
            widgets: [
                {
                    id: 'portfolio_summary_1',
                    type: 'portfolio_summary',
                    title: 'خلاصه پورتفولیو',
                    position: { x: 0, y: 0 },
                    size: { width: 2, height: 1 },
                    isVisible: true,
                    settings: {}
                },
                {
                    id: 'market_overview_1',
                    type: 'market_overview',
                    title: 'نمای کلی بازار',
                    position: { x: 2, y: 0 },
                    size: { width: 2, height: 1 },
                    isVisible: true,
                    settings: {}
                },
                {
                    id: 'fear_greed_1',
                    type: 'fear_greed',
                    title: 'شاخص ترس و طمع',
                    position: { x: 4, y: 0 },
                    size: { width: 1, height: 1 },
                    isVisible: true,
                    settings: {}
                },
                {
                    id: 'watchlist_1',
                    type: 'watchlist',
                    title: 'لیست مورد علاقه',
                    position: { x: 0, y: 1 },
                    size: { width: 2, height: 2 },
                    isVisible: true,
                    settings: { limit: 8 }
                },
                {
                    id: 'trading_signals_1',
                    type: 'trading_signals',
                    title: 'سیگنال‌های معاملاتی',
                    position: { x: 2, y: 1 },
                    size: { width: 1, height: 2 },
                    isVisible: true,
                    settings: {}
                },
                {
                    id: 'top_movers_1',
                    type: 'top_movers',
                    title: 'بالاترین تغییرات',
                    position: { x: 3, y: 1 },
                    size: { width: 2, height: 2 },
                    isVisible: true,
                    settings: { limit: 6 }
                },
                {
                    id: 'performance_chart_1',
                    type: 'performance_chart',
                    title: 'نمودار عملکرد',
                    position: { x: 0, y: 3 },
                    size: { width: 3, height: 2 },
                    isVisible: true,
                    settings: { period: 'daily' }
                },
                {
                    id: 'news_feed_1',
                    type: 'news_feed',
                    title: 'اخبار کریپتو',
                    position: { x: 3, y: 3 },
                    size: { width: 2, height: 2 },
                    isVisible: true,
                    settings: { limit: 4 }
                }
            ],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    }

    // Portfolio and Performance Functions
        // loadPortfolioData removed - using modular portfolio.js

    updatePerformanceOverview(metrics) {
        // Update overview cards
        document.getElementById('total-portfolio-value')?.classList.add('loading');

        setTimeout(() => {
            // Portfolio value (calculated from holdings)
            const portfolioValue = 125000; // Will be calculated from actual holdings
            document.getElementById('total-portfolio-value').textContent = '$' + portfolioValue.toLocaleString();
    
            // P&L
            const pnlElement = document.getElementById('total-pnl');
            const roiElement = document.getElementById('total-roi');
            if (pnlElement && roiElement) {
                const isPositive = metrics.netPnL > 0;
                pnlElement.textContent = (isPositive ? '+$' : '-$') + Math.abs(metrics.netPnL).toLocaleString();
                pnlElement.className = `text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`;
                roiElement.textContent = `ROI: ${metrics.roi.toFixed(2)}%`;
                roiElement.className = `text-xs mt-1 ${isPositive ? 'text-green-300' : 'text-red-300'}`;
            }
    
            // Win rate
            document.getElementById('win-rate').textContent = metrics.winRate.toFixed(1) + '%';
            document.getElementById('trade-count').textContent = `${metrics.totalTrades} معامله`;
    
            // Sharpe ratio
            document.getElementById('sharpe-ratio').textContent = metrics.sharpeRatio.toFixed(2);
            document.getElementById('max-drawdown').textContent = `Max DD: ${metrics.maxDrawdown.toFixed(1)}%`;
    
            // Trading statistics
            document.getElementById('total-trades').textContent = metrics.totalTrades.toLocaleString();
            document.getElementById('winning-trades').textContent = metrics.winningTrades.toLocaleString();
            document.getElementById('losing-trades').textContent = metrics.losingTrades.toLocaleString();
            document.getElementById('avg-win').textContent = '$' + metrics.averageWin.toFixed(2);
            document.getElementById('avg-loss').textContent = '$' + metrics.averageLoss.toFixed(2);
            document.getElementById('profit-factor').textContent = metrics.profitFactor.toFixed(2);
    
            // Top performers
            this.updateTopPerformers(metrics.topPerformers);
    
            // Monthly returns
            this.updateMonthlyReturns(metrics.monthlyReturns);
    
        }, 500);
    }

    updateTopPerformers(performers) {
        const container = document.getElementById('top-performers');
        if (!container) return;

        container.innerHTML = performers.map(performer => `
            <div class="flex justify-between items-center text-sm">
                <span class="text-gray-300">${performer.symbol}</span>
                <div class="text-right">
                    <div class="${performer.pnl > 0 ? 'text-green-400' : 'text-red-400'} font-medium">
                        ${performer.pnl > 0 ? '+' : ''}$${performer.pnl.toFixed(0)}
                    </div>
                    <div class="text-xs text-gray-400">${performer.roi.toFixed(1)}%</div>
                </div>
            </div>
        `).join('');
    }

    updateMonthlyReturns(returns) {
        const container = document.getElementById('monthly-returns');
        if (!container) return;

        container.innerHTML = returns.map(monthData => `
            <div class="flex justify-between items-center text-sm">
                <span class="text-gray-300">${monthData.month}</span>
                <span class="${monthData.return > 0 ? 'text-green-400' : 'text-red-400'} font-medium">
                    ${monthData.return > 0 ? '+' : ''}${monthData.return.toFixed(1)}%
                </span>
            </div>
        `).join('');
    }

    updatePortfolioHoldings(portfolio) {
        const tableBody = document.getElementById('holdings-table');
        if (!tableBody) return;

        tableBody.innerHTML = portfolio.holdings.map(holding => {
            const isPositive = holding.pnl > 0;
            return `
                <tr class="hover:bg-gray-700">
                    <td class="px-4 py-3">
                        <div class="flex items-center">
                            <div class="text-sm font-medium text-white">${holding.symbol}</div>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-300">${holding.amount.toFixed(4)}</td>
                    <td class="px-4 py-3 text-sm text-gray-300">$${holding.averagePrice.toLocaleString()}</td>
                    <td class="px-4 py-3 text-sm text-white">$${holding.currentPrice.toLocaleString()}</td>
                    <td class="px-4 py-3 text-sm font-medium text-white">$${holding.value.toLocaleString()}</td>
                    <td class="px-4 py-3 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}">
                        ${isPositive ? '+' : ''}$${holding.pnl.toFixed(0)}
                    </td>
                    <td class="px-4 py-3 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}">
                        ${isPositive ? '+' : ''}${holding.pnlPercent.toFixed(2)}%
                    </td>
                </tr>
            `;
        }).join('');
    }

    async loadPnLChart() {
        const period = document.getElementById('pnl-period')?.value || 'daily';
        const userId = this.currentUser?.id || 'demo_user';

        try {
            const response = await axios.get(`/api/performance/pnl/${userId}/${period}`);
    
            if (response.data.success) {
                this.renderPnLChart(response.data.data);
            }
        } catch (error) {
            console.error('P&L chart error:', error);
        }
    }

    renderPnLChart(pnlData) {
        const canvas = document.getElementById('pnl-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.pnlChart) {
            this.pnlChart.destroy();
        }

        const labels = pnlData.data.map(item => item.date);
        const pnlValues = pnlData.data.map(item => item.pnl);

        this.pnlChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'سود/زیان',
                    data: pnlValues,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#D1D5DB'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        },
                        ticks: {
                            color: '#9CA3AF',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    renderAllocationChart(portfolio) {
        const canvas = document.getElementById('allocation-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.allocationChart) {
            this.allocationChart.destroy();
        }

        const labels = portfolio.holdings.map(h => h.symbol);
        const data = portfolio.holdings.map(h => h.value);
        const colors = [
            '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#3B82F6',
            '#F97316', '#84CC16', '#06B6D4', '#EC4899', '#6B7280'
        ];

        this.allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: '#1F2937',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#D1D5DB',
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    async refreshPortfolioData() {
        await this.loadModule('portfolio');
        this.showAlert('داده‌های پورتفولیو بروزرسانی شد', 'success');
    }

    // Chart and Technical Analysis Functions
    async loadChartData() {
        const symbol = document.getElementById('chart-symbol')?.value || 'bitcoin';
        const timeframe = this.currentTimeframe || '1h';

        // Show loading
        const loadingElement = document.getElementById('chart-loading');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }

        try {
            // Fetch chart data
            const response = await axios.get(`/api/chart/data/${symbol}/${timeframe}`);
    
            if (response.data.success) {
                const chartData = response.data.data;
                this.renderPriceChart(chartData);
                this.renderVolumeChart(chartData);
                this.updateTechnicalIndicators(chartData);
        
                // Load technical analysis
                await this.loadTechnicalAnalysis(symbol);
            } else {
                this.showAlert('خطا در دریافت داده‌های نمودار', 'error');
            }
    
        } catch (error) {
            console.error('Chart data error:', error);
            this.showAlert('خطا در بارگذاری نمودار', 'error');
        } finally {
            // Hide loading
            if (loadingElement) {
                loadingElement.classList.add('hidden');
            }
        }
    }

    renderPriceChart(chartData) {
        const canvas = document.getElementById('price-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.priceChart) {
            this.priceChart.destroy();
        }

        // Prepare OHLC data for candlestick chart
        const labels = chartData.ohlc.map(item => 
            new Date(item.timestamp).toLocaleString('fa-IR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        );

        const candlestickData = chartData.ohlc.map(item => ({
            x: new Date(item.timestamp),
            o: item.open,
            h: item.high,
            l: item.low,
            c: item.close
        }));

        // Update current price display
        const currentPrice = chartData.ohlc[chartData.ohlc.length - 1];
        if (currentPrice) {
            const priceElement = document.getElementById('current-price');
            const changeElement = document.getElementById('price-change');
    
            if (priceElement && changeElement) {
                priceElement.textContent = `$${currentPrice.close.toLocaleString()}`;
        
                const previousPrice = chartData.ohlc[chartData.ohlc.length - 2];
                if (previousPrice) {
                    const change = currentPrice.close - previousPrice.close;
                    const changePercent = (change / previousPrice.close) * 100;
                    const isPositive = change > 0;
            
                    changeElement.innerHTML = `
                        <span class="${isPositive ? 'text-green-400' : 'text-red-400'}">
                            ${isPositive ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)
                            <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'} ml-1"></i>
                        </span>
                    `;
                }
            }
        }

        // Create candlestick chart using Chart.js
        this.priceChart = new Chart(ctx, {
            type: 'line', // We'll simulate candlesticks with multiple datasets
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'قیمت بسته',
                        data: chartData.ohlc.map(item => item.close),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'SMA 20',
                        data: chartData.indicators.sma20?.map(item => item.value) || [],
                        borderColor: '#F59E0B',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'SMA 50',
                        data: chartData.indicators.sma50?.map(item => item.value) || [],
                        borderColor: '#EF4444',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#D1D5DB'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#F9FAFB',
                        bodyColor: '#D1D5DB',
                        borderColor: '#374151',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        },
                        ticks: {
                            color: '#9CA3AF',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    renderVolumeChart(chartData) {
        const canvas = document.getElementById('volume-chart');
        if (!canvas || !chartData.volume || chartData.volume.length === 0) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.volumeChart) {
            this.volumeChart.destroy();
        }

        const labels = chartData.ohlc.map(item => 
            new Date(item.timestamp).toLocaleString('fa-IR', {
                month: 'short',
                day: 'numeric'
            })
        );

        this.volumeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'حجم معاملات',
                    data: chartData.volume,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: '#6366F1',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#D1D5DB'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        });
    }

    updateTechnicalIndicators(chartData) {
        const indicators = chartData.indicators;

        // Update RSI
        const rsiValue = indicators.rsi?.[indicators.rsi.length - 1];
        if (rsiValue) {
            const rsiElement = document.getElementById('rsi-value');
            const rsiSignalElement = document.getElementById('rsi-signal');
    
            if (rsiElement && rsiSignalElement) {
                rsiElement.textContent = rsiValue.value.toFixed(2);
        
                let signalClass = 'bg-gray-600';
                let signalText = 'خنثی';
        
                if (rsiValue.signal === 'buy') {
                    signalClass = 'bg-green-600';
                    signalText = 'خرید';
                } else if (rsiValue.signal === 'sell') {
                    signalClass = 'bg-red-600';
                    signalText = 'فروش';
                }
        
                rsiSignalElement.className = `ml-2 px-2 py-1 rounded text-xs ${signalClass} text-white`;
                rsiSignalElement.textContent = signalText;
            }
        }

        // Update MACD
        const macdValue = indicators.macd?.[indicators.macd.length - 1];
        if (macdValue) {
            const macdElement = document.getElementById('macd-value');
            const macdSignalElement = document.getElementById('macd-signal');
    
            if (macdElement && macdSignalElement) {
                macdElement.textContent = macdValue.macd.toFixed(4);
        
                let signalClass = 'bg-gray-600';
                let signalText = 'خنثی';
        
                if (macdValue.histogram > 0) {
                    signalClass = 'bg-green-600';
                    signalText = 'صعودی';
                } else if (macdValue.histogram < 0) {
                    signalClass = 'bg-red-600';
                    signalText = 'نزولی';
                }
        
                macdSignalElement.className = `ml-2 px-2 py-1 rounded text-xs ${signalClass} text-white`;
                macdSignalElement.textContent = signalText;
            }
        }

        // Update SMAs
        const sma20 = indicators.sma20?.[indicators.sma20.length - 1];
        const sma50 = indicators.sma50?.[indicators.sma50.length - 1];

        if (sma20) {
            const sma20Element = document.getElementById('sma20-value');
            if (sma20Element) {
                sma20Element.textContent = '$' + sma20.value.toLocaleString();
            }
        }

        if (sma50) {
            const sma50Element = document.getElementById('sma50-value');
            if (sma50Element) {
                sma50Element.textContent = '$' + sma50.value.toLocaleString();
            }
        }
    }

    async loadTechnicalAnalysis(symbol) {
        try {
            const response = await axios.get(`/api/chart/analysis/${symbol}`);
    
            if (response.data.success) {
                const analysis = response.data.data;
                this.displayTechnicalAnalysis(analysis);
            }
        } catch (error) {
            console.error('Technical analysis error:', error);
        }
    }

    displayTechnicalAnalysis(analysis) {
        // Update trading signals
        const signalsContainer = document.getElementById('trading-signals');
        if (signalsContainer && analysis.signals) {
            if (analysis.signals.length === 0) {
                signalsContainer.innerHTML = '<div class="text-center text-gray-400">سیگنال خاصی یافت نشد</div>';
            } else {
                signalsContainer.innerHTML = analysis.signals.map(signal => `
                    <div class="bg-gray-600 rounded px-2 py-1 text-xs">
                        <i class="fas fa-info-circle text-blue-400 mr-1"></i>
                        ${signal}
                    </div>
                `).join('');
            }
        }

        // Update overall signal
        const overallSignalElement = document.getElementById('overall-signal');
        const confidenceElement = document.getElementById('signal-confidence');
        const recommendationElement = document.getElementById('recommendation-text');

        if (overallSignalElement && confidenceElement && recommendationElement) {
            let signalClass = 'text-gray-400';
            let signalIcon = '⚪';
            let signalText = 'خنثی';
    
            if (analysis.overallSignal === 'buy') {
                signalClass = 'text-green-400';
                signalIcon = '🟢';
                signalText = 'خرید';
            } else if (analysis.overallSignal === 'sell') {
                signalClass = 'text-red-400';
                signalIcon = '🔴';
                signalText = 'فروش';
            }
    
            overallSignalElement.className = `text-lg font-bold ${signalClass}`;
            overallSignalElement.innerHTML = `${signalIcon} ${signalText}`;
    
            confidenceElement.textContent = `اطمینان: ${analysis.confidence}%`;
            recommendationElement.textContent = analysis.recommendation;
        }
    }

    setChartTimeframe(timeframe) {
        // Update timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            if (btn.dataset.timeframe === timeframe) {
                btn.className = 'timeframe-btn px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700';
            } else {
                btn.className = 'timeframe-btn px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700';
            }
        });

        this.currentTimeframe = timeframe;
        this.loadChartData();
    }

    // Initialize chart data when trading module loads
    async initTradingModule() {
        // Set default timeframe
        this.currentTimeframe = '1h';

        // Load initial chart data
        setTimeout(() => {
            this.loadChartData();
        }, 500); // Small delay to ensure DOM elements are ready

        // Setup auto-refresh for chart data every 5 minutes
        if (this.chartRefreshInterval) {
            clearInterval(this.chartRefreshInterval);
        }

        this.chartRefreshInterval = setInterval(() => {
            this.loadChartData();
        }, 5 * 60 * 1000); // 5 minutes
    }

    // ===== TRADING MODE TOGGLE SYSTEM =====

    async initializeModeToggle() {
        try {
            // First check localStorage for saved mode
            const savedMode = localStorage.getItem('titan_trading_mode') || 'demo';
    
            // Try to get current mode from API (use test endpoint for now)
            try {
                const response = await axios.get('/api/mode/test');
        
                if (response.data.success) {
                    this.currentTradingMode = savedMode; // Use saved mode
                    this.demoBalance = response.data.demoBalance || 10000;
                } else {
                    throw new Error('API response not successful');
                }
            } catch (apiError) {
                console.log('Using saved/default mode due to API error:', apiError.message);
                this.currentTradingMode = savedMode;
                this.demoBalance = 10000;
            }
    
            // Update display
            this.updateModeDisplay(this.currentTradingMode);
    
            console.log(`Trading mode initialized: ${this.currentTradingMode}`);
    
        } catch (error) {
            console.error('Mode initialization error:', error);
            // Fallback to demo mode
            this.currentTradingMode = 'demo';
            this.demoBalance = 10000;
            this.updateModeDisplay('demo');
        }
    }

    updateModeDisplay(mode) {
        const modeBtn = document.getElementById('mode-toggle-btn');
        const modeIndicator = document.getElementById('mode-indicator');
        const modeText = document.getElementById('mode-text');
        const demoSelected = document.querySelectorAll('.demo-selected');
        const liveSelected = document.querySelectorAll('.live-selected');

        if (!modeBtn || !modeIndicator || !modeText) return;

        // Clear any existing classes
        modeBtn.className = 'flex items-center px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:shadow-lg group';

        if (mode === 'demo') {
            // Demo Mode Styling
            modeBtn.classList.add('border-orange-500', 'bg-orange-500/20', 'text-orange-300', 'hover:bg-orange-500/30');
            modeIndicator.className = 'w-3 h-3 rounded-full ml-2 bg-orange-400 animate-pulse';
            modeText.textContent = 'حالت دمو';
            modeText.className = 'text-sm font-semibold text-orange-200';
    
            // Update selection indicators
            demoSelected.forEach(el => el.classList.remove('hidden'));
            liveSelected.forEach(el => el.classList.add('hidden'));
    
            // Update page title if needed
            if (document.title.includes('🔴')) {
                document.title = document.title.replace('🔴', '🟡');
            }
        } else {
            // Live Mode Styling - More prominent warning
            modeBtn.classList.add('border-red-500', 'bg-red-500/30', 'text-red-200', 'hover:bg-red-500/40', 'shadow-red-500/20', 'shadow-lg');
            modeIndicator.className = 'w-3 h-3 rounded-full ml-2 bg-red-500 animate-pulse';
            modeText.textContent = 'حالت واقعی';
            modeText.className = 'text-sm font-semibold text-red-100';
    
            // Update selection indicators
            liveSelected.forEach(el => el.classList.remove('hidden'));
            demoSelected.forEach(el => el.classList.add('hidden'));
    
            // Update page title with warning
            if (!document.title.includes('🔴')) {
                document.title = '🔴 ' + document.title.replace('🟡 ', '');
            }
        }

        // Update demo balance display
        this.updateDemoBalanceDisplay();

        // Store mode in localStorage
        localStorage.setItem('titan_trading_mode', mode);

        console.log(`Trading mode updated to: ${mode}`);
    }

    async loadDemoWalletInfo(userId) {
        try {
            const response = await axios.get(`/api/mode/demo/wallet/${userId}`);
    
            if (response.data.success) {
                const wallet = response.data.data;
                const demoBalanceEl = document.getElementById('demo-balance');
                if (demoBalanceEl) {
                    demoBalanceEl.textContent = `$${wallet.totalValue.toLocaleString()}`;
                }
            }
        } catch (error) {
            console.error('Demo wallet load error:', error);
        }
    }

    toggleModeSelector() {
        const selector = document.getElementById('mode-selector');
        if (selector) {
            selector.classList.toggle('hidden');
        }

        // Close other dropdowns
        const alertsPanel = document.getElementById('alerts-panel');
        if (alertsPanel && !alertsPanel.classList.contains('hidden')) {
            alertsPanel.classList.add('hidden');
        }
    }

    async switchTradingMode(mode) {
        try {
            // For switching to live mode, show confirmation
            if (mode === 'live' && this.currentTradingMode !== 'live') {
                const confirmed = await this.showModeConfirmationDialog(mode);
                if (!confirmed) return;
            }

            // Show loading state
            this.showAlert('در حال تغییر حالت معاملات...', 'info');

            // Use test endpoint for now
            const response = await axios.post('/api/mode/test-switch', {
                mode,
                confirmation: mode === 'live'
            });

            if (response.data.success) {
                this.currentTradingMode = mode;
                this.updateModeDisplay(mode);
                this.hideModeSelector();
        
                // Show success message with mode info
                const modeText = mode === 'demo' ? 'دمو' : 'واقعی';
                this.showAlert(`✅ با موفقیت به حالت ${modeText} تغییر یافت`, 'success');
        
                // Refresh relevant data based on mode
                if (mode === 'demo') {
                    await this.loadDemoWalletInfo();
                } else {
                    // Show live mode warning
                    setTimeout(() => {
                        this.showAlert('🔴 توجه: شما در حالت معاملات واقعی هستید!', 'warning');
                    }, 2000);
                }
        
                // Update dashboard if visible
                if (this.currentPage === 'dashboard') {
                    await this.loadDashboardModule();
                }
        
            } else {
                this.showAlert(response.data.message || 'خطا در تغییر حالت معاملات', 'error');
            }

        } catch (error) {
            console.error('Mode switch error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'خطا در تغییر حالت معاملات';
            this.showAlert(errorMsg, 'error');
        }
    }

    hideModeSelector() {
        const selector = document.getElementById('mode-selector');
        if (selector) {
            selector.classList.add('hidden');
        }
    }

    async showModeConfirmationDialog(mode) {
        return new Promise((resolve) => {
            const modalHTML = `
                <div id="mode-confirmation-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
                        <div class="text-center mb-6">
                            <div class="text-4xl mb-4">⚠️</div>
                            <h3 class="text-xl font-bold text-white mb-2">تأیید تغییر به حالت واقعی</h3>
                            <p class="text-gray-300 text-sm">
                                آیا مطمئن هستید که می‌خواهید به حالت معاملات واقعی تغییر دهید؟
                                در این حالت، معاملات شما با پول حقیقی انجام خواهد شد.
                            </p>
                        </div>
                
                        <div class="flex gap-3">
                            <button onclick="app.confirmModeSwitch(true)" 
                                    class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors">
                                تأیید
                            </button>
                            <button onclick="app.confirmModeSwitch(false)" 
                                    class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors">
                                لغو
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
    
            this.modeConfirmationResolver = resolve;
        });
    }

    confirmModeSwitch(confirmed) {
        const modal = document.getElementById('mode-confirmation-modal');
        if (modal) {
            modal.remove();
        }

        if (this.modeConfirmationResolver) {
            this.modeConfirmationResolver(confirmed);
            this.modeConfirmationResolver = null;
        }
    }

    async manageDemoWallet() {
        try {
            this.hideModeSelector();
    
            // Show demo wallet management modal
            this.showDemoWalletModal();
    
        } catch (error) {
            console.error('Demo wallet management error:', error);
            this.showAlert('خطا در بارگذاری کیف پول دمو', 'error');
        }
    }

    showDemoWalletModal() {
        const modalHTML = `
            <div id="demo-wallet-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4 border border-gray-700">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b border-gray-700">
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-orange-400 rounded-full mr-3"></div>
                            <h3 class="text-lg font-bold text-white">مدیریت کیف پول دمو</h3>
                        </div>
                        <button onclick="app.closeDemoWalletModal()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <!-- Current Balance -->
                        <div class="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 mb-6">
                            <div class="text-center">
                                <div class="text-sm text-orange-300 mb-1">موجودی فعلی</div>
                                <div class="text-2xl font-bold text-orange-100" id="current-demo-balance">$10,000</div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="space-y-3">
                            <button onclick="app.resetDemoWallet()" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                                <i class="fas fa-undo ml-2"></i>
                                بازنشانی به مبلغ پیش‌فرض ($10,000)
                            </button>
                    
                            <div class="grid grid-cols-2 gap-3">
                                <button onclick="app.showAddFundsForm()" 
                                        class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                                    <i class="fas fa-plus ml-2"></i>
                                    افزودن مبلغ
                                </button>
                                <button onclick="app.showRemoveFundsForm()" 
                                        class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                                    <i class="fas fa-minus ml-2"></i>
                                    کسر مبلغ
                                </button>
                            </div>
                        </div>

                        <!-- Add/Remove Funds Form (Initially Hidden) -->
                        <div id="funds-form" class="hidden mt-6 p-4 bg-gray-700/50 rounded-lg">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-300 mb-2" id="funds-form-label">مبلغ</label>
                                <input type="number" 
                                       id="funds-amount" 
                                       class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white" 
                                       placeholder="مبلغ را وارد کنید"
                                       min="1"
                                       step="0.01">
                            </div>
                            <div class="flex gap-3">
                                <button onclick="app.processFundsAction()" 
                                        id="funds-confirm-btn"
                                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                                    تأیید
                                </button>
                                <button onclick="app.hideFundsForm()" 
                                        class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors">
                                    لغو
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Load current balance
        this.loadCurrentDemoBalance();
    }

    async loadCurrentDemoBalance() {
        try {
            // For now, get from current display or use default
            const currentBalance = this.getCurrentDemoBalance() || 10000;
            const balanceElement = document.getElementById('current-demo-balance');
            if (balanceElement) {
                balanceElement.textContent = `$\${currentBalance.toLocaleString()}`;
            }
        } catch (error) {
            console.error('Error loading demo balance:', error);
        }
    }

    getCurrentDemoBalance() {
        const balanceElement = document.getElementById('demo-balance');
        if (balanceElement) {
            const balance = balanceElement.textContent.replace('$', '').replace(/,/g, '');
            return parseFloat(balance) || 10000;
        }
        return 10000;
    }

    closeDemoWalletModal() {
        const modal = document.getElementById('demo-wallet-modal');
        if (modal) {
            modal.remove();
        }
    }

    showAddFundsForm() {
        const form = document.getElementById('funds-form');
        const label = document.getElementById('funds-form-label');
        const confirmBtn = document.getElementById('funds-confirm-btn');

        if (form && label && confirmBtn) {
            form.classList.remove('hidden');
            label.textContent = 'مبلغ افزودنی ($)';
            confirmBtn.textContent = 'افزودن مبلغ';
            confirmBtn.className = 'flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors';
            this.currentFundsAction = 'add';
    
            document.getElementById('funds-amount').focus();
        }
    }

    showRemoveFundsForm() {
        const form = document.getElementById('funds-form');
        const label = document.getElementById('funds-form-label');
        const confirmBtn = document.getElementById('funds-confirm-btn');

        if (form && label && confirmBtn) {
            form.classList.remove('hidden');
            label.textContent = 'مبلغ کسری ($)';
            confirmBtn.textContent = 'کسر مبلغ';
            confirmBtn.className = 'flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors';
            this.currentFundsAction = 'remove';
    
            document.getElementById('funds-amount').focus();
        }
    }

    hideFundsForm() {
        const form = document.getElementById('funds-form');
        if (form) {
            form.classList.add('hidden');
            document.getElementById('funds-amount').value = '';
        }
    }

    async processFundsAction() {
        try {
            const amount = parseFloat(document.getElementById('funds-amount').value);
    
            if (!amount || amount <= 0) {
                this.showAlert('مبلغ وارد شده نامعتبر است', 'error');
                return;
            }

            // Use test endpoint for now
            const response = await axios.post('/api/mode/test-demo-wallet', {
                action: this.currentFundsAction,
                amount: amount
            });

            if (response.data.success) {
                this.showAlert(response.data.message, 'success');
        
                // Update balance displays
                this.updateDemoBalanceDisplay(response.data.data.newBalance);
                this.loadCurrentDemoBalance();
        
                // Hide form
                this.hideFundsForm();
            } else {
                this.showAlert(response.data.message || 'خطا در عملیات', 'error');
            }

        } catch (error) {
            console.error('Funds action error:', error);
            this.showAlert('خطا در انجام عملیات', 'error');
        }
    }

    async resetDemoWallet() {
        try {
            const confirmed = confirm('آیا مطمئن هستید که می‌خواهید کیف پول دمو را بازنشانی کنید؟');
            if (!confirmed) return;

            // Use test endpoint for now
            const response = await axios.post('/api/mode/test-demo-wallet', {
                action: 'reset'
            });

            if (response.data.success) {
                this.showAlert('کیف پول دمو با موفقیت بازنشانی شد', 'success');
        
                // Update balance displays
                this.updateDemoBalanceDisplay(10000);
                this.loadCurrentDemoBalance();
            } else {
                this.showAlert(response.data.message || 'خطا در بازنشانی', 'error');
            }

        } catch (error) {
            console.error('Reset wallet error:', error);
            this.showAlert('خطا در بازنشانی کیف پول', 'error');
        }
    }

    updateDemoBalanceDisplay(newBalance = null) {
        if (newBalance !== null) {
            const demoBalanceElement = document.getElementById('demo-balance');
            if (demoBalanceElement) {
                demoBalanceElement.textContent = `$\${newBalance.toLocaleString()}`;
            }
    
            // Update modal balance if open
            const modalBalanceElement = document.getElementById('current-demo-balance');
            if (modalBalanceElement) {
                modalBalanceElement.textContent = `$\${newBalance.toLocaleString()}`;
            }
        }
    }

    showDemoWalletModal(wallet) {
        const modalHTML = `
            <div id="demo-wallet-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-white flex items-center">
                            <span class="text-orange-400 mr-2">💰</span>
                            مدیریت کیف پول دمو
                        </h2>
                        <button onclick="app.hideDemoWalletModal()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
            
                    <!-- Wallet Summary -->
                    <div class="bg-gray-700 rounded-lg p-4 mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-white">موجودی کل</h3>
                            <span class="text-2xl font-bold text-orange-400">$${wallet.totalValue.toLocaleString()}</span>
                        </div>
                
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            ${Object.entries(wallet.breakdown).map(([symbol, data]) => `
                                <div class="text-center p-2 bg-gray-800 rounded">
                                    <div class="text-xs text-gray-400">${symbol}</div>
                                    <div class="text-sm font-medium text-white">${data.amount.toFixed(8)}</div>
                                    <div class="text-xs text-gray-500">$${data.value.toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
            
                    <!-- Add Funds Section -->
                    <div class="bg-gray-700 rounded-lg p-4 mb-4">
                        <h3 class="text-lg font-semibold text-white mb-4">شارژ کیف پول</h3>
                
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">ارز</label>
                                <select id="add-funds-currency" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white">
                                    ${Object.keys(wallet.balances).map(symbol => `
                                        <option value="${symbol}">${symbol}</option>
                                    `).join('')}
                                </select>
                            </div>
                    
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">مقدار</label>
                                <input type="number" id="add-funds-amount" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                                       placeholder="مقدار را وارد کنید" min="0" step="0.00000001">
                            </div>
                        </div>
                
                        <div class="flex gap-2 mt-4">
                            <button onclick="app.addDemoFunds()" 
                                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                                <i class="fas fa-plus mr-1"></i>
                                افزودن موجودی
                            </button>
                    
                            <button onclick="app.resetDemoWallet()" 
                                    class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors">
                                <i class="fas fa-undo mr-1"></i>
                                بازنشانی به حالت اولیه
                            </button>
                        </div>
                    </div>
            
                    <!-- Quick Add Buttons -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-sm font-semibold text-white mb-3">شارژ سریع</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button onclick="app.quickAddFunds('USDT', 1000)" 
                                    class="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded">
                                +$1,000 USDT
                            </button>
                            <button onclick="app.quickAddFunds('USDT', 5000)" 
                                    class="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded">
                                +$5,000 USDT
                            </button>
                            <button onclick="app.quickAddFunds('BTC', 0.1)" 
                                    class="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded">
                                +0.1 BTC
                            </button>
                            <button onclick="app.quickAddFunds('ETH', 1)" 
                                    class="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded">
                                +1 ETH
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    hideDemoWalletModal() {
        const modal = document.getElementById('demo-wallet-modal');
        if (modal) {
            modal.remove();
        }
    }

    async addDemoFunds() {
        try {
            const currency = document.getElementById('add-funds-currency').value;
            const amount = parseFloat(document.getElementById('add-funds-amount').value);
    
            if (!currency || !amount || amount <= 0) {
                this.showAlert('لطفاً ارز و مقدار معتبر وارد کنید', 'error');
                return;
            }

            const userId = this.currentUser?.id || 'demo_user';
            const response = await axios.post('/api/mode/demo/add-funds', {
                userId,
                currency,
                amount
            });

            if (response.data.success) {
                this.showAlert(response.data.message, 'success');
        
                // Refresh wallet modal
                this.hideDemoWalletModal();
                setTimeout(() => this.manageDemoWallet(), 500);
        
                // Update header balance
                await this.loadDemoWalletInfo(userId);
        
            } else {
                this.showAlert(response.data.message || 'خطا در افزودن موجودی', 'error');
            }

        } catch (error) {
            console.error('Add demo funds error:', error);
            this.showAlert('خطا در افزودن موجودی دمو', 'error');
        }
    }

    async quickAddFunds(currency, amount) {
        try {
            const userId = this.currentUser?.id || 'demo_user';
            const response = await axios.post('/api/mode/demo/add-funds', {
                userId,
                currency,
                amount
            });

            if (response.data.success) {
                this.showAlert(`${amount} ${currency} به کیف پول دمو اضافه شد`, 'success');
        
                // Refresh wallet modal
                this.hideDemoWalletModal();
                setTimeout(() => this.manageDemoWallet(), 500);
        
                // Update header balance
                await this.loadDemoWalletInfo(userId);
        
            } else {
                this.showAlert(response.data.message || 'خطا در افزودن موجودی', 'error');
            }

        } catch (error) {
            console.error('Quick add funds error:', error);
            this.showAlert('خطا در افزودن موجودی دمو', 'error');
        }
    }

    async resetDemoWallet() {
        try {
            const confirmed = confirm('آیا مطمئن هستید که می‌خواهید کیف پول دمو را به حالت اولیه بازنشانی کنید؟');
            if (!confirmed) return;

            const userId = this.currentUser?.id || 'demo_user';
            const response = await axios.post('/api/mode/demo/reset-wallet', { userId });

            if (response.data.success) {
                this.showAlert(response.data.message, 'success');
        
                // Refresh wallet modal
                this.hideDemoWalletModal();
                setTimeout(() => this.manageDemoWallet(), 500);
        
                // Update header balance
                await this.loadDemoWalletInfo(userId);
        
            } else {
                this.showAlert(response.data.message || 'خطا در بازنشانی کیف پول', 'error');
            }

        } catch (error) {
            console.error('Reset demo wallet error:', error);
            this.showAlert('خطا در بازنشانی کیف پول دمو', 'error');
        }
    }

    // ===== PROFILE MANAGEMENT =====

    async showUserProfile() {
        try {
            // Remove existing modal if present
            const existingModal = document.getElementById('user-profile-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Get user data (try server first, fallback to mock)
            let userData;
            try {
                const userId = this.currentUser?.id || 'current';
                const response = await axios.get(`/api/profile/${userId}`);
                if (response.data.success) {
                    userData = response.data.data;
                } else {
                    throw new Error('Server response failed');
                }
            } catch (serverError) {
                // Use mock user data if server not available
                userData = {
                    id: this.currentUser?.id || '1',
                    username: this.currentUser?.username || 'admin',
                    email: this.currentUser?.email || 'admin@titan.com',
                    fullName: 'مدیر سیستم تایتان',
                    phone: '+989123456789',
                    role: 'admin',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser?.username || 'کاربر')}&background=3B82F6&color=ffffff&size=64`,
                    joinDate: '2024-01-15T10:30:00Z',
                    lastLogin: new Date().toISOString(),
                    preferences: {
                        language: 'fa',
                        theme: 'dark',
                        notifications: true,
                        timezone: 'Asia/Tehran'
                    },
                    stats: {
                        totalTrades: 1547,
                        profitLoss: 234567.89,
                        winRate: 67.3,
                        activeStrategies: 5
                    }
                };
                console.log('👤 Using mock profile data');
            }
    
            this.currentUserProfile = userData;
    
            // Create modal HTML
            const modalHTML = `
                <div id="user-profile-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden border border-gray-700">
                        <!-- Modal Header -->
                        <div class="flex items-center justify-between p-6 border-b border-gray-700">
                            <div class="flex items-center space-x-4 space-x-reverse">
                                <img id="profile-modal-avatar" 
                                     src="${userData.avatar}" 
                                     alt="Profile" 
                                     class="w-16 h-16 rounded-full border-2 border-blue-500">
                                <div>
                                    <h2 id="profile-modal-name" class="text-xl font-bold text-white">${userData.fullName}</h2>
                                    <p id="profile-modal-role" class="text-blue-400">${this.translateRole(userData.role)}</p>
                                    <p class="text-sm text-gray-400">@${userData.username}</p>
                                </div>
                            </div>
                            <button onclick="app.hideUserProfile()" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                
                        <!-- Modal Tabs -->
                        <div class="flex border-b border-gray-700">
                            <button onclick="app.switchProfileTab('general')" 
                                    class="profile-tab-btn px-6 py-3 text-blue-400 border-b-2 border-blue-400 font-medium">
                                <i class="fas fa-user mr-2"></i>اطلاعات عمومی
                            </button>
                            <button onclick="app.switchProfileTab('security')" 
                                    class="profile-tab-btn px-6 py-3 text-gray-400 hover:text-white font-medium">
                                <i class="fas fa-shield-alt mr-2"></i>امنیت
                            </button>
                            <button onclick="app.switchProfileTab('preferences')" 
                                    class="profile-tab-btn px-6 py-3 text-gray-400 hover:text-white font-medium">
                                <i class="fas fa-cog mr-2"></i>تنظیمات
                            </button>
                            <button onclick="app.switchProfileTab('stats')" 
                                    class="profile-tab-btn px-6 py-3 text-gray-400 hover:text-white font-medium">
                                <i class="fas fa-chart-bar mr-2"></i>آمار
                            </button>
                        </div>
                
                        <!-- Modal Content -->
                        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div id="profile-tab-content">
                                <!-- Content will be loaded here -->
                            </div>
                        </div>
                
                        <!-- Modal Footer -->
                        <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
                            <button onclick="app.hideUserProfile()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">
                                بستن
                            </button>
                            <button onclick="app.saveProfile()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                                <i class="fas fa-save mr-2"></i>ذخیره تغییرات
                            </button>
                        </div>
                    </div>
                </div>
            `;
    
            // Add modal to DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
    
            // Show modal and load first tab
            this.switchProfileTab('general');
    
        } catch (error) {
            console.error('Show user profile error:', error);
            this.showAlert('خطا در بارگذاری پروفایل کاربری', 'error');
        }
    }

    hideUserProfile() {
        document.getElementById('user-profile-modal').classList.add('hidden');
        document.getElementById('user-profile-modal').classList.remove('flex');
    }

    async switchProfileTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.profile-tab-btn').forEach(btn => {
            // Check if this button is for the current tab by looking at onclick attribute
            const isCurrentTab = btn.getAttribute('onclick').includes(`'${tabName}'`);
            if (isCurrentTab) {
                btn.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
                btn.classList.remove('text-gray-400');
            } else {
                btn.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
                btn.classList.add('text-gray-400');
            }
        });

        // Load tab content
        const content = document.getElementById('profile-tab-content');
        content.innerHTML = '<div class="text-center text-gray-400"><i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...</div>';

        try {
            let tabContent = '';
    
            switch (tabName) {
                case 'general':
                    tabContent = await this.renderGeneralProfileTab();
                    break;
                case 'security':
                    tabContent = await this.renderSecurityProfileTab();
                    break;
                case 'sessions':
                    tabContent = await this.renderSessionsProfileTab();
                    break;
                case 'activity':
                    tabContent = await this.renderActivityProfileTab();
                    break;
                case 'preferences':
                    tabContent = await this.renderPreferencesProfileTab();
                    break;
                case 'stats':
                    tabContent = await this.renderStatsProfileTab();
                    break;
                default:
                    tabContent = '<div class="text-center text-red-400">تب پیدا نشد</div>';
            }
    
            content.innerHTML = tabContent;
        } catch (error) {
            console.error('Switch profile tab error:', error);
            content.innerHTML = '<div class="text-center text-red-400">خطا در بارگذاری محتوا</div>';
        }
    }

    async renderGeneralProfileTab() {
        const userData = this.currentUserProfile;

        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-white mb-4">اطلاعات شخصی</h3>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام کامل</label>
                            <input type="text" value="${userData.fullName || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ایمیل</label>
                            <input type="email" value="${userData.email || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">شماره تلفن</label>
                            <input type="tel" value="${userData.phone || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                        </div>
                    </div>
            
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-white mb-4">اطلاعات تکمیلی</h3>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">بیو</label>
                            <textarea rows="3" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">${userData.bio || ''}</textarea>
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">مکان</label>
                            <input type="text" value="${userData.location || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                        </div>
                    </div>
                </div>
        
                <div class="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-700">
                    <button onclick="app.hideUserProfile()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                        انصراف
                    </button>
                    <button onclick="app.saveProfileChanges()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                        ذخیره تغییرات
                    </button>
                </div>
            </div>
        `;
    }

    async renderSecurityProfileTab() {
        return `
            <div class="space-y-6">
                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4">تغییر رمز عبور</h3>
            
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور فعلی</label>
                            <input type="password" id="current-password" 
                                   class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور جدید</label>
                            <input type="password" id="new-password" 
                                   class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">تکرار رمز عبور جدید</label>
                            <input type="password" id="confirm-password" 
                                   class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        </div>
                
                        <button onclick="app.changePassword()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
                            تغییر رمز عبور
                        </button>
                    </div>
                </div>
        
                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4">احراز دو مرحله‌ای</h3>
            
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-white">فعال‌سازی احراز دو مرحله‌ای</p>
                            <p class="text-sm text-gray-400">امنیت بیشتر برای حساب شما</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" ${this.currentUserProfile?.twoFactorEnabled ? 'checked' : ''} 
                                   class="sr-only peer" onchange="app.toggle2FA(this.checked)">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    async renderSessionsProfileTab() {
        try {
            const response = await axios.get(`/api/profile/${this.currentUser.id}/sessions`);
            const sessions = response.data.success ? response.data.data : [];
    
            return `
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-white">دستگاه‌های متصل</h3>
            
                    ${sessions.map(session => {
                        // Handle API response structure
                        const deviceInfo = session.deviceInfo || {};
                        const deviceName = `${deviceInfo.browser || 'مرورگر ناشناخته'} - ${deviceInfo.device || 'دستگاه ناشناخته'}`;
                        const location = deviceInfo.location || 'مکان نامشخص';
                        const lastActive = session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString('fa-IR') : 'نامشخص';
                        const deviceIcon = deviceInfo.device && deviceInfo.device.includes('iPhone') ? 'mobile-alt' : 'desktop';
                
                        return `
                        <div class="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                            <div class="flex items-center space-x-3 space-x-reverse">
                                <i class="fas fa-${deviceIcon} text-blue-400"></i>
                                <div>
                                    <p class="text-white font-medium">${deviceName}</p>
                                    <p class="text-sm text-gray-400">${location}</p>
                                    <p class="text-xs text-gray-500">آخرین فعالیت: ${lastActive}</p>
                                </div>
                            </div>
                    
                            <div class="flex items-center space-x-2 space-x-reverse">
                                ${session.isActive ? 
                                    '<span class="text-green-400 text-sm">دستگاه فعلی</span>' : 
                                    `<button onclick="app.terminateSession('${session.id}')" class="text-red-400 hover:text-red-300 text-sm">قطع اتصال</button>`
                                }
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
        } catch (error) {
            return '<div class="text-center text-red-400">خطا در بارگذاری جلسات</div>';
        }
    }

    async renderActivityProfileTab() {
        try {
            const response = await axios.get(`/api/profile/${this.currentUser.id}/activity`);
            const activities = response.data.success ? response.data.data : [];
    
            return `
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-white">تاریخچه فعالیت‌ها</h3>
            
                    ${activities.length > 0 ? activities.map(activity => {
                        const timestamp = activity.timestamp ? new Date(activity.timestamp).toLocaleString('fa-IR') : 'نامشخص';
                        const severityColor = {
                            'info': 'text-blue-400',
                            'warning': 'text-yellow-400', 
                            'critical': 'text-red-400'
                        }[activity.severity] || 'text-gray-400';
                
                        const typeIcon = {
                            'login': 'sign-in-alt',
                            'logout': 'sign-out-alt',
                            'trade': 'chart-line',
                            'deposit': 'arrow-down',
                            'withdraw': 'arrow-up',
                            'settings_change': 'cog',
                            'security_event': 'shield-alt'
                        }[activity.type] || 'info-circle';
                
                        return `
                        <div class="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                            <div class="flex items-center space-x-3 space-x-reverse">
                                <i class="fas fa-${typeIcon} ${severityColor}"></i>
                                <div>
                                    <p class="text-white font-medium">${activity.description || 'فعالیت نامشخص'}</p>
                                    <p class="text-sm text-gray-400">IP: ${activity.ip || 'نامشخص'} | Device: ${activity.device || 'نامشخص'}</p>
                                    <p class="text-xs text-gray-500">${timestamp}</p>
                                </div>
                            </div>
                    
                            <div class="text-right">
                                <span class="px-2 py-1 rounded text-xs ${severityColor} bg-gray-600">
                                    ${activity.severity === 'info' ? 'اطلاعات' : activity.severity === 'warning' ? 'هشدار' : 'بحرانی'}
                                </span>
                            </div>
                        </div>
                        `;
                    }).join('') : '<div class="bg-gray-700 rounded-lg p-4"><p class="text-center text-gray-400">هیچ فعالیتی یافت نشد</p></div>'}
                </div>
            `;
        } catch (error) {
            console.error('Load activities error:', error);
            return `
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-white">تاریخچه فعالیت‌ها</h3>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <p class="text-center text-red-400">خطا در بارگذاری تاریخچه فعالیت‌ها</p>
                    </div>
                </div>
            `;
        }
    }

    async renderPreferencesProfileTab() {
        return `
            <div class="space-y-6">
                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4">تنظیمات نمایش</h3>
            
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">تم</label>
                            <select class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                                <option value="dark">تیره</option>
                                <option value="light">روشن</option>
                            </select>
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">زبان</label>
                            <select class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                                <option value="fa">فارسی</option>
                                <option value="en">انگلیسی</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderStatsProfileTab() {
        const userData = this.currentUserProfile;

        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-blue-600 rounded-lg p-4 text-white text-center">
                        <div class="text-2xl font-bold">${userData.stats?.totalTrades || 0}</div>
                        <div class="text-sm opacity-90">کل معاملات</div>
                    </div>
                    <div class="bg-green-600 rounded-lg p-4 text-white text-center">
                        <div class="text-2xl font-bold">${(userData.stats?.profitLoss || 0).toLocaleString('fa-IR')} $</div>
                        <div class="text-sm opacity-90">سود/زیان</div>
                    </div>
                    <div class="bg-purple-600 rounded-lg p-4 text-white text-center">
                        <div class="text-2xl font-bold">${userData.stats?.winRate || 0}%</div>
                        <div class="text-sm opacity-90">نرخ برد</div>
                    </div>
                    <div class="bg-orange-600 rounded-lg p-4 text-white text-center">
                        <div class="text-2xl font-bold">${userData.stats?.activeStrategies || 0}</div>
                        <div class="text-sm opacity-90">استراتژی فعال</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4">آمار معاملات</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">معاملات موفق:</span>
                                <span class="text-green-400">${Math.round((userData.stats?.totalTrades || 0) * (userData.stats?.winRate || 0) / 100)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">معاملات ناموفق:</span>
                                <span class="text-red-400">${(userData.stats?.totalTrades || 0) - Math.round((userData.stats?.totalTrades || 0) * (userData.stats?.winRate || 0) / 100)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">میانگین سود:</span>
                                <span class="text-blue-400">${((userData.stats?.profitLoss || 0) / (userData.stats?.totalTrades || 1)).toLocaleString('fa-IR')} $</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4">اطلاعات حساب</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">تاریخ عضویت:</span>
                                <span class="text-white">${new Date(userData.joinDate).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">آخرین ورود:</span>
                                <span class="text-white">${new Date(userData.lastLogin).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">وضعیت حساب:</span>
                                <span class="text-green-400">فعال</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4">عملکرد اخیر</h3>
                    <div class="text-center text-gray-400 py-8">
                        📈 نمودار عملکرد در حال توسعه
                    </div>
                </div>
            </div>
        `;
    }

    // ===== ADMIN USERS MANAGEMENT =====

    async showAdminUsersModal() {
        if (this.currentUser?.role !== 'admin') {
            this.showAlert('دسترسی محدود - فقط مدیران', 'error');
            return;
        }

        document.getElementById('admin-users-modal').classList.remove('hidden');
        document.getElementById('admin-users-modal').classList.add('flex');
        this.switchAdminTab('overview');
    }

    hideAdminUsersModal() {
        document.getElementById('admin-users-modal').classList.add('hidden');
        document.getElementById('admin-users-modal').classList.remove('flex');
    }

    async switchAdminTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active', 'text-blue-400', 'border-blue-400');
                btn.classList.remove('text-gray-300');
            } else {
                btn.classList.remove('active', 'text-blue-400', 'border-blue-400');
                btn.classList.add('text-gray-300');
            }
        });

        // Load tab content
        const content = document.getElementById('admin-tab-content');
        content.innerHTML = '<div class="text-center text-gray-400"><i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...</div>';

        try {
            let tabContent = '';
    
            switch (tabName) {
                case 'overview':
                    tabContent = await this.renderAdminOverviewTab();
                    break;
                case 'users':
                    tabContent = await this.renderAdminUsersTab();
                    break;
                case 'suspicious':
                    tabContent = await this.renderAdminSuspiciousTab();
                    break;
                case 'create':
                    tabContent = await this.renderAdminCreateTab();
                    break;
                default:
                    tabContent = '<div class="text-center text-red-400">تب پیدا نشد</div>';
            }
    
            content.innerHTML = tabContent;
        } catch (error) {
            console.error('Switch admin tab error:', error);
            content.innerHTML = '<div class="text-center text-red-400">خطا در بارگذاری محتوا</div>';
        }
    }

    async renderAdminOverviewTab() {
        try {
            const response = await axios.get('/api/admin/users/stats');
            const stats = response.data.success ? response.data.data : {};
    
            return `
                <div class="space-y-6">
                    <h3 class="text-xl font-semibold text-white">آمار کلی کاربران</h3>
            
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-blue-600 rounded-lg p-4 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">کل کاربران</p>
                                    <p class="text-2xl font-bold">${stats.totalUsers || 0}</p>
                                </div>
                                <i class="fas fa-users text-3xl opacity-70"></i>
                            </div>
                        </div>
                
                        <div class="bg-green-600 rounded-lg p-4 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">کاربران فعال</p>
                                    <p class="text-2xl font-bold">${stats.activeUsers || 0}</p>
                                </div>
                                <i class="fas fa-user-check text-3xl opacity-70"></i>
                            </div>
                        </div>
                
                        <div class="bg-yellow-600 rounded-lg p-4 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">آنلاین</p>
                                    <p class="text-2xl font-bold">${stats.onlineUsers || 0}</p>
                                </div>
                                <i class="fas fa-circle text-3xl opacity-70"></i>
                            </div>
                        </div>
                
                        <div class="bg-red-600 rounded-lg p-4 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">فعالیت مشکوک</p>
                                    <p class="text-2xl font-bold">${stats.suspiciousActivities || 0}</p>
                                </div>
                                <i class="fas fa-exclamation-triangle text-3xl opacity-70"></i>
                            </div>
                        </div>
                    </div>
            
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-white mb-4">کاربران جدید</h4>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">امروز</span>
                                    <span class="text-white font-medium">${stats.newUsersToday || 0}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">این هفته</span>
                                    <span class="text-white font-medium">${stats.newUsersThisWeek || 0}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">این ماه</span>
                                    <span class="text-white font-medium">${stats.newUsersThisMonth || 0}</span>
                                </div>
                            </div>
                        </div>
                
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-white mb-4">وضعیت حساب‌ها</h4>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">تأیید شده</span>
                                    <span class="text-green-400 font-medium">${stats.verifiedUsers || 0}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">در انتظار تأیید</span>
                                    <span class="text-yellow-400 font-medium">${stats.unverifiedUsers || 0}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">تعلیق شده</span>
                                    <span class="text-red-400 font-medium">${stats.suspendedUsers || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return '<div class="text-center text-red-400">خطا در بارگذاری آمار</div>';
        }
    }

    async renderAdminUsersTab() {
        try {
            const response = await axios.get('/api/admin/users/list');
            const users = response.data.success ? response.data.data.users : [];
    
            return `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-semibold text-white">لیست کاربران</h3>
                        <input type="text" placeholder="جستجو کاربر..." 
                               class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                    </div>
            
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs uppercase bg-gray-700 text-gray-300">
                                <tr>
                                    <th class="px-6 py-3">کاربر</th>
                                    <th class="px-6 py-3">نقش</th>
                                    <th class="px-6 py-3">وضعیت</th>
                                    <th class="px-6 py-3">تاریخ عضویت</th>
                                    <th class="px-6 py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.slice(0, 10).map(user => `
                                    <tr class="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center space-x-3 space-x-reverse">
                                                <img src="${user.avatar}" alt="${user.fullName}" 
                                                     class="w-8 h-8 rounded-full">
                                                <div>
                                                    <p class="text-white font-medium">${user.fullName}</p>
                                                    <p class="text-gray-400 text-xs">${user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'} text-white">
                                                ${this.translateRole(user.role)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} text-white">
                                                ${user.status === 'active' ? 'فعال' : 'غیرفعال'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-gray-300">
                                            ${new Date(user.createdAt).toLocaleDateString('fa-IR')}
                                        </td>
                                        <td class="px-6 py-4 space-x-2 space-x-reverse">
                                            <button onclick="app.showUserDetail('${user.id}')" 
                                                    class="text-blue-400 hover:text-blue-300 text-xs">
                                                مشاهده
                                            </button>
                                            <button onclick="app.toggleUserStatus('${user.id}', '${user.status}')" 
                                                    class="text-yellow-400 hover:text-yellow-300 text-xs">
                                                ${user.status === 'active' ? 'غیرفعال' : 'فعال'}
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return '<div class="text-center text-red-400">خطا در بارگذاری لیست کاربران</div>';
        }
    }

    async renderAdminSuspiciousTab() {
        try {
            const response = await axios.get('/api/admin/users/suspicious-activities');
            const activities = response.data.success ? response.data.data : [];
    
            return `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-semibold text-white">فعالیت‌های مشکوک</h3>
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button onclick="app.refreshSuspiciousActivities()" 
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
                                <i class="fas fa-sync-alt mr-2"></i>
                                بروزرسانی
                            </button>
                            <select class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                                <option value="all">همه فعالیت‌ها</option>
                                <option value="login">ورودهای مشکوک</option>
                                <option value="trade">معاملات مشکوک</option>
                                <option value="security">تخلفات امنیتی</option>
                            </select>
                        </div>
                    </div>
            
                    ${activities.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left">
                                <thead class="text-xs uppercase bg-gray-700 text-gray-300">
                                    <tr>
                                        <th class="px-6 py-3">نوع</th>
                                        <th class="px-6 py-3">کاربر</th>
                                        <th class="px-6 py-3">توضیحات</th>
                                        <th class="px-6 py-3">زمان</th>
                                        <th class="px-6 py-3">وضعیت</th>
                                        <th class="px-6 py-3">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${activities.map(activity => `
                                        <tr class="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                                            <td class="px-6 py-4">
                                                <span class="px-2 py-1 rounded text-xs ${this.getSuspiciousTypeColor(activity.type)} text-white">
                                                    ${this.translateSuspiciousType(activity.type)}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center space-x-3 space-x-reverse">
                                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(activity.username || 'کاربر')}&background=3B82F6&color=ffffff&size=32" 
                                                         alt="${activity.username || 'کاربر'}" 
                                                         class="w-8 h-8 rounded-full">
                                                    <div>
                                                        <p class="text-white font-medium">${activity.username || 'کاربر ناشناس'}</p>
                                                        <p class="text-gray-400 text-xs">ID: ${activity.userId || 'نامشخص'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <p class="text-gray-300 text-sm">${activity.description}</p>
                                                ${activity.details ? `<p class="text-gray-400 text-xs mt-1">${activity.details}</p>` : ''}
                                            </td>
                                            <td class="px-6 py-4 text-gray-300">
                                                ${new Date(activity.timestamp).toLocaleString('fa-IR')}
                                            </td>
                                            <td class="px-6 py-4">
                                                <span class="px-2 py-1 rounded text-xs ${activity.resolved ? 'bg-green-600' : 'bg-red-600'} text-white">
                                                    ${activity.resolved ? 'حل شده' : 'در انتظار بررسی'}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 space-x-2 space-x-reverse">
                                                ${!activity.resolved ? `
                                                    <button onclick="app.resolveSuspiciousActivity('${activity.id}')" 
                                                            class="text-green-400 hover:text-green-300 text-xs">
                                                        حل شد
                                                    </button>
                                                    <button onclick="app.blockUser('${activity.userId}')" 
                                                            class="text-red-400 hover:text-red-300 text-xs">
                                                        مسدود
                                                    </button>
                                                ` : `
                                                    <span class="text-gray-500 text-xs">رسیدگی شده</span>
                                                `}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="bg-gray-700 rounded-lg p-8 text-center">
                            <i class="fas fa-shield-check text-6xl text-green-400 mb-4"></i>
                            <h4 class="text-xl font-semibold text-white mb-2">فعالیت مشکوکی یافت نشد</h4>
                            <p class="text-gray-400">همه فعالیت‌ها عادی و ایمن هستند</p>
                        </div>
                    `}
                </div>
            `;
        } catch (error) {
            console.error('Render suspicious activities error:', error);
            return `
                <div class="space-y-4">
                    <h3 class="text-xl font-semibold text-white">فعالیت‌های مشکوک</h3>
            
                    <div class="bg-red-600 rounded-lg p-4 text-center">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p class="text-white">خطا در بارگذاری فعالیت‌های مشکوک</p>
                        <button onclick="app.switchAdminTab('suspicious')" 
                                class="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm rounded">
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async renderAdminCreateTab() {
        return `
            <div class="space-y-6">
                <h3 class="text-xl font-semibold text-white">ایجاد کاربر جدید</h3>
        
                <div class="bg-gray-700 rounded-lg p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام کامل</label>
                            <input type="text" id="new-user-name" 
                                   class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ایمیل</label>
                            <input type="email" id="new-user-email" 
                                   class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
                            <input type="password" id="new-user-password" 
                                   class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        </div>
                
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نقش</label>
                            <select id="new-user-role" class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                                <option value="viewer">مشاهده‌گر</option>
                                <option value="trader">معامله‌گر</option>
                                <option value="analyst">تحلیلگر</option>
                                <option value="admin">مدیر</option>
                            </select>
                        </div>
                    </div>
            
                    <div class="mt-6">
                        <button onclick="app.createNewUser()" 
                                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
                            ایجاد کاربر
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    translateRole(role) {
        const roles = {
            'admin': 'مدیر کل',
            'trader': 'معامله‌گر',
            'analyst': 'تحلیلگر',
            'viewer': 'مشاهده‌گر',
            'demo': 'کاربر آزمایشی'
        };
        return roles[role] || role;
    }

    async saveProfileChanges() {
        this.showAlert('ذخیره تغییرات در حال توسعه است', 'info');
    }

    async changePassword() {
        const currentPassword = document.getElementById('current-password')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showAlert('لطفاً تمام فیلدها را پر کنید', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showAlert('رمز عبور جدید و تکرار آن مطابقت ندارند', 'error');
            return;
        }

        try {
            const response = await axios.post(`/api/profile/${this.currentUser.id}/password`, {
                currentPassword,
                newPassword
            });
    
            if (response.data.success) {
                this.showAlert('رمز عبور با موفقیت تغییر کرد', 'success');
                // Clear fields
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            } else {
                this.showAlert(response.data.message || 'خطا در تغییر رمز عبور', 'error');
            }
        } catch (error) {
            console.error('Change password error:', error);
            this.showAlert('خطا در تغییر رمز عبور', 'error');
        }
    }

    async toggle2FA(enabled) {
        try {
            const response = await axios.post(`/api/profile/${this.currentUser.id}/2fa`, {
                enabled
            });
    
            if (response.data.success) {
                this.currentUserProfile.twoFactorEnabled = enabled;
                this.showAlert(`احراز دو مرحله‌ای ${enabled ? 'فعال' : 'غیرفعال'} شد`, 'success');
                this.switchProfileTab('security'); // Refresh the tab
            } else {
                this.showAlert(response.data.message || 'خطا در تغییر احراز دو مرحله‌ای', 'error');
            }
        } catch (error) {
            console.error('Toggle 2FA error:', error);
            this.showAlert('خطا در تغییر احراز دو مرحله‌ای', 'error');
        }
    }

    async terminateSession(sessionId) {
        try {
            const response = await axios.delete(`/api/profile/${this.currentUser.id}/sessions/${sessionId}`);
    
            if (response.data.success) {
                this.showAlert('جلسه با موفقیت قطع شد', 'success');
                this.switchProfileTab('sessions'); // Refresh the tab
            } else {
                this.showAlert(response.data.message || 'خطا در قطع جلسه', 'error');
            }
        } catch (error) {
            console.error('Terminate session error:', error);
            this.showAlert('خطا در قطع جلسه', 'error');
        }
    }

    async showUserDetail(userId) {
        try {
            const response = await axios.get(`/api/admin/users/${userId}`);
    
            if (response.data.success) {
                const userData = response.data.data;
        
                // Update user detail modal header
                document.getElementById('user-detail-avatar').src = userData.avatar;
                document.getElementById('user-detail-name').textContent = userData.fullName;
                document.getElementById('user-detail-email').textContent = userData.email;
        
                // Load user detail content
                const content = document.getElementById('user-detail-content');
                content.innerHTML = this.renderUserDetailContent(userData);
        
                // Show user detail modal
                document.getElementById('user-detail-modal').classList.remove('hidden');
                document.getElementById('user-detail-modal').classList.add('flex');
            }
        } catch (error) {
            console.error('Show user detail error:', error);
            this.showAlert('خطا در بارگذاری جزئیات کاربر', 'error');
        }
    }

    hideUserDetailModal() {
        document.getElementById('user-detail-modal').classList.add('hidden');
        document.getElementById('user-detail-modal').classList.remove('flex');
    }

    renderUserDetailContent(userData) {
        return `
            <div class="space-y-6">
                <!-- User Information Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
                    <!-- Basic Info -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                            <i class="fas fa-user text-blue-400 mr-2"></i>
                            اطلاعات کاربری
                        </h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">نام کامل:</span>
                                <span class="text-white font-medium">${userData.fullName}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">ایمیل:</span>
                                <span class="text-white font-medium">${userData.email}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">تلفن:</span>
                                <span class="text-white font-medium">${userData.phone || 'ندارد'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">نقش:</span>
                                <span class="px-2 py-1 rounded text-xs ${userData.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'} text-white">
                                    ${this.translateRole(userData.role)}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">وضعیت:</span>
                                <span class="px-2 py-1 rounded text-xs ${userData.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} text-white">
                                    ${userData.status === 'active' ? 'فعال' : 'غیرفعال'}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">تاریخ عضویت:</span>
                                <span class="text-white font-medium">${new Date(userData.createdAt).toLocaleDateString('fa-IR')}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Account Status -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                            <i class="fas fa-shield-alt text-green-400 mr-2"></i>
                            وضعیت حساب
                        </h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">تأیید ایمیل:</span>
                                <span class="text-${userData.emailVerified ? 'green' : 'red'}-400">
                                    ${userData.emailVerified ? '✓ تأیید شده' : '✗ تأیید نشده'}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">تأیید تلفن:</span>
                                <span class="text-${userData.phoneVerified ? 'green' : 'red'}-400">
                                    ${userData.phoneVerified ? '✓ تأیید شده' : '✗ تأیید نشده'}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">احراز دو مرحله‌ای:</span>
                                <span class="text-${userData.twoFactorEnabled ? 'green' : 'red'}-400">
                                    ${userData.twoFactorEnabled ? '✓ فعال' : '✗ غیرفعال'}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">جلسات فعال:</span>
                                <span class="text-white font-medium">${userData.activeSessions || 0}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">تعداد ورود:</span>
                                <span class="text-white font-medium">${userData.loginCount || 0}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Trading Stats -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                            <i class="fas fa-chart-line text-yellow-400 mr-2"></i>
                            آمار معاملات
                        </h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">تعداد معاملات:</span>
                                <span class="text-white font-medium">${userData.totalTrades || 0}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">حجم کل:</span>
                                <span class="text-white font-medium">$${(userData.totalVolume || 0).toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">سود/زیان کل:</span>
                                <span class="text-${(userData.totalPnL || 0) >= 0 ? 'green' : 'red'}-400 font-medium">
                                    ${(userData.totalPnL || 0) >= 0 ? '+' : ''}$${(userData.totalPnL || 0).toFixed(2)}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">موجودی فعلی:</span>
                                <span class="text-white font-medium">$${(userData.currentBalance || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Security Info -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                            <i class="fas fa-lock text-red-400 mr-2"></i>
                            اطلاعات امنیتی
                        </h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">مکان:</span>
                                <span class="text-white font-medium">${userData.location || 'نامشخص'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">IP ثبت‌نام:</span>
                                <span class="text-white font-medium">${userData.registrationIP || 'نامشخص'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">آخرین IP ورود:</span>
                                <span class="text-white font-medium">${userData.lastLoginIP || 'نامشخص'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">آخرین ورود:</span>
                                <span class="text-white font-medium">${new Date(userData.lastLoginAt).toLocaleString('fa-IR')}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">فعالیت مشکوک:</span>
                                <span class="text-${(userData.suspiciousActivities || 0) > 0 ? 'red' : 'green'}-400 font-medium">
                                    ${userData.suspiciousActivities || 0} مورد
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Admin Actions -->
                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-tools text-purple-400 mr-2"></i>
                        عملیات مدیریتی
                    </h3>
                    <div class="flex flex-wrap gap-3">
                        <button onclick="app.toggleUserStatus('${userData.id}', '${userData.status}')" 
                                class="px-4 py-2 bg-${userData.status === 'active' ? 'red' : 'green'}-600 hover:bg-${userData.status === 'active' ? 'red' : 'green'}-700 text-white text-sm rounded">
                            ${userData.status === 'active' ? 'غیرفعال کردن' : 'فعال کردن'}
                        </button>
                
                        <button onclick="app.resetUserPassword('${userData.id}')" 
                                class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded">
                            بازنشانی رمز عبور
                        </button>
                
                        <button onclick="app.forceLogoutUser('${userData.id}')" 
                                class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded">
                            خروج اجباری از همه دستگاه‌ها
                        </button>
                
                        <button onclick="app.deleteUser('${userData.id}')" 
                                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded">
                            حذف کاربر
                        </button>
                    </div>
                </div>

                <!-- Notes Section -->
                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-sticky-note text-green-400 mr-2"></i>
                        یادداشت‌های مدیریتی
                    </h3>
                    <textarea id="user-notes-${userData.id}" rows="3" 
                              class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                              placeholder="یادداشت‌های خود را اینجا بنویسید...">${userData.notes || ''}</textarea>
                    <button onclick="app.saveUserNotes('${userData.id}')" 
                            class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
                        ذخیره یادداشت
                    </button>
                </div>
            </div>
        `;
    }

    async toggleUserStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const actionText = newStatus === 'active' ? 'فعال' : 'غیرفعال';

        try {
            const response = await axios.post(`/api/admin/users/${userId}/status`, {
                status: newStatus
            });
    
            if (response.data.success) {
                this.showAlert(`کاربر با موفقیت ${actionText} شد`, 'success');
                this.switchAdminTab('users'); // Refresh users list
            } else {
                this.showAlert(response.data.message || `خطا در ${actionText} کاربر`, 'error');
            }
        } catch (error) {
            console.error('Toggle user status error:', error);
            this.showAlert('خطا در تغییر وضعیت کاربر', 'error');
        }
    }

    async createNewUser() {
        const name = document.getElementById('new-user-name')?.value;
        const email = document.getElementById('new-user-email')?.value;
        const password = document.getElementById('new-user-password')?.value;
        const role = document.getElementById('new-user-role')?.value;

        if (!name || !email || !password || !role) {
            this.showAlert('لطفاً تمام فیلدها را پر کنید', 'error');
            return;
        }

        try {
            const response = await axios.post('/api/admin/users/create', {
                fullName: name,
                email,
                password,
                role
            });
    
            if (response.data.success) {
                this.showAlert('کاربر جدید با موفقیت ایجاد شد', 'success');
                // Clear form
                document.getElementById('new-user-name').value = '';
                document.getElementById('new-user-email').value = '';
                document.getElementById('new-user-password').value = '';
                document.getElementById('new-user-role').value = 'viewer';
        
                // Switch to users tab to show the new user
                this.switchAdminTab('users');
            } else {
                this.showAlert(response.data.message || 'خطا در ایجاد کاربر', 'error');
            }
        } catch (error) {
            console.error('Create user error:', error);
            this.showAlert('خطا در ایجاد کاربر جدید', 'error');
        }
    }

    // Additional admin user management functions
    async resetUserPassword(userId) {
        try {
            const response = await axios.post(`/api/admin/users/${userId}/reset-password`);
    
            if (response.data.success) {
                this.showAlert('رمز عبور کاربر بازنشانی شد', 'success');
            } else {
                this.showAlert(response.data.message || 'خطا در بازنشانی رمز عبور', 'error');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            this.showAlert('خطا در بازنشانی رمز عبور', 'error');
        }
    }

    async forceLogoutUser(userId) {
        try {
            const response = await axios.post(`/api/admin/users/${userId}/force-logout`);
    
            if (response.data.success) {
                this.showAlert('کاربر از همه دستگاه‌ها خارج شد', 'success');
            } else {
                this.showAlert(response.data.message || 'خطا در خروج اجباری', 'error');
            }
        } catch (error) {
            console.error('Force logout error:', error);
            this.showAlert('خطا در خروج اجباری کاربر', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('آیا از حذف این کاربر اطمینان دارید؟ این عمل قابل بازگشت نیست!')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/admin/users/${userId}`);
    
            if (response.data.success) {
                this.showAlert('کاربر با موفقیت حذف شد', 'success');
                this.hideUserDetailModal();
                this.switchAdminTab('users'); // Refresh users list
            } else {
                this.showAlert(response.data.message || 'خطا در حذف کاربر', 'error');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            this.showAlert('خطا در حذف کاربر', 'error');
        }
    }

    async saveUserNotes(userId) {
        const notes = document.getElementById(`user-notes-${userId}`)?.value || '';

        try {
            const response = await axios.post(`/api/admin/users/${userId}/note`, {
                notes
            });
    
            if (response.data.success) {
                this.showAlert('یادداشت ذخیره شد', 'success');
            } else {
                this.showAlert(response.data.message || 'خطا در ذخیره یادداشت', 'error');
            }
        } catch (error) {
            console.error('Save notes error:', error);
            this.showAlert('خطا در ذخیره یادداشت', 'error');
        }
    }

    // Suspicious activities helper functions
    getSuspiciousTypeColor(type) {
        const colors = {
            'failed_login': 'bg-red-600',
            'multiple_login': 'bg-orange-600',
            'suspicious_trade': 'bg-yellow-600',
            'ip_change': 'bg-purple-600',
            'security_violation': 'bg-red-800',
            'unusual_activity': 'bg-blue-600'
        };
        return colors[type] || 'bg-gray-600';
    }

    translateSuspiciousType(type) {
        const types = {
            'failed_login': 'ورود ناموفق',
            'multiple_login': 'ورود چندگانه',
            'suspicious_trade': 'معامله مشکوک',
            'ip_change': 'تغییر IP',
            'security_violation': 'تخلف امنیتی',
            'unusual_activity': 'فعالیت غیرعادی'
        };
        return types[type] || type;
    }

    async refreshSuspiciousActivities() {
        this.switchAdminTab('suspicious');
    }

    async resolveSuspiciousActivity(activityId) {
        try {
            const response = await axios.post(`/api/admin/users/suspicious-activities/${activityId}/resolve`, {
                adminNotes: 'بررسی شد - مشکلی وجود ندارد',
                action: 'resolved'
            });
    
            if (response.data.success) {
                this.showAlert('فعالیت مشکوک به عنوان حل شده علامت‌گذاری شد', 'success');
                this.switchAdminTab('suspicious'); // Refresh the tab
            } else {
                this.showAlert(response.data.message || 'خطا در حل فعالیت مشکوک', 'error');
            }
        } catch (error) {
            console.error('Resolve suspicious activity error:', error);
            this.showAlert('خطا در حل فعالیت مشکوک', 'error');
        }
    }

    async blockUser(userId) {
        if (!confirm('آیا از مسدود کردن این کاربر اطمینان دارید؟')) {
            return;
        }

        try {
            const response = await axios.post(`/api/admin/users/${userId}/status`, {
                status: 'banned',
                reason: 'فعالیت مشکوک تشخیص داده شد'
            });
    
            if (response.data.success) {
                this.showAlert('کاربر مسدود شد', 'success');
                this.switchAdminTab('suspicious'); // Refresh the tab
            } else {
                this.showAlert(response.data.message || 'خطا در مسدود کردن کاربر', 'error');
            }
        } catch (error) {
            console.error('Block user error:', error);
            this.showAlert('خطا در مسدود کردن کاربر', 'error');
        }
    }

    // Widget Button Functions
    showAddToWatchlistModal() {
        this.showAlert('افزودن به لیست مورد علاقه', 'info', 'این قابلیت به زودی فعال خواهد شد');
    }

    toggleWatchlistFavorite(symbol) {
        this.showAlert(`${symbol} از لیست مورد علاقه حذف شد`, 'success');
    }

    showWatchlistPage() {
        // Switch to watchlist page properly
        this.loadModule('watchlist');
    }

    filterTopMovers(type) {
        if (type === 'gainers') {
            this.showAlert('نمایش ارزهای صعودی', 'success', 'فیلتر روی ارزهای صعودی اعمال شد');
        } else if (type === 'losers') {
            this.showAlert('نمایش ارزهای نزولی', 'info', 'فیلتر روی ارزهای نزولی اعمال شد');
        }
    }

    showSignalSettings() {
        document.getElementById('signalSettingsModal').classList.remove('hidden');
        // Initialize slider after modal is shown
        setTimeout(() => this.initSignalSettingsSlider(), 100);
    }

    hideSignalSettings() {
        document.getElementById('signalSettingsModal').classList.add('hidden');
    }

    saveSignalSettings() {
        // Get settings values
        const rsiEnabled = document.getElementById('rsiEnabled').checked;
        const macdEnabled = document.getElementById('macdEnabled').checked;
        const emaEnabled = document.getElementById('emaEnabled').checked;
        const confidenceThreshold = document.getElementById('confidenceThreshold').value;

        // Save settings (in real app, would save to backend)
        localStorage.setItem('signalSettings', JSON.stringify({
            rsiEnabled,
            macdEnabled, 
            emaEnabled,
            confidenceThreshold
        }));

        this.showAlert('تنظیمات سیگنال‌ها ذخیره شد', 'success');
        this.hideSignalSettings();
    }

    initSignalSettingsSlider() {
        const slider = document.getElementById('confidenceThreshold');
        const valueDisplay = document.getElementById('confidenceValue');

        if (slider && valueDisplay) {
            slider.addEventListener('input', function() {
                valueDisplay.textContent = this.value + '%';
            });
        }
    }

    // Enhanced Navigation Functions
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');
        const menuBtn = document.getElementById('mobile-menu-btn');
        const isOpen = mobileMenu.classList.contains('show');

        if (isOpen) {
            this.closeMobileMenu();
        } else {
            // Show overlay first
            overlay.classList.add('show');
            // Then show menu with animation
            setTimeout(() => {
                mobileMenu.classList.add('show');
            }, 50);
            // Update button icon
            menuBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
            // Setup click outside listener
            this.setupClickOutsideHandlers();
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');
        const menuBtn = document.getElementById('mobile-menu-btn');

        // Hide menu first
        mobileMenu.classList.remove('show');
        // Then hide overlay
        setTimeout(() => {
            overlay.classList.remove('show');
        }, 300);
        // Reset button icon
        menuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        // Restore body scroll
        document.body.style.overflow = '';
    }

    toggleMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        const moreBtn = document.getElementById('more-menu-btn');

        if (moreMenu.classList.contains('hidden')) {
            moreMenu.classList.remove('hidden');
            // Add stagger animation to dropdown items
            const items = moreMenu.querySelectorAll('.nav-dropdown-link');
            items.forEach((item, index) => {
                item.style.animation = `fadeInUp 0.3s ease-out ${index * 0.1}s both`;
            });
        } else {
            moreMenu.classList.add('hidden');
        }
    }

    toggleMobileActions() {
        // Toggle mobile actions dropdown (for future use)
        console.log('Mobile actions menu toggled');
    }

    // Update active navigation link
    updateActiveNavLink(moduleName) {
        // Desktop nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Mobile nav
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Find and activate the correct link
        const activeSelector = `[onclick*="loadModule('${moduleName}')"]`;
        const activeDesktopLink = document.querySelector(`.nav-link${activeSelector}`);
        const activeMobileLink = document.querySelector(`.mobile-nav-link${activeSelector}`);

        if (activeDesktopLink) activeDesktopLink.classList.add('active');
        if (activeMobileLink) activeMobileLink.classList.add('active');
    }

    // Close dropdowns when clicking outside
    setupClickOutsideHandlers() {
        // Handle overlay click to close mobile menu
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        document.addEventListener('click', (e) => {
            // Close more menu if clicking outside
            const moreMenu = document.getElementById('more-menu');
            const moreBtn = document.getElementById('more-menu-btn');
            if (!moreMenu?.contains(e.target) && !moreBtn?.contains(e.target)) {
                moreMenu?.classList.add('hidden');
            }
    
            // Close mobile menu if clicking outside (but not on overlay - handled separately)
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileBtn = document.getElementById('mobile-menu-btn');
            const mobileOverlay = document.getElementById('mobile-menu-overlay');
            if (!mobileMenu?.contains(e.target) && 
                !mobileBtn?.contains(e.target) && 
                !mobileOverlay?.contains(e.target) && 
                e.target !== mobileOverlay) {
                this.closeMobileMenu();
            }
        });
    }

    // Enhanced Widget Management Functions
    
    // Auto-save layout whenever widgets are moved
    autoSaveLayout() {
        const widgets = document.querySelectorAll('.dashboard-widget');
        const layout = [];

        widgets.forEach((widget, index) => {
            layout.push({
                id: widget.id,
                position: index,
                visible: !widget.classList.contains('hidden')
            });
        });

        localStorage.setItem('dashboard-layout', JSON.stringify(layout));
        this.showAutoSaveMessage();
    }

    // Show auto-save confirmation message
    showAutoSaveMessage() {
        const message = document.getElementById('auto-save-message');
        if (message) {
            message.style.opacity = '1';
            setTimeout(() => {
                message.style.opacity = '0';
            }, 2000);
        }
    }

    // Load saved layout on dashboard init
    loadSavedLayout() {
        const savedLayout = localStorage.getItem('dashboard-layout');
        if (savedLayout) {
            try {
                const layout = JSON.parse(savedLayout);
                // Apply saved layout logic here
                console.log('Loading saved layout:', layout);
            } catch (error) {
                console.error('Error loading saved layout:', error);
            }
        }
    }

    // Enhanced drag and drop setup (always enabled)
    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.dashboard-widget');

        widgets.forEach(widget => {
            widget.draggable = true;
    
            widget.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', widget.id);
                widget.classList.add('dragging');
            });
    
            widget.addEventListener('dragend', (e) => {
                widget.classList.remove('dragging');
                // Auto-save after drag ends
                setTimeout(() => this.autoSaveLayout(), 100);
            });
    
            widget.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
    
            widget.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain');
                const draggedElement = document.getElementById(draggedId);
        
                if (draggedElement && draggedElement !== widget) {
                    const container = widget.parentNode;
                    const nextSibling = widget.nextSibling;
            
                    if (nextSibling) {
                        container.insertBefore(draggedElement, nextSibling);
                    } else {
                        container.appendChild(draggedElement);
                    }
                }
            });
        });
    }

    // Apply theme settings
    applyThemeSettings() {
        const selectedTheme = document.querySelector('.theme-option.active')?.dataset.theme || 'dark';
        const selectedAccent = document.querySelector('.accent-color.active')?.dataset.color || 'blue';
        const compactMode = document.getElementById('compact-mode')?.checked || false;
        const animations = document.getElementById('animations')?.checked || true;
        const autoSave = document.getElementById('auto-save-layout')?.checked || true;

        // Save theme settings
        const themeSettings = {
            theme: selectedTheme,
            accent: selectedAccent,
            compact: compactMode,
            animations: animations,
            autoSave: autoSave
        };

        localStorage.setItem('theme-settings', JSON.stringify(themeSettings));

        // Apply settings
        document.body.className = `theme-${selectedTheme} accent-${selectedAccent}`;
        if (compactMode) document.body.classList.add('compact-mode');
        if (!animations) document.body.classList.add('no-animations');

        this.showAlert('تنظیمات ظاهری اعمال شد', 'success');
    }

    // Load theme settings on init
    loadThemeSettings() {
        const savedSettings = localStorage.getItem('theme-settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
        
                // Apply saved theme
                document.body.className = `theme-${settings.theme} accent-${settings.accent}`;
                if (settings.compact) document.body.classList.add('compact-mode');
                if (!settings.animations) document.body.classList.add('no-animations');
        
                // Update UI controls
                document.querySelector(`[data-theme="${settings.theme}"]`)?.classList.add('active');
                document.querySelector(`[data-color="${settings.accent}"]`)?.classList.add('active');
                if (document.getElementById('compact-mode')) document.getElementById('compact-mode').checked = settings.compact;
                if (document.getElementById('animations')) document.getElementById('animations').checked = settings.animations;
                if (document.getElementById('auto-save-layout')) document.getElementById('auto-save-layout').checked = settings.autoSave;
        
            } catch (error) {
                console.error('Error loading theme settings:', error);
            }
        }
    }

    // Initialize enhanced dashboard
    initEnhancedDashboard() {
        // Load saved settings
        this.loadThemeSettings();
        this.loadSavedLayout();

        // Setup drag and drop (always enabled)
        setTimeout(() => this.setupDragAndDrop(), 1000);

        // Setup theme option click handlers
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });

        document.querySelectorAll('.accent-color').forEach(color => {
            color.addEventListener('click', () => {
                document.querySelectorAll('.accent-color').forEach(c => c.classList.remove('active'));
                color.classList.add('active');
            });
        });
    }

    /**
     * Open AI Management from header indicator
     */
    openAIManagement() {
        try {
            // Switch to settings tab and then to AI Management
            this.loadModule('settings').then(() => {
                // Wait for settings to load, then switch to AI Management tab
                setTimeout(() => {
                    if (typeof settingsModule !== 'undefined' && settingsModule.switchTab) {
                        settingsModule.switchTab('ai-management');
                    }
                }, 100);
            });
        } catch (error) {
            console.error('Error opening AI Management:', error);
            this.showAlert('خطا در باز کردن مدیریت AI', 'error');
        }
    }

    /**
     * Update AI status indicators in header
     */
    async updateAIStatus() {
        try {
            // Fetch AI data from API
            const response = await fetch('/api/ai-analytics/agents');
            if (response.ok) {
                const data = await response.json();
        
                // Update desktop header
                const headerAICount = document.getElementById('header-ai-count');
                const headerAIPerformance = document.getElementById('header-ai-performance');
                const mobileAICount = document.getElementById('mobile-ai-count');

                if (headerAICount) {
                    headerAICount.textContent = `AI: ${data.agents.length}`;
                }

                if (headerAIPerformance) {
                    const avgPerformance = data.agents.reduce((sum, agent) => sum + agent.performance.accuracy, 0) / data.agents.length;
                    headerAIPerformance.textContent = `(${Math.round(avgPerformance)}%)`;
                }

                if (mobileAICount) {
                    mobileAICount.textContent = `AI:${data.agents.length}`;
                }

            } else {
                console.warn('Failed to fetch AI analytics data for header');
            }
        } catch (error) {
            console.error('Error updating AI status in header:', error);
            // Keep default values if API fails
        }
    }
}

// Initialize app
// NOTE: TitanApp is initialized in DOMContentLoaded event (see end of file)

// Add CSS for navigation
const style = document.createElement('style');
style.textContent = `
    /* ===== NAVIGATION STYLES ===== */
    .nav-link {
        display: flex;
        align-items: center;
        color: #9CA3AF;
        padding: 0.625rem 1rem;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        position: relative;
        overflow: hidden;
    }
    
    .nav-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    }
    
    .nav-link:hover {
        color: #FFFFFF;
        background-color: #374151;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .nav-link:hover::before {
        opacity: 1;
    }
    
    .nav-link.active {
        color: #FFFFFF;
        background: linear-gradient(135deg, #3B82F6, #8B5CF6);
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        transform: translateY(-1px);
    }
    
    .nav-link.active::before {
        opacity: 0;
    }
    
    /* Dropdown Menu Styles */
    .nav-dropdown-link {
        display: flex;
        align-items: center;
        color: #D1D5DB;
        padding: 0.75rem 1rem;
        text-decoration: none;
        transition: all 0.2s ease;
        font-weight: 500;
        gap: 0.75rem;
    }
    
    .nav-dropdown-link:hover {
        color: #FFFFFF;
        background-color: #4B5563;
        padding-right: 1.25rem;
    }
    
    .nav-dropdown-link i {
        width: 1.25rem;
        text-align: center;
    }
    
    /* Mobile Menu Styles */
    #mobile-menu {
        position: fixed;
        top: 0;
        right: -100%;
        width: 280px;
        height: 100vh;
        background: linear-gradient(180deg, #1F2937 0%, #111827 100%);
        border-left: 1px solid #374151;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 9999;
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
    }
    
    #mobile-menu.show {
        right: 0;
    }
    
    .mobile-menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #374151;
        background: rgba(31, 41, 55, 0.8);
        backdrop-filter: blur(10px);
    }
    
    .mobile-nav-link {
        display: flex;
        align-items: center;
        color: #D1D5DB;
        padding: 1rem 1.5rem;
        text-decoration: none;
        transition: all 0.3s ease;
        font-weight: 500;
        border-bottom: 1px solid rgba(55, 65, 81, 0.3);
    }
    
    .mobile-nav-link:hover {
        color: #FFFFFF;
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
        padding-right: 2rem;
        border-right: 3px solid #3B82F6;
    }
    
    .mobile-nav-link.active {
        color: #FFFFFF;
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1));
        border-right: 3px solid #3B82F6;
    }
    
    .mobile-nav-link i {
        margin-left: 0.75rem;
        width: 1.25rem;
        text-align: center;
    }
    
    /* Mobile Menu Overlay */
    .mobile-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-overlay.show {
        opacity: 1;
        visibility: visible;
    }
    
    /* Mobile Menu Button Animation */
    #mobile-menu-btn {
        transition: all 0.3s ease;
    }
    
    #mobile-menu-btn:hover {
        transform: scale(1.1);
        color: #3B82F6;
    }
    
    /* Status Bar Responsive */
    .status-bar-mobile {
        display: none;
    }
    
    @media (max-width: 1279px) {
        .status-bar-desktop {
            display: none;
        }
        .status-bar-mobile {
            display: flex;
        }
    }
    
    /* Animations */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    /* More Menu Animation */
    #more-menu {
        animation: fadeInUp 0.3s ease-out;
        transform-origin: top right;
    }
    
    #more-menu.hidden {
        animation: none;
    }
    
    /* Logo Animation */
    .logo-container:hover .text-3xl {
        animation: bounce 0.6s ease-in-out;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }
    
    /* Navigation Responsive Enhancements */
    @media (max-width: 1023px) {
        .nav-link {
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
        }
    }
    
    @media (max-width: 767px) {
        nav .max-w-7xl {
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .mobile-nav-link {
            padding: 1.25rem 1.5rem;
            font-size: 1rem;
        }
    }

    /* Dashboard Layout Optimization */
    
    /* Desktop Grid Layout (Metro Style) */
    @media (min-width: 769px) {
        #dashboard-grid {
            padding: 0;
        }

        .dashboard-widget {
            transition: all 0.2s ease;
        }

        .dashboard-widget:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
    }
    
    /* Mobile Layout (Vertical Stack) */
    @media (max-width: 768px) {
        /* Fix mobile body and html scrolling */
        html, body {
            overflow-x: hidden;
        }

        /* Main content area mobile optimization */
        main {
            padding-bottom: 4rem !important;
        }

        #main-content {
            min-height: calc(100vh - 200px);
        }

        /* Dashboard container - remove height restrictions to allow natural scroll */
        #dashboard-grid {
            padding: 0.5rem;
            /* Remove max-height to allow natural page scroll */
        }

        /* Mobile widget spacing with proper bottom padding */
        .dashboard-widget {
            margin-bottom: 1rem;
        }

        /* Ensure mobile widgets have enough bottom space */
        #dashboard-grid .space-y-4 {
            padding-bottom: 4rem;
        }

        /* Make widget controls larger and more touch-friendly */
        .dashboard-controls button {
            min-height: 44px;
            min-width: 44px;
        }

        /* Auto-save message positioning for mobile */
        #auto-save-message {
            top: auto;
            bottom: 4rem;
            right: 1rem;
            left: 1rem;
            text-align: center;
        }

        /* Mobile canvas optimization */
        #mobilePortfolioChart {
            max-height: 200px;
        }

        /* Touch-friendly interactions */
        .dashboard-widget {
            cursor: grab;
            active: scale(0.98);
        }

        .dashboard-widget:active {
            transform: scale(0.98);
        }
    }
    
    /* Small mobile screens */
    @media (max-width: 480px) {
        #dashboard-grid {
            padding: 0.25rem;
            max-height: calc(100vh - 180px);
        }

        .dashboard-widget {
            border-radius: 0.75rem;
        }

        /* Smaller text on tiny screens */
        .dashboard-widget .text-xl {
            font-size: 1.25rem;
        }

        .dashboard-widget .text-2xl {
            font-size: 1.5rem;
        }

        /* Mobile market grid - 2 columns on small screens */
        #mobile-widget-market .grid-cols-2 {
            gap: 0.5rem;
        }
    }
    
    /* Mobile scroll improvements */
    @media (max-width: 768px) {
        /* Smooth scrolling for mobile */
        body {
            scroll-behavior: smooth;
        }

        /* Better spacing for mobile navigation */
        nav + div {
            padding-top: 0;
        }
    }

    /* Widget dragging improvements */
    .dashboard-widget {
        cursor: grab;
        transition: all 0.2s ease;
        touch-action: none; /* Enable touch dragging */
    }
    
    .dashboard-widget:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .dashboard-widget.dragging {
        cursor: grabbing;
        transform: rotate(5deg) scale(1.05);
        z-index: 1000;
        opacity: 0.9;
    }

    /* Theme settings styles */
    .theme-option.active {
        border-color: #3B82F6 !important;
        background-color: #1E40AF;
    }
    
    .accent-color.active {
        transform: scale(1.2);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }
    
    /* Trade Type Button Styles */
    .trade-type-btn.active {
        opacity: 1;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }
    
    .trade-type-btn {
        opacity: 0.7;
        transition: all 0.2s;
    }
    
    /* Drag and Drop Styles */
    .dashboard-widget.edit-mode {
        cursor: move;
        border: 2px dashed #3B82F6;
        border-radius: 8px;
        position: relative;
        transition: all 0.2s ease;
    }
    
    .dashboard-widget.edit-mode:hover {
        border-color: #60A5FA;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transform: translateY(-2px);
    }
    
    .dashboard-widget.dragging {
        opacity: 0.5;
        transform: rotate(5deg);
        z-index: 1000;
    }
    
    .dashboard-widget.edit-mode::before {
        content: "🚀 کشیده و رها کنید";
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        background: #3B82F6;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.2s;
    }
    
    .dashboard-widget.edit-mode:hover::before {
        opacity: 1;
    }
    
    #dashboard-grid.edit-mode {
        background-image: radial-gradient(circle, #374151 1px, transparent 1px);
        background-size: 20px 20px;
    }
    
    /* Enhanced Navigation Styles */
    .nav-link {
        display: flex;
        align-items: center;
        color: #9CA3AF;
        padding: 0.625rem 1rem;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        position: relative;
        overflow: hidden;
    }
    
    .nav-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
        transition: left 0.5s;
    }
    
    .nav-link:hover::before {
        left: 100%;
    }
    
    .nav-link:hover {
        color: #FFFFFF;
        background-color: #374151;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    
    .nav-link.active {
        color: #FFFFFF;
        background: linear-gradient(135deg, #3B82F6, #6366F1);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transform: translateY(-1px);
    }
    
    .nav-link.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background: #60A5FA;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(96, 165, 250, 0.8);
    }
    
    /* Navigation Dropdown Styles */
    .nav-dropdown-link {
        display: flex;
        align-items: center;
        width: 100%;
        text-align: right;
        padding: 0.75rem 1rem;
        color: #D1D5DB;
        text-decoration: none;
        transition: all 0.2s;
        border-radius: 0.375rem;
        margin: 0.125rem 0;
    }
    
    .nav-dropdown-link:hover {
        background-color: #374151;
        color: #FFFFFF;
        transform: translateX(-4px);
    }
    
    .nav-dropdown-link i {
        width: 20px;
        margin-left: 0.75rem;
        text-align: center;
    }
    
    /* Mobile Navigation Styles */
    .mobile-nav-link {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.875rem 1rem;
        color: #D1D5DB;
        text-decoration: none;
        border-radius: 0.5rem;
        margin: 0.25rem 0;
        transition: all 0.3s;
        background: transparent;
        border: none;
        text-align: right;
    }
    
    .mobile-nav-link:hover {
        background: linear-gradient(135deg, #374151, #4B5563);
        color: #FFFFFF;
        transform: translateX(-4px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .mobile-nav-link.active {
        background: linear-gradient(135deg, #3B82F6, #6366F1);
        color: #FFFFFF;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .mobile-nav-link i {
        width: 24px;
        margin-left: 0.75rem;
        text-align: center;
        font-size: 1rem;
    }
    
    /* Enhanced Animations */
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeInUp {
        from {
            transform: translateY(10px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    #mobile-menu.show {
        animation: slideInFromRight 0.3s ease-out;
    }
    
    .nav-dropdown-link:nth-child(1) { animation-delay: 0.1s; }
    .nav-dropdown-link:nth-child(2) { animation-delay: 0.2s; }
    .nav-dropdown-link:nth-child(3) { animation-delay: 0.3s; }
    .nav-dropdown-link:nth-child(4) { animation-delay: 0.4s; }
    .nav-dropdown-link:nth-child(5) { animation-delay: 0.5s; }
    
    /* Status Bar Enhancements */
    .status-item {
        animation: fadeInUp 0.6s ease-out;
    }
    
    /* Responsive Improvements */
    @media (max-width: 1024px) {
        .nav-link {
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
        }
    }
    
    @media (max-width: 768px) {
        .mobile-nav-link {
            font-size: 1rem;
            padding: 1rem;
        }
    }
`;
document.head.appendChild(style);

// =========================================================================
// VOICE RECOGNITION ENHANCEMENT FOR EXISTING ARTEMIS CHAT
// =========================================================================

// Add voice recognition capability to existing chat
Object.assign(TitanApp.prototype, {
    
    // Voice recognition support for existing Artemis chat
    initializeVoiceRecognition() {
        // Implementation can be added later if needed for the existing chat
        console.log('Voice recognition ready for existing Artemis chat');
    },

    // Initialize properties  
    isRecognitionActive: false,
    currentConversationId: null,

    // =========================================================================
    // SYSTEM STATUS FUNCTIONALITY
    // =========================================================================

    // Toggle system status panel
    toggleSystemStatus() {
        const panel = document.getElementById('system-status-panel');
        if (!panel) return;

        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            this.startSystemStatusUpdates();
        } else {
            panel.classList.add('hidden');
            this.stopSystemStatusUpdates();
        }
    },

    // Start real-time system status updates
    startSystemStatusUpdates() {
        console.log('🔄 Starting system status updates...');

        // Clear existing interval
        if (this.systemStatusInterval) {
            clearInterval(this.systemStatusInterval);
        }

        // Initial load
        this.updateSystemStatus();

        // Set up auto-refresh every 5 seconds
        this.systemStatusInterval = setInterval(() => {
            this.updateSystemStatus();
        }, 5000);
    },

    // Stop system status updates
    stopSystemStatusUpdates() {
        if (this.systemStatusInterval) {
            clearInterval(this.systemStatusInterval);
            this.systemStatusInterval = null;
        }
    },

    // Update system status with real data from API
    async updateSystemStatus() {
        try {
            // Fetch all system data concurrently
            const [statusResponse, metricsResponse, healthResponse, activityResponse] = await Promise.all([
                axios.get('/api/monitoring/status'),
                axios.get('/api/monitoring/metrics'),
                axios.get('/api/monitoring/health'),
                axios.get('/api/monitoring/activity?limit=6')
            ]);

            if (statusResponse.data.success) {
                this.updateSystemOverview(statusResponse.data.data);
            }

            if (metricsResponse.data.success) {
                this.updatePerformanceMetrics(metricsResponse.data.data);
            }

            if (healthResponse.data.success) {
                this.updateComponentStatus(healthResponse.data.data);
            }

            if (activityResponse.data.success) {
                this.updateSystemActivity(activityResponse.data.data);
            }

        } catch (error) {
            console.error('❌ System status update failed:', error);
            // Show error in panel if it's visible
            const panel = document.getElementById('system-status-panel');
            if (panel && !panel.classList.contains('hidden')) {
                this.showAlert('خطا در به‌روزرسانی وضعیت سیستم', 'error');
            }
        }
    },

    // Update system overview section
    updateSystemOverview(data) {
        const statusIndicator = document.querySelector('#system-status-panel .text-green-400');
        const statusText = document.querySelector('#system-status-panel .text-green-400.text-sm');

        if (statusIndicator) {
            statusIndicator.textContent = data.statusEmoji;
        }

        if (statusText) {
            statusText.textContent = `وضعیت کل: ${data.statusText}`;
            statusText.className = data.overallStatus === 'optimal' 
                ? 'text-green-400 text-sm font-medium'
                : 'text-yellow-400 text-sm font-medium';
        }

        // Update header status emoji
        const headerEmoji = document.querySelector('#system-status-panel .text-green-400.text-lg');
        if (headerEmoji) {
            headerEmoji.textContent = data.statusEmoji;
        }
    },

    // Update performance metrics bars
    updatePerformanceMetrics(data) {
        // Update CPU
        const cpuBar = document.getElementById('cpu-bar');
        const cpuPercent = document.getElementById('cpu-percent');
        if (cpuBar && cpuPercent) {
            cpuBar.style.width = `${data.cpu.usage}%`;
            cpuBar.className = `h-full bg-${data.cpu.color}-500 transition-all duration-300`;
            cpuPercent.textContent = `${data.cpu.usage}%`;
        }

        // Update Memory
        const memoryBar = document.getElementById('memory-bar');
        const memoryPercent = document.getElementById('memory-percent');
        if (memoryBar && memoryPercent) {
            memoryBar.style.width = `${data.memory.usage}%`;
            memoryBar.className = `h-full bg-${data.memory.color}-500 transition-all duration-300`;
            memoryPercent.textContent = `${data.memory.usage}%`;
        }

        // Update Network
        const networkBar = document.getElementById('network-bar');
        const networkPercent = document.getElementById('network-percent');
        if (networkBar && networkPercent) {
            networkBar.style.width = `${data.network.usage}%`;
            networkBar.className = `h-full bg-${data.network.color}-500 transition-all duration-300`;
            networkPercent.textContent = `${data.network.usage}%`;
        }
    },

    // Update component status indicators
    updateComponentStatus(components) {
        // Find component status container
        const statusContainer = document.querySelector('#system-status-panel .space-y-2');
        if (!statusContainer) return;

        // Update existing component status items
        const statusItems = statusContainer.querySelectorAll('.flex.items-center.justify-between');

        components.forEach((component, index) => {
            if (statusItems[index]) {
                const statusDot = statusItems[index].querySelector('.w-2.h-2');
                const statusLabel = statusItems[index].querySelector('.text-xs');
        
                if (statusDot) {
                    statusDot.className = component.status === 'online' 
                        ? 'w-2 h-2 bg-green-400 rounded-full'
                        : component.status === 'warning'
                        ? 'w-2 h-2 bg-yellow-400 rounded-full'
                        : 'w-2 h-2 bg-red-400 rounded-full';
                }
        
                if (statusLabel) {
                    statusLabel.textContent = component.statusText;
                    statusLabel.className = component.status === 'online'
                        ? 'text-green-400 text-xs'
                        : component.status === 'warning'
                        ? 'text-yellow-400 text-xs'
                        : 'text-red-400 text-xs';
                }
            }
        });
    },

    // Update current system activity
    updateSystemActivity(activities) {
        const activityContainer = document.querySelector('#system-status-panel .space-y-3');
        if (!activityContainer) return;

        // Clear existing activities
        activityContainer.innerHTML = '';

        // Display latest 3 activities
        activities.slice(0, 3).forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'flex items-start gap-3';
            activityElement.innerHTML = `
                <div class="w-2 h-2 bg-${activity.statusColor} rounded-full mt-1.5 flex-shrink-0"></div>
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <span class="text-white text-xs font-medium">${activity.component}</span>
                        <span class="text-${activity.statusColor} text-xs">${activity.statusIcon === '🔵' ? 'فعال' : activity.statusIcon === '🟢' ? 'تکمیل' : 'هشدار'}</span>
                    </div>
                    <p class="text-gray-400 text-xs">${activity.description}</p>
                </div>
            `;
            activityContainer.appendChild(activityElement);
        });

        // Add refresh timestamp
        const timestampElement = document.querySelector('#system-status-panel .mt-4.pt-3.border-t');
        if (timestampElement) {
            const updateTime = new Date().toLocaleTimeString('fa-IR');
            timestampElement.innerHTML = `
                <div class="flex items-center justify-between text-xs text-gray-400">
                    <div>آخرین به‌روزرسانی: ${updateTime}</div>
                    <div class="flex items-center gap-1">
                        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>زنده</span>
                    </div>
                </div>
            `;
        }
    },

    // Initialize system status interval property
    systemStatusInterval: null
});

// Initialize the application
window.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize TITAN app
        window.titanApp = new TitanApp();

        // Create global alias for onclick handlers
        window.app = window.titanApp;

        console.log('TITAN Trading System initialized successfully');
    } catch (error) {
        console.error('Failed to initialize TITAN app:', error);
    }
});
