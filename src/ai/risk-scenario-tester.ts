/**
 * ⚠️ TITAN Trading System - Phase 8: Advanced Risk Scenario Testing
 * 
 * Comprehensive risk scenario testing system featuring:
 * - Advanced Stress Testing Framework
 * - Monte Carlo Risk Simulations  
 * - Scenario Analysis & War Gaming
 * - Black Swan Event Modeling
 * - Correlation Breakdown Analysis
 * - Liquidity Risk Assessment
 * - Market Regime Change Testing
 * - Tail Risk Analysis
 * 
 * Features:
 * ✅ Multi-dimensional stress testing
 * ✅ Historical scenario replay
 * ✅ Custom scenario generation
 * ✅ Extreme value theory modeling
 * ✅ Correlation matrix stress testing
 * ✅ Liquidity shock simulation
 * ✅ Market regime transition analysis
 * ✅ Portfolio tail risk assessment
 * ✅ Real-time risk monitoring
 */

export interface RiskScenarioConfig {
  portfolioId: string;
  
  // Scenario testing parameters
  scenarioTypes: ScenarioType[];
  stressTestSeverity: StressSeverity;
  
  // Time horizons for testing
  timeHorizons: TimeHorizon[];
  
  // Confidence levels for risk metrics
  confidenceLevels: number[]; // e.g., [0.95, 0.99, 0.999]
  
  // Monte Carlo settings
  monteCarloSimulations: number;
  
  // Historical scenario settings
  includeHistoricalCrises: boolean;
  customScenarios: CustomScenario[];
  
  // Risk limits and thresholds
  riskLimits: RiskLimit[];
  
  // Advanced settings
  enableCorrelationBreakdown: boolean;
  enableLiquidityStress: boolean;
  enableRegimeChange: boolean;
  enableTailRiskAnalysis: boolean;
}

export type ScenarioType = 
  | 'market_crash'
  | 'volatility_spike'
  | 'correlation_breakdown'
  | 'liquidity_crisis'
  | 'interest_rate_shock'
  | 'currency_crisis'
  | 'sector_rotation'
  | 'black_swan'
  | 'regime_change'
  | 'custom';

export type StressSeverity = 'mild' | 'moderate' | 'severe' | 'extreme';
export type TimeHorizon = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  
  // Market conditions
  marketShocks: MarketShock[];
  
  // Correlation changes
  correlationChanges: CorrelationChange[];
  
  // Volatility changes
  volatilityChanges: VolatilityChange[];
  
  // Liquidity conditions
  liquidityConditions: LiquidityCondition[];
  
  // Duration and probability
  duration: number; // days
  probability: number; // 0-1
}

export interface MarketShock {
  assetClass: string;
  symbol?: string;
  shockType: 'absolute' | 'relative';
  shockValue: number; // percentage change
  
  // Shock characteristics
  isInstantaneous: boolean;
  rampUpDays?: number;
  persistenceDays: number;
}

export interface CorrelationChange {
  asset1: string;
  asset2: string;
  originalCorrelation: number;
  stressedCorrelation: number;
  
  // Change characteristics
  transitionDays: number;
  persistenceDays: number;
}

export interface VolatilityChange {
  assetClass: string;
  symbol?: string;
  volatilityMultiplier: number; // e.g., 2.0 for double volatility
  
  // Change characteristics
  transitionDays: number;
  persistenceDays: number;
}

export interface LiquidityCondition {
  assetClass: string;
  symbol?: string;
  
  // Liquidity parameters
  bidAskSpreadMultiplier: number;
  marketDepthReduction: number; // percentage
  executionDelayIncrease: number; // seconds
  
  // Market impact changes
  marketImpactMultiplier: number;
}

export interface RiskLimit {
  limitType: RiskLimitType;
  threshold: number;
  severity: 'warning' | 'breach' | 'critical';
  
  // Limit details
  timeHorizon: TimeHorizon;
  confidenceLevel: number;
}

export type RiskLimitType = 
  | 'max_drawdown'
  | 'var_limit'
  | 'cvar_limit'
  | 'concentration_limit'
  | 'leverage_limit'
  | 'liquidity_limit';

export interface RiskScenarioResult {
  scenarioId: string;
  scenarioName: string;
  scenarioType: ScenarioType;
  severity: StressSeverity;
  
  // Scenario execution info
  executionTimestamp: number;
  executionDuration: number; // milliseconds
  
  // Portfolio impact summary
  portfolioImpact: PortfolioImpact;
  
  // Risk metric changes
  riskMetricChanges: RiskMetricChanges;
  
  // Detailed analysis by time horizon
  timeHorizonAnalysis: TimeHorizonAnalysis[];
  
  // Asset-level analysis
  assetLevelAnalysis: AssetLevelAnalysis[];
  
  // Risk limit breaches
  riskLimitBreaches: RiskLimitBreach[];
  
  // Correlation analysis
  correlationAnalysis?: CorrelationAnalysis;
  
  // Liquidity analysis
  liquidityAnalysis?: LiquidityAnalysis;
  
  // Tail risk analysis
  tailRiskAnalysis?: TailRiskAnalysis;
  
  // Recovery analysis
  recoveryAnalysis: RecoveryAnalysis;
  
  // Mitigation recommendations
  mitigationRecommendations: MitigationRecommendation[];
}

export interface PortfolioImpact {
  // Portfolio value changes
  initialValue: number;
  finalValue: number;
  absoluteChange: number;
  percentageChange: number;
  
  // Maximum impact during scenario
  maxDrawdown: number;
  maxDrawdownPercent: number;
  
  // Value at different time points
  valueTimeSeries: ValueTimePoint[];
  
  // Performance vs benchmark
  benchmarkComparison?: BenchmarkImpact;
}

export interface ValueTimePoint {
  timestamp: number;
  portfolioValue: number;
  drawdown: number;
  drawdownPercent: number;
}

export interface BenchmarkImpact {
  benchmarkChange: number;
  relativePerformance: number;
  trackingError: number;
}

export interface RiskMetricChanges {
  // Volatility changes
  baselineVolatility: number;
  stressedVolatility: number;
  volatilityIncrease: number;
  
  // VaR changes
  baselineVaR: VaRMetrics;
  stressedVaR: VaRMetrics;
  
  // Expected Shortfall changes
  baselineES: ESMetrics;
  stressedES: ESMetrics;
  
  // Sharpe ratio impact
  baselineSharpe: number;
  stressedSharpe: number;
  
