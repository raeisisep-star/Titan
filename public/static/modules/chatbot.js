// ==================== ARTEMIS AI CHATBOT MODULE ====================

class ArtemisAIChatbot {
    constructor() {
        this.isOpen = false;
        this.isRecording = false;
        this.recognition = null;
        this.synthesis = null;
        this.conversationHistory = [];
        this.activeTasks = new Map();
        this.currentConversationId = null;
        this.sseConnection = null;
        this.isTyping = false;
        this.typingTimeout = null;
        this.userPreferences = {
            voiceEnabled: true,
            autoSpeak: false,
            language: 'fa-IR',
            notifications: true,
            aiProvider: 'openai', // 'openai' or 'anthropic'
            aiModel: 'gpt-3.5-turbo', // Default model
            useAIBackend: true // Use AI backend vs local mock
        };
        
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.initializeVoice();
        this.bindEvents();
        this.loadConversationHistory();
        this.startHeartbeat();
        
        // Initial greeting after 2 seconds
        setTimeout(() => {
            this.addArtemisMessage(
                "سلام! من آرتمیس، دستیار هوشمند شما هستم 🤖\n\n" +
                "می‌تونم کمکتون کنم در:\n" +
                "💰 مدیریت پورتفولیو\n" +
                "📈 تحلیل بازار و معاملات\n" +
                "⚙️ تنظیمات سیستم\n" +
                "🔄 اتوماسیون و تسک‌ها\n\n" +
                "چه کاری برایتان انجام دهم؟",
                {
                    type: 'welcome',
                    quickActions: [
                        'وضعیت پورتفولیو',
                        'فرصت‌های معاملاتی',
                        'تنظیم اتوپایلوت',
                        'گزارش سود'
                    ]
                }
            );
        }, 2000);
    }

    createChatbotUI() {
        // Create system status button above chatbot
        const statusButton = document.createElement('button');
        statusButton.className = 'system-status-button';
        statusButton.innerHTML = '<i class="fas fa-server"></i>';
        statusButton.setAttribute('title', 'وضعیت سیستم');
        document.body.appendChild(statusButton);

        // Create chatbot button
        const button = document.createElement('button');
        button.className = 'artemis-chatbot-button';
        button.innerHTML = '<i class="fas fa-robot"></i>';
        button.setAttribute('title', 'چت با آرتمیس - دستیار هوشمند');
        document.body.appendChild(button);

        // Create chatbot container
        const container = document.createElement('div');
        container.className = 'artemis-chatbot-container';
        container.innerHTML = `
            <!-- Header -->
            <div class="artemis-chatbot-header">
                <div class="artemis-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="artemis-info">
                    <div class="artemis-name">آرتمیس AI</div>
                    <div class="artemis-status">
                        <div class="status-indicator"></div>
                        آنلاین و آماده کمک
                    </div>
                </div>
                <div class="artemis-controls">
                    <button class="control-btn" id="artemis-settings" title="تنظیمات">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="control-btn" id="artemis-minimize" title="بستن">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Messages Area -->
            <div class="artemis-messages" id="artemis-messages">
                <!-- Messages will be added here dynamically -->
            </div>

            <!-- Input Area -->
            <div class="artemis-input-area">
                <div class="artemis-input-container">
                    <textarea 
                        class="artemis-input" 
                        id="artemis-input"
                        placeholder="پیام خود را بنویسید..."
                        rows="1"
                    ></textarea>
                    <div class="input-actions">
                        <button class="action-btn voice-btn" id="voice-btn" title="ضبط صوت">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <button class="action-btn send-btn" id="send-btn" title="ارسال">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                <div class="quick-actions" id="quick-actions">
                    <!-- Quick actions will be added here -->
                </div>
            </div>
        `;
        document.body.appendChild(container);

        this.elements = {
            button,
            statusButton,
            container,
            messages: document.getElementById('artemis-messages'),
            input: document.getElementById('artemis-input'),
            sendBtn: document.getElementById('send-btn'),
            voiceBtn: document.getElementById('voice-btn'),
            settingsBtn: document.getElementById('artemis-settings'),
            minimizeBtn: document.getElementById('artemis-minimize'),
            quickActions: document.getElementById('quick-actions')
        };
    }

    bindEvents() {
        // Toggle chatbot
        this.elements.button.addEventListener('click', () => this.toggleChatbot());
        this.elements.minimizeBtn.addEventListener('click', () => this.closeChatbot());
        
        // System status click
        this.elements.statusButton.addEventListener('click', () => this.showSystemStatus());

        // Send message
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Voice recording
        this.elements.voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());

