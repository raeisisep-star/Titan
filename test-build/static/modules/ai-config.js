// AI Configuration Management Module
class AIConfigManager {
    constructor() {
        this.config = null
        this.providers = []
        this.metrics = new Map()
        this.init()
    }

    async init() {
        await this.loadConfiguration()
        this.setupEventListeners()
    }

    // Load configuration from API
    async loadConfiguration() {
        try {
            const [configResponse, providersResponse] = await Promise.all([
                axios.get('/api/ai/config/config'),
                axios.get('/api/ai/config/providers')
            ])

            this.config = configResponse.data.config
            this.providers = providersResponse.data.providers

            // Load metrics for each provider
            for (const provider of this.providers) {
                try {
                    const metricsResponse = await axios.get(`/api/ai/config/providers/${provider.id}/metrics`)
                    this.metrics.set(provider.id, metricsResponse.data.metrics)
                } catch (error) {
                    console.warn(`Failed to load metrics for ${provider.id}:`, error)
                }
            }

            console.log('🔧 AI Configuration loaded successfully')
        } catch (error) {
            console.error('❌ Failed to load AI configuration:', error)
            // Use default fallback configuration
            this.config = this.getDefaultConfig()
            this.providers = this.getDefaultProviders()
        }
    }

    // Save configuration to API
    async saveConfiguration() {
        try {
            await axios.post('/api/ai/config/config', this.config)
            console.log('✅ AI Configuration saved successfully')
            return true
        } catch (error) {
            console.error('❌ Failed to save AI configuration:', error)
            return false
        }
    }

    // Update provider configuration
    async updateProvider(providerId, updates) {
        try {
            const response = await axios.post(`/api/ai/config/providers/${providerId}`, updates)
            
            // Update local cache
            const providerIndex = this.providers.findIndex(p => p.id === providerId)
            if (providerIndex !== -1) {
                this.providers[providerIndex] = { ...this.providers[providerIndex], ...updates }
            }

            console.log(`✅ Provider ${providerId} updated successfully`)
            return response.data
        } catch (error) {
            console.error(`❌ Failed to update provider ${providerId}:`, error)
            throw error
        }
    }

    // Test provider connection
    async testProvider(providerId) {
        try {
            const response = await axios.post(`/api/ai/config/providers/${providerId}/test`)
            return response.data
        } catch (error) {
            console.error(`❌ Failed to test provider ${providerId}:`, error)
            return { success: false, error: error.message }
        }
    }

    // Get provider by ID
    getProvider(providerId) {
        return this.providers.find(p => p.id === providerId)
    }

    // Get enabled providers sorted by priority
    getEnabledProviders() {
        return this.providers
            .filter(p => p.enabled)
            .sort((a, b) => a.priority - b.priority)
    }

    // Get provider metrics
    getProviderMetrics(providerId) {
        return this.metrics.get(providerId)
    }

    // Update system configuration
    updateConfig(updates) {
        this.config = { ...this.config, ...updates }
    }

    // Export configuration
    async exportConfiguration() {
        try {
            const response = await axios.get('/api/ai/config/export')
            return response.data.data
        } catch (error) {
            console.error('❌ Failed to export configuration:', error)
            throw error
        }
    }

    // Import configuration
    async importConfiguration(configData) {
        try {
            const response = await axios.post('/api/ai/config/import', configData)
            await this.loadConfiguration() // Reload after import
            return response.data
        } catch (error) {
            console.error('❌ Failed to import configuration:', error)
            throw error
        }
    }

