// System Operating Modes - Demo vs Live
export enum SystemMode {
  DEMO = 'demo',
  LIVE = 'live'
}

export interface SystemModeConfig {
  mode: SystemMode;
  virtual_balance: number;
  real_balance?: number;
  risk_level: 'low' | 'medium' | 'high';
  max_concurrent_trades: number;
  emergency_stop: boolean;
}

export class ModeManager {
  private static instance: ModeManager;
  private currentMode: SystemMode = SystemMode.DEMO;
  private config: SystemModeConfig;

  private constructor() {
    this.config = {
      mode: SystemMode.DEMO,
      virtual_balance: 10000, // $10,000 virtual money for demo
      risk_level: 'medium',
      max_concurrent_trades: 20,
      emergency_stop: false
    };
  }

  public static getInstance(): ModeManager {
    if (!ModeManager.instance) {
      ModeManager.instance = new ModeManager();
    }
    return ModeManager.instance;
  }

  public getCurrentMode(): SystemMode {
    return this.currentMode;
  }

  public setMode(mode: SystemMode): boolean {
    if (mode === SystemMode.LIVE) {
      // Check if system meets criteria for live trading
      if (!this.isReadyForLiveTrading()) {
        return false;
      }
    }
    
    this.currentMode = mode;
    this.config.mode = mode;
    return true;
  }

  public getConfig(): SystemModeConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SystemModeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public isReadyForLiveTrading(): boolean {
    // Criteria for switching to live mode:
    // 1. System accuracy > 75%
    // 2. Profitable for at least 30 days in demo
    // 3. Risk management systems active
    // 4. User approval

    // For demo purposes, return false (system stays in demo)
    return false;
  }

  public getVirtualBalance(): number {
    return this.config.virtual_balance;
  }

  public updateVirtualBalance(amount: number): void {
    if (this.currentMode === SystemMode.DEMO) {
      this.config.virtual_balance = amount;
    }
  }

  public emergencyStop(): void {
    this.config.emergency_stop = true;
  }

  public resumeTrading(): void {
    this.config.emergency_stop = false;
  }

  public isEmergencyStopped(): boolean {
    return this.config.emergency_stop;
  }
}