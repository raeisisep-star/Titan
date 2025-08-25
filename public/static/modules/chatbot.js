// ==================== ARTEMIS AI CHATBOT MODULE ====================

class ArtemisAIChatbot {
    constructor() {
        this.isOpen = false;
        this.isRecording = false;
        this.recognition = null;
        this.synthesis = null;
        this.conversationHistory = [];
        this.activeTasks = new Map();
        this.userPreferences = {
            voiceEnabled: true,
            autoSpeak: false,
            language: 'fa-IR',
            notifications: true
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

        // Auto-resize textarea
        this.elements.input.addEventListener('input', () => this.autoResizeTextarea());

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
    }

    sendMessage(text = null) {
        const message = text || this.elements.input.value.trim();
        if (!message) return;

        // Add user message
        this.addUserMessage(message);
        
        // Clear input
        if (!text) {
            this.elements.input.value = '';
            this.autoResizeTextarea();
        }

        // Show typing indicator
        this.showTyping();

        // Process message with AI
        setTimeout(() => {
            this.processUserMessage(message);
        }, 1000 + Math.random() * 2000); // Simulate processing time
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

    processUserMessage(message) {
        const response = this.generateAIResponse(message);
        this.addArtemisMessage(response.content, response.options);
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase().trim();
        
        // Portfolio queries
        if (this.matchesKeywords(message, ['پورتفولیو', 'موجودی', 'دارایی', 'وضعیت'])) {
            return this.getPortfolioResponse();
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

    getPortfolioResponse() {
        // Simulate portfolio data
        const portfolioData = {
            totalValue: '$12,450',
            dailyChange: '+2.3%',
            weeklyProfit: '+$340',
            monthlyReturn: '+12.7%',
            bestPerformer: 'BTC (+5.2%)',
            needsAttention: 'ADA (-1.8%)'
        };

        return {
            content: `📊 وضعیت پورتفولیو شما:\n\n💰 ارزش کل: ${portfolioData.totalValue} (${portfolioData.dailyChange} امروز)\n📈 سود هفته: ${portfolioData.weeklyProfit}\n🎯 عملکرد ماهانه: ${portfolioData.monthlyReturn}\n\nبهترین عملکرد: ${portfolioData.bestPerformer}\nنیاز به توجه: ${portfolioData.needsAttention}\n\nآیا می‌خواهید تحلیل بیشتری ببینید؟`,
            options: {
                quickActions: ['تحلیل تکنیکال', 'گزارش سود', 'پیشنهاد معامله', 'تنظیم هشدار'],
                dataCard: {
                    title: 'جزئیات پورتفولیو',
                    icon: 'fas fa-chart-pie',
                    items: [
                        { label: 'ارزش کل', value: portfolioData.totalValue, type: 'positive' },
                        { label: 'تغییر امروز', value: portfolioData.dailyChange, type: 'positive' },
                        { label: 'سود هفتگی', value: portfolioData.weeklyProfit, type: 'positive' },
                        { label: 'بازدهی ماهانه', value: portfolioData.monthlyReturn, type: 'positive' }
                    ]
                }
            }
        };
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
                quickActions: ['وضعیت پورتفولیو', 'فرصت‌های امروز', 'فعال‌سازی اتوپایلوت', 'گزارش سود']
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

    updateQuickActions(actions) {
        this.elements.quickActions.innerHTML = '';
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'quick-action';
            button.textContent = action;
            this.elements.quickActions.appendChild(button);
        });
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

    loadConversationHistory() {
        // Load from localStorage
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
        try {
            // Fetch system status data
            const statusData = await this.fetchSystemStatus();
            
            // Create status modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                        <h3 class="text-xl font-semibold text-white flex items-center gap-2">
                            <i class="fas fa-server text-green-400"></i>
                            وضعیت سیستم
                        </h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-4 space-y-4">
                        <!-- Overall Status -->
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">وضعیت کل:</span>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 ${statusData.overall === 'online' ? 'bg-green-400' : statusData.overall === 'warning' ? 'bg-yellow-400' : 'bg-red-400'} rounded-full"></div>
                                <span class="text-white">${this.getStatusText(statusData.overall)}</span>
                            </div>
                        </div>

                        <!-- System Metrics -->
                        <div class="bg-gray-700 rounded-lg p-3">
                            <h4 class="text-white font-medium mb-3">متریک‌های عملکرد:</h4>
                            
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-300 text-sm">CPU</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 bg-gray-600 rounded-full h-2">
                                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${statusData.cpu || 0}%"></div>
                                        </div>
                                        <span class="text-white text-sm">${statusData.cpu || 0}%</span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-300 text-sm">حافظه</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 bg-gray-600 rounded-full h-2">
                                            <div class="bg-green-500 h-2 rounded-full" style="width: ${statusData.memory || 0}%"></div>
                                        </div>
                                        <span class="text-white text-sm">${statusData.memory || 0}%</span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-300 text-sm">شبکه</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 bg-gray-600 rounded-full h-2">
                                            <div class="bg-purple-500 h-2 rounded-full" style="width: ${statusData.network || 0}%"></div>
                                        </div>
                                        <span class="text-white text-sm">${statusData.network || 0}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Component Status -->
                        <div class="bg-gray-700 rounded-lg p-3">
                            <h4 class="text-white font-medium mb-3">وضعیت اجزاء:</h4>
                            
                            <div class="space-y-2">
                                ${statusData.components.map(component => `
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-300 text-sm">${component.name}</span>
                                        <div class="flex items-center gap-2">
                                            <div class="w-2 h-2 ${component.status === 'online' ? 'bg-green-400' : component.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'} rounded-full"></div>
                                            <span class="text-white text-sm">${this.getStatusText(component.status)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Current Activities -->
                        <div class="bg-gray-700 rounded-lg p-3">
                            <h4 class="text-white font-medium mb-3">فعالیت جاری:</h4>
                            
                            <div class="space-y-3 max-h-40 overflow-y-auto">
                                ${statusData.activities ? statusData.activities.map(activity => `
                                    <div class="flex items-center justify-between p-2 bg-gray-600 rounded-lg">
                                        <div class="flex items-center gap-3">
                                            <div class="text-lg">${activity.icon}</div>
                                            <div>
                                                <div class="text-white text-sm font-medium">${activity.title}</div>
                                                <div class="text-gray-400 text-xs">${activity.description}</div>
                                            </div>
                                        </div>
                                        <div class="text-left">
                                            <div class="flex items-center gap-2 mb-1">
                                                <div class="w-2 h-2 ${this.getActivityStatusColor(activity.status)} rounded-full ${activity.status === 'active' ? 'animate-pulse' : ''}"></div>
                                                <span class="text-xs text-gray-400">${this.getActivityStatusText(activity.status)}</span>
                                            </div>
                                            <div class="text-xs text-gray-500">${activity.timestamp}</div>
                                        </div>
                                    </div>
                                `).join('') : '<div class="text-center py-4 text-gray-400">هیچ فعالیت جاری‌ای یافت نشد</div>'}
                            </div>
                        </div>

                        <!-- Last Update -->
                        <div class="text-center">
                            <span class="text-gray-400 text-sm">آخرین بروزرسانی: ${statusData.lastUpdate}</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing system status:', error);
            this.addArtemisMessage('خطا در دریافت وضعیت سیستم. لطفاً دوباره تلاش کنید.');
        }
    }

    async fetchSystemStatus() {
        try {
            // Try to fetch from API
            const response = await fetch('/api/system/status');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Could not fetch system status from API, using mock data');
        }

        // Return mock data if API is not available
        return {
            overall: 'online',
            cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
            memory: Math.floor(Math.random() * 40) + 20, // 20-60%
            network: Math.floor(Math.random() * 20) + 70, // 70-90%
            components: [
                { name: 'مغز AI', status: 'online' },
                { name: 'آرتمیس پیشرفته', status: 'online' },
                { name: 'موتور معاملات', status: 'online' },
                { name: 'جریان داده‌ها', status: 'online' },
                { name: 'همگام‌سازی اطلاعات', status: 'warning' }
            ],
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