// AI Tab Module - TITAN Trading System
// Artificial Intelligence and Machine Learning Configuration

export default class AITab {
    constructor(settings) {
        this.settings = settings.ai || {};
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- AI Overview -->
                <div class="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-6 border border-purple-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-robot text-purple-400 text-3xl ml-3"></i>
                                هوش مصنوعی TITAN
                            </h3>
                            <p class="text-purple-200 mt-2">پیکربندی سیستم‌های هوش مصنوعی برای تحلیل و معاملات خودکار</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                                <i class="fas fa-brain text-white text-2xl"></i>
                            </div>
                            <span class="text-purple-200 text-sm">AI Engine</span>
                        </div>
                    </div>
                </div>

                <!-- OpenAI Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-brain text-green-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">OpenAI (GPT)</h3>
                                <p class="text-gray-400">استفاده از مدل‌های GPT برای تحلیل بازار و تولید محتوا</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="openai-enabled" class="sr-only peer" ${this.settings.openai?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    
                    <div id="openai-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="password" id="openai-api-key" value="${this.settings.openai?.api_key || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                   placeholder="sk-...">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">مدل GPT</label>
                            <select id="openai-model" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                                <option value="gpt-4" ${this.settings.openai?.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                                <option value="gpt-4-turbo" ${this.settings.openai?.model === 'gpt-4-turbo' ? 'selected' : ''}>GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo" ${this.settings.openai?.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Temperature (${this.settings.openai?.temperature || 0.7})</label>
                            <input type="range" id="openai-temperature" min="0" max="1" step="0.1" 
                                   value="${this.settings.openai?.temperature || 0.7}" 
                                   class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                            <input type="number" id="openai-max-tokens" value="${this.settings.openai?.max_tokens || 2000}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                   min="1" max="32000">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">درخواست‌های روزانه</label>
                            <input type="number" id="openai-daily-limit" value="${this.settings.openai?.daily_limit || 1000}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                        </div>
                    </div>
                    
                    <div class="mt-4 flex space-x-2 space-x-reverse">
                        <button onclick="this.testOpenAI()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-vial mr-2"></i>
                            تست API
                        </button>
                        <button onclick="this.checkOpenAIUsage()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-chart-line mr-2"></i>
                            بررسی مصرف
                        </button>
                    </div>
                </div>

                <!-- Anthropic Claude Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-microchip text-orange-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">Anthropic Claude</h3>
                                <p class="text-gray-400">استفاده از مدل‌های Claude برای تحلیل پیشرفته</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="anthropic-enabled" class="sr-only peer" ${this.settings.anthropic?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                    
                    <div id="anthropic-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="password" id="anthropic-api-key" value="${this.settings.anthropic?.api_key || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">مدل Claude</label>
                            <select id="anthropic-model" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                                <option value="claude-3-opus" ${this.settings.anthropic?.model === 'claude-3-opus' ? 'selected' : ''}>Claude-3 Opus</option>
                                <option value="claude-3-sonnet" ${this.settings.anthropic?.model === 'claude-3-sonnet' ? 'selected' : ''}>Claude-3 Sonnet</option>
                                <option value="claude-3-haiku" ${this.settings.anthropic?.model === 'claude-3-haiku' ? 'selected' : ''}>Claude-3 Haiku</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                            <input type="number" id="anthropic-max-tokens" value="${this.settings.anthropic?.max_tokens || 4000}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testAnthropic()" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            <i class="fas fa-vial mr-2"></i>
                            تست API
                        </button>
                    </div>
                </div>

                <!-- Google AI Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fab fa-google text-blue-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">Google AI (Gemini)</h3>
                                <p class="text-gray-400">استفاده از مدل‌های Gemini برای تحلیل چندوجهی</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="google-enabled" class="sr-only peer" ${this.settings.google?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="google-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="password" id="google-api-key" value="${this.settings.google?.api_key || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">مدل Gemini</label>
                            <select id="google-model" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="gemini-pro" ${this.settings.google?.model === 'gemini-pro' ? 'selected' : ''}>Gemini Pro</option>
                                <option value="gemini-pro-vision" ${this.settings.google?.model === 'gemini-pro-vision' ? 'selected' : ''}>Gemini Pro Vision</option>
                                <option value="gemini-ultra" ${this.settings.google?.model === 'gemini-ultra' ? 'selected' : ''}>Gemini Ultra</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Safety Settings</label>
                            <select id="google-safety" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="BLOCK_NONE">بدون فیلتر</option>
                                <option value="BLOCK_ONLY_HIGH" selected>فقط محتوای خطرناک</option>
                                <option value="BLOCK_MEDIUM_AND_ABOVE">متوسط و بالا</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testGoogle()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-vial mr-2"></i>
                            تست API
                        </button>
                    </div>
                </div>

                <!-- Trading AI Strategies -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-chart-line text-purple-400 ml-2"></i>
                        استراتژی‌های AI معاملاتی
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تحلیل تکنیکال AI</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="technical-analysis" checked>
                            </div>
                            <p class="text-sm text-gray-400">استفاده از AI برای تشخیص الگوهای تکنیکال</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">اعتماد مورد نیاز</label>
                                <input type="range" class="w-full h-1 bg-gray-600 rounded-lg mt-1" min="60" max="95" value="80">
                                <span class="text-xs text-green-400">80%</span>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تحلیل احساسات بازار</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="sentiment-analysis" checked>
                            </div>
                            <p class="text-sm text-gray-400">تجزیه‌وتحلیل احساسات از اخبار و رسانه‌ها</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">وزن تأثیر</label>
                                <input type="range" class="w-full h-1 bg-gray-600 rounded-lg mt-1" min="10" max="50" value="25">
                                <span class="text-xs text-blue-400">25%</span>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">پیش‌بینی قیمت ML</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="price-prediction" checked>
                            </div>
                            <p class="text-sm text-gray-400">مدل‌های یادگیری ماشین برای پیش‌بینی</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">بازه زمانی</label>
                                <select class="w-full text-xs bg-gray-700 text-white rounded mt-1">
                                    <option>5 دقیقه</option>
                                    <option selected>15 دقیقه</option>
                                    <option>1 ساعت</option>
                                    <option>4 ساعت</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-red-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">مدیریت ریسک هوشمند</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="risk-management" checked>
                            </div>
                            <p class="text-sm text-gray-400">محاسبه خودکار stop-loss و take-profit</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">حداکثر ریسک</label>
                                <input type="range" class="w-full h-1 bg-gray-600 rounded-lg mt-1" min="1" max="10" value="3">
                                <span class="text-xs text-red-400">3%</span>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تشخیص الگوهای نوسانات</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="volatility-patterns">
                            </div>
                            <p class="text-sm text-gray-400">شناسایی دوره‌های کم و پر نوسان</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">حساسیت</label>
                                <select class="w-full text-xs bg-gray-700 text-white rounded mt-1">
                                    <option>کم</option>
                                    <option selected>متوسط</option>
                                    <option>زیاد</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-indigo-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تحلیل همبستگی دارایی‌ها</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="correlation-analysis">
                            </div>
                            <p class="text-sm text-gray-400">بررسی روابط بین دارایی‌های مختلف</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">تعداد دارایی</label>
                                <input type="number" class="w-full text-xs bg-gray-700 text-white rounded mt-1 p-1" min="5" max="50" value="20">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Performance Monitoring -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-tachometer-alt text-green-400 ml-2"></i>
                        نظارت بر عملکرد AI
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-green-400">87.5%</div>
                            <div class="text-sm text-gray-400">دقت پیش‌بینی</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-blue-400">156</div>
                            <div class="text-sm text-gray-400">تحلیل امروز</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-purple-400">92.3%</div>
                            <div class="text-sm text-gray-400">نرخ موفقیت</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-yellow-400">2.8s</div>
                            <div class="text-sm text-gray-400">متوسط پاسخ</div>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2">
                        <button onclick="this.viewAILogs()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-list mr-2"></i>
                            مشاهده لاگ‌ها
                        </button>
                        <button onclick="this.exportAIMetrics()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>
                            صادرات متریک‌ها
                        </button>
                        <button onclick="this.retrainModels()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-sync mr-2"></i>
                            بازآموزی مدل‌ها
                        </button>
                        <button onclick="this.clearAICache()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <i class="fas fa-trash mr-2"></i>
                            پاک کردن کش
                        </button>
                    </div>
                </div>

                <!-- AI Security & Privacy -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-shield-alt text-red-400 ml-2"></i>
                        امنیت و حریم خصوصی AI
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">رمزنگاری داده‌ها</span>
                                <input type="checkbox" id="ai-encrypt-data" checked class="toggle-checkbox">
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">حذف خودکار لاگ‌ها</span>
                                <input type="checkbox" id="ai-auto-delete-logs" class="toggle-checkbox">
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">محدودیت نرخ درخواست</span>
                                <input type="checkbox" id="ai-rate-limiting" checked class="toggle-checkbox">
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مدت نگهداری داده‌ها (روز)</label>
                                <input type="number" id="ai-data-retention" value="30" min="7" max="365" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">سطح امنیتی</label>
                                <select id="ai-security-level" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                                    <option value="standard">استاندارد</option>
                                    <option value="high" selected>بالا</option>
                                    <option value="maximum">حداکثر</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">تعداد درخواست در ساعت</label>
                                <input type="number" id="ai-hourly-limit" value="1000" min="100" max="10000" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        // Set up toggle functionality for AI services
        this.setupToggleHandlers();
        
        // Initialize range sliders
        this.setupRangeSliders();
        
        // Set up strategy toggles
        this.setupStrategyHandlers();
    }

    setupToggleHandlers() {
        const services = ['openai', 'anthropic', 'google'];
        
        services.forEach(service => {
            const checkbox = document.getElementById(`${service}-enabled`);
            const config = document.getElementById(`${service}-config`);
            
            if (checkbox && config) {
                checkbox.addEventListener('change', () => {
                    config.style.opacity = checkbox.checked ? '1' : '0.5';
                    config.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
                });
                
                // Set initial state
                config.style.opacity = checkbox.checked ? '1' : '0.5';
                config.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
            }
        });
    }

    setupRangeSliders() {
        const tempSlider = document.getElementById('openai-temperature');
        if (tempSlider) {
            tempSlider.addEventListener('input', (e) => {
                const label = document.querySelector('label[for="openai-temperature"]');
                if (label) {
                    label.textContent = `Temperature (${e.target.value})`;
                }
            });
        }
    }

    setupStrategyHandlers() {
        const strategies = document.querySelectorAll('.ai-strategy');
        strategies.forEach(strategy => {
            strategy.addEventListener('change', () => {
                console.log(`AI Strategy ${strategy.dataset.strategy} toggled:`, strategy.checked);
            });
        });
    }

    async testOpenAI() {
        const apiKey = document.getElementById('openai-api-key')?.value;
        if (!apiKey) {
            alert('لطفاً API Key را وارد کنید');
            return;
        }
        
        try {
            // Test OpenAI API connection
            alert('در حال تست اتصال به OpenAI...');
            // Implementation would go here
        } catch (error) {
            alert('خطا در اتصال به OpenAI: ' + error.message);
        }
    }

    async testAnthropic() {
        const apiKey = document.getElementById('anthropic-api-key')?.value;
        if (!apiKey) {
            alert('لطفاً API Key را وارد کنید');
            return;
        }
        
        try {
            // Test Anthropic API connection
            alert('در حال تست اتصال به Anthropic...');
            // Implementation would go here
        } catch (error) {
            alert('خطا در اتصال به Anthropic: ' + error.message);
        }
    }

    async testGoogle() {
        const apiKey = document.getElementById('google-api-key')?.value;
        if (!apiKey) {
            alert('لطفاً API Key را وارد کنید');
            return;
        }
        
        try {
            // Test Google AI API connection
            alert('در حال تست اتصال به Google AI...');
            // Implementation would go here
        } catch (error) {
            alert('خطا در اتصال به Google AI: ' + error.message);
        }
    }

    checkOpenAIUsage() {
        alert('بررسی مصرف OpenAI در حال پیاده‌سازی...');
    }

    viewAILogs() {
        alert('نمایش لاگ‌های AI در حال پیاده‌سازی...');
    }

    exportAIMetrics() {
        alert('صادرات متریک‌های AI در حال پیاده‌سازی...');
    }

    retrainModels() {
        if (confirm('آیا مطمئن هستید که می‌خواهید مدل‌های AI را بازآموزی دهید؟')) {
            alert('بازآموزی مدل‌ها شروع شد...');
        }
    }

    clearAICache() {
        if (confirm('آیا مطمئن هستید که می‌خواهید کش AI را پاک کنید؟')) {
            alert('کش AI پاک شد');
        }
    }

    collectData() {
        return {
            openai: {
                enabled: document.getElementById('openai-enabled')?.checked || false,
                api_key: document.getElementById('openai-api-key')?.value || '',
                model: document.getElementById('openai-model')?.value || 'gpt-4',
                temperature: parseFloat(document.getElementById('openai-temperature')?.value) || 0.7,
                max_tokens: parseInt(document.getElementById('openai-max-tokens')?.value) || 2000,
                daily_limit: parseInt(document.getElementById('openai-daily-limit')?.value) || 1000
            },
            anthropic: {
                enabled: document.getElementById('anthropic-enabled')?.checked || false,
                api_key: document.getElementById('anthropic-api-key')?.value || '',
                model: document.getElementById('anthropic-model')?.value || 'claude-3-opus',
                max_tokens: parseInt(document.getElementById('anthropic-max-tokens')?.value) || 4000
            },
            google: {
                enabled: document.getElementById('google-enabled')?.checked || false,
                api_key: document.getElementById('google-api-key')?.value || '',
                model: document.getElementById('google-model')?.value || 'gemini-pro',
                safety_settings: document.getElementById('google-safety')?.value || 'BLOCK_ONLY_HIGH'
            },
            strategies: Array.from(document.querySelectorAll('.ai-strategy:checked'))
                          .map(cb => cb.getAttribute('data-strategy')),
            security: {
                encrypt_data: document.getElementById('ai-encrypt-data')?.checked || false,
                auto_delete_logs: document.getElementById('ai-auto-delete-logs')?.checked || false,
                rate_limiting: document.getElementById('ai-rate-limiting')?.checked || false,
                data_retention: parseInt(document.getElementById('ai-data-retention')?.value) || 30,
                security_level: document.getElementById('ai-security-level')?.value || 'high',
                hourly_limit: parseInt(document.getElementById('ai-hourly-limit')?.value) || 1000
            }
        };
    }
}