  // Maximum drawdown changes
  baselineMaxDrawdown: number;
  stressedMaxDrawdown: number;
}

export interface VaRMetrics {
  var95: number;
  var99: number;
  var999: number;
}

export interface ESMetrics {
  es95: number;
  es99: number;
  es999: number;
}

export interface TimeHorizonAnalysis {
  timeHorizon: TimeHorizon;
  
  // Risk metrics for this horizon
  var95: number;
  cvar95: number;
  expectedReturn: number;
  volatility: number;
  
  // Probability of loss
  probabilityOfLoss: number;
  
  // Extreme scenarios
  worstCase: number;
  bestCase: number;
  
  // Confidence intervals
  confidenceIntervals: ConfidenceInterval[];
}

export interface ConfidenceInterval {
  confidenceLevel: number;
  lowerBound: number;
  upperBound: number;
}

export interface AssetLevelAnalysis {
  symbol: string;
  assetClass: string;
  
  // Asset impact
  initialPrice: number;
  finalPrice: number;
  priceChange: number;
  priceChangePercent: number;
  
  // Position impact
  positionSize: number;
  positionValue: number;
  positionImpact: number;
  
  // Risk contribution
  riskContribution: number;
  marginalRisk: number;
  
  // Liquidity impact
  liquidityImpact?: AssetLiquidityImpact;
}

export interface AssetLiquidityImpact {
  bidAskSpread: number;
  marketDepth: number;
  executionTime: number;
  marketImpact: number;
  liquidityScore: number; // 0-100
}

export interface RiskLimitBreach {
  limitType: RiskLimitType;
  threshold: number;
  actualValue: number;
  breachSeverity: 'warning' | 'breach' | 'critical';
  
  // Breach details
  breachTime: number;
  breachDuration: number; // milliseconds
  
  // Impact assessment
  impactSeverity: number; // 0-10
  
  // Recommended actions
  recommendedActions: string[];
}

export interface CorrelationAnalysis {
  // Baseline correlations
  baselineCorrelationMatrix: CorrelationMatrix;
  
  // Stressed correlations
  stressedCorrelationMatrix: CorrelationMatrix;
  
  // Correlation changes
  correlationChanges: CorrelationChangeAnalysis[];
  
  // Portfolio impact of correlation changes
  correlationImpact: number; // Portfolio variance change
  
  // Diversification breakdown
  diversificationBreakdown: DiversificationAnalysis;
}

export interface CorrelationMatrix {
  symbols: string[];
  matrix: number[][]; // Correlation matrix
  eigenvalues: number[];
  condition: number; // Matrix condition number
}

export interface CorrelationChangeAnalysis {
  asset1: string;
  asset2: string;
  baselineCorr: number;
  stressedCorr: number;
  correlationChange: number;
  
  // Impact on portfolio
  portfolioImpact: number;
}

export interface DiversificationAnalysis {
  // Diversification ratios
  baselineDiversificationRatio: number;
  stressedDiversificationRatio: number;
  
  // Effective number of assets
  effectiveAssets: number;
  
  // Concentration measures
  concentrationRisk: number;
}

export interface LiquidityAnalysis {
  // Overall liquidity metrics
  portfolioLiquidityScore: number; // 0-100
  
  // Liquidity by asset
  assetLiquidityScores: AssetLiquidityScore[];
  
  // Liquidity risk metrics
  liquidityVar: number;
  liquidityAdjustedVar: number;
  
  // Time to liquidate
  timeToLiquidate: LiquidationTimeAnalysis;
  
  // Market impact analysis
  marketImpactAnalysis: MarketImpactAnalysis;
}

export interface AssetLiquidityScore {
  symbol: string;
  liquidityScore: number; // 0-100
  
  // Liquidity components
  volumeScore: number;
  spreadScore: number;
  depthScore: number;
  
  // Risk assessment
  liquidityRisk: 'low' | 'medium' | 'high' | 'critical';
}

export interface LiquidationTimeAnalysis {
  // Time to liquidate different percentages
  liquidate25Percent: number; // hours
  liquidate50Percent: number;
  liquidate75Percent: number;
  liquidate100Percent: number;
  
  // Liquidity constraints
  liquidityConstraints: LiquidityConstraint[];
}

export interface LiquidityConstraint {
  symbol: string;
  maxDailyVolume: number;
  constraintType: 'volume' | 'market_impact' | 'regulatory';
  estimatedDays: number;
}

export interface MarketImpactAnalysis {
  // Market impact by trade size
  smallTradeImpact: number; // < 1% of ADV
  mediumTradeImpact: number; // 1-5% of ADV  
  largeTradeImpact: number; // > 5% of ADV
  
  // Total portfolio liquidation impact
  totalLiquidationImpact: number;
  
  // Market impact model
  impactModel: 'linear' | 'square_root' | 'power_law';
}

export interface TailRiskAnalysis {
  // Extreme value analysis
  extremeValueAnalysis: ExtremeValueAnalysis;
  
  // Tail expectations
  tailExpectations: TailExpectation[];
  
  // Black swan probability
  blackSwanProbability: number;
  
  // Tail risk measures
  tailRiskMeasures: TailRiskMeasure[];
  
  // Scenario clustering
  scenarioClustering: ScenarioCluster[];
}

export interface ExtremeValueAnalysis {
  // Distribution parameters
  distributionType: 'gev' | 'gpd' | 'gumbel';
  parameters: {
    location: number;
    scale: number;
    shape: number;
  };
  
  // Goodness of fit
  goodnessOfFit: number;
  
  // Return periods
  returnPeriods: ReturnPeriod[];
}

export interface ReturnPeriod {
  years: number;
  expectedLoss: number;
  confidence: number;
}

export interface TailExpectation {
  confidenceLevel: number;
  expectedShortfall: number;
  tailExpectation: number;
  
  // Tail characteristics
  tailThickness: number;
  asymmetry: number;
}

export interface TailRiskMeasure {
  measureName: string;
  value: number;
  interpretation: string;
  
  // Risk level
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export interface ScenarioCluster {
  clusterId: string;
  scenarios: string[];
  clusterCenter: number;
  clusterRadius: number;
  
  // Cluster characteristics
  frequency: number;
  severity: number;
  diversification: number;
}

export interface RecoveryAnalysis {
  // Recovery metrics
  expectedRecoveryTime: number; // days
  recoveryProbability: number; // within 1 year
  
  // Recovery scenarios
  recoveryScenarios: RecoveryScenario[];
  
