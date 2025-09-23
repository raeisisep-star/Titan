// Security Tab Module - TITAN Trading System
// Comprehensive security configuration and management

export default class SecurityTab {
    constructor(settings) {
        this.settings = settings.security || {};
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- Security Overview -->
                <div class="bg-gradient-to-r from-red-900 via-orange-900 to-yellow-900 rounded-lg p-6 border border-red-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-shield-alt text-red-400 text-3xl ml-3"></i>
                                امنیت سیستم TITAN
                            </h3>
                            <p class="text-red-200 mt-2">پیکربندی جامع امنیت، احراز هویت و کنترل دسترسی</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
                                <i class="fas fa-lock text-white text-2xl"></i>
                            </div>
                            <span id="security-status" class="text-green-400 text-sm font-bold">محافظت شده</span>
                        </div>
                    </div>
                </div>

                <!-- Authentication Settings -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-key text-blue-400 ml-2"></i>
                        احراز هویت و کنترل دسترسی
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">احراز هویت دو مرحله‌ای (2FA)</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="two-factor-auth" class="sr-only peer" ${this.settings.twoFactorAuth ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">بیومتریک (اثر انگشت)</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="biometric-auth" class="sr-only peer" ${this.settings.biometricAuth ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">ورود با SSO</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="sso-login" class="sr-only peer" ${this.settings.ssoLogin ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مدت انقضای جلسه (دقیقه)</label>
                                <input type="number" id="session-timeout" value="${this.settings.sessionTimeout || 30}" min="5" max="480" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">حداکثر تلاش ورود ناموفق</label>
                                <input type="number" id="max-login-attempts" value="${this.settings.maxLoginAttempts || 5}" min="3" max="10" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مدت قفل حساب (دقیقه)</label>
                                <input type="number" id="account-lockout" value="${this.settings.accountLockout || 15}" min="5" max="60" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex flex-wrap gap-2">
                        <button onclick="this.setup2FA()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-mobile-alt mr-2"></i>
                            راه‌اندازی 2FA
                        </button>
                        <button onclick="this.testBiometric()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-fingerprint mr-2"></i>
                            تست بیومتریک
                        </button>
                    </div>
                </div>

                <!-- Password Policy -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-lock text-purple-400 ml-2"></i>
                        سیاست رمز عبور
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">حداقل طول رمز عبور</label>
                                <input type="number" id="min-password-length" value="${this.settings.minPasswordLength || 8}" min="6" max="32" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مدت انقضای رمز عبور (روز)</label>
                                <input type="number" id="password-expiry" value="${this.settings.passwordExpiry || 90}" min="30" max="365" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">تعداد رمزهای قبلی منع شده</label>
                                <input type="number" id="password-history" value="${this.settings.passwordHistory || 5}" min="3" max="12" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">الزام به حروف بزرگ</span>
                                <input type="checkbox" id="require-uppercase" ${this.settings.requireUppercase ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">الزام به اعداد</span>
                                <input type="checkbox" id="require-numbers" ${this.settings.requireNumbers ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">الزام به کاراکترهای خاص</span>
                                <input type="checkbox" id="require-symbols" ${this.settings.requireSymbols ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testPasswordStrength()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-shield-alt mr-2"></i>
                            تست قدرت رمز عبور
                        </button>
                    </div>
                </div>

                <!-- API Security -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-api text-green-400 ml-2"></i>
                        امنیت API و رمزنگاری
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">نوع رمزنگاری</label>
                                <select id="encryption-type" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                                    <option value="AES-256" ${this.settings.encryptionType === 'AES-256' ? 'selected' : ''}>AES-256</option>
                                    <option value="AES-128" ${this.settings.encryptionType === 'AES-128' ? 'selected' : ''}>AES-128</option>
                                    <option value="ChaCha20" ${this.settings.encryptionType === 'ChaCha20' ? 'selected' : ''}>ChaCha20</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مدت انقضای API Key (روز)</label>
                                <input type="number" id="api-key-expiry" value="${this.settings.apiKeyExpiry || 365}" min="30" max="730" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">محدودیت نرخ درخواست (در دقیقه)</label>
                                <input type="number" id="rate-limit" value="${this.settings.rateLimit || 100}" min="10" max="1000" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">HTTPS اجباری</span>
                                <input type="checkbox" id="force-https" ${this.settings.forceHttps !== false ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">تایید گواهی SSL</span>
                                <input type="checkbox" id="ssl-verification" ${this.settings.sslVerification !== false ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">رمزنگاری پایگاه داده</span>
                                <input type="checkbox" id="db-encryption" ${this.settings.dbEncryption ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex flex-wrap gap-2">
                        <button onclick="this.generateApiKey()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-key mr-2"></i>
                            تولید API Key جدید
                        </button>
                        <button onclick="this.rotateEncryptionKeys()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-sync mr-2"></i>
                            چرخش کلیدهای رمزنگاری
                        </button>
                    </div>
                </div>

                <!-- IP Whitelist & Firewall -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-firewall text-orange-400 ml-2"></i>
                        فایروال و کنترل IP
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">IP های مجاز (Whitelist)</h4>
                            <div class="space-y-2 mb-4">
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <span class="text-white font-mono">192.168.1.100</span>
                                    <button onclick="this.removeIP('192.168.1.100')" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <span class="text-white font-mono">10.0.0.0/24</span>
                                    <button onclick="this.removeIP('10.0.0.0/24')" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="flex gap-2">
                                <input type="text" id="new-whitelist-ip" placeholder="192.168.1.0/24" 
                                       class="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                                <button onclick="this.addWhitelistIP()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">IP های مسدود (Blacklist)</h4>
                            <div class="space-y-2 mb-4">
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <span class="text-red-400 font-mono">185.220.101.182</span>
                                    <button onclick="this.removeBlockedIP('185.220.101.182')" class="text-green-400 hover:text-green-300">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="flex gap-2">
                                <input type="text" id="new-blacklist-ip" placeholder="123.456.789.0" 
                                       class="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                                <button onclick="this.addBlacklistIP()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                    <i class="fas fa-ban"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <span class="text-white">تشخیص حملات DDoS</span>
                            <input type="checkbox" id="ddos-protection" ${this.settings.ddosProtection ? 'checked' : ''}>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <span class="text-white">فیلتر جغرافیایی</span>
                            <input type="checkbox" id="geo-blocking" ${this.settings.geoBlocking ? 'checked' : ''}>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <span class="text-white">مسدودسازی خودکار</span>
                            <input type="checkbox" id="auto-blocking" ${this.settings.autoBlocking ? 'checked' : ''}>
                        </div>
                    </div>
                </div>

                <!-- Security Monitoring -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-eye text-blue-400 ml-2"></i>
                        نظارت امنیتی و لاگ‌ها
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">ثبت تمام فعالیت‌ها</span>
                                <input type="checkbox" id="log-all-activities" ${this.settings.logAllActivities ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">هشدار فعالیت مشکوک</span>
                                <input type="checkbox" id="suspicious-activity-alert" ${this.settings.suspiciousActivityAlert ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">نظارت بلادرنگ</span>
                                <input type="checkbox" id="realtime-monitoring" ${this.settings.realtimeMonitoring ? 'checked' : ''}>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مدت نگهداری لاگ (روز)</label>
                                <input type="number" id="log-retention" value="${this.settings.logRetention || 90}" min="7" max="365" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">سطح لاگ</label>
                                <select id="log-level" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                    <option value="ERROR" ${this.settings.logLevel === 'ERROR' ? 'selected' : ''}>فقط خطاها</option>
                                    <option value="WARN" ${this.settings.logLevel === 'WARN' ? 'selected' : ''}>هشدار و خطا</option>
                                    <option value="INFO" ${this.settings.logLevel === 'INFO' ? 'selected' : ''}>اطلاعات عمومی</option>
                                    <option value="DEBUG" ${this.settings.logLevel === 'DEBUG' ? 'selected' : ''}>تمام جزئیات</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex flex-wrap gap-2">
                        <button onclick="this.viewSecurityLogs()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-list mr-2"></i>
                            مشاهده لاگ‌های امنیتی
                        </button>
                        <button onclick="this.exportSecurityReport()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>
                            صادرات گزارش امنیتی
                        </button>
                        <button onclick="this.runSecurityScan()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-search mr-2"></i>
                            اسکن امنیتی
                        </button>
                    </div>
                </div>

                <!-- Security Alerts -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-400 ml-2"></i>
                        هشدارهای امنیتی اخیر
                    </h3>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-circle text-red-400 ml-3"></i>
                                <div>
                                    <div class="text-white font-medium">تلاش ورود ناموفق مکرر</div>
                                    <div class="text-red-300 text-sm">IP: 192.168.1.999 - 5 تلاش در 2 دقیقه گذشته</div>
                                </div>
                            </div>
                            <span class="text-red-300 text-sm">2 دقیقه پیش</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-shield-alt text-yellow-400 ml-3"></i>
                                <div>
                                    <div class="text-white font-medium">درخواست API غیرمعمول</div>
                                    <div class="text-yellow-300 text-sm">نرخ درخواست بالا از API key xxx...xxx</div>
                                </div>
                            </div>
                            <span class="text-yellow-300 text-sm">15 دقیقه پیش</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-green-400 ml-3"></i>
                                <div>
                                    <div class="text-white font-medium">بروزرسانی امنیتی موفق</div>
                                    <div class="text-green-300 text-sm">سیستم احراز هویت به نسخه جدید ارتقا یافت</div>
                                </div>
                            </div>
                            <span class="text-green-300 text-sm">1 ساعت پیش</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <button onclick="this.clearSecurityAlerts()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-broom mr-2"></i>
                            پاک کردن هشدارها
                        </button>
                    </div>
                </div>

                <!-- Backup & Recovery -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-database text-indigo-400 ml-2"></i>
                        پشتیبان‌گیری و بازیابی
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">پشتیبان‌گیری خودکار روزانه</span>
                                <input type="checkbox" id="daily-backup" ${this.settings.dailyBackup ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">رمزنگاری پشتیبان‌ها</span>
                                <input type="checkbox" id="encrypt-backups" ${this.settings.encryptBackups ? 'checked' : ''}>
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مکان ذخیره پشتیبان</label>
                                <select id="backup-location" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                                    <option value="local">محلی</option>
                                    <option value="cloud" selected>ابری</option>
                                    <option value="both">هر دو</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">تعداد پشتیبان‌های نگهداری شده</label>
                                <input type="number" id="backup-retention-count" value="${this.settings.backupRetentionCount || 7}" min="3" max="30" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">ساعت پشتیبان‌گیری</label>
                                <input type="time" id="backup-time" value="${this.settings.backupTime || '02:00'}" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                            </div>
                            
                            <div>
                                <button onclick="this.createManualBackup()" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    <i class="fas fa-hdd mr-2"></i>
                                    ایجاد پشتیبان دستی
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 bg-gray-800 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-3">آخرین پشتیبان‌ها</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-300">پشتیبان کامل - 1403/12/15 - 02:00</span>
                                <button onclick="this.restoreBackup('full-20241215')" class="text-blue-400 hover:text-blue-300">بازیابی</button>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-300">پشتیبان افزایشی - 1403/12/14 - 02:00</span>
                                <button onclick="this.restoreBackup('inc-20241214')" class="text-blue-400 hover:text-blue-300">بازیابی</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        // Initialize all interactive elements
        this.updateSecurityStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for security toggles
        const toggles = [
            'two-factor-auth', 'biometric-auth', 'sso-login',
            'ddos-protection', 'geo-blocking', 'auto-blocking',
            'log-all-activities', 'suspicious-activity-alert', 'realtime-monitoring',
            'daily-backup', 'encrypt-backups'
        ];

        toggles.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateSecurityStatus();
                    this.saveSecuritySettings();
                });
            }
        });

        // Add event listeners for input fields
        const inputs = [
            'session-timeout', 'max-login-attempts', 'account-lockout',
            'min-password-length', 'password-expiry', 'password-history',
            'encryption-type', 'api-key-expiry', 'rate-limit',
            'log-retention', 'log-level', 'backup-retention-count', 'backup-time'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.saveSecuritySettings();
                });
            }
        });
    }

    async saveSecuritySettings() {
        try {
            const settings = this.collectData();
            
            const response = await fetch('/api/security/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Failed to save security settings:', data.message);
            }
        } catch (error) {
            console.error('Error saving security settings:', error);
        }
    }