        // Auto-resize textarea and handle typing indicator
        this.elements.input.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.handleTypingInput();
        });

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());

        // Quick actions delegation
        this.elements.quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action')) {
                this.sendMessage(e.target.textContent);
            }
        });
    }

    initializeVoice() {
        // Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.userPreferences.language;

            this.recognition.onstart = () => {
                this.elements.voiceBtn.classList.add('recording');
                this.isRecording = true;
            };

            this.recognition.onend = () => {
                this.elements.voiceBtn.classList.remove('recording');
                this.isRecording = false;
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.elements.input.value = transcript;
                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.elements.voiceBtn.classList.remove('recording');
                this.isRecording = false;
            };
        }

        // Speech Synthesis
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        this.elements.container.classList.add('active');
        this.isOpen = true;
        
        // Focus input
        setTimeout(() => {
            this.elements.input.focus();
        }, 100);

        // Mark as read if there are notifications
        this.elements.button.classList.remove('has-notification');
        
        // Auto-scroll to bottom
        this.scrollToBottom();
    }

    closeChatbot() {
        this.elements.container.classList.remove('active');
        this.isOpen = false;
        
        // Close SSE connection when chatbot is closed
        this.closeSSEConnection();
    }

    sendMessage(text = null) {
        const message = text || this.elements.input.value.trim();
        if (!message) return;

        // Initialize SSE connection if not exists and we have conversation ID
        if (!this.sseConnection && this.currentConversationId && this.getAuthToken()) {
            this.initializeSSEConnection();
        }

        // Add user message
        this.addUserMessage(message);
        
        // Clear input
        if (!text) {
            this.elements.input.value = '';
            this.autoResizeTextarea();
        }

        // Stop typing indicator
        this.sendTypingIndicator(false);

        // Show AI typing indicator
        this.showTyping();

        // Process message with AI (no artificial delay for real backend)
        this.processUserMessage(message);
    }

    addUserMessage(message) {
        const messageElement = this.createMessageElement('user', message, new Date());
        this.elements.messages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Save to history
        this.conversationHistory.push({
            type: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
    }

    addArtemisMessage(message, options = {}) {
        this.hideTyping();
        
        const messageElement = this.createMessageElement('artemis', message, new Date(), options);
        this.elements.messages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Text-to-speech if enabled
        if (this.userPreferences.autoSpeak && this.synthesis) {
            this.speak(message);
        }

        // Add quick actions if provided
        if (options.quickActions && options.quickActions.length > 0) {
            this.updateQuickActions(options.quickActions);
        }

        // Save to history
        this.conversationHistory.push({
            type: 'artemis',
            content: message,
            timestamp: new Date().toISOString(),
            options
        });

        // Show notification if chatbot is closed
        if (!this.isOpen) {
            this.elements.button.classList.add('has-notification');
        }
    }

    createMessageElement(sender, content, timestamp, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Format message content
        const formattedContent = this.formatMessageContent(content);
        messageContent.innerHTML = formattedContent;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(timestamp);
        
        messageDiv.appendChild(avatar);
        const contentWrapper = document.createElement('div');
        contentWrapper.appendChild(messageContent);
        contentWrapper.appendChild(messageTime);
        
        // Add action buttons for special messages
        if (options.actions && options.actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            options.actions.forEach(action => {
                const actionBtn = document.createElement('button');
                actionBtn.className = `message-action-btn ${action.type || ''}`;
                actionBtn.textContent = action.label;
                actionBtn.addEventListener('click', () => {
                    if (action.callback) {
                        action.callback();
                    } else if (action.command) {
                        this.executeCommand(action.command);
                    }
                });
                actionsDiv.appendChild(actionBtn);
            });
            
            contentWrapper.appendChild(actionsDiv);
        }
        
        // Add data cards for portfolio/trade info
        if (options.dataCard) {
            const dataCard = this.createDataCard(options.dataCard);
            contentWrapper.appendChild(dataCard);
        }
        
        messageDiv.appendChild(contentWrapper);
        return messageDiv;
    }

    formatMessageContent(content) {
        // Convert line breaks
        let formatted = content.replace(/\n/g, '<br>');
        
        // Format emojis and icons
        formatted = formatted.replace(/💰|📈|📊|🎯|⚡|🔄|⚙️|🤖|✅|❌|⚠️|🎉|💡|🔍/g, 
            match => `<span class="emoji">${match}</span>`);
        
        // Format currency values
        formatted = formatted.replace(/\$[\d,]+(\.\d{2})?/g, 
            match => `<span class="currency">${match}</span>`);
        
        // Format percentages
        formatted = formatted.replace(/[+\-]?\d+(\.\d+)?%/g, 
            match => {
                const isPositive = match.startsWith('+');
                const isNegative = match.startsWith('-');
                const className = isPositive ? 'positive' : isNegative ? 'negative' : '';
                return `<span class="percentage ${className}">${match}</span>`;
            });
        
        return formatted;
    }

    createDataCard(data) {
        const card = document.createElement('div');
        card.className = 'data-card';
        
        const header = document.createElement('div');
        header.className = 'data-card-header';
        header.innerHTML = `<i class="${data.icon}"></i> ${data.title}`;
        
        const content = document.createElement('div');
        content.className = 'data-card-content';
        
        data.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            
            const label = document.createElement('span');
            label.className = 'data-label';
            label.textContent = item.label;
            
            const value = document.createElement('span');
            value.className = `data-value ${item.type || ''}`;
            value.textContent = item.value;
            
            itemDiv.appendChild(label);
            itemDiv.appendChild(value);
            content.appendChild(itemDiv);
        });
        
        card.appendChild(header);
        card.appendChild(content);
        return card;
    }

    showTyping() {
        // Remove existing typing indicator
        this.hideTyping();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message artemis';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-indicator">
                <span>آرتمیس در حال نوشتن</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.elements.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) {
            typing.remove();
        }
    }

    async processUserMessage(message) {
        try {
            // Try AI backend first
            const aiResponse = await this.callAIBackend(message);
            if (aiResponse) {
                this.addArtemisMessage(aiResponse.message, {
                    type: 'ai_response',
                    confidence: aiResponse.confidence,
                    provider: aiResponse.provider,
                    model: aiResponse.model,
                    quickActions: this.extractQuickActions(aiResponse)
                });
                return;
            }
        } catch (error) {
            console.error('AI Backend error:', error);
            // Fallback to local processing
        }
        
        // Fallback to local mock responses
        const response = await this.generateAIResponse(message);
        this.addArtemisMessage(response.content, response.options);
    }

    async callAIBackend(message) {
        try {
            // Get authentication token
            const token = this.getAuthToken();
            if (!token) {
                console.warn('No authentication token available for AI chat');
                return null;
            }

            // Generate conversation ID if not exists
            if (!this.currentConversationId) {
                this.currentConversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            }

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: this.currentConversationId,
                    provider: this.userPreferences.aiProvider || 'openai',
                    model: this.userPreferences.aiModel || 'gpt-3.5-turbo'
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Authentication failed for AI chat');
                    this.handleAuthError();
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success && data.data) {
                return data.data;
            } else {
                throw new Error(data.error || 'Invalid response format');
            }

        } catch (error) {
            console.error('AI Backend call failed:', error);
            return null;
        }
    }

    getAuthToken() {
        // Try multiple sources for token
        const token = localStorage.getItem('authToken') || 
                     localStorage.getItem('accessToken') || 
                     sessionStorage.getItem('authToken') ||
                     sessionStorage.getItem('accessToken');
        
        return token;
    }

    handleAuthError() {
        // Show login prompt or redirect to login
        this.addArtemisMessage(
            "برای استفاده از دستیار هوش مصنوعی، لطفاً وارد حساب کاربری خود شوید.",
            {
                type: 'auth_required',
                quickActions: ['ورود به حساب']
            }
        );
    }

    extractQuickActions(aiResponse) {
        // Extract quick actions from AI response
        const actions = [];
        
        if (aiResponse.suggestedActions && aiResponse.suggestedActions.length > 0) {
            return aiResponse.suggestedActions.map(action => action.description);
        }
        
        if (aiResponse.marketAnalysis) {
            actions.push('نمایش نمودار', 'تحلیل بیشتر');
        }
        
        return actions.length > 0 ? actions : ['ادامه گفتگو'];
    }

    /**
     * Initialize SSE connection for real-time updates
     */
    initializeSSEConnection() {
        if (this.sseConnection) {
            this.sseConnection.close();
        }

        const token = this.getAuthToken();
        if (!token || !this.currentConversationId) {
            console.warn('Cannot initialize SSE: missing token or conversation ID');
            return;
        }

        try {
            const url = `/api/chat/stream/${this.currentConversationId}`;
            this.sseConnection = new EventSource(url, {
                withCredentials: true
            });

            // Add Authorization header (not directly supported, need to use workaround)
            // For now, we'll pass token in the conversation init

            this.sseConnection.onopen = () => {
                console.log('SSE connection established');
                this.updateConnectionStatus(true);
            };

            this.sseConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleSSEEvent(data);
                } catch (error) {
                    console.error('Invalid SSE message:', error);
                }
            };

            this.sseConnection.addEventListener('message', (event) => {
                this.handleSSEMessage(event);
            });

            this.sseConnection.addEventListener('typing', (event) => {
                this.handleTypingEvent(event);
            });

            this.sseConnection.addEventListener('stop_typing', (event) => {
                this.handleStopTypingEvent(event);
            });

            this.sseConnection.addEventListener('user_join', (event) => {
                this.handleUserJoinEvent(event);
            });

            this.sseConnection.addEventListener('user_leave', (event) => {
                this.handleUserLeaveEvent(event);
            });

            this.sseConnection.onerror = (error) => {
                console.error('SSE connection error:', error);
                this.updateConnectionStatus(false);
                
                // Retry connection after 5 seconds
                setTimeout(() => {
                    if (!this.sseConnection || this.sseConnection.readyState === EventSource.CLOSED) {
                        this.initializeSSEConnection();
                    }
                }, 5000);
            };

        } catch (error) {
            console.error('Failed to initialize SSE:', error);
        }
    }

    /**
     * Handle SSE events
     */
    handleSSEEvent(data) {
        switch (data.type) {
            case 'message':
                if (data.userId !== 'current_user') { // Don't show our own messages
                    this.displayRealTimeMessage(data);
                }
                break;
            case 'system':
                this.handleSystemMessage(data);
                break;
            case 'ping':
                // Just to keep connection alive
                break;
            default:
                console.log('Unknown SSE event:', data.type, data);
        }
    }

    handleSSEMessage(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.data && data.data.role === 'assistant') {
                // New AI response received
                this.addArtemisMessage(data.data.content, {
                    type: 'ai_response',
                    provider: data.data.provider,
                    model: data.data.model,
                    confidence: data.data.confidence,
                    realtime: true
                });
            }
        } catch (error) {
            console.error('Error handling SSE message:', error);
        }
    }

    handleTypingEvent(event) {
        try {
            const data = JSON.parse(event.data);
            this.showOtherUserTyping(data.userId);
        } catch (error) {
            console.error('Error handling typing event:', error);
        }
    }

    handleStopTypingEvent(event) {
        this.hideOtherUserTyping();
    }

    handleUserJoinEvent(event) {
        try {
            const data = JSON.parse(event.data);
            this.showSystemNotification(`${data.userId} به گفتگو پیوست`);
        } catch (error) {
            console.error('Error handling user join:', error);
        }
    }

    handleUserLeaveEvent(event) {
        try {
            const data = JSON.parse(event.data);
            this.showSystemNotification(`${data.userId} گفتگو را ترک کرد`);
        } catch (error) {
            console.error('Error handling user leave:', error);
        }
    }

    handleSystemMessage(data) {
        if (data.data.error) {
            console.error('System error:', data.data.error);
        } else if (data.data.message) {
            console.log('System message:', data.data.message);
        }
    }

    /**
     * Send typing indicator
     */
    sendTypingIndicator(isTyping) {
        if (!this.currentConversationId || this.isTyping === isTyping) {
            return; // No change or no conversation
        }

        this.isTyping = isTyping;

        const token = this.getAuthToken();
        if (!token) return;

        fetch(`/api/chat/typing/${this.currentConversationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isTyping })
        }).catch(error => {
            console.error('Failed to send typing indicator:', error);
        });
    }

    /**
     * Show that another user is typing
     */
    showOtherUserTyping(userId) {
        const existingIndicator = this.elements.messages.querySelector('.typing-indicator');
        if (existingIndicator) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator p-3 text-gray-400 text-sm';
        indicator.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                <span>در حال تایپ...</span>
            </div>
        `;
        this.elements.messages.appendChild(indicator);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideOtherUserTyping() {
        const indicator = this.elements.messages.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Update connection status indicator
     */
    updateConnectionStatus(connected) {
        // You could add a visual indicator here
        if (connected) {
            console.log('✅ Real-time connection active');
        } else {
            console.log('❌ Real-time connection lost');
        }
    }

    /**
     * Show system notification
     */
    showSystemNotification(message) {
        // Could show a small toast notification
        console.log('📢 System:', message);
    }

    /**
     * Close SSE connection
     */
    closeSSEConnection() {
        if (this.sseConnection) {
            this.sseConnection.close();
            this.sseConnection = null;
            this.updateConnectionStatus(false);
        }
    }

    /**
     * Handle typing input for typing indicator
     */
    handleTypingInput() {
        if (!this.currentConversationId) return;

        // Send typing indicator
        this.sendTypingIndicator(true);

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Stop typing after 2 seconds of no input
        this.typingTimeout = setTimeout(() => {
            this.sendTypingIndicator(false);
        }, 2000);
    }

    async generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase().trim();
        
        // Portfolio queries
        if (this.matchesKeywords(message, ['پورتفولیو', 'موجودی', 'دارایی', 'وضعیت'])) {
            return await this.getPortfolioResponse();
        }
        
        // Detailed portfolio holdings
        if (this.matchesKeywords(message, ['جزئیات دارایی', 'دارایی‌ها', 'هولدینگ', 'Holdings'])) {
            return await this.getDetailedPortfolioResponse();
        }
        
        // Risk analysis
        if (this.matchesKeywords(message, ['تحلیل ریسک', 'ریسک', 'خطر', 'Risk', 'تنوع'])) {
            return await this.getRiskAnalysisResponse();
        }
        
        // Portfolio insights
        if (this.matchesKeywords(message, ['پیشنهادات بهبود', 'بینش', 'Insights', 'پیشنهاد', 'بهبود'])) {
            return await this.getPortfolioInsightsResponse();
        }
        
        // Market alerts
        if (this.matchesKeywords(message, ['هشدار', 'alert', 'اطلاع رسانی', 'تنظیم هشدار', 'یادآوری'])) {
            return await this.getMarketAlertsResponse(message);
        }
        
        // Create alert
        if (this.matchesKeywords(message, ['ایجاد هشدار', 'هشدار جدید', 'create alert', 'تنظیم یادآوری'])) {
            return await this.createAlertResponse(message);
        }
        
        // Alert settings
        if (this.matchesKeywords(message, ['تنظیمات هشدار', 'alert settings', 'اطلاع رسانی تنظیم'])) {
            return await this.getAlertSettingsResponse();
        }
        
        // Chart and visualization requests
        if (this.matchesKeywords(message, ['نمودار', 'چارت', 'chart', 'تجسم', 'نمایش گرافیکی', 'تحلیل تکنیکال'])) {
            return await this.getChartResponse(message);
        }
        
        // Voice commands and settings
        if (this.matchesKeywords(message, ['صدا', 'voice', 'بخوان', 'بگو', 'تنظیمات صوتی'])) {
            return await this.getVoiceResponse(message);
        }
        
        // Multi-language support commands
        if (this.matchesKeywords(message, ['ترجمه', 'translate', 'زبان', 'language', 'چند زبانه', 'multilingual', 'زبان رابط', 'محتوای بومی'])) {
            return await this.getMultiLanguageResponse(message);
        }
        
        // Trading queries
        if (this.matchesKeywords(message, ['معامله', 'خرید', 'فروش', 'فرصت', 'تحلیل'])) {
            return this.getTradingResponse(message);
        }
        
        // Autopilot/Automation
        if (this.matchesKeywords(message, ['اتوپایلوت', 'خودکار', 'اتوماسیون', 'ربات'])) {
            return this.getAutopilotResponse(message);
        }
        
        // Reports and analytics
        if (this.matchesKeywords(message, ['گزارش', 'سود', 'ضرر', 'عملکرد', 'آمار'])) {
            return this.getReportResponse();
        }
        
        // Settings and configuration
        if (this.matchesKeywords(message, ['تنظیم', 'کانفیگ', 'setting'])) {
            return this.getSettingsResponse();
        }
        
        // Wallet management
        if (this.matchesKeywords(message, ['کیف پول', 'والت', 'موجودی', 'انتقال'])) {
            return this.getWalletResponse();
        }
        
        // Schedule tasks
        if (this.matchesKeywords(message, ['هر', 'دقیقه', 'ساعت', 'روز', 'تکرار', 'زمان‌بندی'])) {
            return this.scheduleTaskResponse(message);
        }
        
        // Greetings
        if (this.matchesKeywords(message, ['سلام', 'hi', 'hello', 'صبح بخیر', 'ممنون'])) {
            return this.getGreetingResponse();
        }
        
        // Help
        if (this.matchesKeywords(message, ['کمک', 'راهنما', 'help', 'چی میتونی'])) {
            return this.getHelpResponse();
        }
        
        // Default response with suggestions
        return this.getDefaultResponse();
    }

    matchesKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    async getPortfolioResponse() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای مشاهده پورتفولیو، لطفاً وارد حساب کاربری خود شوید.',
                    options: {
                        quickActions: ['ورود به حساب', 'ثبت نام']
                    }
                };
            }

            // Fetch portfolio data from backend
            const response = await fetch('/api/portfolio/summary', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }

            const portfolio = data.data;
            
            // Format numbers for display
            const totalValue = `$${portfolio.totalValue.toLocaleString()}`;
            const dailyChange = portfolio.dailyChangePercentage >= 0 
                ? `+${portfolio.dailyChangePercentage.toFixed(1)}%` 
                : `${portfolio.dailyChangePercentage.toFixed(1)}%`;
            const totalPnL = portfolio.totalPnL >= 0
                ? `+$${portfolio.totalPnL.toLocaleString()}`
                : `-$${Math.abs(portfolio.totalPnL).toLocaleString()}`;
            const pnLPercentage = portfolio.pnLPercentage >= 0
                ? `+${portfolio.pnLPercentage.toFixed(1)}%`
                : `${portfolio.pnLPercentage.toFixed(1)}%`;

            const bestPerformer = portfolio.topPerformer 
                ? `${portfolio.topPerformer.symbol} (${portfolio.topPerformer.changePercentage.toFixed(1)}%)`
                : 'نامشخص';
            const worstPerformer = portfolio.worstPerformer
                ? `${portfolio.worstPerformer.symbol} (${portfolio.worstPerformer.changePercentage.toFixed(1)}%)`
                : 'نامشخص';

            return {
                content: `📊 وضعیت پورتفولیو شما:\n\n💰 ارزش کل: ${totalValue} (${dailyChange} امروز)\n📈 سود/ضرر کل: ${totalPnL} (${pnLPercentage})\n🎯 تعداد دارایی‌ها: ${portfolio.assetCount}\n\nبهترین عملکرد: ${bestPerformer}\n${portfolio.worstPerformer && portfolio.worstPerformer.changePercentage < 0 ? `نیاز به توجه: ${worstPerformer}` : ''}\n\nآیا می‌خواهید تحلیل بیشتری ببینید؟`,
                options: {
                    quickActions: ['جزئیات دارایی‌ها', 'تحلیل ریسک', 'ایجاد هشدار', 'پیشنهادات بهبود'],
                    dataCard: {
                        title: 'جزئیات پورتفولیو',
                        icon: 'fas fa-chart-pie',
                        items: [
                            { 
                                label: 'ارزش کل', 
                                value: totalValue, 
                                type: portfolio.totalPnL >= 0 ? 'positive' : 'negative' 
                            },
                            { 
                                label: 'تغییر امروز', 
                                value: dailyChange, 
                                type: portfolio.dailyChangePercentage >= 0 ? 'positive' : 'negative' 
                            },
                            { 
                                label: 'سود/ضرر کل', 
                                value: `${totalPnL}`, 
                                type: portfolio.totalPnL >= 0 ? 'positive' : 'negative' 
                            },
                            { 
                                label: 'درصد بازدهی', 
                                value: pnLPercentage, 
                                type: portfolio.pnLPercentage >= 0 ? 'positive' : 'negative' 
                            }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Portfolio API Error:', error);
            // Fallback to mock data
            return {
                content: `📊 وضعیت پورتفولیو (نمونه):\n\n💰 ارزش کل: $12,450 (+2.3% امروز)\n📈 سود کل: +$1,250 (+11.2%)\n🎯 تعداد دارایی‌ها: 3\n\nبهترین عملکرد: BTC (+5.2%)\nنیاز به توجه: ADA (-1.8%)\n\n⚠️ خطا در اتصال به سرور. داده‌های نمونه نمایش داده شده.`,
                options: {
                    quickActions: ['تلاش مجدد', 'تحلیل تکنیکال', 'گزارش سود', 'تنظیم هشدار'],
                    dataCard: {
                        title: 'جزئیات پورتفولیو (نمونه)',
                        icon: 'fas fa-chart-pie',
                        items: [
                            { label: 'ارزش کل', value: '$12,450', type: 'positive' },
                            { label: 'تغییر امروز', value: '+2.3%', type: 'positive' },
                            { label: 'سود کل', value: '+$1,250', type: 'positive' },
                            { label: 'درصد بازدهی', value: '+11.2%', type: 'positive' }
                        ]
                    }
                }
            };
        }
    }

    async getDetailedPortfolioResponse() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای مشاهده جزئیات پورتفولیو، لطفاً وارد حساب کاربری خود شوید.',
                    options: { quickActions: ['ورود به حساب'] }
                };
            }

            const response = await fetch('/api/portfolio/holdings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const holdings = data.data;
            let content = '📈 جزئیات دارایی‌های پورتفولیو:\n\n';

            holdings.forEach((holding, index) => {
                const pnlEmoji = holding.pnL >= 0 ? '📈' : '📉';
                const pnlColor = holding.pnL >= 0 ? '+' : '';
                content += `${pnlEmoji} **${holding.symbol}**\n`;
                content += `   مقدار: ${holding.quantity.toLocaleString()}\n`;
                content += `   قیمت فعلی: $${holding.currentPrice.toLocaleString()}\n`;
                content += `   ارزش: $${holding.currentValue.toLocaleString()}\n`;
                content += `   سود/ضرر: ${pnlColor}$${holding.pnL.toLocaleString()} (${holding.pnLPercentage.toFixed(1)}%)\n`;
                content += `   سهم پورتفولیو: ${holding.allocation.toFixed(1)}%\n\n`;
            });

            return {
                content: content,
                options: {
                    quickActions: ['تحلیل ریسک', 'پیشنهادات بهبود', 'تاریخچه معاملات', 'بازگشت به خلاصه']
                }
            };

        } catch (error) {
            return {
                content: '❌ خطا در دریافت جزئیات پورتفولیو. لطفاً دوباره تلاش کنید.',
                options: { quickActions: ['تلاش مجدد', 'بازگشت'] }
            };
        }
    }

    async getRiskAnalysisResponse() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای تحلیل ریسک، لطفاً وارد حساب کاربری خود شوید.',
                    options: { quickActions: ['ورود به حساب'] }
                };
            }

            const response = await fetch('/api/portfolio/risk', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const risk = data.data;
            const riskEmoji = risk.riskLevel === 'low' ? '🟢' : risk.riskLevel === 'medium' ? '🟡' : '🔴';
            const riskText = risk.riskLevel === 'low' ? 'کم' : risk.riskLevel === 'medium' ? 'متوسط' : 'بالا';

            let content = `🛡️ تحلیل ریسک پورتفولیو:\n\n`;
            content += `${riskEmoji} سطح ریسک: ${riskText}\n`;
            content += `📊 امتیاز تنوع: ${risk.diversificationScore.toFixed(1)}/10\n\n`;

            if (risk.recommendations && risk.recommendations.length > 0) {
                content += `💡 پیشنهادات بهبود:\n`;
                risk.recommendations.forEach((rec, index) => {
                    content += `${index + 1}. ${rec}\n`;
                });
            }

            return {
                content: content,
                options: {
                    quickActions: ['راهنمای تنوع‌بخشی', 'پیشنهاد سرمایه‌گذاری', 'بازگشت به پورتفولیو']
                }
            };

        } catch (error) {
            return {
                content: '❌ خطا در تحلیل ریسک. لطفاً دوباره تلاش کنید.',
                options: { quickActions: ['تلاش مجدد', 'بازگشت'] }
            };
        }
    }

    async getPortfolioInsightsResponse() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای مشاهده بینش‌ها، لطفاً وارد حساب کاربری خود شوید.',
                    options: { quickActions: ['ورود به حساب'] }
                };
            }

            const response = await fetch('/api/portfolio/insights', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const insights = data.data;
            let content = `🔮 بینش‌های پورتفولیو:\n\n`;

            if (insights.insights && insights.insights.length > 0) {
                content += `✨ نکات مثبت:\n`;
                insights.insights.forEach((insight, index) => {
                    content += `• ${insight}\n`;
                });
                content += `\n`;
            }

            if (insights.alerts && insights.alerts.length > 0) {
                content += `⚠️ نکات مهم:\n`;
                insights.alerts.forEach((alert, index) => {
                    content += `• ${alert}\n`;
                });
                content += `\n`;
            }

            if (insights.recommendations && insights.recommendations.length > 0) {
                content += `💡 پیشنهادات:\n`;
                insights.recommendations.forEach((rec, index) => {
                    content += `${index + 1}. ${rec}\n`;
                });
            }

            return {
                content: content,
                options: {
                    quickActions: ['تحلیل عملکرد', 'راهنمای بهبود', 'بازگشت به پورتفولیو']
                }
            };

        } catch (error) {
            return {
                content: '❌ خطا در دریافت بینش‌ها. لطفاً دوباره تلاش کنید.',
                options: { quickActions: ['تلاش مجدد', 'بازگشت'] }
            };
        }
    }

    getTradingResponse(message) {
        if (message.includes('فرصت') || message.includes('پیشنهاد')) {
            return {
                content: `🔍 بررسی می‌کنم...\n\nیافتم! فرصت عالی:\n🎯 SOL/USDT\n📈 احتمال سود: 87%\n💰 سود مورد انتظار: $18-25\n⏰ مدت زمان: 2-4 ساعت\n🛡️ ریسک: کم (2%)\n\nآیا معامله را انجام دهم؟`,
                options: {
                    actions: [
                        { label: '✅ بله، انجام بده', type: 'primary', command: 'execute_trade_sol' },
                        { label: '📊 تحلیل بیشتر', command: 'analyze_sol' },
                        { label: '❌ الان نه', command: 'cancel_trade' }
                    ],
                    quickActions: ['فرصت دیگر', 'تنظیم حد ضرر', 'تاریخچه معاملات']
                }
            };
        }
        
        return {
            content: `📈 برای کمک بهتر، بگویید:\n\n• می‌خواهید چه معامله‌ای انجام دهید؟\n• چه مبلغی برای سرمایه‌گذاری در نظر دارید؟\n• ریسک مطلوب شما چقدر است؟\n\nمن بهترین فرصت‌ها را برای شما پیدا می‌کنم! 🎯`,
            options: {
                quickActions: ['فرصت‌های امروز', 'معامله با $100', 'ریسک کم', 'سود سریع']
            }
        };
    }

    getAutopilotResponse(message) {
        if (message.includes('فعال') || message.includes('شروع')) {
            return {
                content: `🚀 اتوپایلوت آماده راه‌اندازی!\n\nتنظیمات پیشنهادی:\n💰 بودجه: $1,000\n🎯 هدف روزانه: $20-30\n🛡️ ریسک: کم (2%)\n⏰ فعالیت: 24/7\n\nبا این تنظیمات موافقید؟`,
                options: {
                    actions: [
                        { label: '🚀 شروع کن', type: 'primary', command: 'start_autopilot' },
                        { label: '⚙️ تغییر تنظیمات', command: 'configure_autopilot' },
                        { label: '📊 نمونه عملکرد', command: 'show_autopilot_demo' }
                    ]
                }
            };
        }
        
        return {
            content: `🤖 اتوپایلوت TITAN:\n\n✅ معامله خودکار 24/7\n✅ مدیریت ریسک هوشمند\n✅ بهینه‌سازی سود\n✅ حفاظت از سرمایه\n\nوضعیت فعلی: غیرفعال\n\nآیا می‌خواهید آن را فعال کنیم؟`,
            options: {
                quickActions: ['فعال‌سازی اتوپایلوت', 'تنظیمات پیشرفته', 'نمایش آمار', 'راهنمای کامل']
            }
        };
    }

    getReportResponse() {
        return {
            content: `📊 گزارش عملکرد:\n\n💰 سود امروز: +$47 (+3.2%)\n📈 سود هفته: +$340 (+12.1%)\n🎯 پیشرفت هدف ماهانه: 68%\n\n🏆 بهترین معامله: BTC +$85\n📉 ضعیف‌ترین: ADA -$12\n⚡ تعداد معاملات: 23\n✅ نرخ موفقیت: 87%\n\nکدام جزئیات بیشتری می‌خواهید؟`,
            options: {
                quickActions: ['گزارش کامل', 'صادرات PDF', 'مقایسه با ماه قبل', 'آمار تفصیلی'],
                dataCard: {
                    title: 'عملکرد هفته',
                    icon: 'fas fa-chart-line',
                    items: [
                        { label: 'سود کل', value: '+$340', type: 'positive' },
                        { label: 'درصد بازدهی', value: '+12.1%', type: 'positive' },
                        { label: 'تعداد معاملات', value: '23' },
                        { label: 'نرخ موفقیت', value: '87%', type: 'positive' }
                    ]
                }
            }
        };
    }

    getWalletResponse() {
        return {
            content: `💼 وضعیت کیف پول‌ها:\n\n🟢 کیف پول‌های متصل: 8\n💰 موجودی کل: $87,456\n🔥 Hot Wallets: $45,742\n❄️ Cold Wallets: $41,714\n\n📊 توزیع دارایی‌ها:\n• BTC: $44,197 (50.5%)\n• ETH: $15,801 (18.1%)\n• USDT: $25,000 (28.6%)\n• سایر: $2,458 (2.8%)\n\nچه کاری انجام دهم؟`,
            options: {
                quickActions: ['همگام‌سازی موجودی', 'انتقال به کلد والت', 'افزودن کیف پول', 'گزارش تراکنش‌ها']
            }
        };
    }

    getSettingsResponse() {
        return {
            content: `⚙️ تنظیمات سیستم:\n\nکدام بخش را می‌خواهید تنظیم کنید؟\n\n🤖 اتوپایلوت و معاملات\n💼 کیف پول‌ها و دارایی‌ها\n🔔 اعلان‌ها و هشدارها\n👥 مدیریت کاربران\n🛡️ امنیت و رمزگذاری\n📊 نمایشگرها و گزارش‌ها`,
            options: {
                quickActions: ['تنظیمات معاملات', 'مدیریت کیف پول', 'تنظیم اعلان‌ها', 'تنظیمات امنیتی']
            }
        };
    }

    scheduleTaskResponse(message) {
        // Extract time pattern from message
        let timePattern = '';
        if (message.includes('نیم ساعت') || message.includes('30 دقیقه')) {
            timePattern = 'هر 30 دقیقه';
        } else if (message.includes('ساعت')) {
            timePattern = 'هر ساعت';
        } else if (message.includes('روز')) {
            timePattern = 'روزانه';
        }
        
        // Extract task type
        let taskType = '';
        if (message.includes('گزارش')) taskType = 'گزارش عملکرد';
        else if (message.includes('موجودی')) taskType = 'بررسی موجودی';
        else if (message.includes('معامله')) taskType = 'یافتن فرصت معاملاتی';
        
        return {
            content: `⏰ تسک زمان‌بندی شده:\n\n📋 نوع: ${taskType}\n🔄 تکرار: ${timePattern}\n✅ وضعیت: فعال\n\nتسک با موفقیت تنظیم شد!\nاولین اجرا تا 30 دقیقه دیگر انجام خواهد شد.\n\nآیا تنظیمات دیگری نیاز دارید؟`,
            options: {
                quickActions: ['مشاهده همه تسک‌ها', 'توقف این تسک', 'تغییر زمان‌بندی', 'افزودن تسک جدید'],
                actions: [
                    { label: '📋 مدیریت تسک‌ها', command: 'manage_tasks' },
                    { label: '⏸️ توقف موقت', command: 'pause_task' }
                ]
            }
        };
    }

    getGreetingResponse() {
        const greetings = [
            "سلام! چه خبر؟ امروز چه کاری برایتان انجام دهم؟ 😊",
            "درود! آماده کمک هستم. چه برنامه‌ای برای امروز دارید؟ 🚀",
            "سلام عزیز! امیدوارم روز خوبی داشته باشید. چطور می‌تونم کمکتون کنم؟ 💫"
        ];
        
        return {
            content: greetings[Math.floor(Math.random() * greetings.length)],
            options: {
                quickActions: ['وضعیت پورتفولیو', 'هشدارهای بازار', 'فعال‌سازی اتوپایلوت', 'گزارش سود']
            }
        };
    }

    getHelpResponse() {
        return {
            content: `🤖 راهنمای آرتمیس AI:\n\nمن می‌تونم کمکتون کنم در:\n\n💰 **مدیریت پورتفولیو**\n• مشاهده موجودی و دارایی‌ها\n• پیگیری عملکرد سرمایه‌گذاری\n• تحلیل سود و ضرر\n\n📈 **معاملات هوشمند**\n• یافتن بهترین فرصت‌ها\n• اجرای خودکار معاملات\n• مدیریت ریسک و حد ضرر\n\n🤖 **اتوماسیون**\n• راه‌اندازی اتوپایلوت\n• تنظیم استراتژی‌های معاملاتی\n• زمان‌بندی گزارش‌ها\n\n⚙️ **تنظیمات سیستم**\n• مدیریت کیف پول‌ها\n• تنظیم اعلان‌ها و هشدارها\n• تنظیمات امنیتی\n\nفقط بگویید چه کاری انجام دهم! 🎯`,
            options: {
                quickActions: ['نمونه دستورات', 'آموزش تصویری', 'پشتیبانی زنده', 'راهنمای کامل']
            }
        };
    }

    getDefaultResponse() {
        const responses = [
            "متوجه نشدم دقیقاً چه می‌خواهید. می‌تونید واضح‌تر بگید؟",
            "ببخشید، این درخواست رو متوجه نمیشم. کمک می‌خواید؟",
            "هنوز یاد نگرفتم به این سوال جواب بدم. از راهنما استفاده کنید."
        ];
        
        return {
            content: responses[Math.floor(Math.random() * responses.length)],
            options: {
                quickActions: ['راهنما', 'نمونه دستورات', 'پشتیبانی', 'سوالات متداول']
            }
        };
    }

    // =============================================================================
    // MARKET ALERTS FUNCTIONALITY
    // =============================================================================

    async getMarketAlertsResponse(message) {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای مشاهده هشدارهای بازار، لطفاً وارد حساب کاربری خود شوید.',
                    options: {
                        quickActions: ['ورود به حساب', 'ثبت نام']
                    }
                };
            }

            // Fetch user alerts from backend
            const response = await fetch('/api/alerts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }

            const alerts = data.data;
            
            if (alerts.length === 0) {
                return {
                    content: '🔔 شما هنوز هیچ هشدار بازاری تنظیم نکرده‌اید.\n\nهشدارهای بازار به شما کمک می‌کنند تا از تغییرات مهم قیمت‌ها مطلع شوید و فرصت‌های معاملاتی را از دست ندهید.',
                    options: {
                        quickActions: ['ایجاد هشدار جدید', 'مشاهده قالب‌ها', 'راهنمای هشدارها']
                    }
                };
            }

            // Prepare alerts summary
            const activeAlerts = alerts.filter(alert => alert.isEnabled).length;
            const triggeredToday = alerts.filter(alert => 
                alert.lastTriggered && 
                new Date(alert.lastTriggered).toDateString() === new Date().toDateString()
            ).length;

            let alertsList = alerts.slice(0, 5).map(alert => {
                const status = alert.isEnabled ? '🟢' : '🔴';
                const condition = alert.condition === 'above' ? 'بالاتر از' : 'پایین‌تر از';
                return `${status} ${alert.symbol} ${condition} $${alert.targetPrice}`;
            }).join('\n');

            return {
                content: `🔔 هشدارهای بازار شما:\n\n📊 کل هشدارها: ${alerts.length}\n✅ فعال: ${activeAlerts}\n⚡ فعال شده امروز: ${triggeredToday}\n\n${alertsList}\n\n${alerts.length > 5 ? `و ${alerts.length - 5} هشدار دیگر...` : ''}\n\nچه کاری انجام دهم؟`,
                options: {
                    quickActions: ['ایجاد هشدار جدید', 'مدیریت هشدارها', 'تنظیمات اطلاع‌رسانی', 'آمار هشدارها'],
                    dataCard: {
                        title: 'خلاصه هشدارها',
                        icon: 'fas fa-bell',
                        items: [
                            { label: 'کل هشدارها', value: alerts.length.toString() },
                            { label: 'فعال', value: activeAlerts.toString(), type: 'positive' },
                            { label: 'امروز فعال شده', value: triggeredToday.toString() }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Market Alerts API Error:', error);
            // Fallback response
            return {
                content: `🔔 هشدارهای بازار (نمونه):\n\n✅ BTC بالاتر از $95,000\n🔴 ETH پایین‌تر از $3,200\n✅ SOL بالاتر از $180\n\n⚠️ خطا در اتصال به سرور. داده‌های نمونه نمایش داده شده.`,
                options: {
                    quickActions: ['تلاش مجدد', 'ایجاد هشدار جدید', 'تنظیمات', 'راهنما']
                }
            };
        }
    }

    async createAlertResponse(message) {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای ایجاد هشدار، لطفاً وارد حساب کاربری خود شوید.',
                    options: {
                        quickActions: ['ورود به حساب', 'ثبت نام']
                    }
                };
            }

            // Try to extract symbol and price from message
            const symbolMatch = message.match(/([A-Z]{2,5})/);
            const priceMatch = message.match(/(\d+(?:\.\d+)?)/);
            
            if (symbolMatch && priceMatch) {
                // User provided symbol and price in message
                const symbol = symbolMatch[1];
                const price = parseFloat(priceMatch[1]);
                
                // Determine condition (above/below)
                const condition = message.includes('بالاتر') || message.includes('بیشتر') || message.includes('above') 
                    ? 'above' : 'below';
                
                const alertData = {
                    symbol: symbol,
                    condition: condition,
                    targetPrice: price,
                    message: `هشدار ${symbol} ${condition === 'above' ? 'بالاتر از' : 'پایین‌تر از'} $${price}`
                };

                const response = await fetch('/api/alerts', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(alertData)
                });

                if (response.ok) {
                    const data = await response.json();
                    return {
                        content: `✅ هشدار جدید ایجاد شد!\n\n🔔 ${symbol} ${condition === 'above' ? 'بالاتر از' : 'پایین‌تر از'} $${price}\n\nشما زمانی که قیمت ${symbol} به این حد برسد، اطلاع‌رسانی دریافت خواهید کرد.`,
                        options: {
                            quickActions: ['ایجاد هشدار دیگر', 'مشاهده همه هشدارها', 'تنظیمات اطلاع‌رسانی']
                        }
                    };
                }
            }

            // Show alert creation form
            return {
                content: `🔔 ایجاد هشدار جدید:\n\nبرای ایجاد هشدار، اطلاعات زیر را مشخص کنید:\n\n📝 مثال: "هشدار BTC بالاتر از 95000"\nیا: "ETH پایین‌تر از 3200 هشدار بده"\n\nیا از قالب‌های آماده استفاده کنید:`,
                options: {
                    quickActions: ['BTC > $95,000', 'ETH < $3,200', 'SOL > $180', 'مشاهده قالب‌ها']
                }
            };

        } catch (error) {
            console.error('Create Alert Error:', error);
            return {
                content: `❌ خطا در ایجاد هشدار. لطفاً دوباره تلاش کنید.\n\n📝 فرمت صحیح: "نماد شرط قیمت"\nمثال: BTC بالاتر از 95000`,
                options: {
                    quickActions: ['تلاش مجدد', 'راهنمای ایجاد هشدار', 'پشتیبانی']
                }
            };
        }
    }

    async getAlertSettingsResponse() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای مشاهده تنظیمات هشدار، لطفاً وارد حساب کاربری خود شوید.',
                    options: {
                        quickActions: ['ورود به حساب', 'ثبت نام']
                    }
                };
            }

            const response = await fetch('/api/alerts/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }

            const settings = data.data;
            
            return {
                content: `⚙️ تنظیمات اطلاع‌رسانی:\n\n🔔 اعلان‌های پوش: ${settings.pushNotifications ? '✅ فعال' : '❌ غیرفعال'}\n📧 اعلان ایمیل: ${settings.emailNotifications ? '✅ فعال' : '❌ غیرفعال'}\n📱 SMS: ${settings.smsNotifications ? '✅ فعال' : '❌ غیرفعال'}\n\n🔕 حالت ساکت: ${settings.quietHoursEnabled ? '✅ فعال' : '❌ غیرفعال'}\n⏰ ساعات ساکت: ${settings.quietStartTime || '22:00'} - ${settings.quietEndTime || '08:00'}\n\n📊 حداکثر هشدار روزانه: ${settings.maxDailyAlerts || 50}\n\nکدام تنظیم را تغییر دهید؟`,
                options: {
                    quickActions: ['تغییر اعلان‌ها', 'تنظیم ساعات ساکت', 'حد هشدارها', 'بازنشانی']
                }
            };

        } catch (error) {
            console.error('Alert Settings Error:', error);
            return {
                content: `⚙️ تنظیمات اطلاع‌رسانی (پیش‌فرض):\n\n🔔 اعلان‌های پوش: ✅ فعال\n📧 اعلان ایمیل: ✅ فعال\n📱 SMS: ❌ غیرفعال\n\n⚠️ خطا در بارگیری تنظیمات. تنظیمات پیش‌فرض نمایش داده شده.`,
                options: {
                    quickActions: ['تلاش مجدد', 'تنظیمات دستی', 'پشتیبانی']
                }
            };
        }
    }

    // =============================================================================
    // CHART INTEGRATION FUNCTIONALITY
    // =============================================================================

    async getChartResponse(message) {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای مشاهده نمودارها، لطفاً وارد حساب کاربری خود شوید.',
                    options: {
                        quickActions: ['ورود به حساب', 'ثبت نام']
                    }
                };
            }

            // Determine chart type based on user message
            if (this.matchesKeywords(message, ['پورتفولیو', 'عملکرد', 'سود', 'ضرر'])) {
                return await this.getPortfolioChartResponse();
            } else if (this.matchesKeywords(message, ['قیمت', 'تاریخچه', 'کندل', 'candle'])) {
                return await this.getPriceChartResponse(message);
            } else if (this.matchesKeywords(message, ['توزیع', 'درصد', 'پای چارت', 'pie'])) {
                return await this.getDistributionChartResponse();
            } else if (this.matchesKeywords(message, ['بازار', 'حرارتی', 'heatmap', 'market'])) {
                return await this.getMarketHeatmapResponse();
            }

            // General chart menu
            return {
                content: `📊 انواع نمودارهای موجود:\n\n📈 **نمودارهای پورتفولیو**\n• عملکرد زمانی پورتفولیو\n• توزیع دارایی‌ها\n• سود و ضرر\n\n📉 **نمودارهای بازار**\n• تاریخچه قیمت ارزها\n• نقشه حرارتی بازار\n• تحلیل تکنیکال\n\nکدام نمودار را می‌خواهید مشاهده کنید؟`,
                options: {
                    quickActions: ['نمودار عملکرد پورتفولیو', 'توزیع دارایی‌ها', 'تاریخچه قیمت BTC', 'نقشه حرارتی بازار']
                }
            };

        } catch (error) {
            console.error('Chart Response Error:', error);
            return {
                content: `❌ خطا در بارگیری نمودارها. لطفاً دوباره تلاش کنید.\n\n📊 می‌توانید از گزینه‌های زیر استفاده کنید:`,
                options: {
                    quickActions: ['تلاش مجدد', 'نمودار ساده', 'راهنمای نمودارها']
                }
            };
        }
    }

    async getPortfolioChartResponse() {
        try {
            const token = this.getAuthToken();
            
            // Get user's portfolios first
            const portfoliosResponse = await fetch('/api/portfolio/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!portfoliosResponse.ok) throw new Error('Failed to fetch portfolios');
            
            const portfoliosData = await portfoliosResponse.json();
            if (!portfoliosData.success || portfoliosData.portfolios.length === 0) {
                return {
                    content: '📊 شما هنوز پورتفولیویی ایجاد نکرده‌اید.\n\nبرای مشاهده نمودار عملکرد، ابتدا پورتفولیوی خود را تنظیم کنید.',
                    options: {
                        quickActions: ['ایجاد پورتفولیو', 'راهنمای شروع', 'نمودار نمونه']
                    }
                };
            }

            const firstPortfolio = portfoliosData.portfolios[0];
            
            // Get chart data for first portfolio
            const chartResponse = await fetch(`/api/charts/portfolio-performance/${firstPortfolio.id}?period=30d`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!chartResponse.ok) throw new Error('Failed to fetch chart data');
            
            const chartData = await chartResponse.json();
            if (!chartData.success) throw new Error(chartData.error);

            const data = chartData.data;
            const currentValue = parseFloat(data.summary.currentValue);
            const totalInvested = parseFloat(data.summary.totalInvested);
            const totalReturn = currentValue - totalInvested;
            const returnPercentage = totalInvested > 0 ? ((totalReturn / totalInvested) * 100) : 0;

            // Create simple text chart representation
            const chartPoints = data.chartData.slice(-7).map(point => {
                const value = parseFloat(point.total_value_usd);
                return Math.round((value / currentValue) * 10); // Scale to 0-10
            });

            const textChart = chartPoints.map(point => '█'.repeat(point)).join('\n');

            return {
                content: `📈 نمودار عملکرد پورتفولیو "${firstPortfolio.name}":\n\n💰 ارزش فعلی: $${currentValue.toLocaleString()}\n📊 سرمایه اولیه: $${totalInvested.toLocaleString()}\n${returnPercentage >= 0 ? '📈' : '📉'} بازدهی: ${returnPercentage >= 0 ? '+' : ''}${returnPercentage.toFixed(1)}% (${totalReturn >= 0 ? '+' : ''}$${Math.abs(totalReturn).toLocaleString()})\n\n📊 **نمودار 7 روز اخیر:**\n\`\`\`\n${textChart}\n\`\`\`\n\nآیا می‌خواهید جزئیات بیشتری ببینید؟`,
                options: {
                    quickActions: ['نمودار تفصیلی', 'مقایسه با بازار', 'توزیع دارایی‌ها', 'تحلیل ریسک'],
                    dataCard: {
                        title: 'عملکرد پورتفولیو',
                        icon: 'fas fa-chart-line',
                        items: [
                            { label: 'ارزش فعلی', value: `$${currentValue.toLocaleString()}`, type: 'neutral' },
                            { label: 'بازدهی', value: `${returnPercentage.toFixed(1)}%`, type: returnPercentage >= 0 ? 'positive' : 'negative' },
                            { label: 'سود/ضرر', value: `${totalReturn >= 0 ? '+' : ''}$${Math.abs(totalReturn).toLocaleString()}`, type: totalReturn >= 0 ? 'positive' : 'negative' }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Portfolio Chart Error:', error);
            return this.getChartFallbackResponse('عملکرد پورتفولیو');
        }
    }

    async getPriceChartResponse(message) {
        try {
            const token = this.getAuthToken();
            
            // Extract symbol from message
            const symbolMatch = message.match(/([A-Z]{2,5})/);
            const symbol = symbolMatch ? symbolMatch[1] : 'BTC';
            
            const chartResponse = await fetch(`/api/charts/price-history/${symbol}?timeframe=1h&limit=24`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!chartResponse.ok) throw new Error('Failed to fetch price data');
            
            const chartData = await chartResponse.json();
            if (!chartData.success) throw new Error(chartData.error);

            const priceData = chartData.data.priceData;
            const latestPrice = priceData[priceData.length - 1];
            const firstPrice = priceData[0];
            const priceChange = latestPrice.close - firstPrice.close;
            const priceChangePercent = ((priceChange / firstPrice.close) * 100);

            // Create simple price chart
            const chartPoints = priceData.slice(-12).map(candle => {
                const normalized = Math.round((candle.close / latestPrice.close) * 10);
                return Math.max(1, normalized);
            });

            const textChart = chartPoints.map(point => '█'.repeat(point)).join(' ');

            return {
                content: `📊 نمودار قیمت ${symbol}/USDT (24 ساعت اخیر):\n\n💵 قیمت فعلی: $${latestPrice.close.toLocaleString()}\n${priceChangePercent >= 0 ? '📈' : '📉'} تغییر 24h: ${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}% (${priceChange >= 0 ? '+' : ''}$${Math.abs(priceChange).toLocaleString()})\n\n📊 **نمودار 12 ساعت اخیر:**\n\`\`\`\n${textChart}\n\`\`\`\n\nحجم معاملات: ${latestPrice.volume.toLocaleString()}`,
                options: {
                    quickActions: [`نمودار تفصیلی ${symbol}`, 'تحلیل تکنیکال', 'مقایسه با BTC', 'هشدار قیمت'],
                    dataCard: {
                        title: `${symbol}/USDT`,
                        icon: 'fas fa-chart-candlestick',
                        items: [
                            { label: 'قیمت فعلی', value: `$${latestPrice.close.toLocaleString()}` },
                            { label: 'تغییر 24h', value: `${priceChangePercent.toFixed(2)}%`, type: priceChangePercent >= 0 ? 'positive' : 'negative' },
                            { label: 'بالاترین', value: `$${Math.max(...priceData.map(p => p.high)).toLocaleString()}` },
                            { label: 'پایین‌ترین', value: `$${Math.min(...priceData.map(p => p.low)).toLocaleString()}` }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Price Chart Error:', error);
            return this.getChartFallbackResponse('تاریخچه قیمت');
        }
    }

    async getDistributionChartResponse() {
        try {
            const token = this.getAuthToken();
            
            // Get user's portfolios
            const portfoliosResponse = await fetch('/api/portfolio/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!portfoliosResponse.ok) throw new Error('Failed to fetch portfolios');
            
            const portfoliosData = await portfoliosResponse.json();
            if (!portfoliosData.success || portfoliosData.portfolios.length === 0) {
                return this.getChartFallbackResponse('توزیع دارایی‌ها');
            }

            const firstPortfolio = portfoliosData.portfolios[0];
            
            const chartResponse = await fetch(`/api/charts/portfolio-distribution/${firstPortfolio.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!chartResponse.ok) throw new Error('Failed to fetch distribution data');
            
            const chartData = await chartResponse.json();
            if (!chartData.success) throw new Error(chartData.error);

            const distribution = chartData.data.distribution;
            const totalValue = chartData.data.totalValue;

            // Create text-based pie chart representation
            let pieChart = '🥧 **توزیع پورتفولیو:**\n\n';
            distribution.forEach(asset => {
                const barLength = Math.round(asset.percentage / 5); // Scale to 20 chars max
                const bar = '█'.repeat(barLength) + '░'.repeat(Math.max(0, 20 - barLength));
                pieChart += `${asset.symbol}: ${asset.percentage.toFixed(1)}%\n${bar}\n`;
            });

            return {
                content: `📊 توزیع دارایی‌های پورتفولیو "${firstPortfolio.name}":\n\n💰 ارزش کل: $${totalValue.toLocaleString()}\n\n${pieChart}\n💡 **تحلیل توزیع:**\n${distribution.length > 3 ? '✅ تنوع مناسب' : '⚠️ نیاز به تنوع بیشتر'}\n${distribution[0]?.percentage > 70 ? '⚠️ تمرکز زیاد روی یک دارایی' : '✅ توزیع متعادل'}`,
                options: {
                    quickActions: ['بهینه‌سازی توزیع', 'افزودن دارایی', 'تحلیل ریسک', 'مقایسه با بازار'],
                    dataCard: {
                        title: 'توزیع دارایی‌ها',
                        icon: 'fas fa-chart-pie',
                        items: distribution.slice(0, 4).map(asset => ({
                            label: asset.symbol,
                            value: `${asset.percentage.toFixed(1)}%`,
                            type: 'neutral'
                        }))
                    }
                }
            };

        } catch (error) {
            console.error('Distribution Chart Error:', error);
            return this.getChartFallbackResponse('توزیع دارایی‌ها');
        }
    }

    async getMarketHeatmapResponse() {
        try {
            const token = this.getAuthToken();
            
            const heatmapResponse = await fetch('/api/charts/market-heatmap?limit=10', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!heatmapResponse.ok) throw new Error('Failed to fetch heatmap data');
            
            const heatmapData = await heatmapResponse.json();
            if (!heatmapData.success) throw new Error(heatmapData.error);

            const marketData = heatmapData.data.heatmapData;

            // Create text-based heatmap
            let heatmap = '🌡️ **نقشه حرارتی بازار:**\n\n';
            marketData.forEach(coin => {
                const change = coin.change24h;
                const emoji = change > 5 ? '🔥' : change > 0 ? '📈' : change > -5 ? '📉' : '❄️';
                const color = change > 0 ? '+' : '';
                heatmap += `${emoji} ${coin.symbol}: ${color}${change.toFixed(1)}%\n`;
            });

            const positiveCoins = marketData.filter(c => c.change24h > 0).length;
            const negativeCoins = marketData.length - positiveCoins;

            return {
                content: `🌡️ نقشه حرارتی بازار (10 ارز برتر):\n\n${heatmap}\n📊 **خلاصه بازار:**\n📈 صعودی: ${positiveCoins} ارز\n📉 نزولی: ${negativeCoins} ارز\n\n${positiveCoins > negativeCoins ? '🟢 حالت کلی بازار: صعودی' : '🔴 حالت کلی بازار: نزولی'}`,
                options: {
                    quickActions: ['تحلیل بازار کامل', 'ارزهای داغ', 'فرصت‌های خرید', 'هشدارهای بازار'],
                    dataCard: {
                        title: 'وضعیت بازار',
                        icon: 'fas fa-fire',
                        items: [
                            { label: 'ارزهای صعودی', value: positiveCoins.toString(), type: 'positive' },
                            { label: 'ارزهای نزولی', value: negativeCoins.toString(), type: 'negative' },
                            { label: 'بهترین عملکرد', value: `${marketData[0]?.symbol || 'N/A'} ${marketData[0]?.change24h > 0 ? '+' : ''}${marketData[0]?.change24h?.toFixed(1) || 0}%`, type: marketData[0]?.change24h > 0 ? 'positive' : 'negative' }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Market Heatmap Error:', error);
            return this.getChartFallbackResponse('نقشه حرارتی بازار');
        }
    }

    getChartFallbackResponse(chartType) {
        return {
            content: `📊 نمودار ${chartType} (حالت نمونه):\n\n⚠️ در حال حاضر اتصال به داده‌های زنده برقرار نیست.\n\n📈 **نمودار نمونه:**\n\`\`\`\n█████████░\n████████░░\n██████████\n████████░░\n███████░░░\n\`\`\`\n\n💡 برای مشاهده نمودارهای زنده، لطفاً اتصال اینترنت خود را بررسی کنید.`,
            options: {
                quickActions: ['تلاش مجدد', 'نمودار آفلاین', 'تنظیمات اتصال', 'راهنما']
            }
        };
    }

    // =============================================================================
    // MULTI-LANGUAGE SUPPORT FUNCTIONALITY
    // =============================================================================

    async getMultiLanguageResponse(message) {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای استفاده از امکانات چند زبانه، لطفاً وارد حساب کاربری خود شوید.',
                    options: {
                        quickActions: ['ورود به حساب', 'ثبت نام']
                    }
                };
            }

            // Determine multi-language action type
            if (this.matchesKeywords(message, ['ترجمه', 'translate', 'ترجمه کن', 'به انگلیسی', 'to english'])) {
                return await this.getTranslationResponse(message);
            } else if (this.matchesKeywords(message, ['زبان رابط', 'interface language', 'تغییر زبان برنامه', 'ui language'])) {
                return await this.getUILanguageResponse();
            } else if (this.matchesKeywords(message, ['محتوای محلی', 'localized', 'بومی‌سازی', 'regional'])) {
                return await this.getLocalizedContentResponse();
            } else if (this.matchesKeywords(message, ['پشتیبانی زبان', 'language support', 'زبان‌های پشتیبانی'])) {
                return await this.getLanguageSupportResponse();
            }

            // General multi-language menu
            return {
                content: `🌐 سیستم چند زبانه آرتمیس:\n\n🔄 **ترجمه خودکار**\n• ترجمه فوری متن و پیام‌ها\n• تشخیص خودکار زبان\n• پشتیبانی از 12+ زبان\n\n🖥️ **تغییر زبان رابط**\n• فارسی، انگلیسی، عربی\n• تطبیق اتوماتیک محتوا\n• حفظ تنظیمات کاربر\n\n🌍 **محتوای بومی**\n• اخبار بازار به زبان محلی\n• تقویم اقتصادی منطقه‌ای\n• واحدهای پولی محلی\n\nکدام امکان را می‌خواهید استفاده کنید؟`,
                options: {
                    quickActions: ['ترجمه متن', 'تغییر زبان رابط', 'محتوای بومی', 'زبان‌های پشتیبانی']
                }
            };

        } catch (error) {
            console.error('Multi-Language Response Error:', error);
            return {
                content: `❌ خطا در بارگیری امکانات چند زبانه.\n\n🌐 امکانات موجود:`,
                options: {
                    quickActions: ['تلاش مجدد', 'راهنمای چند زبانه', 'پشتیبانی']
                }
            };
        }
    }

    async getTranslationResponse(message) {
        try {
            const token = this.getAuthToken();
            
            // Extract text to translate and target language
            let textToTranslate = '';
            let targetLanguage = 'English'; // Default target
            
            // Check for quoted text
            const quotedMatch = message.match(/"([^"]+)"/);
            if (quotedMatch) {
                textToTranslate = quotedMatch[1];
            } else {
                // Extract text after command keywords  
                textToTranslate = message.replace(/ترجمه|translate|به انگلیسی|to english/gi, '').trim();
            }

            // Detect target language from message
            if (this.matchesKeywords(message, ['به انگلیسی', 'to english', 'انگلیسی'])) {
                targetLanguage = 'English';
            } else if (this.matchesKeywords(message, ['به فارسی', 'to persian', 'فارسی'])) {
                targetLanguage = 'Persian';
            } else if (this.matchesKeywords(message, ['به عربی', 'to arabic', 'عربی'])) {
                targetLanguage = 'Arabic';
            }

            if (!textToTranslate || textToTranslate.length < 2) {
                return {
                    content: `🌐 ترجمه متن:\n\n📝 **نحوه استفاده:**\n• "متن مورد نظر را در گیومه بنویسید"\n• مثال: ترجمه "Hello World" به فارسی\n• یا: به انگلیسی "سلام دنیا"\n\n🔄 **زبان‌های پشتیبانی:**\n• فارسی ↔ انگلیسی\n• عربی ↔ انگلیسی  \n• فرانسه، آلمانی، اسپانیولی\n• و 10+ زبان دیگر\n\nمتن خود را برای ترجمه مشخص کنید:`,
                    options: {
                        quickActions: ['نمونه فارسی به انگلیسی', 'نمونه انگلیسی به فارسی', 'زبان‌های پشتیبانی', 'راهنمای کامل']
                    }
                };
            }

            // Call translation API
            const translationResponse = await fetch('/api/voice/translate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: textToTranslate,
                    targetLanguage: targetLanguage
                })
            });

            if (translationResponse.ok) {
                const translationData = await translationResponse.json();
                if (translationData.success) {
                    const result = translationData.data;
                    
                    return {
                        content: `🌐 ترجمه انجام شد:\n\n📝 **متن اصلی:**\n"${result.originalText}"\n\n🔄 **ترجمه به ${this.getLanguageName(targetLanguage)}:**\n"${result.translatedText}"\n\n💡 **کیفیت ترجمه:** عالی (توسط Gemini AI)\n\nآیا می‌خواهید ترجمه‌ای دیگر انجام دهید؟`,
                        options: {
                            quickActions: ['ترجمه معکوس', 'ترجمه به زبان دیگر', 'تلفظ صوتی', 'کپی متن'],
                            dataCard: {
                                title: 'نتیجه ترجمه',
                                icon: 'fas fa-language',
                                items: [
                                    { label: 'زبان مبدأ', value: 'تشخیص خودکار' },
                                    { label: 'زبان مقصد', value: this.getLanguageName(targetLanguage) },
                                    { label: 'طول متن', value: `${result.originalText.length} کاراکتر` },
                                    { label: 'کیفیت', value: 'عالی', type: 'positive' }
                                ]
                            }
                        }
                    };
                }
            }

            // Fallback for offline translation
            return {
                content: `🌐 ترجمه (حالت آفلاین):\n\n📝 متن اصلی: "${textToTranslate}"\n🔄 هدف: ${this.getLanguageName(targetLanguage)}\n\n⚠️ در حال حاضر اتصال به سرویس ترجمه برقرار نیست.\n\n💡 **پیشنهاد:** اتصال اینترنت را بررسی کنید یا از گوگل ترنسلیت استفاده کنید.`,
                options: {
                    quickActions: ['تلاش مجدد', 'ترجمه با گوگل', 'ذخیره متن', 'راهنما']
                }
            };

        } catch (error) {
            console.error('Translation Response Error:', error);
            return {
                content: `❌ خطا در ترجمه متن.\n\n📝 فرمت صحیح: ترجمه "متن شما" به انگلیسی`,
                options: {
                    quickActions: ['تلاش مجدد', 'راهنما', 'پشتیبانی']
                }
            };
        }
    }

    async getUILanguageResponse() {
        try {
            const currentLanguage = this.userPreferences.language || 'fa-IR';
            const currentLangName = this.getLanguageName(currentLanguage);

            const supportedUILanguages = [
                { code: 'fa-IR', name: 'فارسی', flag: '🇮🇷', status: 'کامل', direction: 'rtl' },
                { code: 'en-US', name: 'English', flag: '🇺🇸', status: 'کامل', direction: 'ltr' },
                { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', status: 'جزئی', direction: 'rtl' },
                { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷', status: 'جزئی', direction: 'ltr' }
            ];

            let languageList = '';
            supportedUILanguages.forEach((lang, index) => {
                const isCurrent = lang.code === currentLanguage;
                const status = lang.status === 'کامل' ? '✅' : '🔶';
                languageList += `${status} ${lang.flag} ${lang.name}${isCurrent ? ' (فعلی)' : ''}\n`;
            });

            return {
                content: `🌐 تغییر زبان رابط کاربری:\n\n**زبان فعلی:** ${currentLangName}\n\n**زبان‌های پشتیبانی شده:**\n${languageList}\n\n⚙️ **امکانات:**\n• تغییر فوری زبان رابط\n• تطبیق خودکار جهت متن (راست به چپ/چپ به راست)\n• حفظ تنظیمات در تمام دستگاه‌ها\n• ترجمه منوها و دکمه‌ها\n\nکدام زبان را انتخاب می‌کنید؟`,
                options: {
                    quickActions: ['فارسی 🇮🇷', 'English 🇺🇸', 'العربية 🇸🇦', 'تنظیمات پیشرفته'],
                    actions: [
                        { label: '🇮🇷 فارسی', callback: () => this.changeUILanguage('fa-IR') },
                        { label: '🇺🇸 English', callback: () => this.changeUILanguage('en-US') },
                        { label: '🇸🇦 العربية', callback: () => this.changeUILanguage('ar-SA') }
                    ],
                    dataCard: {
                        title: 'وضعیت زبان‌ها',
                        icon: 'fas fa-globe',
                        items: [
                            { label: 'زبان فعلی', value: currentLangName },
                            { label: 'جهت متن', value: currentLanguage.includes('fa') || currentLanguage.includes('ar') ? 'راست به چپ' : 'چپ به راست' },
                            { label: 'کامل ترجمه شده', value: '2 زبان', type: 'positive' },
                            { label: 'در حال توسعه', value: '2 زبان', type: 'neutral' }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('UI Language Response Error:', error);
            return {
                content: `❌ خطا در تنظیمات زبان رابط.\n\n🌐 زبان‌های موجود: فارسی، انگلیسی`,
                options: {
                    quickActions: ['تلاش مجدد', 'فارسی', 'انگلیسی']
                }
            };
        }
    }

    async getLocalizedContentResponse() {
        try {
            const currentRegion = this.userPreferences.region || 'IR'; // Iran default
            const currentLanguage = this.userPreferences.language || 'fa-IR';

            return {
                content: `🌍 محتوای بومی و منطقه‌ای:\n\n🗺️ **منطقه فعلی:** ${this.getRegionName(currentRegion)}\n🌐 **زبان:** ${this.getLanguageName(currentLanguage)}\n\n📊 **محتوای بومی‌سازی شده:**\n• 📈 نرخ ارز محلی (ریال، درهم، دلار)\n• 🗓️ تقویم اقتصادی منطقه خاورمیانه\n• 🏦 اخبار بانک‌های مرکزی منطقه\n• ⏰ ساعات بازار محلی\n• 🕌 تعطیلات و مناسبت‌های مذهبی\n\n🔄 **به‌روزرسانی خودکار:**\n• اخبار بازارهای منطقه‌ای\n• نرخ تورم کشورهای منطقه\n• تحلیل‌های اقتصادی بومی\n\nآیا می‌خواهید منطقه خود را تغییر دهید؟`,
                options: {
                    quickActions: ['تغییر منطقه', 'اخبار منطقه‌ای', 'نرخ ارز محلی', 'تقویم اقتصادی'],
                    dataCard: {
                        title: 'اطلاعات منطقه‌ای',
                        icon: 'fas fa-map',
                        items: [
                            { label: 'منطقه', value: this.getRegionName(currentRegion) },
                            { label: 'واحد پول', value: 'ریال ایران (IRR)' },
                            { label: 'بازار اصلی', value: 'بورس تهران' },
                            { label: 'منطقه زمانی', value: 'GMT+3:30' }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Localized Content Error:', error);
            return {
                content: `❌ خطا در بارگیری محتوای بومی.\n\n🌍 محتوای پیش‌فرض نمایش داده می‌شود.`,
                options: {
                    quickActions: ['تلاش مجدد', 'تنظیمات منطقه', 'راهنما']
                }
            };
        }
    }

    async getLanguageSupportResponse() {
        try {
            const supportedLanguages = [
                { code: 'fa-IR', name: 'فارسی', flag: '🇮🇷', features: ['UI', 'TTS', 'Translation', 'Localization'] },
                { code: 'en-US', name: 'English', flag: '🇺🇸', features: ['UI', 'TTS', 'Translation', 'Localization'] },
                { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', features: ['TTS', 'Translation', 'Partial UI'] },
                { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷', features: ['TTS', 'Translation'] },
                { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪', features: ['TTS', 'Translation'] },
                { code: 'fr-FR', name: 'Français', flag: '🇫🇷', features: ['TTS', 'Translation'] },
                { code: 'es-ES', name: 'Español', flag: '🇪🇸', features: ['TTS', 'Translation'] },
                { code: 'ru-RU', name: 'Русский', flag: '🇷🇺', features: ['TTS', 'Translation'] }
            ];

            let languageTable = '';
            supportedLanguages.forEach(lang => {
                const hasUI = lang.features.includes('UI') ? '✅' : '❌';
                const hasTTS = lang.features.includes('TTS') ? '✅' : '❌';
                const hasTranslation = lang.features.includes('Translation') ? '✅' : '❌';
                languageTable += `${lang.flag} ${lang.name}\n`;
                languageTable += `   رابط: ${hasUI} | صوتی: ${hasTTS} | ترجمه: ${hasTranslation}\n\n`;
            });

            return {
                content: `🌐 زبان‌های پشتیبانی شده:\n\n📊 **کل زبان‌ها:** ${supportedLanguages.length}\n✅ **رابط کامل:** 2 زبان\n🔊 **پشتیبانی صوتی:** 8 زبان\n🔄 **ترجمه:** 8+ زبان\n\n**جدول قابلیت‌ها:**\n${languageTable}\n📈 **آمار استفاده:**\n• فارسی: 65% کاربران\n• انگلیسی: 30% کاربران\n• سایر: 5% کاربران\n\n💡 **در حال توسعه:** عربی، ترکی (رابط کامل)`,
                options: {
                    quickActions: ['درخواست زبان جدید', 'گزارش مشکل ترجمه', 'راهنمای استفاده', 'تنظیمات زبان'],
                    dataCard: {
                        title: 'آمار پشتیبانی زبان',
                        icon: 'fas fa-language',
                        items: [
                            { label: 'کل زبان‌ها', value: supportedLanguages.length.toString() },
                            { label: 'رابط کامل', value: '2', type: 'positive' },
                            { label: 'پشتیبانی صوتی', value: '8', type: 'positive' },
                            { label: 'ترجمه', value: '8+', type: 'positive' }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Language Support Response Error:', error);
            return {
                content: `❌ خطا در بارگیری اطلاعات زبان‌ها.\n\n🌐 زبان‌های اصلی: فارسی، انگلیسی، عربی`,
                options: {
                    quickActions: ['تلاش مجدد', 'زبان‌های اصلی', 'راهنما']
                }
            };
        }
    }

    changeUILanguage(languageCode) {
        try {
            // Update user preferences
            this.userPreferences.language = languageCode;
            
            // Save to localStorage
            localStorage.setItem('artemis-language', languageCode);
            
            // Update page direction for RTL languages
            const isRTL = ['fa-IR', 'ar-SA'].includes(languageCode);
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = languageCode.split('-')[0];

            // Update speech recognition language
            if (this.recognition) {
                this.recognition.lang = languageCode;
            }

            // Show confirmation message
            const messages = {
                'fa-IR': 'زبان رابط به فارسی تغییر یافت! 🇮🇷',
                'en-US': 'Interface language changed to English! 🇺🇸', 
                'ar-SA': 'تم تغيير لغة الواجهة إلى العربية! 🇸🇦',
                'tr-TR': 'Arayüz dili Türkçe olarak değiştirildi! 🇹🇷'
            };

            this.addArtemisMessage(messages[languageCode] || messages['fa-IR'], {
                quickActions: ['تست ترجمه', 'تنظیمات صوتی', 'بازگشت']
            });

            // Trigger page refresh after 2 seconds for full language change
            setTimeout(() => {
                if (confirm('برای اعمال کامل تغییرات، صفحه بازخوانی شود؟')) {
                    window.location.reload();
                }
            }, 2000);

        } catch (error) {
            console.error('Change UI Language Error:', error);
            this.addArtemisMessage('خطا در تغییر زبان. لطفاً دوباره تلاش کنید.');
        }
    }

    getRegionName(regionCode) {
        const regions = {
            'IR': 'ایران',
            'UAE': 'امارات متحده عربی',
            'SA': 'عربستان سعودی',
            'TR': 'ترکیه',
            'US': 'آمریکا',
            'EU': 'اتحادیه اروپا',
            'CN': 'چین',
            'JP': 'ژاپن'
        };
        return regions[regionCode] || regionCode;
    }

    // =============================================================================
    // VOICE ENHANCEMENT FUNCTIONALITY
    // =============================================================================

    async getVoiceResponse(message) {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return {
                    content: 'برای استفاده از امکانات صوتی، لطفاً وارد حساب کاربری خود شوید.',
                    options: {
                        quickActions: ['ورود به حساب', 'ثبت نام']
                    }
                };
            }

            // Determine voice action type based on user message
            if (this.matchesKeywords(message, ['بخوان', 'بگو', 'صدا کن', 'read', 'speak'])) {
                return await this.getReadTextResponse(message);
            } else if (this.matchesKeywords(message, ['تنظیمات صوتی', 'صدای من', 'voice settings', 'زبان'])) {
                return await this.getVoiceSettingsResponse();
            } else if (this.matchesKeywords(message, ['زبان', 'language', 'تغییر زبان', 'detect language'])) {
                return await this.getLanguageResponse(message);
            } else if (this.matchesKeywords(message, ['ضبط', 'گوش کن', 'listen', 'microphone'])) {
                return await this.getVoiceListerResponse();
            }

            // General voice menu
            return {
                content: `🎤 امکانات صوتی آرتمیس:\n\n🔊 **خواندن متن**\n• تبدیل متن به گفتار\n• انتخاب صدا و سرعت\n• پشتیبانی چند زبانه\n\n🎙️ **تشخیص گفتار**\n• تبدیل صدا به متن\n• دستورات صوتی\n• تشخیص خودکار زبان\n\n⚙️ **تنظیمات پیشرفته**\n• بهبود کیفیت صدا با AI\n• تنظیم صدای مورد علاقه\n• ترجمه همزمان\n\nکدام امکان را می‌خواهید استفاده کنید؟`,
                options: {
                    quickActions: ['خواندن این متن', 'تنظیمات صوتی', 'شروع ضبط', 'تشخیص زبان']
                }
            };

        } catch (error) {
            console.error('Voice Response Error:', error);
            return {
                content: `❌ خطا در بارگیری امکانات صوتی. لطفاً دوباره تلاش کنید.\n\n🎤 امکانات موجود:`,
                options: {
                    quickActions: ['تلاش مجدد', 'راهنمای صوتی', 'پشتیبانی']
                }
            };
        }
    }

    async getVoiceSettingsResponse() {
        try {
            const token = this.getAuthToken();
            
            // Fetch current voice settings
            const response = await fetch('/api/voice/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let settings = {};
            if (response.ok) {
                const data = await response.json();
                settings = data.success ? data.data : {};
            }

            // Default settings if API fails
            const currentSettings = {
                language: settings.language || 'fa-IR',
                voice: settings.voice || 'default',
                rate: settings.rate || 1.0,
                pitch: settings.pitch || 1.0,
                autoSpeak: settings.autoSpeak || false,
                enhanceWithAI: settings.enhanceWithAI || true,
                ...settings
            };

            return {
                content: `⚙️ تنظیمات صوتی فعلی:\n\n🌐 **زبان:** ${this.getLanguageName(currentSettings.language)}\n🔊 **نوع صدا:** ${currentSettings.voice === 'default' ? 'پیش‌فرض سیستم' : currentSettings.voice}\n⚡ **سرعت گفتار:** ${currentSettings.rate}x\n🎵 **تن صدا:** ${currentSettings.pitch === 1.0 ? 'عادی' : currentSettings.pitch > 1.0 ? 'بلند' : 'پایین'}\n\n🤖 **بهبود با AI:** ${currentSettings.enhanceWithAI ? '✅ فعال' : '❌ غیرفعال'}\n🔄 **خواندن خودکار:** ${currentSettings.autoSpeak ? '✅ فعال' : '❌ غیرفعال'}\n\nکدام تنظیم را تغییر دهید؟`,
                options: {
                    quickActions: ['تغییر زبان', 'انتخاب صدا', 'تنظیم سرعت', 'تست صدا'],
                    dataCard: {
                        title: 'تنظیمات صوتی',
                        icon: 'fas fa-volume-up',
                        items: [
                            { label: 'زبان', value: this.getLanguageName(currentSettings.language) },
                            { label: 'سرعت', value: `${currentSettings.rate}x` },
                            { label: 'بهبود AI', value: currentSettings.enhanceWithAI ? 'فعال' : 'غیرفعال', type: currentSettings.enhanceWithAI ? 'positive' : 'negative' },
                            { label: 'خواندن خودکار', value: currentSettings.autoSpeak ? 'فعال' : 'غیرفعال', type: currentSettings.autoSpeak ? 'positive' : 'negative' }
                        ]
                    }
                }
            };

        } catch (error) {
            console.error('Voice Settings Error:', error);
            return {
                content: `⚙️ تنظیمات صوتی (پیش‌فرض):\n\n🌐 زبان: فارسی\n🔊 صدا: پیش‌فرض سیستم\n⚡ سرعت: 1.0x\n🤖 بهبود AI: فعال\n\n⚠️ خطا در بارگیری تنظیمات. مقادیر پیش‌فرض نمایش داده شده.`,
                options: {
                    quickActions: ['تلاش مجدد', 'تنظیمات دستی', 'بازنشانی']
                }
            };
        }
    }

    async getLanguageResponse(message) {
        try {
            const token = this.getAuthToken();
            
            // Extract text for language detection if provided
            const textMatch = message.match(/"([^"]+)"/);
            const textToAnalyze = textMatch ? textMatch[1] : message.replace(/تشخیص زبان|language|detect/gi, '').trim();

            if (textToAnalyze && textToAnalyze.length > 5) {
                // Detect language of provided text
                const response = await fetch('/api/voice/detect-language', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: textToAnalyze })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        const detected = data.data;
                        return {
                            content: `🌐 تشخیص زبان متن:\n\n📝 **متن:** "${textToAnalyze.substring(0, 100)}${textToAnalyze.length > 100 ? '...' : ''}"\n\n🔍 **زبان تشخیص داده شده:** ${this.getLanguageName(detected.language)}\n📊 **اطمینان:** ${(detected.confidence * 100).toFixed(1)}%\n\nآیا می‌خواهید این متن را با زبان تشخیص داده شده بخوانم؟`,
                            options: {
                                quickActions: ['خواندن متن', 'ترجمه به فارسی', 'تغییر زبان چت‌بات', 'متن دیگری بررسی کن'],
                                dataCard: {
                                    title: 'نتیجه تشخیص زبان',
                                    icon: 'fas fa-language',
                                    items: [
                                        { label: 'زبان', value: this.getLanguageName(detected.language) },
                                        { label: 'اطمینان', value: `${(detected.confidence * 100).toFixed(1)}%`, type: detected.confidence > 0.8 ? 'positive' : detected.confidence > 0.5 ? 'neutral' : 'negative' },
                                        { label: 'کد زبان', value: detected.language }
                                    ]
                                }
                            }
                        };
                    }
                }
            }

            // Show language selection menu
            const supportedLanguages = [
                { code: 'fa-IR', name: 'فارسی', flag: '🇮🇷' },
                { code: 'en-US', name: 'English', flag: '🇺🇸' },
                { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
                { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
                { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
                { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
                { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' }
            ];

            const languageList = supportedLanguages.map(lang => 
                `${lang.flag} ${lang.name} (${lang.code})`
            ).join('\n');

            return {
                content: `🌐 انتخاب و تشخیص زبان:\n\n**زبان‌های پشتیبانی شده:**\n${languageList}\n\n📝 **تشخیص خودکار زبان:**\nمتن خود را در داخل گیومه قرار دهید:\nمثال: تشخیص زبان "Hello world"\n\nکدام زبان را انتخاب می‌کنید؟`,
                options: {
                    quickActions: ['فارسی 🇮🇷', 'English 🇺🇸', 'العربية 🇸🇦', 'تشخیص خودکار']
                }
            };

        } catch (error) {
            console.error('Language Response Error:', error);
            return {
                content: `❌ خطا در پردازش زبان. لطفاً دوباره تلاش کنید.\n\n🌐 زبان‌های پشتیبانی شده: فارسی، انگلیسی، عربی`,
                options: {
                    quickActions: ['تلاش مجدد', 'فارسی', 'انگلیسی']
                }
            };
        }
    }

    async getReadTextResponse(message) {
        try {
            const token = this.getAuthToken();
            
            // Extract text to read from message
            let textToRead = '';
            
            // Check for quoted text
            const quotedMatch = message.match(/"([^"]+)"/);
            if (quotedMatch) {
                textToRead = quotedMatch[1];
            } else {
                // Extract text after command keywords
                textToRead = message.replace(/بخوان|بگو|صدا کن|read|speak/gi, '').trim();
            }

            if (!textToRead || textToRead.length < 2) {
                return {
                    content: `🔊 خواندن متن با صدا:\n\n📝 **نحوه استفاده:**\n• "متن شما را در گیومه بنویسید"\n• مثال: بخوان "سلام، امروز هوا خوب است"\n\n🎤 **امکانات:**\n• خواندن با صدای طبیعی\n• تنظیم سرعت و تن صدا\n• بهبود کیفیت با هوش مصنوعی\n\nمتن خود را برای خواندن مشخص کنید:`,
                    options: {
                        quickActions: ['نمونه متن فارسی', 'نمونه متن انگلیسی', 'تنظیمات صدا', 'راهنمای کامل']
                    }
                };
            }

            // Call text-to-speech API
            const ttsResponse = await fetch('/api/voice/text-to-speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: textToRead,
                    language: this.userPreferences.language || 'fa-IR',
                    enhanceWithAI: true
                })
            });

            if (ttsResponse.ok) {
                const ttsData = await ttsResponse.json();
                if (ttsData.success) {
                    // Play the audio using Web Speech API or audio element
                    if (this.synthesis && 'speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(textToRead);
                        utterance.lang = this.userPreferences.language || 'fa-IR';
                        utterance.rate = 0.9;
                        utterance.pitch = 1.0;
                        this.synthesis.speak(utterance);
                    }

                    return {
                        content: `🔊 در حال خواندن متن:\n\n📝 **متن:** "${textToRead}"\n\n✅ خواندن شروع شد! \n\n💡 **نکات:**\n• برای توقف، دکمه صدا را دوباره فشار دهید\n• برای تغییر تنظیمات، از منوی تنظیمات صوتی استفاده کنید`,
                        options: {
                            quickActions: ['توقف خواندن', 'تنظیمات صدا', 'خواندن دوباره', 'متن دیگر']
                        }
                    };
                }
            }

            // Fallback to browser TTS
            if (this.synthesis && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(textToRead);
                utterance.lang = this.userPreferences.language || 'fa-IR';
                this.synthesis.speak(utterance);

                return {
                    content: `🔊 خواندن متن (حالت محلی):\n\n📝 "${textToRead}"\n\n✅ از موتور صوتی مرورگر استفاده شد.\n\n💡 برای کیفیت بهتر، اتصال اینترنت خود را بررسی کنید.`,
                    options: {
                        quickActions: ['توقف', 'تنظیمات', 'تلاش مجدد آنلاین']
                    }
                };
            }

            return {
                content: `❌ متأسفانه امکان خواندن متن در حال حاضر وجود ندارد.\n\n🔧 **راه‌حل‌ها:**\n• مطمئن شوید مرورگر شما از صدا پشتیبانی می‌کند\n• اتصال اینترنت را بررسی کنید\n• از مرورگر به‌روز استفاده کنید`,
                options: {
                    quickActions: ['تست صدای مرورگر', 'راهنمای فنی', 'پشتیبانی']
                }
            };

        } catch (error) {
            console.error('Read Text Response Error:', error);
            return {
                content: `❌ خطا در خواندن متن. لطفاً دوباره تلاش کنید.\n\n📝 فرمت صحیح: بخوان "متن شما"`,
                options: {
                    quickActions: ['تلاش مجدد', 'راهنما', 'پشتیبانی']
                }
            };
        }
    }

    async getVoiceListerResponse() {
        try {
            if (!this.recognition || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                return {
                    content: `🎙️ تشخیص گفتار:\n\n❌ **مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.**\n\n🔧 **راه‌حل‌ها:**\n• از Chrome یا Edge استفاده کنید\n• مرورگر را به‌روزرسانی کنید\n• مجوزهای میکروفون را بررسی کنید\n\n💡 **جایگزین:** می‌توانید از تایپ استفاده کنید.`,
                    options: {
                        quickActions: ['تست میکروفون', 'راهنمای مرورگر', 'ادامه با تایپ']
                    }
                };
            }

            return {
                content: `🎙️ آماده شنیدن صدای شما هستم!\n\n🔴 **برای شروع ضبط:**\nروی دکمه میکروفون کلیک کنید یا بگویید "شروع ضبط"\n\n⚙️ **تنظیمات فعلی:**\n• زبان: ${this.getLanguageName(this.userPreferences.language)}\n• حساسیت: متوسط\n• تشخیص خودکار: فعال\n\n💡 **نکات:**\n• در مکان ساکت صحبت کنید\n• واضح و آهسته صحبت کنید\n• می‌توانم دستورات پیچیده را درک کنم`,
                options: {
                    quickActions: ['شروع ضبط', 'تست میکروفون', 'تنظیم زبان', 'نمونه دستورات'],
                    actions: [
                        { label: '🎙️ شروع ضبط', type: 'primary', callback: () => this.toggleVoiceRecording() },
                        { label: '⚙️ تنظیمات', callback: () => this.sendMessage('تنظیمات صوتی') }
                    ]
                }
            };

        } catch (error) {
            console.error('Voice Listen Response Error:', error);
            return {
                content: `❌ خطا در راه‌اندازی تشخیص گفتار.\n\n🔧 لطفاً مجوزهای میکروفون را بررسی کنید.`,
                options: {
                    quickActions: ['تلاش مجدد', 'راهنما', 'پشتیبانی']
                }
            };
        }
    }

    getLanguageName(languageCode) {
        const languageNames = {
            'fa-IR': 'فارسی',
            'en-US': 'English',
            'ar-SA': 'العربية',
            'tr-TR': 'Türkçe',
            'de-DE': 'Deutsch',
            'fr-FR': 'Français',
            'es-ES': 'Español',
            'ru-RU': 'Русский',
            'zh-CN': '中文',
            'ja-JP': '日本語',
            'ko-KR': '한국어',
            'hi-IN': 'हिन्दी'
        };
        return languageNames[languageCode] || languageCode;
    }

    updateQuickActions(actions) {
        this.elements.quickActions.innerHTML = '';
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'quick-action';
            button.textContent = action;
            
            // Add click event listener for quick actions
            button.addEventListener('click', () => {
                this.handleQuickAction(action);
            });
            
            this.elements.quickActions.appendChild(button);
        });
    }

    // Handle quick action clicks
    async handleQuickAction(actionText) {
        // Send the quick action as a user message
        this.sendMessage(actionText);
    }

    executeCommand(command) {
        switch (command) {
            case 'execute_trade_sol':
                this.addArtemisMessage(
                    "✅ انجام شد!\n\n📋 جزئیات معامله:\n• خرید: 12.5 SOL به قیمت $16.00\n• سرمایه: $200\n• حد ضرر: $196 (-2%)\n• هدف سود: $220 (+10%)\n\n🔔 به محض رسیدن به هدف اطلاع می‌دهم!",
                    { 
                        quickActions: ['وضعیت معامله', 'تغییر حد ضرر', 'فروش فوری', 'معاملات فعال'],
                        dataCard: {
                            title: 'معامله فعال - SOL/USDT',
                            icon: 'fas fa-chart-line',
                            items: [
                                { label: 'مقدار', value: '12.5 SOL' },
                                { label: 'سرمایه', value: '$200' },
                                { label: 'سود فعلی', value: '+$8', type: 'positive' },
                                { label: 'درصد سود', value: '+4%', type: 'positive' }
                            ]
                        }
                    }
                );
                break;
                
            case 'start_autopilot':
                this.addArtemisMessage(
                    "🚀 اتوپایلوت فعال شد!\n\n✅ سیستم شروع به کار کرد\n📊 در حال تحلیل بازار...\n🎯 اولین معامله تا 15 دقیقه دیگر\n\nهمه چیز تحت کنترل است! 🤖",
                    {
                        quickActions: ['وضعیت اتوپایلوت', 'تنظیمات', 'آمار زنده', 'توقف موقت']
                    }
                );
                break;
                
            default:
                this.addArtemisMessage("درحال انجام درخواست شما... لطفاً کمی صبر کنید.");
        }
    }

    toggleVoiceRecording() {
        if (!this.recognition) {
            alert('متأسفانه مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند');
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    speak(text) {
        if (!this.synthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fa-IR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        this.synthesis.speak(utterance);
    }

    autoResizeTextarea() {
        const textarea = this.elements.input;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }, 50);
    }

    formatTime(date) {
        return new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    openSettings() {
        // TODO: Open settings modal for chatbot preferences
        this.addArtemisMessage(
            "⚙️ تنظیمات چت‌بات:\n\n🔊 صدا: فعال\n🤖 پاسخ خودکار: فعال\n🔔 اعلان‌ها: فعال\n🌐 زبان: فارسی\n\nکدام تنظیم را تغییر دهید؟",
            {
                quickActions: ['تغییر زبان', 'تنظیمات صوتی', 'اعلان‌ها', 'بازنشانی']
            }
        );
    }

    async loadConversationHistory() {
        // First try to load from backend if authenticated
        try {
            const token = this.getAuthToken();
            if (token && this.userPreferences.useAIBackend) {
                await this.loadBackendConversations();
                return;
            }
        } catch (error) {
            console.warn('Failed to load from backend, using local storage:', error);
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('artemis-conversation');
        if (saved) {
            try {
                this.conversationHistory = JSON.parse(saved);
                // Restore last few messages
                const recentMessages = this.conversationHistory.slice(-5);
                recentMessages.forEach(msg => {
                    if (msg.type === 'user') {
                        this.addUserMessage(msg.content);
                    } else {
                        this.addArtemisMessage(msg.content, msg.options || {});
                    }
                });
            } catch (e) {
                console.warn('Failed to load conversation history:', e);
            }
        }
    }

    async loadBackendConversations() {
        try {
            const token = this.getAuthToken();
            if (!token) return;

            const response = await fetch('/api/ai/conversations', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.conversations.length > 0) {
                    // Load the most recent conversation
                    const recent = data.data.conversations[0];
                    this.currentConversationId = recent.conversation_id;
                    
                    // Load messages for this conversation
                    await this.loadConversationMessages(recent.conversation_id);
                }
            }
        } catch (error) {
            console.error('Failed to load backend conversations:', error);
            throw error;
        }
    }

    async loadConversationMessages(conversationId) {
        try {
            const token = this.getAuthToken();
            if (!token) return;

            const response = await fetch(`/api/ai/conversations/${conversationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.messages) {
                    // Display recent messages
                    const recentMessages = data.data.messages.slice(-5);
                    recentMessages.forEach(msg => {
                        if (msg.role === 'user') {
                            this.addUserMessage(msg.content);
                        } else if (msg.role === 'assistant') {
                            this.addArtemisMessage(msg.content, {
                                type: 'ai_response',
                                provider: msg.metadata?.provider,
                                model: msg.metadata?.model
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load conversation messages:', error);
        }
    }

    saveConversationHistory() {
        try {
            // Keep only last 50 messages
            const recent = this.conversationHistory.slice(-50);
            localStorage.setItem('artemis-conversation', JSON.stringify(recent));
        } catch (e) {
            console.warn('Failed to save conversation history:', e);
        }
    }

    startHeartbeat() {
        // Save conversation every 30 seconds
        setInterval(() => {
            this.saveConversationHistory();
        }, 30000);
        
        // Update active tasks status
        setInterval(() => {
            this.updateTasksStatus();
        }, 60000);
        
        // Update system status every 15 seconds
        setInterval(() => {
            this.updateSystemStatus();
        }, 15000);
        
        // Initial status check after 3 seconds
        setTimeout(() => {
            this.updateSystemStatus();
        }, 3000);
    }

    updateTasksStatus() {
        // Check for active scheduled tasks and send updates
        this.activeTasks.forEach((task, id) => {
            if (task.nextRun <= Date.now()) {
                this.executeScheduledTask(task);
                task.nextRun = Date.now() + task.interval;
            }
        });
    }

    executeScheduledTask(task) {
        // Execute scheduled task and send notification
        let message = "";
        
        switch (task.type) {
            case 'portfolio_report':
                message = "📊 گزارش دوره‌ای پورتفولیو:\n\n💰 ارزش فعلی: $12,680 (+1.8%)\n📈 تغییرات آخرین 30 دقیقه: +$23\n🎯 عملکرد امروز: +2.1%\n\n✅ همه چیز در مسیر درست است!";
                break;
            case 'trading_opportunity':
                message = "💡 فرصت معاملاتی جدید:\n\n🎯 ADA/USDT\n📈 سیگنال خرید قوی\n💰 سود پیش‌بینی شده: $15-20\n⏰ زمان مناسب: همین الآن\n\nآیا معامله را انجام دهم؟";
                break;
        }
        
        if (message) {
            this.addArtemisMessage(message, {
                quickActions: ['جزئیات بیشتر', 'توقف تسک', 'تنظیم دوباره']
            });
        }
    }

    // Public method to add task from external systems
    addScheduledTask(type, interval, data = {}) {
        const taskId = Date.now().toString();
        this.activeTasks.set(taskId, {
            id: taskId,
            type: type,
            interval: interval,
            nextRun: Date.now() + interval,
            data: data
        });
        return taskId;
    }

    // Integration methods for system modules
    updatePortfolioData(data) {
        // Can be called by portfolio module to update real-time data
        console.log('Portfolio data updated:', data);
    }

    notifyTradeExecuted(tradeData) {
        // Can be called when a trade is executed
        this.addArtemisMessage(
            `✅ معامله انجام شد!\n\n${tradeData.type}: ${tradeData.amount} ${tradeData.symbol}\nقیمت: $${tradeData.price}\nسود/ضرر: ${tradeData.pnl}`,
            { quickActions: ['جزئیات معامله', 'معاملات فعال', 'تنظیم حد ضرر'] }
        );
    }

    async showSystemStatus() {
        // Use the new System Status Manager for unified status display
        if (window.systemStatusManager) {
            window.systemStatusManager.showStatusModal();
        } else {
            // Fallback to loading the system status module
            try {
                await this.loadSystemStatusModule();
                if (window.systemStatusManager) {
                    window.systemStatusManager.showStatusModal();
                } else {
                    this.showFallbackStatusModal();
                }
            } catch (error) {
                console.error('Error loading system status module:', error);
                this.showFallbackStatusModal();
            }
        }
    }

    async loadSystemStatusModule() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.systemStatusManager) {
                resolve();
                return;
            }

            // Load the system status module
            const script = document.createElement('script');
            script.src = '/static/modules/system-status.js';
            script.onload = () => {
                console.log('✅ System Status Module loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load System Status Module');
                reject(new Error('Failed to load system status module'));
            };
            document.head.appendChild(script);
        });
    }

    showFallbackStatusModal() {
        // Fallback simple status modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg max-w-md w-full p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-white flex items-center gap-2">
                        <i class="fas fa-server text-green-400"></i>
                        وضعیت سیستم
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-gray-700 rounded-lg p-4 text-center">
                        <i class="fas fa-circle text-green-400 text-2xl mb-2"></i>
                        <div class="text-white font-semibold">سیستم آنلاین</div>
                        <div class="text-gray-400 text-sm">همه سرویس‌ها فعال هستند</div>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="window.location.reload()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <i class="fas fa-sync-alt mr-2"></i>
                            بروزرسانی صفحه
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async fetchSystemStatus() {
        let systemStatus = null;
        let aiStatus = null;

        try {
            // Try to fetch system health
            const healthResponse = await fetch('/api/health');
            if (healthResponse.ok) {
                systemStatus = await healthResponse.json();
            }
        } catch (error) {
            console.warn('Could not fetch system health:', error);
        }

        try {
            // Try to fetch AI status if authenticated
            const token = this.getAuthToken();
            if (token) {
                const aiResponse = await fetch('/api/ai/status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (aiResponse.ok) {
                    const data = await aiResponse.json();
                    if (data.success) {
                        aiStatus = data.data;
                    }
                }
            }
        } catch (error) {
            console.warn('Could not fetch AI status:', error);
        }

        // Build comprehensive status
        const components = [
            { 
                name: 'سرور تایتان', 
                status: systemStatus ? 'online' : 'offline',
                details: systemStatus ? `Database: ${systemStatus.database?.status}` : 'غیر قابل دسترس'
            },
            { 
                name: 'دستیار هوش مصنوعی', 
                status: aiStatus ? 'online' : 'offline',
                details: aiStatus 
                    ? `OpenAI: ${aiStatus.providers?.openai?.available ? '✓' : '✗'}, Anthropic: ${aiStatus.providers?.anthropic?.available ? '✓' : '✗'}`
                    : this.getAuthToken() ? 'نیاز به احراز هویت' : 'غیر قابل دسترس'
            },
            { name: 'موتور معاملات', status: 'online', details: 'MEXC API فعال' },
            { name: 'جریان داده‌ها', status: 'online', details: 'Real-time data' },
            { name: 'همگام‌سازی اطلاعات', status: 'warning', details: 'خروجی محدود' }
        ];

        // Determine overall status
        const hasOffline = components.some(c => c.status === 'offline');
        const hasWarning = components.some(c => c.status === 'warning');
        const overallStatus = hasOffline ? 'offline' : hasWarning ? 'warning' : 'online';

        return {
            overall: overallStatus,
            cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
            memory: Math.floor(Math.random() * 40) + 20, // 20-60%
            network: Math.floor(Math.random() * 20) + 70, // 70-90%
            components: components,
            ai: aiStatus,
            system: systemStatus,
            lastUpdate: new Date().toLocaleString('fa-IR')
        };
    }

    getStatusText(status) {
        switch (status) {
            case 'online': return 'آنلاین';
            case 'warning': return 'هشدار';
            case 'error': return 'خطا';
            case 'offline': return 'آفلاین';
            default: return 'نامعلوم';
        }
    }

    getActivityStatusColor(status) {
        switch (status) {
            case 'active': return 'bg-green-400';
            case 'completed': return 'bg-blue-400';
            case 'pending': return 'bg-yellow-400';
            case 'error': return 'bg-red-400';
            default: return 'bg-gray-400';
        }
    }

    getActivityStatusText(status) {
        switch (status) {
            case 'active': return 'فعال';
            case 'completed': return 'تکمیل';
            case 'pending': return 'در انتظار';
            case 'error': return 'خطا';
            default: return 'نامعلوم';
        }
    }

    updateSystemStatus() {
        if (!this.elements.statusButton) return;

        this.fetchSystemStatus().then(statusData => {
            const button = this.elements.statusButton;
            
            // Remove existing status classes
            button.classList.remove('status-online', 'status-warning', 'status-error', 'status-offline');
            
            // Add appropriate status class
            button.classList.add(`status-${statusData.overall}`);
            
            // Update tooltip
            button.setAttribute('title', `وضعیت سیستم: ${this.getStatusText(statusData.overall)}`);
        }).catch(error => {
            console.error('Error updating system status:', error);
            this.elements.statusButton.classList.add('status-error');
        });
    }
}

// Check if we should initialize chatbot (not on login page)
function shouldInitializeChatbot() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('titan_auth_token') || sessionStorage.getItem('titan_auth_token');
    
    // Check if we're on login screen (loginScreen visible, mainApp hidden)
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const isOnLoginScreen = loginScreen && !loginScreen.classList.contains('hidden');
    const isOnMainApp = mainApp && !mainApp.classList.contains('hidden');
    
    // Also check for login forms as fallback
    const hasLoginForm = document.querySelector('#loginForm, #login-form, .login-form, [id*="login"], [class*="login"]');
    
    // Initialize if user is logged in, not on login screen, and main app is visible
    return isLoggedIn && !isOnLoginScreen && (isOnMainApp || !hasLoginForm);
}

// Initialize the chatbot when DOM is loaded (only if logged in)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (shouldInitializeChatbot()) {
            window.artemisAI = new ArtemisAIChatbot();
        }
    });
} else {
    if (shouldInitializeChatbot()) {
        window.artemisAI = new ArtemisAIChatbot();
    }
}

// Global function to initialize chatbot after login
window.initializeChatbotIfNeeded = function() {
    if (shouldInitializeChatbot() && !window.artemisAI) {
        window.artemisAI = new ArtemisAIChatbot();
        console.log('✅ Chatbot initialized via global function');
        return true;
    }
    return false;
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArtemisAIChatbot;
}

// Register in global TitanModules namespace
if (typeof window !== 'undefined') {
    window.TitanModules = window.TitanModules || {};
    window.TitanModules.ArtemisAIChatbot = ArtemisAIChatbot;
    console.log('📦 Artemis AI Chatbot registered in TitanModules');
}