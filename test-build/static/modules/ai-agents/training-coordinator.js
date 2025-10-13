/**
 * TITAN AI Training Coordinator - Inter-Agent Communication & Learning System
 * Advanced training orchestration for all 15 TITAN AI agents with real-time coordination
 */

class TitanTrainingCoordinator {
    constructor() {
        this.agents = new Map();
        this.trainingChannels = new Map();
        this.learningBroadcast = null;
        this.traingSessions = new Map();
        this.knowledgeRepository = new Map();
        this.performanceMetrics = new Map();
        
        // Initialize BroadcastChannel for real-time communication
        this.initializeCommunicationChannels();
        
        // Register all TITAN agents
        this.registerAgents();
        
        console.log('🎯 TITAN Training Coordinator initialized');
    }

    initializeCommunicationChannels() {
        try {
            // Main learning broadcast channel
            this.learningBroadcast = new BroadcastChannel('titan-training-broadcast');
            this.learningBroadcast.addEventListener('message', (event) => {
                this.handleTrainingMessage(event.data);
            });
            
            // Individual agent channels
            for (let i = 1; i <= 15; i++) {
                const agentId = `agent_${String(i).padStart(2, '0')}`;
                const channel = new BroadcastChannel(`titan-agent-${agentId}-training`);
                channel.addEventListener('message', (event) => {
                    this.handleAgentTrainingMessage(agentId, event.data);
                });
                this.trainingChannels.set(agentId, channel);
            }
        } catch (error) {
            console.error('Communication channels initialization error:', error);
            // Fallback to internal messaging system
            this.setupInternalMessaging();
        }
    }

    setupInternalMessaging() {
        // Fallback internal messaging system
        this.internalMessageQueue = [];
        this.messageHandlers = new Map();
        
        console.log('📡 Using internal messaging system for training coordination');
    }

    registerAgents() {
        const agentConfigs = [
            { id: 'agent_01', name: 'Technical Analysis Agent', type: 'analysis', specialization: 'technical_indicators', priority: 1 },
            { id: 'agent_02', name: 'Risk Management Agent', type: 'risk', specialization: 'risk_assessment', priority: 1 },
            { id: 'agent_03', name: 'Sentiment Analysis Agent', type: 'analysis', specialization: 'market_sentiment', priority: 2 },
            { id: 'agent_04', name: 'Portfolio Optimization Agent', type: 'optimization', specialization: 'portfolio_balance', priority: 1 },
            { id: 'agent_05', name: 'Market Making Agent', type: 'execution', specialization: 'liquidity_provision', priority: 3 },
            { id: 'agent_06', name: 'Algorithmic Trading Agent', type: 'execution', specialization: 'order_execution', priority: 2 },
            { id: 'agent_07', name: 'News Analysis Agent', type: 'analysis', specialization: 'news_processing', priority: 2 },
            { id: 'agent_08', name: 'High-Frequency Trading Agent', type: 'execution', specialization: 'hft_strategies', priority: 3 },
            { id: 'agent_09', name: 'Quantitative Analysis Agent', type: 'analysis', specialization: 'statistical_modeling', priority: 1 },
            { id: 'agent_10', name: 'Macro Analysis Agent', type: 'analysis', specialization: 'macroeconomic_factors', priority: 2 },
            { id: 'agent_11', name: 'Portfolio Optimization II Agent', type: 'optimization', specialization: 'advanced_allocation', priority: 2 },
            { id: 'agent_12', name: 'Risk Assessment Agent', type: 'risk', specialization: 'advanced_risk_models', priority: 1 },
            { id: 'agent_13', name: 'Compliance & Regulatory Agent', type: 'compliance', specialization: 'regulatory_monitoring', priority: 2 },
            { id: 'agent_14', name: 'Performance Analytics Agent', type: 'analytics', specialization: 'performance_tracking', priority: 2 },
            { id: 'agent_15', name: 'System Orchestrator Agent', type: 'orchestration', specialization: 'system_coordination', priority: 1 }
        ];

        agentConfigs.forEach(config => {
            this.agents.set(config.id, {
                ...config,
                status: 'idle',
                learningState: 'ready',
                knowledgeLevel: Math.floor(Math.random() * 30) + 70, // 70-100
                trainingHistory: [],
                communicationPartners: new Set(),
                lastTrainingSession: null,
                performanceScore: Math.floor(Math.random() * 20) + 80 // 80-100
            });
        });

        console.log('🤖 Registered 15 TITAN AI agents for training coordination');
    }