    updateSecurityStatus() {
        const statusElement = document.getElementById('security-status');
        if (!statusElement) return;

        // Calculate security score based on enabled features
        let score = 0;
        const checks = [
            document.getElementById('two-factor-auth')?.checked,
            document.getElementById('force-https')?.checked,
            document.getElementById('ssl-verification')?.checked,
            document.getElementById('ddos-protection')?.checked,
            document.getElementById('log-all-activities')?.checked
        ];

        score = checks.filter(Boolean).length;
        
        if (score >= 4) {
            statusElement.textContent = 'امنیت بالا';
            statusElement.className = 'text-green-400 text-sm font-bold';
        } else if (score >= 2) {
            statusElement.textContent = 'امنیت متوسط';
            statusElement.className = 'text-yellow-400 text-sm font-bold';
        } else {
            statusElement.textContent = 'امنیت کم';
            statusElement.className = 'text-red-400 text-sm font-bold';
        }
    }

    // Authentication methods
    async setup2FA() {
        try {
            const loadingModal = this.showLoadingModal('در حال راه‌اندازی 2FA...');
            
            const response = await fetch('/api/security/setup-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در راه‌اندازی 2FA');
            }

            this.show2FASetupModal(data.qrCode, data.secret);
        } catch (error) {
            console.error('Setup 2FA error:', error);
            this.showErrorModal('خطا در راه‌اندازی 2FA', error.message);
        }
    }

    async testBiometric() {
        if (!('credentials' in navigator)) {
            this.showErrorModal('عدم پشتیبانی', 'مرورگر شما از احراز هویت بیومتریک پشتیبانی نمی‌کند');
            return;
        }

        try {
            const loadingModal = this.showLoadingModal('در حال تست بیومتریک...');
            
            const response = await fetch('/api/security/test-biometric', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در تست بیومتریک');
            }

            this.showSuccessModal('تست بیومتریک موفق', 'احراز هویت بیومتریک با موفقیت تست شد');
        } catch (error) {
            console.error('Biometric test error:', error);
            this.showErrorModal('خطا در تست بیومتریک', error.message);
        }
    }

    async testPasswordStrength() {
        const passwordModal = this.showPasswordTestModal();
        
        passwordModal.querySelector('.test-password-btn').addEventListener('click', async () => {
            const password = passwordModal.querySelector('#test-password').value;
            if (!password) {
                this.showErrorModal('خطا', 'لطفاً رمز عبور را وارد کنید');
                return;
            }

            try {
                const response = await fetch('/api/security/test-password-strength', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ password })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'خطا در تست رمز عبور');
                }

                passwordModal.remove();
                this.showPasswordStrengthResult(data.strength, data.score, data.feedback);
            } catch (error) {
                console.error('Password test error:', error);
                this.showErrorModal('خطا در تست رمز عبور', error.message);
            }
        });
    }

    // API Security methods
    async generateApiKey() {
        const confirmation = await this.showConfirmModal(
            'تولید API Key جدید', 
            'آیا مطمئن هستید که می‌خواهید API Key جدید تولید کنید؟\nکلید فعلی باطل خواهد شد.'
        );
        
        if (!confirmation) return;

        try {
            const loadingModal = this.showLoadingModal('در حال تولید API Key جدید...');
            
            const response = await fetch('/api/security/generate-api-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در تولید API Key');
            }

            this.showApiKeyModal(data.apiKey, data.expiresAt);
        } catch (error) {
            console.error('Generate API Key error:', error);
            this.showErrorModal('خطا در تولید API Key', error.message);
        }
    }

    async rotateEncryptionKeys() {
        const confirmation = await this.showConfirmModal(
            'چرخش کلیدهای رمزنگاری', 
            'آیا مطمئن هستید که می‌خواهید کلیدهای رمزنگاری را بچرخانید؟\nاین عمل ممکن است نیاز به اعمال مجدد تنظیمات داشته باشد.'
        );
        
        if (!confirmation) return;

        try {
            const loadingModal = this.showLoadingModal('در حال چرخش کلیدهای رمزنگاری...');
            
            const response = await fetch('/api/security/rotate-encryption', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در چرخش کلیدها');
            }

            this.showSuccessModal('چرخش کلیدها موفق', 'کلیدهای رمزنگاری با موفقیت به‌روزرسانی شدند');
        } catch (error) {
            console.error('Rotate encryption keys error:', error);
            this.showErrorModal('خطا در چرخش کلیدها', error.message);
        }
    }

    // IP Management methods
    async addWhitelistIP() {
        const ipInput = document.getElementById('new-whitelist-ip');
        const ip = ipInput?.value?.trim();
        
        if (!ip || !this.isValidIP(ip)) {
            this.showErrorModal('خطا در ورودی', 'لطفاً یک IP معتبر وارد کنید');
            return;
        }

        try {
            const loadingModal = this.showLoadingModal(`در حال اضافه IP ${ip} به لیست سفید...`);
            
            const response = await fetch('/api/security/ip-whitelist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ ip, action: 'add' })
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در اضافه IP');
            }

            ipInput.value = '';
            this.showSuccessModal('IP اضافه شد', `IP ${ip} به لیست سفید اضافه شد`);
            
            // Refresh the IP list
            this.loadIPLists();
        } catch (error) {
            console.error('Add whitelist IP error:', error);
            this.showErrorModal('خطا در اضافه IP', error.message);
        }
    }

    async addBlacklistIP() {
        const ipInput = document.getElementById('new-blacklist-ip');
        const ip = ipInput?.value?.trim();
        
        if (!ip || !this.isValidIP(ip)) {
            this.showErrorModal('خطا در ورودی', 'لطفاً یک IP معتبر وارد کنید');
            return;
        }

        try {
            const loadingModal = this.showLoadingModal(`در حال مسدود کردن IP ${ip}...`);
            
            const response = await fetch('/api/security/ip-blacklist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ ip, action: 'add' })
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در مسدود کردن IP');
            }

            ipInput.value = '';
            this.showSuccessModal('IP مسدود شد', `IP ${ip} به لیست سیاه اضافه شد`);
            
            // Refresh the IP list
            this.loadIPLists();
        } catch (error) {
            console.error('Add blacklist IP error:', error);
            this.showErrorModal('خطا در مسدود کردن IP', error.message);
        }
    }

    async removeIP(ip) {
        const confirmation = await this.showConfirmModal(
            'حذف IP', 
            `آیا مطمئن هستید که می‌خواهید IP ${ip} را از لیست سفید حذف کنید؟`
        );
        
        if (!confirmation) return;

        try {
            const loadingModal = this.showLoadingModal(`در حال حذف IP ${ip}...`);
            
            const response = await fetch('/api/security/ip-whitelist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ ip, action: 'remove' })
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در حذف IP');
            }

            this.showSuccessModal('IP حذف شد', `IP ${ip} از لیست سفید حذف شد`);
            
            // Refresh the IP list
            this.loadIPLists();
        } catch (error) {
            console.error('Remove IP error:', error);
            this.showErrorModal('خطا در حذف IP', error.message);
        }
    }

    async removeBlockedIP(ip) {
        const confirmation = await this.showConfirmModal(
            'آزاد کردن IP', 
            `آیا مطمئن هستید که می‌خواهید IP ${ip} را از لیست سیاه حذف کنید؟`
        );
        
        if (!confirmation) return;

        try {
            const loadingModal = this.showLoadingModal(`در حال آزاد کردن IP ${ip}...`);
            
            const response = await fetch('/api/security/ip-blacklist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ ip, action: 'remove' })
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در آزاد کردن IP');
            }

            this.showSuccessModal('IP آزاد شد', `IP ${ip} از لیست سیاه حذف شد`);
            
            // Refresh the IP list
            this.loadIPLists();
        } catch (error) {
            console.error('Remove blocked IP error:', error);
            this.showErrorModal('خطا در آزاد کردن IP', error.message);
        }
    }

    isValidIP(ip) {
        // Basic IP validation (IPv4 and CIDR)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        return ipv4Regex.test(ip);
    }

    // Security monitoring methods
    async viewSecurityLogs() {
        try {
            const loadingModal = this.showLoadingModal('در حال بارگیری لاگ‌های امنیتی...');
            
            const response = await fetch('/api/security/logs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در بارگیری لاگ‌ها');
            }

            this.showSecurityLogsModal(data.logs);
        } catch (error) {
            console.error('View security logs error:', error);
            this.showErrorModal('خطا در بارگیری لاگ‌ها', error.message);
        }
    }

    async exportSecurityReport() {
        try {
            const loadingModal = this.showLoadingModal('در حال تهیه گزارش امنیتی...');
            
            const response = await fetch('/api/security/report', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در تهیه گزارش');
            }

            // Download the report
            const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `security-report-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccessModal('گزارش آماده شد', 'گزارش امنیتی با موفقیت دانلود شد');
        } catch (error) {
            console.error('Export security report error:', error);
            this.showErrorModal('خطا در صادرات گزارش', error.message);
        }
    }

    async runSecurityScan() {
        try {
            const loadingModal = this.showLoadingModal('در حال اجرای اسکن امنیتی...');
            
            const response = await fetch('/api/security/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در اجرای اسکن');
            }

            this.showSecurityScanResults(data.scanResults);
        } catch (error) {
            console.error('Security scan error:', error);
            this.showErrorModal('خطا در اسکن امنیتی', error.message);
        }
    }

    async clearSecurityAlerts() {
        const confirmation = await this.showConfirmModal(
            'پاک کردن هشدارها', 
            'آیا مطمئن هستید که می‌خواهید همه هشدارهای امنیتی را پاک کنید؟'
        );
        
        if (!confirmation) return;

        try {
            const loadingModal = this.showLoadingModal('در حال پاک کردن هشدارها...');
            
            const response = await fetch('/api/security/clear-alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در پاک کردن هشدارها');
            }

            this.showSuccessModal('هشدارها پاک شد', 'تمام هشدارهای امنیتی با موفقیت پاک شدند');
        } catch (error) {
            console.error('Clear security alerts error:', error);
            this.showErrorModal('خطا در پاک کردن', error.message);
        }
    }

    // Backup and recovery methods
    async createManualBackup() {
        const confirmation = await this.showConfirmModal(
            'ایجاد پشتیبان', 
            'آیا مطمئن هستید که می‌خواهید پشتیبان دستی ایجاد کنید؟'
        );
        
        if (!confirmation) return;

        try {
            const loadingModal = this.showLoadingModal('در حال ایجاد پشتیبان...');
            
            const response = await fetch('/api/security/backup/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در ایجاد پشتیبان');
            }

            this.showSuccessModal('پشتیبان ایجاد شد', `پشتیبان ${data.backupId} با موفقیت ایجاد شد`);
            
            // Refresh backup list
            this.loadBackupList();
        } catch (error) {
            console.error('Create backup error:', error);
            this.showErrorModal('خطا در ایجاد پشتیبان', error.message);
        }
    }

    async restoreBackup(backupId) {
        const confirmation = await this.showConfirmModal(
            'بازیابی پشتیبان', 
            `آیا مطمئن هستید که می‌خواهید سیستم را به پشتیبان ${backupId} بازگردانید؟\n\n⚠️ هشدار: تمام تغییرات فعلی از دست خواهد رفت!`
        );
        
        if (!confirmation) return;

        try {
            const loadingModal = this.showLoadingModal(`در حال بازیابی از پشتیبان ${backupId}...`);
            
            const response = await fetch('/api/security/backup/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ backupId })
            });

            const data = await response.json();
            loadingModal.remove();

            if (!response.ok) {
                throw new Error(data.message || 'خطا در بازیابی');
            }

            this.showSuccessModal('بازیابی موفق', 'بازیابی از پشتیبان با موفقیت انجام شد. سیستم مجدداً راه‌اندازی خواهد شد.');
            
            // Reload the page after restore
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Restore backup error:', error);
            this.showErrorModal('خطا در بازیابی', error.message);
        }
    }

    collectData() {
        return {
            // Authentication settings
            twoFactorAuth: document.getElementById('two-factor-auth')?.checked || false,
            biometricAuth: document.getElementById('biometric-auth')?.checked || false,
            ssoLogin: document.getElementById('sso-login')?.checked || false,
            sessionTimeout: parseInt(document.getElementById('session-timeout')?.value) || 30,
            maxLoginAttempts: parseInt(document.getElementById('max-login-attempts')?.value) || 5,
            accountLockout: parseInt(document.getElementById('account-lockout')?.value) || 15,

            // Password policy
            minPasswordLength: parseInt(document.getElementById('min-password-length')?.value) || 8,
            passwordExpiry: parseInt(document.getElementById('password-expiry')?.value) || 90,
            passwordHistory: parseInt(document.getElementById('password-history')?.value) || 5,
            requireUppercase: document.getElementById('require-uppercase')?.checked || false,
            requireNumbers: document.getElementById('require-numbers')?.checked || false,
            requireSymbols: document.getElementById('require-symbols')?.checked || false,

            // API Security
            encryptionType: document.getElementById('encryption-type')?.value || 'AES-256',
            apiKeyExpiry: parseInt(document.getElementById('api-key-expiry')?.value) || 365,
            rateLimit: parseInt(document.getElementById('rate-limit')?.value) || 100,
            forceHttps: document.getElementById('force-https')?.checked !== false,
            sslVerification: document.getElementById('ssl-verification')?.checked !== false,
            dbEncryption: document.getElementById('db-encryption')?.checked || false,

            // Firewall settings
            ddosProtection: document.getElementById('ddos-protection')?.checked || false,
            geoBlocking: document.getElementById('geo-blocking')?.checked || false,
            autoBlocking: document.getElementById('auto-blocking')?.checked || false,

            // Security monitoring
            logAllActivities: document.getElementById('log-all-activities')?.checked || false,
            suspiciousActivityAlert: document.getElementById('suspicious-activity-alert')?.checked || false,
            realtimeMonitoring: document.getElementById('realtime-monitoring')?.checked || false,
            logRetention: parseInt(document.getElementById('log-retention')?.value) || 90,
            logLevel: document.getElementById('log-level')?.value || 'INFO',

            // Backup settings
            dailyBackup: document.getElementById('daily-backup')?.checked || false,
            encryptBackups: document.getElementById('encrypt-backups')?.checked || false,
            backupLocation: document.getElementById('backup-location')?.value || 'cloud',
            backupRetentionCount: parseInt(document.getElementById('backup-retention-count')?.value) || 7,
            backupTime: document.getElementById('backup-time')?.value || '02:00'
        };
    }

    // Utility and modal methods
    showLoadingModal(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div class="flex items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 ml-4"></div>
                    <span class="text-white text-lg">${message}</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    showErrorModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-red-500">
                <div class="flex items-center mb-4">
                    <i class="fas fa-exclamation-circle text-red-500 text-2xl ml-3"></i>
                    <h3 class="text-xl font-bold text-white">${title}</h3>
                </div>
                <p class="text-gray-300 mb-4">${message}</p>
                <button class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors close-modal">
                    بستن
                </button>
            </div>
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
        return modal;
    }

    showSuccessModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-green-500">
                <div class="flex items-center mb-4">
                    <i class="fas fa-check-circle text-green-500 text-2xl ml-3"></i>
                    <h3 class="text-xl font-bold text-white">${title}</h3>
                </div>
                <p class="text-gray-300 mb-4">${message}</p>
                <button class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors close-modal">
                    بستن
                </button>
            </div>
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 3000);
        
        return modal;
    }

    async showConfirmModal(title, message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-yellow-500">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-question-circle text-yellow-500 text-2xl ml-3"></i>
                        <h3 class="text-xl font-bold text-white">${title}</h3>
                    </div>
                    <p class="text-gray-300 mb-6">${message}</p>
                    <div class="flex gap-3">
                        <button class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cancel-btn">
                            انصراف
                        </button>
                        <button class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors confirm-btn">
                            تأیید
                        </button>
                    </div>
                </div>
            `;
            
            modal.querySelector('.confirm-btn').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            modal.querySelector('.cancel-btn').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            });
            
            document.body.appendChild(modal);
        });
    }

    show2FASetupModal(qrCode, secret) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-mobile-alt text-green-500 ml-3"></i>
                    راه‌اندازی احراز هویت دو مرحله‌ای
                </h3>
                
                <div class="space-y-4">
                    <div class="text-center">
                        <div class="bg-white p-4 rounded-lg inline-block mb-4">
                            <img src="${qrCode}" alt="QR Code" class="w-48 h-48">
                        </div>
                        <p class="text-gray-300 text-sm">با برنامه Google Authenticator یا مشابه کد QR را اسکن کنید</p>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm mb-2">یا این کد را دستی وارد کنید:</label>
                        <div class="flex items-center bg-gray-700 rounded-lg p-3">
                            <span class="flex-1 font-mono text-green-400">${secret}</span>
                            <button class="text-blue-400 hover:text-blue-300 copy-secret" data-secret="${secret}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm mb-2">کد 6 رقمی را وارد کنید:</label>
                        <input type="text" id="verification-code" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-lg tracking-widest" maxlength="6" placeholder="123456">
                    </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cancel-btn">
                        انصراف
                    </button>
                    <button class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors verify-btn">
                        تأیید و فعال‌سازی
                    </button>
                </div>
            </div>
        `;
        
        modal.querySelector('.copy-secret').addEventListener('click', (e) => {
            navigator.clipboard.writeText(e.target.dataset.secret);
            this.showSuccessModal('کپی شد', 'کد به کلیپ‌بورد کپی شد');
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.verify-btn').addEventListener('click', () => this.verify2FASetup(modal));
        
        document.body.appendChild(modal);
    }

    async verify2FASetup(modal) {
        const code = modal.querySelector('#verification-code').value;
        if (!code || code.length !== 6) {
            this.showErrorModal('خطا', 'لطفاً کد 6 رقمی معتبر وارد کنید');
            return;
        }

        try {
            const response = await fetch('/api/security/verify-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ code })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'کد نامعتبر است');
            }

            modal.remove();
            this.showSuccessModal('2FA فعال شد', 'احراز هویت دو مرحله‌ای با موفقیت فعال شد');
            
            // Update UI
            document.getElementById('two-factor-auth').checked = true;
            this.updateSecurityStatus();
        } catch (error) {
            this.showErrorModal('خطا در فعال‌سازی', error.message);
        }
    }

    showPasswordTestModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-shield-alt text-purple-500 ml-3"></i>
                    تست قدرت رمز عبور
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 text-sm mb-2">رمز عبور مورد نظر:</label>
                        <input type="password" id="test-password" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="رمز عبور را وارد کنید">
                    </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cancel-btn">
                        انصراف
                    </button>
                    <button class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors test-password-btn">
                        تست کن
                    </button>
                </div>
            </div>
        `;
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        
        document.body.appendChild(modal);
        return modal;
    }

    showPasswordStrengthResult(strength, score, feedback) {
        const strengthColors = {
            'بسیار ضعیف': 'text-red-500',
            'ضعیف': 'text-orange-500',
            'متوسط': 'text-yellow-500',
            'قوی': 'text-green-500',
            'بسیار قوی': 'text-green-400'
        };
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-chart-bar text-purple-500 ml-3"></i>
                    نتیجه تست رمز عبور
                </h3>
                
                <div class="space-y-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold ${strengthColors[strength]} mb-2">${score}/4</div>
                        <div class="text-lg ${strengthColors[strength]}">${strength}</div>
                    </div>
                    
                    <div class="space-y-2">
                        <h4 class="text-white font-semibold">بازخورد:</h4>
                        ${feedback.map(item => `<div class="text-gray-300 text-sm">• ${item}</div>`).join('')}
                    </div>
                </div>
                
                <button class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mt-6 close-modal">
                    بستن
                </button>
            </div>
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        document.body.appendChild(modal);
    }

    showApiKeyModal(apiKey, expiresAt) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-green-500">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-key text-green-500 ml-3"></i>
                    API Key جدید تولید شد
                </h3>
                
                <div class="space-y-4">
                    <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-exclamation-triangle text-red-400 ml-2"></i>
                            <span class="text-red-400 font-semibold">هشدار امنیتی</span>
                        </div>
                        <p class="text-red-300 text-sm">این کلید فقط یک بار نمایش داده می‌شود. لطفاً آن را در مکان امن ذخیره کنید.</p>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm mb-2">API Key:</label>
                        <div class="flex items-center bg-gray-700 rounded-lg p-3">
                            <span class="flex-1 font-mono text-green-400 text-sm break-all">${apiKey}</span>
                            <button class="text-blue-400 hover:text-blue-300 mr-2 copy-key" data-key="${apiKey}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-gray-300 text-sm">
                        <strong>تاریخ انقضا:</strong> ${new Date(expiresAt).toLocaleDateString('fa-IR')}
                    </div>
                </div>
                
                <button class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-6 close-modal">
                    متوجه شدم
                </button>
            </div>
        `;
        
        modal.querySelector('.copy-key').addEventListener('click', (e) => {
            navigator.clipboard.writeText(e.target.dataset.key);
            this.showSuccessModal('کپی شد', 'API Key به کلیپ‌بورد کپی شد');
        });
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        document.body.appendChild(modal);
    }

    // Additional utility methods for loading data
    async loadIPLists() {
        try {
            const response = await fetch('/api/security/ip-lists', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update IP lists in UI
                console.log('IP lists loaded:', data);
            }
        } catch (error) {
            console.error('Failed to load IP lists:', error);
        }
    }

    async loadBackupList() {
        try {
            const response = await fetch('/api/security/backups', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update backup list in UI
                console.log('Backup list loaded:', data);
            }
        } catch (error) {
            console.error('Failed to load backup list:', error);
        }
    }

    showSecurityLogsModal(logs) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 h-3/4 overflow-hidden">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-list text-blue-500 ml-3"></i>
                    لاگ‌های امنیتی
                </h3>
                
                <div class="h-full overflow-y-auto">
                    <table class="w-full text-sm text-gray-300">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr>
                                <th class="p-3 text-right">زمان</th>
                                <th class="p-3 text-right">سطح</th>
                                <th class="p-3 text-right">رویداد</th>
                                <th class="p-3 text-right">جزئیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr class="border-b border-gray-600">
                                    <td class="p-3">${new Date(log.timestamp).toLocaleString('fa-IR')}</td>
                                    <td class="p-3">
                                        <span class="px-2 py-1 rounded text-xs ${log.level === 'ERROR' ? 'bg-red-600' : log.level === 'WARN' ? 'bg-yellow-600' : 'bg-blue-600'}">
                                            ${log.level}
                                        </span>
                                    </td>
                                    <td class="p-3">${log.event}</td>
                                    <td class="p-3">${log.details}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 close-modal">
                    بستن
                </button>
            </div>
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        document.body.appendChild(modal);
    }

    showSecurityScanResults(scanResults) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-search text-purple-500 ml-3"></i>
                    نتایج اسکن امنیتی
                </h3>
                
                <div class="space-y-4">
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                            <div class="text-2xl font-bold text-green-400">${scanResults.passed}</div>
                            <div class="text-green-300 text-sm">تست موفق</div>
                        </div>
                        <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                            <div class="text-2xl font-bold text-yellow-400">${scanResults.warnings}</div>
                            <div class="text-yellow-300 text-sm">هشدار</div>
                        </div>
                        <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                            <div class="text-2xl font-bold text-red-400">${scanResults.failed}</div>
                            <div class="text-red-300 text-sm">خطا</div>
                        </div>
                    </div>
                    
                    <div class="max-h-64 overflow-y-auto space-y-2">
                        ${scanResults.details.map(item => `
                            <div class="flex items-center p-3 rounded-lg ${
                                item.status === 'pass' ? 'bg-green-900/20 border border-green-500/30' :
                                item.status === 'warn' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                                'bg-red-900/20 border border-red-500/30'
                            }">
                                <i class="fas fa-${item.status === 'pass' ? 'check' : item.status === 'warn' ? 'exclamation-triangle' : 'times'} 
                                   text-${item.status === 'pass' ? 'green' : item.status === 'warn' ? 'yellow' : 'red'}-400 ml-3"></i>
                                <div class="flex-1">
                                    <div class="font-semibold text-white">${item.test}</div>
                                    <div class="text-gray-300 text-sm">${item.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mt-6 close-modal">
                    بستن
                </button>
            </div>
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        document.body.appendChild(modal);
    }
}