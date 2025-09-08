// Settings Module for Titan Trading System - Complete Implementation
// Comprehensive system configuration and user preferences

class SettingsModule {
    constructor() {
        this.currentTab = 'general';
        this.settings = {
            general: {
                theme: 'dark',
                language: 'fa',
                rtl: true,
                timezone: 'Asia/Tehran',
                currency: 'USD',
                dateFormat: 'jYYYY/jMM/jDD',
                numberFormat: 'fa-IR'
            },
            notifications: {
                email: {
                    enabled: true,
                    smtp_host: '',
                    smtp_port: 587,
                    smtp_user: '',
                    smtp_pass: '',
                    from_email: '',
                    from_name: 'TITAN Trading System'
                },
                telegram: {
                    enabled: false,
                    bot_token: '',
                    chat_id: '',
                    parse_mode: 'HTML'
                },
                whatsapp: {
                    enabled: false,
                    api_token: '',
                    phone_number: '',
                    instance_id: ''
                },
                sms: {
                    enabled: false,
                    provider: 'kavenegar', // kavenegar, twilio
                    api_key: '',
                    sender: 'TITAN'
                },
                discord: {
                    enabled: false,
                    webhook_url: '',
                    username: 'TITAN Bot'
                },
                inapp: {
                    enabled: true,
                    sound: true,
                    desktop: true,
                    mobile: true
                }
            },
            exchanges: {
                binance: {
                    enabled: false,
                    api_key: '',
                    api_secret: '',
                    testnet: true,
                    rate_limit: 1000
                },
                coinbase: {
                    enabled: false,
                    api_key: '',
                    api_secret: '',
                    passphrase: '',
                    sandbox: true
                },
                kucoin: {
                    enabled: false,
                    api_key: '',
                    api_secret: '',
                    passphrase: '',
                    sandbox: true
                }
            },
            ai: {
                openai: {
                    enabled: false,
                    api_key: '',
                    model: 'gpt-4',
                    max_tokens: 2000
                },
                anthropic: {
                    enabled: false,
                    api_key: '',
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 2000
                },
                gemini: {
                    enabled: false,
                    api_key: '',
                    model: 'gemini-pro',
                    max_tokens: 2000
                },
                // Feature 1: Advanced Artemis & AI Management
                artemis: {
                    enabled: true,
                    mother_ai: {
                        intelligence_level: 'high',
                        learning_rate: 0.01,
                        memory_capacity: 10000,
                        decision_confidence: 0.85,
                        collective_intelligence: true,
                        auto_optimize: true
                    },
                    agents: {
                        market_analyzer: {
                            enabled: true,
                            priority: 1,
                            learning_mode: 'supervised',
                            confidence_threshold: 0.8,
                            data_sources: ['price', 'volume', 'indicators'],
                            training_frequency: 'daily'
                        },
                        sentiment_analyzer: {
                            enabled: true,
                            priority: 2,
                            learning_mode: 'unsupervised',
                            confidence_threshold: 0.75,
                            data_sources: ['news', 'social', 'fear_greed'],
                            training_frequency: 'hourly'
                        },
                        risk_manager: {
                            enabled: true,
                            priority: 1,
                            learning_mode: 'reinforcement',
                            confidence_threshold: 0.9,
                            data_sources: ['portfolio', 'market_conditions'],
                            training_frequency: 'real_time'
                        },
                        pattern_detector: {
                            enabled: true,
                            priority: 3,
                            learning_mode: 'deep_learning',
                            confidence_threshold: 0.7,
                            data_sources: ['charts', 'historical_data'],
                            training_frequency: 'weekly'
                        },
                        portfolio_optimizer: {
                            enabled: true,
                            priority: 2,
                            learning_mode: 'genetic_algorithm',
                            confidence_threshold: 0.85,
                            data_sources: ['performance', 'allocation'],
                            training_frequency: 'daily'
                        },
                        news_processor: {
                            enabled: true,
                            priority: 3,
                            learning_mode: 'nlp',
                            confidence_threshold: 0.8,
                            data_sources: ['news_feeds', 'announcements'],
                            training_frequency: 'real_time'
                        },
                        signal_generator: {
                            enabled: true,
                            priority: 1,
                            learning_mode: 'ensemble',
                            confidence_threshold: 0.88,
                            data_sources: ['all_agents'],
                            training_frequency: 'continuous'
                        },
                        execution_optimizer: {
                            enabled: true,
                            priority: 1,
                            learning_mode: 'reinforcement',
                            confidence_threshold: 0.92,
                            data_sources: ['order_book', 'execution_history'],
                            training_frequency: 'real_time'
                        },
                        anomaly_detector: {
                            enabled: true,
                            priority: 2,
                            learning_mode: 'outlier_detection',
                            confidence_threshold: 0.95,
                            data_sources: ['all_data_streams'],
                            training_frequency: 'continuous'
                        },
                        correlation_finder: {
                            enabled: true,
                            priority: 3,
                            learning_mode: 'statistical',
                            confidence_threshold: 0.82,
                            data_sources: ['cross_market_data'],
                            training_frequency: 'daily'
                        },
                        volatility_predictor: {
                            enabled: true,
                            priority: 2,
                            learning_mode: 'time_series',
                            confidence_threshold: 0.78,
                            data_sources: ['volatility_history', 'vix_data'],
                            training_frequency: 'hourly'
                        },
                        liquidity_analyzer: {
                            enabled: true,
                            priority: 2,
                            learning_mode: 'market_microstructure',
                            confidence_threshold: 0.85,
                            data_sources: ['order_book', 'depth_data'],
                            training_frequency: 'real_time'
                        },
                        trend_forecaster: {
                            enabled: true,
                            priority: 1,
                            learning_mode: 'lstm',
                            confidence_threshold: 0.83,
                            data_sources: ['price_trends', 'momentum_data'],
                            training_frequency: 'daily'
                        },
                        arbitrage_hunter: {
                            enabled: false,
                            priority: 3,
                            learning_mode: 'real_time_comparison',
                            confidence_threshold: 0.95,
                            data_sources: ['multi_exchange_data'],
                            training_frequency: 'continuous'
                        },
                        meta_learner: {
                            enabled: true,
                            priority: 1,
                            learning_mode: 'meta_learning',
                            confidence_threshold: 0.9,
                            data_sources: ['all_agents_performance'],
                            training_frequency: 'weekly'
                        }
                    },
                    auto_training: {
                        enabled: true,
                        schedule: 'adaptive',
                        performance_threshold: 0.75,
                        data_retention_days: 90,
                        model_versioning: true,
                        a_b_testing: true,
                        rollback_on_failure: true
                    },
                    context_memory: {
                        enabled: true,
                        max_conversations: 1000,
                        memory_compression: true,
                        semantic_indexing: true,
                        context_window: 32000,
                        relevance_scoring: true,
                        auto_cleanup: true,
                        cleanup_threshold_days: 30
                    },
                    collective_intelligence: {
                        enabled: true,
                        consensus_algorithm: 'weighted_voting',
                        agent_collaboration: true,
                        knowledge_sharing: true,
                        swarm_optimization: true,
                        emergent_behavior_detection: true
                    }
                }
            },
            trading: {
                risk_management: {
                    max_risk_per_trade: 2,
                    max_daily_loss: 5,
                    max_positions: 10,
                    stop_loss_default: 2,
                    take_profit_default: 6
                },
                auto_trading: {
                    enabled: false,
                    strategies: ['momentum', 'mean_reversion'],
                    min_confidence: 0.7,
                    max_amount_per_trade: 100
                },
                alerts: {
                    price_alerts: true,
                    trade_alerts: true,
                    ai_insights: true,
                    system_alerts: true
                },
                // Feature 2: Autopilot Settings
                autopilot: {
                    enabled: false,
                    mode: 'balanced', // conservative, balanced, aggressive, custom
                    modes: {
                        conservative: {
                            name: 'محافظه‌کارانه',
                            max_risk_per_trade: 1,
                            max_daily_loss: 3,
                            max_positions: 5,
                            min_confidence: 0.85,
                            strategies: ['mean_reversion', 'support_resistance'],
                            take_profit_multiplier: 1.5,
                            stop_loss_multiplier: 0.8,
                            position_sizing: 'fixed_percent',
                            rebalance_frequency: 'daily'
                        },
                        balanced: {
                            name: 'متعادل',
                            max_risk_per_trade: 2,
                            max_daily_loss: 5,
                            max_positions: 10,
                            min_confidence: 0.75,
                            strategies: ['momentum', 'mean_reversion', 'trend_following'],
                            take_profit_multiplier: 2.0,
                            stop_loss_multiplier: 1.0,
                            position_sizing: 'kelly_criterion',
                            rebalance_frequency: 'hourly'
                        },
                        aggressive: {
                            name: 'تهاجمی',
                            max_risk_per_trade: 5,
                            max_daily_loss: 10,
                            max_positions: 20,
                            min_confidence: 0.65,
                            strategies: ['momentum', 'breakout', 'scalping', 'arbitrage'],
                            take_profit_multiplier: 3.0,
                            stop_loss_multiplier: 1.2,
                            position_sizing: 'optimal_f',
                            rebalance_frequency: 'real_time'
                        },
                        custom: {
                            name: 'سفارشی',
                            max_risk_per_trade: 2.5,
                            max_daily_loss: 7,
                            max_positions: 15,
                            min_confidence: 0.8,
                            strategies: ['momentum', 'mean_reversion'],
                            take_profit_multiplier: 2.5,
                            stop_loss_multiplier: 1.1,
                            position_sizing: 'volatility_adjusted',
                            rebalance_frequency: 'adaptive'
                        }
                    },
                    strategies: {
                        momentum: {
                            enabled: true,
                            weight: 0.25,
                            lookback_period: 14,
                            threshold: 0.02,
                            min_volume_ratio: 1.5
                        },
                        mean_reversion: {
                            enabled: true,
                            weight: 0.25,
                            rsi_oversold: 30,
                            rsi_overbought: 70,
                            bollinger_deviation: 2.0
                        },
                        trend_following: {
                            enabled: false,
                            weight: 0.20,
                            ma_short: 20,
                            ma_long: 50,
                            trend_strength_min: 0.6
                        },
                        breakout: {
                            enabled: false,
                            weight: 0.15,
                            breakout_threshold: 0.03,
                            volume_confirmation: true,
                            consolidation_period: 20
                        },
                        support_resistance: {
                            enabled: false,
                            weight: 0.15,
                            lookback_period: 50,
                            touch_threshold: 0.005,
                            strength_filter: 3
                        },
                        scalping: {
                            enabled: false,
                            weight: 0.10,
                            timeframe: '1m',
                            spread_threshold: 0.001,
                            liquidity_min: 1000000
                        },
                        arbitrage: {
                            enabled: false,
                            weight: 0.05,
                            min_profit_bps: 10,
                            execution_delay_max: 500,
                            exchanges: ['binance', 'coinbase']
                        }
                    },
                    safety_controls: {
                        emergency_stop: {
                            enabled: true,
                            triggers: {
                                max_drawdown: 15,
                                consecutive_losses: 5,
                                daily_loss_limit: 10,
                                system_error_count: 3
                            }
                        },
                        circuit_breakers: {
                            enabled: true,
                            market_volatility_threshold: 5,
                            trading_halt_duration: 30,
                            cool_down_period: 60
                        },
                        position_limits: {
                            max_portfolio_exposure: 80,
                            max_single_asset_weight: 20,
                            correlation_limit: 0.7,
                            sector_concentration_limit: 30
                        }
                    },
                    portfolio_management: {
                        auto_rebalancing: {
                            enabled: true,
                            frequency: 'daily',
                            threshold: 0.05,
                            method: 'threshold_based'
                        },
                        cash_management: {
                            target_cash_ratio: 0.1,
                            min_cash_buffer: 0.05,
                            max_cash_idle: 0.25
                        },
                        risk_parity: {
                            enabled: false,
                            volatility_target: 0.15,
                            correlation_adjustment: true,
                            lookback_period: 252
                        }
                    },
                    execution: {
                        order_type: 'limit',
                        slippage_tolerance: 0.001,
                        partial_fill_handling: 'accept',
                        retry_attempts: 3,
                        timeout_seconds: 30,
                        smart_routing: true
                    },
                    monitoring: {
                        performance_tracking: true,
                        real_time_analytics: true,
                        alerts_enabled: true,
                        reporting_frequency: 'daily',
                        benchmark_tracking: true
                    }
                },
                // Feature 4: Advanced Trading Rules
                advanced_rules: {
                    enabled: true,
                    global_rules: {
                        max_leverage: 10,
                        min_volume_24h: 1000000,
                        blacklisted_symbols: ['LUNA', 'UST'],
                        whitelisted_symbols: [],
                        market_conditions: {
                            bear_market_mode: false,
                            volatility_threshold: 5,
                            volume_spike_threshold: 200
                        }
                    },
                    entry_rules: [
                        {
                            id: 'rule_001',
                            name: 'High Confidence Momentum',
                            enabled: true,
                            priority: 1,
                            conditions: {
                                ai_confidence: { min: 85, max: 100 },
                                rsi: { min: 30, max: 70 },
                                volume_ratio: { min: 1.5, max: null },
                                price_change_24h: { min: -5, max: 15 }
                            },
                            actions: {
                                position_size: 50,
                                stop_loss: 2,
                                take_profit: 6,
                                max_hold_time: 24
                            }
                        },
                        {
                            id: 'rule_002',
                            name: 'Oversold Reversal',
                            enabled: true,
                            priority: 2,
                            conditions: {
                                ai_confidence: { min: 70, max: 100 },
                                rsi: { min: 0, max: 30 },
                                price_change_7d: { min: -20, max: -5 },
                                support_level_distance: { min: 0, max: 2 }
                            },
                            actions: {
                                position_size: 30,
                                stop_loss: 3,
                                take_profit: 8,
                                max_hold_time: 48
                            }
                        }
                    ],
                    exit_rules: [
                        {
                            id: 'exit_001',
                            name: 'Profit Protection',
                            enabled: true,
                            priority: 1,
                            conditions: {
                                profit_percentage: { min: 5, max: null },
                                rsi: { min: 70, max: 100 },
                                time_in_position: { min: 2, max: null }
                            },
                            actions: {
                                exit_percentage: 50,
                                trailing_stop: 1.5
                            }
                        },
                        {
                            id: 'exit_002',
                            name: 'Loss Limitation',
                            enabled: true,
                            priority: 2,
                            conditions: {
                                loss_percentage: { min: null, max: -2 },
                                ai_confidence_drop: { min: null, max: 50 }
                            },
                            actions: {
                                exit_percentage: 100,
                                immediate_exit: true
                            }
                        }
                    ],
                    schedule_rules: [
                        {
                            id: 'schedule_001',
                            name: 'Market Hours Only',
                            enabled: false,
                            timezone: 'UTC',
                            allowed_hours: [
                                { start: '09:00', end: '16:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
                            ],
                            blocked_periods: [
                                { start: '2024-12-25T00:00:00Z', end: '2024-12-25T23:59:59Z', reason: 'Christmas' }
                            ]
                        }
                    ]
                }
            },
            // Feature 3: System Status Configuration
            system_monitoring: {
                enabled: true,
                performance_thresholds: {
                    cpu: {
                        warning: 70,
                        critical: 90,
                        check_interval: 30
                    },
                    memory: {
                        warning: 75,
                        critical: 90,
                        check_interval: 30
                    },
                    disk: {
                        warning: 80,
                        critical: 95,
                        check_interval: 300
                    },
                    network: {
                        latency_warning: 200,
                        latency_critical: 500,
                        packet_loss_warning: 1,
                        packet_loss_critical: 5,
                        check_interval: 60
                    }
                },
                health_checks: {
                    api_endpoints: {
                        enabled: true,
                        timeout: 5000,
                        retry_attempts: 3,
                        check_interval: 60,
                        endpoints: [
                            { name: 'Trading API', url: '/api/trading/status', critical: true },
                            { name: 'Market Data', url: '/api/market/status', critical: true },
                            { name: 'AI Analytics', url: '/api/ai-analytics/status', critical: false },
                            { name: 'User Auth', url: '/api/auth/status', critical: true }
                        ]
                    },
                    database: {
                        enabled: true,
                        connection_timeout: 10000,
                        query_timeout: 5000,
                        check_interval: 120
                    },
                    external_services: {
                        enabled: true,
                        exchange_apis: true,
                        ai_providers: true,
                        notification_services: false,
                        check_interval: 300
                    }
                },
                alerting: {
                    enabled: true,
                    notification_channels: ['email', 'telegram', 'dashboard'],
                    escalation_rules: {
                        warning: {
                            delay_minutes: 5,
                            max_notifications: 3,
                            cooldown_minutes: 30
                        },
                        critical: {
                            delay_minutes: 1,
                            max_notifications: 10,
                            cooldown_minutes: 15
                        }
                    },
                    maintenance_mode: {
                        enabled: false,
                        suppress_alerts: true,
                        custom_message: ''
                    }
                },
                logging: {
                    level: 'info', // debug, info, warn, error
                    retention_days: 30,
                    max_file_size: 100, // MB
                    compress_old_logs: true,
                    categories: {
                        system: { enabled: true, level: 'info' },
                        trading: { enabled: true, level: 'info' },
                        ai: { enabled: true, level: 'info' },
                        security: { enabled: true, level: 'warn' },
                        performance: { enabled: true, level: 'info' },
                        api: { enabled: true, level: 'warn' },
                        database: { enabled: true, level: 'error' }
                    }
                },
                resource_limits: {
                    max_concurrent_requests: 100,
                    rate_limiting: {
                        enabled: true,
                        requests_per_minute: 1000,
                        burst_size: 50
                    },
                    memory_limits: {
                        heap_warning: 1024, // MB
                        heap_critical: 1536, // MB
                        gc_warning_threshold: 10 // % time spent in GC
                    },
                    process_limits: {
                        max_cpu_time: 300, // seconds
                        max_open_files: 1024,
                        max_child_processes: 10
                    }
                },
                backup_monitoring: {
                    enabled: true,
                    schedule_check: true,
                    backup_age_warning: 24, // hours
                    backup_age_critical: 72, // hours
                    backup_size_monitoring: true,
                    integrity_checks: true
                }
            },
            // Feature 4: Advanced Trading Rules
            advanced_trading_rules: {
                enabled: true,
                risk_management: {
                    max_portfolio_risk: 10, // Maximum portfolio risk percentage
                    max_single_position_risk: 2, // Maximum risk per single position
                    correlation_limit: 0.7, // Maximum correlation between positions
                    sector_concentration_limit: 25, // Maximum sector exposure percentage
                    currency_exposure_limit: 40, // Maximum single currency exposure
                    leverage_limit: 5, // Maximum leverage multiplier
                    var_limit: 5, // Value at Risk limit (%)
                    expected_shortfall_limit: 7 // Expected Shortfall limit (%)
                },
                position_sizing: {
                    method: 'kelly_optimized', // kelly, fixed_percent, volatility_adjusted, optimal_f, kelly_optimized
                    base_position_size: 5, // Base position size percentage
                    volatility_adjustment: true, // Adjust size based on volatility
                    liquidity_adjustment: true, // Adjust size based on liquidity
                    confidence_scaling: true, // Scale based on signal confidence
                    max_position_size: 10, // Maximum position size percentage
                    min_position_size: 1, // Minimum position size percentage
                    rebalance_threshold: 5, // Rebalance when deviation exceeds this %
                    compound_returns: true // Use compounding for position sizing
                },
                stop_loss_take_profit: {
                    dynamic_stops: true, // Use dynamic stop loss
                    trailing_stops: true, // Enable trailing stops
                    time_based_exits: true, // Enable time-based position exits
                    profit_targets: {
                        method: 'multiple_targets', // single, multiple_targets, adaptive
                        target_1: 2.0, // First profit target multiplier
                        target_2: 3.0, // Second profit target multiplier
                        target_3: 5.0, // Third profit target multiplier
                        partial_close_1: 30, // Percentage to close at target 1
                        partial_close_2: 50, // Percentage to close at target 2
                        partial_close_3: 100 // Percentage to close at target 3
                    },
                    stop_loss: {
                        method: 'atr_based', // fixed, atr_based, volatility_based, support_resistance
                        atr_multiplier: 2.0, // ATR multiplier for stop loss
                        max_stop_distance: 5, // Maximum stop loss distance percentage
                        min_stop_distance: 0.5, // Minimum stop loss distance percentage
                        breakeven_trigger: 1.5, // Move to breakeven at this profit ratio
                        trail_activation: 2.0, // Activate trailing at this profit ratio
                        trail_step: 0.5 // Trailing step size as ATR multiplier
                    }
                },
                portfolio_protection: {
                    daily_loss_limit: 3, // Daily loss limit percentage
                    weekly_loss_limit: 8, // Weekly loss limit percentage
                    monthly_loss_limit: 15, // Monthly loss limit percentage
                    drawdown_limit: 10, // Maximum drawdown percentage
                    consecutive_losses_limit: 5, // Stop after consecutive losses
                    win_rate_threshold: 40, // Minimum win rate percentage
                    profit_factor_threshold: 1.2, // Minimum profit factor
                    recovery_mode: {
                        enabled: true,
                        trigger_drawdown: 8, // Activate recovery mode at this drawdown
                        reduced_position_size: 50, // Reduce position size by this percentage
                        stricter_filters: true, // Apply stricter entry filters
                        max_positions: 3 // Limit concurrent positions in recovery
                    }
                },
                market_conditions: {
                    volatility_regime_detection: true, // Detect volatility regimes
                    trend_strength_filter: true, // Filter trades based on trend strength
                    market_sentiment_filter: true, // Consider market sentiment
                    economic_calendar_filter: true, // Avoid trading during major events
                    liquidity_filter: true, // Filter based on market liquidity
                    correlation_monitoring: true, // Monitor inter-asset correlations
                    regime_parameters: {
                        high_volatility_threshold: 25, // VIX or volatility threshold
                        low_liquidity_threshold: 0.5, // Liquidity threshold
                        trend_strength_min: 0.6, // Minimum trend strength
                        sentiment_extreme_threshold: 80 // Sentiment extreme threshold
                    }
                },
                advanced_filters: {
                    time_filters: {
                        avoid_weekends: true,
                        avoid_holidays: true,
                        trading_hours_only: true,
                        avoid_low_volume_hours: true,
                        custom_blackout_periods: []
                    },
                    fundamental_filters: {
                        earnings_season_adjustment: true,
                        avoid_ex_dividend_dates: true,
                        debt_to_equity_max: 2.0,
                        current_ratio_min: 1.2,
                        revenue_growth_min: 5 // Minimum revenue growth percentage
                    },
                    technical_filters: {
                        min_volume_ratio: 1.2, // Minimum volume vs average
                        max_gap_size: 3, // Maximum gap size percentage
                        trend_confirmation_required: true,
                        support_resistance_respect: true,
                        momentum_alignment: true
                    }
                },
                emergency_controls: {
                    kill_switch: {
                        enabled: true,
                        triggers: {
                            max_daily_loss: 5,
                            max_drawdown: 12,
                            consecutive_losses: 7,
                            system_errors: 3,
                            api_failures: 5
                        },
                        actions: {
                            close_all_positions: true,
                            disable_new_trades: true,
                            send_alerts: true,
                            require_manual_restart: true
                        }
                    },
                    circuit_breakers: {
                        enabled: true,
                        rapid_loss_threshold: 2, // Percentage loss in short time
                        rapid_loss_timeframe: 5, // Minutes
                        pause_duration: 30, // Minutes to pause trading
                        escalation_levels: 3
                    }
                }
            },
            // Feature 5: Dashboard Customization
            dashboard_customization: {
                enabled: true,
                layout: {
                    grid_type: 'responsive', // responsive, fixed, masonry
                    columns: 4, // Number of columns in grid
                    gap: 16, // Gap between widgets in pixels
                    padding: 20, // Padding around dashboard
                    widget_min_height: 200, // Minimum widget height
                    widget_max_height: 600, // Maximum widget height
                    auto_resize: true, // Auto resize widgets based on content
                    compact_mode: false // Compact layout for smaller screens
                },
                widgets: {
                    portfolio_overview: {
                        enabled: true,
                        position: { x: 0, y: 0, w: 2, h: 2 },
                        config: {
                            show_balance: true,
                            show_pnl: true,
                            show_positions: true,
                            currency: 'USD',
                            refresh_interval: 5000
                        }
                    },
                    trading_chart: {
                        enabled: true,
                        position: { x: 2, y: 0, w: 2, h: 3 },
                        config: {
                            default_symbol: 'BTCUSDT',
                            default_timeframe: '1h',
                            chart_type: 'candlestick', // candlestick, line, area
                            indicators: ['EMA20', 'RSI', 'MACD'],
                            drawing_tools: true,
                            volume_bars: true,
                            grid_lines: true
                        }
                    },
                    market_overview: {
                        enabled: true,
                        position: { x: 0, y: 2, w: 1, h: 2 },
                        config: {
                            show_gainers: true,
                            show_losers: true,
                            show_volume: true,
                            max_items: 10,
                            refresh_interval: 10000
                        }
                    },
                    ai_insights: {
                        enabled: true,
                        position: { x: 1, y: 2, w: 1, h: 2 },
                        config: {
                            show_recommendations: true,
                            show_sentiment: true,
                            show_alerts: true,
                            max_insights: 5,
                            auto_refresh: true
                        }
                    },
                    performance_metrics: {
                        enabled: true,
                        position: { x: 0, y: 4, w: 2, h: 1 },
                        config: {
                            show_daily_pnl: true,
                            show_total_return: true,
                            show_win_rate: true,
                            show_sharpe_ratio: true,
                            period: '30d' // 1d, 7d, 30d, 90d, 1y
                        }
                    },
                    news_feed: {
                        enabled: true,
                        position: { x: 2, y: 3, w: 2, h: 2 },
                        config: {
                            sources: ['coindesk', 'cointelegraph', 'binance'],
                            categories: ['bitcoin', 'ethereum', 'defi'],
                            max_articles: 8,
                            show_images: true,
                            refresh_interval: 300000 // 5 minutes
                        }
                    },
                    order_book: {
                        enabled: false,
                        position: { x: 4, y: 0, w: 1, h: 3 },
                        config: {
                            symbol: 'BTCUSDT',
                            depth: 20,
                            show_spread: true,
                            precision: 2,
                            auto_refresh: true
                        }
                    },
                    recent_trades: {
                        enabled: false,
                        position: { x: 4, y: 3, w: 1, h: 2 },
                        config: {
                            max_trades: 15,
                            show_time: true,
                            show_side: true,
                            color_coding: true
                        }
                    }
                },
                themes: {
                    current: 'dark_professional', // Current active theme
                    available: {
                        dark_professional: {
                            name: 'حرفه‌ای تیره',
                            primary_bg: '#1a1a1a',
                            secondary_bg: '#2d2d2d',
                            accent_color: '#3b82f6',
                            text_primary: '#ffffff',
                            text_secondary: '#a1a1aa',
                            success_color: '#10b981',
                            error_color: '#ef4444',
                            warning_color: '#f59e0b',
                            border_color: '#374151'
                        },
                        light_minimal: {
                            name: 'مینیمال روشن',
                            primary_bg: '#ffffff',
                            secondary_bg: '#f8fafc',
                            accent_color: '#6366f1',
                            text_primary: '#1f2937',
                            text_secondary: '#6b7280',
                            success_color: '#059669',
                            error_color: '#dc2626',
                            warning_color: '#d97706',
                            border_color: '#e5e7eb'
                        },
                        blue_ocean: {
                            name: 'اقیانوس آبی',
                            primary_bg: '#0f172a',
                            secondary_bg: '#1e293b',
                            accent_color: '#0ea5e9',
                            text_primary: '#f1f5f9',
                            text_secondary: '#cbd5e1',
                            success_color: '#06b6d4',
                            error_color: '#f43f5e',
                            warning_color: '#fbbf24',
                            border_color: '#334155'
                        },
                        green_matrix: {
                            name: 'ماتریکس سبز',
                            primary_bg: '#0a0a0a',
                            secondary_bg: '#1a1a1a',
                            accent_color: '#00ff41',
                            text_primary: '#00ff41',
                            text_secondary: '#008f11',
                            success_color: '#00ff41',
                            error_color: '#ff0033',
                            warning_color: '#ffaa00',
                            border_color: '#003311'
                        }
                    }
                },
                chart_settings: {
                    default_timeframes: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
                    default_indicators: {
                        moving_averages: {
                            enabled: true,
                            types: ['SMA', 'EMA', 'WMA'],
                            periods: [9, 20, 50, 200]
                        },
                        oscillators: {
                            enabled: true,
                            types: ['RSI', 'MACD', 'Stochastic', 'Williams%R'],
                            default_periods: { RSI: 14, MACD: [12, 26, 9] }
                        },
                        volume: {
                            enabled: true,
                            show_profile: false,
                            show_delta: false
                        },
                        overlays: {
                            enabled: true,
                            bollinger_bands: true,
                            support_resistance: true,
                            fibonacci: true
                        }
                    },
                    chart_styles: {
                        candle_colors: {
                            bull: '#10b981',
                            bear: '#ef4444',
                            wick: '#6b7280'
                        },
                        grid: {
                            show: true,
                            color: '#374151',
                            style: 'solid' // solid, dashed, dotted
                        },
                        crosshair: {
                            enabled: true,
                            color: '#9ca3af',
                            style: 'dashed'
                        }
                    }
                },
                personal_views: {
                    current_view: 'default',
                    views: {
                        default: {
                            name: 'پیش‌فرض',
                            description: 'نمای استاندارد داشبورد',
                            layout: 'default_layout',
                            widgets: ['portfolio_overview', 'trading_chart', 'market_overview', 'ai_insights']
                        },
                        trading_focused: {
                            name: 'متمرکز بر معاملات',
                            description: 'نمای بهینه شده برای معاملات فعال',
                            layout: 'trading_layout',
                            widgets: ['trading_chart', 'order_book', 'recent_trades', 'portfolio_overview']
                        },
                        analysis_mode: {
                            name: 'حالت تحلیل',
                            description: 'نمای مناسب برای تحلیل بازار',
                            layout: 'analysis_layout',
                            widgets: ['trading_chart', 'market_overview', 'news_feed', 'performance_metrics']
                        },
                        monitoring: {
                            name: 'نظارت',
                            description: 'نمای نظارتی برای مدیریت پورتفولیو',
                            layout: 'monitoring_layout',
                            widgets: ['portfolio_overview', 'performance_metrics', 'ai_insights', 'news_feed']
                        }
                    }
                },
                display_settings: {
                    animation_speed: 'normal', // slow, normal, fast, disabled
                    reduce_motion: false,
                    high_contrast: false,
                    font_size: 'medium', // small, medium, large, xlarge
                    number_format: {
                        decimal_places: 2,
                        thousand_separator: ',',
                        currency_symbol_position: 'before' // before, after
                    },
                    notifications: {
                        show_toast: true,
                        toast_position: 'top-right', // top-left, top-right, bottom-left, bottom-right
                        toast_duration: 5000,
                        sound_alerts: true
                    }
                }
            },
            // Feature 6: Alert Rules Management
            alert_rules_management: {
                enabled: true,
                global_settings: {
                    max_alerts_per_minute: 10, // Rate limiting
                    alert_retention_days: 30, // How long to keep alert history
                    default_timezone: 'Asia/Tehran',
                    quiet_hours: {
                        enabled: true,
                        start_time: '23:00',
                        end_time: '07:00'
                    },
                    emergency_override: true // Override quiet hours for critical alerts
                },
                notification_channels: {
                    email: {
                        enabled: true,
                        priority_threshold: 'medium', // low, medium, high, critical
                        template_id: 'default_email',
                        batch_notifications: true,
                        batch_interval: 300, // seconds
                        max_batch_size: 10
                    },
                    telegram: {
                        enabled: true,
                        priority_threshold: 'high',
                        template_id: 'default_telegram',
                        parse_mode: 'HTML',
                        disable_preview: false
                    },
                    whatsapp: {
                        enabled: false,
                        priority_threshold: 'high',
                        template_id: 'default_whatsapp'
                    },
                    sms: {
                        enabled: false,
                        priority_threshold: 'critical',
                        template_id: 'default_sms'
                    },
                    discord: {
                        enabled: true,
                        priority_threshold: 'medium',
                        template_id: 'default_discord',
                        mention_roles: ['@traders', '@analysts']
                    },
                    push_notification: {
                        enabled: true,
                        priority_threshold: 'low',
                        template_id: 'default_push',
                        badge_count: true,
                        sound: true
                    },
                    webhook: {
                        enabled: false,
                        priority_threshold: 'medium',
                        urls: [],
                        authentication: {
                            type: 'bearer', // bearer, basic, custom
                            token: '',
                            headers: {}
                        }
                    }
                },
                alert_rules: {
                    price_alerts: {
                        rule_id: 'price_001',
                        name: 'هشدار قیمت',
                        enabled: true,
                        priority: 'medium',
                        conditions: {
                            type: 'price_threshold',
                            symbol: 'BTCUSDT',
                            condition: 'crosses_above', // crosses_above, crosses_below, equals, percentage_change
                            threshold: 50000,
                            percentage_change: null,
                            timeframe: '1m'
                        },
                        actions: {
                            channels: ['email', 'telegram', 'push_notification'],
                            template: 'price_alert_template',
                            cooldown_period: 300, // seconds between same alerts
                            max_triggers_per_day: 5
                        },
                        escalation: {
                            enabled: false,
                            levels: [
                                {
                                    delay_minutes: 5,
                                    channels: ['sms'],
                                    condition: 'not_acknowledged'
                                },
                                {
                                    delay_minutes: 15,
                                    channels: ['telegram', 'discord'],
                                    condition: 'still_active'
                                }
                            ]
                        }
                    },
                    volume_alerts: {
                        rule_id: 'volume_001',
                        name: 'هشدار حجم معاملات',
                        enabled: true,
                        priority: 'low',
                        conditions: {
                            type: 'volume_spike',
                            symbol: 'BTCUSDT',
                            condition: 'above_average',
                            multiplier: 3.0, // 3x above average
                            timeframe: '5m',
                            lookback_period: 24 // hours
                        },
                        actions: {
                            channels: ['discord', 'push_notification'],
                            template: 'volume_alert_template',
                            cooldown_period: 600,
                            max_triggers_per_day: 10
                        },
                        escalation: {
                            enabled: false
                        }
                    },
                    portfolio_alerts: {
                        rule_id: 'portfolio_001',
                        name: 'هشدار پورتفولیو',
                        enabled: true,
                        priority: 'high',
                        conditions: {
                            type: 'portfolio_pnl',
                            condition: 'loss_exceeds',
                            threshold: -5, // -5% loss
                            timeframe: 'daily'
                        },
                        actions: {
                            channels: ['email', 'telegram', 'sms'],
                            template: 'portfolio_alert_template',
                            cooldown_period: 1800,
                            max_triggers_per_day: 3
                        },
                        escalation: {
                            enabled: true,
                            levels: [
                                {
                                    delay_minutes: 10,
                                    channels: ['telegram'],
                                    condition: 'loss_continues'
                                }
                            ]
                        }
                    },
                    ai_alerts: {
                        rule_id: 'ai_001',
                        name: 'هشدارهای هوش مصنوعی',
                        enabled: true,
                        priority: 'medium',
                        conditions: {
                            type: 'ai_signal',
                            signal_type: 'strong_buy', // strong_buy, strong_sell, high_confidence
                            confidence_threshold: 0.85,
                            models: ['artemis', 'technical_analysis', 'sentiment']
                        },
                        actions: {
                            channels: ['telegram', 'discord', 'push_notification'],
                            template: 'ai_alert_template',
                            cooldown_period: 900,
                            max_triggers_per_day: 8
                        },
                        escalation: {
                            enabled: false
                        }
                    },
                    system_alerts: {
                        rule_id: 'system_001',
                        name: 'هشدارهای سیستم',
                        enabled: true,
                        priority: 'critical',
                        conditions: {
                            type: 'system_health',
                            condition: 'error_rate_high',
                            threshold: 10, // errors per minute
                            duration: 5 // minutes
                        },
                        actions: {
                            channels: ['email', 'telegram', 'sms', 'discord'],
                            template: 'system_alert_template',
                            cooldown_period: 60,
                            max_triggers_per_day: 20
                        },
                        escalation: {
                            enabled: true,
                            levels: [
                                {
                                    delay_minutes: 2,
                                    channels: ['sms'],
                                    condition: 'not_resolved'
                                },
                                {
                                    delay_minutes: 5,
                                    channels: ['webhook'],
                                    condition: 'still_critical'
                                }
                            ]
                        }
                    }
                },
                alert_templates: {
                    price_alert_template: {
                        name: 'قالب هشدار قیمت',
                        channels: {
                            email: {
                                subject: '🚨 هشدار قیمت - {{symbol}}',
                                body: `
                                    <h2>هشدار قیمت {{symbol}}</h2>
                                    <p>قیمت {{symbol}} به {{price}} رسیده است.</p>
                                    <p>شرایط: {{condition}}</p>
                                    <p>زمان: {{timestamp}}</p>
                                    <p>مشاهده داشبورد: <a href="{{dashboard_url}}">کلیک کنید</a></p>
                                `,
                                format: 'html'
                            },
                            telegram: {
                                message: `
🚨 *هشدار قیمت*
📈 نماد: {{symbol}}
💰 قیمت: {{price}}
📊 شرایط: {{condition}}
🕐 زمان: {{timestamp}}
                                `,
                                parse_mode: 'Markdown'
                            },
                            discord: {
                                message: `
🚨 **هشدار قیمت**
**نماد:** {{symbol}}
**قیمت:** {{price}}
**شرایط:** {{condition}}
**زمان:** {{timestamp}}
                                `,
                                embed: true,
                                color: '#ff6b6b'
                            },
                            push_notification: {
                                title: 'هشدار قیمت {{symbol}}',
                                body: 'قیمت به {{price}} رسید',
                                icon: 'price-alert',
                                url: '{{dashboard_url}}'
                            }
                        }
                    },
                    volume_alert_template: {
                        name: 'قالب هشدار حجم',
                        channels: {
                            telegram: {
                                message: `
📊 *هشدار حجم معاملات*
📈 نماد: {{symbol}}
📊 حجم: {{volume}}
🔥 برابر میانگین: {{multiplier}}x
🕐 زمان: {{timestamp}}
                                `,
                                parse_mode: 'Markdown'
                            },
                            discord: {
                                message: `
📊 **هشدار حجم معاملات**
**نماد:** {{symbol}}
**حجم:** {{volume}}
**برابر میانگین:** {{multiplier}}x
**زمان:** {{timestamp}}
                                `,
                                embed: true,
                                color: '#4ecdc4'
                            }
                        }
                    },
                    portfolio_alert_template: {
                        name: 'قالب هشدار پورتفولیو',
                        channels: {
                            email: {
                                subject: '⚠️ هشدار پورتفولیو - ضرر {{loss_percentage}}%',
                                body: `
                                    <h2>هشدار پورتفولیو</h2>
                                    <p><strong>ضرر:</strong> {{loss_percentage}}%</p>
                                    <p><strong>مبلغ:</strong> {{loss_amount}} {{currency}}</p>
                                    <p><strong>بازه زمانی:</strong> {{timeframe}}</p>
                                    <p><strong>زمان:</strong> {{timestamp}}</p>
                                    <p>لطفاً وضعیت پورتفولیو خود را بررسی کنید.</p>
                                `,
                                format: 'html'
                            },
                            telegram: {
                                message: `
⚠️ *هشدار پورتفولیو*
📉 ضرر: {{loss_percentage}}%
💸 مبلغ: {{loss_amount}} {{currency}}
📅 بازه: {{timeframe}}
🕐 زمان: {{timestamp}}

لطفاً فوراً بررسی کنید!
                                `,
                                parse_mode: 'Markdown'
                            }
                        }
                    },
                    ai_alert_template: {
                        name: 'قالب هشدار هوش مصنوعی',
                        channels: {
                            telegram: {
                                message: `
🤖 *سیگنال هوش مصنوعی*
📈 نماد: {{symbol}}
🎯 سیگنال: {{signal_type}}
🔥 اطمینان: {{confidence}}%
🧠 مدل‌ها: {{models}}
🕐 زمان: {{timestamp}}
                                `,
                                parse_mode: 'Markdown'
                            }
                        }
                    },
                    system_alert_template: {
                        name: 'قالب هشدار سیستم',
                        channels: {
                            email: {
                                subject: '🚨 هشدار سیستم - {{alert_type}}',
                                body: `
                                    <h2 style="color: #e74c3c;">هشدار سیستم</h2>
                                    <p><strong>نوع هشدار:</strong> {{alert_type}}</p>
                                    <p><strong>توضیحات:</strong> {{description}}</p>
                                    <p><strong>سطح:</strong> {{severity}}</p>
                                    <p><strong>زمان:</strong> {{timestamp}}</p>
                                    <p style="color: #e74c3c;">لطفاً فوراً اقدام کنید!</p>
                                `,
                                format: 'html'
                            },
                            telegram: {
                                message: `
🚨 *هشدار سیستم*
⚠️ نوع: {{alert_type}}
📝 توضیحات: {{description}}
🔴 سطح: {{severity}}
🕐 زمان: {{timestamp}}

🔧 لطفاً فوراً اقدام کنید!
                                `,
                                parse_mode: 'Markdown'
                            }
                        }
                    },
                    custom_template: {
                        name: 'قالب سفارشی',
                        channels: {
                            telegram: {
                                message: '{{custom_message}}',
                                parse_mode: 'Markdown'
                            },
                            email: {
                                subject: '{{custom_subject}}',
                                body: '{{custom_body}}',
                                format: 'html'
                            }
                        }
                    }
                },
                escalation_policies: {
                    standard_escalation: {
                        name: 'تصعید استاندارد',
                        levels: [
                            {
                                level: 1,
                                delay_minutes: 5,
                                channels: ['telegram'],
                                condition: 'not_acknowledged',
                                message: 'هشدار هنوز تأیید نشده است'
                            },
                            {
                                level: 2,
                                delay_minutes: 15,
                                channels: ['email', 'sms'],
                                condition: 'still_active',
                                message: 'هشدار هنوز فعال است'
                            },
                            {
                                level: 3,
                                delay_minutes: 30,
                                channels: ['webhook'],
                                condition: 'not_resolved',
                                message: 'هشدار حل نشده است - تماس با پشتیبانی'
                            }
                        ]
                    },
                    critical_escalation: {
                        name: 'تصعید بحرانی',
                        levels: [
                            {
                                level: 1,
                                delay_minutes: 1,
                                channels: ['sms', 'telegram'],
                                condition: 'immediate',
                                message: 'هشدار بحرانی - اقدام فوری'
                            },
                            {
                                level: 2,
                                delay_minutes: 3,
                                channels: ['email', 'discord', 'webhook'],
                                condition: 'not_acknowledged',
                                message: 'هشدار بحرانی تأیید نشده'
                            }
                        ]
                    }
                },
                alert_history: {
                    enabled: true,
                    max_records: 10000,
                    auto_cleanup: true,
                    cleanup_after_days: 90,
                    export_formats: ['json', 'csv', 'excel'],
                    analytics: {
                        enabled: true,
                        metrics: ['trigger_frequency', 'response_time', 'false_positive_rate', 'channel_effectiveness']
                    }
                }
            },
            security: {
                two_factor: {
                    enabled: false,
                    method: 'totp', // totp, sms, email
                    backup_codes: []
                },
                session: {
                    timeout: 24, // hours
                    concurrent_sessions: 3,
                    auto_logout: true
                },
                api_access: {
                    enabled: false,
                    rate_limit: 100,
                    whitelist_ips: []
                }
            }
        };
        this.isLoading = false;
        this.exchangeStatus = {};
        this.aiStatus = {};
    }

    async initialize() {
        console.log('⚙️ Initializing Settings module...');
        
        try {
            await this.loadSettings();
            this.setupEventListeners();
            console.log('✅ Settings module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing settings module:', error);
            throw error;
        }
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">⚙️ تنظیمات سیستم</h2>
                    <p class="text-gray-400 mt-1">پیکربندی کامل سیستم معاملاتی TITAN</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="settingsModule.exportSettings()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>خروجی تنظیمات
                    </button>
                    <button onclick="settingsModule.importSettings()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-upload mr-2"></i>ورودی تنظیمات
                    </button>
                </div>
            </div>

            <!-- Settings Tabs -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <!-- Tab Navigation -->
                <div class="flex border-b border-gray-700 overflow-x-auto">
                    <button onclick="settingsModule.switchTab('general')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-cog"></i>عمومی
                    </button>
                    <button onclick="settingsModule.switchTab('notifications')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'notifications' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-bell"></i>اعلان‌ها
                    </button>
                    <button onclick="settingsModule.switchTab('exchanges')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'exchanges' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-exchange-alt"></i>صرافی‌ها
                    </button>
                    <button onclick="settingsModule.switchTab('ai')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'ai' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-robot"></i>هوش مصنوعی
                    </button>
                    <button onclick="settingsModule.switchTab('ai-management')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'ai-management' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-robot"></i>مدیریت AI
                    </button>
                    <button onclick="settingsModule.switchTab('trading')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'trading' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-chart-line"></i>معاملات
                    </button>
                    <button onclick="settingsModule.switchTab('security')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-shield-alt"></i>امنیت
                    </button>
                    <button onclick="settingsModule.switchTab('users')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-users"></i>مدیریت کاربران
                    </button>
                    <button onclick="settingsModule.switchTab('system')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'system' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-cogs"></i>سیستم
                    </button>
                    <button onclick="settingsModule.switchTab('monitoring')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'monitoring' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-chart-area"></i>پایش سیستم
                    </button>
                    <button onclick="settingsModule.switchTab('wallets')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'wallets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-wallet"></i>کیف پول‌ها
                    </button>
                    <button onclick="settingsModule.switchTab('multi-exchange')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'multi-exchange' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-coins"></i>چندصرافی
                    </button>
                    <button onclick="settingsModule.switchTab('rbac')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'rbac' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-users-cog"></i>کنترل دسترسی
                    </button>
                    <button onclick="settingsModule.switchTab('backup-automation')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'backup-automation' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-database"></i>پشتیبان خودکار
                    </button>
                    <button onclick="settingsModule.switchTab('advanced-security')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'advanced-security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-shield-alt"></i>امنیت پیشرفته
                    </button>
                </div>

                <!-- Tab Content -->
                <div id="settings-tab-content" class="p-6">
                    ${this.getTabContent()}
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end gap-3">
                <button onclick="settingsModule.resetSettings()" class="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-undo mr-2"></i>بازنشانی
                </button>
                <button onclick="settingsModule.saveSettings()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                </button>
            </div>
        </div>`;
    }

    getTabContent() {
        switch (this.currentTab) {
            case 'general':
                return this.getGeneralTab();
            case 'notifications':
                return this.getNotificationsTab();
            case 'exchanges':
                return this.getExchangesTab();
            case 'ai':
                return this.getAITab();
            case 'ai-management':
                return this.getAIManagementTab();
            case 'trading':
                return this.getTradingTab();
            case 'security':
                return this.getSecurityTab();
            case 'users':
                return this.getUsersTab();
            case 'system':
                return this.getSystemTab();
            case 'monitoring':
                return this.getMonitoringTab();
            case 'wallets':
                return this.getWalletsTab();
            case 'multi-exchange':
                return this.getMultiExchangeTab();
            case 'rbac':
                return this.getRBACTab();
            case 'backup-automation':
                return this.getBackupAutomationTab();
            case 'advanced-security':
                return this.getAdvancedSecurityTab();
            default:
                return this.getGeneralTab();
        }
    }

    getGeneralTab() {
        return `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Theme Settings -->
                <div class="bg-gray-900 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-white mb-4">🎨 تنظیمات ظاهری</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">تم رنگی</label>
                            <select id="theme-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="dark" ${this.settings.general.theme === 'dark' ? 'selected' : ''}>تیره</option>
                                <option value="light" ${this.settings.general.theme === 'light' ? 'selected' : ''}>روشن</option>
                                <option value="auto" ${this.settings.general.theme === 'auto' ? 'selected' : ''}>خودکار</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">زبان سیستم</label>
                            <select id="language-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="fa" ${this.settings.general.language === 'fa' ? 'selected' : ''}>فارسی</option>
                                <option value="en" ${this.settings.general.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Regional Settings -->
                <div class="bg-gray-900 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-white mb-4">🌍 تنظیمات منطقه‌ای</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">منطقه زمانی</label>
                            <select id="timezone-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="Asia/Tehran" ${this.settings.general.timezone === 'Asia/Tehran' ? 'selected' : ''}>تهران (UTC+3:30)</option>
                                <option value="UTC" ${this.settings.general.timezone === 'UTC' ? 'selected' : ''}>UTC (UTC+0)</option>
                                <option value="America/New_York" ${this.settings.general.timezone === 'America/New_York' ? 'selected' : ''}>نیویورک (UTC-5)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ارز پیش‌فرض</label>
                            <select id="currency-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="USD" ${this.settings.general.currency === 'USD' ? 'selected' : ''}>دلار آمریکا (USD)</option>
                                <option value="USDT" ${this.settings.general.currency === 'USDT' ? 'selected' : ''}>تتر (USDT)</option>
                                <option value="BTC" ${this.settings.general.currency === 'BTC' ? 'selected' : ''}>بیت‌کوین (BTC)</option>
                                <option value="ETH" ${this.settings.general.currency === 'ETH' ? 'selected' : ''}>اتریوم (ETH)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Status -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📊 وضعیت سیستم</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">سیستم اصلی</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">صرافی‌ها</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-red-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">هوش مصنوعی</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">اعلان‌ها</div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getNotificationsTab() {
        return `
        <div class="space-y-6">
            <!-- Email Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">📧 اعلان‌های ایمیل</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="email-enabled" class="sr-only peer" ${this.settings.notifications.email.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">سرور SMTP</label>
                        <input type="text" id="smtp-host" placeholder="smtp.gmail.com" value="${this.settings.notifications.email.smtp_host}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">پورت</label>
                        <input type="number" id="smtp-port" placeholder="587" value="${this.settings.notifications.email.smtp_port}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری</label>
                        <input type="email" id="smtp-user" placeholder="your-email@gmail.com" value="${this.settings.notifications.email.smtp_user}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
                        <input type="password" id="smtp-pass" placeholder="••••••••" value="${this.settings.notifications.email.smtp_pass}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4">
                    <button onclick="settingsModule.testNotification('email')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال ایمیل
                    </button>
                </div>
            </div>

            <!-- Telegram Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">📱 اعلان‌های تلگرام</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="telegram-enabled" class="sr-only peer" ${this.settings.notifications.telegram.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">توکن ربات</label>
                        <input type="text" id="telegram-token" placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" value="${this.settings.notifications.telegram.bot_token}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">شناسه چت</label>
                        <input type="text" id="telegram-chat-id" placeholder="@your_channel یا 123456789" value="${this.settings.notifications.telegram.chat_id}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testNotification('telegram')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال تلگرام
                    </button>
                    <button onclick="settingsModule.createTelegramBot()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-robot mr-2"></i>راهنمای ساخت ربات
                    </button>
                </div>
            </div>

            <!-- WhatsApp Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">📲 اعلان‌های واتساپ</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="whatsapp-enabled" class="sr-only peer" ${this.settings.notifications.whatsapp.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">توکن API</label>
                        <input type="text" id="whatsapp-token" placeholder="WhatsApp Business API Token" value="${this.settings.notifications.whatsapp.api_token}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">شماره تلفن</label>
                        <input type="tel" id="whatsapp-phone" placeholder="+989123456789" value="${this.settings.notifications.whatsapp.phone_number}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testNotification('whatsapp')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال واتساپ
                    </button>
                    <button onclick="settingsModule.whatsappSetupGuide()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-book mr-2"></i>راهنمای راه‌اندازی
                    </button>
                </div>
            </div>

            <!-- SMS Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">💬 اعلان‌های پیامک</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="sms-enabled" class="sr-only peer" ${this.settings.notifications.sms.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">ارائه‌دهنده خدمات</label>
                        <select id="sms-provider" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="kavenegar" ${this.settings.notifications.sms.provider === 'kavenegar' ? 'selected' : ''}>کاوه‌نگار</option>
                            <option value="twilio" ${this.settings.notifications.sms.provider === 'twilio' ? 'selected' : ''}>Twilio</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">کلید API</label>
                        <input type="text" id="sms-api-key" placeholder="API Key" value="${this.settings.notifications.sms.api_key}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4">
                    <button onclick="settingsModule.testNotification('sms')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال پیامک
                    </button>
                </div>
            </div>

            <!-- In-App Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🔔 اعلان‌های داخل برنامه</h4>
                <div class="space-y-4">
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">اعلان‌های دسکتاپ</span>
                        <input type="checkbox" id="desktop-notifications" ${this.settings.notifications.inapp.desktop ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">صدای اعلان</span>
                        <input type="checkbox" id="sound-notifications" ${this.settings.notifications.inapp.sound ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">اعلان‌های موبایل</span>
                        <input type="checkbox" id="mobile-notifications" ${this.settings.notifications.inapp.mobile ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                </div>
            </div>
        </div>`;
    }

    getExchangesTab() {
        const exchanges = ['binance', 'coinbase', 'kucoin'];
        let content = '<div class="space-y-6">';
        
        exchanges.forEach(exchange => {
            const config = this.settings.exchanges[exchange];
            const status = this.exchangeStatus[exchange] || 'disconnected';
            const statusColor = status === 'connected' ? 'green' : status === 'error' ? 'red' : 'gray';
            
            content += `
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <h4 class="text-lg font-semibold text-white capitalize">${exchange}</h4>
                        <div class="w-3 h-3 bg-${statusColor}-400 rounded-full"></div>
                        <span class="text-sm text-gray-400">${status}</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="${exchange}-enabled" class="sr-only peer" ${config.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <input type="password" id="${exchange}-api-key" placeholder="••••••••••••••••" value="${config.api_key}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                        <input type="password" id="${exchange}-api-secret" placeholder="••••••••••••••••" value="${config.api_secret}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    ${exchange === 'coinbase' ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Passphrase</label>
                        <input type="password" id="${exchange}-passphrase" placeholder="••••••••" value="${config.passphrase || ''}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    ` : ''}
                    <div>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="${exchange}-testnet" ${config.testnet ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300">حالت تست (${exchange === 'binance' ? 'Testnet' : 'Sandbox'})</span>
                        </label>
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testExchange('${exchange}')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-plug mr-2"></i>تست اتصال
                    </button>
                    <button onclick="settingsModule.exchangeBalances('${exchange}')" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-coins mr-2"></i>مشاهده موجودی
                    </button>
                </div>
            </div>`;
        });
        
        content += '</div>';
        return content;
    }

    getAITab() {
        const aiProviders = [
            { key: 'openai', name: 'OpenAI GPT', icon: '🤖' },
            { key: 'anthropic', name: 'Anthropic Claude', icon: '🧠' },
            { key: 'gemini', name: 'Google Gemini', icon: '✨' }
        ];
        
        let content = '<div class="space-y-6">';
        
        aiProviders.forEach(provider => {
            const config = this.settings.ai[provider.key];
            const status = this.aiStatus[provider.key] || 'disconnected';
            const statusColor = status === 'connected' ? 'green' : status === 'error' ? 'red' : 'gray';
            
            content += `
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${provider.icon}</span>
                        <h4 class="text-lg font-semibold text-white">${provider.name}</h4>
                        <div class="w-3 h-3 bg-${statusColor}-400 rounded-full"></div>
                        <span class="text-sm text-gray-400">${status}</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="${provider.key}-enabled" class="sr-only peer" ${config.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">کلید API</label>
                        <input type="password" id="${provider.key}-api-key" placeholder="••••••••••••••••" value="${config.api_key}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">مدل</label>
                        <select id="${provider.key}-model" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            ${this.getModelOptions(provider.key, config.model)}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر توکن‌ها</label>
                        <input type="number" id="${provider.key}-max-tokens" min="100" max="8000" value="${config.max_tokens}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testAI('${provider.key}')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-brain mr-2"></i>تست هوش مصنوعی
                    </button>
                    <button onclick="settingsModule.showAIUsage('${provider.key}')" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-chart-bar mr-2"></i>میزان استفاده
                    </button>
                </div>
            </div>`;
        });
        
        // Feature 1: Advanced Artemis & AI Management Section
        content += `
            <!-- Feature 1: Artemis Mother AI Configuration -->
            <div class="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-6 border border-purple-500">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🧠</span>
                        <h3 class="text-xl font-bold text-white">Artemis Mother AI</h3>
                        <div class="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">هوش جمعی</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="artemis-enabled" class="sr-only peer" ${this.settings.ai.artemis.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
                
                <!-- Mother AI Configuration -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">سطح هوشمندی</label>
                        <select id="artemis-intelligence-level" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="low" ${this.settings.ai.artemis.mother_ai.intelligence_level === 'low' ? 'selected' : ''}>پایین - سریع</option>
                            <option value="medium" ${this.settings.ai.artemis.mother_ai.intelligence_level === 'medium' ? 'selected' : ''}>متوسط - متعادل</option>
                            <option value="high" ${this.settings.ai.artemis.mother_ai.intelligence_level === 'high' ? 'selected' : ''}>بالا - دقیق</option>
                            <option value="ultra" ${this.settings.ai.artemis.mother_ai.intelligence_level === 'ultra' ? 'selected' : ''}>فوق‌العاده - حداکثر</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نرخ یادگیری</label>
                        <input type="number" id="artemis-learning-rate" min="0.001" max="0.1" step="0.001" value="${this.settings.ai.artemis.mother_ai.learning_rate}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">ظرفیت حافظه</label>
                        <input type="number" id="artemis-memory-capacity" min="1000" max="100000" step="1000" value="${this.settings.ai.artemis.mother_ai.memory_capacity}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">آستانه اطمینان (%)</label>
                        <input type="number" id="artemis-confidence" min="50" max="99" step="1" value="${Math.round(this.settings.ai.artemis.mother_ai.decision_confidence * 100)}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="artemis-collective-intelligence" ${this.settings.ai.artemis.mother_ai.collective_intelligence ? 'checked' : ''} class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">هوش جمعی</span>
                        </label>
                    </div>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="artemis-auto-optimize" ${this.settings.ai.artemis.mother_ai.auto_optimize ? 'checked' : ''} class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">بهینه‌سازی خودکار</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- 15 AI Agents Configuration -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🤖</span>
                        <h3 class="text-xl font-bold text-white">مدیریت 15 ایجنت هوشمند</h3>
                        <div class="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">اتوماسیون کامل</div>
                    </div>
                    <button onclick="settingsModule.optimizeAllAgents()" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-magic mr-2"></i>بهینه‌سازی همه
                    </button>
                </div>

                <!-- Agent Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${this.renderAIAgents()}
                </div>
            </div>

            <!-- Auto Training Configuration -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">📚</span>
                        <h3 class="text-xl font-bold text-white">آموزش خودکار AI</h3>
                        <div class="px-3 py-1 bg-green-600 text-white text-xs rounded-full">یادگیری مداوم</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-training-enabled" class="sr-only peer" ${this.settings.ai.artemis.auto_training.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">برنامه آموزش</label>
                        <select id="training-schedule" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="adaptive" ${this.settings.ai.artemis.auto_training.schedule === 'adaptive' ? 'selected' : ''}>تطبیقی</option>
                            <option value="hourly" ${this.settings.ai.artemis.auto_training.schedule === 'hourly' ? 'selected' : ''}>ساعت‌به‌ساعت</option>
                            <option value="daily" ${this.settings.ai.artemis.auto_training.schedule === 'daily' ? 'selected' : ''}>روزانه</option>
                            <option value="weekly" ${this.settings.ai.artemis.auto_training.schedule === 'weekly' ? 'selected' : ''}>هفتگی</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">آستانه عملکرد (%)</label>
                        <input type="number" id="performance-threshold" min="50" max="95" step="5" value="${Math.round(this.settings.ai.artemis.auto_training.performance_threshold * 100)}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نگهداری داده (روز)</label>
                        <input type="number" id="data-retention-days" min="7" max="365" value="${this.settings.ai.artemis.auto_training.data_retention_days}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="model-versioning" ${this.settings.ai.artemis.auto_training.model_versioning ? 'checked' : ''} class="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">نسخه‌بندی مدل</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="ab-testing" ${this.settings.ai.artemis.auto_training.a_b_testing ? 'checked' : ''} class="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">تست A/B</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="rollback-failure" ${this.settings.ai.artemis.auto_training.rollback_on_failure ? 'checked' : ''} class="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">بازگشت خودکار</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Context Memory Management -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">💾</span>
                        <h3 class="text-xl font-bold text-white">مدیریت حافظه و Context</h3>
                        <div class="px-3 py-1 bg-orange-600 text-white text-xs rounded-full">هوش معنایی</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="context-memory-enabled" class="sr-only peer" ${this.settings.ai.artemis.context_memory.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر مکالمات</label>
                        <input type="number" id="max-conversations" min="100" max="10000" step="100" value="${this.settings.ai.artemis.context_memory.max_conversations}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">پنجره Context</label>
                        <input type="number" id="context-window" min="4000" max="128000" step="4000" value="${this.settings.ai.artemis.context_memory.context_window}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">پاکسازی (روز)</label>
                        <input type="number" id="cleanup-threshold-days" min="7" max="90" value="${this.settings.ai.artemis.context_memory.cleanup_threshold_days}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="memory-compression" ${this.settings.ai.artemis.context_memory.memory_compression ? 'checked' : ''} class="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">فشرده‌سازی</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="semantic-indexing" ${this.settings.ai.artemis.context_memory.semantic_indexing ? 'checked' : ''} class="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">نمایه‌سازی معنایی</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="relevance-scoring" ${this.settings.ai.artemis.context_memory.relevance_scoring ? 'checked' : ''} class="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">امتیازدهی ارتباط</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="auto-cleanup" ${this.settings.ai.artemis.context_memory.auto_cleanup ? 'checked' : ''} class="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300 text-sm">پاکسازی خودکار</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        content += '</div>';
        return content;
    }

    getModelOptions(provider, currentModel) {
        const models = {
            openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
            gemini: ['gemini-pro', 'gemini-pro-vision']
        };
        
        return models[provider].map(model => 
            `<option value="${model}" ${model === currentModel ? 'selected' : ''}>${model}</option>`
        ).join('');
    }

    getTradingTab() {
        return `
        <div class="space-y-6">
            <!-- Risk Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⚠️ مدیریت ریسک</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر ریسک هر معامله (%)</label>
                        <input type="number" id="max-risk-per-trade" min="0.1" max="10" step="0.1" value="${this.settings.trading.risk_management.max_risk_per_trade}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر ضرر روزانه (%)</label>
                        <input type="number" id="max-daily-loss" min="1" max="20" step="0.5" value="${this.settings.trading.risk_management.max_daily_loss}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر پوزیشن‌های همزمان</label>
                        <input type="number" id="max-positions" min="1" max="50" value="${this.settings.trading.risk_management.max_positions}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر مبلغ هر معامله (USDT)</label>
                        <input type="number" id="max-amount-per-trade" min="10" max="10000" value="${this.settings.trading.auto_trading.max_amount_per_trade}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
            </div>

            <!-- Auto Trading -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">🤖 معاملات خودکار</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-trading-enabled" class="sr-only peer" ${this.settings.trading.auto_trading.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">استراتژی‌های فعال</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-momentum" ${this.settings.trading.auto_trading.strategies.includes('momentum') ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Momentum Trading</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-mean-reversion" ${this.settings.trading.auto_trading.strategies.includes('mean_reversion') ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Mean Reversion</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-dca" ${this.settings.trading.auto_trading.strategies.includes('dca') ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Dollar Cost Averaging</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداقل درصد اطمینان AI (%)</label>
                        <input type="number" id="min-confidence" min="50" max="99" value="${Math.round(this.settings.trading.auto_trading.min_confidence * 100)}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
            </div>

            <!-- Alert Settings -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🔔 هشدارهای معاملاتی</h4>
                <div class="space-y-4">
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای قیمت</span>
                        <input type="checkbox" id="price-alerts" ${this.settings.trading.alerts.price_alerts ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای معاملات</span>
                        <input type="checkbox" id="trade-alerts" ${this.settings.trading.alerts.trade_alerts ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">بینش‌های هوش مصنوعی</span>
                        <input type="checkbox" id="ai-insights" ${this.settings.trading.alerts.ai_insights ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای سیستم</span>
                        <input type="checkbox" id="system-alerts" ${this.settings.trading.alerts.system_alerts ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                </div>
            </div>

            <!-- Feature 2: Autopilot Settings -->
            <div class="bg-gradient-to-r from-green-900 to-blue-900 rounded-lg p-6 border border-green-500">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🚗</span>
                        <h3 class="text-xl font-bold text-white">Autopilot - معاملات خودکار</h3>
                        <div class="px-3 py-1 bg-green-600 text-white text-xs rounded-full">اتوماسیون کامل</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="autopilot-enabled" class="sr-only peer" ${this.settings.trading.autopilot.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>

                <!-- Autopilot Modes -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🎯 حالت‌های Autopilot</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${this.renderAutopilotModes()}
                    </div>
                </div>

                <!-- Current Mode Configuration -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">⚙️ تنظیمات حالت فعلی</h4>
                    <div id="current-mode-config">
                        ${this.renderCurrentModeConfig()}
                    </div>
                </div>

                <!-- Strategy Configuration -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📊 استراتژی‌های فعال</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderAutopilotStrategies()}
                    </div>
                </div>

                <!-- Safety Controls -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🛡️ کنترل‌های ایمنی</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Emergency Stop -->
                        <div class="bg-red-900 rounded-lg p-4 border border-red-600">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="font-semibold text-red-300">🚨 توقف اضطراری</h5>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="emergency-stop-enabled" class="sr-only peer" ${this.settings.trading.autopilot.safety_controls.emergency_stop.enabled ? 'checked' : ''}>
                                    <div class="w-8 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">حداکثر ضرر (%):</span>
                                    <input type="number" id="max-drawdown" value="${this.settings.trading.autopilot.safety_controls.emergency_stop.triggers.max_drawdown}" class="w-16 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">ضررهای متوالی:</span>
                                    <input type="number" id="consecutive-losses" value="${this.settings.trading.autopilot.safety_controls.emergency_stop.triggers.consecutive_losses}" class="w-16 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                </div>
                            </div>
                        </div>

                        <!-- Circuit Breakers -->
                        <div class="bg-yellow-900 rounded-lg p-4 border border-yellow-600">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="font-semibold text-yellow-300">⚡ Circuit Breakers</h5>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="circuit-breakers-enabled" class="sr-only peer" ${this.settings.trading.autopilot.safety_controls.circuit_breakers.enabled ? 'checked' : ''}>
                                    <div class="w-8 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-600"></div>
                                </label>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">آستانه نوسان (%):</span>
                                    <input type="number" id="volatility-threshold" value="${this.settings.trading.autopilot.safety_controls.circuit_breakers.market_volatility_threshold}" class="w-16 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">مدت توقف (دقیقه):</span>
                                    <input type="number" id="halt-duration" value="${this.settings.trading.autopilot.safety_controls.circuit_breakers.trading_halt_duration}" class="w-16 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Portfolio Management -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">💼 مدیریت پرتفوی</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="font-medium text-white">تعادل خودکار</h5>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="auto-rebalancing" class="sr-only peer" ${this.settings.trading.autopilot.portfolio_management.auto_rebalancing.enabled ? 'checked' : ''}>
                                    <div class="w-8 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <label class="text-gray-300">فرکانس:</label>
                                    <select id="rebalance-frequency" class="w-full mt-1 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                        <option value="hourly" ${this.settings.trading.autopilot.portfolio_management.auto_rebalancing.frequency === 'hourly' ? 'selected' : ''}>ساعتی</option>
                                        <option value="daily" ${this.settings.trading.autopilot.portfolio_management.auto_rebalancing.frequency === 'daily' ? 'selected' : ''}>روزانه</option>
                                        <option value="weekly" ${this.settings.trading.autopilot.portfolio_management.auto_rebalancing.frequency === 'weekly' ? 'selected' : ''}>هفتگی</option>
                                        <option value="monthly" ${this.settings.trading.autopilot.portfolio_management.auto_rebalancing.frequency === 'monthly' ? 'selected' : ''}>ماهانه</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-800 rounded-lg p-4">
                            <h5 class="font-medium text-white mb-3">مدیریت نقدینگی</h5>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <label class="text-gray-300">نسبت نقد هدف (%):</label>
                                    <input type="number" id="target-cash-ratio" value="${Math.round(this.settings.trading.autopilot.portfolio_management.cash_management.target_cash_ratio * 100)}" class="w-full mt-1 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                </div>
                                <div>
                                    <label class="text-gray-300">حداکثر نقد بیکار (%):</label>
                                    <input type="number" id="max-cash-idle" value="${Math.round(this.settings.trading.autopilot.portfolio_management.cash_management.max_cash_idle * 100)}" class="w-full mt-1 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="font-medium text-white">Risk Parity</h5>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="risk-parity" class="sr-only peer" ${this.settings.trading.autopilot.portfolio_management.risk_parity.enabled ? 'checked' : ''}>
                                    <div class="w-8 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <label class="text-gray-300">هدف نوسان (%):</label>
                                    <input type="number" id="volatility-target" value="${Math.round(this.settings.trading.autopilot.portfolio_management.risk_parity.volatility_target * 100)}" class="w-full mt-1 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Control Panel -->
                <div class="flex gap-3 pt-4 border-t border-gray-700">
                    <button onclick="settingsModule.startAutopilot()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-play mr-2"></i>شروع Autopilot
                    </button>
                    <button onclick="settingsModule.stopAutopilot()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-stop mr-2"></i>توقف فوری
                    </button>
                    <button onclick="settingsModule.testAutopilot()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-vial mr-2"></i>تست حالت
                    </button>
                    <button onclick="settingsModule.autopilotAnalytics()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-chart-line mr-2"></i>آنالیتیکس
                    </button>
                    <button onclick="settingsModule.exportAutopilotConfig()" class="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>صادرات تنظیمات
                    </button>
                </div>
            </div>

            <!-- Feature 4: Advanced Trading Rules -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">📋 قوانین پیشرفته معاملاتی</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="advanced-rules-enabled" class="sr-only peer" ${this.settings.advanced_trading_rules.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <!-- Global Rules Section -->
                <div class="mb-6">
                    <h5 class="text-md font-semibold text-yellow-400 mb-3">🌐 قوانین سراسری</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر اهرم</label>
                            <input type="number" id="max-leverage" min="1" max="100" value="${this.settings.advanced_trading_rules.risk_management.leverage_limit}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">حداقل حجم 24 ساعته (USDT)</label>
                            <input type="number" id="min-volume-24h" min="100000" max="100000000" value="${this.settings.advanced_trading_rules.global_rules.min_volume_24h}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">آستانه نوسان (%)</label>
                            <input type="number" id="volatility-threshold" min="1" max="50" value="${this.settings.advanced_trading_rules.global_rules.market_conditions.volatility_threshold}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">آستانه افزایش حجم (%)</label>
                            <input type="number" id="volume-spike-threshold" min="50" max="1000" value="${this.settings.advanced_trading_rules.global_rules.market_conditions.volume_spike_threshold}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                    </div>
                    <div class="mt-4">
                        <label class="flex items-center gap-2 mb-2">
                            <input type="checkbox" id="bear-market-mode" ${this.settings.advanced_trading_rules.global_rules.market_conditions.bear_market_mode ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300">حالت بازار نزولی (محافظه‌کارانه)</span>
                        </label>
                    </div>
                </div>

                <!-- Entry Rules Section -->
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <h5 class="text-md font-semibold text-green-400">📈 قوانین ورود</h5>
                        <button onclick="settingsModule.addEntryRule()" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-plus mr-1"></i>افزودن قانون
                        </button>
                    </div>
                    <div id="entry-rules-container" class="space-y-3">
                        ${this.renderEntryRules()}
                    </div>
                </div>

                <!-- Exit Rules Section -->
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <h5 class="text-md font-semibold text-red-400">📉 قوانین خروج</h5>
                        <button onclick="settingsModule.addExitRule()" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-plus mr-1"></i>افزودن قانون
                        </button>
                    </div>
                    <div id="exit-rules-container" class="space-y-3">
                        ${this.renderExitRules()}
                    </div>
                </div>

                <!-- Schedule Rules Section -->
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <h5 class="text-md font-semibold text-blue-400">⏰ قوانین زمان‌بندی</h5>
                        <button onclick="settingsModule.addScheduleRule()" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-plus mr-1"></i>افزودن برنامه
                        </button>
                    </div>
                    <div id="schedule-rules-container" class="space-y-3">
                        ${this.renderScheduleRules()}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 pt-4 border-t border-gray-700">
                    <button onclick="settingsModule.validateTradingRules()" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-check-circle mr-2"></i>اعتبارسنجی قوانین
                    </button>
                    <button onclick="settingsModule.testTradingRules()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-flask mr-2"></i>تست قوانین
                    </button>
                    <button onclick="settingsModule.exportTradingRules()" class="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>صادرات قوانین
                    </button>
                    <button onclick="settingsModule.importTradingRules()" class="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-upload mr-2"></i>وارد کردن قوانین
                    </button>
                </div>
            </div>
        </div>`;
    }

    getSecurityTab() {
        return `
        <div class="space-y-6">
            <!-- Two Factor Authentication -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">🔐 احراز هویت دو مرحله‌ای</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="2fa-enabled" class="sr-only peer" ${this.settings.security.two_factor.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">روش احراز هویت</label>
                        <select id="2fa-method" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="totp" ${this.settings.security.two_factor.method === 'totp' ? 'selected' : ''}>TOTP (Google Authenticator)</option>
                            <option value="sms" ${this.settings.security.two_factor.method === 'sms' ? 'selected' : ''}>پیامک (SMS)</option>
                            <option value="email" ${this.settings.security.two_factor.method === 'email' ? 'selected' : ''}>ایمیل</option>
                        </select>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="settingsModule.setup2FA()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-qrcode mr-2"></i>راه‌اندازی 2FA
                        </button>
                        <button onclick="settingsModule.generateBackupCodes()" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-key mr-2"></i>کدهای بازیابی
                        </button>
                    </div>
                </div>
            </div>

            <!-- Session Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⏰ مدیریت جلسات</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">مدت زمان جلسه (ساعت)</label>
                        <input type="number" id="session-timeout" min="1" max="168" value="${this.settings.security.session.timeout}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">تعداد جلسات همزمان</label>
                        <input type="number" id="concurrent-sessions" min="1" max="10" value="${this.settings.security.session.concurrent_sessions}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="auto-logout" ${this.settings.security.session.auto_logout ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <span class="text-gray-300">خروج خودکار در صورت عدم فعالیت</span>
                    </label>
                </div>
                <div class="mt-4">
                    <button onclick="settingsModule.viewActiveSessions()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-list mr-2"></i>مشاهده جلسات فعال
                    </button>
                </div>
            </div>

            <!-- API Access -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">🔌 دسترسی API</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="api-access-enabled" class="sr-only peer" ${this.settings.security.api_access.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">محدودیت درخواست (در دقیقه)</label>
                        <input type="number" id="api-rate-limit" min="10" max="1000" value="${this.settings.security.api_access.rate_limit}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">IP های مجاز (هر کدام در یک خط)</label>
                        <textarea id="whitelist-ips" rows="3" placeholder="192.168.1.1&#10;10.0.0.1" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">${this.settings.security.api_access.whitelist_ips.join('\n')}</textarea>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="settingsModule.generateAPIKey()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-plus mr-2"></i>تولید کلید API
                        </button>
                        <button onclick="settingsModule.revokeAPIKeys()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-trash mr-2"></i>لغو همه کلیدها
                        </button>
                    </div>
                </div>
            </div>

                <!-- Feature 4: Advanced Trading Rules moved to Trading tab -->
        </div>`;
    }

    getSystemTab() {
        return `
        <div class="space-y-6">
            <!-- Cache Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🧹 مدیریت کش</h4>
                <p class="text-gray-300 text-sm mb-4">
                    برای دیدن آخرین تغییرات و حل مشکلات بارگذاری، کش مرورگر را مدیریت کنید
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="settingsModule.clearBrowserCache()" class="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-trash mr-2"></i>پاک کردن کش
                    </button>
                    <button onclick="settingsModule.hardRefresh()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh سخت
                    </button>
                    <button onclick="settingsModule.openCacheManager()" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-external-link-alt mr-2"></i>Cache Manager
                    </button>
                </div>
            </div>

            <!-- System Information -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📊 اطلاعات سیستم</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-300">نسخه سیستم:</span>
                            <span class="text-white">TITAN v1.0.0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">هوش مصنوعی:</span>
                            <span class="text-green-400">ARTEMIS فعال</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">آخرین بروزرسانی:</span>
                            <span class="text-white" id="last-update">${new Date().toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">زمان فعالیت:</span>
                            <span class="text-white" id="uptime">در حال محاسبه...</span>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-300">تعداد ماژول‌ها:</span>
                            <span class="text-white">9 ماژول</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">مرورگر:</span>
                            <span class="text-white" id="browser-info">در حال تشخیص...</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">آخرین ورود:</span>
                            <span class="text-white" id="last-login">${new Date().toLocaleString('fa-IR')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">وضعیت اتصال:</span>
                            <span class="text-green-400">آنلاین</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Module Status -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📦 وضعیت ماژول‌ها</h4>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-tachometer-alt text-blue-400"></i>
                            <span class="text-sm text-gray-300">Dashboard</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-chart-line text-green-400"></i>
                            <span class="text-sm text-gray-300">Trading</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-briefcase text-purple-400"></i>
                            <span class="text-sm text-gray-300">Portfolio</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-robot text-cyan-400"></i>
                            <span class="text-sm text-gray-300">Artemis</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-list text-yellow-400"></i>
                            <span class="text-sm text-gray-300">Watchlist</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-bell text-red-400"></i>
                            <span class="text-sm text-gray-300">Alerts</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- System Actions -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⚙️ عملیات سیستم</h4>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button onclick="settingsModule.reloadAllModules()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-redo mr-2"></i>بارگذاری مجدد ماژول‌ها
                    </button>
                    <button onclick="settingsModule.checkSystemHealth()" class="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-heartbeat mr-2"></i>بررسی سلامت سیستم
                    </button>
                    <button onclick="settingsModule.downloadLogs()" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>دانلود لاگ‌ها
                    </button>
                    <button onclick="settingsModule.systemRestart()" class="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-power-off mr-2"></i>راه‌اندازی مجدد
                    </button>
                </div>
            </div>

            <!-- Feature 3: System Status Configuration -->
            <div class="bg-gradient-to-r from-orange-900 to-red-900 rounded-lg p-6 border border-orange-500">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">📊</span>
                        <h3 class="text-xl font-bold text-white">System Status Configuration</h3>
                        <div class="px-3 py-1 bg-orange-600 text-white text-xs rounded-full">مانیتورینگ پیشرفته</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="system-monitoring-enabled" class="sr-only peer" ${this.settings.system_monitoring.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                </div>

                <!-- Performance Thresholds -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🎯 آستانه‌های عملکرد</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${this.renderPerformanceThresholds()}
                    </div>
                </div>

                <!-- Health Checks Configuration -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🏥 تنظیمات Health Check</h4>
                    <div class="space-y-4">
                        ${this.renderHealthChecksConfig()}
                    </div>
                </div>

                <!-- Alerting Configuration -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🚨 تنظیمات هشدارها</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${this.renderAlertingConfig()}
                    </div>
                </div>

                <!-- Logging Configuration -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📝 تنظیمات Logging</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${this.renderLoggingConfig()}
                    </div>
                </div>

                <!-- Resource Limits -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">⚡ محدودیت‌های منابع</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${this.renderResourceLimits()}
                    </div>
                </div>

                <!-- Control Panel -->
                <div class="flex gap-3 pt-4 border-t border-gray-700">
                    <button onclick="settingsModule.testSystemMonitoring()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-vial mr-2"></i>تست مانیتورینگ
                    </button>
                    <button onclick="settingsModule.generateSystemReport()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-chart-bar mr-2"></i>گزارش سیستم
                    </button>
                    <button onclick="settingsModule.exportMonitoringConfig()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>صادرات تنظیمات
                    </button>
                    <button onclick="settingsModule.resetToDefaults()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-undo mr-2"></i>بازنشانی
                    </button>
                </div>
            </div>

            <!-- Feature 5: Dashboard Customization -->
            <div class="bg-gradient-to-r from-teal-900 to-cyan-900 rounded-lg p-6 border border-teal-500">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🎨</span>
                        <h3 class="text-xl font-bold text-white">Dashboard Customization</h3>
                        <div class="px-3 py-1 bg-teal-600 text-white text-xs rounded-full">شخصی‌سازی کامل</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="dashboard-customization-enabled" class="sr-only peer" ${this.settings.dashboard_customization.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                </div>

                <!-- Layout Management -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📐 مدیریت چیدمان</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${this.renderLayoutSettings()}
                    </div>
                </div>

                <!-- Widget Configuration -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🧩 تنظیمات ویجت‌ها</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderWidgetSettings()}
                    </div>
                </div>

                <!-- Theme Customization -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🌈 شخصی‌سازی تم</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${this.renderThemeSettings()}
                    </div>
                </div>

                <!-- Chart Settings -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📈 تنظیمات نمودار</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderChartSettings()}
                    </div>
                </div>

                <!-- Personal Views -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">👁️ نماهای شخصی</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${this.renderPersonalViews()}
                    </div>
                </div>

                <!-- Display Settings -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">🖥️ تنظیمات نمایش</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${this.renderDisplaySettings()}
                    </div>
                </div>

                <!-- Control Panel -->
                <div class="flex gap-3 pt-4 border-t border-gray-700">
                    <button onclick="settingsModule.previewDashboard()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-eye mr-2"></i>پیش‌نمایش
                    </button>
                    <button onclick="settingsModule.resetLayout()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-refresh mr-2"></i>بازنشانی چیدمان
                    </button>
                    <button onclick="settingsModule.exportDashboard()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>صادرات تنظیمات
                    </button>
                    <button onclick="settingsModule.importDashboard()" class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-upload mr-2"></i>وارد کردن
                    </button>
                    <button onclick="settingsModule.resetDashboard()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-undo mr-2"></i>بازگردانی
                    </button>
                </div>
            </div>

            <!-- Feature 6: Alert Rules Management -->
            <div class="bg-gradient-to-r from-amber-900 to-orange-900 rounded-lg p-6 border border-amber-500">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🚨</span>
                        <h3 class="text-xl font-bold text-white">Alert Rules Management</h3>
                        <div class="px-3 py-1 bg-amber-600 text-white text-xs rounded-full">هشدارهای هوشمند</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="alert-rules-enabled" class="sr-only peer" ${this.settings.alert_rules_management.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                </div>

                <!-- Global Settings -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">⚙️ تنظیمات کلی</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${this.renderGlobalAlertSettings()}
                    </div>
                </div>

                <!-- Notification Channels -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📢 کانال‌های اطلاع‌رسانی</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderNotificationChannels()}
                    </div>
                </div>

                <!-- Alert Rules -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📋 قوانین هشدار</h4>
                    <div class="space-y-4">
                        ${this.renderAlertRules()}
                    </div>
                </div>

                <!-- Alert Templates -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📝 قالب‌های هشدار</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${this.renderAlertTemplates()}
                    </div>
                </div>

                <!-- Escalation Policies -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📈 سیاست‌های تصعید</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${this.renderEscalationPolicies()}
                    </div>
                </div>

                <!-- Alert History & Analytics -->
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">📊 تاریخچه و تحلیل</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${this.renderAlertHistory()}
                    </div>
                </div>

                <!-- Control Panel -->
                <div class="flex gap-3 pt-4 border-t border-gray-700">
                    <button onclick="settingsModule.testAlertRule()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-vial mr-2"></i>تست هشدار
                    </button>
                    <button onclick="settingsModule.createAlertRule()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-plus mr-2"></i>ایجاد قانون
                    </button>
                    <button onclick="settingsModule.importAlertRules()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-upload mr-2"></i>وارد کردن
                    </button>
                    <button onclick="settingsModule.exportAlertRules()" class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>صادرات
                    </button>
                    <button onclick="settingsModule.resetAlertRules()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-undo mr-2"></i>بازنشانی
                    </button>
                </div>
            </div>

        </div>`;
    }

    getMonitoringTab() {
        return `
        <div class="space-y-6">
            <!-- System Status Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">وضعیت سیستم</h3>
                            <div id="system-status" class="text-lg font-bold text-green-400">عملیاتی</div>
                        </div>
                        <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">آخرین بررسی: <span id="last-check-time">--:--</span></div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">استفاده CPU</h3>
                            <div id="cpu-usage" class="text-lg font-bold text-blue-400">--</div>
                        </div>
                        <i class="fas fa-microchip text-2xl text-blue-400"></i>
                    </div>
                    <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div id="cpu-bar" class="bg-blue-400 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">استفاده حافظه</h3>
                            <div id="memory-usage" class="text-lg font-bold text-yellow-400">--</div>
                        </div>
                        <i class="fas fa-memory text-2xl text-yellow-400"></i>
                    </div>
                    <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div id="memory-bar" class="bg-yellow-400 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>