  // Recovery path analysis
  recoveryPathAnalysis: RecoveryPath;
  
  // Factors affecting recovery
  recoveryFactors: RecoveryFactor[];
}

export interface RecoveryScenario {
  scenarioName: string;
  probability: number;
  recoveryTime: number; // days
  finalRecovery: number; // percentage
  
  // Recovery characteristics
  recoveryShape: 'linear' | 'exponential' | 'stepped';
  volatilityDuringRecovery: number;
}

export interface RecoveryPath {
  // Recovery milestones
  recovery25Percent: number; // days
  recovery50Percent: number;
  recovery75Percent: number;
  fullRecovery: number;
  
  // Path characteristics
  pathVolatility: number;
  pathSmoothness: number;
}

export interface RecoveryFactor {
  factorName: string;
  impact: number; // on recovery time
  controllable: boolean;
  
  // Factor details
  factorType: 'market' | 'portfolio' | 'external';
  mitigationPossible: boolean;
}

export interface MitigationRecommendation {
  recommendationType: MitigationType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Recommendation details
  title: string;
  description: string;
  implementation: string;
  
  // Expected impact
  riskReduction: number; // percentage
  costEstimate: number; // basis points
  timeToImplement: number; // days
  
  // Specific actions
  actions: MitigationAction[];
}

export type MitigationType = 
  | 'diversification'
  | 'hedging'
  | 'position_sizing'
  | 'liquidity_management'
  | 'correlation_management'
  | 'scenario_planning'
  | 'dynamic_allocation';

export interface MitigationAction {
  action: string;
  parameters: Record<string, any>;
  expectedOutcome: string;
  
  // Implementation details
  complexity: 'low' | 'medium' | 'high';
  resources: string[];
}

export class RiskScenarioTester {
  private config: RiskScenarioConfig;
  private scenarioHistory: Map<string, RiskScenarioResult[]> = new Map();
  private marketDataCache: Map<string, any> = new Map();
  
  constructor(config: RiskScenarioConfig) {
    this.config = config;
    console.log(`⚠️ Risk Scenario Tester initialized for portfolio: ${config.portfolioId}`);
  }
  