    // Main Training Orchestration
    async startQuickTraining(type, selectedAgents = null, parameters = {}) {
        const sessionId = `train_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        let targetAgents = [];
        
        switch (type) {
            case 'individual':
                targetAgents = selectedAgents || [this.selectOptimalAgent()];
                break;
            case 'collective':
                targetAgents = selectedAgents || Array.from(this.agents.keys());
                break;
            case 'cross':
                targetAgents = selectedAgents || this.selectCrossTrainingAgents();
                break;
            default:
                throw new Error('Invalid training type');
        }

        const session = {
            id: sessionId,
            type,
            agents: targetAgents,
            parameters,
            startTime: Date.now(),
            status: 'active',
            progress: 0,
            phase: 'initialization',
            metrics: {
                accuracy: 0,
                coordination: 0,
                learningRate: parameters.learningRate || 0.001
            }
        };

        this.traingSessions.set(sessionId, session);

        // Notify all participating agents
        await this.notifyTrainingStart(sessionId, targetAgents, type, parameters);

        // Begin training process
        this.executeTrainingProcess(sessionId);

        return session;
    }

    async startCustomTraining(config) {
        const sessionId = `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        const session = {
            id: sessionId,
            type: 'custom',
            agents: config.agents,
            topic: config.topic,
            intensity: config.intensity,
            duration: config.duration,
            parameters: config.parameters,
            startTime: Date.now(),
            status: 'active',
            progress: 0,
            phase: 'data_preparation',
            focusAreas: config.parameters.focusAreas || [],
            metrics: {
                accuracy: 0,
                consistency: 0,
                adaptability: 0,
                collaboration: 0
            }
        };

        this.traingSessions.set(sessionId, session);

        // Setup specialized training environment
        await this.setupCustomTrainingEnvironment(sessionId, config);

        // Start custom training process
        this.executeCustomTrainingProcess(sessionId);

        return session;
    }

