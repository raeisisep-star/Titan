// Feature 10: Advanced Security Module
class AdvancedSecurityModule {
    constructor() {
        this.securityDashboard = this.getSecurityDashboard();
        this.threatDetection = this.getThreatDetectionSystems();
        this.auditLogs = [];
        this.encryptionManagement = this.getEncryptionSettings();
        this.compliance = this.getComplianceFrameworks();
        this.securityAlerts = [];
        this.vulnerabilities = [];
        this.initialized = false;
        
        console.log('✅ Advanced Security Module constructor called');
    }

    getSecurityDashboard() {
        return {
            overview: {
                security_score: 94,
                risk_level: 'Low',
                active_threats: 0,
                blocked_attacks: 1247,
                last_security_scan: new Date(Date.now() - 3600000).toISOString(),
                encryption_status: 'Active',
                compliance_score: 98,
                two_factor_enabled: true
            },
            metrics: {
                failed_logins_24h: 12,
                suspicious_ips_blocked: 8,
                api_rate_limit_violations: 3,
                unusual_trading_patterns: 1,
                malware_detections: 0,
                phishing_attempts: 0,
                data_breaches: 0,
                privilege_escalations: 0
            },
            recent_activities: [
                {
                    id: 'sec_001',
                    timestamp: new Date(Date.now() - 900000).toISOString(),
                    type: 'login_attempt',
                    severity: 'medium',
                    description: 'Multiple failed login attempts from IP 192.168.1.100',
                    action_taken: 'IP temporarily blocked',
                    user: 'trader_pro'
                },
                {
                    id: 'sec_002',
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    type: 'api_anomaly',
                    severity: 'low',
                    description: 'Unusual API request pattern detected',
                    action_taken: 'Monitoring increased',
                    user: 'system'
                },
                {
                    id: 'sec_003',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    type: 'encryption_update',
                    severity: 'info',
                    description: 'Encryption keys rotated successfully',
                    action_taken: 'All connections updated',
                    user: 'admin'
                }
            ]
        };
    }

    getThreatDetectionSystems() {
        return {
            intrusion_detection: {
                id: 'ids',
                name: 'سیستم تشخیص نفوذ (IDS)',
                status: 'active',
                version: '3.2.1',
                last_update: new Date(Date.now() - 86400000).toISOString(),
                detection_rate: 99.7,
                false_positive_rate: 0.02,
                rules_count: 15847,
                enabled_modules: ['network', 'host', 'application', 'behavioral']
            },
            malware_scanner: {
                id: 'malware',
                name: 'اسکنر بدافزار',
                status: 'active',
                version: '2.8.9',
                last_scan: new Date(Date.now() - 21600000).toISOString(),
                threats_detected: 0,
                quarantined_files: 3,
                signature_database: '2024.09.01',
                real_time_protection: true
            },
            behavioral_analysis: {
                id: 'behavioral',
                name: 'تحلیل رفتاری',
                status: 'active',
                version: '1.5.4',
                learning_mode: false,
                anomalies_detected: 2,
                baseline_profiles: 156,
                confidence_threshold: 0.85,
                ai_model_accuracy: 96.3
            },
            ddos_protection: {
                id: 'ddos',
                name: 'محافظت DDoS',
                status: 'active',
                provider: 'Cloudflare',
                mitigation_active: false,
                traffic_analysis: true,
                rate_limiting: true,
                geo_blocking: ['CN', 'RU', 'KP'],
                attack_vectors_blocked: ['HTTP Flood', 'SYN Flood', 'UDP Flood']
            }
        };
    }

    getEncryptionSettings() {
        return {
            data_at_rest: {
                algorithm: 'AES-256-GCM',
                key_management: 'Hardware Security Module',
                rotation_period: '90 days',
                last_rotation: new Date(Date.now() - 7 * 86400000).toISOString(),
                backup_encryption: true,
                compliance: ['FIPS 140-2 Level 3', 'Common Criteria EAL4+']
            },
            data_in_transit: {
                tls_version: 'TLS 1.3',
                cipher_suites: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
                certificate_authority: 'Let\'s Encrypt',
                certificate_expiry: new Date(Date.now() + 60 * 86400000).toISOString(),
                hsts_enabled: true,
                ocsp_stapling: true
            },
            api_security: {
                jwt_algorithm: 'RS256',
                token_expiry: '15 minutes',
                refresh_token_expiry: '7 days',
                rate_limiting: '1000 req/hour',
                api_key_rotation: '30 days',
                webhook_verification: true
            },
            database_encryption: {
                transparent_encryption: true,
                column_encryption: ['api_keys', 'passwords', 'personal_data'],
                backup_encryption: true,
                key_escrow: true,
                audit_logging: true
            }
        };
    }