    // Reset to defaults
    async resetToDefaults() {
        try {
            const response = await axios.post('/api/ai/config/reset')
            await this.loadConfiguration() // Reload after reset
            return response.data
        } catch (error) {
            console.error('❌ Failed to reset configuration:', error)
            throw error
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for configuration updates from other modules
        document.addEventListener('ai-config-update', (event) => {
            this.handleConfigurationUpdate(event.detail)
        })

        // Listen for provider status changes
        document.addEventListener('ai-provider-status-change', (event) => {
            this.handleProviderStatusChange(event.detail)
        })
    }

    // Handle configuration updates
    handleConfigurationUpdate(updateData) {
        if (updateData.type === 'system') {
            this.updateConfig(updateData.data)
            this.saveConfiguration()
        } else if (updateData.type === 'provider') {
            this.updateProvider(updateData.providerId, updateData.data)
        }
    }

    // Handle provider status changes
    handleProviderStatusChange(statusData) {
        const provider = this.getProvider(statusData.providerId)
        if (provider) {
            // Update provider status metrics
            const metrics = this.metrics.get(statusData.providerId) || {}
            metrics.lastStatus = statusData.status
            metrics.lastStatusTime = new Date().toISOString()
            this.metrics.set(statusData.providerId, metrics)

            // Emit status update event
            document.dispatchEvent(new CustomEvent('ai-provider-metrics-update', {
                detail: { providerId: statusData.providerId, metrics }
            }))
        }
    }

    // Create configuration UI
    createConfigurationUI() {
        const container = document.createElement('div')
        container.innerHTML = `
            <div class="ai-config-panel bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-cogs ml-2 text-blue-500"></i>
                        تنظیمات پیشرفته AI
                    </h2>
                    <div class="flex space-x-2 space-x-reverse">
                        <button id="export-config" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                            <i class="fas fa-download ml-1"></i>
                            خروجی
                        </button>
                        <button id="import-config" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                            <i class="fas fa-upload ml-1"></i>
                            ورودی
                        </button>
                        <button id="reset-config" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                            <i class="fas fa-undo ml-1"></i>
                            بازنشانی
                        </button>
                    </div>
                </div>

                <!-- System Configuration -->
                <div class="mb-8">
                    <h3 class="text-xl font-semibold text-white mb-4">تنظیمات سیستم</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Default Provider -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                ارائه‌دهنده پیش‌فرض
                            </label>
                            <select id="default-provider" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                                ${this.providers.map(p => `
                                    <option value="${p.id}" ${this.config?.defaultProvider === p.id ? 'selected' : ''}>
                                        ${p.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Fallback Enabled -->
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" id="fallback-enabled" 
                                       ${this.config?.fallbackEnabled ? 'checked' : ''}
                                       class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <span class="mr-2 text-sm font-medium text-gray-300">
                                    فعال‌سازی زنجیره پشتیبان
                                </span>
                            </label>
                            <p class="text-xs text-gray-400 mt-1">
                                در صورت خرابی ارائه‌دهنده اصلی، از ارائه‌دهندگان دیگر استفاده شود
                            </p>
                        </div>

                        <!-- Sentiment Analysis -->
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" id="sentiment-enabled" 
                                       ${this.config?.sentimentAnalysis?.enabled ? 'checked' : ''}
                                       class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <span class="mr-2 text-sm font-medium text-gray-300">
                                    تحلیل احساسات پیشرفته
                                </span>
                            </label>
                        </div>

                        <!-- Machine Learning -->
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" id="ml-enabled" 
                                       ${this.config?.machineLearning?.enabled ? 'checked' : ''}
                                       class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <span class="mr-2 text-sm font-medium text-gray-300">
                                    یادگیری ماشین
                                </span>
                            </label>
                        </div>

                        <!-- Context Memory -->
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" id="memory-enabled" 
                                       ${this.config?.contextMemory?.enabled ? 'checked' : ''}
                                       class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <span class="mr-2 text-sm font-medium text-gray-300">
                                    حافظه زمینه
                                </span>
                            </label>
                        </div>

                        <!-- Analytics -->
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" id="analytics-enabled" 
                                       ${this.config?.analytics?.enabled ? 'checked' : ''}
                                       class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                <span class="mr-2 text-sm font-medium text-gray-300">
                                    آنالیتیکس
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Providers Configuration -->
                <div>
                    <h3 class="text-xl font-semibold text-white mb-4">ارائه‌دهندگان AI</h3>
                    <div id="providers-list" class="space-y-4">
                        ${this.createProvidersHTML()}
                    </div>
                </div>

                <!-- Save Button -->
                <div class="mt-8 text-center">
                    <button id="save-config" class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition text-lg font-semibold">
                        <i class="fas fa-save ml-2"></i>
                        ذخیره تنظیمات
                    </button>
                </div>
            </div>

            <!-- Hidden file input for import -->
            <input type="file" id="config-file-input" accept=".json" style="display: none;">
        `

        this.setupConfigurationEventListeners(container)
        return container
    }

    // Create providers HTML
    createProvidersHTML() {
        return this.providers.map(provider => {
            const metrics = this.metrics.get(provider.id) || {}
            return `
                <div class="provider-card bg-gray-700 rounded-lg p-4" data-provider="${provider.id}">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full ${provider.enabled ? 'bg-green-500' : 'bg-gray-500'} ml-3"></div>
                            <h4 class="text-lg font-semibold text-white">${provider.name}</h4>
                            <span class="px-2 py-1 text-xs rounded-full ml-2 ${provider.enabled ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'}">
                                ${provider.enabled ? 'فعال' : 'غیرفعال'}
                            </span>
                        </div>
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button class="test-provider px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition">
                                <i class="fas fa-vial ml-1"></i>
                                تست
                            </button>
                            <button class="toggle-provider px-3 py-1 ${provider.enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-sm transition">
                                ${provider.enabled ? 'غیرفعال' : 'فعال'}
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-300 mb-1">اولویت</label>
                            <input type="number" class="provider-priority w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm" 
                                   value="${provider.priority}" min="1" max="10">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-300 mb-1">حداکثر توکن</label>
                            <input type="number" class="provider-max-tokens w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm" 
                                   value="${provider.maxTokens || 2000}" min="100" max="8000">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-300 mb-1">دما (Temperature)</label>
                            <input type="number" class="provider-temperature w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm" 
                                   value="${provider.temperature || 0.7}" min="0" max="2" step="0.1">
                        </div>
                    </div>

                    ${provider.type !== 'local' ? `
                        <div class="mb-3">
                            <label class="block text-xs font-medium text-gray-300 mb-1">کلید API</label>
                            <input type="password" class="provider-api-key w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm" 
                                   placeholder="${provider.apiKey ? '***masked***' : 'کلید API را وارد کنید'}" 
                                   value="">
                        </div>
                    ` : ''}

                    <!-- Performance Metrics -->
                    <div class="grid grid-cols-4 gap-4 text-center text-xs">
                        <div>
                            <div class="text-green-400 font-bold">${metrics.successfulRequests || 0}</div>
                            <div class="text-gray-400">موفق</div>
                        </div>
                        <div>
                            <div class="text-red-400 font-bold">${metrics.failedRequests || 0}</div>
                            <div class="text-gray-400">ناموفق</div>
                        </div>
                        <div>
                            <div class="text-blue-400 font-bold">${metrics.averageResponseTime || 0}ms</div>
                            <div class="text-gray-400">پاسخ</div>
                        </div>
                        <div>
                            <div class="text-purple-400 font-bold">${(metrics.performance?.overall * 100) || 0}%</div>
                            <div class="text-gray-400">کیفیت</div>
                        </div>
                    </div>
                </div>
            `
        }).join('')
    }

    // Setup configuration event listeners
    setupConfigurationEventListeners(container) {
        // Save configuration
        container.querySelector('#save-config').addEventListener('click', async () => {
            await this.saveCurrentConfiguration(container)
        })

        // Export configuration
        container.querySelector('#export-config').addEventListener('click', async () => {
            await this.exportConfigurationFile()
        })

        // Import configuration
        container.querySelector('#import-config').addEventListener('click', () => {
            container.querySelector('#config-file-input').click()
        })

        container.querySelector('#config-file-input').addEventListener('change', async (e) => {
            await this.importConfigurationFile(e.target.files[0])
        })

        // Reset configuration
        container.querySelector('#reset-config').addEventListener('click', async () => {
            if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات را به حالت پیش‌فرض بازگردانید؟')) {
                await this.resetToDefaults()
                window.location.reload()
            }
        })

        // Provider actions
        container.querySelectorAll('.test-provider').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const providerId = e.target.closest('.provider-card').dataset.provider
                await this.testProviderConnection(providerId, btn)
            })
        })

        container.querySelectorAll('.toggle-provider').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const providerId = e.target.closest('.provider-card').dataset.provider
                await this.toggleProvider(providerId, container)
            })
        })
    }

    // Save current configuration from UI
    async saveCurrentConfiguration(container) {
        const saveBtn = container.querySelector('#save-config')
        const originalText = saveBtn.innerHTML
        
        try {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>در حال ذخیره...'
            saveBtn.disabled = true

            // Update system configuration
            this.config.defaultProvider = container.querySelector('#default-provider').value
            this.config.fallbackEnabled = container.querySelector('#fallback-enabled').checked
            this.config.sentimentAnalysis.enabled = container.querySelector('#sentiment-enabled').checked
            this.config.machineLearning.enabled = container.querySelector('#ml-enabled').checked
            this.config.contextMemory.enabled = container.querySelector('#memory-enabled').checked
            this.config.analytics.enabled = container.querySelector('#analytics-enabled').checked

            // Update providers configuration
            const providerCards = container.querySelectorAll('.provider-card')
            for (const card of providerCards) {
                const providerId = card.dataset.provider
                const provider = this.getProvider(providerId)
                
                if (provider) {
                    const updates = {
                        priority: parseInt(card.querySelector('.provider-priority').value),
                        maxTokens: parseInt(card.querySelector('.provider-max-tokens').value),
                        temperature: parseFloat(card.querySelector('.provider-temperature').value)
                    }

                    const apiKeyField = card.querySelector('.provider-api-key')
                    if (apiKeyField && apiKeyField.value.trim()) {
                        updates.apiKey = apiKeyField.value.trim()
                    }

                    await this.updateProvider(providerId, updates)
                }
            }

            // Save system configuration
            await this.saveConfiguration()

            saveBtn.innerHTML = '<i class="fas fa-check ml-2"></i>ذخیره شد!'
            setTimeout(() => {
                saveBtn.innerHTML = originalText
                saveBtn.disabled = false
            }, 2000)

        } catch (error) {
            console.error('Error saving configuration:', error)
            saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle ml-2"></i>خطا در ذخیره'
            setTimeout(() => {
                saveBtn.innerHTML = originalText
                saveBtn.disabled = false
            }, 3000)
        }
    }

    // Test provider connection
    async testProviderConnection(providerId, button) {
        const originalText = button.innerHTML
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin ml-1"></i>تست...'
            button.disabled = true

            const result = await this.testProvider(providerId)
            
            if (result.success) {
                button.innerHTML = '<i class="fas fa-check ml-1"></i>موفق'
                button.className = 'test-provider px-3 py-1 bg-green-600 text-white rounded text-sm'
            } else {
                button.innerHTML = '<i class="fas fa-times ml-1"></i>ناموفق'
                button.className = 'test-provider px-3 py-1 bg-red-600 text-white rounded text-sm'
            }

            setTimeout(() => {
                button.innerHTML = originalText
                button.className = 'test-provider px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition'
                button.disabled = false
            }, 3000)

        } catch (error) {
            console.error('Error testing provider:', error)
            button.innerHTML = '<i class="fas fa-exclamation-triangle ml-1"></i>خطا'
            button.className = 'test-provider px-3 py-1 bg-red-600 text-white rounded text-sm'
            
            setTimeout(() => {
                button.innerHTML = originalText
                button.className = 'test-provider px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition'
                button.disabled = false
            }, 3000)
        }
    }

    // Toggle provider enabled/disabled
    async toggleProvider(providerId, container) {
        const provider = this.getProvider(providerId)
        const newStatus = !provider.enabled

        try {
            await this.updateProvider(providerId, { enabled: newStatus })
            
            // Update UI
            const card = container.querySelector(`[data-provider="${providerId}"]`)
            const statusDot = card.querySelector('.w-3.h-3')
            const statusBadge = card.querySelector('.px-2.py-1')
            const toggleBtn = card.querySelector('.toggle-provider')

            statusDot.className = `w-3 h-3 rounded-full ml-3 ${newStatus ? 'bg-green-500' : 'bg-gray-500'}`
            statusBadge.className = `px-2 py-1 text-xs rounded-full ml-2 ${newStatus ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'}`
            statusBadge.textContent = newStatus ? 'فعال' : 'غیرفعال'
            
            toggleBtn.textContent = newStatus ? 'غیرفعال' : 'فعال'
            toggleBtn.className = `toggle-provider px-3 py-1 ${newStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-sm transition`

        } catch (error) {
            console.error('Error toggling provider:', error)
        }
    }

    // Export configuration to file
    async exportConfigurationFile() {
        try {
            const configData = await this.exportConfiguration()
            const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            
            const a = document.createElement('a')
            a.href = url
            a.download = `titan-ai-config-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error exporting configuration:', error)
            alert('خطا در خروجی گیری تنظیمات')
        }
    }

    // Import configuration from file
    async importConfigurationFile(file) {
        if (!file) return

        try {
            const text = await file.text()
            const configData = JSON.parse(text)
            
            await this.importConfiguration(configData)
            alert('تنظیمات با موفقیت وارد شد. صفحه بازنشانی می‌شود.')
            window.location.reload()

        } catch (error) {
            console.error('Error importing configuration:', error)
            alert('خطا در وارد کردن تنظیمات. لطفا فرمت فایل را بررسی کنید.')
        }
    }

    // Default configuration fallback
    getDefaultConfig() {
        return {
            defaultProvider: 'local-model',
            fallbackEnabled: true,
            sentimentAnalysis: {
                enabled: true,
                language: 'multi',
                threshold: 0.6
            },
            machineLearning: {
                enabled: true,
                adaptationRate: 0.1,
                memorySize: 1000,
                qualityThreshold: 0.7
            },
            contextMemory: {
                enabled: true,
                maxConversations: 100,
                maxMessagesPerConversation: 50,
                ttl: 3600
            },
            analytics: {
                enabled: true,
                trackingLevel: 'detailed',
                retentionDays: 30
            }
        }
    }

    // Default providers fallback
    getDefaultProviders() {
        return [
            {
                id: 'local-model',
                name: 'Local AI Model',
                type: 'local',
                enabled: true,
                priority: 5,
                maxTokens: 1000,
                temperature: 0.7
            }
        ]
    }
}

// Global AI Config Manager instance
window.aiConfigManager = new AIConfigManager()

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIConfigManager
}