    async startInterAgentTraining(scenario, agents, duration = 45) {
        const sessionId = `inter_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        if (agents.length < 2) {
            throw new Error('Inter-agent training requires at least 2 agents');
        }

        const session = {
            id: sessionId,
            type: 'inter_agent',
            scenario,
            agents,
            duration,
            startTime: Date.now(),
            status: 'active',
            progress: 0,
            phase: 'scenario_setup',
            communicationMap: new Map(),
            collaborationMetrics: {
                messageExchanges: 0,
                consensusTime: 0,
                coordinationScore: 0,
                knowledgeSharing: 0
            }
        };

        this.traingSessions.set(sessionId, session);

        // Setup inter-agent communication scenario
        await this.setupInterAgentScenario(sessionId, scenario, agents);

        // Begin inter-agent training
        this.executeInterAgentTraining(sessionId);

        return session;
    }

    // Training Execution Methods
    async executeTrainingProcess(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        const phases = ['initialization', 'data_processing', 'model_training', 'validation', 'finalization'];
        let currentPhaseIndex = 0;

        const progressInterval = setInterval(async () => {
            if (!this.traingSessions.has(sessionId) || session.status !== 'active') {
                clearInterval(progressInterval);
                return;
            }

            // Update progress
            session.progress = Math.min(session.progress + Math.random() * 5 + 2, 100);
            session.phase = phases[currentPhaseIndex];

            // Update metrics based on training type and phase
            this.updateTrainingMetrics(session);

            // Advance to next phase
            if (session.progress > (currentPhaseIndex + 1) * 20) {
                currentPhaseIndex = Math.min(currentPhaseIndex + 1, phases.length - 1);
            }

            // Send progress updates to agents
            await this.broadcastTrainingProgress(sessionId);

            // Complete training if at 100%
            if (session.progress >= 100) {
                await this.completeTraining(sessionId);
                clearInterval(progressInterval);
            }
        }, 2000 + Math.random() * 2000); // 2-4 second intervals
    }

    async executeCustomTrainingProcess(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        const customPhases = ['data_preparation', 'topic_analysis', 'skill_training', 'performance_evaluation', 'knowledge_integration'];
        let currentPhaseIndex = 0;

        const progressInterval = setInterval(async () => {
            if (!this.traingSessions.has(sessionId) || session.status !== 'active') {
                clearInterval(progressInterval);
                return;
            }

            // Custom training progress based on intensity
            const progressRate = this.getProgressRate(session.intensity);
            session.progress = Math.min(session.progress + progressRate, 100);
            session.phase = customPhases[currentPhaseIndex];

            // Update specialized metrics
            this.updateCustomTrainingMetrics(session);

            // Phase progression
            if (session.progress > (currentPhaseIndex + 1) * 20) {
                currentPhaseIndex = Math.min(currentPhaseIndex + 1, customPhases.length - 1);
            }

            // Agent-specific training updates
            await this.sendCustomTrainingUpdates(sessionId);

            // Complete when finished
            if (session.progress >= 100) {
                await this.completeCustomTraining(sessionId);
                clearInterval(progressInterval);
            }
        }, this.getUpdateInterval(session.intensity));
    }

    async executeInterAgentTraining(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        const interPhases = ['scenario_setup', 'initial_communication', 'collaboration_training', 'consensus_building', 'performance_assessment'];
        let currentPhaseIndex = 0;

        const progressInterval = setInterval(async () => {
            if (!this.traingSessions.has(sessionId) || session.status !== 'active') {
                clearInterval(progressInterval);
                return;
            }

            // Inter-agent training progress
            session.progress = Math.min(session.progress + Math.random() * 4 + 1, 100);
            session.phase = interPhases[currentPhaseIndex];

            // Update collaboration metrics
            this.updateCollaborationMetrics(session);

            // Simulate inter-agent communication
            await this.simulateAgentCommunication(sessionId);

            // Phase advancement
            if (session.progress > (currentPhaseIndex + 1) * 20) {
                currentPhaseIndex = Math.min(currentPhaseIndex + 1, interPhases.length - 1);
            }

            // Complete when done
            if (session.progress >= 100) {
                await this.completeInterAgentTraining(sessionId);
                clearInterval(progressInterval);
            }
        }, 3000); // 3 second intervals for inter-agent training
    }

    // Communication and Coordination Methods
    async notifyTrainingStart(sessionId, agentIds, type, parameters) {
        const message = {
            type: 'training_start',
            sessionId,
            trainingType: type,
            participants: agentIds,
            parameters,
            timestamp: Date.now()
        };

        // Notify each agent individually
        for (const agentId of agentIds) {
            const agent = this.agents.get(agentId);
            if (agent) {
                agent.status = 'training';
                agent.learningState = 'active';
                agent.lastTrainingSession = sessionId;
                
                // Send via BroadcastChannel or internal system
                await this.sendMessageToAgent(agentId, message);
            }
        }

        // Broadcast to main channel
        if (this.learningBroadcast) {
            this.learningBroadcast.postMessage(message);
        }
    }

    async sendMessageToAgent(agentId, message) {
        const channel = this.trainingChannels.get(agentId);
        if (channel) {
            try {
                channel.postMessage(message);
            } catch (error) {
                console.warn(`Failed to send message to ${agentId}:`, error);
                // Fallback to internal messaging
                this.queueInternalMessage(agentId, message);
            }
        } else {
            this.queueInternalMessage(agentId, message);
        }
    }

    queueInternalMessage(agentId, message) {
        if (!this.internalMessageQueue) this.internalMessageQueue = [];
        this.internalMessageQueue.push({ agentId, message, timestamp: Date.now() });
    }

    async broadcastTrainingProgress(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        const progressMessage = {
            type: 'training_progress',
            sessionId,
            progress: session.progress,
            phase: session.phase,
            metrics: session.metrics,
            timestamp: Date.now()
        };

        // Send to all session participants
        for (const agentId of session.agents) {
            await this.sendMessageToAgent(agentId, progressMessage);
        }

        // Broadcast to main channel
        if (this.learningBroadcast) {
            this.learningBroadcast.postMessage(progressMessage);
        }
    }

    async simulateAgentCommunication(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session || session.type !== 'inter_agent') return;

        // Simulate message exchanges between agents
        const agents = session.agents;
        const messageExchanges = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < messageExchanges; i++) {
            const senderIndex = Math.floor(Math.random() * agents.length);
            const receiverIndex = (senderIndex + 1) % agents.length;
            
            const sender = agents[senderIndex];
            const receiver = agents[receiverIndex];

            const communicationMessage = {
                type: 'inter_agent_communication',
                sessionId,
                from: sender,
                to: receiver,
                content: this.generateCommunicationContent(session.scenario),
                timestamp: Date.now()
            };

            session.collaborationMetrics.messageExchanges++;
            
            await this.sendMessageToAgent(sender, communicationMessage);
            await this.sendMessageToAgent(receiver, communicationMessage);
        }
    }

    generateCommunicationContent(scenario) {
        const scenarios = {
            'market_crisis': [
                'Risk assessment indicates high volatility ahead',
                'Coordinated position adjustment recommended',
                'Emergency stop-loss protocols activated'
            ],
            'portfolio_rebalance': [
                'Asset allocation optimization in progress',
                'Rebalancing thresholds reached for sector rotation',
                'Cross-asset correlation analysis complete'
            ],
            'risk_assessment': [
                'VaR calculations updated with new market data',
                'Risk limits validation across all positions',
                'Stress testing scenarios initiated'
            ],
            'signal_validation': [
                'Technical signal confirmation requested',
                'Multi-timeframe analysis consensus achieved',
                'Signal strength validation complete'
            ]
        };

        const messages = scenarios[scenario] || ['Inter-agent coordination message'];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Metric Update Methods
    updateTrainingMetrics(session) {
        switch (session.type) {
            case 'individual':
                session.metrics.accuracy = Math.min(session.metrics.accuracy + Math.random() * 2, 98);
                break;
            case 'collective':
                session.metrics.accuracy = Math.min(session.metrics.accuracy + Math.random() * 1.5, 95);
                session.metrics.coordination = Math.min(session.metrics.coordination + Math.random() * 2.5, 95);
                break;
            case 'cross':
                session.metrics.accuracy = Math.min(session.metrics.accuracy + Math.random() * 1.8, 96);
                session.metrics.coordination = Math.min(session.metrics.coordination + Math.random() * 3, 97);
                break;
        }
    }

    updateCustomTrainingMetrics(session) {
        const baseRate = this.getMetricUpdateRate(session.intensity);
        
        session.metrics.accuracy = Math.min(session.metrics.accuracy + Math.random() * baseRate * 2, 98);
        session.metrics.consistency = Math.min(session.metrics.consistency + Math.random() * baseRate * 1.5, 95);
        session.metrics.adaptability = Math.min(session.metrics.adaptability + Math.random() * baseRate * 1.8, 94);
        session.metrics.collaboration = Math.min(session.metrics.collaboration + Math.random() * baseRate * 1.3, 92);
    }

    updateCollaborationMetrics(session) {
        session.collaborationMetrics.coordinationScore = Math.min(
            session.collaborationMetrics.coordinationScore + Math.random() * 3, 100
        );
        session.collaborationMetrics.knowledgeSharing = Math.min(
            session.collaborationMetrics.knowledgeSharing + Math.random() * 2.5, 100
        );
        session.collaborationMetrics.consensusTime = Math.max(
            30 - (session.progress * 0.25), 5
        );
    }

    // Training Completion Methods
    async completeTraining(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        session.status = 'completed';
        session.completedAt = Date.now();
        session.finalMetrics = { ...session.metrics };

        // Update agent states
        for (const agentId of session.agents) {
            const agent = this.agents.get(agentId);
            if (agent) {
                agent.status = 'idle';
                agent.learningState = 'ready';
                agent.knowledgeLevel = Math.min(agent.knowledgeLevel + Math.random() * 5 + 2, 100);
                agent.performanceScore = Math.min(agent.performanceScore + Math.random() * 3 + 1, 100);
                agent.trainingHistory.push({
                    sessionId,
                    completedAt: Date.now(),
                    type: session.type,
                    finalScore: session.finalMetrics.accuracy
                });
            }
        }

        // Notify completion
        await this.notifyTrainingCompletion(sessionId);
    }

    async completeCustomTraining(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        session.status = 'completed';
        session.completedAt = Date.now();
        
        // Calculate specialized completion metrics
        session.finalMetrics = {
            ...session.metrics,
            topicMastery: Math.random() * 20 + 80,
            skillImprovement: Math.random() * 15 + 10,
            knowledgeRetention: Math.random() * 10 + 85
        };

        // Update agents with specialized knowledge
        await this.updateAgentsWithCustomKnowledge(sessionId, session.topic);

        await this.notifyTrainingCompletion(sessionId);
    }

    async completeInterAgentTraining(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        session.status = 'completed';
        session.completedAt = Date.now();
        
        // Calculate collaboration final metrics
        session.finalMetrics = {
            ...session.collaborationMetrics,
            overallCollaboration: (
                session.collaborationMetrics.coordinationScore * 0.4 +
                session.collaborationMetrics.knowledgeSharing * 0.3 +
                (100 - session.collaborationMetrics.consensusTime * 2) * 0.3
            ),
            communicationEfficiency: Math.min(session.collaborationMetrics.messageExchanges / 10 * 100, 100)
        };

        // Update agent communication partnerships
        await this.updateAgentPartnerships(sessionId);

        await this.notifyTrainingCompletion(sessionId);
    }

    async notifyTrainingCompletion(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        const completionMessage = {
            type: 'training_completed',
            sessionId,
            trainingType: session.type,
            duration: session.completedAt - session.startTime,
            finalMetrics: session.finalMetrics,
            timestamp: Date.now()
        };

        // Notify all participants
        for (const agentId of session.agents) {
            await this.sendMessageToAgent(agentId, completionMessage);
        }

        // Broadcast completion
        if (this.learningBroadcast) {
            this.learningBroadcast.postMessage(completionMessage);
        }
    }

    // Utility Methods
    selectOptimalAgent() {
        let optimalAgent = null;
        let lowestScore = Infinity;

        for (const [agentId, agent] of this.agents) {
            if (agent.status === 'idle' && agent.performanceScore < lowestScore) {
                optimalAgent = agentId;
                lowestScore = agent.performanceScore;
            }
        }

        return optimalAgent || 'agent_01'; // Fallback to first agent
    }

    selectCrossTrainingAgents() {
        // Select agents from different specializations for cross-training
        const specializations = ['analysis', 'risk', 'optimization', 'execution'];
        const selectedAgents = [];

        for (const spec of specializations) {
            const agentsOfType = Array.from(this.agents.entries())
                .filter(([_, agent]) => agent.type === spec && agent.status === 'idle');
            
            if (agentsOfType.length > 0) {
                const randomAgent = agentsOfType[Math.floor(Math.random() * agentsOfType.length)];
                selectedAgents.push(randomAgent[0]);
            }
        }

        // Add some additional agents if available
        const additionalAgents = Array.from(this.agents.entries())
            .filter(([agentId, agent]) => 
                !selectedAgents.includes(agentId) && 
                agent.status === 'idle'
            )
            .slice(0, 2)
            .map(([agentId]) => agentId);

        return [...selectedAgents, ...additionalAgents];
    }

    getProgressRate(intensity) {
        const rates = {
            'light': Math.random() * 2 + 1,      // 1-3%
            'medium': Math.random() * 3 + 2,     // 2-5%
            'intensive': Math.random() * 4 + 3,  // 3-7%
            'extreme': Math.random() * 6 + 4     // 4-10%
        };
        return rates[intensity] || rates.medium;
    }

    getUpdateInterval(intensity) {
        const intervals = {
            'light': 4000,     // 4 seconds
            'medium': 3000,    // 3 seconds
            'intensive': 2000, // 2 seconds
            'extreme': 1500    // 1.5 seconds
        };
        return intervals[intensity] || intervals.medium;
    }

    getMetricUpdateRate(intensity) {
        const rates = {
            'light': 1,
            'medium': 1.5,
            'intensive': 2,
            'extreme': 2.5
        };
        return rates[intensity] || rates.medium;
    }

    async setupCustomTrainingEnvironment(sessionId, config) {
        // Setup specialized training environment based on topic
        const environment = {
            sessionId,
            topic: config.topic,
            resources: this.getTopicResources(config.topic),
            testData: this.generateTestData(config.topic),
            evaluationCriteria: config.parameters.evaluationCriteria || []
        };

        // Store environment configuration
        this.knowledgeRepository.set(sessionId, environment);
    }

    async setupInterAgentScenario(sessionId, scenario, agents) {
        // Setup scenario-specific environment
        const scenarioConfig = {
            sessionId,
            scenario,
            participants: agents,
            scenarioData: this.getScenarioData(scenario),
            communicationRules: this.getCommunicationRules(scenario),
            successCriteria: this.getScenarioSuccessCriteria(scenario)
        };

        this.knowledgeRepository.set(`scenario_${sessionId}`, scenarioConfig);
    }

    getTopicResources(topic) {
        const resources = {
            'market_analysis': ['historical_data', 'technical_indicators', 'pattern_library'],
            'risk_management': ['risk_models', 'stress_scenarios', 'correlation_matrices'],
            'pattern_recognition': ['chart_patterns', 'ml_models', 'signal_database'],
            'sentiment_analysis': ['news_feeds', 'social_sentiment', 'market_psychology'],
            'decision_making': ['decision_trees', 'optimization_algorithms', 'game_theory'],
            'coordination': ['communication_protocols', 'consensus_algorithms', 'coordination_frameworks']
        };
        return resources[topic] || ['general_resources'];
    }

    generateTestData(topic) {
        // Generate synthetic test data for training
        return {
            topic,
            dataPoints: Math.floor(Math.random() * 1000) + 500,
            complexity: Math.random() > 0.5 ? 'high' : 'medium',
            generatedAt: Date.now()
        };
    }

    getScenarioData(scenario) {
        const scenarioData = {
            'market_crisis': {
                volatility: 'extreme',
                timeframe: 'immediate',
                complexity: 'high',
                requiredActions: ['risk_assessment', 'position_adjustment', 'liquidity_management']
            },
            'portfolio_rebalance': {
                scope: 'full_portfolio',
                constraints: ['regulatory', 'liquidity', 'tax_efficiency'],
                optimization: 'multi_objective'
            },
            'risk_assessment': {
                riskTypes: ['market', 'credit', 'operational', 'liquidity'],
                timeHorizons: ['intraday', 'weekly', 'monthly'],
                models: ['var', 'stress_testing', 'scenario_analysis']
            },
            'signal_validation': {
                signalTypes: ['technical', 'fundamental', 'sentiment'],
                validationMethods: ['cross_verification', 'backtesting', 'consensus'],
                confidence: 'multi_agent_validation'
            }
        };
        return scenarioData[scenario] || {};
    }

    getCommunicationRules(scenario) {
        return {
            maxMessageLength: 1000,
            responseTimeout: 30000, // 30 seconds
            consensusRequired: scenario === 'risk_assessment',
            priorityLevels: ['low', 'medium', 'high', 'critical']
        };
    }

    getScenarioSuccessCriteria(scenario) {
        const criteria = {
            'market_crisis': {
                responseTime: 'under_60_seconds',
                coordinationLevel: 'high',
                riskMitigation: 'effective'
            },
            'portfolio_rebalance': {
                optimizationQuality: 'optimal',
                constraintCompliance: 'full',
                executionEfficiency: 'high'
            },
            'risk_assessment': {
                accuracy: 'high_precision',
                coverage: 'comprehensive',
                timeliness: 'real_time'
            },
            'signal_validation': {
                consensus: 'majority',
                validation_speed: 'fast',
                accuracy: 'validated'
            }
        };
        return criteria[scenario] || {};
    }

    async updateAgentsWithCustomKnowledge(sessionId, topic) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        for (const agentId of session.agents) {
            const agent = this.agents.get(agentId);
            if (agent) {
                // Update agent with topic-specific knowledge
                agent.knowledgeLevel += Math.random() * 8 + 2; // 2-10 point increase
                agent.specialization = agent.specialization + `_${topic}`;
                
                // Add to knowledge repository
                const knowledgeUpdate = {
                    topic,
                    level: session.finalMetrics.topicMastery,
                    acquiredAt: Date.now(),
                    sessionId
                };
                
                if (!this.knowledgeRepository.has(agentId)) {
                    this.knowledgeRepository.set(agentId, []);
                }
                this.knowledgeRepository.get(agentId).push(knowledgeUpdate);
            }
        }
    }

    async updateAgentPartnerships(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session) return;

        // Create communication partnerships based on training performance
        for (let i = 0; i < session.agents.length; i++) {
            const agentId = session.agents[i];
            const agent = this.agents.get(agentId);
            
            if (agent) {
                // Add other session participants as communication partners
                session.agents.forEach(partnerId => {
                    if (partnerId !== agentId) {
                        agent.communicationPartners.add(partnerId);
                    }
                });
            }
        }
    }

    // Message Handlers
    handleTrainingMessage(data) {
        switch (data.type) {
            case 'training_request':
                this.handleTrainingRequest(data);
                break;
            case 'training_status_query':
                this.handleStatusQuery(data);
                break;
            case 'training_stop_request':
                this.handleStopRequest(data);
                break;
            default:
                console.log('Unhandled training message:', data.type);
        }
    }

    handleAgentTrainingMessage(agentId, data) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        switch (data.type) {
            case 'agent_ready':
                agent.learningState = 'ready';
                break;
            case 'agent_progress_report':
                this.handleAgentProgressReport(agentId, data);
                break;
            case 'agent_error':
                this.handleAgentError(agentId, data);
                break;
            default:
                console.log(`Unhandled agent message from ${agentId}:`, data.type);
        }
    }

    handleAgentProgressReport(agentId, data) {
        const agent = this.agents.get(agentId);
        if (agent && data.sessionId) {
            agent.lastProgressReport = {
                sessionId: data.sessionId,
                progress: data.progress,
                metrics: data.metrics,
                timestamp: Date.now()
            };
        }
    }

    handleAgentError(agentId, data) {
        const agent = this.agents.get(agentId);
        if (agent) {
            console.error(`Training error in ${agentId}:`, data.error);
            agent.status = 'error';
            agent.lastError = {
                error: data.error,
                sessionId: data.sessionId,
                timestamp: Date.now()
            };
        }
    }

    // Public API Methods
    getTrainingStatus(sessionId = null) {
        if (sessionId) {
            return this.traingSessions.get(sessionId);
        }
        
        return {
            activeSessions: Array.from(this.traingSessions.values()).filter(s => s.status === 'active'),
            agents: Array.from(this.agents.values()),
            systemStatus: 'operational',
            totalAgents: this.agents.size,
            activeTrainings: Array.from(this.traingSessions.values()).filter(s => s.status === 'active').length
        };
    }

    async stopTraining(sessionId) {
        const session = this.traingSessions.get(sessionId);
        if (!session || session.status !== 'active') {
            throw new Error('Training session not found or not active');
        }

        session.status = 'stopped';
        session.stoppedAt = Date.now();

        // Notify all agents
        const stopMessage = {
            type: 'training_stopped',
            sessionId,
            reason: 'user_request',
            timestamp: Date.now()
        };

        for (const agentId of session.agents) {
            const agent = this.agents.get(agentId);
            if (agent) {
                agent.status = 'idle';
                agent.learningState = 'ready';
            }
            await this.sendMessageToAgent(agentId, stopMessage);
        }

        return {
            sessionId,
            status: 'stopped',
            finalMetrics: session.metrics || {},
            duration: session.stoppedAt - session.startTime
        };
    }

    getAgentKnowledgeBase(agentId) {
        const agent = this.agents.get(agentId);
        const knowledge = this.knowledgeRepository.get(agentId) || [];
        
        return {
            agentId,
            agent: agent ? {
                name: agent.name,
                type: agent.type,
                specialization: agent.specialization,
                knowledgeLevel: agent.knowledgeLevel,
                performanceScore: agent.performanceScore
            } : null,
            knowledgeBase: knowledge,
            totalSize: knowledge.length * 1024 * 1024, // Mock size calculation
            lastUpdated: knowledge.length > 0 ? Math.max(...knowledge.map(k => k.acquiredAt)) : null
        };
    }

    getLearningAnalytics(timeRange = '30d') {
        const now = Date.now();
        const timeRangeMs = this.parseTimeRange(timeRange);
        const cutoffTime = now - timeRangeMs;

        // Filter sessions within time range
        const sessionsInRange = Array.from(this.traingSessions.values())
            .filter(session => session.startTime >= cutoffTime);

        // Calculate analytics
        return {
            summary: {
                totalSessions: sessionsInRange.length,
                completedSessions: sessionsInRange.filter(s => s.status === 'completed').length,
                totalHours: sessionsInRange.reduce((sum, s) => {
                    const duration = (s.completedAt || now) - s.startTime;
                    return sum + (duration / (1000 * 60 * 60));
                }, 0),
                averageAccuracy: this.calculateAverageAccuracy(sessionsInRange),
                agentsParticipated: new Set(sessionsInRange.flatMap(s => s.agents)).size
            },
            agentPerformance: this.getAgentPerformanceAnalytics(),
            trends: this.calculateTrends(sessionsInRange),
            topicDistribution: this.getTopicDistribution(sessionsInRange)
        };
    }

    parseTimeRange(timeRange) {
        const ranges = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000
        };
        return ranges[timeRange] || ranges['30d'];
    }

    calculateAverageAccuracy(sessions) {
        const accuracies = sessions
            .filter(s => s.finalMetrics && s.finalMetrics.accuracy)
            .map(s => s.finalMetrics.accuracy);
        
        return accuracies.length > 0 ? 
            (accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length).toFixed(2) : 
            0;
    }

    getAgentPerformanceAnalytics() {
        return Array.from(this.agents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            knowledgeLevel: agent.knowledgeLevel.toFixed(1),
            performanceScore: agent.performanceScore.toFixed(1),
            trainingHours: agent.trainingHistory.length * 2.5, // Estimated hours
            sessionsCompleted: agent.trainingHistory.length,
            lastTraining: agent.trainingHistory.length > 0 ? 
                Math.max(...agent.trainingHistory.map(h => h.completedAt)) : null,
            status: agent.status,
            communicationPartners: agent.communicationPartners.size
        }));
    }

    calculateTrends(sessions) {
        // Generate trend data (simplified)
        return {
            dailyActivity: this.generateDailyActivity(sessions),
            accuracyTrend: this.generateAccuracyTrend(sessions),
            topicFocus: this.generateTopicFocus(sessions)
        };
    }

    generateDailyActivity(sessions) {
        // Group sessions by day
        const daily = {};
        sessions.forEach(session => {
            const date = new Date(session.startTime).toISOString().split('T')[0];
            daily[date] = (daily[date] || 0) + 1;
        });
        return daily;
    }

    generateAccuracyTrend(sessions) {
        return sessions
            .filter(s => s.finalMetrics && s.finalMetrics.accuracy)
            .map(s => ({
                date: new Date(s.startTime).toISOString().split('T')[0],
                accuracy: s.finalMetrics.accuracy
            }));
    }

    generateTopicFocus(sessions) {
        const topics = {};
        sessions.forEach(session => {
            if (session.topic) {
                topics[session.topic] = (topics[session.topic] || 0) + 1;
            }
        });
        return topics;
    }

    getTopicDistribution(sessions) {
        const distribution = {};
        sessions.forEach(session => {
            const topic = session.topic || 'general';
            distribution[topic] = (distribution[topic] || 0) + 1;
        });
        return distribution;
    }

    // Cleanup and Lifecycle
    cleanup() {
        // Close all BroadcastChannels
        if (this.learningBroadcast) {
            this.learningBroadcast.close();
        }
        
        for (const channel of this.trainingChannels.values()) {
            channel.close();
        }
        
        // Clear all data
        this.traingSessions.clear();
        this.agents.clear();
        this.knowledgeRepository.clear();
        this.performanceMetrics.clear();
        
        console.log('🎯 TITAN Training Coordinator cleanup completed');
    }
}

// Export for use in other modules
window.TitanTrainingCoordinator = TitanTrainingCoordinator;

// Auto-initialize if not already exists
if (!window.titanTrainingCoordinator) {
    window.titanTrainingCoordinator = new TitanTrainingCoordinator();
}

console.log('🎯 TITAN Training Coordinator module loaded');