    getComplianceFrameworks() {
        return {
            gdpr: {
                name: 'GDPR (General Data Protection Regulation)',
                status: 'compliant',
                compliance_score: 98,
                last_audit: new Date(Date.now() - 30 * 86400000).toISOString(),
                requirements_met: 47,
                total_requirements: 48,
                data_processing_agreements: true,
                consent_management: true,
                right_to_be_forgotten: true,
                data_portability: true,
                breach_notification: true
            },
            pci_dss: {
                name: 'PCI DSS (Payment Card Industry Data Security Standard)',
                status: 'compliant',
                compliance_score: 96,
                last_audit: new Date(Date.now() - 90 * 86400000).toISOString(),
                requirements_met: 11,
                total_requirements: 12,
                network_security: true,
                data_protection: true,
                vulnerability_management: true,
                access_control: true,
                monitoring: true
            },
            iso27001: {
                name: 'ISO 27001 (Information Security Management)',
                status: 'in_progress',
                compliance_score: 87,
                last_audit: new Date(Date.now() - 180 * 86400000).toISOString(),
                requirements_met: 98,
                total_requirements: 114,
                isms_implemented: true,
                risk_assessment: true,
                security_controls: true,
                continuous_improvement: true,
                certification_target: new Date(Date.now() + 90 * 86400000).toISOString()
            },
            soc2: {
                name: 'SOC 2 Type II',
                status: 'compliant',
                compliance_score: 94,
                last_audit: new Date(Date.now() - 60 * 86400000).toISOString(),
                trust_services_criteria: {
                    security: true,
                    availability: true,
                    processing_integrity: true,
                    confidentiality: true,
                    privacy: true
                },
                audit_period: '12 months',
                next_audit: new Date(Date.now() + 180 * 86400000).toISOString()
            }
        };
    }

    async initialize() {
        console.log('🔄 Initializing Advanced Security Module...');
        
        try {
            // Generate security audit logs
            this.generateAuditLogs();
            
            // Generate security alerts
            this.generateSecurityAlerts();
            
            // Scan for vulnerabilities
            await this.performVulnerabilityScan();
            
            // Initialize real-time monitoring
            this.initializeSecurityMonitoring();
            
            this.initialized = true;
            console.log('✅ Advanced Security Module initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Advanced Security Module:', error);
        }
    }