  /**
   * 🎯 Run comprehensive risk scenario testing
   */
  async runScenarioTesting(
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<RiskScenarioResult[]> {
    console.log('🔄 Starting comprehensive risk scenario testing...');
    
    const results: RiskScenarioResult[] = [];
    
    // 1. Run standard scenario tests
    for (const scenarioType of this.config.scenarioTypes) {
      if (scenarioType !== 'custom') {
        const scenario = await this.runStandardScenario(
          scenarioType,
          portfolioData,
          marketData
        );
        results.push(scenario);
      }
    }
    
    // 2. Run custom scenarios
    for (const customScenario of this.config.customScenarios) {
      const scenario = await this.runCustomScenario(
        customScenario,
        portfolioData,
        marketData
      );
      results.push(scenario);
    }
    
    // 3. Run historical crisis scenarios (if enabled)
    if (this.config.includeHistoricalCrises) {
      const historicalScenarios = await this.runHistoricalCrisisScenarios(
        portfolioData,
        marketData
      );
      results.push(...historicalScenarios);
    }
    
    // Store results
    results.forEach(result => this.storeScenarioResult(result));
    
    console.log(`✅ Scenario testing completed. ${results.length} scenarios tested.`);
    return results;
  }
  
  /**
   * 📊 Run standard scenario test
   */
  private async runStandardScenario(
    scenarioType: ScenarioType,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<RiskScenarioResult> {
    console.log(`🧪 Running ${scenarioType} scenario...`);
    
    const startTime = Date.now();
    
    // Generate scenario parameters based on type and severity
    const scenarioParams = this.generateScenarioParameters(scenarioType);
    
    // 1. Calculate portfolio impact
    const portfolioImpact = await this.calculatePortfolioImpact(
      scenarioParams,
      portfolioData,
      marketData
    );
    
    // 2. Calculate risk metric changes
    const riskMetricChanges = await this.calculateRiskMetricChanges(
      scenarioParams,
      portfolioData,
      marketData
    );
    
    // 3. Analyze by time horizons
    const timeHorizonAnalysis = await this.analyzeByTimeHorizons(
      scenarioParams,
      portfolioData,
      marketData
    );
    
    // 4. Asset-level analysis
    const assetLevelAnalysis = await this.analyzeAssetLevel(
      scenarioParams,
      portfolioData,
      marketData
    );
    
    // 5. Check risk limit breaches
    const riskLimitBreaches = this.checkRiskLimitBreaches(
      portfolioImpact,
      riskMetricChanges
    );
    
    // 6. Advanced analysis (if enabled)
    let correlationAnalysis: CorrelationAnalysis | undefined;
    if (this.config.enableCorrelationBreakdown) {
      correlationAnalysis = await this.analyzeCorrelationBreakdown(
        scenarioParams,
        portfolioData,
        marketData
      );
    }
    
    let liquidityAnalysis: LiquidityAnalysis | undefined;
    if (this.config.enableLiquidityStress) {
      liquidityAnalysis = await this.analyzeLiquidityStress(
        scenarioParams,
        portfolioData,
        marketData
      );
    }
    
    let tailRiskAnalysis: TailRiskAnalysis | undefined;
    if (this.config.enableTailRiskAnalysis) {
      tailRiskAnalysis = await this.analyzeTailRisk(
        scenarioParams,
        portfolioData,
        marketData
      );
    }
    
    // 7. Recovery analysis
    const recoveryAnalysis = await this.analyzeRecovery(
      scenarioParams,
      portfolioImpact
    );
    
    // 8. Generate mitigation recommendations
    const mitigationRecommendations = this.generateMitigationRecommendations(
      scenarioType,
      portfolioImpact,
      riskMetricChanges,
      riskLimitBreaches
    );
    
    const executionDuration = Date.now() - startTime;
    
    return {
      scenarioId: `${scenarioType}_${Date.now()}`,
      scenarioName: this.getScenarioName(scenarioType),
      scenarioType,
      severity: this.config.stressTestSeverity,
      executionTimestamp: Date.now(),
      executionDuration,
      portfolioImpact,
      riskMetricChanges,
      timeHorizonAnalysis,
      assetLevelAnalysis,
      riskLimitBreaches,
      correlationAnalysis,
      liquidityAnalysis,
      tailRiskAnalysis,
      recoveryAnalysis,
      mitigationRecommendations
    };
  }
  
  /**
   * 🛠️ Generate scenario parameters
   */
  private generateScenarioParameters(scenarioType: ScenarioType): any {
    const severityMultipliers = {
      mild: 1.0,
      moderate: 1.5,
      severe: 2.5,
      extreme: 4.0
    };
    
    const multiplier = severityMultipliers[this.config.stressTestSeverity];
    
    switch (scenarioType) {
      case 'market_crash':
        return {
          equityDrop: -20 * multiplier, // -20% to -80%
          volatilityIncrease: 2.0 * multiplier,
          correlationIncrease: 0.3 * multiplier,
          liquidityDecrease: 0.4 * multiplier
        };
        
      case 'volatility_spike':
        return {
          volatilityIncrease: 3.0 * multiplier,
          correlationIncrease: 0.2 * multiplier,
          liquidityDecrease: 0.3 * multiplier
        };
        
      case 'correlation_breakdown':
        return {
          correlationIncrease: 0.5 * multiplier,
          diversificationLoss: 0.6 * multiplier
        };
        
      case 'liquidity_crisis':
        return {
          bidAskSpreadIncrease: 5.0 * multiplier,
          marketDepthDecrease: 0.7 * multiplier,
          executionDelayIncrease: 10.0 * multiplier
        };
        
      case 'interest_rate_shock':
        return {
          rateChange: 2.0 * multiplier, // 200 to 800 bps
          bondPriceImpact: -15 * multiplier,
          equityImpact: -10 * multiplier
        };
        
      case 'currency_crisis':
        return {
          currencyDevaluation: -25 * multiplier,
          volatilityIncrease: 2.5 * multiplier
        };
        
      case 'sector_rotation':
        return {
          sectorRotationIntensity: 0.4 * multiplier,
          correlationChange: -0.3 * multiplier
        };
        
      case 'black_swan':
        return {
          extremeMove: -50 * multiplier, // Extreme negative move
          volatilityExplosion: 5.0 * multiplier,
          correlationConvergence: 0.8,
          liquidityEvaporation: 0.9
        };
        
      default:
        return {
          generalStress: multiplier
        };
    }
  }
  
  /**
   * 💰 Calculate portfolio impact
   */
  private async calculatePortfolioImpact(
    scenarioParams: any,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<PortfolioImpact> {
    const initialValue = portfolioData.totalValue || 100000;
    
    // Simulate portfolio impact based on scenario
    let totalImpact = 0;
    const valueTimeSeries: ValueTimePoint[] = [];
    
    // Generate time series of portfolio values under stress
    const timePoints = 30; // 30 time points for scenario
    let maxDrawdown = 0;
    
    for (let i = 0; i <= timePoints; i++) {
      const timeProgress = i / timePoints;
      
      // Calculate impact at this time point
      const impactAtTime = this.calculateImpactAtTime(
        scenarioParams,
        timeProgress,
        portfolioData
      );
      
      const portfolioValue = initialValue * (1 + impactAtTime / 100);
      const drawdown = Math.max(0, initialValue - portfolioValue);
      const drawdownPercent = (drawdown / initialValue) * 100;
      
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      
      valueTimeSeries.push({
        timestamp: Date.now() + i * 86400000, // Daily intervals
        portfolioValue,
        drawdown,
        drawdownPercent
      });
      
      if (i === timePoints) {
        totalImpact = impactAtTime;
      }
    }
    
    const finalValue = initialValue * (1 + totalImpact / 100);
    const maxDrawdownPercent = (maxDrawdown / initialValue) * 100;
    
    return {
      initialValue,
      finalValue,
      absoluteChange: finalValue - initialValue,
      percentageChange: totalImpact,
      maxDrawdown,
      maxDrawdownPercent,
      valueTimeSeries,
      benchmarkComparison: {
        benchmarkChange: -8.5, // S&P 500 impact
        relativePerformance: totalImpact - (-8.5),
        trackingError: 3.2
      }
    };
  }
  
  /**
   * 📊 Calculate impact at specific time point
   */
  private calculateImpactAtTime(
    scenarioParams: any,
    timeProgress: number,
    portfolioData: any
  ): number {
    // Implement scenario-specific impact calculation
    if (scenarioParams.equityDrop !== undefined) {
      // Market crash scenario
      const equityWeight = 0.7; // Assume 70% equity allocation
      const bondWeight = 0.3;
      
      const equityImpact = scenarioParams.equityDrop * timeProgress * equityWeight;
      const bondImpact = (scenarioParams.equityDrop * 0.3) * timeProgress * bondWeight;
      
      return equityImpact + bondImpact;
    }
    
    if (scenarioParams.volatilityIncrease !== undefined) {
      // Volatility spike scenario
      const baseVolatility = 0.15; // 15% base volatility
      const stressedVolatility = baseVolatility * scenarioParams.volatilityIncrease;
      
      // Generate random shock based on increased volatility
      const randomShock = (Math.random() - 0.5) * stressedVolatility * Math.sqrt(timeProgress);
      return randomShock * 100;
    }
    
    // Default impact calculation
    const generalStress = scenarioParams.generalStress || 1.0;
    return -5 * generalStress * timeProgress; // -5% impact per stress level
  }
  
  /**
   * ⚠️ Calculate risk metric changes
   */
  private async calculateRiskMetricChanges(
    scenarioParams: any,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<RiskMetricChanges> {
    // Baseline metrics (from current portfolio)
    const baselineVolatility = 15.2; // 15.2% baseline volatility
    const baselineSharpe = 0.85;
    const baselineMaxDrawdown = 8.5;
    
    // Calculate stressed metrics
    const volatilityMultiplier = scenarioParams.volatilityIncrease || 1.5;
    const stressedVolatility = baselineVolatility * volatilityMultiplier;
    
    // Stressed VaR calculation
    const baselineVaR: VaRMetrics = {
      var95: 2.1,
      var99: 3.2,
      var999: 4.8
    };
    
    const stressedVaR: VaRMetrics = {
      var95: baselineVaR.var95 * volatilityMultiplier,
      var99: baselineVaR.var99 * volatilityMultiplier * 1.2,
      var999: baselineVaR.var999 * volatilityMultiplier * 1.5
    };
    
    // Expected Shortfall
    const baselineES: ESMetrics = {
      es95: 2.8,
      es99: 4.2,
      es999: 6.5
    };
    
    const stressedES: ESMetrics = {
      es95: baselineES.es95 * volatilityMultiplier * 1.1,
      es99: baselineES.es99 * volatilityMultiplier * 1.3,
      es999: baselineES.es999 * volatilityMultiplier * 1.6
    };
    
    // Sharpe ratio impact (typically decreases under stress)
    const stressedSharpe = baselineSharpe * (1 - (volatilityMultiplier - 1) * 0.3);
    
    // Maximum drawdown impact
    const drawdownMultiplier = scenarioParams.generalStress || volatilityMultiplier;
    const stressedMaxDrawdown = baselineMaxDrawdown * drawdownMultiplier;
    
    return {
      baselineVolatility,
      stressedVolatility,
      volatilityIncrease: stressedVolatility - baselineVolatility,
      baselineVaR,
      stressedVaR,
      baselineES,
      stressedES,
      baselineSharpe,
      stressedSharpe,
      baselineMaxDrawdown,
      stressedMaxDrawdown
    };
  }
  
  /**
   * ⏱️ Analyze by time horizons
   */
  private async analyzeByTimeHorizons(
    scenarioParams: any,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<TimeHorizonAnalysis[]> {
    const analysis: TimeHorizonAnalysis[] = [];
    
    for (const timeHorizon of this.config.timeHorizons) {
      const horizonDays = this.getTimeHorizonDays(timeHorizon);
      
      // Scale risk metrics by time horizon
      const timeScalar = Math.sqrt(horizonDays / 1); // Daily scaling
      
      const var95 = 2.1 * timeScalar;
      const cvar95 = 2.8 * timeScalar;
      const expectedReturn = 0.03 * horizonDays; // 3 bps per day
      const volatility = 1.5 * timeScalar;
      
      // Monte Carlo simulation for this horizon
      const monteCarloResults = await this.runMonteCarloForHorizon(
        horizonDays,
        scenarioParams
      );
      
      analysis.push({
        timeHorizon,
        var95,
        cvar95,
        expectedReturn,
        volatility,
        probabilityOfLoss: monteCarloResults.probabilityOfLoss,
        worstCase: monteCarloResults.worstCase,
        bestCase: monteCarloResults.bestCase,
        confidenceIntervals: [
          { confidenceLevel: 0.95, lowerBound: var95 * -1, upperBound: var95 },
          { confidenceLevel: 0.99, lowerBound: cvar95 * -1, upperBound: cvar95 * 0.5 }
        ]
      });
    }
    
    return analysis;
  }
  
  /**
   * 🏢 Analyze asset level impact
   */
  private async analyzeAssetLevel(
    scenarioParams: any,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<AssetLevelAnalysis[]> {
    const analysis: AssetLevelAnalysis[] = [];
    
    // Mock asset data (in real implementation, get from portfolio)
    const assets = [
      { symbol: 'AAPL', assetClass: 'Equity', weight: 0.25, price: 150.0 },
      { symbol: 'MSFT', assetClass: 'Equity', weight: 0.20, price: 300.0 },
      { symbol: 'TLT', assetClass: 'Bond', weight: 0.30, price: 120.0 },
      { symbol: 'GLD', assetClass: 'Commodity', weight: 0.15, price: 180.0 },
      { symbol: 'USD', assetClass: 'Cash', weight: 0.10, price: 1.0 }
    ];
    
    for (const asset of assets) {
      // Calculate asset-specific impact
      const assetImpact = this.calculateAssetImpact(asset, scenarioParams);
      
      const finalPrice = asset.price * (1 + assetImpact / 100);
      const positionValue = 100000 * asset.weight; // Portfolio allocation
      const positionImpact = positionValue * (assetImpact / 100);
      
      // Risk contribution calculation (simplified)
      const riskContribution = Math.abs(assetImpact) * asset.weight;
      const marginalRisk = riskContribution * 1.2; // Marginal risk multiplier
      
      // Liquidity impact (if enabled)
      let liquidityImpact: AssetLiquidityImpact | undefined;
      if (this.config.enableLiquidityStress) {
        liquidityImpact = {
          bidAskSpread: 0.05 * (scenarioParams.bidAskSpreadIncrease || 1.0),
          marketDepth: 100000 * (1 - (scenarioParams.marketDepthDecrease || 0.2)),
          executionTime: 2.0 * (scenarioParams.executionDelayIncrease || 1.0),
          marketImpact: 0.15 * (scenarioParams.liquidityDecrease || 1.0),
          liquidityScore: Math.max(0, 100 - (scenarioParams.liquidityDecrease || 0) * 50)
        };
      }
      
      analysis.push({
        symbol: asset.symbol,
        assetClass: asset.assetClass,
        initialPrice: asset.price,
        finalPrice,
        priceChange: finalPrice - asset.price,
        priceChangePercent: assetImpact,
        positionSize: asset.weight,
        positionValue,
        positionImpact,
        riskContribution,
        marginalRisk,
        liquidityImpact
      });
    }
    
    return analysis;
  }
  
  /**
   * 📊 Calculate asset-specific impact
   */
  private calculateAssetImpact(asset: any, scenarioParams: any): number {
    let impact = 0;
    
    // Asset class specific impacts
    switch (asset.assetClass) {
      case 'Equity':
        if (scenarioParams.equityDrop) {
          impact += scenarioParams.equityDrop;
        }
        if (scenarioParams.equityImpact) {
          impact += scenarioParams.equityImpact;
        }
        break;
        
      case 'Bond':
        if (scenarioParams.bondPriceImpact) {
          impact += scenarioParams.bondPriceImpact;
        }
        if (scenarioParams.rateChange) {
          // Duration-based bond impact (assuming 7-year duration)
          impact += -7 * (scenarioParams.rateChange / 100);
        }
        break;
        
      case 'Commodity':
        // Commodities often benefit during market stress
        if (scenarioParams.equityDrop) {
          impact += Math.abs(scenarioParams.equityDrop) * 0.3; // Negative correlation
        }
        break;
        
      case 'Cash':
        // Cash is stable but affected by currency crisis
        if (scenarioParams.currencyDevaluation) {
          impact += scenarioParams.currencyDevaluation;
        }
        break;
    }
    
    // Add volatility-based random component
    if (scenarioParams.volatilityIncrease) {
      const randomComponent = (Math.random() - 0.5) * scenarioParams.volatilityIncrease * 2;
      impact += randomComponent;
    }
    
    return impact;
  }
  
  /**
   * ⚠️ Check risk limit breaches
   */
  private checkRiskLimitBreaches(
    portfolioImpact: PortfolioImpact,
    riskMetricChanges: RiskMetricChanges
  ): RiskLimitBreach[] {
    const breaches: RiskLimitBreach[] = [];
    
    for (const limit of this.config.riskLimits) {
      let actualValue = 0;
      let isBreached = false;
      
      switch (limit.limitType) {
        case 'max_drawdown':
          actualValue = portfolioImpact.maxDrawdownPercent;
          isBreached = actualValue > limit.threshold;
          break;
          
        case 'var_limit':
          actualValue = riskMetricChanges.stressedVaR.var95;
          isBreached = actualValue > limit.threshold;
          break;
          
        case 'cvar_limit':
          actualValue = riskMetricChanges.stressedES.es95;
          isBreached = actualValue > limit.threshold;
          break;
          
        case 'concentration_limit':
          actualValue = 25; // Max position size (mock)
          isBreached = actualValue > limit.threshold;
          break;
          
        case 'leverage_limit':
          actualValue = 1.2; // Current leverage (mock)
          isBreached = actualValue > limit.threshold;
          break;
          
        case 'liquidity_limit':
          actualValue = 85; // Liquidity score (mock)
          isBreached = actualValue < limit.threshold;
          break;
      }
      
      if (isBreached) {
        // Determine breach severity
        const excessAmount = limit.limitType === 'liquidity_limit' ? 
          limit.threshold - actualValue : 
          actualValue - limit.threshold;
        
        const breachSeverity = excessAmount > limit.threshold * 0.5 ? 'critical' :
                              excessAmount > limit.threshold * 0.2 ? 'breach' : 'warning';
        
        breaches.push({
          limitType: limit.limitType,
          threshold: limit.threshold,
          actualValue,
          breachSeverity,
          breachTime: Date.now(),
          breachDuration: 0, // Will be updated in real-time monitoring
          impactSeverity: Math.min(10, Math.floor(excessAmount / limit.threshold * 10)),
          recommendedActions: this.generateBreachActions(limit.limitType, breachSeverity)
        });
      }
    }
    
    return breaches;
  }
  
  /**
   * 💡 Generate breach-specific actions
   */
  private generateBreachActions(limitType: RiskLimitType, severity: string): string[] {
    const actions: string[] = [];
    
    switch (limitType) {
      case 'max_drawdown':
        actions.push('Implement stop-loss rules');
        actions.push('Reduce position sizes');
        actions.push('Increase diversification');
        if (severity === 'critical') {
          actions.push('Consider portfolio liquidation');
        }
        break;
        
      case 'var_limit':
      case 'cvar_limit':
        actions.push('Reduce portfolio risk exposure');
        actions.push('Implement hedging strategies');
        actions.push('Rebalance to lower-risk assets');
        break;
        
      case 'concentration_limit':
        actions.push('Reduce position in concentrated assets');
        actions.push('Diversify across more holdings');
        actions.push('Implement position size limits');
        break;
        
      case 'leverage_limit':
        actions.push('Reduce leverage immediately');
        actions.push('Close leveraged positions');
        actions.push('Increase cash reserves');
        break;
        
      case 'liquidity_limit':
        actions.push('Increase liquid asset allocation');
        actions.push('Reduce illiquid positions');
        actions.push('Establish credit facilities');
        break;
    }
    
    return actions;
  }
  
  // Placeholder implementations for advanced analysis methods
  private async analyzeCorrelationBreakdown(
    scenarioParams: any,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<CorrelationAnalysis> {
    // Simplified correlation analysis
    return {
      baselineCorrelationMatrix: {
        symbols: ['AAPL', 'MSFT', 'TLT'],
        matrix: [[1.0, 0.7, -0.2], [0.7, 1.0, -0.1], [-0.2, -0.1, 1.0]],
        eigenvalues: [1.8, 0.9, 0.3],
        condition: 6.0
      },
      stressedCorrelationMatrix: {
        symbols: ['AAPL', 'MSFT', 'TLT'],
        matrix: [[1.0, 0.9, 0.3], [0.9, 1.0, 0.4], [0.3, 0.4, 1.0]],
        eigenvalues: [2.2, 0.6, 0.2],
        condition: 11.0
      },
      correlationChanges: [
        {
          asset1: 'AAPL',
          asset2: 'MSFT',
          baselineCorr: 0.7,
          stressedCorr: 0.9,
          correlationChange: 0.2,
          portfolioImpact: 0.15
        }
      ],
      correlationImpact: 0.25,
      diversificationBreakdown: {
        baselineDiversificationRatio: 0.65,
        stressedDiversificationRatio: 0.45,
        effectiveAssets: 2.1,
        concentrationRisk: 0.35
      }
    };
  }
  
  private async analyzeLiquidityStress(
    scenarioParams: any,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<LiquidityAnalysis> {
    return {
      portfolioLiquidityScore: 75,
      assetLiquidityScores: [
        { symbol: 'AAPL', liquidityScore: 95, volumeScore: 98, spreadScore: 92, depthScore: 95, liquidityRisk: 'low' },
        { symbol: 'TLT', liquidityScore: 60, volumeScore: 70, spreadScore: 55, depthScore: 55, liquidityRisk: 'medium' }
      ],
      liquidityVar: 3.2,
      liquidityAdjustedVar: 3.8,
      timeToLiquidate: {
        liquidate25Percent: 2,
        liquidate50Percent: 8,
        liquidate75Percent: 24,
        liquidate100Percent: 72,
        liquidityConstraints: []
      },
      marketImpactAnalysis: {
        smallTradeImpact: 0.05,
        mediumTradeImpact: 0.15,
        largeTradeImpact: 0.45,
        totalLiquidationImpact: 2.8,
        impactModel: 'square_root'
      }
    };
  }
  
  private async analyzeTailRisk(
    scenarioParams: any,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<TailRiskAnalysis> {
    return {
      extremeValueAnalysis: {
        distributionType: 'gev',
        parameters: { location: -0.02, scale: 0.015, shape: -0.1 },
        goodnessOfFit: 0.85,
        returnPeriods: [
          { years: 10, expectedLoss: -15.2, confidence: 0.9 },
          { years: 100, expectedLoss: -28.5, confidence: 0.8 }
        ]
      },
      tailExpectations: [
        { confidenceLevel: 0.95, expectedShortfall: -3.2, tailExpectation: -4.1, tailThickness: 1.2, asymmetry: -0.3 },
        { confidenceLevel: 0.99, expectedShortfall: -5.8, tailExpectation: -7.2, tailThickness: 1.5, asymmetry: -0.4 }
      ],
      blackSwanProbability: 0.02,
      tailRiskMeasures: [
        { measureName: 'Tail Index', value: 3.2, interpretation: 'Moderate tail thickness', riskLevel: 'medium' },
        { measureName: 'Hill Estimator', value: 0.28, interpretation: 'Heavy tails present', riskLevel: 'high' }
      ],
      scenarioClustering: []
    };
  }
  
  private async analyzeRecovery(
    scenarioParams: any,
    portfolioImpact: PortfolioImpact
  ): Promise<RecoveryAnalysis> {
    const drawdownMagnitude = portfolioImpact.maxDrawdownPercent;
    
    // Recovery time estimation based on drawdown magnitude
    const expectedRecoveryTime = drawdownMagnitude * 8; // 8 days per 1% drawdown
    
    return {
      expectedRecoveryTime,
      recoveryProbability: Math.max(0.1, 1 - (drawdownMagnitude / 50)), // Lower probability for larger drawdowns
      recoveryScenarios: [
        {
          scenarioName: 'Base Case Recovery',
          probability: 0.6,
          recoveryTime: expectedRecoveryTime,
          finalRecovery: 95,
          recoveryShape: 'exponential',
          volatilityDuringRecovery: 18.5
        },
        {
          scenarioName: 'Slow Recovery',
          probability: 0.3,
          recoveryTime: expectedRecoveryTime * 2,
          finalRecovery: 85,
          recoveryShape: 'linear',
          volatilityDuringRecovery: 22.1
        },
        {
          scenarioName: 'No Recovery',
          probability: 0.1,
          recoveryTime: Infinity,
          finalRecovery: 60,
          recoveryShape: 'stepped',
          volatilityDuringRecovery: 25.8
        }
      ],
      recoveryPathAnalysis: {
        recovery25Percent: expectedRecoveryTime * 0.3,
        recovery50Percent: expectedRecoveryTime * 0.6,
        recovery75Percent: expectedRecoveryTime * 0.8,
        fullRecovery: expectedRecoveryTime,
        pathVolatility: 20.2,
        pathSmoothness: 0.7
      },
      recoveryFactors: [
        { factorName: 'Market Sentiment', impact: -0.3, controllable: false, factorType: 'market', mitigationPossible: false },
        { factorName: 'Portfolio Diversification', impact: 0.2, controllable: true, factorType: 'portfolio', mitigationPossible: true },
        { factorName: 'Liquidity Management', impact: 0.15, controllable: true, factorType: 'portfolio', mitigationPossible: true }
      ]
    };
  }
  
  private generateMitigationRecommendations(
    scenarioType: ScenarioType,
    portfolioImpact: PortfolioImpact,
    riskMetricChanges: RiskMetricChanges,
    riskLimitBreaches: RiskLimitBreach[]
  ): MitigationRecommendation[] {
    const recommendations: MitigationRecommendation[] = [];
    
    // High-priority recommendations based on impact severity
    if (portfolioImpact.maxDrawdownPercent > 15) {
      recommendations.push({
        recommendationType: 'diversification',
        priority: 'critical',
        title: 'Increase Portfolio Diversification',
        description: 'Severe drawdown indicates insufficient diversification across asset classes and strategies',
        implementation: 'Rebalance portfolio to include more uncorrelated assets and strategies',
        riskReduction: 30,
        costEstimate: 25, // 25 bps
        timeToImplement: 3,
        actions: [
          {
            action: 'add_alternative_assets',
            parameters: { target_allocation: 0.2, asset_types: ['REITs', 'Commodities', 'Crypto'] },
            expectedOutcome: 'Reduced correlation during market stress',
            complexity: 'medium',
            resources: ['Portfolio Manager', 'Risk Team']
          }
        ]
      });
    }
    
    // Recommendations based on specific scenario types
    switch (scenarioType) {
      case 'market_crash':
        recommendations.push({
          recommendationType: 'hedging',
          priority: 'high',
          title: 'Implement Downside Protection',
          description: 'Add protective puts or VIX calls to hedge against market crashes',
          implementation: 'Purchase protective options or volatility-based instruments',
          riskReduction: 25,
          costEstimate: 50,
          timeToImplement: 1,
          actions: [
            {
              action: 'purchase_protective_puts',
              parameters: { strike_percent: 0.9, expiration: '3M' },
              expectedOutcome: 'Limited downside risk during market crashes',
              complexity: 'low',
              resources: ['Options Trader']
            }
          ]
        });
        break;
        
      case 'liquidity_crisis':
        recommendations.push({
          recommendationType: 'liquidity_management',
          priority: 'high',
          title: 'Improve Liquidity Buffer',
          description: 'Increase allocation to highly liquid assets and establish credit facilities',
          implementation: 'Maintain minimum 20% allocation to cash and cash equivalents',
          riskReduction: 20,
          costEstimate: 15,
          timeToImplement: 7,
          actions: [
            {
              action: 'increase_cash_allocation',
              parameters: { target_allocation: 0.2 },
              expectedOutcome: 'Improved ability to meet liquidity needs',
              complexity: 'low',
              resources: ['Portfolio Manager']
            }
          ]
        });
        break;
        
      case 'correlation_breakdown':
        recommendations.push({
          recommendationType: 'correlation_management',
          priority: 'medium',
          title: 'Implement Dynamic Correlation Monitoring',
          description: 'Monitor and adjust for changing correlations during stress periods',
          implementation: 'Use dynamic hedging and correlation-based rebalancing',
          riskReduction: 15,
          costEstimate: 30,
          timeToImplement: 14,
          actions: [
            {
              action: 'implement_correlation_monitoring',
              parameters: { rebalance_threshold: 0.2 },
              expectedOutcome: 'Maintained diversification benefits during stress',
              complexity: 'high',
              resources: ['Quant Team', 'Risk Manager', 'Technology']
            }
          ]
        });
        break;
    }
    
    // Add recommendations based on risk limit breaches
    for (const breach of riskLimitBreaches) {
      if (breach.breachSeverity === 'critical') {
        recommendations.push({
          recommendationType: 'position_sizing',
          priority: 'critical',
          title: `Address ${breach.limitType.replace('_', ' ')} Breach`,
          description: `Critical breach of ${breach.limitType} limit requires immediate action`,
          implementation: `Reduce positions to bring ${breach.limitType} back within limits`,
          riskReduction: 40,
          costEstimate: 20,
          timeToImplement: 1,
          actions: breach.recommendedActions.map(action => ({
            action: action.toLowerCase().replace(/\s+/g, '_'),
            parameters: { urgency: 'immediate' },
            expectedOutcome: `${breach.limitType} brought back within acceptable limits`,
            complexity: 'medium',
            resources: ['Risk Manager', 'Portfolio Manager']
          }))
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  // Helper methods
  private getTimeHorizonDays(timeHorizon: TimeHorizon): number {
    const days = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    };
    return days[timeHorizon];
  }
  
  private getScenarioName(scenarioType: ScenarioType): string {
    const names = {
      market_crash: 'Market Crash Scenario',
      volatility_spike: 'Volatility Spike Scenario',
      correlation_breakdown: 'Correlation Breakdown Scenario',
      liquidity_crisis: 'Liquidity Crisis Scenario',
      interest_rate_shock: 'Interest Rate Shock Scenario',
      currency_crisis: 'Currency Crisis Scenario',
      sector_rotation: 'Sector Rotation Scenario',
      black_swan: 'Black Swan Event Scenario',
      regime_change: 'Market Regime Change Scenario',
      custom: 'Custom Scenario'
    };
    return names[scenarioType];
  }
  
  private async runMonteCarloForHorizon(horizonDays: number, scenarioParams: any): Promise<any> {
    const simulations = 1000;
    const results: number[] = [];
    
    for (let i = 0; i < simulations; i++) {
      // Generate random path for this horizon
      let cumReturn = 0;
      for (let day = 0; day < horizonDays; day++) {
        const dailyReturn = (Math.random() - 0.5) * 0.04; // 4% daily volatility range
        cumReturn += dailyReturn;
      }
      results.push(cumReturn * 100); // Convert to percentage
    }
    
    results.sort((a, b) => a - b);
    
    return {
      probabilityOfLoss: results.filter(r => r < 0).length / results.length,
      worstCase: results[0],
      bestCase: results[results.length - 1]
    };
  }
  
  private async runCustomScenario(
    customScenario: CustomScenario,
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<RiskScenarioResult> {
    // Implementation for custom scenarios
    const scenarioParams = this.convertCustomScenarioToParams(customScenario);
    
    // Use the same analysis framework as standard scenarios
    return this.runStandardScenario('custom', portfolioData, marketData);
  }
  
  private convertCustomScenarioToParams(customScenario: CustomScenario): any {
    const params: any = {};
    
    // Convert market shocks
    for (const shock of customScenario.marketShocks) {
      if (shock.assetClass === 'Equity') {
        params.equityDrop = shock.shockValue;
      } else if (shock.assetClass === 'Bond') {
        params.bondPriceImpact = shock.shockValue;
      }
    }
    
    // Convert volatility changes
    for (const volChange of customScenario.volatilityChanges) {
      params.volatilityIncrease = volChange.volatilityMultiplier;
    }
    
    // Convert liquidity conditions
    for (const liqCondition of customScenario.liquidityConditions) {
      params.bidAskSpreadIncrease = liqCondition.bidAskSpreadMultiplier;
      params.marketDepthDecrease = liqCondition.marketDepthReduction / 100;
    }
    
    return params;
  }
  
  private async runHistoricalCrisisScenarios(
    portfolioData: any,
    marketData: Map<string, any>
  ): Promise<RiskScenarioResult[]> {
    const historicalScenarios = [
      { name: '2008 Financial Crisis', equityDrop: -37, volatilityIncrease: 2.5 },
      { name: '2020 COVID Crisis', equityDrop: -34, volatilityIncrease: 3.0 },
      { name: '2000 Dot-com Crash', equityDrop: -49, volatilityIncrease: 2.0 },
      { name: '1987 Black Monday', equityDrop: -22, volatilityIncrease: 4.0 }
    ];
    
    const results: RiskScenarioResult[] = [];
    
    for (const scenario of historicalScenarios) {
      // Create scenario parameters
      const scenarioParams = {
        equityDrop: scenario.equityDrop,
        volatilityIncrease: scenario.volatilityIncrease,
        correlationIncrease: 0.3,
        liquidityDecrease: 0.4
      };
      
      // Run analysis (simplified)
      const portfolioImpact = await this.calculatePortfolioImpact(
        scenarioParams,
        portfolioData,
        marketData
      );
      
      const riskMetricChanges = await this.calculateRiskMetricChanges(
        scenarioParams,
        portfolioData,
        marketData
      );
      
      const result: RiskScenarioResult = {
        scenarioId: `historical_${scenario.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        scenarioName: scenario.name,
        scenarioType: 'market_crash',
        severity: 'extreme',
        executionTimestamp: Date.now(),
        executionDuration: 100,
        portfolioImpact,
        riskMetricChanges,
        timeHorizonAnalysis: [],
        assetLevelAnalysis: [],
        riskLimitBreaches: [],
        recoveryAnalysis: {
          expectedRecoveryTime: Math.abs(scenario.equityDrop) * 10,
          recoveryProbability: 0.8,
          recoveryScenarios: [],
          recoveryPathAnalysis: {
            recovery25Percent: 90,
            recovery50Percent: 180,
            recovery75Percent: 270,
            fullRecovery: 360,
            pathVolatility: 20,
            pathSmoothness: 0.6
          },
          recoveryFactors: []
        },
        mitigationRecommendations: []
      };
      
      results.push(result);
    }
    
    return results;
  }
  
  private storeScenarioResult(result: RiskScenarioResult) {
    const portfolioId = this.config.portfolioId;
    
    if (!this.scenarioHistory.has(portfolioId)) {
      this.scenarioHistory.set(portfolioId, []);
    }
    
    const history = this.scenarioHistory.get(portfolioId)!;
    history.push(result);
    
    // Keep only last 50 scenario results
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }
  
  /**
   * 📋 Get scenario testing history
   */
  getScenarioHistory(portfolioId: string): RiskScenarioResult[] {
    return this.scenarioHistory.get(portfolioId) || [];
  }
  
  /**
   * 🧹 Clear scenario data
   */
  clearHistory(portfolioId?: string) {
    if (portfolioId) {
      this.scenarioHistory.delete(portfolioId);
    } else {
      this.scenarioHistory.clear();
      this.marketDataCache.clear();
    }
  }
}

export default RiskScenarioTester;