    generateAuditLogs() {
        const actions = [
            'user_login', 'user_logout', 'admin_access', 'config_change', 'data_export',
            'api_key_generated', 'password_changed', 'permission_modified', 'backup_created',
            'security_scan', 'threat_detected', 'encryption_updated', 'compliance_check'
        ];
        
        const severities = ['info', 'warning', 'error', 'critical'];
        const statuses = ['success', 'failed', 'pending'];
        
        // Generate last 200 audit entries
        for (let i = 0; i < 200; i++) {
            const action = actions[Math.floor(Math.random() * actions.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            this.auditLogs.push({
                id: `audit_${i}`,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                action: action,
                severity: severity,
                status: status,
                user_id: `user_${Math.floor(Math.random() * 10) + 1}`,
                ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                resource: action.includes('api') ? 'api_endpoint' : action.includes('admin') ? 'admin_panel' : 'web_interface',
                details: `${action} performed with ${status} status`,
                risk_score: Math.floor(Math.random() * 100),
                compliance_relevant: Math.random() > 0.3
            });
        }
        
        this.auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    generateSecurityAlerts() {
        const alertTypes = [
            'failed_login_attempts', 'suspicious_api_activity', 'unusual_trading_pattern',
            'potential_malware', 'brute_force_attack', 'privilege_escalation',
            'data_exfiltration_attempt', 'configuration_drift', 'certificate_expiry',
            'compliance_violation', 'anomalous_behavior', 'geo_location_anomaly'
        ];
        
        const severities = ['low', 'medium', 'high', 'critical'];
        const statuses = ['open', 'investigating', 'resolved', 'false_positive'];
        
        // Generate recent security alerts
        for (let i = 0; i < 25; i++) {
            const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            this.securityAlerts.push({
                id: `alert_${i}`,
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                type: alertType,
                severity: severity,
                status: status,
                title: `${alertType.replace(/_/g, ' ').toUpperCase()} Detected`,
                description: `Security alert for ${alertType} with ${severity} severity level`,
                affected_systems: ['trading_engine', 'user_management', 'api_gateway'][Math.floor(Math.random() * 3)],
                source_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                detection_method: ['rule_based', 'ml_anomaly', 'signature_match', 'behavioral_analysis'][Math.floor(Math.random() * 4)],
                mitigation_steps: ['Block IP', 'Increase monitoring', 'User notification', 'System lockdown'][Math.floor(Math.random() * 4)],
                false_positive_probability: Math.random() * 0.3
            });
        }
        
        this.securityAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async performVulnerabilityScan() {
        console.log('🔍 Performing vulnerability scan...');
        
        const vulnerabilityTypes = [
            'SQL Injection', 'Cross-Site Scripting (XSS)', 'Cross-Site Request Forgery (CSRF)',
            'Insecure Direct Object References', 'Security Misconfiguration', 'Sensitive Data Exposure',
            'Missing Function Level Access Control', 'Using Components with Known Vulnerabilities',
            'Unvalidated Redirects and Forwards', 'Broken Authentication and Session Management'
        ];
        
        const severities = ['Low', 'Medium', 'High', 'Critical'];
        const statuses = ['Open', 'In Progress', 'Fixed', 'Accepted Risk'];
        
        // Generate vulnerability scan results
        for (let i = 0; i < 15; i++) {
            const vulnType = vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            this.vulnerabilities.push({
                id: `vuln_${i}`,
                cve_id: `CVE-2024-${Math.floor(Math.random() * 9000) + 1000}`,
                title: vulnType,
                severity: severity,
                status: status,
                cvss_score: (Math.random() * 10).toFixed(1),
                description: `${vulnType} vulnerability detected in the system`,
                affected_component: ['Web Application', 'API Gateway', 'Database', 'Authentication System'][Math.floor(Math.random() * 4)],
                discovery_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
                remediation_effort: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                exploit_probability: Math.random(),
                business_impact: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)]
            });
        }
        
        this.vulnerabilities.sort((a, b) => parseFloat(b.cvss_score) - parseFloat(a.cvss_score));
    }

    initializeSecurityMonitoring() {
        console.log('📊 Initializing security monitoring...');
        // In real implementation, this would set up real-time monitoring
    }

    getContent() {
        return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-shield-alt text-red-400 mr-3"></i>
                        امنیت پیشرفته
                    </h2>
                    <p class="text-gray-400 mt-1">داشبورد امنیت، تشخیص تهدید، لاگ‌های حسابرسی و مدیریت رمزگذاری</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="securityModule.runSecurityScan()" 
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                        <i class="fas fa-search"></i>اسکن امنیتی
                    </button>
                    <button onclick="securityModule.generateSecurityReport()" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <i class="fas fa-file-alt"></i>گزارش امنیتی
                    </button>
                </div>
            </div>

            <!-- Security Overview -->
            ${this.getSecurityOverview()}

            <!-- Security Tabs -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="flex border-b border-gray-700 overflow-x-auto" id="security-tabs">
                    <button onclick="securityModule.switchSecurityTab('dashboard')" 
                            class="security-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-blue-400 border-b-2 border-blue-400">
                        <i class="fas fa-tachometer-alt"></i>داشبورد امنیت
                    </button>
                    <button onclick="securityModule.switchSecurityTab('threats')" 
                            class="security-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-gray-400 hover:text-white">
                        <i class="fas fa-exclamation-triangle"></i>تشخیص تهدید
                    </button>
                    <button onclick="securityModule.switchSecurityTab('audit')" 
                            class="security-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-gray-400 hover:text-white">
                        <i class="fas fa-clipboard-check"></i>لاگ‌های حسابرسی
                    </button>
                    <button onclick="securityModule.switchSecurityTab('encryption')" 
                            class="security-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-gray-400 hover:text-white">
                        <i class="fas fa-lock"></i>مدیریت رمزگذاری
                    </button>
                    <button onclick="securityModule.switchSecurityTab('compliance')" 
                            class="security-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-gray-400 hover:text-white">
                        <i class="fas fa-balance-scale"></i>انطباق
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="p-6" id="security-tab-content">
                    ${this.getDashboardTab()}
                </div>
            </div>
        </div>`;
    }

    getSecurityOverview() {
        const overview = this.securityDashboard.overview;
        const metrics = this.securityDashboard.metrics;
        
        return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 ${overview.security_score >= 90 ? 'bg-green-600' : overview.security_score >= 70 ? 'bg-yellow-600' : 'bg-red-600'} rounded-lg">
                        <i class="fas fa-shield-alt text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">امتیاز امنیت</p>
                        <p class="text-2xl font-bold text-white">${overview.security_score}/100</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 ${overview.active_threats === 0 ? 'bg-green-600' : 'bg-red-600'} rounded-lg">
                        <i class="fas fa-exclamation-triangle text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">تهدیدات فعال</p>
                        <p class="text-2xl font-bold text-white">${overview.active_threats}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-blue-600 rounded-lg">
                        <i class="fas fa-shield text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">حملات مسدود شده</p>
                        <p class="text-2xl font-bold text-white">${overview.blocked_attacks.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 ${overview.compliance_score >= 95 ? 'bg-green-600' : 'bg-yellow-600'} rounded-lg">
                        <i class="fas fa-balance-scale text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">انطباق</p>
                        <p class="text-2xl font-bold text-white">${overview.compliance_score}%</p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getDashboardTab() {
        return `
        <div class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Security Metrics -->
                <div class="bg-gray-900 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-chart-line text-blue-400 mr-2"></i>
                        متریک‌های امنیتی (24 ساعت گذشته)
                    </h3>
                    <div class="space-y-3">
                        ${this.getSecurityMetricsCards()}
                    </div>
                </div>

                <!-- Recent Security Activities -->
                <div class="bg-gray-900 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-history text-green-400 mr-2"></i>
                        فعالیت‌های امنیتی اخیر
                    </h3>
                    <div class="space-y-3 max-h-64 overflow-y-auto">
                        ${this.securityDashboard.recent_activities.map(activity => this.getActivityCard(activity)).join('')}
                    </div>
                </div>
            </div>

            <!-- System Status -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-server text-purple-400 mr-2"></i>
                    وضعیت سیستم‌های امنیتی
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${this.getSecuritySystemsStatus()}
                </div>
            </div>
        </div>`;
    }

    getSecurityMetricsCards() {
        const metrics = this.securityDashboard.metrics;
        
        return Object.entries(metrics).map(([key, value]) => {
            const metricName = {
                'failed_logins_24h': 'ورود ناموفق',
                'suspicious_ips_blocked': 'IP مشکوک مسدود',
                'api_rate_limit_violations': 'نقض محدودیت API',
                'unusual_trading_patterns': 'الگوی معاملاتی غیرعادی',
                'malware_detections': 'تشخیص بدافزار',
                'phishing_attempts': 'تلاش فیشینگ',
                'data_breaches': 'نقض داده',
                'privilege_escalations': 'ارتقای مجوز'
            }[key] || key;
            
            const isGood = value === 0;
            const color = isGood ? 'text-green-400' : value < 10 ? 'text-yellow-400' : 'text-red-400';
            
            return `
            <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                <span class="text-gray-300 text-sm">${metricName}:</span>
                <span class="${color} font-semibold">${value}</span>
            </div>`;
        }).join('');
    }

    getActivityCard(activity) {
        const severityColor = {
            'info': 'text-blue-400',
            'low': 'text-green-400',
            'medium': 'text-yellow-400',
            'high': 'text-red-400',
            'critical': 'text-red-600'
        }[activity.severity] || 'text-gray-400';
        
        const timestamp = new Date(activity.timestamp).toLocaleString('fa-IR');
        
        return `
        <div class="bg-gray-800 rounded p-3">
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-white text-sm font-semibold">${activity.type.replace(/_/g, ' ')}</h4>
                <span class="${severityColor} text-xs">${activity.severity}</span>
            </div>
            <p class="text-gray-300 text-xs mb-2">${activity.description}</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
                <span>اقدام: ${activity.action_taken}</span>
                <span>${timestamp}</span>
            </div>
        </div>`;
    }

    getSecuritySystemsStatus() {
        return Object.values(this.threatDetection).map(system => {
            const statusColor = system.status === 'active' ? 'text-green-400' : 'text-red-400';
            const statusIcon = system.status === 'active' ? 'fa-check-circle' : 'fa-times-circle';
            
            return `
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-white font-semibold text-sm">${system.name}</h4>
                    <i class="fas ${statusIcon} ${statusColor}"></i>
                </div>
                <p class="text-gray-400 text-xs mb-2">نسخه: ${system.version}</p>
                <div class="text-xs text-gray-500">
                    ${system.detection_rate ? `نرخ تشخیص: ${system.detection_rate}%` : ''}
                    ${system.threats_detected !== undefined ? `تهدیدات: ${system.threats_detected}` : ''}
                </div>
            </div>`;
        }).join('');
    }

    getThreatsTab() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">سیستم‌های تشخیص تهدید</h3>
                <div class="flex gap-2">
                    <select class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm">
                        <option value="">همه شدت‌ها</option>
                        <option value="critical">بحرانی</option>
                        <option value="high">بالا</option>
                        <option value="medium">متوسط</option>
                        <option value="low">پایین</option>
                    </select>
                    <button onclick="securityModule.refreshThreats()" 
                            class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                        <i class="fas fa-refresh mr-1"></i>بروزرسانی
                    </button>
                </div>
            </div>

            <!-- Threat Detection Systems -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                ${Object.values(this.threatDetection).map(system => this.getThreatSystemCard(system)).join('')}
            </div>

            <!-- Security Alerts -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">هشدارهای امنیتی</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">زمان</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">نوع تهدید</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">شدت</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">وضعیت</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${this.securityAlerts.slice(0, 10).map(alert => this.getAlertRow(alert)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    getThreatSystemCard(system) {
        const statusColor = system.status === 'active' ? 'text-green-400' : 'text-red-400';
        const lastUpdate = new Date(system.last_update || system.last_scan).toLocaleDateString('fa-IR');
        
        return `
        <div class="bg-gray-800 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-white">${system.name}</h4>
                    <p class="text-sm ${statusColor}">${system.status === 'active' ? 'فعال' : 'غیرفعال'}</p>
                </div>
                <span class="text-xs bg-gray-700 px-2 py-1 rounded">v${system.version}</span>
            </div>
            
            <div class="space-y-2 text-sm">
                ${system.detection_rate ? `
                <div class="flex justify-between">
                    <span class="text-gray-400">نرخ تشخیص:</span>
                    <span class="text-white">${system.detection_rate}%</span>
                </div>` : ''}
                
                ${system.threats_detected !== undefined ? `
                <div class="flex justify-between">
                    <span class="text-gray-400">تهدیدات شناسایی شده:</span>
                    <span class="text-white">${system.threats_detected}</span>
                </div>` : ''}
                
                ${system.rules_count ? `
                <div class="flex justify-between">
                    <span class="text-gray-400">قوانین:</span>
                    <span class="text-white">${system.rules_count.toLocaleString()}</span>
                </div>` : ''}
                
                <div class="flex justify-between">
                    <span class="text-gray-400">آخرین بروزرسانی:</span>
                    <span class="text-white">${lastUpdate}</span>
                </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-gray-700">
                <div class="flex gap-2">
                    <button onclick="securityModule.configureSystem('${system.id}')" 
                            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        تنظیم
                    </button>
                    <button onclick="securityModule.updateSystem('${system.id}')" 
                            class="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        بروزرسانی
                    </button>
                </div>
            </div>
        </div>`;
    }

    getAlertRow(alert) {
        const severityColor = {
            'low': 'text-green-400',
            'medium': 'text-yellow-400',
            'high': 'text-orange-400',
            'critical': 'text-red-400'
        }[alert.severity] || 'text-gray-400';
        
        const statusColor = {
            'open': 'text-red-400',
            'investigating': 'text-yellow-400',
            'resolved': 'text-green-400',
            'false_positive': 'text-gray-400'
        }[alert.status] || 'text-gray-400';
        
        const timestamp = new Date(alert.timestamp).toLocaleString('fa-IR');
        
        return `
        <tr class="hover:bg-gray-800">
            <td class="px-3 py-2 text-white">${timestamp}</td>
            <td class="px-3 py-2 text-white">${alert.title}</td>
            <td class="px-3 py-2">
                <span class="${severityColor} font-semibold">${alert.severity}</span>
            </td>
            <td class="px-3 py-2">
                <span class="${statusColor}">${alert.status}</span>
            </td>
            <td class="px-3 py-2">
                <div class="flex gap-1">
                    <button onclick="securityModule.investigateAlert('${alert.id}')" 
                            class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        <i class="fas fa-search"></i>
                    </button>
                    <button onclick="securityModule.resolveAlert('${alert.id}')" 
                            class="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }

    getAuditTab() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">لاگ‌های حسابرسی</h3>
                <div class="flex gap-2">
                    <input type="date" class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm">
                    <select class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm">
                        <option value="">همه اعمال</option>
                        <option value="login">ورود</option>
                        <option value="config">تغییر تنظیمات</option>
                        <option value="admin">دسترسی مدیر</option>
                        <option value="api">درخواست API</option>
                    </select>
                    <button onclick="securityModule.exportAuditLogs()" 
                            class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                        <i class="fas fa-download mr-1"></i>خروجی
                    </button>
                </div>
            </div>
            
            <div class="bg-gray-900 rounded-lg overflow-hidden">
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800 sticky top-0">
                            <tr>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">زمان</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">کاربر</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">عمل</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">شدت</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">وضعیت</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">IP</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${this.auditLogs.slice(0, 30).map(log => this.getAuditLogRow(log)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    getAuditLogRow(log) {
        const severityColor = {
            'info': 'text-blue-400',
            'warning': 'text-yellow-400',
            'error': 'text-red-400',
            'critical': 'text-red-600'
        }[log.severity] || 'text-gray-400';
        
        const statusColor = {
            'success': 'text-green-400',
            'failed': 'text-red-400',
            'pending': 'text-yellow-400'
        }[log.status] || 'text-gray-400';
        
        const timestamp = new Date(log.timestamp).toLocaleString('fa-IR');
        
        return `
        <tr class="hover:bg-gray-800">
            <td class="px-3 py-2 text-white">${timestamp}</td>
            <td class="px-3 py-2 text-gray-300">${log.user_id}</td>
            <td class="px-3 py-2 text-white">${log.action}</td>
            <td class="px-3 py-2">
                <span class="${severityColor}">${log.severity}</span>
            </td>
            <td class="px-3 py-2">
                <span class="${statusColor}">${log.status}</span>
            </td>
            <td class="px-3 py-2 text-gray-300">${log.ip_address}</td>
        </tr>`;
    }

    getEncryptionTab() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">مدیریت رمزگذاری</h3>
                <button onclick="securityModule.rotateKeys()" 
                        class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">
                    <i class="fas fa-key mr-2"></i>چرخش کلیدها
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                ${Object.entries(this.encryptionManagement).map(([key, config]) => this.getEncryptionCard(key, config)).join('')}
            </div>
        </div>`;
    }

    getEncryptionCard(type, config) {
        const typeNames = {
            'data_at_rest': 'داده‌های ذخیره شده',
            'data_in_transit': 'داده‌های در حال انتقال',
            'api_security': 'امنیت API',
            'database_encryption': 'رمزگذاری دیتابیس'
        };
        
        const typeName = typeNames[type] || type;
        
        return `
        <div class="bg-gray-900 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-white mb-4">${typeName}</h4>
            
            <div class="space-y-3 text-sm">
                ${Object.entries(config).map(([key, value]) => {
                    if (typeof value === 'boolean') {
                        return `
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">${key.replace(/_/g, ' ')}:</span>
                            <span class="${value ? 'text-green-400' : 'text-red-400'}">
                                <i class="fas ${value ? 'fa-check' : 'fa-times'}"></i>
                            </span>
                        </div>`;
                    } else if (key.includes('expiry') || key.includes('rotation')) {
                        const date = new Date(value).toLocaleDateString('fa-IR');
                        return `
                        <div class="flex justify-between">
                            <span class="text-gray-400">${key.replace(/_/g, ' ')}:</span>
                            <span class="text-white">${date}</span>
                        </div>`;
                    } else if (Array.isArray(value)) {
                        return `
                        <div class="flex justify-between">
                            <span class="text-gray-400">${key.replace(/_/g, ' ')}:</span>
                            <span class="text-white">${value.length} مورد</span>
                        </div>`;
                    } else {
                        return `
                        <div class="flex justify-between">
                            <span class="text-gray-400">${key.replace(/_/g, ' ')}:</span>
                            <span class="text-white">${value}</span>
                        </div>`;
                    }
                }).join('')}
            </div>
        </div>`;
    }

    getComplianceTab() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">چارچوب‌های انطباق</h3>
                <button onclick="securityModule.runComplianceAudit()" 
                        class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                    <i class="fas fa-clipboard-check mr-2"></i>حسابرسی انطباق
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                ${Object.values(this.compliance).map(framework => this.getComplianceCard(framework)).join('')}
            </div>

            <!-- Vulnerability Assessment -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-bug text-red-400 mr-2"></i>
                    ارزیابی آسیب‌پذیری
                </h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">CVE ID</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">عنوان</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">شدت</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">امتیاز CVSS</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">وضعیت</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${this.vulnerabilities.slice(0, 10).map(vuln => this.getVulnerabilityRow(vuln)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    getComplianceCard(framework) {
        const statusColor = {
            'compliant': 'text-green-400',
            'in_progress': 'text-yellow-400',
            'non_compliant': 'text-red-400'
        }[framework.status] || 'text-gray-400';
        
        const lastAudit = new Date(framework.last_audit).toLocaleDateString('fa-IR');
        
        return `
        <div class="bg-gray-800 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-white">${framework.name}</h4>
                    <p class="text-sm ${statusColor}">
                        ${framework.status === 'compliant' ? 'منطبق' : 
                          framework.status === 'in_progress' ? 'در حال اجرا' : 'غیرمنطبق'}
                    </p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-white">${framework.compliance_score}%</div>
                    <div class="text-xs text-gray-400">امتیاز انطباق</div>
                </div>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">الزامات تحقق یافته:</span>
                    <span class="text-white">${framework.requirements_met}/${framework.total_requirements}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">آخرین حسابرسی:</span>
                    <span class="text-white">${lastAudit}</span>
                </div>
                ${framework.certification_target ? `
                <div class="flex justify-between">
                    <span class="text-gray-400">هدف گواهینامه:</span>
                    <span class="text-white">${new Date(framework.certification_target).toLocaleDateString('fa-IR')}</span>
                </div>` : ''}
            </div>
            
            <!-- Progress Bar -->
            <div class="mt-4">
                <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="h-2 rounded-full ${framework.compliance_score >= 95 ? 'bg-green-500' : framework.compliance_score >= 80 ? 'bg-yellow-500' : 'bg-red-500'}" 
                         style="width: ${framework.compliance_score}%"></div>
                </div>
            </div>
        </div>`;
    }

    getVulnerabilityRow(vuln) {
        const severityColor = {
            'Low': 'text-green-400',
            'Medium': 'text-yellow-400',
            'High': 'text-orange-400',
            'Critical': 'text-red-400'
        }[vuln.severity] || 'text-gray-400';
        
        const statusColor = {
            'Open': 'text-red-400',
            'In Progress': 'text-yellow-400',
            'Fixed': 'text-green-400',
            'Accepted Risk': 'text-gray-400'
        }[vuln.status] || 'text-gray-400';
        
        return `
        <tr class="hover:bg-gray-800">
            <td class="px-3 py-2 text-blue-400">${vuln.cve_id}</td>
            <td class="px-3 py-2 text-white">${vuln.title}</td>
            <td class="px-3 py-2">
                <span class="${severityColor} font-semibold">${vuln.severity}</span>
            </td>
            <td class="px-3 py-2 text-white">${vuln.cvss_score}</td>
            <td class="px-3 py-2">
                <span class="${statusColor}">${vuln.status}</span>
            </td>
            <td class="px-3 py-2">
                <div class="flex gap-1">
                    <button onclick="securityModule.viewVulnerability('${vuln.id}')" 
                            class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="securityModule.fixVulnerability('${vuln.id}')" 
                            class="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        <i class="fas fa-wrench"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }

    // Tab Management
    switchSecurityTab(tabName) {
        console.log('🔄 Switching security tab to:', tabName);
        
        // Update tab styles
        document.querySelectorAll('.security-tab').forEach(tab => {
            tab.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
            tab.classList.add('text-gray-400');
        });
        
        const activeTab = document.querySelector(`[onclick="securityModule.switchSecurityTab('${tabName}')"]`);
        if (activeTab) {
            activeTab.classList.remove('text-gray-400');
            activeTab.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
        }
        
        // Update content
        const container = document.getElementById('security-tab-content');
        if (container) {
            switch (tabName) {
                case 'dashboard':
                    container.innerHTML = this.getDashboardTab();
                    break;
                case 'threats':
                    container.innerHTML = this.getThreatsTab();
                    break;
                case 'audit':
                    container.innerHTML = this.getAuditTab();
                    break;
                case 'encryption':
                    container.innerHTML = this.getEncryptionTab();
                    break;
                case 'compliance':
                    container.innerHTML = this.getComplianceTab();
                    break;
            }
        }
    }

    // Security Operations
    runSecurityScan() {
        console.log('🔍 Running security scan...');
        alert('🔍 اسکن امنیتی جامع آغاز شد. نتایج در تب تشخیص تهدید نمایش داده خواهد شد.');
    }

    generateSecurityReport() {
        console.log('📊 Generating security report...');
        alert('📊 گزارش امنیتی جامع در حال تولید است. فایل PDF به زودی آماده خواهد شد.');
    }

    refreshThreats() {
        console.log('🔄 Refreshing threat data...');
        this.generateSecurityAlerts();
        this.switchSecurityTab('threats');
    }

    configureSystem(systemId) {
        const system = this.threatDetection[systemId];
        console.log('⚙️ Configuring system:', system.name);
        alert(`⚙️ تنظیمات ${system.name} در نسخه‌های آتی اضافه خواهد شد.`);
    }

    updateSystem(systemId) {
        const system = this.threatDetection[systemId];
        console.log('📥 Updating system:', system.name);
        alert(`📥 بروزرسانی ${system.name} آغاز شد.`);
    }

    investigateAlert(alertId) {
        console.log('🔍 Investigating alert:', alertId);
        alert('🔍 بررسی تفصیلی هشدار آغاز شد.');
    }

    resolveAlert(alertId) {
        console.log('✅ Resolving alert:', alertId);
        const alert = this.securityAlerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'resolved';
            this.switchSecurityTab('threats');
        }
    }

    exportAuditLogs() {
        console.log('📥 Exporting audit logs...');
        alert('📥 خروجی لاگ‌های حسابرسی در حال آماده‌سازی است.');
    }

    rotateKeys() {
        console.log('🔄 Rotating encryption keys...');
        alert('🔄 چرخش کلیدهای رمزگذاری آغاز شد. این عملیات چند دقیقه طول می‌کشد.');
    }

    runComplianceAudit() {
        console.log('📋 Running compliance audit...');
        alert('📋 حسابرسی انطباق جامع آغاز شد. نتایج در چند ساعت آینده آماده خواهد شد.');
    }

    viewVulnerability(vulnId) {
        const vuln = this.vulnerabilities.find(v => v.id === vulnId);
        console.log('👁️ Viewing vulnerability:', vuln.title);
        alert(`👁️ جزئیات آسیب‌پذیری: ${vuln.title}\n\nCVE ID: ${vuln.cve_id}\nCVSS Score: ${vuln.cvss_score}\nStatus: ${vuln.status}`);
    }

    fixVulnerability(vulnId) {
        console.log('🔧 Fixing vulnerability:', vulnId);
        const vuln = this.vulnerabilities.find(v => v.id === vulnId);
        if (vuln) {
            vuln.status = 'In Progress';
            this.switchSecurityTab('compliance');
        }
    }
}

// Register module globally
window.TitanModules = window.TitanModules || {};
window.TitanModules.AdvancedSecurityModule = AdvancedSecurityModule;

// Create global instance
window.securityModule = null;

console.log('✅ Advanced Security Module registered successfully');